import { useState } from 'react';

export function AnimeSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchAnime = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=12`);
      const data = await response.json();
      setResults(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={searchAnime} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
          disabled={loading}
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      {/* Grid de Resultados más limpio */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {results.map((anime) => (
          <div 
            key={anime.mal_id} 
            onClick={() => onSelect(anime)}
            className="cursor-pointer overflow-hidden rounded-lg shadow-lg border border-transparent hover:border-blue-500 transition-all"
            title={anime.title} // Muestra el nombre al dejar quieto el mouse
          >
            {/* Imagen con efecto Zoom */}
            <img 
              src={anime.images.jpg.image_url} 
              alt={anime.title} 
              className="w-full h-32 md:h-40 object-cover transform transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
}