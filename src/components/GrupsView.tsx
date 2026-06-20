import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, Users, X } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { EscapeRoom, Grup, GrupMembre } from '../types';

const emptyForm = (): { nom: string; membres: GrupMembre[] } => ({
  nom: '',
  membres: [{ nom: '', correu: '' }],
});

interface Props {
  rooms: EscapeRoom[];
  onBack: () => void;
  onViewStats: (g: Grup) => void;
}

export default function GrupsView({ rooms, onBack, onViewStats }: Props) {
  const [grups, setGrups] = useState<Grup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    return onSnapshot(collection(db, 'grups'), snap =>
      setGrups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grup)))
    );
  }, []);

  function roomsForGrup(g: Grup): number {
    const terms = g.membres
      .flatMap(m => [m.nom.trim(), m.correu.trim()])
      .filter(Boolean)
      .map(s => s.toLowerCase());
    if (!terms.length) return 0;
    return rooms.filter(r => {
      const p = (r.participants ?? '').toLowerCase();
      return terms.some(t => p.includes(t));
    }).length;
  }

  function startEdit(g: Grup) {
    setEditingId(g.id);
    setForm({
      nom: g.nom,
      membres: g.membres.length ? g.membres.map(m => ({ ...m })) : [{ nom: '', correu: '' }],
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function save() {
    const data = {
      nom: form.nom.trim(),
      membres: form.membres.filter(m => m.nom.trim() || m.correu.trim()),
    };
    if (!data.nom) return;
    if (editingId) {
      await updateDoc(doc(db, 'grups', editingId), data);
    } else {
      await addDoc(collection(db, 'grups'), data);
    }
    resetForm();
  }

  async function del(id: string) {
    if (!confirm('Segur que vols eliminar aquest grup?')) return;
    await deleteDoc(doc(db, 'grups', id));
    if (editingId === id) resetForm();
  }

  function setMembre(i: number, field: keyof GrupMembre, val: string) {
    setForm(f => {
      const membres = [...f.membres];
      membres[i] = { ...membres[i], [field]: val };
      return { ...f, membres };
    });
  }

  function addMembre() {
    setForm(f => ({ ...f, membres: [...f.membres, { nom: '', correu: '' }] }));
  }

  function removeMembre(i: number) {
    setForm(f => ({ ...f, membres: f.membres.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs">
        <button
          onClick={onBack}
          className="text-white/50 hover:text-white transition-colors"
        >
          Estadístiques
        </button>
        <span className="text-white/30">›</span>
        <span className="text-white font-medium">Grups</span>
      </nav>

      {/* Capçalera */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Els teus grups</h2>
        <button
          onClick={resetForm}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
        >
          <Plus size={14} />
          Crear grup
        </button>
      </div>

      {/* Grid de targetes */}
      {grups.length === 0 ? (
        <p className="text-sm text-white/40 italic">Cap grup creat encara.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grups.map(g => {
            const rc = roomsForGrup(g);
            return (
              <div key={g.id} className="bg-white rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-900 text-sm leading-snug">{g.nom}</span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => startEdit(g)}
                      title="Editar"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => del(g.id)}
                      title="Eliminar"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Users size={11} />
                  {g.membres.length} membre{g.membres.length !== 1 ? 's' : ''}
                  {' · '}
                  {rc} sala{rc !== 1 ? 's' : ''}
                </p>

                <button
                  onClick={() => onViewStats(g)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors mt-auto"
                >
                  Veure estadístiques
                  <ChevronRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulari */}
      <div className="bg-gray-100 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {editingId ? 'Editar grup' : 'Crear grup nou'}
        </h3>

        {/* Nom */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nom del grup</label>
          <input
            type="text"
            value={form.nom}
            onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
            placeholder="p. ex. Equip ScapeZone"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Membres */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Membres</label>
          {form.membres.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={m.nom}
                onChange={e => setMembre(i, 'nom', e.target.value)}
                placeholder="Nom"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <input
                type="email"
                value={m.correu}
                onChange={e => setMembre(i, 'correu', e.target.value)}
                placeholder="Correu electrònic"
                className="flex-[1.5] px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                onClick={() => removeMembre(i)}
                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addMembre}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors mt-1"
          >
            <Plus size={12} />
            Afegir membre
          </button>
        </div>

        {/* Botons */}
        <div className="border-t border-gray-200 pt-4 flex gap-2">
          <button
            onClick={save}
            disabled={!form.nom.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Desar grup
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel·lar
          </button>
        </div>
      </div>
    </div>
  );
}
