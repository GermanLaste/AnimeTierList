import { useState } from 'react';
import { DndContext, DragOverlay, rectIntersection, useDroppable } from '@dnd-kit/core'; // <--- AQUÍ ESTÁ EL CAMBIO (rectIntersection)
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { AnimeSearch } from './components/AnimeSearch';
import { TierRow } from './components/TierRow';
import { DraggableAnime } from './components/DraggableAnime';

const ROWS = [
  { id: 'S', label: 'S', color: 'bg-red-500' },
  { id: 'A', label: 'A', color: 'bg-orange-500' },
  { id: 'B', label: 'B', color: 'bg-yellow-500' },
  { id: 'C', label: 'C', color: 'bg-lime-500' },
  { id: 'D', label: 'D', color: 'bg-green-500' },
];

// Componente pequeño para el Banco
function BankDroppable({ items }) {
  const { setNodeRef } = useDroppable({ id: 'bank' });

  return (
    <SortableContext items={items.map(i => i.mal_id)} id="bank">
      <div 
        ref={setNodeRef} 
        className="flex flex-wrap gap-2 min-h-[150px] bg-gray-900/50 p-3 rounded border-2 border-dashed border-gray-700"
      >
        {items.length === 0 && <p className="text-sm text-gray-500 m-auto">Busca y selecciona animes...</p>}
        {items.map((anime) => (
          <DraggableAnime key={anime.mal_id} id={anime.mal_id} anime={anime} />
        ))}
      </div>
    </SortableContext>
  );
}

function App() {
  const [items, setItems] = useState({
    bank: [],
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });

  const [activeId, setActiveId] = useState(null);

  const handleSelectAnime = (anime) => {
    const allItems = Object.values(items).flat();
    const exists = allItems.find((i) => i.mal_id === anime.mal_id);
    if (!exists) {
      setItems((prev) => ({ ...prev, bank: [...prev.bank, anime] }));
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Lógica para encontrar dónde soltaste el item
    const findContainer = (id) => {
      if (id in items) return id;
      return Object.keys(items).find((key) => items[key].find((i) => i.mal_id === id));
    };

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer || active.id !== over.id) {
      setItems((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.findIndex((i) => i.mal_id === active.id);
        const overIndex = (over.id in prev) 
            ? overItems.length + 1 
            : overItems.findIndex((i) => i.mal_id === over.id);

        let newItems;
        if (activeContainer === overContainer) {
          newItems = {
            ...prev,
            [activeContainer]: arrayMove(activeItems, activeIndex, overIndex),
          };
        } else {
          let newActiveItems = [...prev[activeContainer]];
          const [movedItem] = newActiveItems.splice(activeIndex, 1);
          let newOverItems = [...prev[overContainer]];
          newOverItems.splice(overIndex, 0, movedItem);
          newItems = {
            ...prev,
            [activeContainer]: newActiveItems,
            [overContainer]: newOverItems,
          };
        }
        return newItems;
      });
    }
    setActiveId(null);
  };

  const activeAnime = activeId ? Object.values(items).flat().find(i => i.mal_id === activeId) : null;

  return (
    // CAMBIO AQUÍ: Usamos rectIntersection en lugar de closestCorners
    <DndContext collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <header className="bg-gray-800 p-4 shadow-md border-b border-gray-700 mb-6">
          <h1 className="text-2xl font-bold text-center">Anime Tier List Maker</h1>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 flex flex-col gap-1">
            {ROWS.map((row) => (
              <TierRow key={row.id} row={row} items={items[row.id]} />
            ))}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
              <h2 className="text-lg font-bold mb-3 text-gray-300">Banco de Imágenes</h2>
              <BankDroppable items={items.bank} />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
              <AnimeSearch onSelect={handleSelectAnime} />
            </div>
          </div>

        </main>
        
        <DragOverlay>
            {activeAnime ? (
               <img 
                 src={activeAnime.images.jpg.image_url} 
                 className="w-20 h-20 object-cover rounded shadow-2xl scale-110 border-2 border-blue-500" 
               />
            ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;