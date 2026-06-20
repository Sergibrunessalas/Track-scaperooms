import { useState } from 'react';
import { Users, X, Plus } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

interface Props {
  user: User;
  onDone: () => void;
  onDecline: () => void;
}

type Step = 'confirm' | 'form';

export default function OnboardingModal({ user, onDone, onDecline }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [nomGrup, setNomGrup] = useState('');
  const [membres, setMembres] = useState([
    { nom: '', correu: user.email ?? '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setMembre(i: number, field: 'nom' | 'correu', val: string) {
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
    if (membres.length <= 1) return;
    setMembres(m => m.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!nomGrup.trim()) { setError('El nom del grup és obligatori.'); return; }
    const membresVàlids = membres.filter(m => m.nom.trim() || m.correu.trim());
    setSaving(true);
    try {
      const membresCorreus = [...new Set(
        [user.email ?? '', ...membresVàlids.map(m => m.correu.trim().toLowerCase())].filter(Boolean)
      )];
      await addDoc(collection(db, 'grups'), {
        nom: nomGrup.trim(),
        titular: user.email ?? '',
        membres: membresVàlids,
        membresCorreus,
        createdAt: new Date().toISOString(),
      });
      onDone();
    } catch {
      setError('Error desant el grup. Torna-ho a intentar.');
      setSaving(false);
    }
  }

  if (step === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5 text-center">
          <div>
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-orange-500" />
            </div>
            <h2 className="font-montserrat text-xl font-black text-gray-900 mb-2">
              Benvingut/da!
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vols formar el teu equip per fer un bon seguiment dels escape rooms que feu junts?
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setStep('form')}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Acceptar
            </button>
            <button
              onClick={onDecline}
              className="w-full py-2.5 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Declinar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Capçalera */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-montserrat text-lg font-black text-gray-900">Crea el teu grup</h2>
          <button onClick={onDecline} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Contingut scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Nom del grup */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nom del grup
            </label>
            <input
              type="text"
              value={nomGrup}
              onChange={e => { setNomGrup(e.target.value); setError(''); }}
              placeholder="p. ex. Equip ScapeZone"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Membres */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Membres
            </label>
            <div className="space-y-2">
              {membres.map((m, i) => (
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
                  <button
                    onClick={() => removeMembre(i)}
                    disabled={membres.length <= 1}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
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
            onClick={handleSave}
            disabled={saving || !nomGrup.trim()}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            {saving ? 'Desant...' : 'Crear grup'}
          </button>
          <button
            onClick={onDecline}
            className="px-4 py-2.5 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel·lar
          </button>
        </div>
      </div>
    </div>
  );
}
