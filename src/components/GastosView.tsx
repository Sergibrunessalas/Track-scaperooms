import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import Footer from './Footer';
import {
  collection, doc, addDoc, deleteDoc,
  onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

interface Gasto {
  id: string;
  data: string;
  concepte: string;
  import: number;
  pagatPer: string;
  creatAt: Timestamp | null;
}

interface FormData {
  data: string;
  concepte: string;
  import: string;
  pagatPer: string;
}

const MEMBRES = ['Sergi', 'Xamo', 'Cristina', 'Ari'];

const MEMBRE_COLORS: Record<string, string> = {
  Sergi:    'bg-blue-100 text-blue-700',
  Xamo:     'bg-purple-100 text-purple-700',
  Cristina: 'bg-pink-100 text-pink-700',
  Ari:      'bg-green-100 text-green-700',
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatEur(n: number): string {
  return n.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function GastoForm({ onSave, onClose }: {
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>({ data: today(), concepte: '', import: '', pagatPer: MEMBRES[0] });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.concepte.trim() || !form.import) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Afegir gasto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Data *</label>
            <input
              type="date"
              value={form.data}
              onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Concepte *</label>
            <input
              type="text"
              value={form.concepte}
              onChange={e => setForm(f => ({ ...f, concepte: e.target.value }))}
              placeholder="Ex: Escape Room Terror BCN, Sopar..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Import (€) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.import}
              onChange={e => setForm(f => ({ ...f, import: e.target.value }))}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Qui ha pagat *</label>
            <div className="flex gap-2 flex-wrap">
              {MEMBRES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, pagatPer: m }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                    form.pagatPer === m
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={saving || !form.concepte.trim() || !form.import}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-bold disabled:opacity-40 hover:enabled:bg-orange-600 transition-colors"
            >
              {saving ? 'Guardant...' : 'Afegir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GastosView({ user }: { user: User | null }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Gasto | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'gastos'), orderBy('data', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setGastos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Gasto)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleAdd = async (form: FormData) => {
    await addDoc(collection(db, 'gastos'), {
      data: form.data,
      concepte: form.concepte,
      import: parseFloat(form.import),
      pagatPer: form.pagatPer,
      creatAt: Timestamp.now(),
      afegitPer: user?.displayName ?? user?.email ?? '',
    });
  };

  const handleDelete = async (g: Gasto) => {
    await deleteDoc(doc(db, 'gastos', g.id));
    setConfirmDelete(null);
  };

  const total = gastos.reduce((s, g) => s + g.import, 0);

  const perMembre = MEMBRES.map(m => ({
    nom: m,
    total: gastos.filter(g => g.pagatPer === m).reduce((s, g) => s + g.import, 0),
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 sidebar-scroll">

      {showForm && (
        <GastoForm onSave={handleAdd} onClose={() => setShowForm(false)} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Eliminar gasto</h3>
            <p className="text-sm text-gray-600 mb-5">
              Segur que vols eliminar «{confirmDelete.concepte}»?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm"
              >
                Cancel·lar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Capçalera */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-montserrat text-lg font-black text-orange-500 tracking-tight">
              💰 Gastos del grup
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Visible només per Sergi, Xamo, Cristina i Ari</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus size={15} /> Afegir gasto
          </button>
        </div>

        {/* Resum per membre */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {perMembre.map(m => (
            <div key={m.nom} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${MEMBRE_COLORS[m.nom] ?? 'bg-gray-100 text-gray-600'}`}>
                {m.nom}
              </span>
              <p className="text-base font-black text-gray-900">{formatEur(m.total)}</p>
            </div>
          ))}
        </div>

        {/* Total global */}
        <div className="bg-orange-500 rounded-xl p-4 mb-6 flex items-center justify-between text-white shadow-md">
          <span className="font-bold text-sm">Total acumulat</span>
          <span className="font-black text-xl">{formatEur(total)}</span>
        </div>

        {/* Taula de gastos */}
        {gastos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-gray-500 font-semibold mb-1">Encara no hi ha gastos registrats</p>
            <p className="text-gray-400 text-sm mb-5">Afegiu el primer gasto del grup.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              Afegir primer gasto
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Capçalera taula */}
            <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Data</span>
              <span>Concepte</span>
              <span className="text-right">Import</span>
              <span className="text-center">Qui ha pagat</span>
              <span></span>
            </div>

            {/* Files */}
            {gastos.map((g, i) => (
              <div
                key={g.id}
                className={`grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-4 py-3 items-center text-sm ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-orange-50/30 transition-colors`}
              >
                <span className="text-gray-500 text-xs">{g.data.split('-').reverse().join('/')}</span>
                <span className="text-gray-900 font-medium truncate">{g.concepte}</span>
                <span className="text-gray-900 font-bold text-right">{formatEur(g.import)}</span>
                <span className="text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${MEMBRE_COLORS[g.pagatPer] ?? 'bg-gray-100 text-gray-600'}`}>
                    {g.pagatPer}
                  </span>
                </span>
                <button
                  onClick={() => setConfirmDelete(g)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
