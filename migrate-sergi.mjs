import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(path, 'utf8'));

let migrated = 0;

const updated = rooms.map(r => {
  const parts = (r.participants || '').trim().split(/\s+/).filter(Boolean);
  const sergiIdx = parts.findIndex(p => p.toLowerCase() === 'sergi');

  // Sergi not found or already at index 0 → no change
  if (sergiIdx <= 0) return r;

  // Check if index 0 has data and Sergi's index is empty
  const r0 = r.ratings?.[0] ?? {};
  const hasData0 = r0.decoracio != null || r0.gameMaster != null || r0.proves != null;
  const rS = r.ratings?.[sergiIdx] ?? {};
  const hasDataSergi = rS.decoracio != null || rS.gameMaster != null || rS.proves != null;

  if (!hasData0 || hasDataSergi) return r;

  // Expand arrays if needed
  const dificultats = Array.from(
    { length: Math.max((r.dificultats || []).length, sergiIdx + 1) },
    (_, i) => (r.dificultats || [])[i] ?? ''
  );
  const ratings = Array.from(
    { length: Math.max((r.ratings || []).length, sergiIdx + 1) },
    (_, i) => (r.ratings || [])[i] ?? { decoracio: null, gameMaster: null, proves: null }
  );

  // Move index 0 → sergiIdx, clear index 0
  dificultats[sergiIdx] = dificultats[0];
  dificultats[0] = '';
  ratings[sergiIdx] = { ...ratings[0] };
  ratings[0] = { decoracio: null, gameMaster: null, proves: null };

  migrated++;
  console.log(`  ✓ ${r.id} ${r.nom.padEnd(40)} Sergi @ idx ${sergiIdx} (${parts.join(' ')})`);
  return { ...r, dificultats, ratings };
});

writeFileSync(path, JSON.stringify(updated, null, 2));
console.log(`\nMigrats ${migrated} escape rooms. Valoracions mogudes a la posició del Sergi.`);
