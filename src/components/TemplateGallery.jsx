import { useEffect, useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';

export function TemplateGallery({ isOpen, onClose, onLoad }) {
  const { getRecentTemplates } = useTemplates();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getRecentTemplates()
        .then(data => setTemplates(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // HELPER: Para encontrar la imagen del anime sin errores
  const getImageUrl = (animeData) => {
    if (!animeData) return 'https://via.placeholder.com/100?text=?';
    // Intenta diferentes rutas comunes de APIs de anime
    return animeData.image || 
           animeData.images?.jpg?.image_url || 
           animeData.images?.webp?.image_url || 
           animeData.coverImage?.large ||
           'https://via.placeholder.com/100?text=N/A';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* CABECERA */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d26]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🏆 Galería de la Comunidad
            </h2>
            <p className="text-gray-400 text-sm">Descubre listas creadas por otros jugadores.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0f1115]">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center text-gray-500 py-20 flex flex-col items-center">
               <span className="text-4xl mb-4">📭</span>
               <p>No hay templates todavía.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col">
                  
                  {/* PREVIEW DE IMÁGENES (Collage) */}
                  <div className="h-32 bg-gray-900/50 relative overflow-hidden">
                     <div className="absolute inset-0 grid grid-cols-4 gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-700">
                         {template.template_items?.slice(0, 4).map((item, i) => (
                            <div key={i} className="relative h-full">
                                <img 
                                  src={getImageUrl(item.anime_data)} 
                                  alt="preview" 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                         ))}
                     </div>
                     {/* Título sobre la imagen */}
                     <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#111827] to-transparent pt-10">
                        <h3 className="font-bold text-white truncate text-lg shadow-black drop-shadow-md">
                          {template.title}
                        </h3>
                     </div>
                  </div>

                  {/* INFO DEL AUTOR Y DESCRIPCIÓN */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {/* Autor */}
                    <div className="flex items-center gap-2">
                        {template.author_avatar ? (
                            <img src={template.author_avatar} alt={template.author_name} className="w-5 h-5 rounded-full border border-gray-600" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">👤</div>
                        )}
                        <span className="text-xs text-gray-400 font-medium">
                            por <span className="text-gray-300">{template.author_name || 'Anónimo'}</span>
                        </span>
                        <span className="text-xs text-gray-600">• {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>

                    {template.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 flex justify-between items-center">
                       <span className="text-[10px] bg-gray-700/50 px-2 py-1 rounded text-gray-400 font-bold uppercase tracking-wider">
                         {template.template_items?.length} Elementos
                       </span>
                       
                       <button 
                         onClick={() => onLoad(template)}
                         className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                       >
                         <span>Cargar</span>
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                       </button>
                    </div>
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