import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function AnimeCard({ anime, isOverlay = false, onClick, onRemove, onHoverStart, onHoverEnd, showLinkIcon = false }) {
  const springConfig = { type: "spring", stiffness: 300, damping: 20 };

  return (
    <motion.div
      layoutId={isOverlay ? `anime-${anime.mal_id}` : undefined}
      className="relative group w-24 h-36 perspective-500 cursor-pointer" // cursor-pointer para indicar click
      initial={isOverlay ? { scale: 1.05, rotate: -2 } : { scale: 1 }}
      whileHover={isOverlay ? {} : { scale: 1.08, y: -5, zIndex: 50 }}
      transition={springConfig}
      onHoverStart={() => !isOverlay && onHoverStart && onHoverStart(anime)}
      onHoverEnd={() => !isOverlay && onHoverEnd && onHoverEnd()}
      onClick={onClick}
    >
      {/* Background Glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ backgroundImage: `url(${anime.images.jpg.image_url})` }}
      />

      {/* Main Card */}
      <motion.div
        className={twMerge(
          "relative w-full h-full rounded-xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg",
          "group-hover:border-white/40 group-hover:shadow-2xl transition-colors duration-300"
        )}
        animate={isOverlay ? {} : { y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: Math.random() * 2 }}
      >
        <img 
    src={anime.images.jpg.image_url} 
    alt={anime.title} 
    className="w-full h-full object-cover will-change-transform" 
    draggable={false} 
    crossOrigin="anonymous"  // <--- AGREGA ESTO: Vital para html2canvas
/>

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
            <p className="text-[10px] font-bold text-white text-center leading-tight drop-shadow-md line-clamp-2">
                {anime.title}
            </p>
        </div>

        {/* ICONO DE LINK EXTERNO (Esquina superior IZQUIERDA) */}
        {!isOverlay && showLinkIcon && (
             <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="bg-black/50 backdrop-blur-sm p-1 rounded-full text-white/80 hover:text-white border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
             </div>
        )}

        {/* BOTÓN ELIMINAR (Esquina superior DERECHA) */}
        {!isOverlay && onRemove && (
            <div 
               data-html2canvas-ignore="true"
                className="absolute -top-2 -right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()} // Vital para no activar el Drag
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onRemove(anime.mal_id); 
                }}
            >
                <div className="w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900 transform hover:scale-110 transition-transform">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
        )}
      </motion.div>
    </motion.div>
  );
}