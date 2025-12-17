import { motion, AnimatePresence } from 'framer-motion';

export function CinematicPreview({ anime }) {
  if (!anime) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-6 left-6 z-[100] w-80 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-none"
      >
        {/* Backdrop Glow basado en el anime */}
        <div 
            className="absolute inset-0 opacity-40 blur-3xl scale-150"
            style={{ backgroundImage: `url(${anime.images.jpg.image_url})`, backgroundSize: 'cover' }}
        />
        
        <div className="relative p-0">
            <div className="h-40 w-full overflow-hidden relative">
                 <img src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </div>
            
            <div className="p-5 -mt-10 relative">
                <motion.h3 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-black text-white leading-tight mb-2 drop-shadow-lg"
                >
                    {anime.title}
                </motion.h3>
                
                <div className="flex gap-2 mb-3">
                    {anime.score && (
                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/30">
                            ★ {anime.score}
                        </span>
                    )}
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/30">
                        {anime.type || 'TV'}
                    </span>
                    {anime.year && (
                        <span className="text-gray-400 text-xs font-medium py-0.5">
                            {anime.year}
                        </span>
                    )}
                </div>

                {anime.synopsis && (
                    <p className="text-gray-300 text-xs line-clamp-3 leading-relaxed opacity-80">
                        {anime.synopsis}
                    </p>
                )}
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}