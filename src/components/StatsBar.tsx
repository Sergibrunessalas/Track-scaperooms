import { useState, useRef, useEffect } from 'react';
import { Search, X, Tag, Building2, ChevronDown, MapPin } from 'lucide-react';

export type MainView = 'mapa' | 'web' | 'galeria' | 'blog' | 'mygroups';

export type FilterPreu = '' | '0-20' | '20-30' | '30-40' | '40+' | 'sense';

interface StatsBarProps {
  total: number;
  valorats: number;
  pendents: number;
  mainView: MainView;
  onMainViewChange: (v: MainView) => void;
  canEdit: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  searchEmpresa: string;
  onSearchEmpresaChange: (v: string) => void;
  empreses: string[];
  comarques: string[];
  tematiques: string[];
  filterTematica: string;
  onFilterTematicaChange: (v: string) => void;
  filterComarca: string;
  onFilterComarcaChange: (v: string) => void;
  filterPreu: FilterPreu;
  onFilterPreuChange: (v: FilterPreu) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function StatsBar({
  total, valorats, pendents,
  mainView, onMainViewChange, canEdit,
  searchQuery, onSearchChange,
  searchEmpresa, onSearchEmpresaChange, empreses,
  comarques, tematiques,
  filterTematica, onFilterTematicaChange,
  filterComarca, onFilterComarcaChange,
  filterPreu, onFilterPreuChange,
  hasFilters, onClearFilters,
}: StatsBarProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">

      {/* Fila superior: stats + pestanyes centrades + filtres */}
      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xl md:text-3xl font-black font-montserrat text-gray-900 leading-none">{total}</span>
          <div>
            <p className="text-xs font-semibold text-gray-700 leading-tight">Total</p>
            <p className="text-xs text-gray-500 leading-tight">Escape Rooms</p>
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-white shadow-sm flex-shrink-0"
              style={{ background: '#eab308', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }} />
            <span className="hidden sm:inline">Valorat</span>
            <span className="font-bold text-gray-700">{valorats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-white shadow-sm flex-shrink-0"
              style={{ background: '#dc2626', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }} />
            <span className="hidden sm:inline">Pendent</span>
            <span className="font-bold text-gray-700">{pendents}</span>
          </div>
        </div>

        {/* Pestanyes MAPA / ESTADÍSTIQUES — centrades absolutament */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => onMainViewChange('mapa')}
            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all uppercase tracking-wide ${
              mainView === 'mapa'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🗺 Mapa
          </button>
          {canEdit && (
            <button
              onClick={() => onMainViewChange('web')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all uppercase tracking-wide ${
                mainView === 'web'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              📊 Estadístiques
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onMainViewChange('galeria')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all uppercase tracking-wide ${
                mainView === 'galeria'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🌐 Web
            </button>
          )}
          <button
            onClick={() => onMainViewChange('blog')}
            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all uppercase tracking-wide ${
              mainView === 'blog'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ✏️ Blog
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
          <FiltersRow
            searchQuery={searchQuery} onSearchChange={onSearchChange}
            searchEmpresa={searchEmpresa} onSearchEmpresaChange={onSearchEmpresaChange} empreses={empreses}
            comarques={comarques} tematiques={tematiques}
            filterTematica={filterTematica} onFilterTematicaChange={onFilterTematicaChange}
            filterComarca={filterComarca} onFilterComarcaChange={onFilterComarcaChange}
            filterPreu={filterPreu} onFilterPreuChange={onFilterPreuChange}
            hasFilters={hasFilters} onClearFilters={onClearFilters}
          />
        </div>
      </div>

      {/* Fila inferior: filtres — només en mòbil */}
      <div className="flex md:hidden items-center gap-2 mt-2">
        <FiltersRow
          searchQuery={searchQuery} onSearchChange={onSearchChange}
          searchEmpresa={searchEmpresa} onSearchEmpresaChange={onSearchEmpresaChange} empreses={empreses}
          comarques={comarques} tematiques={tematiques}
          filterTematica={filterTematica} onFilterTematicaChange={onFilterTematicaChange}
          filterComarca={filterComarca} onFilterComarcaChange={onFilterComarcaChange}
          filterPreu={filterPreu} onFilterPreuChange={onFilterPreuChange}
          hasFilters={hasFilters} onClearFilters={onClearFilters}
        />
      </div>
    </div>
  );
}

type FilterType = 'nom' | 'comarca' | 'tematica' | 'companyia' | 'preu';
export interface FiltersRowProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  searchEmpresa: string;
  onSearchEmpresaChange: (v: string) => void;
  empreses: string[];
  comarques: string[];
  tematiques: string[];
  filterTematica: string;
  onFilterTematicaChange: (v: string) => void;
  filterComarca: string;
  onFilterComarcaChange: (v: string) => void;
  filterPreu: FilterPreu;
  onFilterPreuChange: (v: FilterPreu) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

const FILTER_OPTIONS: { type: FilterType; label: string }[] = [
  { type: 'nom', label: 'Nom' },
  { type: 'comarca', label: 'Comarca' },
  { type: 'tematica', label: 'Temàtica' },
  { type: 'companyia', label: 'Companyia' },
  { type: 'preu', label: 'Preu' },
];

const PREU_OPTIONS: { value: FilterPreu; label: string }[] = [
  { value: '0-20', label: '≤20€' },
  { value: '20-30', label: '20-30€' },
  { value: '30-40', label: '30-40€' },
  { value: '40+', label: '+40€' },
  { value: 'sense', label: 'Sense€' },
];

export function FiltersRow({
  searchQuery, onSearchChange,
  searchEmpresa, onSearchEmpresaChange, empreses,
  comarques, tematiques,
  filterTematica, onFilterTematicaChange,
  filterComarca, onFilterComarcaChange,
  filterPreu, onFilterPreuChange,
  hasFilters, onClearFilters,
}: FiltersRowProps) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(() => {
    if (searchQuery) return 'nom';
    if (searchEmpresa) return 'companyia';
    if (filterTematica) return 'tematica';
    if (filterComarca) return 'comarca';
    if (filterPreu) return 'preu';
    return null;
  });

  useEffect(() => {
    if (!hasFilters) setChooserOpen(false);
  }, [hasFilters]);

  const selectFilter = (type: FilterType) => { setActiveFilter(type); setChooserOpen(false); };

  const clearActive = () => {
    if (activeFilter === 'nom') onSearchChange('');
    else if (activeFilter === 'companyia') onSearchEmpresaChange('');
    else if (activeFilter === 'tematica') onFilterTematicaChange('');
    else if (activeFilter === 'comarca') onFilterComarcaChange('');
    else if (activeFilter === 'preu') onFilterPreuChange('');
    setActiveFilter(null);
  };

  const activeLabel = FILTER_OPTIONS.find(f => f.type === activeFilter)?.label ?? '';

  return (
    <div className="flex items-center gap-2">

      {/* Botó "Filtres" — visible quan no hi ha res obert ni actiu */}
      {!chooserOpen && !activeFilter && (
        <button
          onClick={() => setChooserOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 hover:bg-white hover:border-accent text-gray-500 hover:text-accent transition-colors"
        >
          <Search size={13} />
          <span>Filtres</span>
          <ChevronDown size={12} />
        </button>
      )}

      {/* Selector de 4 filtres */}
      {chooserOpen && !activeFilter && (
        <div className="flex items-center gap-1.5">
          {FILTER_OPTIONS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => selectFilter(type)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:border-accent hover:text-accent hover:bg-orange-50 text-gray-600 transition-colors"
            >
              {label}
            </button>
          ))}
          <button onClick={() => setChooserOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Input del filtre actiu */}
      {activeFilter && (
        <div className="flex items-center gap-2">
          <button
            onClick={clearActive}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Tancar filtre"
          >
            <X size={13} />
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex-shrink-0">{activeLabel}:</span>

          {activeFilter === 'nom' && (
            <div className="relative w-40">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar nom…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-accent bg-orange-50 rounded-lg focus:outline-none"
              />
            </div>
          )}

          {activeFilter === 'companyia' && (
            <CompanyCombobox value={searchEmpresa} onChange={onSearchEmpresaChange} empreses={empreses} />
          )}

          {activeFilter === 'tematica' && (
            <div className="relative w-36">
              <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterTematica}
                onChange={(e) => onFilterTematicaChange(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-accent bg-orange-50 rounded-lg appearance-none focus:outline-none text-accent"
              >
                <option value="">— Totes —</option>
                {tematiques.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {activeFilter === 'comarca' && (
            <ComarcaCombobox value={filterComarca} onChange={onFilterComarcaChange} comarques={comarques} />
          )}

          {activeFilter === 'preu' && (
            <div className="flex items-center gap-1">
              {PREU_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onFilterPreuChange(filterPreu === value ? '' : value)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    filterPreu === value
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function ComarcaCombobox({ value, onChange, comarques }: { value: string; onChange: (v: string) => void; comarques: string[] }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputVal(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setInputVal(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = comarques.filter((c) =>
    c.toLowerCase().includes(inputVal.toLowerCase())
  );

  const select = (comarca: string) => { onChange(comarca); setInputVal(comarca); setOpen(false); };
  const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setInputVal(''); setOpen(false); };

  return (
    <div ref={containerRef} className="relative flex-shrink-0 w-36 md:w-40">
      <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
      <input
        type="text"
        placeholder={value || "Comarca"}
        value={inputVal}
        onFocus={() => { setInputVal(''); setOpen(true); }}
        onClick={() => { setInputVal(''); setOpen(true); }}
        onChange={(e) => { setInputVal(e.target.value); setOpen(true); if (e.target.value === '') onChange(''); }}
        className={`w-full pl-7 pr-6 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-accent transition-colors cursor-pointer ${
          value ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
      />
      {value ? (
        <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
          <X size={12} />
        </button>
      ) : (
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      )}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto sidebar-scroll">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 italic">Cap resultat</p>
          ) : (
            filtered.map((comarca) => (
              <button
                key={comarca}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(comarca)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  comarca === value ? 'bg-orange-50 text-accent font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-accent'
                }`}
              >
                {comarca}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CompanyCombobox({
  value,
  onChange,
  empreses,
}: {
  value: string;
  onChange: (v: string) => void;
  empreses: string[];
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync typed text with external value
  useEffect(() => { setInputVal(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setInputVal(value); // reset to last confirmed selection
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = empreses.filter((e) =>
    e.toLowerCase().includes(inputVal.toLowerCase())
  );

  const select = (company: string) => {
    onChange(company);
    setInputVal(company);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInputVal('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-shrink-0 w-36 md:w-44">
      <Building2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
      <input
        type="text"
        placeholder={value || "Companyia"}
        value={inputVal}
        onFocus={() => { setInputVal(''); setOpen(true); }}
        onClick={() => { setInputVal(''); setOpen(true); }}
        onChange={(e) => {
          setInputVal(e.target.value);
          setOpen(true);
          if (e.target.value === '') onChange('');
        }}
        className={`w-full pl-7 pr-6 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-accent transition-colors cursor-pointer ${
          value ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
      />
      {/* Icona dreta: X si seleccionat, fletxa si buit */}
      {value ? (
        <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
          <X size={12} />
        </button>
      ) : (
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      )}

      {/* Llista desplegable */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto sidebar-scroll">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 italic">Cap resultat</p>
          ) : (
            filtered.map((company) => (
              <button
                key={company}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(company)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  company === value
                    ? 'bg-orange-50 text-accent font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-accent'
                }`}
              >
                {company}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
