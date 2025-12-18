import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { AnimeCard } from './AnimeCard';

// Actualizamos para recibir las funciones de hover
function DraggableSearchResult({ anime, onSelect, onHoverStart, onHoverEnd }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `search-${anime.mal_id}`,
    data: { anime, fromSearch: true },
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`cursor-grab active:cursor-grabbing relative ${isDragging ? 'opacity-40 grayscale' : ''}`}
    >
      <AnimeCard 
        anime={anime} 
        onClick={() => onSelect(anime)}
        // CONECTAMOS LA PREVIEW AQUÍ
        onHoverStart={() => onHoverStart(anime)}
        onHoverEnd={onHoverEnd}
      />
      
      {/* Indicador visual (+) */}
      <div className="absolute top-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="bg-blue-600/80 backdrop-blur-sm p-1 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
    </motion.div>
  );
}

// Recibimos onHoverStart y onHoverEnd desde App
export function AnimeSearch({ onSelect, onHoverStart, onHoverEnd }) {
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
    <div className="flex flex-col gap-4 h-full">
      {/* Barra de búsqueda LIMPIA (Sin botón) */}
      <form onSubmit={searchAnime} className="relative group shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
        </div>
        <input 
            type="text" 
            placeholder="Busca anime y presiona Enter..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner text-sm"
        />
        {/* Spinner de carga sutil a la derecha */}
        {loading && (
            <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
        )}
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        <div className="grid grid-cols-3 gap-3 pb-4">
            {results.map((anime) => (
            <DraggableSearchResult 
                key={anime.mal_id} 
                anime={anime} 
                onSelect={onSelect}
                // Pasamos las props
                onHoverStart={onHoverStart}
                onHoverEnd={onHoverEnd}
            />
            ))}
            
            {results.length === 0 && !loading && (
                <div className="col-span-3 text-center text-gray-600 py-10 flex flex-col items-center gap-2 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <span className="text-xs">Sin resultados recientes</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}