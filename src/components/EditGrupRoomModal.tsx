import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X } from 'lucide-react';
import type { GrupRoom } from '../types';

interface Props {
  grupId: string;
  room: GrupRoom;
  onClose: () => void;
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          className={`text-2xl leading-none transition-colors ${
            n <= (hovered ?? value ?? 0) ? 'text-yellow-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
      {value !== null && (
        <button
          onClick={() => onChange(null)}
          className="ml-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Treure
        </button>
      )}
    </div>
  );
}

export default function EditGrupRoomModal({ grupId, room, onClose }: Props) {
  const [data, setData] = useState(room.data ?? '');
  const [dificultat, setDificultat] = useState(room.dificultats?.[0] ?? '');
  const [valoracio, setValoracio] = useState<number | null>(room.puntuacio);
  const [participants, setParticipants] = useState(room.participants ?? '');
  const [comentaris, setComentaris] = useState(room.comentaris ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'grups', grupId, 'rooms', room.roomId), {
        data,
        dificultats: dificultat ? [dificultat] : [],
        puntuacio: valoracio,
        participants,
        comentaris,
      });
      onClose();
    } catch {
      setSaving(false);
    }
  }

  const temes = [room.tematica1, room.tematica2].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

        {/* Capçalera */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="font-montserrat text-base font-black text-gray-900 leading-snug">{room.nom}</h2>
            {room.empresa && <p className="text-xs text-gray-400 mt-0.5">{room.empresa}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Info pre-omplerta (només lectura) */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
          {room.comarca && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">📍 {room.comarca}</span>
          )}
          {temes.map(t => (
            <span key={t} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">{t}</span>
          ))}
          {room.temps && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">⏱ {room.temps}</span>
          )}
          {room.preu && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">{room.preu}</span>
          )}
        </div>

        {/* Camps editables */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Data de realització
            </label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Dificultat */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Dificultat
            </label>
            <select
              value={dificultat}
              onChange={e => setDificultat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            >
              <option value="">Sense especificar</option>
              <option value="Fàcil">Fàcil</option>
              <option value="Mitjana">Mitjana</option>
              <option value="Difícil">Difícil</option>
              <option value="Molt difícil">Molt difícil</option>
            </select>
          </div>

          {/* Valoració */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Valoració
            </label>
            <StarRating value={valoracio} onChange={setValoracio} />
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Participants
            </label>
            <input
              type="text"
              value={participants}
              onChange={e => setParticipants(e.target.value)}
              placeholder="ex. Sergi, Marc, Laura..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Comentaris */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Comentaris
            </label>
            <textarea
              value={comentaris}
              onChange={e => setComentaris(e.target.value)}
              rows={4}
              placeholder="Com va anar? Alguna cosa destacable..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

        </div>

        {/* Botons */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            {saving ? 'Desant...' : 'Desar'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel·lar
          </button>
        </div>
      </div>
    </div>
  );
}
