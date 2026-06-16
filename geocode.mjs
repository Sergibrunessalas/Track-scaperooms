import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, 'src', 'data', 'escape-rooms.json');

const rooms = JSON.parse(readFileSync(dataPath, 'utf8'));

const delay = ms => new Promise(r => setTimeout(r, ms));

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=0`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EscapeRoomsTracker/1.0 sbrunessalas@gmail.com',
      'Accept-Language': 'ca,es',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

let count = 0;
for (const room of rooms) {
  if (room.lat !== null && room.lng !== null) continue;
  if (!room.localitzacio) continue;

  process.stdout.write(`[${room.id}] ${room.nom} ... `);
  try {
    await delay(1300);
    const result = await geocode(room.localitzacio);
    if (result) {
      room.lat = result.lat;
      room.lng = result.lng;
      writeFileSync(dataPath, JSON.stringify(rooms, null, 2), 'utf8');
      console.log(`OK (${result.lat.toFixed(4)}, ${result.lng.toFixed(4)})`);
      count++;
    } else {
      console.log('NO TROBAT');
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
}

console.log(`\nFet! ${count} rooms geocodificats.`);
