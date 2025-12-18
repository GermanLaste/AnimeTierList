import { useMemo } from 'react';

export function TokyoCity() {
  const buildings = useMemo(() => {
    // Generamos las capas de edificios (igual que antes, pero ajustando densidades)
    
    // Capa 1: Fondo (Siluetas oscuras)
    const backLayer = Array.from({ length: 10 }).map((_, i) => ({
      width: Math.random() * 10 + 8 + '%',
      height: Math.random() * 40 + 30 + '%',
      left: Math.random() * 100 + '%',
      color: '#1a0b2e', 
      zIndex: 1
    }));

    // Capa 2: Medio
    const midLayer = Array.from({ length: 12 }).map((_, i) => ({
      width: Math.random() * 8 + 6 + '%',
      height: Math.random() * 50 + 20 + '%',
      left: Math.random() * 100 + '%',
      color: '#240d3e', 
      zIndex: 2,
      hasWindows: true
    }));

    // Capa 3: Frente (Los más cercanos)
    const frontLayer = Array.from({ length: 6 }).map((_, i) => ({
      width: Math.random() * 15 + 10 + '%',
      height: Math.random() * 60 + 25 + '%',
      left: i * 18 + '%', 
      color: '#0f0314', 
      zIndex: 3,
      hasWindows: true
    }));

    return { backLayer, midLayer, frontLayer };
  }, []);

  // OPTIMIZACIÓN: Renderizado de ventanas más ligero
  const renderWindows = (heightPct) => {
    // Reducimos un poco la cantidad máxima de ventanas por edificio (Max 8 en vez de 15)
    // Esto reduce el DOM total drásticamente sin perder el "look"
    const windowCount = Math.floor(Math.random() * 8) + 3; 

    return Array.from({ length: windowCount }).map((_, i) => {
      const topPos = Math.random() * 90 + 5 + '%'; 
      const leftPos = Math.random() * 70 + 15 + '%';
      // Duración aleatoria para que no parpadeen todos igual
      const duration = Math.random() * 4 + 2 + 's';
      
      return (
        <div 
          key={i}
          className="absolute w-1.5 h-2 bg-yellow-100 rounded-[1px]"
          style={{
            top: topPos,
            left: leftPos,
            // LA CLAVE: Sombra fija (barata), Opacidad animada (barata)
            boxShadow: '0 0 6px rgba(253,224,71,0.6)', 
            animation: `simple-flicker ${duration} infinite alternate`,
            willChange: 'opacity' // Optimización de GPU
          }}
        />
      );
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 h-screen pointer-events-none z-0 overflow-hidden">
        {/* Definimos la animación aquí mismo */}
        <style>{`
          @keyframes simple-flicker {
            0% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}</style>

        {[...buildings.backLayer, ...buildings.midLayer, ...buildings.frontLayer].map((b, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-t-md"
            style={{
              left: b.left,
              width: b.width,
              height: b.height,
              backgroundColor: b.color,
              zIndex: b.zIndex,
              // Sombra estática solo en los del frente
              boxShadow: b.zIndex === 3 ? '0 0 40px rgba(0,0,0,0.6)' : 'none' 
            }}
          >
            {/* Balizas rojas (reducidas a solo CSS puro sin sombras animadas pesadas) */}
            {parseInt(b.height) > 60 && (
               <div 
                 className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"
                 style={{ 
                   boxShadow: '0 0 8px red',
                   animation: 'simple-flicker 1s infinite alternate' 
                 }}
               />
            )}
            
            {b.hasWindows && renderWindows(b.height)}
          </div>
        ))}
        
        {/* Degradado inferior */}
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black via-[#110518]/50 to-transparent z-10"></div>
    </div>
  );
}