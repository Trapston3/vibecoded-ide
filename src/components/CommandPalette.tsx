import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { FileNode } from '../store/useWorkspaceStore';

// ═══════════════════════════════════════════════════════════════
// CommandPalette — Floating spotlight-style command palette
// Triggered by Ctrl+K
// ═══════════════════════════════════════════════════════════════

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { openFile, fileTree, toggleSidebar, toggleTerminal, toggleZenMode, openFolder } =
    useWorkspaceStore();

  // ── Global Ctrl+K handler ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((o) => !o);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ── Build results ──
  const commands = useCallback(() => {
    const cmds: PaletteItem[] = [
      { type: 'command', label: 'Open Folder...', action: () => { openFolder(); setIsOpen(false); } },
      { type: 'command', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: () => { toggleSidebar(); setIsOpen(false); } },
      { type: 'command', label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: () => { toggleTerminal(); setIsOpen(false); } },
      { type: 'command', label: 'Zen Mode', shortcut: 'Ctrl+Shift+Z', action: () => { toggleZenMode(); setIsOpen(false); } },
    ];
    return cmds;
  }, [openFolder, toggleSidebar, toggleTerminal, toggleZenMode]);

  const flattenFiles = useCallback(
    (nodes: FileNode[]): PaletteItem[] => {
      const result: PaletteItem[] = [];
      const walk = (items: FileNode[]) => {
        for (const node of items) {
          if (!node.is_directory) {
            result.push({
              type: 'file',
              label: node.name,
              detail: node.path,
              action: () => { openFile(node.path); setIsOpen(false); },
            });
          }
          if (node.children) walk(node.children);
        }
      };
      walk(nodes);
      return result;
    },
    [openFile],
  );

  const allItems = [...commands(), ...flattenFiles(fileTree)];
  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.detail && item.detail.toLowerCase().includes(query.toLowerCase())),
      )
    : allItems;

  // Clamp selectedIndex
  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-[520px] max-w-[90vw] glass rounded-[var(--radius-lg)] shadow-lg overflow-hidden animate-in">
        {/* Search input */}
        <div className="px-4 py-3 border-b border-border-subtle">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or file name..."
            className="w-full bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-text-muted text-sm">No results found</div>
          )}
          {filtered.map((item, i) => (
            <button
              key={`${item.type}-${item.label}-${i}`}
              onClick={item.action}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                transition-colors-fast cursor-pointer
                ${i === selectedIndex ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:bg-bg-hover'}
              `}
            >
              <span className="w-4 text-center text-xs opacity-50">
                {item.type === 'command' ? '>' : '○'}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.shortcut && (
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted border border-border-subtle">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Types ───────────────────────────────────────────────────

interface PaletteItem {
  type: 'command' | 'file';
  label: string;
  detail?: string;
  shortcut?: string;
  action: () => void;
}
