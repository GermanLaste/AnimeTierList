import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableAnime({ anime, id, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    touchAction: 'none',
    zIndex: isDragging ? 999 : 'auto' 
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners} 
        className={`relative group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
    >
      <div className="w-20 h-28 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gray-800 relative">
          <img 
            src={anime.images.jpg.image_url} 
            alt={anime.title} 
            className="w-full h-full object-cover"
            draggable={false} 
          />

          {/* OVERLAY TÍTULO (Igual que en el buscador) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 duration-200">
            <span className="text-white text-[10px] font-bold leading-tight line-clamp-2 w-full text-center drop-shadow-md">
                {anime.title}
            </span>
          </div>

          {/* BOTÓN ELIMINAR (X) */}
          <button 
            onPointerDown={(e) => e.stopPropagation()} // Importante: Evita que al hacer clic se inicie el drag
            onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
            }}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 z-20"
            title="Eliminar de la colección"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
             </svg>
          </button>
      </div>
    </div>
  );
}