// src/components/Header.jsx
import { LogoIcon } from './LogoIcon';
import { ActionButton } from './ActionButton';

export function Header({ onAddRow, onReset, onExport }) {
  return (
    <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO Y TÍTULO */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <LogoIcon className="relative w-10 h-10 shadow-xl text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100 hidden sm:block font-['Outfit']">
            Anime<span className="text-blue-500">Tier</span>Maker
          </h1>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
          <ActionButton 
            onClick={onAddRow} 
            tooltip="Añadir Tier" 
            hideOnExport={true} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>} 
          />
          
          <div className="w-px h-6 bg-gray-700 mx-1"></div>
          
          <ActionButton 
            onClick={onReset} 
            danger={true} 
            tooltip="Reset Total" 
            hideOnExport={true} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>} 
          />
          
          <ActionButton 
            onClick={onExport} 
            tooltip="Exportar Imagen" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>} 
          />
        </div>
      </div>
    </header>
  );
}