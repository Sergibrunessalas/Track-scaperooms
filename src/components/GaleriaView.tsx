import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { EscapeRoom, starsFromScore } from '../types';
import type { User } from 'firebase/auth';
import AddToGrupModal from './AddToGrupModal';

interface Props {
  rooms: EscapeRoom[];
  showImages: boolean;
  user: User | null;
  onSwitchToMapa: () => void;
}

export default function GaleriaView({ rooms, showImages, user, onSwitchToMapa }: Props) {
  const [addRoom, setAddRoom] = useState<EscapeRoom | null>(null);

  const sorted = [...rooms].sort((a, b) => {
    if (a.puntuacio !== null && b.puntuacio !== null) return b.puntuacio - a.puntuacio;
    if (a.puntuacio !== null) return -1;
    if (b.puntuacio !== null) return 1;
    return a.nom.localeCompare(b.nom, 'ca');
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {addRoom && user && (
        <AddToGrupModal room={addRoom} user={user} onClose={() => setAddRoom(null)} />
      )}

      {/* ── Cards (màx 3 per fila) ── */}
      <div className="flex-1 overflow-y-auto sidebar-scroll bg-gray-50">
        <div className="p-5">
          <h2 className="text-xl font-black text-gray-800 mb-1 tracking-tight font-montserrat">
            Tots els Escape Rooms
          </h2>
          <p className="text-sm text-gray-400 mb-5">{rooms.length} sales · ordenades per puntuació</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((room) => (
              <RoomCard key={room.id} room={room} showImages={showImages} user={user} onAddToGrup={setAddRoom} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Columna dreta (reservada) ── */}
      <div
        className="hidden lg:block border-l border-gray-200 bg-white flex-shrink-0"
        style={{ width: '280px' }}
      />

    </div>
  );
}

function RoomCard({ room, showImages, user, onAddToGrup }: { room: EscapeRoom; showImages: boolean; user: User | null; onAddToGrup: (r: EscapeRoom) => void }) {
  const tems = [room.tematica1, room.tematica2].filter(Boolean);
  const stars = starsFromScore(room.puntuacio);
  const rated = room.puntuacio !== null;

  const Tag = room.web ? 'a' : 'div';
  const linkProps = room.web
    ? { href: room.web, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Tag
      {...linkProps}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-all duration-200 ${room.web ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : 'hover:shadow-md'}`}
    >
      <div className="w-full flex-shrink-0 bg-gray-100 relative" style={{ minHeight: '160px' }}>
        {showImages && room.imatgeUrl ? (
          <img
            src={room.imatgeUrl}
            alt={room.nom}
            className="w-full h-auto block"
            style={{ maxHeight: '280px', objectFit: 'contain' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center">
            <span className="text-4xl opacity-30">🔐</span>
          </div>
        )}
        {/* Botó afegir al grup — flotant sobre la imatge */}
        {user && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToGrup(room); }}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 hover:bg-orange-500 text-orange-500 hover:text-white shadow-md transition-all"
            title="Afegir al meu grup"
          >
            <UserPlus size={15} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          {rated ? (
            <div className="flex items-center gap-1.5">
              <span className="text-accent font-black text-lg leading-none">{room.puntuacio!.toFixed(1)}</span>
              <span className="text-yellow-400 text-xs leading-none" style={{ letterSpacing: '-1px' }}>{stars}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Pendent de valorar</span>
          )}
          {room.preu && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
              {room.preu}
            </span>
          )}
        </div>

        <h3 className="font-bold text-sm text-gray-900 leading-snug mb-0.5">{room.nom}</h3>

        {room.empresa && (
          <p className="text-xs text-gray-500 mb-1">{room.empresa}</p>
        )}

        {room.comarca && (
          <p className="text-xs text-gray-400 mb-2">📍 {room.comarca}</p>
        )}

        {tems.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tems.map((t) => (
              <span key={t} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {room.descripcio ? (
          <p className="text-xs text-gray-600 leading-relaxed flex-1">{room.descripcio}</p>
        ) : (
          <p className="text-xs text-gray-300 italic flex-1">Sense descripció encara</p>
        )}


      </div>
    </Tag>
  );
}
