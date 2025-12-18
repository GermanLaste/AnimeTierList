export function ActionButton({ onClick, icon, tooltip, danger = false, hideOnExport = false }) {
  return (
    <button 
        onClick={onClick}
        data-hide-on-export={hideOnExport}
        className={`group relative p-2 rounded-lg transition-all ${danger ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
        title={tooltip}
    >
        {icon}
        {/* Tooltip personalizado */}
        <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700 hidden md:block">
          {tooltip}
        </span>
    </button>
  );
}