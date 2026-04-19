import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { mkdir } from '@tauri-apps/plugin-fs';

// ─── Types ───────────────────────────────────────────────

export interface FileNode {
  name: string;
  path: string;
  is_directory: boolean;
  children?: FileNode[];
}

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  isDiff?: boolean;
  originalContent?: string;
  isLivePreview?: boolean;
}

export interface PaneNode {
  id: string;
  openFiles: OpenFile[];
  activeFileIndex: number;
}

export interface SearchMatch {
  line_number: number;
  line_content: string;
}

export interface SearchResultNode {
  path: string;
  matches: SearchMatch[];
}

// ─── Language Detection ──────────────────────────────────

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  // Web
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.html': 'html', '.css': 'css', '.scss': 'scss', '.less': 'less',
  '.json': 'json', '.jsonc': 'json',
  // Systems
  '.rs': 'rust', '.go': 'go', '.c': 'c', '.cpp': 'cpp', '.h': 'cpp', '.hpp': 'cpp',
  '.java': 'java', '.kt': 'kotlin', '.cs': 'csharp',
  // Scripting
  '.py': 'python', '.rb': 'ruby', '.lua': 'lua', '.sh': 'shell', '.bash': 'shell',
  '.ps1': 'powershell', '.bat': 'bat',
  // Config & Data
  '.yaml': 'yaml', '.yml': 'yaml', '.toml': 'toml', '.xml': 'xml',
  '.md': 'markdown', '.mdx': 'markdown',
  '.sql': 'sql', '.graphql': 'graphql',
  // Docker / Infra
  '.dockerfile': 'dockerfile',
  // Misc
  '.svg': 'xml', '.txt': 'plaintext', '.log': 'plaintext',
  '.env': 'plaintext', '.gitignore': 'plaintext',
};

function detectLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === 'dockerfile' || lower.startsWith('dockerfile.')) return 'dockerfile';
  if (lower === 'makefile') return 'makefile';
  if (lower === 'cargo.toml') return 'toml';

  const ext = '.' + lower.split('.').pop();
  return EXTENSION_LANGUAGE_MAP[ext] || 'plaintext';
}

// ─── Store ───────────────────────────────────────────────

interface WorkspaceState {
  // Workspace
  openFolderPath: string | null;
  fileTree: FileNode[];

  // Editor tabs
  activePaneId: string;
  panes: PaneNode[];
  previewKey: number;

  // UI panels
  sidebarVisible: boolean;
  terminalVisible: boolean;
  zenMode: boolean;
  activePanel: 'explorer' | 'search' | 'git';

  // Search state
  searchResults: SearchResultNode[];
  isSearching: boolean;
  focusedLine: number | null;

  // Terminal integration
  pendingTerminalCommand: string | null;

  // Actions
  openFolder: () => Promise<void>;
  openSingleFile: () => Promise<void>;
  loadFileTree: (path: string) => Promise<void>;
  openFile: (path: string) => Promise<void>;
  openDiffFile: (path: string, originalContent: string) => Promise<void>;
  updateFileContent: (paneId: string, index: number, content: string) => void;
  saveFile: (paneId: string, index: number) => Promise<void>;
  closeFile: (paneId: string, index: number) => void;
  setActiveFile: (paneId: string, index: number) => void;
  
