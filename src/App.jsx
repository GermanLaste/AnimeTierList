import { useState, useRef } from 'react';
import { DndContext, DragOverlay, rectIntersection, useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas';
import { AnimeSearch } from './components/AnimeSearch';
import { TierRow } from './components/TierRow';
import { DraggableAnime } from './components/DraggableAnime';
import { CinematicPreview } from './components/CinematicPreview';
import { AnimeCard } from './components/AnimeCard';
import { ConfirmationModal } from './components/ConfirmationModal';

const INITIAL_ROWS = [
  { id: 'S', label: 'S', color: 'bg-red-500' },
  { id: 'A', label: 'A', color: 'bg-orange-500' },
  { id: 'B', label: 'B', color: 'bg-yellow-500' },
  { id: 'C', label: 'C', color: 'bg-lime-500' },
  { id: 'D', label: 'D', color: 'bg-green-500' },
];

const COLOR_POOL = [
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
  'bg-teal-500', 'bg-cyan-500', 'bg-rose-500', 
  'bg-emerald-500', 'bg-amber-500', 'bg-fuchsia-500'
];

// --- BANCO HORIZONTAL ---
function BankDroppable({ items, onRemove, onHoverStart, onHoverEnd }) {
  const { setNodeRef } = useDroppable({ id: 'bank' });
  
  return (
    <SortableContext items={items.map(i => i.mal_id)} id="bank" strategy={horizontalListSortingStrategy}>
      <div 
        ref={setNodeRef} 
        className="flex flex-row flex-wrap content-start gap-4 p-4 w-full h-full overflow-y-auto custom-scrollbar bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-inner"
      >
        {items.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-500 opacity-50 w-full h-full">
                <p className="text-sm font-bold uppercase tracking-widest">Colección vacía</p>
            </div>
        )}
        
        {items.map((anime) => (
          <div key={anime.mal_id} className="flex-shrink-0"> 
             <DraggableAnime 
                id={anime.mal_id} 
                anime={anime} 
                onRemove={onRemove}
                onHoverStart={() => onHoverStart(anime)} 
                onHoverEnd={onHoverEnd}
             />
          </div>
        ))}
      </div>
    </SortableContext>
  );
}

// --- COMPONENTE DE BOTÓN DE ACCIÓN (Toolbar Icon) ---
function ActionButton({ onClick, icon, tooltip, danger = false }) {
    return (
        <button 
            onClick={onClick}
            className={`group relative p-2 rounded-lg transition-all ${
                danger 
                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                : 'hover:bg-gray-700 text-gray-400 hover:text-white'
            }`}
        >
            {icon}
            {/* Tooltip simple */}
            <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
                {tooltip}
            </span>
        </button>
    );
}

