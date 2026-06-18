import { useState, useRef, useCallback, useEffect } from 'react';
import { Map, List } from 'lucide-react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import MapView, { MapViewHandle } from './components/MapView';
import Sidebar from './components/Sidebar';
import RoomForm from './components/RoomForm';
import { EscapeRoom, calcPuntuacio } from './types';
import initialData from './data/escape-rooms.json';

const STORAGE_KEY = 'escape-rooms-tracker-v1';

function loadRooms(): EscapeRoom[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const rooms = JSON.parse(saved) as EscapeRoom[];
      const initial = initialData as EscapeRoom[];
      return rooms.map((room) => {
        const source = initial.find((r) => r.id === room.id);
        return {
          ...room,
          preu: room.preu || source?.preu || '',
          imatgeUrl: room.imatgeUrl || source?.imatgeUrl || '',
          web: source?.web || room.web || '',
          lat: source?.lat ?? room.lat,
          lng: source?.lng ?? room.lng,
          localitzacio: source?.localitzacio || room.localitzacio || '',
          tematica1: source?.tematica1 ?? room.tematica1,
          tematica2: source?.tematica2 ?? room.tematica2,
          decoracio2: room.decoracio2 ?? null,
          gameMaster2: room.gameMaster2 ?? null,
          proves2: room.proves2 ?? null,
          decoracio3: room.decoracio3 ?? null,
          gameMaster3: room.gameMaster3 ?? null,
          proves3: room.proves3 ?? null,
          decoracio4: room.decoracio4 ?? null,
          gameMaster4: room.gameMaster4 ?? null,
          proves4: room.proves4 ?? null,
          dificultat2: room.dificultat2 ?? '',
          dificultat3: room.dificultat3 ?? '',
          dificultat4: room.dificultat4 ?? '',
        };
      });
    }
  } catch { }
  return initialData as EscapeRoom[];
}

type FormState = 'closed' | 'new' | EscapeRoom;

export default function App() {
  const [rooms, setRooms] = useState<EscapeRoom[]>(loadRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTematica, setFilterTematica] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('closed');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  const mapRef = useRef<MapViewHandle>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  const filteredRooms = rooms.filter((room) => {
    if (searchQuery && !room.nom.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTematica && room.tematica1 !== filterTematica && room.tematica2 !== filterTematica) return false;
    return true;
  });

  const handleRoomCardClick = useCallback((room: EscapeRoom) => {
    setSelectedRoomId(room.id);
    setMobileView('map');
    if (room.lat && room.lng) {
      mapRef.current?.flyToRoom(room);
    }
  }, []);

  const handleSaveRoom = useCallback((room: EscapeRoom) => {
    const withCalc: EscapeRoom = {
      ...room,
      puntuacio: calcPuntuacio(
        room.decoracio, room.gameMaster, room.proves,
        room.decoracio2 ?? null, room.gameMaster2 ?? null, room.proves2 ?? null,
        room.decoracio3 ?? null, room.gameMaster3 ?? null, room.proves3 ?? null,
        room.decoracio4 ?? null, room.gameMaster4 ?? null, room.proves4 ?? null,
      ),
    };
    setRooms((prev) => {
      const exists = prev.some((r) => r.id === room.id);
      return exists ? prev.map((r) => (r.id === room.id ? withCalc : r)) : [...prev, withCalc];
    });
    setFormState('closed');
  }, []);

  const handleDeleteRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setFormState('closed');
    if (selectedRoomId === id) setSelectedRoomId(null);
  }, [selectedRoomId]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(rooms, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escape-rooms-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (Array.isArray(data)) {
          setRooms(data as EscapeRoom[]);
          setSelectedRoomId(null);
        } else {
          alert('Format de fitxer invàlid. Ha de ser un array JSON.');
        }
      } catch {
        alert('Error llegint el fitxer. Assegura\'t que és un JSON vàlid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasFilters = !!(searchQuery || filterTematica);
  const clearFilters = () => { setSearchQuery(''); setFilterTematica(''); };

  return (
    <div className="h-full flex flex-col font-inter bg-gray-50 overflow-hidden">
      <Header onAddRoom={() => setFormState('new')} onExport={handleExport} onImport={handleImport} />
      <StatsBar
        total={rooms.length}
        valorats={rooms.filter((r) => r.puntuacio !== null).length}
        pendents={rooms.filter((r) => r.puntuacio === null).length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTematica={filterTematica}
        onFilterTematicaChange={setFilterTematica}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />

      <div className="flex md:hidden flex-shrink-0 bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
            mobileView === 'map' ? 'text-accent border-b-2 border-accent' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Map size={15} /> Mapa
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
            mobileView === 'list' ? 'text-accent border-b-2 border-accent' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List size={15} /> Llista
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`flex-1 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          <MapView
            ref={mapRef}
            rooms={filteredRooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={(room) => setSelectedRoomId(room.id)}
          />
        </div>
        <div className={`${mobileView === 'map' ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0`}>
          <Sidebar
            rooms={filteredRooms}
            filteredCount={filteredRooms.length}
            selectedRoomId={selectedRoomId}
            onRoomClick={handleRoomCardClick}
            onEditRoom={(room) => setFormState(room)}
          />
        </div>
      </div>

      {formState !== 'closed' && (
        <RoomForm
          room={formState === 'new' ? null : formState}
          existingIds={rooms.map((r) => r.id)}
          onSave={handleSaveRoom}
          onDelete={handleDeleteRoom}
          onClose={() => setFormState('closed')}
        />
      )}
    </div>
  );
}
