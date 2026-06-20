import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(dataPath, 'utf8'));

const webs = {
  // Cubick Mataró
  'er-007': 'https://mataro.cubickroomescape.es/siro-3-0/',
  'er-010': 'https://mataro.cubickroomescape.es/scubick-doo/',
  'er-011': 'https://mataro.cubickroomescape.es/la-entrevista/',

  // Play Escape Room
  'er-009': 'https://playescaperoom.es/reservar/origin',
  'er-035': 'https://playescaperoom.es/reservar/medieval',

  // Quimera
  'er-006': 'https://quimeraescape.com/seven/',
  'er-040': 'https://quimeraescape.com/crupier/',
  'er-087': 'https://quimeraescape.com/sustos/',

  // Xcape
  'er-016': 'https://www.xcaperoombcn.com/room/el-casino-royal/',
  'er-046': 'https://www.xcaperoombcn.com/room/el-diario-de-miko/',
  'er-059': 'https://www.xcaperoombcn.com/room/galeria-de-cadaveres/',

  // Horror Box
  'er-038': 'https://www.vivetuentierro.com',
  'er-061': 'https://horrorbox.es/jigsaw-escape-room/',
  'er-080': 'https://horrorbox.es/ouija-escape-room/',

  // The Rombo Code
  'er-037': 'https://therombocode.es/barcelona/juegos/la-fuga-de-casanova/',
  'er-044': 'https://therombocode.es/barcelona/juegos/el-arca-dedali/',
  'er-074': 'https://therombocode.es/barcelona/juegos/la-ultima-funcion/',
  'er-075': 'https://therombocode.es/barcelona/juegos/la-ultima-funcion/',
  'er-091': 'https://therombocode.es/barcelona/juegos/tras-el-espejo/',

  // The Hive
  'er-039': 'https://thehive.barcelona/chernobyl',
  'er-066': 'https://thehive.barcelona/la-casa-paranormal',
  'er-090': 'https://thehive.barcelona/the-z-lab',

  // Maximum Escape
  'er-060': 'https://maximumescape.com/en/games/Gangsters',
  'er-083': 'https://maximumescape.com/en/games/Alkaban',
  'er-086': 'https://maximumescape.com/en/games/Sherlock',
  'er-088': 'https://maximumescape.com/en/games/Mazmorra',
  'er-092': 'https://maximumescape.com/en/games/Ulysses',
  'er-093': 'https://maximumescape.com/en/games/Vault%2027',

  // Lock-Clock
  'er-033': 'https://lock-clock.com/es/game/after-party',
  'er-048': 'https://lock-clock.com/es/game/el-laberinto-del-tiempo',
  'er-078': 'https://lock-clock.com/es/game/mision-gaudi',
  'er-085': 'https://lock-clock.com/es/game/servicio-secreto',

  // Prison Experience
  'er-047': 'https://prison-experience.com/en/the-end-of-the-tunnel/',
  'er-067': 'https://prison-experience.com/en/the-cold-shower/',
  'er-073': 'https://prison-experience.com/en/the-takeover/',

  // Open Mind
  'er-043': 'https://openmindroomescape.es/11s-escape-room/',
  'er-079': 'https://openmindroomescape.es/mision-swat-escape-room/',

  // Mystery Escape
  'er-050': 'https://mysteryescape.es/reservas-el-misterio-de-la-mansion-mystery-escape/',
  'er-051': 'https://mysteryescape.es/reservas-el-misterio-de-la-mansion-mystery-escape/',
  'er-065': 'https://mysteryescape.es/reservas-la-camara-acorazada-mystery-escape/',

  // Picadero Motel - El Projecte de la Bruixa té web pròpia
  'er-052': 'https://elproyectodelabruja.com/',

  // Unreal Room Escape
  'er-045': 'https://unrealroomescape.es/sants/',
  'er-089': 'https://unrealroomescape.es/hospitalet/',

  // Resident Riddle
  'er-019': 'https://www.residentriddle.es/barcelona/resident-riddle-invernadero-escape-room/',
  'er-030': 'https://www.residentriddle.es/barcelona/randalls-party/',

  // Cindy Escape Box
  'er-015': 'https://cindyescapebox.com/rooms/blasphemia-room-escape',
  'er-024': 'https://cindyescapebox.com/rooms/la-isla-de-las-munecas-escape-room',

  // Fugitivos
  'er-056': 'https://fugitivosroomescape.com/juegos/escapestory/',
  'er-068': 'https://fugitivosroomescape.com/juegos/la-fortaleza/',
  'er-069': 'https://fugitivosroomescape.com/juegos/la-fortaleza/',
  'er-070': 'https://fugitivosroomescape.com/juegos/la-fortaleza-kids/',
};

let updated = 0;
for (const room of rooms) {
  if (webs[room.id]) {
    room.web = webs[room.id];
    updated++;
  }
}

writeFileSync(dataPath, JSON.stringify(rooms, null, 2), 'utf8');
console.log(`Actualitzats ${updated} rooms amb URLs específiques.`);
