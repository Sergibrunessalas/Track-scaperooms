import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';

interface Props {
  user: User;
  onDone: (profile: UserProfile) => void;
}

export default function UserSetupModal({ user, onDone }: Props) {
  const [pseudonim, setPseudonim] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const nom = pseudonim.trim();
    if (!nom) return;
    setSaving(true);
    const profile: UserProfile = { uid: user.uid, email: user.email ?? '', pseudonim: nom };
    await setDoc(doc(db, 'usuaris', user.uid), profile);
    onDone(profile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-3xl mb-3">👋</p>
          <h2 className="font-montserrat text-xl font-black text-gray-900 mb-1">Benvingut/da!</h2>
          <p className="text-sm text-gray-500 leading-snug">
            Com vols que et vegin els altres membres dels grups?
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">El teu nom o àlies</label>
          <input
            type="text"
            value={pseudonim}
            onChange={e => setPseudonim(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="p. ex. Anna, Gamer123..."
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!pseudonim.trim() || saving}
          className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Desant...' : 'Continuar'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Sessió iniciada com <span className="font-medium">{user.email}</span>
        </p>
      </div>
    </div>
  );
}
