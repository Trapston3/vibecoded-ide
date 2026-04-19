import { useState } from 'react';
import { useWorkspaceStore, SearchResultNode } from '../store/useWorkspaceStore';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const { searchFiles, searchResults, isSearching, openFile, setFocusedLine } = useWorkspaceStore();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchFiles(query, caseSensitive);
    }
  };

  const handleResultClick = async (path: string, line: number) => {
    await openFile(path);
    setFocusedLine(line);
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary w-full">
      <div className="px-3 pt-3 pb-2 border-b border-border-subtle bg-bg-secondary sticky top-0 z-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Search
        </h2>
        
        <div className="flex items-center bg-bg-primary border border-border-subtle rounded-md overflow-hidden relative">
          <input
            type="text"
            className="flex-1 bg-transparent text-text-primary text-[12px] px-2 py-1.5 outline-none w-full pr-8"
            placeholder="Search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`absolute right-1 w-6 h-6 flex items-center justify-center rounded-[4px] text-[12px] transition-colors-fast font-serif italic ${
              caseSensitive ? 'bg-bg-active text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
            title="Match Case"
          >
            Aa
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isSearching && (
          <div className="text-center py-4 text-text-muted text-[12px]">Searching...</div>
        )}
        
        {!isSearching && searchResults.length === 0 && query && (
          <div className="text-center py-4 text-text-muted text-[12px]">No results found.</div>
        )}

        {!isSearching && searchResults.map((node) => (
          <ResultNodeItem key={node.path} node={node} onClickMatch={handleResultClick} />
        ))}
      </div>
    </div>
  );
}

function ResultNodeItem({
  node,
  onClickMatch
}: {
  node: SearchResultNode;
  onClickMatch: (path: string, line: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const fileName = node.path.split(/[\\/]/).pop() || node.path;

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center gap-1.5 px-2 py-1 hover:bg-bg-hover rounded-sm text-[12px] text-text-secondary transition-colors-fast"
      >
        <span className="w-3 text-center">{expanded ? '▾' : '▸'}</span>
        <span className="truncate font-semibold">{fileName}</span>
      </button>
      
      {expanded && (
        <div className="flex flex-col mt-0.5">
          {node.matches.map((match, i) => (
            <button
              key={i}
              onClick={() => onClickMatch(node.path, match.line_number)}
              className="text-left w-full flex gap-2 px-2 py-1 pl-6 hover:bg-bg-active rounded-sm group transition-colors-fast"
            >
              <span className="text-[10px] text-text-muted w-6 text-right shrink-0 pt-[2px]">
                {match.line_number}
              </span>
              <span className="text-[11px] text-text-primary truncate font-mono">
                {match.line_content}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
