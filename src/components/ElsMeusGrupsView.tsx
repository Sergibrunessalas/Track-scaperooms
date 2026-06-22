import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronRight, Trash2, Users, Star, Pencil, Plus } from 'lucide-react';
import type { Grup, GrupRoom } from '../types';
import type { User } from 'firebase/auth';
import EditGrupModal from './EditGrupModal';
import EditGrupRoomModal from './EditGrupRoomModal';

const SUPER_ADMIN = 'sbrunessalas@gmail.com';

interface Props {
  currentUserEmail: string;
  user: User;
  onNoMoreGroups: () => void;
  onWantsNewGroup: () => void;
}


export default function ElsMeusGrupsView({ currentUserEmail, onNoMoreGroups, onWantsNewGroup }: Props) {
  const [grups, setGrups] = useState<Grup[]>([]);
  const [selectedGrup, setSelectedGrup] = useState<Grup | null>(null);
  const [grupRooms, setGrupRooms] = useState<GrupRoom[]>([]);
  const [askCreateNew, setAskCreateNew] = useState(false);
  const [editingGrup, setEditingGrup] = useState<Grup | null>(null);
  const [editingRoom, setEditingRoom] = useState<GrupRoom | null>(null);

  useEffect(() => {
    if (!currentUserEmail) return;
    const q = query(
      collection(db, 'grups'),
      where('membresCorreus', 'array-contains', currentUserEmail.toLowerCase())
    );
    return onSnapshot(q, snap =>
      setGrups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Grup)))
    );
  }, [currentUserEmail]);

  useEffect(() => {
    if (!selectedGrup) { setGrupRooms([]); return; }
    return onSnapshot(
      collection(db, 'grups', selectedGrup.id, 'rooms'),
      snap => setGrupRooms(snap.docs.map(d => d.data() as GrupRoom))
    );
  }, [selectedGrup]);

  async function removeRoom(roomId: string) {
    if (!selectedGrup) return;
    if (!confirm('Treure aquesta sala del grup?')) return;
    await deleteDoc(doc(db, 'grups', selectedGrup.id, 'rooms', roomId));
  }

  async function deleteGrup(g: Grup) {
    const canDelete = g.titular === currentUserEmail || currentUserEmail === SUPER_ADMIN;
    if (!canDelete) return;
    if (!confirm(`Segur que vols eliminar el grup "${g.nom}"?`)) return;
    await deleteDoc(doc(db, 'grups', g.id));
    setSelectedGrup(null);
    // Si ja no queden grups, preguntem si vol crear-ne un altre
    const remaining = grups.filter(gr => gr.id !== g.id);
    if (remaining.length === 0) setAskCreateNew(true);
  }

  // Vista detall d'un grup
  if (selectedGrup) {
    const rated = grupRooms.filter(r => r.puntuacio !== null);
    const avg = rated.length
      ? rated.reduce((s, r) => s + r.puntuacio!, 0) / rated.length
      : null;

    return (
      <div className="flex-1 overflow-y-auto sidebar-scroll bg-gray-50">
        {editingRoom && selectedGrup && (
          <EditGrupRoomModal
            grupId={selectedGrup.id}
            room={editingRoom}
            onClose={() => setEditingRoom(null)}
          />
        )}

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <button onClick={() => setSelectedGrup(null)} className="hover:text-accent transition-colors">
              Els meus grups
            </button>
            <span>›</span>
            <span className="text-gray-700 font-medium">{selectedGrup.nom}</span>
          </nav>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total sales', value: grupRooms.length, icon: '🗺' },
              { label: 'Valorades', value: rated.length, icon: '⭐' },
              { label: 'Nota mitjana', value: avg ? avg.toFixed(1) : '—', icon: '📊' },
              { label: 'Pendents', value: grupRooms.length - rated.length, icon: '⏳' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-2xl font-black text-gray-900 font-montserrat">{value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Llista de sales */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Sales del grup ({grupRooms.length})
            </h3>
            {grupRooms.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                <p className="text-3xl mb-2">🔐</p>
                <p className="text-sm">Encara no heu afegit cap sala.</p>
                <p className="text-xs mt-1">Ves a la pestanya <strong>Web</strong> i clica la icona ➕ a qualsevol sala.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grupRooms.map(r => {
                  const temes = [r.tematica1, r.tematica2].filter(Boolean);
                  return (
                    <div key={r.roomId} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2">
                      {/* Capçalera targeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 leading-snug">{r.nom}</p>
                          {r.empresa && <p className="text-xs text-gray-400">{r.empresa}</p>}
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => setEditingRoom(r)}
                            className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                            title="Editar les meves dades"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => removeRoom(r.roomId)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                            title="Treure del grup"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Info pre-omplerta */}
                      {(r.comarca || temes.length > 0 || r.preu) && (
                        <div className="flex flex-wrap gap-1">
                          {r.comarca && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">📍 {r.comarca}</span>}
                          {temes.map(t => <span key={t} className="text-[10px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full">{t}</span>)}
                          {r.preu && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">{r.preu}</span>}
                        </div>
                      )}

                      {/* Dades personals */}
                      <div className="border-t border-gray-50 pt-2 space-y-1">
                        {r.puntuacio !== null ? (
                          <p className="text-xs font-semibold text-yellow-500">
                            {'★'.repeat(r.puntuacio)}{'☆'.repeat(5 - r.puntuacio)}
                            <span className="text-gray-400 font-normal ml-1">({r.puntuacio}/5)</span>
                          </p>
                        ) : (
                          <p className="text-xs text-gray-300 italic">Sense valoració</p>
                        )}
                        {r.data && <p className="text-xs text-gray-400">📅 {r.data}</p>}
                        {r.dificultats?.[0] && <p className="text-xs text-gray-400">🎯 {r.dificultats[0]}</p>}
                        {r.participants && <p className="text-xs text-gray-400">👥 {r.participants}</p>}
                        {r.comentaris && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 italic">"{r.comentaris}"</p>
                        )}
                        {!r.data && !r.participants && r.puntuacio === null && (
                          <button
                            onClick={() => setEditingRoom(r)}
                            className="text-xs text-orange-400 hover:text-orange-600 font-medium transition-colors"
                          >
                            ✏️ Afegir les teves dades
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Diàleg "Vols crear un altre grup?"
  if (askCreateNew) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center flex flex-col gap-5">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Users size={28} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-montserrat font-black text-gray-900 text-lg mb-1">Grup eliminat</h3>
            <p className="text-sm text-gray-500">Vols crear un altre grup?</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setAskCreateNew(false); onWantsNewGroup(); }}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Sí, crear un nou grup
            </button>
            <button
              onClick={() => { setAskCreateNew(false); onNoMoreGroups(); }}
              className="w-full py-2.5 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              No, continuar navegant
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista llista de grups
  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll bg-gray-50">
      {editingGrup && (
        <EditGrupModal grup={editingGrup} onClose={() => setEditingGrup(null)} />
      )}

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-montserrat text-xl font-black text-gray-900">Els meus grups</h2>
          <button
            onClick={onWantsNewGroup}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-dark transition-colors"
          >
            <Plus size={15} />
            Nou grup
          </button>
        </div>

        {grups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Encara no formes part de cap grup.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grups.map(g => {
              const canDelete = g.titular === currentUserEmail || currentUserEmail === SUPER_ADMIN;
              return (
                <div
                  key={g.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-accent/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 text-sm truncate">{g.nom}</span>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {/* Editar: tots els membres */}
                      <button
                        onClick={() => setEditingGrup(g)}
                        className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
                        title="Editar grup"
                      >
                        <Pencil size={13} />
                      </button>
                      {/* Veure estadístiques */}
                      <button
                        onClick={() => setSelectedGrup(g)}
                        className="p-1.5 text-gray-300 hover:text-accent transition-colors"
                        title="Veure estadístiques"
                      >
                        <ChevronRight size={14} />
                      </button>
                      {/* Eliminar: només titular + Sergi */}
                      {canDelete && (
                        <button
                          onClick={() => deleteGrup(g)}
                          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                          title="Eliminar grup"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative group/members">
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 cursor-default w-fit">
                      <Users size={11} />
                      {(g.membresCorreus ?? []).length} membre{(g.membresCorreus ?? []).length !== 1 ? 's' : ''}
                    </p>
                    {/* Tooltip membres */}
                    {g.membres && g.membres.length > 0 && (
                      <div className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px] hidden group-hover/members:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Membres del grup</p>
                        <ul className="space-y-1.5">
                          {g.membres.map((m, i) => (
                            <li key={i} className="flex flex-col">
                              {m.nom && <span className="text-xs font-semibold text-gray-800">{m.nom}</span>}
                              {m.correu && <span className="text-[10px] text-gray-400">{m.correu}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedGrup(g)}
                    className="w-full mt-3 pt-3 border-t border-gray-50 text-xs font-semibold text-accent flex items-center gap-1"
                  >
                    <Star size={10} />
                    Veure estadístiques
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
