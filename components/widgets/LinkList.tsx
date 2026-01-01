
import React, { useState } from 'react';
import { LinkItem, CardTheme } from '../../types';
import { Plus, X, ExternalLink } from 'lucide-react';

interface LinkListProps {
  links: LinkItem[];
  isEditing: boolean;
  onUpdate: (links: LinkItem[]) => void;
  theme?: CardTheme;
}

export const LinkList: React.FC<LinkListProps> = ({ links, isEditing, onUpdate, theme }) => {
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addLink = () => {
    if (!newLabel || !newUrl) return;
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    onUpdate([...links, { id: Date.now().toString(), label: newLabel, url }]);
    setNewLabel('');
    setNewUrl('');
    setIsAdding(false);
  };

  const removeLink = (id: string) => {
    onUpdate(links.filter(l => l.id !== id));
  };

  const updateLabel = (id: string, label: string) => {
    onUpdate(links.map(l => l.id === id ? { ...l, label } : l));
  };

  // Determine link color based on theme
  const getLinkColorClass = () => {
    if (theme === 'dark') return 'text-slate-100/80 hover:text-white';
    return 'text-slate-600 hover:text-blue-600';
  };

  const getBorderColorClass = () => {
    if (theme === 'dark') return 'border-white/10';
    return 'border-slate-100';
  };

  const getInputClass = () => {
    if (theme === 'dark') return 'bg-slate-700 border-slate-600 text-white placeholder-slate-400';
    return 'bg-white border-slate-200 text-slate-800';
  };

  return (
    <div className="flex flex-col gap-2">
      <ul className="space-y-1">
        {links.map(link => (
          <li key={link.id} className={`group flex items-center justify-between py-1 border-b ${getBorderColorClass()} last:border-none gap-2`}>
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <ExternalLink size={12} className={`shrink-0 ${theme === 'dark' ? 'opacity-40' : 'text-slate-300'}`} />
                <input 
                  className={`flex-1 text-sm bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 min-w-0 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}
                  value={link.label}
                  onChange={(e) => updateLabel(link.id, e.target.value)}
                  placeholder="Link Label"
                />
              </div>
            ) : (
              <a 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className={`${getLinkColorClass()} transition-colors flex items-center gap-2 overflow-hidden w-full`}
              >
                <ExternalLink size={12} className={`shrink-0 ${theme === 'dark' ? 'opacity-40' : 'text-slate-300'}`} />
                <span className="truncate">{link.label}</span>
              </a>
            )}
            
            {isEditing && (
              <button 
                onClick={() => removeLink(link.id)} 
                className="text-red-300 hover:text-red-500 transition-colors p-1 shrink-0"
                title="Remove Link"
              >
                <X size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
      
      {isEditing && (
        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-blue-300 hover:text-blue-100' : 'text-blue-500 hover:text-blue-700'}`}
            >
              <Plus size={14} /> Add Link
            </button>
          ) : (
            <div className="space-y-2">
              <input 
                className={`w-full text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${getInputClass()}`}
                placeholder="Label (e.g. Google)"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
              <input 
                className={`w-full text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${getInputClass()}`}
                placeholder="URL (e.g. google.com)"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={addLink} className="flex-1 bg-blue-500 text-white text-[10px] font-bold py-1.5 rounded uppercase hover:bg-blue-600 transition-colors">Add</button>
                <button onClick={() => setIsAdding(false)} className={`flex-1 text-[10px] font-bold py-1.5 rounded uppercase transition-colors ${theme === 'dark' ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
