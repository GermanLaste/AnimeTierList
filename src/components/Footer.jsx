// src/components/Footer.jsx
import { useState, useEffect } from 'react';

const ANIME_QUOTES = [
  "Omae wa mou shindeiru.",
  "¡El poder de la amistad no te salvará del Tier F!",
  "It's over 9000!!!",
  "Mada mada dane...",
  "Dattebayo!",
  "¿Quién demonios te crees que soy?",
  "Keikaku means plan.",
  "La gente muere cuando es asesinada...",
  "Nico Nico Nii~"
];

export function Footer() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Elige una frase aleatoria solo al montar el componente
    const randomQuote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <footer className="border-t border-gray-800/50 py-8 mt-auto bg-[#111827]/80 backdrop-blur-md relative z-10">
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
        
        {/* Lado Izquierdo: Copyright + Frase Random */}
        <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
          <span>&copy; {new Date().getFullYear()} AnimeTierMaker.</span>
          <span className="hidden md:inline text-gray-700">|</span>
          <span className="text-blue-400/80 italic font-mono">"{quote}"</span>
        </div>

        {/* Lado Derecho: Créditos */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Dev</span>
          <a 
            href="#" 
            className="font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer"
          >
            GermanLaste
          </a>
        </div>

      </div>
    </footer>
  );
}