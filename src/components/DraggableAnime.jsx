import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimeCard } from './AnimeCard';

export function DraggableAnime({ anime, id, onRemove, onHoverStart, onHoverEnd }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0 : 1, // Ocultamos el original al arrastrar para dejar solo el Overlay
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
       {/* Pasamos los handlers de hover hacia arriba para el preview cinematográfico */}
       <AnimeCard 
         anime={anime} 
         onRemove={onRemove} 
         onHoverStart={onHoverStart}
         onHoverEnd={onHoverEnd}
       />
    </div>
  );
}