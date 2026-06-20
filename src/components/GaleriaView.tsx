import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { EscapeRoom, starsFromScore } from '../types';
import type { User } from 'firebase/auth';
import AddToGrupModal from './AddToGrupModal';

interface Props {
  rooms: EscapeRoom[];
  showImages: boolean;
  user: User | null;
  onSwitchToMapa: () => void;
}

// Força Leaflet a recalcular mides un cop muntat el mapa
function AutoInvalidate() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function MiniMap({ rooms }: { rooms: EscapeRoom[] }) {
  return (
    <MapContainer
      center={[41.45, 2.12]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AutoInvalidate />
      {rooms
        .filter((r) => r.lat && r.lng)
        .map((room) => (
          <CircleMarker
            key={room.id}
            center={[room.lat!, room.lng!]}
            radius={4}
            pathOptions={{
              fillColor: room.puntuacio !== null ? '#eab308' : '#dc2626',
              color: 'white',
              weight: 1.5,
              fillOpacity: 0.9,
            }}
          />
        ))}
    </MapContainer>
  );
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

      {/* ── Cards a l'esquerra ── */}
      <div className="flex-1 overflow-y-auto sidebar-scroll bg-gray-50">
        <div className="p-5">
          <h2 className="text-xl font-black text-gray-800 mb-1 tracking-tight font-montserrat">
            Tots els Escape Rooms
          </h2>
          <p className="text-sm text-gray-400 mb-5">{rooms.length} sales · ordenades per puntuació</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((room) => (
              <RoomCard key={room.id} room={room} showImages={showImages} user={user} onAddToGrup={setAddRoom} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mini mapa a la dreta (desktop ≥ lg) ── */}
      <div
        className="hidden lg:flex flex-col border-l border-gray-200 bg-white"
        style={{ width: '280px', flexShrink: 0 }}
      >
        {/* Capçalera */}
        <div className="flex-shrink-0 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mapa</p>
          <button
            onClick={onSwitchToMapa}
            className="text-xs text-accent font-semibold hover:underline"
          >
            Veure complet →
          </button>
        </div>

        {/* Contenidor del mapa — mides explícites perquè Leaflet s'inicialitzi bé */}
        <div
          className="flex-1 relative cursor-pointer group"
          style={{ minHeight: 0 }}
          onClick={onSwitchToMapa}
          title="Obrir mapa complet"
        >
          {/* MiniMap ocupa tot l'espai del contenidor relatiu */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <MiniMap rooms={rooms} />
          </div>

          {/* Overlay hover (per sobre del mapa, no intercepta events de Leaflet) */}
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            className="flex items-end justify-center pb-4 bg-transparent group-hover:bg-black/10 transition-colors duration-200"
          >
            <span className="bg-white text-xs font-bold text-gray-700 px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              🗺 Obrir mapa complet
            </span>
          </div>
        </div>
      </div>

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
