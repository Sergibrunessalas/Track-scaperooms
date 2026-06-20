import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Map, List, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  collection, doc, setDoc, deleteDoc, updateDoc,
  onSnapshot, getDocs, writeBatch,
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './firebase';

// Emails autoritzats per editar (afegeix els del grup aquí)
const ALLOWED_EMAILS = [
  'sbrunessalas@gmail.com',
  'marc.brunes95@gmail.com',
  'lauranavarreteclos@gmail.com',
  'xamolo@hotmail.com',
  'cristina.naqui@gmail.com',
  'ari.veny.reast@gmail.com',
];

const ADMIN_EMAILS = ['sbrunessalas@gmail.com', 'xamolo@hotmail.com', 'cristina.naqui@gmail.com'];
import Header from './components/Header';
import StatsBar, { MainView, FilterPreu } from './components/StatsBar';
import MapView, { MapViewHandle } from './components/MapView';
import Sidebar from './components/Sidebar';
import RoomForm from './components/RoomForm';
import WebView from './components/WebView';
import GaleriaView from './components/GaleriaView';
import BlogView from './components/BlogView';
import { EscapeRoom, calcPuntuacio, normalizeRoom, starsFromScore } from './types';
import initialData from './data/escape-rooms.json';

const ROOMS_COL = 'rooms';

