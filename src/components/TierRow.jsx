import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAnime } from './DraggableAnime';

export function TierRow({ row, items }) {
  const { setNodeRef } = useDroppable({
    id: row.id,
  });

  return (
    // CAMBIO AQUÍ: El ref ahora va en el padre.
    // Toda la fila es "droppable", incluyendo la letra de la izquierda.
    <div 
      ref={setNodeRef} 
      className="flex min-h-[120px] bg-gray-900 rounded overflow-hidden border border-gray-800"
    >
      
      {/* Etiqueta (S, A, B...) - Ahora es parte de la zona de drop */}
      <div className={`${row.color} w-24 flex items-center justify-center border-r-2 border-black`}>
        <span className="text-3xl font-black text-black drop-shadow-sm">{row.label}</span>
      </div>
      
      <SortableContext 
        items={items.map(i => i.mal_id)} 
        id={row.id}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex-1 bg-gray-800 p-2 flex flex-wrap gap-2 items-center transition-colors hover:bg-gray-700/50">
          {items.map((anime) => (
            <DraggableAnime key={anime.mal_id} id={anime.mal_id} anime={anime} />
          ))}
        </div>
      </SortableContext>

    </div>
  );
}