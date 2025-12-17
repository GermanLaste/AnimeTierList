export function TierList({ rows }) {
  return (
    <div className="flex flex-col gap-1 bg-black p-1 rounded">
      {rows.map((row) => (
        <div key={row.id} className="flex w-full min-h-[100px]">
          
          {/* Caabecera de la fila (Label S, A, B...) */}
          <div 
            className={`${row.color} w-24 flex items-center justify-center border-r-2 border-black`}
          >
            <span className="text-2xl font-bold text-black">{row.label}</span>
          </div>

          {/* Área de contenido (Drop Zone) - Por ahora vacía */}
          <div className="flex-1 bg-gray-800 flex flex-wrap gap-2 p-2 items-center border-b border-gray-900">
             {/* Aquí irán las imágenes más adelante */}
          </div>
          
        </div>
      ))}
    </div>
  );
}