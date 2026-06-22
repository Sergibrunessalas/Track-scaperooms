import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Plus } from 'lucide-react';
import type { Grup, GrupMembre } from '../types';

interface Props {
  grup: Grup;
  currentUserEmail: string;
  onClose: () => void;
}

export default function EditGrupModal({ grup, currentUserEmail, onClose }: Props) {
  const [nom, setNom] = useState(grup.nom);
  const [membres, setMembres] = useState<GrupMembre[]>(
    grup.membres.length ? grup.membres.map(m => ({ ...m })) : [{ nom: '', correu: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setMembre(i: number, field: keyof GrupMembre, val: string) {
    setMembres(m => {
      const next = [...m];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  }

  function addMembre() {
    setMembres(m => [...m, { nom: '', correu: '' }]);
  }

  function removeMembre(i: number) {
    setMembres(m => m.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (!nom.trim()) { setError('El nom del grup és obligatori.'); return; }
    setSaving(true);
    try {
      const membresValids = membres.filter(m => m.nom.trim() || m.correu.trim());
      const membresCorreus = [...new Set(
        [grup.titular.toLowerCase(), ...membresValids.map(m => m.correu.trim().toLowerCase())].filter(Boolean)
      )];
      await updateDoc(doc(db, 'grups', grup.id), {
        nom: nom.trim(),
        membres: membresValids,
        membresCorreus,
      });
      onClose();
    } catch {
      setError('Error desant els canvis. Torna-ho a intentar.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Capçalera */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-montserrat text-lg font-black text-gray-900">Editar grup</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Contingut */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nom del grup
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => { setNom(e.target.value); setError(''); }}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Membres */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Membres
            </label>
            <div className="space-y-2">
              {membres.map((m, i) => {
                const isTitular = m.correu.trim().toLowerCase() === grup.titular.toLowerCase();
                const canRemove = !isTitular || currentUserEmail.toLowerCase() === grup.titular.toLowerCase();
                return (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={m.nom}
                      onChange={e => setMembre(i, 'nom', e.target.value)}
                      placeholder="Nom"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <input
                      type="email"
                      value={m.correu}
                      onChange={e => setMembre(i, 'correu', e.target.value)}
                      placeholder="Correu"
                      className="flex-[1.4] px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    {canRemove ? (
                      <button
                        onClick={() => removeMembre(i)}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <div className="p-1.5 w-7" title="Només el creador del grup es pot eliminar a si mateix">
                        🔒
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={addMembre}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors mt-2"
            >
              <Plus size={12} />
              Afegir membre
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Botons */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={save}
            disabled={saving || !nom.trim()}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            {saving ? 'Desant...' : 'Desar canvis'}
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
