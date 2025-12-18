import { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAnime } from './DraggableAnime';
import { motion } from 'framer-motion';

export function TierRow({ row, items, onRename, onRemoveAnime, onDeleteTier, onHoverStart, onHoverEnd }) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => { adjustHeight(); }, [row.label]);

  return (
    <motion.div 
        ref={setNodeRef} 
        animate={{ 
            borderColor: isOver ? 'rgba(255,255,255, 0.5)' : 'rgba(31, 41, 55, 0.5)',
            backgroundColor: isOver ? 'rgba(31, 41, 55, 0.8)' : 'rgba(17, 24, 39, 1)',
            scale: isOver ? 1.005 : 1
        }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[110px] rounded-xl overflow-hidden border border-gray-800 transition-all shadow-sm relative group/row"
    >
      {/* CAJA DE ETIQUETA (Color Box) */}
      <div className={`${row.color} w-24 flex flex-col items-center justify-center border-r border-black/20 p-2 relative z-10 group/label`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        
        <textarea
            ref={textareaRef}
            value={row.label}
            onChange={(e) => { onRename(row.id, e.target.value); adjustHeight(); }}
            rows={1}
            className="w-full bg-transparent text-center text-xl sm:text-2xl font-black text-black/90 placeholder-black/40 focus:outline-none resize-none overflow-hidden leading-tight break-words uppercase drop-shadow-sm relative z-10"
            placeholder="TIER"
            style={{ minHeight: '30px' }}
        />

        {/* BOTÓN ELIMINAR TIER (Solo aparece al hacer hover sobre la caja de color) */}
        <button 
            onClick={() => onDeleteTier(row.id)}
            className="absolute top-1 left-1 opacity-0 group-hover/label:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-black p-1 rounded hover:scale-110 z-20"
            title="Eliminar esta fila"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
        </button>
      </div>

      <SortableContext items={items.map(i => i.mal_id)} id={row.id} strategy={horizontalListSortingStrategy}>
        <div className="flex-1 p-3 flex flex-wrap gap-3 items-center content-center transition-colors">
          {items.map((anime) => (
            <DraggableAnime 
                key={anime.mal_id} 
                id={anime.mal_id} 
                anime={anime} 
                onRemove={onRemoveAnime}
                onHoverStart={() => onHoverStart(anime)}
                onHoverEnd={onHoverEnd}
            />
          ))}
          {items.length === 0 && isOver && (
            <div className="w-20 h-28 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center animate-pulse">
                <span className="text-xs text-white/30">Drop here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
}