function App() {
  const [tierTitle, setTierTitle] = useState("MI TIER LIST DE ANIME");
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [items, setItems] = useState(() => {
      const initialState = { bank: [] };
      rows.forEach(row => initialState[row.id] = []);
      return initialState;
  });
  
  const [activeId, setActiveId] = useState(null);
  const [draggedSearchResult, setDraggedSearchResult] = useState(null);
  const tierListRef = useRef(null);

  const [previewAnime, setPreviewAnime] = useState(null);
  const previewTimeoutRef = useRef(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, tierId: null });
  const existingAnimeIds = new Set(Object.values(items).flat().map(i => i.mal_id));
  // --- LÓGICA ---
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

  const handleClearBoard = () => {
    if (window.confirm("¿Seguro que quieres borrar TODOS los animes?")) {
        setItems(prev => {
            const resetItems = { bank: [] };
            rows.forEach(row => resetItems[row.id] = []);
            return resetItems;
        });
    }
  };

  const addNewRow = () => {
    const newId = `tier-${Date.now()}`;
    const nextColorIndex = rows.length % COLOR_POOL.length;
    const nextColor = COLOR_POOL[nextColorIndex];
    const newRow = { id: newId, label: 'NEW', color: nextColor };
    setRows([...rows, newRow]);
    setItems(prev => ({ ...prev, [newId]: [] }));
  };

  const handleRenameRow = (rowId, newLabel) => {
      setRows(rows.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  }

  const handleRemoveItem = (animeId) => {
    setItems((prev) => {
        const newState = { ...prev };
        newState.bank = newState.bank.filter(i => i.mal_id !== animeId);
        Object.keys(newState).forEach(key => {
            if (key !== 'bank') {
                newState[key] = newState[key].filter(i => i.mal_id !== animeId);
            }
        });
        return newState;
    });
  };

  const handleHoverStart = (anime) => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => { setPreviewAnime(anime); }, 400); 
  };

  const handleHoverEnd = () => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    setPreviewAnime(null);
  };

  const handleDownloadImage = async () => {
      if (!tierListRef.current) return;
      const canvas = await html2canvas(tierListRef.current, { useCORS: true, scale: 2, backgroundColor: '#111827' });
      const link = document.createElement('a');
      link.download = `${tierTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
  };

  const handleSelectAnime = (anime) => {
    const allItems = Object.values(items).flat();
    if (!allItems.find((i) => i.mal_id === anime.mal_id)) {
      setItems((prev) => ({ ...prev, bank: [...prev.bank, anime] }));
    }
  };

  const handleDragStart = (event) => {
      const { active } = event;
      setActiveId(active.id);
      if (active.data.current?.fromSearch) setDraggedSearchResult(active.data.current.anime);
      handleHoverEnd();
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedSearchResult(null); 
    setActiveId(null);

    if (!over) return;

    if (active.data.current?.fromSearch) {
        const anime = active.data.current.anime;
        const findContainer = (id) => (id in items) ? id : Object.keys(items).find((key) => items[key].find((i) => i.mal_id === id));
        const overContainer = findContainer(over.id) || over.id;

        if (overContainer && items[overContainer]) {
            const allItems = Object.values(items).flat();
            const exists = allItems.find(i => i.mal_id === anime.mal_id);
            if (!exists) {
                setItems(prev => ({ ...prev, [overContainer]: [...prev[overContainer], anime] }));
            }
        }
        return;
    }

    const findContainer = (id) => (id in items) ? id : Object.keys(items).find((key) => items[key].find((i) => i.mal_id === id));
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;
    
    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer || active.id !== over.id) {
      setItems((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.findIndex((i) => i.mal_id === active.id);
        const overIndex = (over.id in prev) ? overItems.length + 1 : overItems.findIndex((i) => i.mal_id === over.id);
        
        let newItems;
        if (activeContainer === overContainer) {
          newItems = { ...prev, [activeContainer]: arrayMove(activeItems, activeIndex, overIndex) };
        } else {
          let newActiveItems = [...prev[activeContainer]];
          const [movedItem] = newActiveItems.splice(activeIndex, 1);
          let newOverItems = [...prev[overContainer]];
          newOverItems.splice(overIndex, 0, movedItem);
          newItems = { ...prev, [activeContainer]: newActiveItems, [overContainer]: newOverItems };
        }
        return newItems;
      });
    }
  };

  const activeAnime = draggedSearchResult 
    ? draggedSearchResult 
    : (activeId ? Object.values(items).flat().find(i => i.mal_id === activeId) : null);

  return (
    <DndContext collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#0b0f19] text-white pb-32 font-sans selection:bg-blue-500/30 overflow-x-hidden">
        
        <ConfirmationModal 
            isOpen={deleteModal.isOpen} 
            onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            onConfirm={confirmDeleteTier}
            title="¿Eliminar Tier?"
            message="Los animes volverán a tu colección."
        />

        {/* HEADER: AHORA CONTIENE LOS BOTONES DE ACCIÓN */}
        <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
             {/* LOGO */}
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20"></div>
                <h1 className="text-xl font-bold tracking-tight text-gray-100 hidden sm:block">Anime<span className="text-blue-500">Tier</span>Maker</h1>
             </div>

             {/* TOOLBAR DE ACCIONES (Minimalista) */}
             <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                <ActionButton 
                    onClick={addNewRow} 
                    tooltip="Añadir Tier"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>}
                />
                <div className="w-px h-6 bg-gray-700 mx-1"></div> {/* Separador */}
                <ActionButton 
                    onClick={handleClearBoard} 
                    danger={true}
                    tooltip="Limpiar Todo"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                />
                <ActionButton 
                    onClick={handleDownloadImage} 
                    tooltip="Exportar Imagen"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                />
             </div>
          </div>
        </header>
        
        <main className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col gap-6">
          
          {/* 1. TIER LIST (Ahora es el protagonista absoluto) */}
          <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div ref={tierListRef} className="flex flex-col gap-3 bg-[#111827] p-4 rounded-xl">
                  <input 
                      value={tierTitle}
                      onChange={(e) => setTierTitle(e.target.value)}
                      className="w-full bg-transparent text-center text-3xl md:text-5xl font-black text-white p-4 mb-4 outline-none border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 transition-colors uppercase placeholder-gray-600"
                      placeholder="ESCRIBE UN TÍTULO..."
                      maxLength={40}
                  />

                  {rows.map((row) => (
                      <TierRow 
                          key={row.id} 
                          row={row} 
                          items={items[row.id]}
                          onRename={handleRenameRow}
                          onRemoveAnime={handleRemoveItem}
                          onDeleteTier={requestDeleteTier}
                          onHoverStart={handleHoverStart}
                          onHoverEnd={handleHoverEnd}
                      />
                  ))}
              </div>
          </div>

          {/* 2. ZONA DE BÚSQUEDA Y COLECCIÓN (Expandida Verticalmente) */}
          {/* Se aumentó la altura a h-[500px] para que el buscador sea cómodo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
            
            {/* BUSCADOR */}
            <div className="lg:col-span-3 bg-[#111827] rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscador</h3>
                 <AnimeSearch 
                      onSelect={handleSelectAnime} 
                      onHoverStart={handleHoverStart}
                      onHoverEnd={handleHoverEnd}
                      existingIds={existingAnimeIds}
                  />
            </div>

            {/* BANCO (Tu Colección) */}
            <div className="lg:col-span-9 bg-[#111827] rounded-xl border border-gray-800 p-4 h-[500px] flex flex-col">
                 <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tu Colección <span className="text-blue-500">({items.bank.length})</span>
                    </h3>
                 </div>
                 
                 <div className="flex-1 min-h-0 relative">
                     <div className="absolute inset-0">
                        {/* NOTA: En el paso anterior lo hicimos horizontal "overflow-x".
                            Si prefieres que sea un grid grande (más cómodo para ver muchos),
                            cambia BankDroppable a "flex-wrap".
                            Aquí mantengo "flex-wrap" dentro de un contenedor alto para que se vean todos.
                        */}
                        <BankDroppable 
                            items={items.bank} 
                            onRemove={handleRemoveItem}
                            onHoverStart={handleHoverStart}
                            onHoverEnd={handleHoverEnd}
                        />
                     </div>
                 </div>
            </div>

          </div>

        </main>
        
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeAnime ? (
                <div className="cursor-grabbing pointer-events-none">
                     <AnimeCard anime={activeAnime} isOverlay={true} />
                </div>
            ) : null}
        </DragOverlay>

        <CinematicPreview anime={previewAnime} />
      </div>
    </DndContext>
  );
}

export default App;