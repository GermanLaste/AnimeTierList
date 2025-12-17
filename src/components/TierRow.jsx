import { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAnime } from './DraggableAnime';
import { motion } from 'framer-motion';

export function TierRow({ row, items, onRename, onRemove, onHoverAnime }) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });
  const textareaRef = useRef(null);

  // ... (tu lógica de adjustHeight sigue igual)
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  useEffect(() => { adjustHeight(); }, [row.label]);
  // ...

  return (
    <motion.div 
        ref={setNodeRef} 
        // Animación reactiva al Drag & Drop (Ripple effect / Highlight)
        animate={{ 
            borderColor: isOver ? 'rgba(255,255,255, 0.5)' : 'rgba(31, 41, 55, 0.5)',
            backgroundColor: isOver ? 'rgba(31, 41, 55, 0.8)' : 'rgba(17, 24, 39, 1)',
            scale: isOver ? 1.005 : 1
        }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[110px] rounded-xl overflow-hidden border border-gray-800 transition-all shadow-sm relative"
    >
      {/* Indicador visual lateral */}
      <div className={`${row.color} w-24 flex items-center justify-center border-r border-black/20 p-2 relative z-10`}>
        {/* Patrón de fondo sutil en la caja de color */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        
        <textarea
            ref={textareaRef}
            value={row.label}
            onChange={(e) => { onRename(row.id, e.target.value); adjustHeight(); }}
            rows={1}
            className="w-full bg-transparent text-center text-xl sm:text-2xl font-black text-black/90 placeholder-black/40 focus:outline-none resize-none overflow-hidden leading-tight break-words uppercase drop-shadow-sm"
            placeholder="TIER"
            style={{ minHeight: '30px' }}
        />
      </div>

      <SortableContext items={items.map(i => i.mal_id)} id={row.id} strategy={horizontalListSortingStrategy}>
        <div className="flex-1 p-3 flex flex-wrap gap-3 items-center content-center transition-colors">
          {items.map((anime) => (
            <DraggableAnime 
                key={anime.mal_id} 
                id={anime.mal_id} 
                anime={anime} 
                onRemove={onRemove}
                onHoverStart={() => onHoverAnime(anime)}
                onHoverEnd={() => onHoverAnime(null)}
            />
          ))}
          
          {/* Placeholder fantasma cuando está vacío y arrastras algo encima */}
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