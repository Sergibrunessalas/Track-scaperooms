import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(path, 'utf8'));

const migrated = rooms.map((r) => {
  const numParts = Math.max(1, (r.participants?.trim().split(/\s+/).filter(Boolean).length) || 1);

  const dificultats = Array.from({ length: numParts }, (_, i) =>
    ([r.dificultat, r.dificultat2, r.dificultat3, r.dificultat4][i]) ?? ''
  );

  const ratings = Array.from({ length: numParts }, (_, i) => {
    const keys = [
      ['decoracio','gameMaster','proves'],
      ['decoracio2','gameMaster2','proves2'],
      ['decoracio3','gameMaster3','proves3'],
      ['decoracio4','gameMaster4','proves4'],
    ][i] || ['decoracio','gameMaster','proves'];
    return {
      decoracio: r[keys[0]] ?? null,
      gameMaster: r[keys[1]] ?? null,
      proves: r[keys[2]] ?? null,
    };
  });

  const { dificultat, dificultat2, dificultat3, dificultat4,
    decoracio, gameMaster, proves,
    decoracio2, gameMaster2, proves2,
    decoracio3, gameMaster3, proves3,
    decoracio4, gameMaster4, proves4,
    nota2, nota3, nota4, ...rest } = r;

  return { ...rest, dificultats, ratings };
});

writeFileSync(path, JSON.stringify(migrated, null, 2), 'utf8');
console.log(`Migrats ${migrated.length} escape rooms al nou format d'arrays.`);
