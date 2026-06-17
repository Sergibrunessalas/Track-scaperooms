import { Search, X, Tag, Star } from 'lucide-react';
import { TEMATIQUES } from '../types';

const SCORE_OPTIONS = [
  { value: '5', label: '5★ (perfecte)' },
  { value: '4', label: '4★+' },
  { value: '3', label: '3★+' },
  { value: 'amb', label: 'Amb puntuació' },
  { value: 'sense', label: 'Sense puntuació' },
];

interface StatsBarProps {
  total: number;
  valorats: number;
  pendents: number;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filterTematica: string;
  onFilterTematicaChange: (v: string) => void;
  filterPuntuacio: string;
  onFilterPuntuacioChange: (v: string) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function StatsBar({
  total,
  valorats,
  pendents,
  searchQuery,
  onSearchChange,
  filterTematica,
  onFilterTematicaChange,
  filterPuntuacio,
  onFilterPuntuacioChange,
  hasFilters,
  onClearFilters,
}: StatsBarProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">

      {/* Fila superior: stats + llegenda */}
      <div className="flex items-center gap-3">
        {/* Total */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xl md:text-3xl font-black font-montserrat text-gray-900 leading-none">{total}</span>
          <div>
            <p className="text-xs font-semibold text-gray-700 leading-tight">Total</p>
            <p className="text-xs text-gray-500 leading-tight">Escape Rooms</p>
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

        {/* Llegenda */}
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 border-2 border-white shadow-sm flex-shrink-0"
              style={{ background: '#eab308', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}
            />
            <span className="hidden sm:inline">Valorat</span>
            <span className="font-bold text-gray-700">{valorats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 border-2 border-white shadow-sm flex-shrink-0"
              style={{ background: '#dc2626', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}
            />
            <span className="hidden sm:inline">Pendent</span>
            <span className="font-bold text-gray-700">{pendents}</span>
          </div>
        </div>

        {/* Filtres — en línia en desktop, ocults aquí en mòbil */}
        <div className="hidden md:flex items-center gap-2 flex-1 min-w-0 ml-1">
          <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
          <FiltersRow
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            filterTematica={filterTematica}
            onFilterTematicaChange={onFilterTematicaChange}
            filterPuntuacio={filterPuntuacio}
            onFilterPuntuacioChange={onFilterPuntuacioChange}
            hasFilters={hasFilters}
            onClearFilters={onClearFilters}
          />
        </div>
      </div>

      {/* Fila inferior: filtres — només en mòbil */}
      <div className="flex md:hidden items-center gap-2 mt-2">
        <FiltersRow
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          filterTematica={filterTematica}
          onFilterTematicaChange={onFilterTematicaChange}
          filterPuntuacio={filterPuntuacio}
          onFilterPuntuacioChange={onFilterPuntuacioChange}
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
        />
      </div>

    </div>
  );
}

function FiltersRow({
  searchQuery, onSearchChange,
  filterTematica, onFilterTematicaChange,
  filterPuntuacio, onFilterPuntuacioChange,
  hasFilters, onClearFilters,
}: Omit<StatsBarProps, 'total' | 'valorats' | 'pendents'>) {
  return (
    <>
      <div className="relative flex-1 min-w-0">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cercar per nom…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-accent focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="relative flex-shrink-0 w-28 md:w-36">
        <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
          value={filterTematica}
          onChange={(e) => onFilterTematicaChange(e.target.value)}
          className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg appearance-none focus:outline-none focus:border-accent transition-colors ${
            filterTematica ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <option value="">Temàtica</option>
          {TEMATIQUES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="relative flex-shrink-0 w-28 md:w-36">
        <Star size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
          value={filterPuntuacio}
          onChange={(e) => onFilterPuntuacioChange(e.target.value)}
          className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg appearance-none focus:outline-none focus:border-accent transition-colors ${
            filterPuntuacio ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <option value="">Puntuació</option>
          {SCORE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-dark font-medium transition-colors flex-shrink-0"
        >
          <X size={12} />
          <span className="hidden sm:inline">Treure</span>
        </button>
      )}
    </>
  );
}
