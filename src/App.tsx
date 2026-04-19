import { useEffect } from 'react';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { useThemeStore } from './store/useThemeStore';
import ActivityBar from './components/ActivityBar';
import FileExplorer from './components/FileExplorer';
import SearchPanel from './components/SearchPanel';
import GitPanel from './components/GitPanel';
import TabBar from './components/TabBar';
import EditorComponent from './components/EditorComponent';
import StatusBar from './components/StatusBar';
import CommandPalette from './components/CommandPalette';
import TerminalComponent from './components/TerminalComponent';

// ═══════════════════════════════════════════════════════════════
// App — Main IDE Layout
// ═══════════════════════════════════════════════════════════════

function App() {
  const isDark = useThemeStore((s) => s.isDark);

  const {
    openFolderPath,
    fileTree,
    panes,
    activePaneId,
    previewKey,
    sidebarVisible,
    activePanel,
    terminalVisible,
    zenMode,
    openFolder,
    openFile,
    updateFileContent,
    saveFile,
    toggleSidebar,
    toggleTerminal,
    toggleZenMode,
    openSingleFile,
    closeFile,
    setActiveFile,
    setActivePane,
    setActivePanel,
  } = useWorkspaceStore();

  // ── Global Keyboard Shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (!panes || panes.length === 0) return;
      
      const pane = panes.find(p => p.id === activePaneId) || panes[0];
      const { activeFileIndex, openFiles, id: paneId } = pane;

      // Ctrl+B → Toggle sidebar
      if (ctrl && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Ctrl+` → Toggle terminal
      if (ctrl && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
      // Ctrl+S → Save active file
      if (ctrl && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        if (activeFileIndex >= 0) saveFile(paneId, activeFileIndex);
      }
      // Ctrl+Shift+Z → Zen Mode
      if (ctrl && e.shiftKey && (e.key === 'Z' || e.key === 'z')) {
        e.preventDefault();
        toggleZenMode();
      }

      // ─── Pro Tab Management Shortcuts ───
      // Ctrl+W → Close Tab
      if (ctrl && e.key === 'w') {
        e.preventDefault();
        if (activeFileIndex >= 0) {
          closeFile(paneId, activeFileIndex);
        }
      }

      // Ctrl+Tab & Ctrl+Shift+Tab
      if (ctrl && e.key === 'Tab') {
        e.preventDefault();
        if (openFiles.length > 1) {
          if (e.shiftKey) {
            setActiveFile(paneId, (activeFileIndex - 1 + openFiles.length) % openFiles.length);
          } else {
            setActiveFile(paneId, (activeFileIndex + 1) % openFiles.length);
          }
        }
      }

      // Ctrl+O → Open File
      if (ctrl && e.key === 'o') {
        e.preventDefault();
        openSingleFile(); // Natively trigger the file picker
      }

      // Ctrl+N → New File (placeholder for now via openFolder state)
      if (ctrl && e.key === 'n') {
        e.preventDefault();
        setActivePanel('explorer');
        if (!sidebarVisible) toggleSidebar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    activePaneId,
    panes,
    sidebarVisible,
    saveFile,
    closeFile,
    setActiveFile,
    toggleSidebar,
    toggleTerminal,
    toggleZenMode,
    openSingleFile,
    setActivePanel,
  ]);

  return (
    <div className={isDark ? 'dark' : ''} style={{ height: '100%', width: '100%' }}>
      <div className="flex flex-col h-full w-full bg-bg-primary text-text-primary">
        {/* Command Palette (floating overlay) */}
        <CommandPalette />

        {/* ═══ Main Layout ═══ */}
        <div className="flex flex-1 min-h-0">

          {/* ─── Activity Bar ─── */}
          {!zenMode && <ActivityBar />}

          {/* ─── Sidebar (File Explorer) ─── */}
          {!zenMode && (
            <aside
              className={`
                no-select bg-bg-secondary border-r border-border-subtle
                transition-layout overflow-hidden flex flex-col
                ${sidebarVisible ? 'w-[260px] min-w-[260px]' : 'w-0 min-w-0'}
              `}
            >
              <div className="px-3 pt-3 pb-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Explorer
                </h2>
              </div>

              {!openFolderPath ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4 pb-8">
                  <p className="text-[12px] text-text-muted text-center leading-relaxed">
                    Open a folder or file to get started
                  </p>
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <button
                      id="btn-open-folder"
                      onClick={openFolder}
                      className="w-full px-4 py-1.5 rounded-[var(--radius-md)] bg-accent text-text-inverse text-[12px] font-medium transition-colors-fast hover:bg-accent-hover cursor-pointer"
                    >
                      Open Folder
                    </button>
                    <button
                      id="btn-open-file"
                      onClick={openSingleFile}
                      className="w-full px-4 py-1.5 rounded-[var(--radius-md)] border border-border-subtle bg-bg-primary text-text-secondary text-[12px] font-medium transition-colors-fast hover:bg-bg-hover hover:text-text-primary cursor-pointer"
                    >
                      Open File
                    </button>
                  </div>
                </div>
              ) : activePanel === 'search' ? (
                <SearchPanel />
              ) : activePanel === 'git' ? (
                <GitPanel />
              ) : (
                  <FileExplorer
                    tree={fileTree}
                    onFileSelect={(path) => {
                      if (!activePaneId && panes.length > 0) setActivePane(panes[0].id);
                      openFile(path);
                    }}
                    activeFilePath={
                      panes.find(p => p.id === activePaneId)?.openFiles[
                        panes.find(p => p.id === activePaneId)?.activeFileIndex || 0
                      ]?.path || undefined
                    }
                  />
              )}
            </aside>
          )}

          {/* ─── Main Content Area ─── */}
          <main className="flex-1 flex flex-col min-w-0">

            {/* Split Panes Area */}
            <div className={`flex-1 flex flex-row min-h-0 ${zenMode ? 'justify-center' : ''}`}>
              {panes.map((pane, paneIdx) => {
                const activeFile = pane.activeFileIndex >= 0 ? pane.openFiles[pane.activeFileIndex] : null;

                return (
                  <div 
                    key={pane.id} 
                    onClick={() => setActivePane(pane.id)}
                    className={`flex-1 flex flex-col min-w-0 transition-opacity ${
                      pane.id === activePaneId ? 'opacity-100' : 'opacity-90'
                    } ${paneIdx < panes.length - 1 ? 'border-r border-border-subtle' : ''}`}
                  >
                    {/* Tab bar */}
                    {pane.openFiles.length > 0 && !zenMode && <TabBar paneId={pane.id} />}

                    {/* Editor area */}
                    <div className={`flex-1 min-h-0 ${zenMode ? 'flex items-center justify-center' : ''}`}>
                      {activeFile ? (
                        <div className={zenMode ? 'w-[800px] max-w-[90vw] h-full' : 'h-full'}>
                          {activeFile.isLivePreview ? (
                            <iframe 
                              src={activeFile.path || "http://localhost:5173"} 
                              key={previewKey} 
                              className="w-full h-full border-none bg-white" 
                              title="Live Preview"
                            />
                          ) : (
                            <EditorComponent
                              filePath={activeFile.path}
                              content={activeFile.content}
                              language={activeFile.language}
                              onChange={(val) => updateFileContent(pane.id, pane.activeFileIndex, val)}
                              onSave={() => saveFile(pane.id, pane.activeFileIndex)}
                              isDiff={activeFile.isDiff}
                              originalContent={activeFile.originalContent}
                            />
                          )}
                        </div>
                      ) : (
                        /* Welcome screen */
                        <div className="flex items-center justify-center h-full bg-bg-primary">
                          <div className="text-center">
                            <div className="mb-5">
                              <div className="inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius-xl)] bg-bg-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                                </svg>
                              </div>
                            </div>
                            <h1 className="text-xl font-light text-text-primary mb-1.5 tracking-tight">
                              Vibecoded
                            </h1>
                            <p className="text-[13px] text-text-secondary mb-5 max-w-[260px] leading-relaxed">
                              A calm, focused editor for<br />thoughtful development.
                            </p>
                            <div className="flex flex-col gap-1.5 text-[11px] text-text-muted items-center">
                              <kbd className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-bg-secondary border border-border-subtle font-mono text-[10px]">
                                Ctrl+K
                              </kbd>
                              <span>to open Command Palette</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Terminal Panel (placeholder until Phase 4) ─── */}
            {!zenMode && (
              <div
                className={`
                  bg-bg-secondary border-t border-border-subtle
                  transition-layout overflow-hidden
                  ${terminalVisible ? 'h-[240px] min-h-[100px]' : 'h-0 min-h-0'}
                `}
              >
                <div className="flex items-center h-[30px] px-3 border-b border-border-subtle no-select bg-bg-secondary z-10">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    Terminal
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={toggleTerminal}
                    className="w-5 h-5 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors-fast hover:bg-bg-hover text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <div className="h-[calc(100%-30px)] w-full">
                  {terminalVisible && <TerminalComponent />}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ─── Status Bar ─── */}
        <StatusBar />
      </div>
    </div>
  );
}

export default App;
