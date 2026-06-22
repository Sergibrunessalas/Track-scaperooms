import { useState, useEffect } from 'react';
import { X, Trash2, Save, MapPin, Loader2, Image, Euro, Globe, Clock } from 'lucide-react';
import { EscapeRoom, ParticipantRating, TEMATIQUES, COMARQUES, calcPuntuacio, generateId, starsFromScore } from '../types';

const EMAIL_TO_NAME: Record<string, string> = {
  'lauranavarreteclos@gmail.com': 'Laura',
  'marc.brunes95@gmail.com': 'Marc',
  'cristina.naqui@gmail.com': 'Cristina',
  'ari.veny.reast@gmail.com': 'Ari',
};

const ADMIN_EMAILS = ['sbrunessalas@gmail.com', 'xamolo@hotmail.com', 'cristina.naqui@gmail.com'];

interface RoomFormProps {
  room: EscapeRoom | null;
  existingIds: string[];
  userEmail: string;
  onSave: (room: EscapeRoom) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const BLANK: Omit<EscapeRoom, 'id'> = {
  nom: '',
  empresa: '',
  localitzacio: '',
  lat: null,
  lng: null,
  data: '',
  dificultats: [],
  ratings: [],
  puntuacio: null,
  comentaris: '',
  participants: '',
  imatgeUrl: '',
  imatgePublicaUrl: '',
  preu: '',
  web: '',
  tematica1: '',
  tematica2: '',
  temps: '',
  comarca: '',
  descripcio: '',
};

function toInputDate(s: string): string {
  if (!s || !s.includes('/')) return '';
  const [d, m, y] = s.split('/');
  if (!d || !m || !y) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function fromInputDate(s: string): string {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

const STAR_VALUES = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

function DificultatSelector({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const current = STAR_VALUES.indexOf(value);
  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-40' : ''}`}>
      <span className="text-xs text-gray-600 font-medium w-28 truncate">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(current === n ? '' : STAR_VALUES[n])}
            className={`text-xl transition-colors ${disabled ? 'cursor-not-allowed' : ''} ${n <= current ? 'text-accent' : 'text-gray-300 hover:text-accent/60'}`}
          >
            ★
          </button>
        ))}
        {value && !disabled && (
          <button type="button" onClick={() => onChange('')} className="ml-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>
    </div>
  );
}

function ScoreInput({ label, value, onChange, disabled }: { label: string; value: number | null; onChange: (v: number | null) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-40' : ''}`}>
      <label className="text-xs text-gray-600 font-medium w-28 truncate">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="5"
          step="0.5"
          disabled={disabled}
          value={value ?? ''}
          placeholder="—"
          onChange={(e) => {
            if (disabled) return;
            const v = e.target.value === '' ? null : parseFloat(e.target.value);
            onChange(v !== null && !isNaN(v) ? Math.min(5, Math.max(0, v)) : null);
          }}
          className={`w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none text-center ${disabled ? 'cursor-not-allowed bg-gray-50' : ''}`}
        />
        {value !== null && <span className="text-accent text-xs w-16">{starsFromScore(value)}</span>}
      </div>
    </div>
  );
}

const EMPTY_RATING: ParticipantRating = { decoracio: null, gameMaster: null, proves: null };

type GeocodeMsg = { type: 'ok' | 'error'; text: string };

export default function RoomForm({ room, existingIds, userEmail, onSave, onDelete, onClose }: RoomFormProps) {
  const isNew = room === null;
  const [form, setForm] = useState<EscapeRoom>(() => {
    if (room) return { ...BLANK, ...room };
    return { id: generateId(existingIds), ...BLANK };
  });
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<GeocodeMsg | null>(null);

  const parts = form.participants.trim().split(/\s+/).filter(Boolean);

  // Admins poden editar tots els slots; la resta només el seu
  const isAdmin = ADMIN_EMAILS.includes(userEmail);
  const myName = EMAIL_TO_NAME[userEmail] ?? '';
  const editableIdx = myName
    ? parts.findIndex(p => p.toLowerCase() === myName.toLowerCase())
    : -1;
  // Si no és admin: només pot editar el seu slot.
  // Si el seu nom no apareix als participants → cap slot editable (editableIdx === -1 → mai coincideix amb i)
  const canEditSlot = (i: number) => isAdmin || (myName !== '' && editableIdx === i);
  const numParts = Math.max(1, parts.length);
  const pLabel = (i: number) => parts[i] || `Participant ${i + 1}`;

  const getDif = (i: number) => form.dificultats[i] ?? '';
  const getRating = (i: number): ParticipantRating => form.ratings[i] ?? EMPTY_RATING;

  const setDif = (i: number, v: string) => {
    setForm((prev) => {
      const dificultats = [...prev.dificultats];
      dificultats[i] = v;
      return { ...prev, dificultats };
    });
  };

  const setRatingField = (i: number, key: keyof ParticipantRating, v: number | null) => {
    setForm((prev) => {
      const ratings = [...prev.ratings];
      ratings[i] = { ...(ratings[i] ?? EMPTY_RATING), [key]: v };
      return { ...prev, ratings };
    });
  };

  const liveScore = calcPuntuacio(form.ratings);
  const stars = starsFromScore(liveScore);

  const difVals = form.dificultats
    .slice(0, numParts)
    .map(d => (d.match(/★/g) || []).length)
    .filter(n => n > 0);
  const avgDif = difVals.length > 0 ? difVals.reduce((a, b) => a + b, 0) / difVals.length : null;

  useEffect(() => {
    setForm((prev) => ({ ...prev, puntuacio: liveScore }));
  }, [liveScore]);

  const set = <K extends keyof EscapeRoom>(key: K, value: EscapeRoom[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'localitzacio') setGeocodeMsg(null);
  };

  const handleGeocode = async () => {
    if (!form.localitzacio.trim()) return;
    setGeocoding(true);
    setGeocodeMsg(null);
    try {
      const q = encodeURIComponent(form.localitzacio.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`,
        { headers: { 'Accept-Language': 'ca,es', 'User-Agent': 'EscapeRoomsTracker/1.0' } }
      );
      const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setForm((prev) => ({ ...prev, lat: parseFloat(lat), lng: parseFloat(lon) }));
        const short = display_name.split(',').slice(0, 3).join(',');
        setGeocodeMsg({ type: 'ok', text: `✓ Trobat: ${short}` });
      } else {
        setGeocodeMsg({ type: 'error', text: 'No s\'han trobat coordenades. Prova amb una adreça més concreta.' });
      }
    } catch {
      setGeocodeMsg({ type: 'error', text: 'Error de connexió. Comprova que tens internet.' });
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;
    onSave({ ...form, puntuacio: liveScore });
  };

  const handleDelete = () => {
    if (window.confirm(`Segur que vols eliminar "${form.nom}"?`)) {
      onDelete(form.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-900">
          <h2 className="font-montserrat font-bold text-white text-base">
            {isNew ? '➕ Nou Escape Room' : '✏️ Editar'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form id="room-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto sidebar-scroll px-5 py-4 space-y-5">

          {/* Avís per a no-admins */}
          {!isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">
              ℹ️ Només pots editar la teva dificultat i valoració
            </div>
          )}

          {/* Basic info */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informació bàsica</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
              <input
                required
                type="text"
                value={form.nom}
                disabled={!isAdmin}
                onChange={(e) => set('nom', e.target.value)}
                placeholder="Nom de l'escape room"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Companyia</label>
              <input
                type="text"
                value={form.empresa}
                disabled={!isAdmin}
                onChange={(e) => set('empresa', e.target.value)}
                placeholder="Nom de l'empresa que gestiona el local"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Localització</label>
              <input
                type="text"
                value={form.localitzacio}
                disabled={!isAdmin}
                onChange={(e) => set('localitzacio', e.target.value)}
                placeholder="Adreça completa"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={!isAdmin || geocoding || !form.localitzacio.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {geocoding ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                {geocoding ? 'Buscant coordenades…' : 'Buscar coordenades automàticament'}
              </button>
              {geocodeMsg && (
                <p className={`mt-2 text-xs px-3 py-2 rounded-lg ${geocodeMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {geocodeMsg.text}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Comarca</label>
              <select
                value={form.comarca}
                disabled={!isAdmin}
                onChange={(e) => set('comarca', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">— Selecciona comarca —</option>
                {COMARQUES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Latitud{form.lat !== null && <span className="ml-1 text-green-500">✓</span>}
                </label>
                <input
                  type="number" step="any" value={form.lat ?? ''} placeholder="41.xxxx"
                  disabled={!isAdmin}
                  onChange={(e) => set('lat', e.target.value === '' ? null : parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${form.lat !== null ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Longitud{form.lng !== null && <span className="ml-1 text-green-500">✓</span>}
                </label>
                <input
                  type="number" step="any" value={form.lng ?? ''} placeholder="2.xxxx"
                  disabled={!isAdmin}
                  onChange={(e) => set('lng', e.target.value === '' ? null : parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${form.lng !== null ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Data de realització</label>
              <input
                type="date" value={toInputDate(form.data)}
                disabled={!isAdmin}
                onChange={(e) => set('data', fromInputDate(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Clock size={12} /> Temps (minuts)</span>
              </label>
              <input
                type="text"
                value={form.temps}
                disabled={!isAdmin}
                onChange={(e) => set('temps', e.target.value)}
                placeholder="Ex: 75 min"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
          </section>

          {/* Temàtiques */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temàtiques</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Principal</label>
                <select value={form.tematica1} disabled={!isAdmin} onChange={(e) => set('tematica1', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                  <option value="">—</option>
                  {TEMATIQUES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Secundària</label>
                <select value={form.tematica2} disabled={!isAdmin} onChange={(e) => set('tematica2', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                  <option value="">—</option>
                  {TEMATIQUES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Dificultat */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dificultat</h3>
            {Array.from({ length: numParts }, (_, i) => (
              <DificultatSelector key={i} label={pLabel(i)} value={getDif(i)} onChange={(v) => setDif(i, v)} disabled={!canEditSlot(i)} />
            ))}
            {avgDif !== null && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Dificultat mitjana</span>
                <span className="text-xs font-semibold text-gray-700">
                  {avgDif.toFixed(1)} ★ — {avgDif <= 1.5 ? 'Fàcil' : avgDif <= 2.5 ? 'Fàcil-Mitjà' : avgDif <= 3.5 ? 'Mitjà' : avgDif <= 4.5 ? 'Mitjà-Alt' : 'Alt'}
                </span>
              </div>
            )}
          </section>

          {/* Valoració */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valoració (0–5)</h3>

            {Array.from({ length: numParts }, (_, i) => {
              const r = getRating(i);
              const locked = !canEditSlot(i);
              return (
                <div key={i} className={locked ? 'opacity-50' : ''}>
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    {pLabel(i)}{locked && <span className="ml-1 text-gray-300">(🔒)</span>}
                  </p>
                  <div className="space-y-2.5 pl-2 border-l-2 border-accent/20">
                    <ScoreInput label="Decoració" value={r.decoracio} onChange={(v) => setRatingField(i, 'decoracio', v)} disabled={locked} />
                    <ScoreInput label="Game Master" value={r.gameMaster} onChange={(v) => setRatingField(i, 'gameMaster', v)} disabled={locked} />
                    <ScoreInput label="Proves" value={r.proves} onChange={(v) => setRatingField(i, 'proves', v)} disabled={locked} />
                  </div>
                </div>
              );
            })}

            <div className="bg-orange-50 border border-accent/20 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Puntuació mitjana</p>
                <p className="text-xs text-gray-400">(calculada automàticament)</p>
              </div>
              <div className="text-right">
                {liveScore !== null ? (
                  <>
                    <p className="text-accent font-black text-xl leading-none">{liveScore.toFixed(1)}</p>
                    <p className="text-accent text-xs mt-0.5">{stars}</p>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm italic">—</p>
                )}
              </div>
            </div>
          </section>

          {/* Participants & comentaris */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Participants i comentaris</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Globe size={12} /> Web del local</span>
              </label>
              <input type="url" value={form.web} disabled={!isAdmin} onChange={(e) => set('web', e.target.value)}
                placeholder="https://www.nomdellocal.com"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Euro size={12} /> Preu</span>
              </label>
              <input type="text" value={form.preu} disabled={!isAdmin} onChange={(e) => set('preu', e.target.value)}
                placeholder="Ex: 18€/persona"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Participants</label>
              <input type="text" value={form.participants} disabled={!isAdmin} onChange={(e) => set('participants', e.target.value)}
                placeholder="Cristina Ari Xamo Sergi"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Separats per espai · cada nom genera una casella de valoració</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Descripció general (visible a la pestanya Web)</label>
              <textarea value={form.descripcio} disabled={!isAdmin} onChange={(e) => set('descripcio', e.target.value)}
                placeholder="Descriu l'escape room: temàtica, ambientació, dificultat general, per a qui és recomanable…" rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Comentaris (privats del grup)</label>
              <textarea value={form.comentaris} disabled={!isAdmin} onChange={(e) => set('comentaris', e.target.value)}
                placeholder="Notes sobre l'experiència…" rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Image size={12} /> Foto privada (URL d'Imgur)</span>
              </label>
              <input type="url" value={form.imatgeUrl} disabled={!isAdmin} onChange={(e) => set('imatgeUrl', e.target.value)}
                placeholder="https://i.imgur.com/xxxxx.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
              {form.imatgeUrl && (
                <img src={form.imatgeUrl} alt="Previsualització"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Image size={12} /> Foto pública (visible per a tothom)</span>
              </label>
              <input type="url" value={form.imatgePublicaUrl} disabled={!isAdmin} onChange={(e) => set('imatgePublicaUrl', e.target.value)}
                placeholder="https://exemple.com/foto-escape-room.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed" />
              {form.imatgePublicaUrl && (
                <img src={form.imatgePublicaUrl} alt="Previsualització pública"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
          </section>
        </form>

        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          {!isNew && isAdmin && (
            <button type="button" onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Cancel·lar
          </button>
          <button type="submit" form="room-form" onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            <Save size={14} /> Desar
          </button>
        </div>
      </div>
    </div>
  );
}
