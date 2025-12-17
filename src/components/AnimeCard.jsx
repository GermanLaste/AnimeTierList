import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function AnimeCard({ anime, isOverlay = false, onClick, onRemove, onHoverStart, onHoverEnd }) {
  // Configuración de físicas "Spring" para sentirse orgánico, no robótico
  const springConfig = { type: "spring", stiffness: 300, damping: 20 };

  return (
    <motion.div
      layoutId={isOverlay ? `anime-${anime.mal_id}` : undefined} // Magia para transiciones suaves
      className="relative group w-24 h-36 perspective-500" // perspective para 3D sutil
      initial={isOverlay ? { scale: 1.05, rotate: -2 } : { scale: 1 }}
      whileHover={isOverlay ? {} : { scale: 1.08, y: -5, zIndex: 50 }}
      transition={springConfig}
      onHoverStart={() => !isOverlay && onHoverStart && onHoverStart(anime)}
      onHoverEnd={() => !isOverlay && onHoverEnd && onHoverEnd()}
      onClick={onClick}
    >
      {/* 1. GLOW DINÁMICO (Truco de GPU) */}
      {/* Usamos la propia imagen borrosa detrás para generar el color ambiente */}
      <div 
        className="absolute inset-0 bg-cover bg-center rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ backgroundImage: `url(${anime.images.jpg.image_url})` }}
      />

      {/* 2. CONTENEDOR PRINCIPAL */}
      <motion.div
        className={twMerge(
          "relative w-full h-full rounded-xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg",
          "group-hover:border-white/40 group-hover:shadow-2xl transition-colors duration-300"
        )}
        // Animación de "Respiración" sutil cuando está idle
        animate={isOverlay ? {} : { y: [0, -2, 0] }}
        transition={{ 
            repeat: Infinity, 
            duration: 4, 
            ease: "easeInOut",
            delay: Math.random() * 2 // Desfase random para que no respiren todos a la vez
        }}
      >
        <img 
          src={anime.images.jpg.image_url} 
          alt={anime.title} 
          className="w-full h-full object-cover will-change-transform"
          draggable={false}
        />

        {/* Gradiente Cinematográfico inferior */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Título elegante (oculto por defecto, aparece sutilmente) */}
        <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
            <p className="text-[10px] font-bold text-white text-center leading-tight drop-shadow-md line-clamp-2">
                {anime.title}
            </p>
        </div>

        {/* Botón Eliminar (Microinteracción) */}
        {!isOverlay && onRemove && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.2, backgroundColor: "#ef4444" }}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 z-20 group-hover:scale-100 group-hover:opacity-100 transition-all"
                onClick={(e) => { e.stopPropagation(); onRemove(anime.mal_id); }}
                onPointerDown={(e) => e.stopPropagation()} // Vital para no activar el Drag
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}