import { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAnime } from './DraggableAnime';

export function TierRow({ row, items, onRename }) {
  const { setNodeRef } = useDroppable({ id: row.id });
  const textareaRef = useRef(null);

  // Función para ajustar la altura del textarea dinámicamente
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reseteamos para calcular bien
      textarea.style.height = `${textarea.scrollHeight}px`; // Ajustamos al contenido
    }
  };

  // Ajustar altura al cargar y cuando cambia el texto
  useEffect(() => {
    adjustHeight();
  }, [row.label]);

  return (
    <div ref={setNodeRef} className="flex min-h-[100px] bg-gray-900 rounded overflow-hidden border border-gray-800 transition-all duration-200">
      {/* Caja de etiqueta (Color) */}
      <div className={`${row.color} w-24 flex items-center justify-center border-r-2 border-black p-2`}>
        <textarea
            ref={textareaRef}
            value={row.label}
            onChange={(e) => {
              onRename(row.id, e.target.value);
              adjustHeight();
            }}
            rows={1}
            className="w-full bg-transparent text-center text-xl sm:text-2xl font-black text-black placeholder-black/50 focus:outline-none resize-none overflow-hidden leading-tight break-words uppercase"
            placeholder="TIER"
            style={{ minHeight: '30px' }}
        />
      </div>

      {/* Zona de Animes */}
      <SortableContext items={items.map(i => i.mal_id)} id={row.id} strategy={horizontalListSortingStrategy}>
        <div className="flex-1 bg-gray-800 p-2 flex flex-wrap gap-2 items-center min-h-[100px]">
          {items.map((anime) => (<DraggableAnime key={anime.mal_id} id={anime.mal_id} anime={anime} />))}
        </div>
      </SortableContext>
    </div>
  );
}