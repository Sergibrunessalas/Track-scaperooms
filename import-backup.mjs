import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(dataPath, 'utf8'));

// Data extracted and cleaned from backup (encoding fixed manually)
const updates = {
  'er-001': { preu: 'des de 35€/p', imatgeUrl: 'https://i.imgur.com/snWOp6Q.jpeg' },
  'er-002': { imatgeUrl: 'https://i.imgur.com/fRi6TJG.jpeg' },
  'er-006': { imatgeUrl: 'https://i.imgur.com/SvSPF59.jpeg' },
  'er-007': { imatgeUrl: 'https://i.imgur.com/eVZENi8.jpeg' },
  'er-011': { imatgeUrl: 'https://i.imgur.com/hsxq9Yc.jpeg', dificultat: '★★★', decoracio: 3, gameMaster: 4, proves: 3, puntuacio: 3.3 },
  'er-014': { nom: 'Código rojo', imatgeUrl: 'https://i.imgur.com/UXsMK4Y.jpeg', decoracio: 4, gameMaster: 3.5, proves: 4.5, puntuacio: 4, participants: 'Cristina Ari Xamo Sergi' },
  'er-016': { imatgeUrl: 'https://i.imgur.com/thQYxcv.jpeg', data: '18/04/2026', decoracio: 3, gameMaster: 4, proves: 4, puntuacio: 3.7, participants: 'Marc Xamo Sergi' },
  'er-019': { imatgeUrl: 'https://i.imgur.com/Y22cQe2.jpeg', dificultat: '★★★', decoracio: 3, gameMaster: 4, proves: 3, puntuacio: 3.3, preu: 'des de 22€/p' },
  'er-022': { imatgeUrl: 'https://i.imgur.com/DIZpzp2.jpeg' },
  'er-023': { imatgeUrl: 'https://i.imgur.com/vWM1giR.jpeg', preu: 'des de 30€/p' },
  'er-026': { imatgeUrl: 'https://i.imgur.com/Dk1JEWC.jpeg', data: '11/01/2026', dificultat: '★★★', decoracio: 4.5, gameMaster: 4, proves: 5, puntuacio: 4.5 },
  'er-028': { imatgeUrl: 'https://i.imgur.com/IdwkhFe.jpeg', data: '04/01/2026' },
  'er-040': { decoracio: null, gameMaster: null, proves: null, puntuacio: null },
  'er-084': { imatgeUrl: 'https://i.imgur.com/UPkVdDZ.jpeg', data: '25/03/2026' },
  'er-087': { data: '20/06/2026', participants: 'Cristina Xamo Sergi' },
};

let count = 0;
for (const room of rooms) {
  const u = updates[room.id];
  if (u) {
    Object.assign(room, u);
    console.log(`✓ ${room.id} ${room.nom}`);
    count++;
  }
}

writeFileSync(dataPath, JSON.stringify(rooms, null, 2), 'utf8');
console.log(`\nActualitzats ${count} escape rooms amb dades del backup.`);
