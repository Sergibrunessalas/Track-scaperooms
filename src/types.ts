export interface EscapeRoom {
  id: string;
  nom: string;
  localitzacio: string;
  lat: number | null;
  lng: number | null;
  data: string;
  dificultat: string;
  dificultat2?: string;
  dificultat3?: string;
  dificultat4?: string;
  decoracio: number | null;
  gameMaster: number | null;
  proves: number | null;
  decoracio2?: number | null;
  gameMaster2?: number | null;
  proves2?: number | null;
  decoracio3?: number | null;
  gameMaster3?: number | null;
  proves3?: number | null;
  decoracio4?: number | null;
  gameMaster4?: number | null;
  proves4?: number | null;
  puntuacio: number | null;
  comentaris: string;
  participants: string;
  imatgeUrl: string;
  preu: string;
  web: string;
  tematica1: string;
  tematica2: string;
}

export const TEMATIQUES = [
  'Acció', 'Adultos', 'Apocalipsis', 'Aventures', 'Ciència', 'Comèdia',
  'Crim', 'Esports', 'Fantasia', 'Història', 'Infantil',
  'Misteri', 'Mitologia', 'SciFi', 'Tensió', 'Terror',
] as const;

export type Tematica = typeof TEMATIQUES[number];

function noteFromSubs(d: number | null | undefined, g: number | null | undefined, p: number | null | undefined): number | null {
  const subs = [d, g, p].filter((v): v is number => v != null);
  return subs.length > 0 ? subs.reduce((a, b) => a + b, 0) / subs.length : null;
}

export function calcPuntuacio(
  decoracio: number | null,
  gameMaster: number | null,
  proves: number | null,
  decoracio2?: number | null,
  gameMaster2?: number | null,
  proves2?: number | null,
  decoracio3?: number | null,
  gameMaster3?: number | null,
  proves3?: number | null,
  decoracio4?: number | null,
  gameMaster4?: number | null,
  proves4?: number | null,
): number | null {
  const nota1 = noteFromSubs(decoracio, gameMaster, proves);
  const nota2 = noteFromSubs(decoracio2, gameMaster2, proves2);
  const nota3 = noteFromSubs(decoracio3, gameMaster3, proves3);
  const nota4 = noteFromSubs(decoracio4, gameMaster4, proves4);
  const notes = [nota1, nota2, nota3, nota4].filter((v): v is number => v !== null);
  if (!notes.length) return null;
  return Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10;
}

export function starsFromScore(score: number | null): string {
  if (score === null) return '';
  const rounded = Math.min(5, Math.max(0, Math.round(score)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

export function generateId(existing: string[]): string {
  const nums = existing.map(id => parseInt(id.replace('er-', '')) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `er-${String(max + 1).padStart(3, '0')}`;
}
