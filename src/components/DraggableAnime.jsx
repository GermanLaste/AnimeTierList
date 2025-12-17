import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableAnime({ anime, id }) {
  // useSortable nos da las herramientas para arrastrar este item
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
} = useSortable({ id: id });

  // Estilos para que se mueva suavemente
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // Importante para móviles
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group cursor-grab active:cursor-grabbing z-10"
    >
      <img 
        src={anime.images.jpg.image_url} 
        alt={anime.title} 
        className="w-20 h-20 object-cover rounded shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-white"
      />
    </div>
  );
}