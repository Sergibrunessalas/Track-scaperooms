import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(dataPath, 'utf8'));

const fixes = {
  // Troya (Neverland): Passeig de Santa Coloma 106 estava 2km al sud
  'er-005': { lat: 41.4481963, lng: 2.1993434 },

  // Seven (Quimera): adreça era del narratiu fictici del joc, no la real
  'er-006': {
    localitzacio: 'Carrer Rioja, 22, 08521 Les Franqueses del Vallès, Barcelona',
    lat: 41.6217787,
    lng: 2.2985964,
  },

  // El Diario de Miko (Xcape): coordenades apuntaven al nord de Badalona (41.575!)
  'er-046': { lat: 41.4186, lng: 2.1779 },

  // Galería de Cadáveres (Xcape): mateix error que el 046, mateixa adreça
  'er-059': { lat: 41.4186, lng: 2.1779 },

  // Misión SWAT (Open Mind): adreça era d'Outline (empresa diferent)
  'er-079': {
    localitzacio: 'Carrer Travessera, 10, 08940 Cornellà de Llobregat, Barcelona',
    lat: 41.3647761,
    lng: 2.0773367,
  },
};

let count = 0;
for (const room of rooms) {
  const fix = fixes[room.id];
  if (fix) {
    Object.assign(room, fix);
    console.log(`✓ ${room.id} ${room.nom}`);
    count++;
  }
}

writeFileSync(dataPath, JSON.stringify(rooms, null, 2), 'utf8');
console.log(`\nCorregits ${count} errors de coordenades/adreça.`);
