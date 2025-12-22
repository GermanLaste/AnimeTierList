import { useState, useEffect } from 'react';

export function PublishModal({ isOpen, onClose, onConfirm, initialTitle, loading }) {
    const [title, setTitle] = useState(initialTitle || '');
    const [description, setDescription] = useState('');

    // Cuando se abre el modal, cargamos el título actual
    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setDescription(''); 
        }
    }, [isOpen, initialTitle]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative scale-100">
                
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    🌍 Publicar Template
                </h2>
                <p className="text-gray-400 text-sm mb-6">Comparte tu colección con la comunidad.</p>
                
                <div className="space-y-4">
                    {/* TÍTULO */}
                    <div>
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-1">Título de la Lista</label>
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none placeholder-gray-600 transition-colors"
                            placeholder="Ej: Los mejores Shonen..."
                            maxLength={50}
                        />
                    </div>
                    
                    {/* DESCRIPCIÓN */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción (Opcional)</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none h-24 resize-none placeholder-gray-600 transition-colors"
                            placeholder="¿De qué trata esta colección? Cuéntanos un poco..."
                            maxLength={280}
                        />
                        <div className="text-right text-[10px] text-gray-600 mt-1">{description.length}/280</div>
                    </div>
                </div>

                {/* BOTONES */}
                <div className="flex gap-3 mt-6 justify-end pt-4 border-t border-gray-700/50">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-400 hover:text-white font-bold transition-colors text-sm"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm({ title, description })}
                        disabled={loading || !title.trim()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-all transform active:scale-95"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Publicando...
                            </>
                        ) : (
                            'Publicar Ahora'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}