import { useState, useRef, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, // Usaremos esto para mejor detección al mover filas
  useSensor, 
  useSensors, 
  PointerSensor 
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toPng } from 'html-to-image';

import { AnimeSearch } from './components/AnimeSearch';
import { TierRow } from './components/TierRow';
import { DraggableAnime } from './components/DraggableAnime';
import { CinematicPreview } from './components/CinematicPreview';
import { AnimeCard } from './components/AnimeCard';
import { ConfirmationModal } from './components/ConfirmationModal';

// --- COLORES ---
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

function BankDroppable({ items, onRemove, onHoverStart, onHoverEnd }) {
  // El banco NO es sortable verticalmente, solo contiene items
  return (
    <SortableContext items={items.map(i => i.mal_id)} id="bank" strategy={horizontalListSortingStrategy}>
      <div className="flex flex-row flex-wrap content-start gap-4 p-4 w-full h-full overflow-y-auto custom-scrollbar bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-inner">
        {items.length === 0 && (<div className="flex flex-col items-center justify-center text-gray-500 opacity-50 w-full h-full"><p className="text-sm font-bold uppercase tracking-widest">Colección vacía</p></div>)}
        {items.map((anime) => (<div key={anime.mal_id} className="flex-shrink-0"><DraggableAnime id={anime.mal_id} anime={anime} onRemove={onRemove} onHoverStart={() => onHoverStart(anime)} onHoverEnd={onHoverEnd} /></div>))}
      </div>
    </SortableContext>
  );
}

