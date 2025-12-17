import { useState, useRef } from 'react';
import { DndContext, DragOverlay, rectIntersection, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas';
import { AnimeSearch } from './components/AnimeSearch';
import { TierRow } from './components/TierRow';
import { DraggableAnime } from './components/DraggableAnime';
// Agrega estos imports
import { AnimeCard } from './components/AnimeCard';
import { CinematicPreview } from './components/CinematicPreview';

const INITIAL_ROWS = [
  { id: 'S', label: 'S', color: 'bg-red-500' },
  { id: 'A', label: 'A', color: 'bg-orange-500' },
  { id: 'B', label: 'B', color: 'bg-yellow-500' },
  { id: 'C', label: 'C', color: 'bg-lime-500' },
  { id: 'D', label: 'D', color: 'bg-green-500' },
];

const COLOR_POOL = ['bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500'];

// Actualizamos BankDroppable para recibir onRemove
function BankDroppable({ items, onRemove }) {
  const { setNodeRef } = useDroppable({ id: 'bank' });
  return (
    <SortableContext items={items.map(i => i.mal_id)} id="bank">
      <div ref={setNodeRef} className="flex flex-wrap content-start gap-2 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar p-1 transition-colors">
        {items.length === 0 && (
            <div className="w-full h-40 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-sm font-medium">Arrastra animes aquí</p>
                <p className="text-xs opacity-60">o selecciónalos del buscador</p>
            </div>
        )}
        {items.map((anime) => (
          <DraggableAnime key={anime.mal_id} id={anime.mal_id} anime={anime} onRemove={onRemove} />
        ))}
      </div>
    </SortableContext>
  );
}

function App() {
  const [previewAnime, setPreviewAnime] = useState(null);
const previewTimeoutRef = useRef(null);

// Funciones para manejar el hover con un pequeño delay (debounce) para que no sea molesto
const handleAnimeHoverStart = (anime) => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
        setPreviewAnime(anime);
    }, 400); // 400ms de delay: solo muestra si el usuario se interesa de verdad
};

const handleAnimeHoverEnd = () => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    setPreviewAnime(null);
};
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

  // --- NUEVA FUNCIÓN: Eliminar item ---
  const handleRemoveItem = (animeId) => {
    setItems((prev) => {
        const newState = { ...prev };
        // Buscar y eliminar del banco
        newState.bank = newState.bank.filter(i => i.mal_id !== animeId);
        // Buscar y eliminar de todas las filas
        Object.keys(newState).forEach(key => {
            if (key !== 'bank') {
                newState[key] = newState[key].filter(i => i.mal_id !== animeId);
            }
        });
        return newState;
    });
  };
  // ------------------------------------

  const addNewRow = () => {
    const newId = `tier-${Date.now()}`;
    const randomColor = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
    const newRow = { id: newId, label: 'NEW', color: randomColor };
    setRows([...rows, newRow]);
    setItems(prev => ({ ...prev, [newId]: [] }));
  };

  const handleRenameRow = (rowId, newLabel) => {
      setRows(rows.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  }

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
      if (active.data.current?.fromSearch) {
          setDraggedSearchResult(active.data.current.anime);
      }
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
                setItems(prev => ({
                    ...prev,
                    [overContainer]: [...prev[overContainer], anime]
                }));
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
      <div className="min-h-screen bg-[#0b0f19] text-white pb-20 font-sans selection:bg-blue-500/30">
        
        <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20"></div>
                <h1 className="text-xl font-bold tracking-tight text-gray-100">Anime<span className="text-blue-500">Tier</span>Maker</h1>
             </div>
          </div>
        </header>
        
        <main className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
                
                <div ref={tierListRef} className="flex flex-col gap-3 bg-[#111827] p-4 rounded-xl">
                    <input 
                        value={tierTitle}
                        onChange={(e) => setTierTitle(e.target.value)}
                        className="w-full bg-transparent text-center text-3xl md:text-4xl font-black text-white p-2 mb-4 outline-none border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 transition-colors uppercase placeholder-gray-600"
                        placeholder="ESCRIBE UN TÍTULO..."
                        maxLength={40}
                    />

                    {rows.map((row) => (
                        <TierRow 
                            key={row.id} 
                            row={row} 
                            items={items[row.id]}
                            onRename={handleRenameRow}
                            onRemove={handleRemoveItem} // Pasamos la función
                        />
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={addNewRow} 
                    className="flex-1 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-500 text-gray-300 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="bg-gray-700 group-hover:bg-gray-600 w-6 h-6 rounded flex items-center justify-center text-sm">+</span> 
                    Añadir Nuevo Tier
                </button>
                
                <button 
                    onClick={handleDownloadImage} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar Imagen
                </button>
            </div>
          </div>
          
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 sticky top-24">
            <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-120px)]">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Buscar & Añadir</h2>
                    <AnimeSearch onSelect={handleSelectAnime} />
                </div>
                <div className="flex-1 p-4 bg-gray-900/30 flex flex-col min-h-0">
                    <div className="flex justify-between items-end mb-3">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu Colección</h2>
                        <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{items.bank.length} animes</span>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                         <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                            <BankDroppable items={items.bank} onRemove={handleRemoveItem} />
                         </div>
                    </div>
                </div>
            </div>
          </div>

        </main>
        
        {/* DragOverlay SIN el borde azul feo (ring-4 eliminado) */}
        <DragOverlay dropAnimation={{
      duration: 250,
      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Efecto rebote al soltar
}}>
    {activeAnime ? (
        <div className="cursor-grabbing">
             <AnimeCard anime={activeAnime} isOverlay={true} />
        </div>
    ) : null}
</DragOverlay>

      </div>
    </DndContext>
  );
}

export default App;