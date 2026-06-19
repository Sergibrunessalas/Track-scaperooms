import { ExternalLink } from 'lucide-react';
import { EscapeRoom, starsFromScore } from '../types';

interface Props {
  rooms: EscapeRoom[];
}

export default function GaleriaView({ rooms }: Props) {
  const sorted = [...rooms].sort((a, b) => {
    if (a.puntuacio !== null && b.puntuacio !== null) return b.puntuacio - a.puntuacio;
    if (a.puntuacio !== null) return -1;
    if (b.puntuacio !== null) return 1;
    return a.nom.localeCompare(b.nom, 'ca');
  });

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-black text-gray-800 mb-1 tracking-tight">
          Tots els Escape Rooms
        </h2>
        <p className="text-sm text-gray-400 mb-6">{rooms.length} sales · ordenades per puntuació</p>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">🔐</span>
          <p className="text-gray-500 font-semibold text-lg">Pròximament</p>
          <p className="text-gray-400 text-sm mt-1">Estem preparant el contingut d'aquesta secció.</p>
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room }: { room: EscapeRoom }) {
  const tems = [room.tematica1, room.tematica2].filter(Boolean);
  const stars = starsFromScore(room.puntuacio);
  const rated = room.puntuacio !== null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Foto */}
      {room.imatgeUrl ? (
        <div className="w-full h-40 overflow-hidden flex-shrink-0">
          <img
            src={room.imatgeUrl}
            alt={room.nom}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="w-full h-40 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-4xl opacity-30">🔐</span>
        </div>
      )}

      {/* Contingut */}
      <div className="p-4 flex flex-col flex-1">
        {/* Puntuació */}
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

        {/* Nom */}
        <h3 className="font-bold text-sm text-gray-900 leading-snug mb-0.5">{room.nom}</h3>

        {/* Empresa */}
        {room.empresa && (
          <p className="text-xs text-gray-500 mb-1">{room.empresa}</p>
        )}

        {/* Comarca */}
        {room.comarca && (
          <p className="text-xs text-gray-400 mb-2">📍 {room.comarca}</p>
        )}

        {/* Temàtiques */}
        {tems.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tems.map((t) => (
              <span key={t} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Descripció */}
        {room.descripcio ? (
          <p className="text-xs text-gray-600 leading-relaxed flex-1 mb-3">{room.descripcio}</p>
        ) : (
          <p className="text-xs text-gray-300 italic flex-1 mb-3">Sense descripció encara</p>
        )}

        {/* Link web */}
        {room.web && (
          <a
            href={room.web}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-dark transition-colors mt-auto"
          >
            <ExternalLink size={11} />
            Visitar web
          </a>
        )}
      </div>
    </div>
  );
}
