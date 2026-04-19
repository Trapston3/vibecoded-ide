import { useWorkspaceStore } from '../store/useWorkspaceStore';

// ═══════════════════════════════════════════════════════════════
// StatusBar — Thin bottom bar with file info
// ═══════════════════════════════════════════════════════════════

export default function StatusBar() {
  const { openFiles, activeFileIndex, zenMode } = useWorkspaceStore();
  const activeFile = activeFileIndex >= 0 ? openFiles[activeFileIndex] : null;

  if (zenMode) return null;

  return (
    <footer className="no-select h-[28px] min-h-[28px] bg-bg-secondary border-t border-border-subtle flex items-center px-3 text-[11px] text-text-secondary gap-4">
      {/* Ready indicator */}
      <span className="flex items-center gap-1.5">
        <span className="w-[6px] h-[6px] rounded-full bg-success" />
        Ready
      </span>

      <div className="flex-1" />

      {/* Language mode */}
      {activeFile && (
        <span className="capitalize">{activeFile.language}</span>
      )}

      {/* Encoding */}
      <span className="font-mono">UTF-8</span>

      {/* Line/Col */}
      <span className="font-mono">Ln 1, Col 1</span>
    </footer>
  );
}
