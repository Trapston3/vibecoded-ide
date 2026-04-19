import { useWorkspaceStore } from '../store/useWorkspaceStore';

// ═══════════════════════════════════════════════════════════════
// TabBar — Horizontal file tabs above the editor
// ═══════════════════════════════════════════════════════════════

export default function TabBar({ paneId }: { paneId: string }) {
  const {
    panes,
    activePaneId,
    setActiveFile,
    closeFile,
    closePane,
    splitEditorRight,
  } = useWorkspaceStore();

  const pane = panes.find(p => p.id === paneId);
  if (!pane) return null;

  const { openFiles, activeFileIndex } = pane;
  const isActivePane = paneId === activePaneId;

  if (openFiles.length === 0) return null;

  return (
    <div className={`flex items-center h-[36px] bg-bg-secondary border-b border-border-subtle no-select overflow-x-auto overflow-y-hidden hide-scrollbar ${isActivePane ? '' : 'opacity-80'}`}>
      {openFiles.map((file, idx) => {
        const isActive = idx === activeFileIndex;
        return (
          <div
            key={file.path}
            className={`
              group flex items-center gap-1.5 px-3 h-[32px]
              rounded-t-[var(--radius-sm)] cursor-pointer
              transition-colors-fast text-[12px]
              ${isActive
                ? 'bg-bg-primary text-text-primary border-t-2 border-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }
            `}
            onMouseDown={(e) => {
              if (e.button === 1) closeFile(paneId, idx); // Middle click
            }}
            onClick={() => setActiveFile(paneId, idx)}
            title={file.path}
          >
            <span className="truncate max-w-[120px]">
              {file.isDirty && <span className="text-accent mr-0.5">●</span>}
              {file.name}
            </span>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(paneId, idx);
              }}
              className="
                w-4 h-4 flex items-center justify-center
                rounded-[3px] opacity-0 group-hover:opacity-100
                transition-colors-fast hover:bg-bg-active
                text-text-muted hover:text-text-primary
              "
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        );
      })}
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Split Editor Right */}
      {isActivePane && (
        <button
          onClick={splitEditorRight}
          title="Split Editor Right"
          className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-accent hover:bg-bg-hover transition-colors-fast rounded-sm mr-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
        </button>
      )}

      {/* Close Pane Button (if more than 1 pane exists) */}
      {panes.length > 1 && (
        <button
          onClick={() => closePane(paneId)}
          title="Close Split Pane"
          className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-error hover:bg-bg-hover transition-colors-fast mr-2 rounded-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </div>
  );
}
