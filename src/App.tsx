import { useState, useRef, useCallback, useEffect } from 'react';
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
    if (saved) return JSON.parse(saved) as EscapeRoom[];
  } catch {
    // fall through to initial data
  }
  return initialData as EscapeRoom[];
}

type FormState = 'closed' | 'new' | EscapeRoom;

export default function App() {
  const [rooms, setRooms] = useState<EscapeRoom[]>(loadRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTematica, setFilterTematica] = useState('');
  const [filterPuntuacio, setFilterPuntuacio] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('closed');

  const mapRef = useRef<MapViewHandle>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  const filteredRooms = rooms.filter((room) => {
    if (searchQuery && !room.nom.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTematica && room.tematica1 !== filterTematica && room.tematica2 !== filterTematica) return false;
    if (filterPuntuacio) {
      switch (filterPuntuacio) {
        case '5':    if (room.puntuacio === null || room.puntuacio < 4.5) return false; break;
        case '4':    if (room.puntuacio === null || room.puntuacio < 4.0) return false; break;
        case '3':    if (room.puntuacio === null || room.puntuacio < 3.0) return false; break;
        case 'amb':  if (room.puntuacio === null) return false; break;
        case 'sense':if (room.puntuacio !== null) return false; break;
      }
    }
    return true;
  });

  const handleRoomCardClick = useCallback((room: EscapeRoom) => {
    setSelectedRoomId(room.id);
    if (room.lat && room.lng) {
      mapRef.current?.flyToRoom(room);
    }
  }, []);

  const handleSaveRoom = useCallback((room: EscapeRoom) => {
    const withCalc: EscapeRoom = {
      ...room,
      puntuacio: calcPuntuacio(room.decoracio, room.gameMaster, room.proves),
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

  const hasFilters = !!(searchQuery || filterTematica || filterPuntuacio);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterTematica('');
    setFilterPuntuacio('');
  };

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
          filterPuntuacio={filterPuntuacio}
          onFilterPuntuacioChange={setFilterPuntuacio}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <MapView
          ref={mapRef}
          rooms={filteredRooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(room) => setSelectedRoomId(room.id)}
        />
        <Sidebar
          rooms={filteredRooms}
          filteredCount={filteredRooms.length}
          selectedRoomId={selectedRoomId}
          onRoomClick={handleRoomCardClick}
          onEditRoom={(room) => setFormState(room)}
        />
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
