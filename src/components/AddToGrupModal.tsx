import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Check, X } from 'lucide-react';
import type { EscapeRoom, Grup, GrupRoom } from '../types';
import type { User } from 'firebase/auth';

interface Props {
  room: EscapeRoom;
  user: User;
  onClose: () => void;
}

export default function AddToGrupModal({ room, user, onClose }: Props) {
  const [grups, setGrups] = useState<Grup[]>([]);
  const [selectedGrupId, setSelectedGrupId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = user.email?.toLowerCase() ?? '';
    if (!email) { setLoading(false); return; }
    const q = query(collection(db, 'grups'), where('membresCorreus', 'array-contains', email));
    getDocs(q).then(snap => {
      const gs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Grup));
      setGrups(gs);
      if (gs.length === 1) setSelectedGrupId(gs[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.email]);

  async function handleAdd() {
    if (!selectedGrupId) return;
    setSaving(true);
    try {
      const grupRoom: GrupRoom = {
        roomId: room.id,
        nom: room.nom,
        empresa: room.empresa ?? '',
        localitzacio: room.localitzacio ?? '',
        lat: room.lat,
        lng: room.lng,
        comarca: room.comarca ?? '',
        tematica1: room.tematica1 ?? '',
        tematica2: room.tematica2 ?? '',
        temps: room.temps ?? '',
        preu: room.preu ?? '',
        web: room.web ?? '',
        imatgeUrl: '',
        data: '',
        dificultats: [],
        ratings: [],
        puntuacio: null,
        participants: '',
        comentaris: '',
        afegitPer: user.email ?? '',
        afegitAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'grups', selectedGrupId, 'rooms', room.id), grupRoom);
      setSaved(true);
      setTimeout(onClose, 1500);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Capçalera */}
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat font-black text-gray-900 text-base">Afegir al meu grup</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Info de la sala */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="font-semibold text-sm text-gray-900">{room.nom}</p>
          {room.empresa && <p className="text-xs text-gray-400">{room.empresa}</p>}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-2">Carregant grups...</p>
        ) : saved ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={20} className="text-green-500" />
            </div>
            <p className="text-sm font-semibold text-green-700">Afegit correctament!</p>
          </div>
        ) : grups.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">
            No tens cap grup creat. Crea'n un des de la pestanya <strong>Els meus grups</strong>.
          </p>
        ) : (
          <>
            {grups.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tria el grup</p>
                {grups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrupId(g.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-2 ${
                      selectedGrupId === g.id
                        ? 'border-orange-400 bg-orange-50 font-semibold text-gray-900'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users size={12} className="opacity-50 flex-shrink-0" />
                    {g.nom}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={!selectedGrupId || saving}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40"
            >
              {saving ? 'Afegint...' : '👥 Afegir a Els meus grups'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
