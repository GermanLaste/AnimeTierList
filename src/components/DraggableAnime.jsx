import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimeCard } from './AnimeCard';

export function DraggableAnime({ anime, id, onRemove, onHoverStart, onHoverEnd }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0 : 1, 
  };

  // Función para abrir el enlace de manera segura
  const handleOpenLink = () => {
    if (anime.url) {
        window.open(anime.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none flex-shrink-0">       <AnimeCard 
         anime={anime} 
         onRemove={onRemove} 
         onHoverStart={onHoverStart}
         onHoverEnd={onHoverEnd}
         onClick={handleOpenLink}
         showLinkIcon={true} 
       />
    </div>
  );
}