import { useState, useCallback } from 'react';
import type { FileNode } from '../store/useWorkspaceStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

// ═══════════════════════════════════════════════════════════════
// FileExplorer — Recursive tree view for the workspace
// ═══════════════════════════════════════════════════════════════

interface FileExplorerProps {
  tree: FileNode[];
  onFileSelect: (path: string) => void;
  activeFilePath?: string;
}

export default function FileExplorer({ tree, onFileSelect, activeFilePath }: FileExplorerProps) {
  const { createFile, createFolder, openFolderPath } = useWorkspaceStore();
  const [creationMode, setCreationMode] = useState<'file' | 'folder' | null>(null);
  const [creationName, setCreationName] = useState('');

  const handleCreateSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setCreationMode(null);
      setCreationName('');
    } else if (e.key === 'Enter' && creationName.trim() && openFolderPath) {
      if (creationMode === 'file') {
        await createFile(openFolderPath, creationName.trim());
      } else if (creationMode === 'folder') {
        await createFolder(openFolderPath, creationName.trim());
      }
      setCreationMode(null);
      setCreationName('');
    }
  };

  return (
    <div className="flex flex-col text-sm overflow-y-auto overflow-x-hidden flex-1 relative">
      <div className="flex items-center justify-end gap-1 px-3 pb-2 pt-1 border-b border-border-subtle sticky top-0 bg-bg-secondary z-10 transition-colors-fast">
        <button
          onClick={() => setCreationMode('file')}
          className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors-fast text-[12px]"
          title="New File"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        </button>
        <button
          onClick={() => setCreationMode('folder')}
          className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors-fast text-[12px]"
          title="New Folder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
        </button>
      </div>

      {creationMode && (
        <div className="px-3 py-1.5 bg-bg-active">
          <input
            autoFocus
            type="text"
            className="w-full bg-bg-primary text-text-primary text-[12px] px-2 py-1 outline-none border border-border-subtle rounded-sm"
            placeholder={`New ${creationMode}...`}
            value={creationName}
            onChange={(e) => setCreationName(e.target.value)}
            onKeyDown={handleCreateSubmit}
            onBlur={() => { setCreationMode(null); setCreationName(''); }}
          />
        </div>
      )}

      <div className="pt-2 pb-4">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            onFileSelect={onFileSelect}
            activeFilePath={activeFilePath}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Individual Tree Node ────────────────────────────────────

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  onFileSelect: (path: string) => void;
  activeFilePath?: string;
}

function TreeNode({ node, depth, onFileSelect, activeFilePath }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const isActive = !node.is_directory && node.path === activeFilePath;
  const paddingLeft = 12 + depth * 14;

  const handleClick = useCallback(() => {
    if (node.is_directory) {
      setExpanded((e) => !e);
    } else {
      onFileSelect(node.path);
    }
  }, [node, onFileSelect]);

  const icon = node.is_directory
    ? expanded
      ? '▾'
      : '▸'
    : getFileIcon(node.name);

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          w-full text-left flex items-center gap-1.5 py-[3px] pr-2
          transition-colors-fast cursor-pointer
          ${isActive
            ? 'bg-bg-active text-text-primary'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }
        `}
        style={{ paddingLeft }}
        title={node.path}
      >
        <span className="w-4 text-center text-[11px] flex-shrink-0 opacity-60">
          {icon}
        </span>
        <span className="truncate text-[13px]">{node.name}</span>
      </button>

      {/* Children (animated expand) */}
      {node.is_directory && expanded && node.children && (
        <div className="transition-layout">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              activeFilePath={activeFilePath}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ─── File Icons (simple emoji-based for now) ─────────────────

function getFileIcon(name: string): string {
  const lower = name.toLowerCase();
  const ext = lower.split('.').pop() || '';

  const iconMap: Record<string, string> = {
    ts: '⬡', tsx: '⬡', js: '◆', jsx: '◆',
    rs: '⚙', py: '◈', java: '◇', cpp: '◇', c: '◇', h: '◇',
    html: '◉', css: '◎', scss: '◎',
    json: '{ }', yaml: '≡', yml: '≡', toml: '≡',
    md: '¶', txt: '≡',
    dockerfile: '🐋',
    sh: '$', bash: '$', ps1: '>', bat: '>',
    svg: '◑', png: '◑', jpg: '◑', gif: '◑',
    lock: '🔒',
  };

  if (lower === 'dockerfile') return '🐋';
  if (lower === 'makefile') return '⚙';

  return iconMap[ext] || '○';
}
