import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import { EscapeRoom, starsFromScore } from '../types';

function launchFireworks() {
  const duration = 2200;
  const end = Date.now() + duration;
  const colors = ['#eab308', '#e8490a', '#ffffff', '#ff6535', '#fbbf24'];

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export interface MapViewHandle {
  flyToRoom: (room: EscapeRoom) => void;
}

interface MapViewProps {
  rooms: EscapeRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (room: EscapeRoom) => void;
}

function createMarkerIcon(rated: boolean, selected: boolean) {
  const color = rated ? '#eab308' : '#dc2626';
  const border = selected ? '#1a1a2e' : 'white';
  const size = selected ? 22 : 18;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${Math.round(size * 1.4)}px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2.5px solid ${border};
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, Math.round(size * 1.4)],
    iconAnchor: [size / 2, Math.round(size * 1.4)],
    popupAnchor: [0, -Math.round(size * 1.4) - 4],
  });
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildPopupHtml(room: EscapeRoom): string {
  const stars = starsFromScore(room.puntuacio);
  const scoreStr = room.puntuacio !== null ? `${room.puntuacio.toFixed(1)}/5` : null;
  const tems = [room.tematica1, room.tematica2].filter(Boolean);

  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:200px;max-width:260px">
      ${room.imatgeUrl
        ? `<img src="${esc(room.imatgeUrl)}" alt="${esc(room.nom)}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block" onerror="this.style.display='none'" />`
        : ''}
      <h3 style="font-weight:700;font-size:14px;margin:0 0 7px;color:#111827;line-height:1.3">${esc(room.nom)}</h3>
      ${scoreStr
        ? `<p style="margin:3px 0;font-size:13px;color:#e8490a;font-weight:700;letter-spacing:.5px">${stars}
            <span style="color:#6b7280;font-weight:400;font-size:12px;margin-left:4px">${scoreStr}</span></p>`
        : `<p style="margin:3px 0;font-size:12px;color:#9ca3af;font-style:italic">Pendent de valorar</p>`}
      ${room.preu ? `<p style="margin:3px 0;font-size:12px;color:#374151"><span style="display:inline-block;background:#22c55e;color:white;font-weight:700;border-radius:4px;padding:0 4px;margin-right:4px;font-size:11px;line-height:1.4">€</span>${esc(room.preu)}</p>` : ''}
      ${room.dificultat ? `<p style="margin:3px 0;font-size:12px;color:#6b7280">⚔️ ${esc(room.dificultat)}</p>` : ''}
      ${room.data ? `<p style="margin:3px 0;font-size:12px;color:#6b7280">📅 ${esc(room.data)}</p>` : ''}
      ${tems.length ? `<p style="margin:3px 0;font-size:12px;color:#6b7280">🏷️ ${tems.map(esc).join(' · ')}</p>` : ''}
      ${room.comentaris
        ? `<p style="margin:6px 0 0;font-size:11px;font-style:italic;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:5px">"${esc(room.comentaris)}"</p>`
        : ''}
      ${room.web
        ? `<a href="${esc(room.web)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:5px 10px;background:#e8490a;color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">🌐 Visitar web</a>`
        : ''}
    </div>
  `;
}

function MapInitializer({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function RoomMarker({
  room,
  selected,
  onSelect,
}: {
  room: EscapeRoom;
  selected: boolean;
  onSelect: () => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (selected && markerRef.current) {
      const t = setTimeout(() => {
        markerRef.current?.openPopup();
        if (room.puntuacio !== null && room.puntuacio >= 4.5) launchFireworks();
      }, 1100);
      return () => clearTimeout(t);
    }
  }, [selected]);

  if (!room.lat || !room.lng) return null;

  return (
    <Marker
      ref={(m) => { markerRef.current = m; }}
      position={[room.lat, room.lng]}
      icon={createMarkerIcon(room.puntuacio !== null, selected)}
      eventHandlers={{ click: onSelect }}
    >
      <Popup>
        <div dangerouslySetInnerHTML={{ __html: buildPopupHtml(room) }} />
      </Popup>
    </Marker>
  );
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { rooms, selectedRoomId, onSelectRoom },
  ref
) {
  const mapInstanceRef = useRef<L.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyToRoom: (room: EscapeRoom) => {
      if (!room.lat || !room.lng || !mapInstanceRef.current) return;
      mapInstanceRef.current.flyTo([room.lat, room.lng], 15, { animate: true, duration: 1 });
    },
  }));

  return (
    <div className="flex-1 relative" style={{ zIndex: 0 }}>
      <MapContainer
        center={[41.45, 2.12]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <MapInitializer onReady={(m) => { mapInstanceRef.current = m; }} />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        {rooms
          .filter((r) => r.lat && r.lng)
          .map((room) => (
            <RoomMarker
              key={room.id}
              room={room}
              selected={selectedRoomId === room.id}
              onSelect={() => onSelectRoom(room)}
            />
          ))}
      </MapContainer>
    </div>
  );
});

export default MapView;
