import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  titol: string;
  data: string;
  imatge: string;
  contingut: React.ReactNode;
}

const POSTS: BlogPost[] = [
  {
    id: 'cena-asesinato',
    titol: '¿Qué es una cena con asesinato y por qué está conquistando España?',
    data: '20/06/2026',
    imatge: 'https://images.unsplash.com/photo-1580983553320-c9a00f87fe00?w=600&q=80',
    contingut: (
      <div className="prose-content">
        <p>Durante años, los escape rooms han sido una de las actividades de ocio más populares. Sin embargo, una nueva experiencia está ganando cada vez más seguidores: las <strong>cenas con asesinato</strong>.</p>

        <p>Pero ¿qué son exactamente?</p>

        <p>Una cena con asesinato es una experiencia inmersiva en la que los participantes se convierten en personajes de una historia de misterio. Durante la velada, un crimen altera la tranquilidad del grupo y todos los asistentes deben investigar qué ha sucedido.</p>

        <p>Cada jugador recibe información exclusiva, secretos, relaciones con otros personajes e incluso posibles motivos para cometer el crimen.</p>

        <h2>¿Por qué gustan tanto?</h2>

        <ul>
          <li>No hace falta salir de casa.</li>
          <li>Son perfectas para grupos de amigos.</li>
          <li>Fomentan la conversación.</li>
          <li>Cada partida es diferente.</li>
          <li>Todos participan.</li>
        </ul>

        <p>Además, permiten combinar gastronomía, interpretación y resolución de enigmas en una única experiencia.</p>

        <p>En <strong>ScapeZone</strong> creemos que las cenas con asesinato representan el futuro del ocio en grupo: experiencias memorables que convierten una noche cualquiera en una historia que se recuerda durante años.</p>
      </div>
    ),
  },
];

export default function BlogView() {
  const [selected, setSelected] = useState<BlogPost | null>(null);

  if (selected) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 sidebar-scroll">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={15} />
            Últimos artículos
          </button>

          {selected.imatge && (
            <div className="w-full h-56 rounded-2xl overflow-hidden mb-6">
              <img
                src={selected.imatge}
                alt={selected.titol}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <p className="text-xs text-gray-400 mb-2">Publicado {selected.data}</p>
          <h1 className="font-montserrat text-2xl font-black text-gray-900 leading-snug mb-6">
            {selected.titol}
          </h1>

          <div className="article-body text-gray-700 text-sm leading-relaxed space-y-4">
            {selected.contingut}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 sidebar-scroll">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="font-montserrat text-lg font-black text-accent mb-6 tracking-tight">
          Últimos artículos
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {POSTS.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelected(post)}
              className="text-left bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-accent/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-full h-36 overflow-hidden bg-gray-100">
                {post.imatge ? (
                  <img
                    src={post.imatge}
                    alt={post.titol}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🔐</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-accent leading-snug line-clamp-3 mb-1">
                  {post.titol}
                </p>
                <p className="text-xs text-gray-400">Publicado {post.data}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
