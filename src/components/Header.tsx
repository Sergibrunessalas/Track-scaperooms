import { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, MoreHorizontal, LogIn, LogOut, SlidersHorizontal, Mail } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { MainView, FiltersRowProps } from './StatsBar';
import { FiltersRow } from './StatsBar';

interface HeaderProps extends FiltersRowProps {
  canEdit: boolean;
  isAdmin: boolean;
  isGastos: boolean;
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

export default function Header({
  canEdit, isAdmin, isGastos, user, hasMyGroups, mainView, onMainViewChange,
  onAddRoom, onLogin, onLogout, onExport, onImport,
  // filter props
  searchQuery, onSearchChange,
  searchEmpresa, onSearchEmpresaChange, empreses,
  comarques, tematiques,
  filterTematica, onFilterTematicaChange,
  filterComarca, onFilterComarcaChange,
  filterPreu, onFilterPreuChange,
  hasFilters, onClearFilters,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const activeCount = [searchQuery, searchEmpresa, filterTematica, filterComarca, filterPreu].filter(Boolean).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFiltersOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewChange = (v: MainView) => {
    if (v === 'web' && !user) return;
    onMainViewChange(v);
  };

  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-accent text-white px-4 py-2 flex items-center relative shadow-lg">

      {/* Logo imatge + nom + xarxes */}
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

        {/* Icones Instagram + Email */}
        <div className="flex items-center gap-1.5 ml-1">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/Scapezonegamers/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram @Scapezonegamers"
            className="p-1.5 rounded-lg text-gray-400 hover:text-accent transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:info.scpzone@gmail.com"
            title="Contacta amb nosaltres"
            className="p-1.5 rounded-lg text-gray-400 hover:text-accent transition-colors"
          >
            <Mail size={15} />
          </a>
        </div>
      </div>

      {/* Pestanyes centrades */}
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
        {user && (
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
        <button
          onClick={() => handleViewChange('uneixte')}
          className={`px-2.5 md:px-3.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
            mainView === 'uneixte' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
          }`}
        >
          🚀 <span className="hidden sm:inline">Uneix-te</span>
        </button>
      </div>

      {/* Botons dreta */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Botó Gastos — només visible pels 4 usuaris autoritzats */}
        {isGastos && (
          <button
            onClick={() => onMainViewChange(mainView === 'gastos' ? 'galeria' : 'gastos')}
            title="Gastos del grup"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mainView === 'gastos'
                ? 'bg-accent text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white'
            }`}
          >
            💰 <span className="hidden sm:inline">Gastos</span>
          </button>
        )}

        {/* Botó filtres global */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFiltersOpen(o => !o)}
            title="Filtres"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              filtersOpen || hasFilters
                ? 'bg-accent text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtres</span>
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-accent text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {activeCount}
              </span>
            )}
          </button>

          {/* Panel de filtres desplegable */}
          {filtersOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 min-w-max">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtres</p>
                {hasFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-xs text-accent hover:text-accent-light transition-colors font-medium"
                  >
                    Netejar tot
                  </button>
                )}
              </div>
              <FiltersRow
                searchQuery={searchQuery} onSearchChange={onSearchChange}
                searchEmpresa={searchEmpresa} onSearchEmpresaChange={onSearchEmpresaChange}
                empreses={empreses} comarques={comarques} tematiques={tematiques}
                filterTematica={filterTematica} onFilterTematicaChange={onFilterTematicaChange}
                filterComarca={filterComarca} onFilterComarcaChange={onFilterComarcaChange}
                filterPreu={filterPreu} onFilterPreuChange={onFilterPreuChange}
                hasFilters={hasFilters} onClearFilters={onClearFilters}
                dark
                defaultOpen
                onDismiss={() => setFiltersOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Login / Logout */}
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

        {/* Menú admin */}
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
