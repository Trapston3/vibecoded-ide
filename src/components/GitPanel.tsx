import { useState, useEffect } from 'react';
import { Command } from '@tauri-apps/plugin-shell';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

export default function GitPanel() {
  const [statusLines, setStatusLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGitRepo, setIsGitRepo] = useState(true);
  const [commitMessage, setCommitMessage] = useState('');
  const { openFolderPath, openDiffFile } = useWorkspaceStore();

  const fetchStatus = async () => {
    if (!openFolderPath) return;
    setLoading(true);
    try {
      const output = await Command.create('git', [
        '-C', openFolderPath,
        'status', '-s'
      ]).execute();

      if (output.code === 0 && output.stdout) {
        setStatusLines(output.stdout.split('\n').filter(Boolean));
        setIsGitRepo(true);
      } else {
        setStatusLines([]);
        if (output.stderr && output.stderr.toLowerCase().includes('not a git repository')) {
          setIsGitRepo(false);
        } else {
          setIsGitRepo(true);
        }
      }
    } catch (e) {
      console.error('Git status error:', e);
      setStatusLines([]);
      setIsGitRepo(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    // A quick poll or workspace hook could go here, but for minimalism we can just refresh on mount
  }, [openFolderPath]);

  const handleCommit = async () => {
    if (!openFolderPath || !commitMessage.trim()) return;
    setLoading(true);
    try {
        // Simple commit all to respect classic minimalist git plugins
      await Command.create('git', ['-C', openFolderPath, 'add', '.']).execute();
      await Command.create('git', ['-C', openFolderPath, 'commit', '-m', commitMessage]).execute();
      setCommitMessage('');
      fetchStatus();
    } catch (e) {
      console.error('Commit error:', e);
    }
    setLoading(false);
  };

  const handleFileClick = async (line: string) => {
    if (!openFolderPath) return;
    // Format is typically " M path" or "?? path"
    const pathPart = line.substring(3).trim();
    const slash = navigator.userAgent.includes('Win') ? '\\' : '/';
    const fullPath = `${openFolderPath}${slash}${pathPart}`;
    
    try {
      const showCmd = await Command.create('git', ['-C', openFolderPath, 'show', `HEAD:${pathPart}`]).execute();
      let originalContent = '';
      if (showCmd.code === 0) {
        originalContent = showCmd.stdout;
      }
      
      await openDiffFile(fullPath, originalContent);
    } catch (e) {
      console.error('Git show error:', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary w-full">
      <div className="px-3 pt-3 pb-2 border-b border-border-subtle bg-bg-secondary sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Source Control
        </h2>
        <button 
            onClick={fetchStatus}
            className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-bg-hover text-text-secondary transition-colors-fast"
            title="Refresh"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>

      <div className="px-3 py-3 border-b border-border-subtle bg-bg-primary">
        <input
          type="text"
          className="w-full bg-bg-secondary text-text-primary text-[12px] px-2 py-1.5 rounded-[var(--radius-sm)] outline-none border border-transparent focus-visible:border-border-subtle transition-colors-fast mb-2"
          placeholder="Message (Enter to commit)"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommit();
          }}
        />
        <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || loading || statusLines.length === 0}
            className="w-full px-4 py-1 rounded-[var(--radius-sm)] bg-accent text-text-inverse text-[11px] font-medium transition-colors-fast hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Commit & Push
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!isGitRepo && !loading && (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/></svg>
            <p className="text-[12px] text-text-secondary">Not a Git repository</p>
          </div>
        )}
        {loading && <div className="text-[11px] text-text-muted text-center py-2">Loading...</div>}
        {!loading && isGitRepo && statusLines.length === 0 && (
            <div className="text-[11px] text-text-muted text-center py-4">No changes</div>
        )}
        {!loading && isGitRepo && statusLines.map((line, idx) => {
            const statusType = line.substring(0, 2);
            const path = line.substring(3).trim();
            const fileName = path.split(/[\\/]/).pop() || path;
            
            let colorClass = 'text-text-secondary';
            if (statusType.includes('M')) colorClass = 'text-warning';
            else if (statusType.includes('A') || statusType.includes('?')) colorClass = 'text-success';
            else if (statusType.includes('D')) colorClass = 'text-error';

            return (
                <button
                    key={idx}
                    onClick={() => handleFileClick(line)}
                    className="w-full text-left flex items-center justify-between px-2 py-1.5 hover:bg-bg-hover rounded-sm group transition-colors-fast"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`text-[12px] truncate ${statusType.includes('?') ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {fileName}
                        </span>
                        <span className="text-[10px] text-text-muted truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {path}
                        </span>
                    </div>
                    <span className={`text-[10px] font-bold shrink-0 ${colorClass}`}>
                        {statusType.trim() || 'M'}
                    </span>
                </button>
            )
        })}
      </div>
    </div>
  );
}
