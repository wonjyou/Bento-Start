
import React, { useState, useEffect } from 'react';
import { BentoCardData, CardSize, CardTheme, LinkItem } from '../types';
import { THEMES, SIZES } from '../constants';
import { Maximize, GripVertical, Trash2, Edit3, Pencil, X, Check, Paintbrush } from 'lucide-react';

interface BentoCardProps {
  card: BentoCardData;
  onUpdate: (id: string, updates: Partial<BentoCardData>) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
  isEditingGlobal: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragged?: boolean;
  isOver?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  card, 
  onUpdate, 
  onDelete, 
  children, 
  isEditingGlobal,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragged,
  isOver
}) => {
  const [localEdit, setLocalEdit] = useState(false);
  const [draftLinks, setDraftLinks] = useState<LinkItem[]>([]);

  // Sync draft links when entering local edit mode
  useEffect(() => {
    if (localEdit) {
      setDraftLinks(card.links || []);
    }
  }, [localEdit, card.links]);

  const toggleSize = () => {
    const sizes: CardSize[] = ['small', 'medium', 'large'];
    const nextSize = sizes[(sizes.indexOf(card.size) + 1) % sizes.length];
    onUpdate(card.id, { size: nextSize });
  };

  const toggleTheme = () => {
    const themes: CardTheme[] = ['default', 'blue', 'gray', 'dark', 'emerald', 'rose', 'amber', 'indigo'];
    const nextTheme = themes[(themes.indexOf(card.theme) + 1) % themes.length];
    onUpdate(card.id, { theme: nextTheme });
  };

  const handleDone = () => {
    onUpdate(card.id, { links: draftLinks });
    setLocalEdit(false);
  };

  const handleCancel = () => {
    setLocalEdit(false);
  };

  const getShadowClass = () => {
    if (isEditingGlobal) return 'ring-2 ring-blue-400 ring-offset-2 cursor-move';
    if (card.type === 'news') return 'shadow-sm';
    return 'shadow-sm hover:shadow-md';
  };

  // Inject local edit state and draft data into children if they support it
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const isLinksWidget = card.type === 'links';
      return React.cloneElement(child as React.ReactElement<any>, { 
        isEditing: isEditingGlobal || localEdit,
        // If we are in local edit mode, provide the draft links and a local update handler
        ...(localEdit && isLinksWidget ? {
          links: draftLinks,
          onUpdate: (updatedLinks: LinkItem[]) => setDraftLinks(updatedLinks)
        } : {})
      });
    }
    return child;
  });

  return (
    <div 
      draggable={isEditingGlobal}
      onDragStart={(e) => onDragStart?.(e, card.id)}
      onDragOver={(e) => onDragOver?.(e, card.id)}
      onDrop={(e) => onDrop?.(e, card.id)}
      onDragEnd={onDragEnd}
      className={`relative group rounded-2xl p-6 transition-all duration-300 ease-out overflow-hidden flex flex-col
        ${SIZES[card.size]} 
        ${THEMES[card.theme]} 
        ${getShadowClass()}
        ${isDragged ? 'opacity-40 scale-95' : 'opacity-100'}
        ${isOver ? 'border-2 border-dashed border-blue-500 bg-blue-50/50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {isEditingGlobal ? (
            <input 
              className="bg-transparent border-b border-current focus:outline-none font-semibold text-lg w-full mr-2 truncate"
              value={card.title}
              onChange={(e) => onUpdate(card.id, { title: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()} 
            />
          ) : (
            <h3 className="font-semibold text-lg opacity-90 truncate">{card.title}</h3>
          )}
          
          {!isEditingGlobal && React.isValidElement(children) && (children.props as any).headerAction}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          {(isEditingGlobal || localEdit) && (
            <button 
              onClick={toggleTheme} 
              title="Change Color" 
              className={`p-1 rounded transition-colors ${localEdit ? 'bg-black/10' : 'hover:bg-black/5'}`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Paintbrush size={16} />
            </button>
          )}
          {isEditingGlobal && (
            <>
              <button 
                onClick={toggleSize} 
                title="Resize" 
                className="p-1 hover:bg-black/5 rounded"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Maximize size={16} />
              </button>
              <button 
                onClick={() => onDelete(card.id)} 
                title="Delete" 
                className="p-1 hover:bg-red-500/10 text-red-500 rounded"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {!isEditingGlobal && card.type === 'links' && (
            <button 
              onClick={localEdit ? handleCancel : () => setLocalEdit(true)} 
              className={`p-1 rounded transition-colors ${localEdit ? 'bg-red-500 text-white' : 'hover:bg-black/5'}`}
              title={localEdit ? "Cancel Changes" : "Edit Links"}
            >
              {localEdit ? <X size={16} /> : <Pencil size={16} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden pointer-events-auto relative">
        <div className={localEdit ? "pb-12" : ""}>
          {childrenWithProps}
        </div>

        {localEdit && (
          <div className="absolute bottom-0 right-0 p-1 flex items-center gap-2">
            <button 
              onClick={handleDone}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              <Check size={14} />
              Done
            </button>
          </div>
        )}
      </div>

      {isEditingGlobal && (
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-slate-300">
           <GripVertical size={20} />
        </div>
      )}
    </div>
  );
};