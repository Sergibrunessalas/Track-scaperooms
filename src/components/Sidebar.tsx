import { useMemo } from 'react';
import { EscapeRoom } from '../types';
import RoomCard from './RoomCard';

interface SidebarProps {
  rooms: EscapeRoom[];
  filteredCount: number;
  selectedRoomId: string | null;
  canEdit: boolean;
  onRoomClick: (room: EscapeRoom) => void;
  onEditRoom: (room: EscapeRoom) => void;
}

export default function Sidebar({
  rooms,
  filteredCount,
  selectedRoomId,
  canEdit,
  onRoomClick,
  onEditRoom,
}: SidebarProps) {
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      if (a.puntuacio !== null && b.puntuacio !== null) return b.puntuacio - a.puntuacio;
      if (a.puntuacio !== null) return -1;
      if (b.puntuacio !== null) return 1;
      return a.nom.localeCompare(b.nom, 'ca');
    });
  }, [rooms]);

  return (
    <aside className="flex-1 flex flex-col bg-gray-50 border-l border-gray-200 overflow-hidden">
      {/* Capçalera llista */}
      <div className="flex-shrink-0 px-4 py-2 bg-white border-b border-gray-100">
        <h2 className="font-montserrat font-bold text-sm text-gray-900">
          Llista
          <span className="ml-2 text-xs font-normal text-gray-500 font-inter">
            {filteredCount} resultat{filteredCount !== 1 ? 's' : ''}
          </span>
        </h2>
      </div>

      {/* Llista de rooms */}
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
              canEdit={canEdit}
              onClick={() => onRoomClick(room)}
              onEdit={() => onEditRoom(room)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
