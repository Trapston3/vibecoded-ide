import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useThemeStore } from '../store/useThemeStore';

// ═══════════════════════════════════════════════════════════════
// ActivityBar — Thin vertical icon strip on the far left
// ═══════════════════════════════════════════════════════════════

export default function ActivityBar() {
  const {
    sidebarVisible,
    activePanel,
    setActivePanel,
    terminalVisible,
    toggleTerminal,
    zenMode,
    toggleZenMode,
  } = useWorkspaceStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();

  return (
    <aside className="no-select w-[48px] min-w-[48px] bg-bg-secondary flex flex-col items-center py-3 gap-1 border-r border-border-subtle">
      {/* Files / Explorer */}
      <ActivityButton
        id="btn-toggle-sidebar"
        title="Explorer (Ctrl+B)"
        active={sidebarVisible && activePanel === 'explorer'}
        onClick={() => setActivePanel('explorer')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 18v-6" /><path d="M14 18v-3" />
        </svg>
      </ActivityButton>

      {/* Search */}
      <ActivityButton 
        id="btn-search" 
        title="Search (Ctrl+Shift+F)"
        active={sidebarVisible && activePanel === 'search'}
        onClick={() => setActivePanel('search')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
      </ActivityButton>

      {/* Source Control */}
      <ActivityButton 
        id="btn-git" 
        title="Source Control"
        active={sidebarVisible && activePanel === 'git'}
        onClick={() => setActivePanel('git')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/>
        </svg>
      </ActivityButton>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zen Mode toggle */}
      <ActivityButton
        id="btn-zen-mode"
        title="Zen Mode (Ctrl+Shift+Z)"
        active={zenMode}
        onClick={toggleZenMode}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </ActivityButton>

      {/* Terminal toggle */}
      <ActivityButton
        id="btn-toggle-terminal"
        title="Terminal (Ctrl+`)"
        active={terminalVisible}
        onClick={toggleTerminal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
        </svg>
      </ActivityButton>

      {/* Theme toggle */}
      <ActivityButton
        id="btn-toggle-theme"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onClick={toggleTheme}
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </ActivityButton>

      {/* Settings */}
      <ActivityButton id="btn-settings" title="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </ActivityButton>
    </aside>
  );
}

// ─── Reusable Activity Button ────────────────────────────────

function ActivityButton({
  id,
  title,
  active,
  onClick,
  children,
}: {
  id: string;
  title: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      title={title}
      onClick={onClick}
      className={`
        w-9 h-9 flex items-center justify-center
        rounded-[var(--radius-md)] transition-colors-fast cursor-pointer
        ${active
          ? 'bg-bg-active text-accent'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        }
      `}
    >
      {children}
    </button>
  );
}
