import { Plus, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onAddRoom: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ onAddRoom, onExport, onImport }: HeaderProps) {
  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-accent text-white px-5 py-3 flex items-center shadow-lg">
      <div className="whitespace-nowrap">
        <span className="font-montserrat text-xl md:text-2xl font-black tracking-tight">
          ESCAPE ROOMS <span className="text-accent">TRACKER</span>
        </span>
        <span className="font-montserrat text-xl md:text-2xl font-black tracking-tight ml-4" style={{ color: '#eab308' }}>
          Totes les meves aventures en un sol lloc
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right hidden md:block">
          <p className="font-semibold text-sm leading-tight">Sergi Brunés Salas</p>
          <p className="text-gray-400 text-xs">📍 Lliçà de Vall, Catalunya</p>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={onExport}
            title="Exportar JSON"
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          >
            <Download size={15} />
          </button>
          <label
            title="Importar JSON"
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <Upload size={15} />
            <input type="file" accept=".json" className="hidden" onChange={onImport} />
          </label>
          <button
            onClick={onAddRoom}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg font-semibold text-sm transition-colors shadow-md"
          >
            <Plus size={15} />
            <span>Afegir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
