import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableAnime({ anime, id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    touchAction: 'none',
    zIndex: isDragging ? 999 : 'auto' // Asegura que al arrastrar pase por encima de todo
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners} 
        className={`relative group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="w-20 h-28 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105 ring-2 ring-transparent hover:ring-white/50 bg-gray-800">
          <img 
            src={anime.images.jpg.image_url} 
            alt={anime.title} 
            className="w-full h-full object-cover"
            draggable={false} // Evita el ghosting nativo del navegador
          />
      </div>
      
      {/* Tooltip simple al pasar el mouse */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 truncate">
        {anime.title}
      </div>
    </div>
  );
}