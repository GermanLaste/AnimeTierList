import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  pointerWithin, 
  closestCenter, 
  useSensor, 
  useSensors, 
  PointerSensor,
  useDroppable 
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toPng } from 'html-to-image';

import { AnimeSearch } from './components/AnimeSearch';
import { TierRow } from './components/TierRow';
import { DraggableAnime } from './components/DraggableAnime';
import { CinematicPreview } from './components/CinematicPreview';
import { AnimeCard } from './components/AnimeCard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LogoIcon } from './components/LogoIcon.jsx';

// --- CONFIGURACIÓN ESTÁTICA (No necesita estar dentro del componente) ---
const INITIAL_ROWS = [
  { id: 'S', label: 'S', color: 'from-yellow-300 via-amber-400 to-yellow-500' },
  { id: 'A', label: 'A', color: 'from-red-500 to-rose-600' },
  { id: 'B', label: 'B', color: 'from-orange-400 to-orange-600' },
  { id: 'C', label: 'C', color: 'from-emerald-400 to-teal-600' },
  { id: 'D', label: 'D', color: 'from-gray-400 to-gray-600' },
];

const COLOR_POOL = [
  'from-purple-500 to-indigo-600',
  'from-cyan-400 to-blue-500',
  'from-pink-500 to-fuchsia-600',
  'from-lime-400 to-green-500',
  'from-indigo-400 to-violet-600',
];

// Detección de colisión optimizada para listas mixtas
function customCollisionDetection(args) {
    if (args.active.data.current?.type === 'Row') return closestCenter(args);
    return pointerWithin(args);
}

// --- SUB-COMPONENTES (Para mantener el archivo limpio) ---
const BankDroppable = ({ items, onRemove, onHoverStart, onHoverEnd }) => {
  const { setNodeRef } = useDroppable({ id: 'bank' });
  const ids = useMemo(() => items.map(i => i.mal_id), [items]);

  return (
    <SortableContext items={ids} id="bank" strategy={horizontalListSortingStrategy}>
      <div 
        ref={setNodeRef}
        className="flex flex-row flex-wrap content-start gap-4 p-4 w-full h-full overflow-y-auto custom-scrollbar bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-inner"
      >
        {items.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-500 opacity-40 w-full h-full gap-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p className="text-sm font-bold uppercase tracking-widest text-center">Colección vacía</p>
            </div>
        )}
        {items.map((anime) => (
          <div key={anime.mal_id} className="flex-shrink-0">
            <DraggableAnime id={anime.mal_id} anime={anime} onRemove={onRemove} onHoverStart={() => onHoverStart(anime)} onHoverEnd={onHoverEnd} />
          </div>
        ))}
      </div>
    </SortableContext>
  );
};

