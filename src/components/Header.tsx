import { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, MoreHorizontal, LogIn, LogOut } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { MainView } from './StatsBar';

interface HeaderProps {
  canEdit: boolean;
  isAdmin: boolean;
  user: User | null;
  hasMyGroups: boolean;
  mainView: MainView;
  onMainViewChange: (v: MainView) => void;
  onAddRoom: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ canEdit, isAdmin, user, hasMyGroups, mainView, onMainViewChange, onAddRoom, onLogin, onLogout, onExport, onImport }: HeaderProps) {
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

  const handleViewChange = (v: MainView) => {
    if (v === 'web' && !user) return;
    onMainViewChange(v);
  };

  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-accent text-white px-4 py-2 flex items-center relative shadow-lg">

      {/* Logo imatge + nom */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <img
          src="/logo2.png"
          alt="ScapeZone"
          className="h-11 md:h-14 w-auto object-contain flex-shrink-0"
        />
        <div>
          <h1 className="font-montserrat text-xl md:text-2xl font-black tracking-tight leading-none">
            Scape<span className="text-accent">Zone</span>
          </h1>
          <p className="font-montserrat text-[8px] md:text-[9px] font-semibold tracking-[0.2em] uppercase text-gray-400 leading-tight mt-0.5">
            Escape Room Tracker
          </p>
        </div>
      </div>

      {/* Pestanyes centrades: Web · Mapa · [Estadístiques] · [Els meus grups] · Blog */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/10 rounded-xl p-0.5">
        <button
          onClick={() => handleViewChange('galeria')}
          className={`px-2.5 md:px-3.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
            mainView === 'galeria' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
          }`}
        >
          🌐 <span className="hidden sm:inline">Web</span>
        </button>
        <button
          onClick={() => handleViewChange('mapa')}
          className={`px-2.5 md:px-3.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
            mainView === 'mapa' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
          }`}
        >
          🗺 <span className="hidden sm:inline">Mapa</span>
        </button>
        {canEdit && (
          <button
            onClick={() => handleViewChange('web')}
            className={`px-2.5 md:px-3.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
              mainView === 'web' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            📊 <span className="hidden sm:inline">Estadístiques</span>
          </button>
        )}
        {user && hasMyGroups && (
          <button
            onClick={() => handleViewChange('mygroups')}
            className={`px-2.5 md:px-3.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
              mainView === 'mygroups' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
            }`}
          >
            👥 <span className="hidden sm:inline">Els meus grups</span>
          </button>
        )}
        <button
          onClick={() => handleViewChange('blog')}
          className={`px-2.5 md:px-3.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
            mainView === 'blog' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
          }`}
        >
          ✏️ <span className="hidden sm:inline">Blog</span>
        </button>
      </div>

      {/* Botons dreta */}
      <div className="flex items-center gap-2 ml-auto">
        {user ? (
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName ?? ''} className="w-7 h-7 rounded-full border-2 border-gray-600" />
            )}
            <button
              onClick={onLogout}
              title="Tancar sessió"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            title="Iniciar sessió amb Google"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        )}

        {isAdmin && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              title="Més opcions"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
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
        )}

        {isAdmin && (
          <button
            onClick={onAddRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-lg font-semibold text-xs md:text-sm transition-colors shadow-md"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Afegir</span>
          </button>
        )}
      </div>
    </header>
  );
}
