import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

interface BlogPost {
  id: string;
  titol: string;
  resum: string;
  contingut: string;
  imatgeUrl: string;
  publicatAt: Timestamp | null;
  autor: string;
}

interface FormData {
  titol: string;
  resum: string;
  contingut: string;
  imatgeUrl: string;
}

interface Props {
  isAdmin: boolean;
  user: User | null;
}

function formatDate(ts: Timestamp | null): string {
  if (!ts) return '';
  return ts.toDate().toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

function renderContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc pl-5 space-y-1 my-2">
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-base font-bold text-gray-900 mt-5 mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      elements.push(<p key={key++}>{line}</p>);
    }
  }
  flushList();
  return elements;
}

function BlogForm({ post, onSave, onClose }: {
  post: BlogPost | null;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>({
    titol: post?.titol ?? '',
    resum: post?.resum ?? '',
    contingut: post?.contingut ?? '',
    imatgeUrl: post?.imatgeUrl ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titol.trim() || !form.contingut.trim()) return;
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">
            {post ? 'Editar article' : 'Nou article'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Títol *</label>
            <input
              type="text"
              value={form.titol}
              onChange={e => setForm(f => ({ ...f, titol: e.target.value }))}
              placeholder="Títol de l'article..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Resum curt <span className="font-normal text-gray-400">(apareix a la targeta)</span>
            </label>
            <input
              type="text"
              value={form.resum}
              onChange={e => setForm(f => ({ ...f, resum: e.target.value }))}
              placeholder="Una frase breu que descrigui l'article..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              URL de la imatge <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="url"
              value={form.imatgeUrl}
              onChange={e => setForm(f => ({ ...f, imatgeUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Contingut *{' '}
              <span className="font-normal text-gray-400">
                — Escriu <code className="bg-gray-100 px-1 rounded">## </code> per títols i{' '}
                <code className="bg-gray-100 px-1 rounded">- </code> per llistes
              </span>
            </label>
            <textarea
              value={form.contingut}
              onChange={e => setForm(f => ({ ...f, contingut: e.target.value }))}
              placeholder={`Escriu aquí el teu article...\n\nPots organitzar-lo amb seccions:\n\n## Primera secció\nEl text de la secció va aquí.\n\n## Llistes\n- Element 1\n- Element 2\n- Element 3`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 font-mono resize-none"
              rows={14}
              required
            />
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.titol.trim() || !form.contingut.trim()}
            className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-bold disabled:opacity-40 hover:enabled:bg-orange-600 transition-colors"
          >
            {saving ? 'Guardant...' : post ? 'Guardar canvis' : 'Publicar article'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlogView({ isAdmin, user }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), orderBy('publicatAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
      setPosts(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleCreate = async (data: FormData) => {
    await addDoc(collection(db, 'blog_posts'), {
      ...data,
      publicatAt: Timestamp.now(),
      autor: user?.displayName ?? user?.email ?? 'ScapeZone',
    });
  };

  const handleUpdate = async (data: FormData) => {
    if (!editing) return;
    await updateDoc(doc(db, 'blog_posts', editing.id), { ...data });
    setSelected(prev => prev ? { ...prev, ...data } : null);
  };

  const handleDelete = async (post: BlogPost) => {
    await deleteDoc(doc(db, 'blog_posts', post.id));
    setConfirmDelete(null);
    if (selected?.id === post.id) setSelected(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 sidebar-scroll">

      {/* Modal nou/editar article */}
      {(showForm || editing) && (
        <BlogForm
          post={editing}
          onSave={editing ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Modal confirmar eliminació */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Eliminar article</h3>
            <p className="text-sm text-gray-600 mb-5">
              Segur que vols eliminar «{confirmDelete.titol}»?
              <br /><span className="text-red-500">Aquesta acció no es pot desfer.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
              >
                Cancel·lar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista article individual */}
      {selected ? (
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={15} />
              Tots els articles
            </button>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(selected)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  onClick={() => setConfirmDelete(selected)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            )}
          </div>

          {selected.imatgeUrl && (
            <div className="w-full h-56 rounded-2xl overflow-hidden mb-6 bg-gray-100">
              <img
                src={selected.imatgeUrl}
                alt={selected.titol}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <p className="text-xs text-gray-400 mb-2">
            Publicat el {formatDate(selected.publicatAt)}
            {selected.autor && <span className="ml-2">· {selected.autor}</span>}
          </p>
          <h1 className="font-montserrat text-2xl font-black text-gray-900 leading-snug mb-6">
            {selected.titol}
          </h1>

          <div className="text-gray-700 text-sm leading-relaxed space-y-3">
            {renderContent(selected.contingut)}
          </div>
        </div>
      ) : (
        /* Vista llista d'articles */
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-montserrat text-lg font-black text-orange-500 tracking-tight">
                Blog ScapeZone
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{posts.length} {posts.length === 1 ? 'article' : 'articles'} publicats</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus size={15} /> Nou article
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">✍️</p>
              <p className="text-gray-500 font-semibold mb-1">Encara no hi ha articles</p>
              <p className="text-gray-400 text-sm mb-6">Comença a compartir experiències, consells i novetats de ScapeZone.</p>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                >
                  Crea el primer article
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelected(post)}
                  className="text-left bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-full h-36 overflow-hidden bg-gray-100">
                    {post.imatgeUrl ? (
                      <img
                        src={post.imatgeUrl}
                        alt={post.titol}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🔐</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 mb-1">
                      {post.titol}
                    </p>
                    {post.resum && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">{post.resum}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(post.publicatAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
