export function LogoIcon({ className = "w-10 h-10" }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
          <stop offset="100%" stopColor="#9333ea" /> {/* Purple-600 */}
        </linearGradient>
        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Fondo/Base con opacidad baja */}
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#logo-gradient)" fillOpacity="0.15" />
      
      {/* Las 3 Barras de Tiers (Estilizadas) */}
      <g filter="url(#glow-effect)">
        {/* Barra C (Base) */}
        <path d="M10 28H30C31.1 28 32 28.9 32 30V32C32 33.1 31.1 34 30 34H10C8.9 34 8 33.1 8 32V30C8 28.9 8.9 28 10 28Z" fill="url(#logo-gradient)" fillOpacity="0.6" />
        
        {/* Barra B (Medio) */}
        <path d="M10 17H30C31.1 17 32 17.9 32 19V21C32 22.1 31.1 23 30 23H10C8.9 23 8 22.1 8 21V19C8 17.9 8.9 17 10 17Z" fill="url(#logo-gradient)" fillOpacity="0.8" />
        
        {/* Barra S (Top - Más brillante y corta para dar efecto pirámide si quisieras, o igual para bloque) */}
        {/* Aquí la hago destacar más */}
        <path d="M8 6H32C33.1 6 34 6.9 34 8V12C34 13.1 33.1 14 32 14H8C6.9 14 6 13.1 6 12V8C6 6.9 6.9 6 8 6Z" fill="url(#logo-gradient)" />
      </g>
    </svg>
  );
}