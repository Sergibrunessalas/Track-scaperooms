import { useMemo } from 'react';
import { Search, X, Tag, Star, Users } from 'lucide-react';
import { EscapeRoom, TEMATIQUES } from '../types';
import RoomCard from './RoomCard';

interface SidebarProps {
  rooms: EscapeRoom[];
  allRooms: EscapeRoom[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filterTematica: string;
  onFilterTematicaChange: (v: string) => void;
  filterPuntuacio: string;
  onFilterPuntuacioChange: (v: string) => void;
  filterParticipant: string;
  onFilterParticipantChange: (v: string) => void;
  selectedRoomId: string | null;
  onRoomClick: (room: EscapeRoom) => void;
  onEditRoom: (room: EscapeRoom) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

const SCORE_OPTIONS = [
  { value: '5', label: '5★ (perfecte)' },
  { value: '4', label: '4★+' },
  { value: '3', label: '3★+' },
  { value: 'amb', label: 'Amb puntuació' },
  { value: 'sense', label: 'Sense puntuació' },
];

export default function Sidebar({
  rooms,
  allRooms,
  searchQuery,
  onSearchChange,
  filterTematica,
  onFilterTematicaChange,
  filterPuntuacio,
  onFilterPuntuacioChange,
  filterParticipant,
  onFilterParticipantChange,
  selectedRoomId,
  onRoomClick,
  onEditRoom,
  hasFilters,
  onClearFilters,
}: SidebarProps) {
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      if (a.puntuacio !== null && b.puntuacio !== null) return b.puntuacio - a.puntuacio;
      if (a.puntuacio !== null) return -1;
      if (b.puntuacio !== null) return 1;
      return a.nom.localeCompare(b.nom, 'ca');
    });
  }, [rooms]);

  const allParticipants = useMemo(() => {
    const set = new Set<string>();
    allRooms.forEach((r) =>
      r.participants
        .split(' ')
        .filter(Boolean)
        .forEach((p) => set.add(p))
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ca'));
  }, [allRooms]);

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-gray-50 border-l border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-montserrat font-bold text-base text-gray-900">
            Llista
            <span className="ml-2 text-xs font-normal text-gray-500 font-inter">
              {rooms.length} resultat{rooms.length !== 1 ? 's' : ''}
            </span>
          </h2>
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent-dark font-medium transition-colors"
            >
              <X size={12} />
              Treure filtres
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cercar per nom…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-accent focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2">
          {/* Temàtica */}
          <div className="relative">
            <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterTematica}
              onChange={(e) => onFilterTematicaChange(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg appearance-none focus:outline-none focus:border-accent transition-colors ${
                filterTematica ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <option value="">🏷️ Totes les temàtiques</option>
              {TEMATIQUES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Puntuació */}
          <div className="relative">
            <Star size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterPuntuacio}
              onChange={(e) => onFilterPuntuacioChange(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg appearance-none focus:outline-none focus:border-accent transition-colors ${
                filterPuntuacio ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <option value="">⭐ Qualsevol puntuació</option>
              {SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Participants */}
          <div className="relative">
            <Users size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterParticipant}
              onChange={(e) => onFilterParticipantChange(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg appearance-none focus:outline-none focus:border-accent transition-colors ${
                filterParticipant ? 'border-accent bg-orange-50 text-accent' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <option value="">👥 Tots els participants</option>
              {allParticipants.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto sidebar-scroll p-3 space-y-1.5">
        {sortedRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-medium">Cap escape room trobat</p>
            <p className="text-xs mt-1">amb aquests filtres</p>
          </div>
        ) : (
          sortedRooms.map((room, idx) => (
            <RoomCard
              key={room.id}
              room={room}
              rank={idx + 1}
              selected={selectedRoomId === room.id}
              onClick={() => onRoomClick(room)}
              onEdit={() => onEditRoom(room)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
