import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Map, List, ChevronRight, ChevronLeft } from 'lucide-react';
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
import { EscapeRoom, calcPuntuacio, normalizeRoom, starsFromScore } from './types';
import initialData from './data/escape-rooms.json';

const ROOMS_COL = 'rooms';

export default function App() {
  const [rooms, setRooms] = useState<EscapeRoom[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [filterTematica, setFilterTematica] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [formState, setFormState] = useState<'closed' | 'new' | EscapeRoom>('closed');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Quan el sidebar canvia de mida, cal que Leaflet recalculi les dimensions del mapa
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 60);
    return () => clearTimeout(t);
  }, [sidebarCollapsed]);

  const mapRef = useRef<MapViewHandle>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function init() {
      console.log('[Firebase] Iniciant connexió...');
      const snap = await getDocs(collection(db, ROOMS_COL));
      console.log('[Firebase] Documents trobats:', snap.size);
      if (snap.empty) {
        console.log('[Firebase] Base de dades buida, sembrant dades...');
        const batch = writeBatch(db);
        (initialData as Record<string, unknown>[]).forEach((room) => {
          const normalized = normalizeRoom(room);
          batch.set(doc(db, ROOMS_COL, normalized.id), normalized);
        });
        await batch.commit();
        console.log('[Firebase] Dades sembrades correctament.');
      } else {
        // Migració: actualitza rooms que no tinguin empresa assignada
        const empreseMap = Object.fromEntries(
          (initialData as Record<string, unknown>[]).map((r) => [r.id as string, (r.empresa as string) ?? ''])
        );
        const needsUpdate = snap.docs.filter((d) => !d.data().empresa && empreseMap[d.id]);
        if (needsUpdate.length > 0) {
          console.log(`[Firebase] Migrant empresa a ${needsUpdate.length} rooms...`);
          const batch = writeBatch(db);
          needsUpdate.forEach((d) => {
            batch.update(doc(db, ROOMS_COL, d.id), { empresa: empreseMap[d.id] });
          });
          await batch.commit();
          console.log('[Firebase] Migració empresa completada.');
        }

        // Migració Sergi: mou valoracions de l'índex 0 a la posició real del Sergi
        const needsSergiMigration = snap.docs.filter((d) => {
          const room = normalizeRoom(d.data());
          const parts = room.participants.trim().split(/\s+/).filter(Boolean);
          const sergiIdx = parts.findIndex((p) => p.toLowerCase() === 'sergi');
          if (sergiIdx <= 0) return false;
          const r0 = room.ratings[0] ?? { decoracio: null, gameMaster: null, proves: null };
          const hasData0 = r0.decoracio != null || r0.gameMaster != null || r0.proves != null;
          if (!hasData0) return false;
          const rS = room.ratings[sergiIdx] ?? { decoracio: null, gameMaster: null, proves: null };
          return rS.decoracio == null && rS.gameMaster == null && rS.proves == null;
        });
        if (needsSergiMigration.length > 0) {
          console.log(`[Firebase] Migrant valoracions al Sergi en ${needsSergiMigration.length} rooms...`);
          const batch = writeBatch(db);
          needsSergiMigration.forEach((d) => {
            const room = normalizeRoom(d.data());
            const parts = room.participants.trim().split(/\s+/).filter(Boolean);
            const sergiIdx = parts.findIndex((p) => p.toLowerCase() === 'sergi');
            const n = Math.max(room.dificultats.length, sergiIdx + 1);
            const dificultats = Array.from({ length: n }, (_, i) => room.dificultats[i] ?? '');
            const ratings = Array.from({ length: n }, (_, i) => room.ratings[i] ?? { decoracio: null, gameMaster: null, proves: null });
            dificultats[sergiIdx] = dificultats[0];
            dificultats[0] = '';
            ratings[sergiIdx] = { ...ratings[0] };
            ratings[0] = { decoracio: null, gameMaster: null, proves: null };
            const puntuacio = calcPuntuacio(ratings);
            batch.set(doc(db, ROOMS_COL, room.id), { ...room, dificultats, ratings, puntuacio });
          });
          await batch.commit();
          console.log('[Firebase] Migració Sergi completada.');
        }
      }

      unsub = onSnapshot(collection(db, ROOMS_COL), (snapshot) => {
        const data = snapshot.docs
          .map((d) => normalizeRoom(d.data()))
          .sort((a, b) => a.id.localeCompare(b.id));
        setRooms(data);
        setDbReady(true);
      });
    }

    init().catch((err) => console.error('[Firebase] ERROR:', err));
    return () => { unsub?.(); };
  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (searchQuery && !room.nom.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (searchEmpresa && !(room.empresa ?? '').toLowerCase().includes(searchEmpresa.toLowerCase())) return false;
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
    const withCalc: EscapeRoom = { ...room, puntuacio: calcPuntuacio(room.ratings) };
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
          (data as Record<string, unknown>[]).forEach((room) => {
            const normalized = normalizeRoom(room);
            batch.set(doc(db, ROOMS_COL, normalized.id), normalized);
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

  const topRooms = useMemo(
    () => rooms.filter(r => r.puntuacio !== null).sort((a, b) => (b.puntuacio ?? 0) - (a.puntuacio ?? 0)).slice(0, 3),
    [rooms]
  );

  const empreses = useMemo(
    () => [...new Set(rooms.map((r) => r.empresa).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ca')),
    [rooms]
  );

  const hasFilters = !!(searchQuery || searchEmpresa || filterTematica);
  const clearFilters = () => { setSearchQuery(''); setSearchEmpresa(''); setFilterTematica(''); };

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
    <div className="h-full flex flex-row font-inter overflow-hidden">

      {/* ── Barra esquerra d'anuncis (només desktop ≥1024px) ── */}
      <div className="ad-bar hidden lg:flex w-40 flex-shrink-0 flex-col items-center gap-2.5 py-4 px-2.5 overflow-hidden">

        {/* Capçalera */}
        <div style={{ width: '100%', background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '8px', padding: '5px 0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fef08a', textShadow: '0 0 14px rgba(254,240,138,0.95)' }}>
            ★ TOP VALORATS ★
          </p>
        </div>

        {/* Targetes dels millors escape rooms */}
        {topRooms.map(room => (
          <a
            key={room.id}
            href={room.web || undefined}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', width: '100%', borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', boxShadow: '0 3px 12px rgba(0,0,0,0.35)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', cursor: room.web ? 'pointer' : 'default' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1.04)'; el.style.boxShadow = '0 6px 22px rgba(0,0,0,0.55)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1)'; el.style.boxShadow = '0 3px 12px rgba(0,0,0,0.35)'; }}
          >
            {room.imatgeUrl && (
              <img src={room.imatgeUrl} alt={room.nom}
                style={{ width: '100%', height: '70px', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div style={{ padding: '7px 9px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, textShadow: '0 1px 5px rgba(0,0,0,0.7)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                {room.nom}
              </p>
              {room.empresa && (
                <p style={{ margin: '0 0 5px', fontSize: '9px', color: 'rgba(255,255,255,0.52)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {room.empresa}
                </p>
              )}
              <p style={{ margin: 0, fontSize: '13px', color: '#fef08a', fontWeight: 800, textShadow: '0 0 10px rgba(254,240,138,0.7)' }}>
                {starsFromScore(room.puntuacio)}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginLeft: '4px' }}>
                  {room.puntuacio?.toFixed(1)}
                </span>
              </p>
            </div>
          </a>
        ))}

        {/* Text vertical al peu */}
        <p style={{ marginTop: 'auto', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Espai publicitari
        </p>
      </div>

      {/* ── Contingut principal ── */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
        <Header onAddRoom={() => setFormState('new')} onExport={handleExport} onImport={handleImport} />
        <StatsBar
          total={rooms.length}
          valorats={rooms.filter((r) => r.puntuacio !== null).length}
          pendents={rooms.filter((r) => r.puntuacio === null).length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchEmpresa={searchEmpresa}
          onSearchEmpresaChange={setSearchEmpresa}
          empreses={empreses}
          filterTematica={filterTematica}
          onFilterTematicaChange={setFilterTematica}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />

        {/* Mobile tabs */}
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

        {/* Map + Sidebar + Toggle */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Map */}
          <div className={`flex-1 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            <MapView
              ref={mapRef}
              rooms={filteredRooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={(room) => {
                setSelectedRoomId(room.id);
                mapRef.current?.flyToRoom(room);
              }}
            />
          </div>

          {/* Toggle sidebar button — desktop only */}
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? 'Mostrar llista' : 'Ocultar llista'}
            className="hidden md:flex w-4 flex-shrink-0 flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 border-x border-gray-200 transition-colors cursor-pointer"
          >
            {sidebarCollapsed
              ? <ChevronLeft size={12} className="text-gray-500" />
              : <ChevronRight size={12} className="text-gray-500" />}
          </button>

          {/* Sidebar — mobile: controlled by mobileView; desktop: controlled by sidebarCollapsed */}
          <div className={[
            'flex-col w-full md:w-80 lg:w-96 flex-shrink-0',
            mobileView === 'map' ? 'hidden' : 'flex',
            sidebarCollapsed ? 'md:hidden' : 'md:flex',
          ].join(' ')}>
            <Sidebar
              rooms={filteredRooms}
              filteredCount={filteredRooms.length}
              selectedRoomId={selectedRoomId}
              onRoomClick={handleRoomCardClick}
              onEditRoom={(room) => setFormState(room)}
            />
          </div>
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
