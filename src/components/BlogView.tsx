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
    id: 'tipos-jugadores',
    titol: 'Los 7 tipos de jugadores que encontrarás en cualquier escape room',
    data: '20/03/2026',
    imatge: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    contingut: (
      <div className="article-body">
        <p>Si has jugado varios escape rooms, probablemente ya te habrás dado cuenta de algo: los enigmas cambian, las historias cambian y las salas cambian, pero los tipos de jugadores suelen repetirse.</p>
        <p>Y, seamos sinceros, todos hemos sido alguno de ellos.</p>

        <h2>1. El líder nato</h2>
        <p>Nada más entrar ya ha elegido un equipo, ha repartido tareas y ha decidido por dónde empezar.</p>
        <p>Frases habituales:</p>
        <ul>
          <li>«Vosotros buscad allí.»</li>
          <li>«Dejadme pensar un momento.»</li>
          <li>«Tenemos que organizarnos.»</li>
        </ul>
        <p>Su mayor virtud es mantener al grupo enfocado. Su mayor peligro es intentar resolverlo todo él solo.</p>

        <h2>2. El detective obsesivo</h2>
        <p>Observa absolutamente todo. Lee cada papel tres veces. Sospecha de cada detalle.</p>
        <p>A veces encuentra la pista clave. Otras veces lleva al grupo a investigar una mancha de humedad durante veinte minutos.</p>
        <p>Sin embargo, gracias a él muchos equipos descubren detalles que otros pasarían por alto.</p>

        <h2>3. El abrecandados</h2>
        <p>Tiene un don especial. No importa dónde esté el candado: siempre aparece él.</p>
        <p>En algunos grupos existe incluso una pequeña competición por ver quién abre más.</p>
        <p>Su frase favorita: <strong>«¡Lo tengo!»</strong></p>
        <p>Y aunque a veces no recuerde cómo llegó a la solución, suele convertirse en el héroe del equipo.</p>

        <h2>4. El despistado entrañable</h2>
        <p>No sabe muy bien qué está pasando. Ha olvidado varias pistas. Hace preguntas que ya se han respondido.</p>
        <p>Pero, sorprendentemente, en ocasiones resuelve el enigma más difícil con una idea completamente inesperada.</p>
        <p>Todo grupo necesita un despistado. Aporta humor, rompe la tensión y recuerda que estamos jugando.</p>

        <h2>5. El actor</h2>
        <p>Especialmente presente en experiencias inmersivas y cenas con asesinato. Habla como su personaje. Interpreta. Miente. Improvisa.</p>
        <p>Puede convertir una buena experiencia en una noche inolvidable. Cuando aparece uno de estos jugadores, el resto suele acabar contagiándose.</p>

        <h2>6. El silencioso</h2>
        <p>Observa. Escucha. Habla poco. Pero cuando interviene, normalmente tiene razón.</p>
        <p>Muchas veces es quien conecta varias pistas que el resto había pasado por alto. No todos los jugadores necesitan ser los más visibles para ser imprescindibles.</p>

        <h2>7. El sospechoso permanente</h2>
        <p>En una cena con asesinato siempre existe alguien que acusa a todo el mundo.</p>
        <ul>
          <li>«Seguro que has sido tú.»</li>
          <li>«Eso suena sospechoso.»</li>
          <li>«No me creo nada.»</li>
        </ul>
        <p>Aunque se equivoque constantemente, mantiene viva la investigación y hace que todos se impliquen.</p>

        <h2>¿Cuál eres tú?</h2>
        <p>La realidad es que la mayoría de nosotros somos una mezcla de varios tipos.</p>
        <p>Y precisamente ahí reside la magia de estas experiencias: personas muy diferentes colaborando para resolver un mismo misterio.</p>
        <p>En <strong>ScapeZone</strong> creemos que no existe el jugador perfecto. Existe el equipo perfecto. Y ese suele estar formado por un poco de todos.</p>
      </div>
    ),
  },
  {
    id: 'noche-misterio-casa',
    titol: 'Cómo organizar una noche de misterio en casa',
    data: '20/04/2026',
    imatge: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    contingut: (
      <div className="article-body">
        <p>No hace falta salir de casa para vivir una experiencia inolvidable.</p>

        <p>Con algunos amigos, una buena historia y ganas de jugar, cualquier salón puede convertirse en la escena de un crimen.</p>

        <h2>Consejos para organizar una noche de misterio</h2>

        <ul>
          <li>Invita entre 6 y 10 personas.</li>
          <li>Envía los personajes con antelación.</li>
          <li>Decora ligeramente el espacio.</li>
          <li>Añade música ambiental.</li>
          <li>Sirve comida sencilla.</li>
          <li>Reserva al menos dos horas.</li>
        </ul>

        <p>Lo más importante es que todos los participantes se impliquen en la historia.</p>

        <p>No hace falta ser actor. Basta con dejarse llevar por el personaje, hacer preguntas y disfrutar de la investigación.</p>

        <p>Las mejores noches no son aquellas en las que se descubre rápidamente al culpable, sino aquellas en las que cada jugador consigue sorprender a los demás.</p>

        <p>En <strong>ScapeZone</strong> queremos ayudarte a convertir cualquier reunión en una experiencia única.</p>
      </div>
    ),
  },
  {
    id: 'razones-escape-room',
    titol: '10 razones por las que los escape rooms son el mejor plan entre amigos',
    data: '20/05/2026',
    imatge: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    contingut: (
      <div className="article-body">
        <p>Elegir un buen plan para un grupo de amigos no siempre es fácil. Sin embargo, los escape rooms se han convertido en una de las actividades favoritas por muchos motivos.</p>

        <ol>
          <li>Todo el mundo participa.</li>
          <li>No importa la edad.</li>
          <li>Fomentan el trabajo en equipo.</li>
          <li>Generan recuerdos compartidos.</li>
          <li>Ponen a prueba la creatividad.</li>
          <li>Reducen el estrés.</li>
          <li>Permiten desconectar de las pantallas.</li>
          <li>Son diferentes cada vez.</li>
          <li>Existen temáticas para todos los gustos.</li>
          <li>Siempre hay una historia que contar después.</li>
        </ol>

        <p>Ya sea resolviendo un asesinato, escapando de una prisión o descubriendo un antiguo secreto, los escape rooms consiguen algo que pocas actividades logran: hacer que las personas colaboren, se rían y vivan una auténtica aventura.</p>

        <p>Por eso en <strong>ScapeZone</strong> creemos que un buen misterio es mucho más que un juego: es una experiencia compartida.</p>
      </div>
    ),
  },
  {
    id: 'cena-asesinato',
    titol: '¿Qué es una cena con asesinato y por qué está conquistando España?',
    data: '20/06/2026',
    imatge: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
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
