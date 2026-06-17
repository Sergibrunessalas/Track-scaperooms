import { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, MoreHorizontal } from 'lucide-react';

interface HeaderProps {
  onAddRoom: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ onAddRoom, onExport, onImport }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-accent text-white px-5 py-3 flex items-center relative shadow-lg">
      {/* Títol a l'esquerra */}
      <div className="flex-shrink-0">
        <h1 className="font-montserrat text-xl md:text-2xl font-black tracking-tight leading-tight">
          ESCAPE ROOMS <span className="text-accent">TRACKER</span>
        </h1>
      </div>

      {/* Subtítol centrat absolutament - ocult en mòbil */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="font-montserrat text-xl md:text-2xl font-black tracking-tight whitespace-nowrap" style={{ color: '#eab308' }}>
          Totes les meves aventures en un sol lloc
        </p>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right hidden md:block">
          <p className="font-semibold text-sm leading-tight">Sergi Brunés Salas</p>
          <p className="text-gray-400 text-xs">📍 Lliçà de Vall, Catalunya</p>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Menú desplegable per exportar/importar */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title="Més opcions"
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => { onExport(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Download size={14} />
                  Exportar còpia de seguretat
                </button>
                <label className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer">
                  <Upload size={14} />
                  Importar còpia de seguretat
                  <input type="file" accept=".json" className="hidden" onChange={(e) => { onImport(e); setMenuOpen(false); }} />
                </label>
              </div>
            )}
          </div>

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