export default function App() {
  const [rooms, setRooms] = useState<EscapeRoom[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) setMainView((prev) => prev === 'web' ? 'mapa' : prev);
    });
  }, []);

  const canEdit = authReady && user !== null && ALLOWED_EMAILS.includes(user.email ?? '');
  const isAdmin = authReady && user !== null && ADMIN_EMAILS.includes(user.email ?? '');

  const handleLogin = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);
  const handleLogout = () => signOut(auth).catch(console.error);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEmpresa, setSearchEmpresa] = useState('');
  const [filterTematica, setFilterTematica] = useState('');
  const [filterComarca, setFilterComarca] = useState('');
  const [filterPreu, setFilterPreu] = useState<FilterPreu>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [formState, setFormState] = useState<'closed' | 'new' | EscapeRoom>('closed');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainView, setMainView] = useState<MainView>('galeria');

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
    if (filterComarca && room.comarca !== filterComarca) return false;
    if (filterPreu) {
      const num = parseFloat((room.preu ?? '').replace(/[^\d.]/g, ''));
      if (filterPreu === 'sense') { if (room.preu) return false; }
      else if (filterPreu === '0-20') { if (!room.preu || isNaN(num) || num > 20) return false; }
      else if (filterPreu === '20-30') { if (!room.preu || isNaN(num) || num <= 20 || num >= 30) return false; }
      else if (filterPreu === '30-40') { if (!room.preu || isNaN(num) || num < 30 || num > 40) return false; }
      else if (filterPreu === '40+') { if (!room.preu || isNaN(num) || num <= 40) return false; }
    }
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
    () => rooms.filter(r => r.puntuacio !== null).sort((a, b) => (b.puntuacio ?? 0) - (a.puntuacio ?? 0)).slice(0, 5),
    [rooms]
  );

  const empreses = useMemo(
    () => [...new Set(rooms.map((r) => r.empresa).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ca')),
    [rooms]
  );

  const comarquesDisponibles = useMemo(
    () => [...new Set(rooms.map((r) => r.comarca).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ca')),
    [rooms]
  );

  const tematiquesDisponibles = useMemo(
    () => [...new Set(rooms.flatMap((r) => [r.tematica1, r.tematica2]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ca')),
    [rooms]
  );

  const hasFilters = !!(searchQuery || searchEmpresa || filterTematica || filterComarca || filterPreu);
  const clearFilters = () => { setSearchQuery(''); setSearchEmpresa(''); setFilterTematica(''); setFilterComarca(''); setFilterPreu(''); };

  const migrateComarques = async () => {
    const CITY_COMARCA: [string, string][] = [
      // Barcelonès
      ['hospitalet de llobregat', 'Barcelonès'], ["l'hospitalet", 'Barcelonès'],
      ['santa coloma de gramenet', 'Barcelonès'], ['sant adrià de besòs', 'Barcelonès'],
      ['sant adria de besos', 'Barcelonès'], ['montcada i reixac', 'Barcelonès'],
      ['badalona', 'Barcelonès'], ['barcelona', 'Barcelonès'],
      // Vallès Occidental
      ['sant cugat del vallès', 'Vallès Occidental'], ['sant cugat', 'Vallès Occidental'],
      ['cerdanyola del vallès', 'Vallès Occidental'], ['cerdanyola', 'Vallès Occidental'],
      ['barberà del vallès', 'Vallès Occidental'], ['barbera del valles', 'Vallès Occidental'],
      ['castellar del vallès', 'Vallès Occidental'], ['ripollet', 'Vallès Occidental'],
      ['santa perpètua de mogoda', 'Vallès Occidental'], ['santa perpetua', 'Vallès Occidental'],
      ['polinyà', 'Vallès Occidental'], ['polinyà', 'Vallès Occidental'],
      ['terrassa', 'Vallès Occidental'], ['sabadell', 'Vallès Occidental'],
      ['rubí', 'Vallès Occidental'], ['rubi', 'Vallès Occidental'],
      // Vallès Oriental
      ['granollers', 'Vallès Oriental'], ['mollet del vallès', 'Vallès Oriental'],
      ['mollet del valles', 'Vallès Oriental'], ['la garriga', 'Vallès Oriental'],
      ['cardedeu', 'Vallès Oriental'], ['parets del vallès', 'Vallès Oriental'],
      ['parets del valles', 'Vallès Oriental'], ['montornès del vallès', 'Vallès Oriental'],
      ['montornes', 'Vallès Oriental'], ['la llagosta', 'Vallès Oriental'],
      ['les franqueses', 'Vallès Oriental'], ['canovelles', 'Vallès Oriental'],
      ['caldes de montbui', 'Vallès Oriental'], ['bigues i riells', 'Vallès Oriental'],
      ['sant celoni', 'Vallès Oriental'], ['llinars del vallès', 'Vallès Oriental'],
      // Maresme
      ['mataró', 'Maresme'], ['mataro', 'Maresme'],
      ['premià de mar', 'Maresme'], ['premia de mar', 'Maresme'],
      ['premià de dalt', 'Maresme'], ['vilassar de mar', 'Maresme'],
      ['vilassar de dalt', 'Maresme'], ['arenys de mar', 'Maresme'],
      ['arenys de munt', 'Maresme'], ['calella', 'Maresme'],
      ['pineda de mar', 'Maresme'], ['sant pol de mar', 'Maresme'],
      ['canet de mar', 'Maresme'], ['montgat', 'Maresme'],
      ['el masnou', 'Maresme'], ['alella', 'Maresme'],
      ['malgrat de mar', 'Maresme'], ['tordera', 'Maresme'],
      // Baix Llobregat
      ['cornellà de llobregat', 'Baix Llobregat'], ['cornella', 'Baix Llobregat'],
      ['el prat de llobregat', 'Baix Llobregat'], ['el prat', 'Baix Llobregat'],
      ['gavà', 'Baix Llobregat'], ['gava', 'Baix Llobregat'],
      ['viladecans', 'Baix Llobregat'], ['castelldefels', 'Baix Llobregat'],
      ['sant boi de llobregat', 'Baix Llobregat'], ['sant boi', 'Baix Llobregat'],
      ['esplugues de llobregat', 'Baix Llobregat'], ['esplugues', 'Baix Llobregat'],
      ['molins de rei', 'Baix Llobregat'], ['sant feliu de llobregat', 'Baix Llobregat'],
      ['sant just desvern', 'Baix Llobregat'], ['pallejà', 'Baix Llobregat'],
      ['martorell', 'Baix Llobregat'], ['abrera', 'Baix Llobregat'],
      ['sant andreu de la barca', 'Baix Llobregat'], ['cervelló', 'Baix Llobregat'],
      ['olesa de montserrat', 'Baix Llobregat'],
      // Garraf
      ['vilanova i la geltrú', 'Garraf'], ['vilanova i la geltru', 'Garraf'],
      ['vilanova', 'Garraf'], ['sitges', 'Garraf'],
      ['sant pere de ribes', 'Garraf'], ['cubelles', 'Garraf'],
      // Alt Penedès
      ['vilafranca del penedès', 'Alt Penedès'], ['vilafranca del penedes', 'Alt Penedès'],
      ["sant sadurní d'anoia", 'Alt Penedès'], ['sant sadurni', 'Alt Penedès'],
      ['gelida', 'Alt Penedès'],
      // Anoia
      ['igualada', 'Anoia'], ['piera', 'Anoia'], ['capellades', 'Anoia'],
      ['vilanova del camí', 'Anoia'],
      // Bages
      ['manresa', 'Bages'], ['sant joan de vilatorrada', 'Bages'],
      ['navarcles', 'Bages'], ['santpedor', 'Bages'], ['sallent', 'Bages'],
      // Berguedà
      ['berga', 'Berguedà'], ['gironella', 'Berguedà'], ['puig-reig', 'Berguedà'],
      // Osona
      ['vic', 'Osona'], ['manlleu', 'Osona'], ['torelló', 'Osona'],
      ['torello', 'Osona'], ['centelles', 'Osona'], ['roda de ter', 'Osona'],
      // Gironès
      ['girona', 'Gironès'], ['salt', 'Gironès'], ['sarrià de ter', 'Gironès'],
      ['sarria de ter', 'Gironès'], ['quart', 'Gironès'],
      // Alt Empordà
      ['figueres', 'Alt Empordà'], ['roses', 'Alt Empordà'],
      ['cadaqués', 'Alt Empordà'], ['cadaques', 'Alt Empordà'],
      ["l'escala", 'Alt Empordà'], ['escala', 'Alt Empordà'],
      ['empuriabrava', 'Alt Empordà'], ['castelló d\'empúries', 'Alt Empordà'],
      ['portbou', 'Alt Empordà'],
      // Baix Empordà
      ['palamós', 'Baix Empordà'], ['palamos', 'Baix Empordà'],
      ['palafrugell', 'Baix Empordà'], ['sant feliu de guíxols', 'Baix Empordà'],
      ['sant feliu de guixols', 'Baix Empordà'],
      ['la bisbal d\'empordà', 'Baix Empordà'], ['la bisbal', 'Baix Empordà'],
      ["platja d'aro", 'Baix Empordà'], ['platja d aro', 'Baix Empordà'],
      ['begur', 'Baix Empordà'], ['torroella de montgrí', 'Baix Empordà'],
      // Selva
      ['lloret de mar', 'Selva'], ['blanes', 'Selva'],
      ['santa coloma de farners', 'Selva'], ['tossa de mar', 'Selva'],
      ['hostalric', 'Selva'], ['caldes de malavella', 'Selva'],
      ['riudellots', 'Selva'],
      // Ripollès
      ['ripoll', 'Ripollès'], ['ribes de freser', 'Ripollès'],
      // Garrotxa
      ['olot', 'Garrotxa'], ['sant joan les fonts', 'Garrotxa'],
      // Pla de l'Estany
      ['banyoles', "Pla de l'Estany"],
      // Cerdanya
      ['puigcerdà', 'Cerdanya'], ['puigcerda', 'Cerdanya'], ['alp', 'Cerdanya'],
      // Baix Camp
      ['reus', 'Baix Camp'], ['cambrils', 'Baix Camp'],
      ['mont-roig del camp', 'Baix Camp'], ['montroig', 'Baix Camp'],
      // Tarragonès
      ['tarragona', 'Tarragonès'], ['salou', 'Tarragonès'],
      ['vila-seca', 'Tarragonès'], ['vila seca', 'Tarragonès'],
      ['constantí', 'Tarragonès'], ['el morell', 'Tarragonès'],
      // Baix Penedès
      ['el vendrell', 'Baix Penedès'], ['calafell', 'Baix Penedès'],
      ['cunit', 'Baix Penedès'],
      // Alt Camp
      ['valls', 'Alt Camp'],
      // Conca de Barberà
      ['montblanc', 'Conca de Barberà'],
      // Priorat
      ['falset', 'Priorat'],
      // Baix Ebre
      ['tortosa', 'Baix Ebre'], ['deltebre', 'Baix Ebre'],
      // Montsià
      ['amposta', 'Montsià'], ['sant carles de la ràpita', 'Montsià'],
      // Segrià
      ['lleida', 'Segrià'],
      // Noguera
      ['balaguer', 'Noguera'],
      // Urgell
      ['tàrrega', 'Urgell'], ['tarrega', 'Urgell'],
      // Pla d'Urgell
      ['mollerussa', "Pla d'Urgell"], ['bellpuig', "Pla d'Urgell"],
      // Segarra
      ['cervera', 'Segarra'],
    ];

    let updated = 0;
    let skipped = 0;
    const notFound: string[] = [];

    for (const room of rooms) {
      if (room.comarca) { skipped++; continue; }
      const loc = (room.localitzacio + ' ' + room.nom).toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '');
      let comarca = '';
      for (const [city, com] of CITY_COMARCA) {
        const normalizedCity = city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (loc.includes(normalizedCity)) { comarca = com; break; }
      }
      if (comarca) {
        await updateDoc(doc(db, 'rooms', room.id), { comarca });
        updated++;
      } else {
        notFound.push(room.nom);
      }
    }

    const msg = `✅ Actualitzats: ${updated}\n⏭ Ja tenien comarca: ${skipped}${notFound.length ? `\n❓ No detectats:\n${notFound.join('\n')}` : ''}`;
    alert(msg);
  };

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

      {/* ── Barra esquerra d'anuncis (només desktop ≥1024px, oculta a pestanya Web) ── */}
      <div className="ad-bar hidden lg:flex w-40 flex-shrink-0 flex-col overflow-hidden" style={{ padding: '10px 10px', display: (mainView === 'galeria' || mainView === 'web' || mainView === 'blog') ? 'none' : undefined }}>

        {/* Capçalera */}
        <div style={{ flexShrink: 0, marginBottom: '8px', background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '8px', padding: '5px 0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fef08a', textShadow: '0 0 14px rgba(254,240,138,0.95)' }}>
            ★ TOP VALORATS ★
          </p>
        </div>

        {/* Les 5 targetes repartides de dalt a baix */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
          {topRooms.map(room => (
            <a
              key={room.id}
              href={room.web || undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'transform 0.18s ease', cursor: room.web ? 'pointer' : 'default', minHeight: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              {canEdit && room.imatgeUrl && (
                <img src={room.imatgeUrl} alt={room.nom}
                  style={{ width: '100%', flex: 1, objectFit: 'cover', display: 'block', minHeight: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div style={{
                flexShrink: canEdit ? 0 : 1,
                flex: canEdit ? undefined : 1,
                padding: canEdit ? '5px 8px' : '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <p style={{ margin: '0 0 2px', fontSize: canEdit ? '10px' : '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: canEdit ? 1 : 2, WebkitBoxOrient: 'vertical' as const }}>
                  {room.nom}
                </p>
                {!canEdit && room.empresa && (
                  <p style={{ margin: '0 0 4px', fontSize: '9px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {room.empresa}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: canEdit ? '11px' : '13px', color: '#fef08a', fontWeight: 800 }}>
                  {starsFromScore(room.puntuacio)}
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginLeft: '2px' }}>
                    {room.puntuacio?.toFixed(1)}
                  </span>
                </p>
              </div>
            </a>
          ))}
        </div>

      </div>

      {/* ── Contingut principal ── */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
        <Header
          canEdit={canEdit}
          isAdmin={isAdmin}
          user={user}
          total={rooms.length}
          mainView={mainView}
          onMainViewChange={setMainView}
          onAddRoom={() => setFormState('new')}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Vista Estadístiques */}
        {mainView === 'web' && canEdit && <WebView rooms={rooms} />}

        {/* Vista Web / Galeria */}
        {mainView === 'galeria' && <GaleriaView rooms={filteredRooms} showImages={canEdit} onSwitchToMapa={() => setMainView('mapa')} />}

        {/* Vista Blog */}
        {mainView === 'blog' && <BlogView />}

        {/* Mobile tabs */}
        <div className={`${mainView === 'web' || mainView === 'galeria' || mainView === 'blog' ? 'hidden' : ''} flex md:hidden flex-shrink-0 bg-white border-b border-gray-200`}>
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
        <div className={`${mainView === 'web' || mainView === 'galeria' || mainView === 'blog' ? 'hidden' : ''} flex-1 flex flex-col md:flex-row overflow-hidden`}>
          {/* Map */}
          <div className={`flex-1 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            <MapView
              ref={mapRef}
              rooms={filteredRooms}
              selectedRoomId={selectedRoomId}
              canEdit={canEdit}
              hasFilters={hasFilters}
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
              canEdit={canEdit}
              isAdmin={isAdmin}
              onRoomClick={handleRoomCardClick}
              onEditRoom={(room) => { setFormState(room); }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchEmpresa={searchEmpresa}
              onSearchEmpresaChange={setSearchEmpresa}
              empreses={empreses}
              comarques={comarquesDisponibles}
              tematiques={tematiquesDisponibles}
              filterTematica={filterTematica}
              onFilterTematicaChange={setFilterTematica}
              filterComarca={filterComarca}
              onFilterComarcaChange={setFilterComarca}
              filterPreu={filterPreu}
              onFilterPreuChange={setFilterPreu}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </div>

      {formState !== 'closed' && (
        <RoomForm
          room={formState === 'new' ? null : formState}
          existingIds={rooms.map((r) => r.id)}
          userEmail={user?.email ?? ''}
          onSave={handleSaveRoom}
          onDelete={handleDeleteRoom}
          onClose={() => setFormState('closed')}
        />
      )}
    </div>
  );
}
