// src/hooks/useTierList.js
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { pointerWithin, closestCenter } from '@dnd-kit/core';

// Datos iniciales constantes
const INITIAL_ROWS = [
  { id: 'S', label: 'S', color: 'from-yellow-300 via-amber-400 to-yellow-500' },
  { id: 'A', label: 'A', color: 'from-red-500 to-rose-600' },
  { id: 'B', label: 'B', color: 'from-orange-400 to-orange-600' },
  { id: 'C', label: 'C', color: 'from-emerald-400 to-teal-600' },
  { id: 'D', label: 'D', color: 'from-gray-400 to-gray-600' },
];

const COLOR_POOL = [
  'from-purple-500 to-indigo-600', 'from-cyan-400 to-blue-500', 
  'from-pink-500 to-fuchsia-600', 'from-lime-400 to-green-500', 
  'from-indigo-400 to-violet-600'
];

export function useTierList() {
  // --- 1. ESTADOS ---
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

  // Refs necesarios para lógica interna
  const containerRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  // --- 2. PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem('tierRows', JSON.stringify(rows));
    localStorage.setItem('tierItems', JSON.stringify(items));
    localStorage.setItem('tierTitle', tierTitle);
  }, [rows, items, tierTitle]);

  // --- 3. HELPERS (Conteos, Ids) ---
  const existingAnimeIds = useMemo(() => new Set(Object.values(items).flat().map(i => i.mal_id)), [items]);
  
  const stats = useMemo(() => {
    const ranked = Object.entries(items).filter(([key]) => key !== 'bank').reduce((sum, [, list]) => sum + list.length, 0);
    const bank = items.bank.length;
    return { allRankedCount: ranked, bankCount: bank, totalCount: ranked + bank };
  }, [items]);

  const activeAnimeData = useMemo(() => {
    if (activeItem?.type !== 'Anime') return null;
    return draggedSearchResult || Object.values(items).flat().find(i => i.mal_id === activeId);
  }, [activeItem, draggedSearchResult, activeId, items]);

  // --- 4. ACCIONES (Renombrar, Borrar, Añadir) ---
  const handleColorChange = (rowId, newColorClass) => {
    setRows(prev => prev.map(row => row.id === rowId ? { ...row, color: newColorClass } : row));
  };

  const handleRenameRow = (rowId, newLabel) => {
    setRows(prev => prev.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  };

  const addNewRow = () => {
    const newId = `tier-${Date.now()}`;
    const nextColor = COLOR_POOL[(rows.length - INITIAL_ROWS.length) % COLOR_POOL.length] || COLOR_POOL[0];
    setRows([...rows, { id: newId, label: 'NEW', color: nextColor }]);
    setItems(prev => ({ ...prev, [newId]: [] }));
  };

  const handleRemoveItem = (animeId) => {
    if (previewAnime?.mal_id === animeId) setPreviewAnime(null);
    setItems(prev => {
        const next = {};
        for (const key in prev) next[key] = prev[key].filter(i => i.mal_id !== animeId);
        return next;
    });
  };

  const handleSelectAnime = (anime) => {
    if (!existingAnimeIds.has(anime.mal_id)) {
        setItems(prev => ({ ...prev, bank: [...prev.bank, anime] }));
    }
  };

  const clearBoard = () => {
      localStorage.clear();
      setRows(INITIAL_ROWS);
      const resetItems = { bank: [] };
      INITIAL_ROWS.forEach(row => resetItems[row.id] = []);
      setItems(resetItems);
      setTierTitle("MI TIER LIST DE ANIME");
  };

  const deleteTier = (tierId) => {
     if (rows.length <= 1) return; // Seguridad
     setItems(prev => {
         const next = { ...prev };
         next.bank = [...prev.bank, ...(prev[tierId] || [])];
         delete next[tierId];
         return next;
     });
     setRows(prev => prev.filter(r => r.id !== tierId));
  };

  // --- 5. LÓGICA CORREGIDA PARA MÓVIL (Touch) ---
  const handleHoverStart = (anime) => {
      if (activeId) return; 
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (isTouch) return; 

      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(() => setPreviewAnime(anime), 400);
  };

  const handleHoverEnd = () => {
      clearTimeout(previewTimeoutRef.current);
      setPreviewAnime(null);
  };

  const handleResizeStart = useCallback((e) => {
    if (e.cancelable && e.type === 'touchstart') e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const isTouch = e.type === 'touchstart';
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const startHeight = container.getBoundingClientRect().height;
    
    // Evita saltos bruscos
    const maxHeight = Math.max(window.innerHeight * 0.85, startHeight); 

    const onMove = (moveEvent) => {
      const currentY = isTouch ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + (currentY - startY), 400), maxHeight);
      container.style.height = `${newHeight}px`;
      container.style.flex = 'none';
    };

    const onEnd = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
      document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onEnd);
      document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'row-resize';
    if (isTouch) {
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    } else {
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    }
  }, []);

  // --- 6. DRAG AND DROP HANDLERS ---
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

    // Lógica Rows
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

    // Lógica Items
    const findContainer = (id) => (id in items) ? id : Object.keys(items).find(key => items[key].some(i => i.mal_id === id));
    const activeContainer = active.data.current?.fromSearch ? null : findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;

    if (!overContainer) return;

    if (active.data.current?.fromSearch) {
        if (items[overContainer] && !existingAnimeIds.has(active.data.current.anime.mal_id)) {
            setItems(prev => ({ ...prev, [overContainer]: [...prev[overContainer], active.data.current.anime] }));
        }
        return;
    }

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

  const customCollisionDetection = useCallback((args) => {
    if (args.active.data.current?.type === 'Row') return closestCenter(args);
    return pointerWithin(args);
  }, []);

  // --- 7. NUEVA FUNCIÓN: CARGAR TEMPLATE EXTERNO ---
  // Esta es la pieza clave para que funcione la Galería
  const importFromTemplate = (templateData) => {
      // 1. Poner el título
      setTierTitle(templateData.title);
      
      // 2. Resetear filas a lo básico
      setRows(INITIAL_ROWS); 

      // 3. Poner todos los animes en el Banco
      const newItems = { bank: [] };
      INITIAL_ROWS.forEach(row => newItems[row.id] = []);
      
      // Extraemos solo la info del anime de la estructura de la base de datos
      if (templateData.template_items) {
          newItems.bank = templateData.template_items.map(item => item.anime_data);
      }
      
      setItems(newItems);
  };

  return {
    // Data
    tierTitle, setTierTitle, rows, items, activeId, activeItem, activeAnimeData,
    previewAnime, stats, existingAnimeIds, containerRef,
    // Actions
    addNewRow, handleRenameRow, handleColorChange, handleRemoveItem, handleSelectAnime,
    clearBoard, deleteTier, importFromTemplate, // <--- EXPORTAMOS LA NUEVA FUNCIÓN
    // Events
    handleResizeStart, handleHoverStart, handleHoverEnd, 
    handleDragStart, handleDragEnd, customCollisionDetection
  };
}