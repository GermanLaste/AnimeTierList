import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

// Componente individual arrastrable para resultados
function DraggableSearchResult({ anime, onSelect }) {
  // Usamos un ID único con prefijo para diferenciarlo de los que ya están en el tablero
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `search-${anime.mal_id}`,
    data: { anime, fromSearch: true }, // Enviamos el objeto anime completo en la data
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group cursor-grab active:cursor-grabbing relative rounded-lg overflow-hidden aspect-[2/3] shadow-md hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 ${isDragging ? 'opacity-40' : ''}`}
      title={anime.title}
      onClick={() => onSelect(anime)} // Mantenemos el click por si acaso
    >
      <img
        src={anime.images.jpg.image_url}
        alt={anime.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {/* Overlay visual */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <span className="text-white text-xs font-bold truncate w-full block">{anime.title}</span>
        {/* Indicador visual de que se puede arrastrar */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function AnimeSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchAnime = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=9`);
      const data = await response.json();
      setResults(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={searchAnime} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Busca tu anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20"
          disabled={loading}
        >
          {loading ? <span className="animate-pulse">...</span> : 'Buscar'}
        </button>
      </form>

      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {results.map((anime) => (
          <DraggableSearchResult key={anime.mal_id} anime={anime} onSelect={onSelect} />
        ))}
        {results.length === 0 && !loading && (
          <div className="col-span-3 text-center text-gray-500 py-8 text-sm italic">
            Empieza buscando arriba...
          </div>
        )}
      </div>
    </div>
  );
}