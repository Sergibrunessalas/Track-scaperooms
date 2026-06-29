import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE  = 'scapezone';
const EMAILJS_TEMPLATE = 'template_xmx5xzg';
const EMAILJS_KEY      = 'ZwdPQou70VBa7c5Bh';

export default function UneixteView() {
  const formRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nom: '', cognoms: '', empresa: '', email: '', telefon: '', missatge: '',
  });

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        nom:     form.nom,
        cognoms: form.cognoms,
        empresa: form.empresa,
        email:   form.email,
        telefon: form.telefon,
        missatge: form.missatge,
      }, EMAILJS_KEY);
      setSent(true);
    } catch {
      setError("No s'ha pogut enviar el missatge. Torna-ho a intentar.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll bg-white">

      {/* ── Secció hero ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">

        {/* Text esquerra */}
        <div className="flex-1 max-w-lg">
          <h1 className="font-montserrat text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
            Tens un{' '}
            <span className="text-accent">Escape Room?</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Uneix-te a la plataforma que posa les teves aventures a la mà de milers d'usuaris que busquen Escape Rooms a diari.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-full text-base transition-colors shadow-lg"
          >
            Més Informació
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Imatge dreta */}
        <div className="flex-1 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full">
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80"
              alt="Usuari a la plataforma ScapeZone"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Divisor ── */}
      <div className="border-t border-gray-100" />

      {/* ── Formulari de contacte ── */}
      <section ref={formRef} className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="font-montserrat text-3xl font-black text-gray-900 text-center mb-2">Contacte</h2>
        <p className="text-center text-gray-400 mb-10 text-sm">
          Deixa'ns les teves dades i et contactarem en menys de 24 hores
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-montserrat font-black text-gray-900 text-lg mb-1">Gràcies pel teu interès!</p>
            <p className="text-gray-500 text-sm mb-6">En breu ens posarem en contacte amb tu.</p>
            <button
              onClick={() => { setSent(false); setForm({ nom: '', cognoms: '', empresa: '', email: '', telefon: '', missatge: '' }); }}
              className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Enviar un altre missatge
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom + Cognoms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                <input
                  type="text" name="nom" value={form.nom} onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cognoms</label>
                <input
                  type="text" name="cognoms" value={form.cognoms} onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Empresa</label>
              <input
                type="text" name="empresa" value={form.empresa} onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            {/* Telèfon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telèfon</label>
              <input
                type="tel" name="telefon" value={form.telefon} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            {/* Missatge */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Missatge</label>
              <textarea
                name="missatge" value={form.missatge} onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
              />
            </div>

            {/* Botó enviar */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-base transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? 'Enviant...' : 'Enviar'}
            </button>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
