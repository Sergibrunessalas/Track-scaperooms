import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(dataPath, 'utf8'));

// Only update rooms that currently have no price
const novaPreus = {
  'er-008': 'des de 14€/p',   // Odisea Escape: 9p=130€ → 14.4€/p
  'er-012': 'des de 30€/p',   // Red Dopamine Awaken (EscapeUp)
  'er-013': 'des de 14€/p',   // Bajo Segunda: 5p=70€ → 14€/p
  'er-014': 'des de 15€/p',   // The City Escape Room (Terrassa)
  'er-017': 'des de 13€/p',   // InMortal Room: 6p=80€ → 13.3€/p
  'er-018': '',                 // Terror Stories El Exorcista: no publicat
  'er-019': 'des de 22€/p',   // Resident Riddle El Invernadero (EscapeUp)
  'er-020': 'des de 23€/p',   // Odisea Escape Evermore: 7p=160€ → 22.9€/p
  'er-023': 'des de 17€/p',   // Insomnia Corporation La Casa: 6p=100€ → 16.7€/p
  'er-026': 'des de 22€/p',   // Key Play Los Mundos de Alicia (EscapeUp)
  'er-027': 'des de 22€/p',   // Malum/Krematorium: ~28€/p (3p), estim. 22€/p (6p)
  'er-028': 'des de 21€/p',   // Rowka Organum: 8p=170€ → 21.25€/p
  'er-030': 'des de 25€/p',   // Resident Riddle Randall's Party (EscapeUp)
  'er-032': 'des de 17€/p',   // Red Dopamine Achijira: 17-28€/p
  'er-036': 'des de 20€/p',   // Horror Box Biohazard: 8p=160€ → 20€/p
  'er-038': '20€/p',           // Horror Box Catalepsia: 2p=40€ → 20€/p (màx 2p)
  'er-041': 'des de 17€/p',   // Escape Barcelona Cybercity: 6p=100€ → 16.7€/p
  'er-053': '',                 // El Tesoro de Barcelona: consultar (exterior)
  'er-054': 'des de 20€/p',   // Enigma El Virus: 6p=117.6€ → 19.6€/p
  'er-055': 'des de 21€/p',   // Enigmik NW6 Bunker
  'er-056': 'des de 22€/p',   // Escapestory (Fugitivos)
  'er-061': 'des de 20€/p',   // Horror Box Jigsaw: 8p=160€ → 20€/p
  'er-063': '40€/p',           // Golden Pop Jurásico: 40€/p (3-6p)
  'er-064': 'des de 20€/p',   // Escape Barcelona K.O.N.G.: 7p=140€ → 20€/p
  'er-071': 'des de 13€/p',   // Whitechapel La Historia de Charlotte: 6p=80€ → 13.3€/p
  'er-072': 'des de 8€/p',    // Emotion La Nube: 8p=60€ → 7.5€/p (sala infantil)
  'er-080': 'des de 20€/p',   // Horror Box Ouija: mateixos preus que Jigsaw
  'er-082': 'des de 14€/p',   // Kadabra Poison Mataró: 7p=100€ → 14.3€/p
  'er-085': 'des de 21€/p',   // Lock-Clock Servei Secret
};

let updated = 0;
for (const room of rooms) {
  if (room.id in novaPreus && !room.preu) {
    room.preu = novaPreus[room.id];
    if (room.preu) updated++;
  }
}

writeFileSync(dataPath, JSON.stringify(rooms, null, 2), 'utf8');
console.log(`Actualitzats ${updated} rooms amb preu nou.`);

// Show remaining empty
const sense = rooms.filter(r => !r.preu);
if (sense.length) {
  console.log(`\nSense preu (${sense.length}):`);
  sense.forEach(r => console.log(`  ${r.id} | ${r.nom}`));
}