function ActionButton({ onClick, icon, tooltip, danger = false, hideOnExport = false }) {
    return (
        <button 
            onClick={onClick}
            {...(hideOnExport ? { 'data-hide-on-export': "true" } : {})}
            className={`group relative p-2 rounded-lg transition-all ${danger ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
        >
            {icon}
            <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">{tooltip}</span>
        </button>
    );
}

function App() {
  const [tierTitle, setTierTitle] = useState(() => localStorage.getItem('tierTitle') || "MI TIER LIST DE ANIME");
  
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem('tierRows');
    return saved ? JSON.parse(saved) : INITIAL_ROWS;
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('tierItems');
    if (saved) return JSON.parse(saved);
    const initialState = { bank: [] };
    INITIAL_ROWS.forEach(row => initialState[row.id] = []);
    return initialState;
  });

  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // Para saber QUÉ estamos arrastrando (Anime o Row)
  const [draggedSearchResult, setDraggedSearchResult] = useState(null);
  const [previewAnime, setPreviewAnime] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, tierId: null });
  
  const tierListRef = useRef(null);
  const footerRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const existingAnimeIds = new Set(Object.values(items).flat().map(i => i.mal_id));

  useEffect(() => {
    localStorage.setItem('tierRows', JSON.stringify(rows));
    localStorage.setItem('tierItems', JSON.stringify(items));
    localStorage.setItem('tierTitle', tierTitle);
  }, [rows, items, tierTitle]);

  const handleColorChange = (rowId, newColorClass) => {
    setRows((prevRows) => 
      prevRows.map(row => 
        row.id === rowId ? { ...row, color: newColorClass } : row
      )
    );
  };
  
  const handleResetBoard = () => {
    if (window.confirm("¿REINICIAR TODO?")) {
        localStorage.clear();
        setRows(INITIAL_ROWS);
        const resetItems = { bank: [] };
        INITIAL_ROWS.forEach(row => resetItems[row.id] = []);
        setItems(resetItems);
        setTierTitle("MI TIER LIST DE ANIME");
    }
  };

  const requestDeleteTier = (tierId) => setDeleteModal({ isOpen: true, tierId });
  
  const confirmDeleteTier = () => {
    const { tierId } = deleteModal;
    if (!tierId) return;
    const itemsInTier = items[tierId] || [];
    setItems(prev => {
        const newItems = { ...prev };
        newItems.bank = [...prev.bank, ...itemsInTier];
        delete newItems[tierId];
        return newItems;
    });
    setRows(prev => prev.filter(row => row.id !== tierId));
  };

  const addNewRow = () => {
    const newId = `tier-${Date.now()}`;
    const nextColorIndex = (rows.length - INITIAL_ROWS.length) % COLOR_POOL.length;
    const safeIndex = nextColorIndex < 0 ? 0 : nextColorIndex;
    const nextColor = COLOR_POOL[safeIndex] || COLOR_POOL[0];
    const newRow = { id: newId, label: 'NEW', color: nextColor };
    setRows([...rows, newRow]);
    setItems(prev => ({ ...prev, [newId]: [] }));
  };

  const handleRenameRow = (rowId, newLabel) => setRows(rows.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  
  const handleRemoveItem = (animeId) => {
    if (previewAnime && previewAnime.mal_id === animeId) { setPreviewAnime(null); if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current); }
    setItems((prev) => {
        const newState = { ...prev };
        newState.bank = newState.bank.filter(i => i.mal_id !== animeId);
        Object.keys(newState).forEach(key => { if (key !== 'bank') newState[key] = newState[key].filter(i => i.mal_id !== animeId); });
        return newState;
    });
  };

  const handleHoverStart = (anime) => { if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current); previewTimeoutRef.current = setTimeout(() => { setPreviewAnime(anime); }, 400); };
  const handleHoverEnd = () => { if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current); setPreviewAnime(null); };

  const handleDownloadImage = async () => {
      if (!tierListRef.current || !footerRef.current) return;
      try {
        footerRef.current.classList.remove('hidden');
        const dataUrl = await toPng(tierListRef.current, { cacheBust: true, backgroundColor: '#111827', quality: 0.95, pixelRatio: 2, filter: (node) => node.getAttribute?.('data-hide-on-export') !== 'true' });
        const link = document.createElement('a'); link.download = `${tierTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`; link.href = dataUrl; link.click();
      } catch (error) { console.error(error); alert("Error al exportar."); } finally { if (footerRef.current) footerRef.current.classList.add('hidden'); }
  };

  const handleSelectAnime = (anime) => { const allItems = Object.values(items).flat(); if (!allItems.find((i) => i.mal_id === anime.mal_id)) setItems((prev) => ({ ...prev, bank: [...prev.bank, anime] })); };
  
  // --- DRAG START ---
  const handleDragStart = (e) => { 
      const { active } = e;
      setActiveId(active.id);
      
      // Detectar si estamos arrastrando una FILA o un ANIME
      if (active.data.current?.type === 'Row') {
          setActiveItem({ type: 'Row', data: active.data.current.row });
      } else {
          setActiveItem({ type: 'Anime', data: active.data.current?.anime || null });
          if (active.data.current?.fromSearch) setDraggedSearchResult(active.data.current.anime);
      }
      handleHoverEnd();
  };

  // --- DRAG END (LA LÓGICA IMPORTANTE) ---
  const handleDragEnd = (e) => {
    const { active, over } = e; 
    setDraggedSearchResult(null); 
    setActiveId(null); 
    setActiveItem(null);

    if (!over) return;

    // 1. REORDENAR FILAS (TIERS)
    if (active.data.current?.type === 'Row') {
        if (active.id !== over.id) {
            setRows((rows) => {
                const oldIndex = rows.findIndex(r => r.id === active.id);
                const newIndex = rows.findIndex(r => r.id === over.id);
                return arrayMove(rows, oldIndex, newIndex);
            });
        }
        return;
    }

    // 2. MOVER O REORDENAR ANIMES
    // Función auxiliar para encontrar contenedor
    const findContainer = (id) => (id in items) ? id : Object.keys(items).find((key) => items[key].find((i) => i.mal_id === id));
    const activeContainer = active.data.current?.fromSearch ? null : findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id; // Si over.id es una row, usala, sino busca su contenedor

    if (active.data.current?.fromSearch) {
        if (overContainer && items[overContainer]) {
            const anime = active.data.current.anime;
            const exists = Object.values(items).flat().find(i => i.mal_id === anime.mal_id);
            if (!exists) setItems(prev => ({ ...prev, [overContainer]: [...prev[overContainer], anime] }));
        }
        return;
    }

    if (!activeContainer || !overContainer) return;
    
    if (activeContainer !== overContainer || active.id !== over.id) {
      setItems((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.findIndex(i => i.mal_id === active.id);
        const overIndex = (over.id in prev) ? overItems.length + 1 : overItems.findIndex(i => i.mal_id === over.id);
        
        let newItems;
        if (activeContainer === overContainer) {
             newItems = { ...prev, [activeContainer]: arrayMove(activeItems, activeIndex, overIndex) };
        } else {
             let newActiveItems = [...prev[activeContainer]]; const [movedItem] = newActiveItems.splice(activeIndex, 1);
             let newOverItems = [...prev[overContainer]]; newOverItems.splice(overIndex, 0, movedItem);
             newItems = { ...prev, [activeContainer]: newActiveItems, [overContainer]: newOverItems };
        }
        return newItems;
      });
    }
  };

  const activeAnimeData = activeItem?.type === 'Anime' ? (draggedSearchResult || Object.values(items).flat().find(i => i.mal_id === activeId)) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#0b0f19] text-white pb-32 font-sans selection:bg-blue-500/30 overflow-x-hidden">
        <ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={confirmDeleteTier} title="¿Eliminar Tier?" message="Los animes volverán a tu colección." />
        <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20"></div><h1 className="text-xl font-bold tracking-tight text-gray-100 hidden sm:block">Anime<span className="text-blue-500">Tier</span>Maker</h1></div>
             <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                <ActionButton onClick={addNewRow} tooltip="Añadir Tier" hideOnExport={true} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>} />
                <div className="w-px h-6 bg-gray-700 mx-1"></div>
                <ActionButton onClick={handleResetBoard} danger={true} tooltip="Reset Total" hideOnExport={true} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>} />
                <ActionButton onClick={handleDownloadImage} tooltip="Exportar Imagen" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>} />
             </div>
          </div>
        </header>
        <main className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col gap-6">
          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div ref={tierListRef} className="flex flex-col gap-2 bg-[#1a1d26] p-4 rounded-xl">
                  <input value={tierTitle} onChange={(e) => setTierTitle(e.target.value)} className="w-full bg-transparent text-center text-3xl md:text-5xl font-black text-white p-4 mb-4 outline-none border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 transition-colors uppercase placeholder-gray-600" placeholder="ESCRIBE UN TÍTULO..." maxLength={40} />
                  
                  {/* --- AQUÍ ESTÁ LA MAGIA DEL REORDENAMIENTO DE FILAS --- */}
                  <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {rows.map((row) => (
                        <TierRow key={row.id} 
                    row={row} 
                    items={items[row.id]} 
                    onRename={handleRenameRow} 
                    onColorChange={handleColorChange}  // <--- ¡AGREGAR ESTA PROP AQUÍ!
                    onRemoveAnime={handleRemoveItem} 
                    onDeleteTier={requestDeleteTier} 
                    onHoverStart={handleHoverStart} 
                    onHoverEnd={handleHoverEnd} />
                    ))}
                  </SortableContext>
                  {/* ----------------------------------------------------- */}

                  <div ref={footerRef} className="hidden pt-4 mt-2 border-t border-gray-800 text-center bg-[#1a1d26]"><p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Creado en <span className="text-blue-500">AnimeTierMaker</span></p></div>
              </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
            <div className="lg:col-span-3 bg-[#111827] rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscador</h3><AnimeSearch onSelect={handleSelectAnime} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} existingIds={existingAnimeIds} /></div>
            <div className="lg:col-span-9 bg-[#111827] rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col"><div className="flex justify-between items-center mb-2 px-2"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu Colección <span className="text-blue-500">({items.bank.length})</span></h3></div><div className="flex-1 min-h-0 relative"><div className="absolute inset-0"><BankDroppable items={items.bank} onRemove={handleRemoveItem} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} /></div></div></div>
          </div>
        </main>
        
        {/* DRAG OVERLAY: Muestra lo que estás arrastrando (Anime o Fila) */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeItem?.type === 'Anime' && activeAnimeData ? (
                <div className="cursor-grabbing pointer-events-none"><AnimeCard anime={activeAnimeData} isOverlay={true} /></div>
            ) : null}
            {activeItem?.type === 'Row' ? (
                // Vista previa de la Fila cuando la arrastras (simplificada)
                 <div className="w-full h-24 bg-gray-800/90 border border-blue-500 rounded-xl flex items-center justify-center shadow-2xl">
                    <span className="text-xl font-bold text-white uppercase">{activeItem.data.label}</span>
                 </div>
            ) : null}
        </DragOverlay>

        <CinematicPreview anime={previewAnime} />
      </div>
    </DndContext>
  );
}
export default App;