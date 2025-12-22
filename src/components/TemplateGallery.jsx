import { useEffect, useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';

export function TemplateGallery({ isOpen, onClose, onLoad, viewMode = 'community', user }) {
  const { getTemplates } = useTemplates(); // Usamos la nueva función
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Efecto para buscar cuando cambia el modo o el texto (con un pequeño delay "debounce" para no saturar)
  useEffect(() => {
    if (isOpen) {
      const delaySearch = setTimeout(() => {
        setLoading(true);
        // Determinamos si buscamos "mis cosas" o "la comunidad"
        const fetchParams = {
            search: searchTerm,
            userId: viewMode === 'mine' ? user?.id : null
        };

        getTemplates(fetchParams)
          .then(data => setTemplates(data))
          .finally(() => setLoading(false));
      }, 300); // 300ms de espera mientras escribes

      return () => clearTimeout(delaySearch);
    }
  }, [isOpen, searchTerm, viewMode]);

  // Limpiar búsqueda al cerrar
  useEffect(() => { if (!isOpen) setSearchTerm(''); }, [isOpen]);

  // Helper de Imágenes (Igual que antes)
  const getImageUrl = (animeData) => { /* ... tu código de siempre ... */ return animeData.image || animeData.images?.jpg?.image_url || 'https://via.placeholder.com/100'; };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* CABECERA CON BÚSQUEDA */}
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1a1d26]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {viewMode === 'mine' ? '👤 Mis Creaciones' : '🌍 Galería de la Comunidad'}
            </h2>
            <p className="text-gray-400 text-sm">
                {viewMode === 'mine' ? 'Administra tus listas guardadas.' : 'Descubre listas creadas por otros jugadores.'}
            </p>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="relative w-full md:w-64">
             <input 
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
             />
             <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors absolute top-4 right-4 md:static">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* CONTENIDO (Grid) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0f1115]">
          {loading ? (
             <div className="flex justify-center items-center h-60"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
          ) : templates.length === 0 ? (
             <div className="text-center text-gray-500 py-20 flex flex-col items-center">
               <span className="text-4xl mb-4">🔍</span>
               <p>No encontramos nada con esa búsqueda.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* ... (Aquí va tu mapeo de cards exactamente igual que antes) ... */}
               {templates.map(template => (
                   <div key={template.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col">
                      {/* ... Copia tu card visual aquí (preview imágenes, autor, botón cargar) ... */}
                      <div className="h-32 bg-gray-900/50 relative overflow-hidden">
                        {/* Imágenes */}
                        <div className="absolute inset-0 grid grid-cols-4 gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {template.template_items?.slice(0, 4).map((item, i) => (
                                <img key={i} src={getImageUrl(item.anime_data)} className="w-full h-full object-cover" />
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#111827] to-transparent pt-10">
                            <h3 className="font-bold text-white truncate text-lg shadow-black drop-shadow-md">{template.title}</h3>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-3">
                         <div className="flex items-center gap-2">
                             <img src={template.author_avatar || 'https://via.placeholder.com/20'} className="w-5 h-5 rounded-full" />
                             <span className="text-xs text-gray-400">por {template.author_name}</span>
                         </div>
                         <button onClick={() => onLoad(template)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg mt-auto self-end">Cargar</button>
                      </div>
                   </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}