  // Advanced features
  setActivePane: (paneId: string) => void;
  splitEditorRight: () => void;
  closePane: (paneId: string) => void;
  incrementPreviewKey: () => void;
  openLivePreview: (url: string) => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: 'explorer' | 'search' | 'git') => void;
  searchFiles: (query: string, caseSensitive: boolean) => Promise<void>;
  clearSearchResults: () => void;
  setFocusedLine: (line: number | null) => void;
  toggleTerminal: () => void;
  toggleZenMode: () => void;
  sendToTerminal: (text: string) => void;
  clearTerminalCommand: () => void;
  createFile: (parentPath: string, name: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // ─── Initial State ─────────────────────────────────────
  openFolderPath: '.',
  fileTree: [],
  panes: [{ id: 'pane-1', openFiles: [], activeFileIndex: -1 }],
  activePaneId: 'pane-1',
  previewKey: 0,
  sidebarVisible: true,
  terminalVisible: false,
  zenMode: false,
  activePanel: 'explorer',
  searchResults: [],
  isSearching: false,
  focusedLine: null,
  pendingTerminalCommand: null,

  // ─── Actions ───────────────────────────────────────────

  openFolder: async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Open Folder',
      });
      if (selected && typeof selected === 'string') {
        set({ openFolderPath: selected, panes: [{ id: 'pane-1', openFiles: [], activeFileIndex: -1 }], activePaneId: 'pane-1' });
        await get().loadFileTree(selected);
      }
    } catch (err) {
      console.error('Failed to open folder (IPC error):', err);
      alert(`Failed to open folder: ${err}`);
    }
  },

  openSingleFile: async () => {
    try {
      const file = await open({ directory: false, multiple: false });
      if (file && typeof file === 'string') {
        get().openFile(file);
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err);
    }
  },

  loadFileTree: async (path: string) => {
    try {
      const tree = await invoke<FileNode[]>('read_dir_recursive', { path });
      set({ fileTree: tree });
    } catch (err) {
      console.error('Failed to load file tree:', err);
    }
  },

  openFile: async (path: string) => {
    const s = get();
    const activePane = s.panes.find(p => p.id === s.activePaneId);
    if (!activePane) return;

    const existingIndex = activePane.openFiles.findIndex(f => f.path === path && !f.isDiff);
    if (existingIndex !== -1) {
      get().setActiveFile(s.activePaneId, existingIndex);
      return;
    }

    try {
      const content = await invoke<string>('read_file_content', { path });
      const name = path.split(/[\\/]/).pop() || path;
      const language = detectLanguage(name);

      const newFile: OpenFile = { path, name, content, language, isDirty: false };
      
      set(s => ({
        panes: s.panes.map(pane => {
          if (pane.id === s.activePaneId) {
            return {
              ...pane,
              openFiles: [...pane.openFiles, newFile],
              activeFileIndex: pane.openFiles.length - 1,
            };
          }
          return pane;
        })
      }));
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  },

  openDiffFile: async (path: string, originalContent: string) => {
    const s = get();
    const activePane = s.panes.find(p => p.id === s.activePaneId);
    if (!activePane) return;

    const existingIndex = activePane.openFiles.findIndex(f => f.path === path && f.isDiff);
    if (existingIndex !== -1) {
      get().setActiveFile(s.activePaneId, existingIndex);
      return;
    }

    try {
      const content = await invoke<string>('read_file_content', { path });
      const name = path.split(/[\\/]/).pop() || path;
      const language = detectLanguage(name);

      const newFile: OpenFile = { 
        path, 
        name: `${name} (Diff)`, 
        content, 
        language, 
        isDirty: false,
        isDiff: true,
        originalContent
      };
      set(s => ({
        panes: s.panes.map(pane => {
          if (pane.id === s.activePaneId) {
            return {
              ...pane,
              openFiles: [...pane.openFiles, newFile],
              activeFileIndex: pane.openFiles.length - 1,
            };
          }
          return pane;
        })
      }));
    } catch (err) {
      console.error('Failed to open diff file:', err);
    }
  },

  closeFile: (paneId: string, index: number) => {
    set(s => {
      const pane = s.panes.find(p => p.id === paneId);
      if (!pane) return s;

      const updatedFiles = pane.openFiles.filter((_, i) => i !== index);
      let newIndex = pane.activeFileIndex;
      if (index === pane.activeFileIndex) {
        newIndex = Math.max(-1, Math.min(newIndex, updatedFiles.length - 1));
      } else if (index < pane.activeFileIndex) {
        newIndex--;
      }

      return {
        panes: s.panes.map(p => p.id === paneId ? { ...p, openFiles: updatedFiles, activeFileIndex: newIndex } : p)
      };
    });
  },

  setActiveFile: (paneId: string, index: number) => {
    set(s => ({
      activePaneId: paneId,
      panes: s.panes.map(p => p.id === paneId ? { ...p, activeFileIndex: index } : p)
    }));
  },

  updateFileContent: (paneId: string, index: number, content: string) => {
    set(s => ({
      panes: s.panes.map(p => {
        if (p.id === paneId) {
          const newFiles = [...p.openFiles];
          if (newFiles[index]) {
            newFiles[index] = { ...newFiles[index], content, isDirty: true };
          }
          return { ...p, openFiles: newFiles };
        }
        return p;
      })
    }));
  },

  saveFile: async (paneId: string, index: number) => {
    const s = get();
    const pane = s.panes.find(p => p.id === paneId);
    if (!pane) return;
    
    const file = pane.openFiles[index];
    if (!file || !file.path || !file.isDirty) return;

    try {
      await invoke('save_file_content', { path: file.path, content: file.content });
      set(s => ({
        panes: s.panes.map(p => {
          if (p.id === paneId) {
            const newFiles = [...p.openFiles];
            if (newFiles[index]) {
              newFiles[index] = { ...newFiles[index], isDirty: false };
            }
            return { ...p, openFiles: newFiles };
          }
          return p;
        })
      }));
      get().incrementPreviewKey();
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  },

  setActivePane: (paneId: string) => {
    set({ activePaneId: paneId });
  },

  splitEditorRight: () => {
    set(s => {
      const activePane = s.panes.find(p => p.id === s.activePaneId);
      if (!activePane) return s;

      const activeFile = activePane.activeFileIndex >= 0 ? activePane.openFiles[activePane.activeFileIndex] : null;
      if (!activeFile) return s;

      const newPaneId = `pane-${Date.now()}`;
      const newPane: PaneNode = {
        id: newPaneId,
        openFiles: [{ ...activeFile }],
        activeFileIndex: 0,
      };

      return {
        panes: [...s.panes, newPane],
        activePaneId: newPaneId,
      };
    });
  },

  closePane: (paneId: string) => {
    set(s => {
      if (s.panes.length <= 1) return s; // Must have at least 1 pane
      
      const updatedPanes = s.panes.filter(p => p.id !== paneId);
      let newActiveId = s.activePaneId;
      if (paneId === s.activePaneId) {
        newActiveId = updatedPanes[updatedPanes.length - 1].id;
      }

      return {
        panes: updatedPanes,
        activePaneId: newActiveId,
      };
    });
  },

  incrementPreviewKey: () => {
    set(s => ({ previewKey: s.previewKey + 1 }));
  },

  openLivePreview: (url: string) => {
    set(s => {
      const activePane = s.panes.find(p => p.id === s.activePaneId);
      if (!activePane) return s;

      const newFile: OpenFile = { 
        path: url, 
        name: `Live Preview`, 
        content: '', 
        language: 'html', 
        isDirty: false,
        isLivePreview: true 
      };

      return {
        panes: s.panes.map(p => p.id === s.activePaneId ? {
          ...p,
          openFiles: [...p.openFiles, newFile],
          activeFileIndex: p.openFiles.length
        } : p)
      };
    });
  },

  toggleSidebar: () => {
    set(s => ({ sidebarVisible: !s.sidebarVisible }));
  },

  setActivePanel: (panel) => {
    set(s => {
      // If already on this panel, toggle visibility. If switching panels, ensure it's visible.
      if (s.activePanel === panel) {
        return { sidebarVisible: !s.sidebarVisible };
      }
      return { activePanel: panel, sidebarVisible: true };
    });
  },

  searchFiles: async (query: string, caseSensitive: boolean) => {
    const { openFolderPath } = get();
    if (!openFolderPath || !query.trim()) return;

    set({ isSearching: true, searchResults: [] });
    try {
      const results = await invoke<SearchResultNode[]>('search_workspace', {
        path: openFolderPath,
        query,
        caseSensitive,
      });
      set({ searchResults: results, isSearching: false });
    } catch (err) {
      console.error('Search failed:', err);
      set({ isSearching: false });
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  setFocusedLine: (line: number | null) => {
    set({ focusedLine: line });
  },

  toggleTerminal: () => {
    set(s => ({ terminalVisible: !s.terminalVisible }));
  },

  toggleZenMode: () => {
    set(s => ({
      zenMode: !s.zenMode,
      sidebarVisible: s.zenMode ? true : false,
      terminalVisible: s.zenMode ? s.terminalVisible : false,
    }));
  },

  sendToTerminal: (text: string) => {
    set({ pendingTerminalCommand: text, terminalVisible: true });
  },

  clearTerminalCommand: () => {
    set({ pendingTerminalCommand: null });
  },

  createFile: async (parentPath: string, name: string) => {
    try {
      const slash = navigator.userAgent.includes('Win') ? '\\' : '/';
      const newPath = `${parentPath}${slash}${name}`;
      await invoke('save_file_content', { path: newPath, content: '' });
      const { openFolderPath } = get();
      if (openFolderPath) await get().loadFileTree(openFolderPath);
    } catch (err) {
      console.error('Failed to create file:', err);
      alert(`Failed to create file: ${err}`);
    }
  },

  createFolder: async (parentPath: string, name: string) => {
    try {
      const slash = navigator.userAgent.includes('Win') ? '\\' : '/';
      const newPath = `${parentPath}${slash}${name}`;
      await mkdir(newPath);
      const { openFolderPath } = get();
      if (openFolderPath) await get().loadFileTree(openFolderPath);
    } catch (err) {
      console.error('Failed to create folder:', err);
      alert(`Failed to create folder: ${err}`);
    }
  },
}));
