import { useState, useRef, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toPng } from 'html-to-image';
import { supabase } from './lib/supabaseClient';

// Hooks
import { useTierList } from './hooks/useTierList';
import { useTemplates } from './hooks/useTemplates';

// Componentes
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BankDroppable } from './components/BankDroppable';
import { AnimeSearch } from './components/AnimeSearch';
import { TierRow } from './components/TierRow';
import { CinematicPreview } from './components/CinematicPreview';
import { AnimeCard } from './components/AnimeCard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PublishModal } from './components/PublishModal';
import { TemplateGallery } from './components/TemplateGallery'; // <--- Importamos la Galería
import { SakuraBackground } from './components/SakuraBackground';
import { TokyoCity } from './components/TokyoCity';

function App() {
  const [user, setUser] = useState(null);
  
  // Estados para los Modales
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false); // <--- Estado para Galería
  
  const { publishTemplate, loading: publishing } = useTemplates();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const {
    tierTitle, setTierTitle, rows, items, activeId, activeItem, activeAnimeData,
    previewAnime, stats, existingAnimeIds, containerRef,
    addNewRow, handleRenameRow, handleColorChange, handleRemoveItem, handleSelectAnime,
    clearBoard, deleteTier, importFromTemplate, // <--- Importamos la nueva función
    handleResizeStart, handleHoverStart, handleHoverEnd, 
    handleDragStart, handleDragEnd, customCollisionDetection
  } = useTierList();

  const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null, title: "", message: "" });
  const tierListRef = useRef(null);
  const footerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const requestReset = () => setConfirmation({ isOpen: true, type: 'RESET', title: "⚠️ ¿REINICIAR TODO?", message: "Se borrará todo el progreso.", data: null });
  const requestDeleteTier = (id) => setConfirmation({ isOpen: true, type: 'DELETE_TIER', title: "¿Eliminar Fila?", message: "Los animes volverán al banco.", data: id });
  
  const handleConfirmAction = () => {
    if (confirmation.type === 'RESET') clearBoard();
    if (confirmation.type === 'DELETE_TIER') deleteTier(confirmation.data);
    setConfirmation(c => ({ ...c, isOpen: false }));
  };

  // --- LÓGICA DE PUBLICAR ---
  const handleRequestPublish = () => {
    if (!user) return alert("Debes iniciar sesión para guardar templates 🔒");
    const hasItems = Object.values(items).some(list => list.length > 0);
    if (!hasItems) return alert("¡Tu lista está vacía! Agrega algunos animes primero.");
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async ({ title, description }) => {
    const allAnimes = Object.values(items).flat();
    const result = await publishTemplate({
        title, description, items: allAnimes, user
    });
    if (result.success) {
        setIsPublishModalOpen(false);
        alert("¡Template publicado exitosamente! 🚀");
    } else {
        alert("Error al publicar: " + result.error.message);
    }
  };

  // --- LÓGICA DE GALERÍA (CARGAR TEMPLATE) ---
  const handleLoadTemplate = (templateData) => {
      if (confirm(`¿Cargar "${templateData.title}"? Se reemplazará tu lista actual.`)) {
          importFromTemplate(templateData);
          setIsGalleryOpen(false); // Cerramos la galería
      }
  };

  const handleDownloadImage = async () => {
    if (!tierListRef.current) return;
    try {
      if (footerRef.current) footerRef.current.classList.remove('hidden');
      const dataUrl = await toPng(tierListRef.current, { 
          cacheBust: true, backgroundColor: '#111827', quality: 0.95, pixelRatio: 2, 
          filter: (node) => !node.hasAttribute?.('data-hide-on-export') && !node.hasAttribute?.('data-html2canvas-ignore')
      });
      const link = document.createElement('a');
      link.download = `tierlist-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); alert("Error al exportar"); } 
    finally { if (footerRef.current) footerRef.current.classList.add('hidden'); }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#110518] text-white flex flex-col font-sans selection:bg-pink-500/30 overflow-x-hidden relative">        
        
        {/* FONDOS */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[100px] animate-pulse delay-1000"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>
        <TokyoCity />
        <SakuraBackground />
        
        {/* MODALES */}
        <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation(c => ({...c, isOpen: false}))} onConfirm={handleConfirmAction} title={confirmation.title} message={confirmation.message} />
        
        <PublishModal 
            isOpen={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
            onConfirm={handleConfirmPublish}
            initialTitle={tierTitle}
            loading={publishing}
        />

        <TemplateGallery 
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            onLoad={handleLoadTemplate}
        />

        <Header 
            user={user}
            onAddRow={addNewRow} 
            onReset={requestReset} 
            onExport={handleDownloadImage}
            onSave={handleRequestPublish}
            onOpenGallery={() => setIsGalleryOpen(true)} // <--- Conectamos el botón nuevo
        />

        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-8 flex flex-col gap-6 relative z-10">
          
          <div 
            ref={containerRef}
            className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl flex flex-col relative group transition-colors duration-300 hover:border-gray-600 w-full"
            style={{ height: 'auto', minHeight: '400px' }} 
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-10 min-h-0">
                  <div ref={tierListRef} className="flex flex-col gap-2 bg-[#1a1d26] p-4 rounded-xl shadow-inner">

                      <input 
                        value={tierTitle} onChange={(e) => setTierTitle(e.target.value)} 
                        className="w-full bg-transparent text-center text-3xl md:text-5xl font-russo p-4 mb-2 outline-none border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 transition-all uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent caret-white placeholder-gray-700" 
                        placeholder="TÍTULO..." maxLength={40} 
                      />
                      
                      {/* ESTADÍSTICAS */}
                      <div className="grid grid-cols-3 gap-4 mb-6 px-4 md:px-12" data-hide-on-export="true">
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2 flex flex-col items-center"><span className="text-xl font-black text-blue-400">{stats.totalCount}</span><span className="text-[10px] uppercase font-bold text-blue-300/70">Total</span></div>
                          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-2 flex flex-col items-center"><span className="text-xl font-black text-green-400">{stats.allRankedCount}</span><span className="text-[10px] uppercase font-bold text-green-300/70">Ranked</span></div>
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2 flex flex-col items-center"><span className="text-xl font-black text-purple-400">{stats.bankCount}</span><span className="text-[10px] uppercase font-bold text-purple-300/70">Banco</span></div>
                      </div>

                      <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        {rows.map((row) => (
                            <TierRow key={row.id} row={row} items={items[row.id]} onRename={handleRenameRow} onColorChange={handleColorChange} onRemoveAnime={handleRemoveItem} onDeleteTier={requestDeleteTier} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} />
                        ))}
                      </SortableContext>
                      
                      <div ref={footerRef} className="hidden pt-4 mt-2 border-t border-gray-800 text-center bg-[#1a1d26]"><p className="text-gray-500 text-sm font-bold uppercase">Hecho en AnimeTierMaker</p></div>
                  </div>
              </div>

              <div 
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart} 
                className="h-6 w-full cursor-row-resize flex items-center justify-center bg-gray-900/50 hover:bg-blue-600/20 border-t border-gray-700/50 rounded-b-2xl transition-colors group-hover:border-blue-500/30 touch-none"
              >
                  <div className="w-16 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
            <div className="lg:col-span-3 bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col shadow-lg">
                <AnimeSearch onSelect={handleSelectAnime} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} existingIds={existingAnimeIds} />
            </div>
            <div className="lg:col-span-9 bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col shadow-lg">
                <div className="flex justify-between items-center mb-2 px-2"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu Colección <span className="text-blue-500">({items.bank.length})</span></h3></div>
                <div className="absolute inset-0 top-10 p-4"><BankDroppable items={items.bank} onRemove={handleRemoveItem} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} /></div>
            </div>
          </div>
        </main>

        <Footer />
        
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeItem?.type === 'Anime' && activeAnimeData ? (<div className="cursor-grabbing pointer-events-none"><AnimeCard anime={activeAnimeData} isOverlay={true} /></div>) : null}
            {activeItem?.type === 'Row' ? (<div className="w-full h-24 bg-gray-800/90 border border-blue-500 rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-xl"><span className="text-2xl font-black text-white uppercase">{activeItem.data.label}</span></div>) : null}
        </DragOverlay>

        <CinematicPreview anime={previewAnime} />
      </div>
    </DndContext>
  );
}
export default App;