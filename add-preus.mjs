import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(dataPath, 'utf8'));

const preus = {
  'er-001': 'consultar web',           // The City Escape Room - no publicat
  'er-002': 'des de 30€/p',            // Elements Escape Room - Exodus
  'er-003': 'des de 20€/p',            // La Iniciativa - Granollers
  'er-004': 'des de 25€/p',            // Elements Aire - Bajo cero
  'er-005': 'des de 20€/p',            // Neverland Escape - Troya
  'er-006': 'des de 20€/p',            // Quimera Escape - Seven
  'er-007': 'des de 25€/p',            // Cubick - Siro 3.0
  'er-008': '',                          // La Mansión Odisea - no trobat
  'er-009': 'des de 22€/p',            // Play Escape Room - Origen
  'er-010': 'des de 25€/p',            // Cubick - Scubick-Doo
  'er-011': 'des de 25€/p',            // Cubick - La entrevista
  'er-012': '',                          // Awaken - no trobat
  'er-013': '',                          // Bajo 2ª - no trobat
  'er-014': '',                          // Base secreta - no trobat
  'er-015': '25€/p',                    // Cindy Escape Box - Blasfemia
  'er-016': 'des de 18€/p',            // Xcape - Casino Royal
  'er-017': '',                          // Diamante de almas - no trobat
  'er-018': '',                          // El exorcista - no trobat
  'er-019': '',                          // Resident Riddle - El invernadero
  'er-020': '',                          // Evermore - no trobat
  'er-021': 'des de 22€/p',            // Fugitivos Room Escape
  'er-022': 'des de 35€/p',            // Elements Esplugues - Katrina
  'er-023': '',                          // Insomnia Corporation - La casa
  'er-024': '25€/p',                    // Cindy Escape Box - La isla de las muñecas
  'er-025': 'des de 25€/p',            // Elements Aire - Lightshift
  'er-026': '',                          // Los mundos de Alicia - no trobat
  'er-027': '',                          // Malum - no trobat
  'er-028': '',                          // Organum - no trobat
  'er-029': 'des de 30€/p',            // Outline Escape Room
  'er-030': '',                          // Resident Riddle - Randall's Party
  'er-031': 'des de 15€/p',            // Elements Aire - La reina roja
  'er-032': '',                          // Achijira - no trobat
  'er-033': 'des de 23€/p',            // Lock-Clock - After-Party
  'er-034': 'des de 22€/p',            // Play Escape Room - Alkatraz Classic
  'er-035': 'des de 22€/p',            // Play Escape Room - Alkatraz Medieval
  'er-036': '',                          // Horror Box - Biohazard (no publicat)
  'er-037': 'des de 15€/p',            // The Rombo Code - Casanova
  'er-038': '',                          // Horror Box - Catalepsia (no publicat)
  'er-039': 'des de 18€/p',            // The Hive - Chernobyl 2.0
  'er-040': 'des de 23€/p',            // Quimera Escape - Crupier
  'er-041': '',                          // Cybercity 2049 - no trobat
  'er-042': 'des de 27€/p',            // Maximum Escape - Damn Fame!
  'er-043': 'des de 20€/p',            // Open Mind - El 11S
  'er-044': 'des de 15€/p',            // The Rombo Code - El Arca de Dalí
  'er-045': 'des de 21€/p',            // Unreal Room Escape - El Bar
  'er-046': 'des de 18€/p',            // Xcape - El Diario de Miko
  'er-047': 'des de 13€/p',            // Prison Experience - El Final del Túnel
  'er-048': 'des de 19€/p',            // Lock-Clock - El Laberinto del Tiempo
  'er-049': 'des de 23€/p',            // Escape Hunt - El Misterio de Gaudí
  'er-050': 'des de 20€/p',            // Mystery Escape - El Misterio de la Mansión (1)
  'er-051': 'des de 20€/p',            // Mystery Escape - El Misterio de la Mansión (2)
  'er-052': 'des de 18€/p',            // Picadero Motel - El Projecte de la Bruixa
  'er-053': '',                          // El Tesoro de Barcelona - no trobat
  'er-054': '',                          // El Virus - no trobat
  'er-055': '',                          // Enigmik - no trobat
  'er-056': '',                          // Escapestory - no trobat
  'er-057': 'des de 23€/p',            // Escape Hunt - Escola de Lladres
  'er-058': 'des de 18€/p',            // Aventurico - Espies de Gala
  'er-059': 'des de 18€/p',            // Xcape - Galería de Cadáveres
  'er-060': 'des de 27€/p',            // Maximum Escape - Gangsters
  'er-061': '',                          // Horror Box - Jigsaw (no publicat)
  'er-062': 'des de 18€/p',            // Aventurico - Jumanji
  'er-063': '',                          // Jurásico - no trobat
  'er-064': '',                          // K.O.N.G. Protocol - no trobat
  'er-065': 'des de 20€/p',            // Mystery Escape - La Cámara Acorazada
  'er-066': 'des de 18€/p',            // The Hive - La Casa Paranormal
  'er-067': 'des de 13€/p',            // Prison Experience - La Ducha Fría
  'er-068': 'des de 22€/p',            // Fugitivos - La Fortaleza
  'er-069': 'des de 22€/p',            // Fugitivos - La Fortaleza 2.0
  'er-070': 'des de 20€/p',            // Fugitivos - La Fortaleza Kids
  'er-071': '',                          // La Historia de Charlotte - no trobat
  'er-072': '',                          // La Nube - no trobat
  'er-073': 'des de 13€/p',            // Prison Experience - La Toma de Control
  'er-074': 'des de 15€/p',            // The Rombo Code - La Última Función (1)
  'er-075': 'des de 15€/p',            // The Rombo Code - La Última Función (2)
  'er-076': 'des de 23€/p',            // Escape Hunt - La Vampira de Barcelona (1)
  'er-077': 'des de 23€/p',            // Escape Hunt - La Vampira de Barcelona (2)
  'er-078': 'des de 21€/p',            // Lock-Clock - Misió Gaudí
  'er-079': 'des de 20€/p',            // Open Mind - Misión S.W.A.T.
  'er-080': '',                          // Horror Box - Ouija (no publicat)
  'er-081': 'des de 18€/p',            // Picadero Motel
  'er-082': '',                          // Poison - no trobat
  'er-083': 'des de 27€/p',            // Maximum Escape - Prisoners of Alkaban
  'er-084': 'des de 18€/p',            // Psicópatas Anónimos - Profana
  'er-085': '',                          // Servei Secret - no trobat
  'er-086': 'des de 27€/p',            // Maximum Escape - Sherlock Holmes
  'er-087': 'des de 25€/p',            // Quimera Escape - Sustos S.A.
  'er-088': 'des de 27€/p',            // Maximum Escape - The Dungeon
  'er-089': 'des de 21€/p',            // Unreal Room Escape - The Narcos
  'er-090': 'des de 18€/p',            // The Hive - The Z Lab
  'er-091': 'des de 15€/p',            // The Rombo Code - Tras el Espejo
  'er-092': 'des de 27€/p',            // Maximum Escape - Ulysses Spaceship
  'er-093': 'des de 30€/p',            // Maximum Escape - Vault 27
};

let updated = 0;
for (const room of rooms) {
  const preu = preus[room.id];
  if (preu !== undefined) {
    room.preu = preu;
    if (preu) updated++;
  } else if (!room.preu) {
    room.preu = '';
  }
}

writeFileSync(dataPath, JSON.stringify(rooms, null, 2), 'utf8');
console.log(`Fet! ${updated} rooms amb preu actualitzat.`);
