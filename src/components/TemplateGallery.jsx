import { useEffect, useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';

export function TemplateGallery({ isOpen, onClose, onLoad }) {
  const { getRecentTemplates } = useTemplates();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Efecto: Cuando se abre la ventana, cargamos las listas
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getRecentTemplates()
        .then(data => setTemplates(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* CABECERA */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1d26]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🏆 Galería de la Comunidad
            </h2>
            <p className="text-gray-400 text-sm">Descubre y juega Tier Lists creadas por otros.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* CONTENIDO (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0f1115]">
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p>No hay templates públicos todavía. ¡Sé el primero en crear uno!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group hover:shadow-lg hover:shadow-blue-900/10 flex flex-col">
                  
                  {/* PREVIEW DE IMÁGENES (Mostramos las primeras 4) */}
                  <div className="h-24 bg-gray-900/50 p-2 grid grid-cols-4 gap-1">
                     {template.template_items?.slice(0, 4).map((item, i) => (
                        <img 
                          key={i} 
                          src={item.anime_data.image} 
                          alt="preview" 
                          className="w-full h-full object-cover rounded opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                     ))}
                  </div>

                  {/* INFO */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-white truncate text-lg group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </h3>
                    {template.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-3">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-3 border-t border-gray-700/50 flex justify-between items-center">
                       <span className="text-[10px] text-gray-500 uppercase font-bold">
                         {template.template_items?.length} Elementos
                       </span>
                       <button 
                         onClick={() => onLoad(template)}
                         className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                       >
                         Cargar
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