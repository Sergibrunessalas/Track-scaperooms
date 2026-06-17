import { Pencil } from 'lucide-react';
import { EscapeRoom, starsFromScore } from '../types';

interface RoomCardProps {
  room: EscapeRoom;
  rank: number;
  selected: boolean;
  onClick: () => void;
  onEdit: () => void;
}

export default function RoomCard({ room, rank, selected, onClick, onEdit }: RoomCardProps) {
  const tems = [room.tematica1, room.tematica2].filter(Boolean);
  const stars = starsFromScore(room.puntuacio);
  const rated = room.puntuacio !== null;

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-150 ${
        selected
          ? 'border-accent bg-orange-50 shadow-md'
          : 'border-transparent bg-white hover:border-accent/30 hover:shadow-sm'
      }`}
    >
      {/* Rank badge */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          rated
            ? 'bg-accent text-white'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        #{rank}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{room.nom}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {room.data && (
            <span className="text-xs text-gray-400">{room.data}</span>
          )}
          {room.preu && (
            <span className="text-xs text-green-600 font-medium">💶 {room.preu}</span>
          )}
          {tems.map((t) => (
            <span
              key={t}
              className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        {rated ? (
          <>
            <p className="text-accent font-bold text-sm leading-tight">{room.puntuacio!.toFixed(1)}</p>
            <p className="text-accent text-xs leading-tight" style={{ letterSpacing: '-1px' }}>
              {stars}
            </p>
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">Pendent</span>
        )}
      </div>

      {/* Edit button (appears on hover/selected) */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
          selected
            ? 'text-accent bg-accent/10 opacity-100'
            : 'text-gray-400 hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100'
        }`}
        title="Editar"
      >
        <Pencil size={13} />
      </button>
    </div>
  );
}