const ActionButton = ({ onClick, icon, tooltip, danger = false, hideOnExport = false }) => (
    <button 
        onClick={onClick}
        data-hide-on-export={hideOnExport}
        className={`group relative p-2 rounded-lg transition-all ${danger ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
        title={tooltip} // Fallback nativo
    >
        {icon}
        {/* Tooltip personalizado */}
        <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700 hidden md:block">
          {tooltip}
        </span>
    </button>
);

// --- COMPONENTE PRINCIPAL ---
function App() {
  // ESTADOS
  const [tierTitle, setTierTitle] = useState(() => localStorage.getItem('tierTitle') || "MI TIER LIST DE ANIME");
  const [rows, setRows] = useState(() => JSON.parse(localStorage.getItem('tierRows')) || INITIAL_ROWS);
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('tierItems');
    if (saved) return JSON.parse(saved);
    const initialState = { bank: [] };
    INITIAL_ROWS.forEach(row => initialState[row.id] = []);
    return initialState;
  });

  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null); 
  const [draggedSearchResult, setDraggedSearchResult] = useState(null);
  const [previewAnime, setPreviewAnime] = useState(null);
  const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null, title: "", message: "" }); 

  // REFS
  const tierListRef = useRef(null);
  const footerRef = useRef(null);
  const containerRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  // SENSORS
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // PERSISTENCIA
  useEffect(() => {
    localStorage.setItem('tierRows', JSON.stringify(rows));
    localStorage.setItem('tierItems', JSON.stringify(items));
    localStorage.setItem('tierTitle', tierTitle);
  }, [rows, items, tierTitle]);

  // MEMOIZACIÓN (OPTIMIZACIÓN CLAVE)
  // Calcula los IDs existentes solo cuando cambian los items, no en cada render.
  const existingAnimeIds = useMemo(() => {
    return new Set(Object.values(items).flat().map(i => i.mal_id));
  }, [items]);

  // Calcula estadísticas solo cuando es necesario
  const { allRankedCount, bankCount, totalCount } = useMemo(() => {
    const ranked = Object.entries(items).filter(([key]) => key !== 'bank').reduce((sum, [, list]) => sum + list.length, 0);
    const bank = items.bank.length;
    return { allRankedCount: ranked, bankCount: bank, totalCount: ranked + bank };
  }, [items]);

  const activeAnimeData = useMemo(() => {
    if (activeItem?.type !== 'Anime') return null;
    return draggedSearchResult || Object.values(items).flat().find(i => i.mal_id === activeId);
  }, [activeItem, draggedSearchResult, activeId, items]);

  // --- HANDLERS LÓGICOS ---
  
  // 1. RESIZE OPTIMIZADO Y LIMITADO
  const handleMouseDownResize = useCallback((e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const startY = e.clientY;
    const startHeight = container.getBoundingClientRect().height;
    // Límite máximo: 85% de la ventana para evitar scroll infinito
    const maxHeight = window.innerHeight * 0.85; 

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      let newHeight = startHeight + delta;

      // Restricciones: Mínimo 400px, Máximo 85% pantalla
      if (newHeight < 400) newHeight = 400;
      if (newHeight > maxHeight) newHeight = maxHeight;

      container.style.height = `${newHeight}px`;
      container.style.flex = 'none'; // Desactiva el auto-growth al redimensionar manualmente
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleColorChange = (rowId, newColorClass) => {
    setRows(prev => prev.map(row => row.id === rowId ? { ...row, color: newColorClass } : row));
  };

  const handleRenameRow = (rowId, newLabel) => {
    setRows(prev => prev.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  };

  const handleRemoveItem = (animeId) => {
    if (previewAnime?.mal_id === animeId) setPreviewAnime(null);
    setItems(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => { next[key] = next[key].filter(i => i.mal_id !== animeId); });
        return next;
    });
  };

  // Acciones del Modal
  const requestResetBoard = () => setConfirmation({
    isOpen: true, type: 'RESET', title: "⚠️ ¿REINICIAR TODO?", message: "Se borrará todo. ¡No hay vuelta atrás!", data: null
  });

  const requestDeleteTier = (tierId) => setConfirmation({
    isOpen: true, type: 'DELETE_TIER', title: "¿Eliminar Fila?", message: "Los animes volverán al banco.", data: tierId
  });

  const handleConfirmAction = () => {
    const { type, data } = confirmation;
    if (type === 'RESET') {
        localStorage.clear();
        setRows(INITIAL_ROWS);
        const resetItems = { bank: [] };
        INITIAL_ROWS.forEach(row => resetItems[row.id] = []);
        setItems(resetItems);
        setTierTitle("MI TIER LIST DE ANIME");
    } else if (type === 'DELETE_TIER' && data) {
        setItems(prev => {
            const next = { ...prev };
            next.bank = [...prev.bank, ...(prev[data] || [])];
            delete next[data];
            return next;
        });
        setRows(prev => prev.filter(r => r.id !== data));
    }
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const addNewRow = () => {
    const newId = `tier-${Date.now()}`;
    const nextColor = COLOR_POOL[(rows.length - INITIAL_ROWS.length) % COLOR_POOL.length] || COLOR_POOL[0];
    setRows([...rows, { id: newId, label: 'NEW', color: nextColor }]);
    setItems(prev => ({ ...prev, [newId]: [] }));
  };

  // Exportar Imagen
  const handleDownloadImage = async () => {
    if (!tierListRef.current) return;
    try {
      if (footerRef.current) footerRef.current.classList.remove('hidden');
      const dataUrl = await toPng(tierListRef.current, { 
          cacheBust: true, backgroundColor: '#111827', quality: 0.95, pixelRatio: 2, 
          filter: (node) => !node.hasAttribute?.('data-hide-on-export') && !node.hasAttribute?.('data-html2canvas-ignore')
      });
      const link = document.createElement('a');
      link.download = `${tierTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); alert("Error al exportar"); } 
    finally { if (footerRef.current) footerRef.current.classList.add('hidden'); }
  };

  const handleSelectAnime = (anime) => {
    if (!existingAnimeIds.has(anime.mal_id)) {
        setItems(prev => ({ ...prev, bank: [...prev.bank, anime] }));
    }
  };

  const handleHoverStart = (anime) => {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(() => setPreviewAnime(anime), 400);
  };
  const handleHoverEnd = () => {
      clearTimeout(previewTimeoutRef.current);
      setPreviewAnime(null);
  };

  // --- DRAG AND DROP ---
  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    if (active.data.current?.type === 'Row') {
      setActiveItem({ type: 'Row', data: active.data.current.row });
    } else {
      const animeData = active.data.current?.anime;
      setActiveItem({ type: 'Anime', data: animeData });
      if (active.data.current?.fromSearch) setDraggedSearchResult(animeData);
    }
    handleHoverEnd();
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggedSearchResult(null); setActiveId(null); setActiveItem(null);
    if (!over) return;

    // A. Reordenar Filas
    if (active.data.current?.type === 'Row') {
        if (active.id !== over.id) {
            setRows(r => {
                const oldIdx = r.findIndex(x => x.id === active.id);
                const newIdx = r.findIndex(x => x.id === over.id);
                return arrayMove(r, oldIdx, newIdx);
            });
        }
        return;
    }

    // B. Mover Animes
    const findContainer = (id) => (id in items) ? id : Object.keys(items).find(key => items[key].some(i => i.mal_id === id));
    const activeContainer = active.data.current?.fromSearch ? null : findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (!overContainer) return;

    // Caso 1: Soltar desde el buscador
    if (active.data.current?.fromSearch) {
        if (items[overContainer] && !existingAnimeIds.has(active.data.current.anime.mal_id)) {
            setItems(prev => ({ ...prev, [overContainer]: [...prev[overContainer], active.data.current.anime] }));
        }
        return;
    }

    // Caso 2: Mover entre contenedores existentes
    if (activeContainer && overContainer && (activeContainer !== overContainer || active.id !== over.id)) {
        setItems(prev => {
            const activeList = prev[activeContainer];
            const overList = prev[overContainer];
            const activeIndex = activeList.findIndex(i => i.mal_id === active.id);
            const overIndex = (over.id in prev) ? overList.length + 1 : overList.findIndex(i => i.mal_id === over.id);
            
            let newItems;
            if (activeContainer === overContainer) {
                newItems = { ...prev, [activeContainer]: arrayMove(activeList, activeIndex, overIndex) };
            } else {
                const newActiveList = [...activeList];
                const [moved] = newActiveList.splice(activeIndex, 1);
                const newOverList = [...overList];
                newOverList.splice(overIndex, 0, moved);
                newItems = { ...prev, [activeContainer]: newActiveList, [overContainer]: newOverList };
            }
            return newItems;
        });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
        
        {/* FONDO ANIMADO */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[100px] animate-pulse delay-1000"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation(c => ({...c, isOpen: false}))} onConfirm={handleConfirmAction} title={confirmation.title} message={confirmation.message} />

        <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <LogoIcon className="w-10 h-10 shadow-xl text-blue-500" />
                <h1 className="text-2xl font-bold tracking-tight text-gray-100 hidden sm:block font-['Outfit']">
                    Anime<span className="text-blue-500">Tier</span>Maker
                </h1>
              </div>

              <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                 <ActionButton onClick={addNewRow} tooltip="Añadir Tier" hideOnExport={true} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>} />
                 <div className="w-px h-6 bg-gray-700 mx-1"></div>
                 <ActionButton onClick={requestResetBoard} danger={true} tooltip="Reset Total" hideOnExport={true} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>} />
                 <ActionButton onClick={handleDownloadImage} tooltip="Exportar Imagen" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>} />
              </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-8 flex flex-col gap-6 relative z-10">
          
          {/* --- TIER LIST (RESIZEABLE) --- */}
          <div 
            ref={containerRef}
            className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl flex flex-col relative group transition-colors duration-300 hover:border-gray-600"
            style={{ height: 'auto', minHeight: '400px' }}
          >
              <div className="flex-1 overflow-auto custom-scrollbar p-6 pb-2">
                  <div ref={tierListRef} className="flex flex-col gap-2 bg-[#1a1d26] p-4 rounded-xl shadow-inner">
                      <input value={tierTitle} onChange={(e) => setTierTitle(e.target.value)} className="w-full bg-transparent text-center text-3xl md:text-5xl font-black text-white p-4 mb-2 outline-none border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 transition-colors uppercase placeholder-gray-600" placeholder="ESCRIBE UN TÍTULO..." maxLength={40} />

                      <div className="grid grid-cols-3 gap-4 mb-6 px-4 md:px-12" data-hide-on-export="true">
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2 flex flex-col items-center justify-center"><span className="text-xl md:text-2xl font-black text-blue-400">{totalCount}</span><span className="text-[10px] md:text-xs text-blue-300/70 uppercase tracking-wider font-bold">Total</span></div>
                          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-2 flex flex-col items-center justify-center"><span className="text-xl md:text-2xl font-black text-green-400">{allRankedCount}</span><span className="text-[10px] md:text-xs text-green-300/70 uppercase tracking-wider font-bold">Ranked</span></div>
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2 flex flex-col items-center justify-center"><span className="text-xl md:text-2xl font-black text-purple-400">{bankCount}</span><span className="text-[10px] md:text-xs text-purple-300/70 uppercase tracking-wider font-bold">Banco</span></div>
                      </div>

                      <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        {rows.map((row) => (
                            <TierRow key={row.id} row={row} items={items[row.id]} onRename={handleRenameRow} onColorChange={handleColorChange} onRemoveAnime={handleRemoveItem} onDeleteTier={requestDeleteTier} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} />
                        ))}
                      </SortableContext>
                      <div ref={footerRef} className="hidden pt-4 mt-2 border-t border-gray-800 text-center bg-[#1a1d26]"><p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Creado en <span className="text-blue-500">AnimeTierMaker</span></p></div>
                  </div>
              </div>

              {/* HANDLE DE RESIZE (Ahora con límite) */}
              <div 
                onMouseDown={handleMouseDownResize}
                className="h-6 w-full cursor-row-resize flex items-center justify-center bg-gray-900/50 hover:bg-blue-600/20 border-t border-gray-700/50 rounded-b-2xl transition-colors group-hover:border-blue-500/30"
                title="Arrastra para ajustar altura (Max 85%)"
              >
                  <div className="w-16 h-1 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors"></div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
            <div className="lg:col-span-3 bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col shadow-lg">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscador</h3>
                <AnimeSearch onSelect={handleSelectAnime} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} existingIds={existingAnimeIds} />
            </div>
            <div className="lg:col-span-9 bg-[#111827]/80 backdrop-blur rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col shadow-lg">
                <div className="flex justify-between items-center mb-2 px-2"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu Colección <span className="text-blue-500">({items.bank.length})</span></h3></div>
                <div className="flex-1 min-h-0 relative"><div className="absolute inset-0"><BankDroppable items={items.bank} onRemove={handleRemoveItem} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} /></div></div>
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-800/50 py-8 mt-auto bg-[#111827]/80 backdrop-blur-md relative z-10">
          <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()} AnimeTierMaker.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Dev</span>
              <span className="font-mono text-blue-400">GermanLaste</span>
            </div>
          </div>
        </footer>        
        
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeItem?.type === 'Anime' && activeAnimeData ? (<div className="cursor-grabbing pointer-events-none"><AnimeCard anime={activeAnimeData} isOverlay={true} /></div>) : null}
            {activeItem?.type === 'Row' ? (<div className="w-full h-24 bg-gray-800/90 border border-blue-500 rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-xl"><span className="text-2xl font-black text-white uppercase tracking-widest">{activeItem.data.label}</span></div>) : null}
        </DragOverlay>

        <CinematicPreview anime={previewAnime} />
      </div>
    </DndContext>
  );
}
export default App;