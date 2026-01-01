
import React, { useState } from 'react';
import { Search as SearchIcon, History, X } from 'lucide-react';

interface SearchProps {
  recentSearches: string[];
  onSearch: (query: string) => void;
  onClearRecent: (query: string) => void;
}

export const Search: React.FC<SearchProps> = ({ recentSearches, onSearch, onClearRecent }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (engine: 'google' | 'wiki') => {
    if (!query.trim()) return;
    const url = engine === 'google' 
      ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
      : `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
    onSearch(query);
    window.open(url, '_blank');
    setQuery('');
  };

  const handleRecentClick = (q: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <div className="relative shrink-0">
        <input 
          type="text"
          className="w-full bg-white/50 border border-slate-200 rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all text-slate-800"
          placeholder="Search for anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch('google')}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      </div>
      <div className="flex gap-2 shrink-0">
        <button 
          onClick={() => handleSearch('google')}
          className="flex-1 py-2 px-4 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Google
        </button>
        <button 
          onClick={() => handleSearch('wiki')}
          className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Wiki
        </button>
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-2 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 shrink-0">
            <History size={12} /> Recent Searches
          </div>
          <div className="space-y-1 overflow-y-auto no-scrollbar pb-2">
            {recentSearches.slice(0, 5).map((q, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <button 
                  onClick={() => handleRecentClick(q)}
                  className="text-xs text-slate-600 hover:text-blue-500 transition-colors truncate text-left pr-2 flex-1"
                >
                  {q}
                </button>
                <button 
                  onClick={() => onClearRecent(q)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
