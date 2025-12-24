// src/components/BankDroppable.jsx
import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAnime } from './DraggableAnime';

export function BankDroppable({ items, onRemove, onHoverStart, onHoverEnd }) {
  const { setNodeRef } = useDroppable({ id: 'bank' });
  
  const ids = useMemo(() => items.map(i => i.mal_id), [items]);

  return (
    <SortableContext items={ids} id="bank" strategy={horizontalListSortingStrategy}>
      <div 
        ref={setNodeRef}
        className="flex flex-row flex-wrap content-start gap-4 p-4 w-full h-full overflow-y-auto custom-scrollbar bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-inner"
      >
        {items.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-500 opacity-40 w-full h-full gap-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p className="text-sm font-bold uppercase tracking-widest text-center">Colección vacía</p>
            </div>
        )}
        {items.map((anime) => (
          <div key={anime.mal_id} className="flex-shrink-0">
            <DraggableAnime id={anime.mal_id} anime={anime} onRemove={onRemove} onHoverStart={() => onHoverStart(anime)} onHoverEnd={onHoverEnd} />
          </div>
        ))}
      </div>
    </SortableContext>
  );
}