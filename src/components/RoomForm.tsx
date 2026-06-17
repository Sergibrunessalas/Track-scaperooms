import { useState, useEffect } from 'react';
import { X, Trash2, Save, MapPin, Loader2, Image, Euro, Globe } from 'lucide-react';
import { EscapeRoom, TEMATIQUES, calcPuntuacio, generateId, starsFromScore } from '../types';

interface RoomFormProps {
  room: EscapeRoom | null;
  existingIds: string[];
  onSave: (room: EscapeRoom) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const BLANK: Omit<EscapeRoom, 'id'> = {
  nom: '',
  localitzacio: '',
  lat: null,
  lng: null,
  data: '',
  dificultat: '',
  decoracio: null,
  gameMaster: null,
  proves: null,
  puntuacio: null,
  comentaris: '',
  participants: '',
  imatgeUrl: '',
  preu: '',
  web: '',
  tematica1: '',
  tematica2: '',
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

function DificultatSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const current = STAR_VALUES.indexOf(value);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(current === n ? '' : STAR_VALUES[n])}
          className={`text-xl transition-colors ${
            n <= current ? 'text-accent' : 'text-gray-300 hover:text-accent/60'
          }`}
        >
          ★
        </button>
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="ml-1 text-xs text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-600 font-medium w-28">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="5"
          step="0.5"
          value={value ?? ''}
          placeholder="—"
          onChange={(e) => {
            const v = e.target.value === '' ? null : parseFloat(e.target.value);
            onChange(v !== null && !isNaN(v) ? Math.min(5, Math.max(0, v)) : null);
          }}
          className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none text-center"
        />
        {value !== null && (
          <span className="text-accent text-xs w-16">{starsFromScore(value)}</span>
        )}
      </div>
    </div>
  );
}

type GeocodeMsg = { type: 'ok' | 'error'; text: string };

export default function RoomForm({ room, existingIds, onSave, onDelete, onClose }: RoomFormProps) {
  const isNew = room === null;
  const [form, setForm] = useState<EscapeRoom>(() => {
    if (room) return { ...room };
    return { id: generateId(existingIds), ...BLANK };
  });
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<GeocodeMsg | null>(null);

  const liveScore = calcPuntuacio(form.decoracio, form.gameMaster, form.proves);
  const stars = starsFromScore(liveScore);

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-900">
          <h2 className="font-montserrat font-bold text-white text-base">
            {isNew ? '➕ Nou Escape Room' : '✏️ Editar'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form id="room-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto sidebar-scroll px-5 py-4 space-y-5">
          {/* Basic info */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informació bàsica</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom *</label>
              <input
                required
                type="text"
                value={form.nom}
                onChange={(e) => set('nom', e.target.value)}
                placeholder="Nom de l'escape room"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Localització</label>
              <input
                type="text"
                value={form.localitzacio}
                onChange={(e) => set('localitzacio', e.target.value)}
                placeholder="Adreça completa"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />

              {/* Geocode button */}
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding || !form.localitzacio.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {geocoding
                  ? <Loader2 size={13} className="animate-spin" />
                  : <MapPin size={13} />}
                {geocoding ? 'Buscant coordenades…' : 'Buscar coordenades automàticament'}
              </button>

              {/* Result message */}
              {geocodeMsg && (
                <p className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                  geocodeMsg.type === 'ok'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {geocodeMsg.text}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Latitud
                  {form.lat !== null && <span className="ml-1 text-green-500">✓</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.lat ?? ''}
                  onChange={(e) => set('lat', e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder="41.xxxx"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-accent focus:outline-none ${
                    form.lat !== null ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Longitud
                  {form.lng !== null && <span className="ml-1 text-green-500">✓</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.lng ?? ''}
                  onChange={(e) => set('lng', e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder="2.xxxx"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-accent focus:outline-none ${
                    form.lng !== null ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Data de realització</label>
              <input
                type="date"
                value={toInputDate(form.data)}
                onChange={(e) => set('data', fromInputDate(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />
            </div>
          </section>

          {/* Temàtiques */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temàtiques</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Principal</label>
                <select
                  value={form.tematica1}
                  onChange={(e) => set('tematica1', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none bg-white"
                >
                  <option value="">—</option>
                  {TEMATIQUES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Secundària</label>
                <select
                  value={form.tematica2}
                  onChange={(e) => set('tematica2', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none bg-white"
                >
                  <option value="">—</option>
                  {TEMATIQUES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Dificultat */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dificultat</h3>
            <DificultatSelector value={form.dificultat} onChange={(v) => set('dificultat', v)} />
          </section>

          {/* Valoració */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valoració (0–5)</h3>

            <div className="space-y-2.5">
              <ScoreInput
                label="Decoració"
                value={form.decoracio}
                onChange={(v) => set('decoracio', v)}
              />
              <ScoreInput
                label="Game Master"
                value={form.gameMaster}
                onChange={(v) => set('gameMaster', v)}
              />
              <ScoreInput
                label="Proves"
                value={form.proves}
                onChange={(v) => set('proves', v)}
              />
            </div>

            {/* Auto-calculated score */}
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
              <input
                type="url"
                value={form.web}
                onChange={(e) => set('web', e.target.value)}
                placeholder="https://www.nomdellocal.com"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Euro size={12} /> Preu</span>
              </label>
              <input
                type="text"
                value={form.preu}
                onChange={(e) => set('preu', e.target.value)}
                placeholder="Ex: 18€/persona"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Participants</label>
              <input
                type="text"
                value={form.participants}
                onChange={(e) => set('participants', e.target.value)}
                placeholder="Cristina Ari Xamo Sergi"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Separats per espai</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Comentaris</label>
              <textarea
                value={form.comentaris}
                onChange={(e) => set('comentaris', e.target.value)}
                placeholder="Notes sobre l'experiència…"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Image size={12} /> Foto (URL d'Imgur)</span>
              </label>
              <input
                type="url"
                value={form.imatgeUrl}
                onChange={(e) => set('imatgeUrl', e.target.value)}
                placeholder="https://i.imgur.com/xxxxx.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-accent focus:outline-none"
              />
              {form.imatgeUrl && (
                <img
                  src={form.imatgeUrl}
                  alt="Previsualització"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
          </section>
        </form>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            form="room-form"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Save size={14} />
            Desar
          </button>
        </div>
      </div>
    </div>
  );
}
