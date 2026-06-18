import { useState, useRef, useCallback, useEffect } from 'react';
import { Map, List } from 'lucide-react';
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, getDocs, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import MapView, { MapViewHandle } from './components/MapView';
import Sidebar from './components/Sidebar';
import RoomForm from './components/RoomForm';
import { EscapeRoom, calcPuntuacio } from './types';
import initialData from './data/escape-rooms.json';

const ROOMS_COL = 'rooms';

export default function App() {
  const [rooms, setRooms] = useState<EscapeRoom[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTematica, setFilterTematica] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [formState, setFormState] = useState<'closed' | 'new' | EscapeRoom>('closed');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  const mapRef = useRef<MapViewHandle>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function init() {
      // Si la col·lecció és buida, la populem amb les dades del JSON
      const snap = await getDocs(collection(db, ROOMS_COL));
      if (snap.empty) {
        const batch = writeBatch(db);
        (initialData as EscapeRoom[]).forEach((room) => {
          batch.set(doc(db, ROOMS_COL, room.id), room);
        });
        await batch.commit();
      }

      // Escolta canvis en temps real — qualsevol usuari que editi ho veu tothom
      unsub = onSnapshot(collection(db, ROOMS_COL), (snapshot) => {
        const data = snapshot.docs
          .map((d) => d.data() as EscapeRoom)
          .sort((a, b) => a.id.localeCompare(b.id));
        setRooms(data);
        setDbReady(true);
      });
    }

    init().catch(console.error);
    return () => { unsub?.(); };
  }, []);

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
    setDoc(doc(db, ROOMS_COL, room.id), withCalc).catch(console.error);
    setFormState('closed');
  }, []);

  const handleDeleteRoom = useCallback((id: string) => {
    deleteDoc(doc(db, ROOMS_COL, id)).catch(console.error);
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
          const batch = writeBatch(db);
          (data as EscapeRoom[]).forEach((room) => {
            batch.set(doc(db, ROOMS_COL, room.id), room);
          });
          batch.commit().catch(console.error);
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

  if (!dbReady) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 font-inter">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregant dades…</p>
        </div>
      </div>
    );
  }

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
