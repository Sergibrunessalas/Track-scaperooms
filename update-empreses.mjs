import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, 'src', 'data', 'escape-rooms.json');
const rooms = JSON.parse(readFileSync(path, 'utf8'));

// Derived from each room's official web URL or known brand name
const empreses = {
  'er-001': 'The City Escape Room',
  'er-002': 'Elements Escape Room',
  'er-003': 'La Iniciativa',
  'er-004': 'Elements Escape Room',
  'er-005': 'Neverland Escape',
  'er-006': 'Quimera Escape',
  'er-007': 'Cubick Room Escape',
  'er-008': 'Odisea Escape',
  'er-009': 'Play Escape Room',
  'er-010': 'Cubick Room Escape',
  'er-011': 'Cubick Room Escape',
  'er-012': 'Red Dopamine',
  'er-013': 'Bajo Segunda',
  'er-014': 'The City Escape Room',
  'er-015': 'Cindy Escape Box',
  'er-016': 'Xcape Room BCN',
  'er-017': 'Inmortal Room',
  'er-018': 'Terror Stories',
  'er-019': 'Resident Riddle',
  'er-020': 'Odisea Escape',
  'er-021': 'Fugitivos Room Escape',
  'er-022': 'Elements Escape Room',
  'er-023': 'Insomnia Corp',
  'er-024': 'Cindy Escape Box',
  'er-025': 'Elements Escape Room',
  'er-026': 'Key Play',
  'er-027': 'Malum Escape Room',
  'er-028': 'Rowka Escape Room',
  'er-029': 'Outline Escape Room',
  'er-030': 'Resident Riddle',
  'er-031': 'Elements Escape Room',
  'er-032': 'Red Dopamine',
  'er-033': 'Lock & Clock',
  'er-034': 'Play Escape Room',
  'er-035': 'Play Escape Room',
  'er-036': 'Horror Box',
  'er-037': 'The Rombo Code',
  'er-038': 'Vive Tu Entierro',
  'er-039': 'The Hive',
  'er-040': 'Quimera Escape',
  'er-041': 'Escape Barcelona',
  'er-042': 'Maximum Escape',
  'er-043': 'Open Mind Room Escape',
  'er-044': 'The Rombo Code',
  'er-045': 'Unreal Room Escape',
  'er-046': 'Xcape Room BCN',
  'er-047': 'Prison Experience',
  'er-048': 'Lock & Clock',
  'er-049': 'Escape Hunt',
  'er-050': 'Mystery Escape',
  'er-051': 'Mystery Escape',
  'er-052': 'El Proyecto de la Bruja',
  'er-053': 'Los Tesoros de la Historia',
  'er-054': 'Enigma Legacy',
  'er-055': 'Enigmik',
  'er-056': 'Fugitivos Room Escape',
  'er-057': 'Escape Hunt',
  'er-058': 'Aventurico',
  'er-059': 'Xcape Room BCN',
  'er-060': 'Maximum Escape',
  'er-061': 'Horror Box',
  'er-062': 'Aventurico',
  'er-063': 'Golden Pop',
  'er-064': 'Escape Barcelona',
  'er-065': 'Mystery Escape',
  'er-066': 'The Hive',
  'er-067': 'Prison Experience',
  'er-068': 'Fugitivos Room Escape',
  'er-069': 'Fugitivos Room Escape',
  'er-070': 'Fugitivos Room Escape',
  'er-071': 'Room Whitechapel',
  'er-072': 'Emotion Escape',
  'er-073': 'Prison Experience',
  'er-074': 'The Rombo Code',
  'er-075': 'The Rombo Code',
  'er-076': 'Escape Hunt',
  'er-077': 'Escape Hunt',
  'er-078': 'Lock & Clock',
  'er-079': 'Open Mind Room Escape',
  'er-080': 'Horror Box',
  'er-081': 'Picadero Motel',
  'er-082': 'Kadabra Escape',
  'er-083': 'Maximum Escape',
  'er-084': 'Profana Escape Room',
  'er-085': 'Lock & Clock',
  'er-086': 'Maximum Escape',
  'er-087': 'Quimera Escape',
  'er-088': 'Maximum Escape',
  'er-089': 'Unreal Room Escape',
  'er-090': 'The Hive',
  'er-091': 'The Rombo Code',
  'er-092': 'Maximum Escape',
  'er-093': 'Maximum Escape',
};

const updated = rooms.map(r => ({ ...r, empresa: empreses[r.id] ?? r.empresa ?? '' }));

writeFileSync(path, JSON.stringify(updated, null, 2));

// Print summary
const byCompany = {};
updated.forEach(r => {
  byCompany[r.empresa] = (byCompany[r.empresa] || 0) + 1;
});
const sorted = Object.entries(byCompany).sort((a, b) => b[1] - a[1]);
console.log('\nCompanyies per nombre de sales:');
sorted.forEach(([emp, n]) => console.log(`  ${n}x  ${emp}`));
console.log(`\nTotal: ${updated.length} escape rooms actualitzats.`);
