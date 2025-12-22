import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableAnime } from './DraggableAnime';
import { useState, useRef, useEffect } from 'react';

// Colores disponibles (Copiar aquí para tener acceso rápido)
const PRESET_COLORS = [
  { id: 'gold', class: 'from-yellow-300 via-amber-400 to-yellow-500' },
  { id: 'red', class: 'from-red-500 to-rose-600' },
  { id: 'orange', class: 'from-orange-400 to-orange-600' },
  { id: 'lime', class: 'from-lime-400 to-green-500' },
  { id: 'green', class: 'from-emerald-400 to-teal-600' },
  { id: 'cyan', class: 'from-cyan-400 to-blue-500' },
  { id: 'blue', class: 'from-blue-600 to-indigo-600' },
  { id: 'purple', class: 'from-purple-500 to-indigo-600' },
  { id: 'pink', class: 'from-pink-500 to-fuchsia-600' },
  { id: 'gray', class: 'from-gray-400 to-gray-600' },
  { id: 'dark', class: 'from-gray-700 to-black' },
];

export function TierRow({ row, items, onRename, onColorChange, onRemoveAnime, onDeleteTier, onHoverStart, onHoverEnd }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [label, setLabel] = useState(row.label);
  const [showColorPicker, setShowColorPicker] = useState(false); // Estado para el menú de colores
  const inputRef = useRef(null);
  const colorPickerRef = useRef(null); // Para detectar clicks fuera

  // --- CONFIGURACIÓN DND-KIT ---
  const { attributes, listeners, setNodeRef: setRowNodeRef, transform, transition, isDragging } = useSortable({ 
      id: row.id, data: { type: 'Row', row }, disabled: isRenaming 
  });
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: row.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
    touchAction: 'none'
  };

  // --- LÓGICA DE RENOMBRADO ---
  useEffect(() => {
    if (isRenaming && inputRef.current) {
        inputRef.current.focus(); inputRef.current.select();
        inputRef.current.style.height = "auto"; inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [isRenaming]);

  // Cierra el selector de color si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlur = () => { setIsRenaming(false); onRename(row.id, label); };
  const handleKeyDown = (e) => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBlur(); } };
  const handleInput = (e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; setLabel(e.target.value); };

  return (
    <div ref={setRowNodeRef} style={style} className="w-full flex items-stretch mb-3 group shadow-lg rounded-xl transition-colors">
      
      {/* --- SIDEBAR IZQUIERDA (MANGO) --- */}
      <div 
          {...attributes} {...listeners}
          className={`touch-none w-24 md:w-32 flex-shrink-0 flex flex-col justify-center items-center p-2 relative bg-gradient-to-br ${row.color} border-r border-white/10 rounded-l-xl cursor-grab active:cursor-grabbing hover:brightness-110 transition-all`}
      >
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay pointer-events-none"></div>
         {isRenaming ? (
            <textarea ref={inputRef} value={label} onChange={handleInput} onBlur={handleBlur} onKeyDown={handleKeyDown} rows={1} className="w-full bg-black/30 text-white text-center text-sm font-bold outline-none resize-none rounded p-1 leading-tight overflow-hidden cursor-text" onPointerDown={(e) => e.stopPropagation()} />
         ) : (
            <div onClick={() => setIsRenaming(true)} className="w-full text-center h-full flex items-center justify-center">
                <span className="block text-white font-black uppercase tracking-tight drop-shadow-md break-words whitespace-normal text-xs md:text-sm lg:text-base leading-tight line-clamp-6 px-1 pointer-events-none">{row.label}</span>
            </div>
         )}
      </div>

      {/* --- ÁREA DE CONTENIDO --- */}
      <div className="flex-1 flex min-h-[140px] bg-gray-900/40 border-y border-r border-gray-700/30 rounded-r-xl overflow-visible relative">
          <div className="flex-1 relative flex flex-col min-w-0">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)' }}></div>
              <SortableContext items={items.map(i => i.mal_id)} id={row.id} strategy={horizontalListSortingStrategy}>
                <div ref={setDroppableNodeRef} className="flex-1 flex flex-wrap items-center content-start gap-3 p-3 z-10">
                    {items.map((anime) => (
                        <DraggableAnime key={anime.mal_id} id={anime.mal_id} anime={anime} onRemove={onRemoveAnime} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
                    ))}
                </div>
              </SortableContext>

              {/* --- BOTONES DE CONTROL (ESQUINA SUPERIOR DERECHA) --- */}
              <div 
                data-html2canvas-ignore="true" 
                className={`absolute top-2 right-2 flex gap-1 transition-opacity z-50 ${showColorPicker ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                 {/* 1. Botón Paleta de Colores */}
                 <div className="relative" ref={colorPickerRef}>
                    <button 
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`p-1.5 rounded-lg backdrop-blur-sm transition-all border ${showColorPicker ? 'bg-blue-500 text-white border-blue-400' : 'bg-gray-800/50 hover:bg-blue-500 text-gray-400 hover:text-white border-gray-600/30'}`}
                        title="Cambiar Color"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" /></svg>
                    </button>

                    {/* EL POPUP DE COLORES (Flotante) */}
                    {showColorPicker && (
                        <div className="absolute right-0 top-full mt-2 p-3 bg-[#111827]/95 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-xl w-[180px] grid grid-cols-4 gap-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => { onColorChange(row.id, color.class); setShowColorPicker(false); }}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.class} hover:scale-110 hover:ring-2 hover:ring-white transition-all shadow-md cursor-pointer`}
                                    title={color.id}
                                    aria-label={`Seleccionar color ${color.id}`} // <--- ACCESIBILIDAD AÑADIDA
                                />
                            ))}
                        </div>
                    )}
                 </div>

                 {/* 2. Botón Borrar */}
                 <button 
                    onClick={() => onDeleteTier(row.id)} 
                    onPointerDown={(e) => e.stopPropagation()}
                    className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-lg backdrop-blur-sm transition-all border border-red-500/30"
                    title="Borrar Fila"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>
          </div>
      </div>
    </div>
  );
}