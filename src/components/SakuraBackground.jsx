import { useEffect, useState } from 'react';

export function SakuraBackground() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Generamos 30 pétalos con propiedades aleatorias
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%', // Posición horizontal
      animationDuration: Math.random() * 5 + 10 + 's', // Entre 10 y 15 segundos
      animationDelay: Math.random() * 5 + 's', // Retraso inicial
      opacity: Math.random() * 0.5 + 0.3, // Transparencia
      size: Math.random() * 10 + 10 + 'px', // Tamaño
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-[-10%] bg-pink-400/60 rounded-tl-xl rounded-br-xl blur-[1px]"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
            animation: `sakura-fall ${petal.animationDuration} linear infinite`,
            animationDelay: petal.animationDelay,
          }}
        />
      ))}
    </div>
  );
}