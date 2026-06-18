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
  nota2?: number | null;
  nota3?: number | null;
  nota4?: number | null;
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

export function calcPuntuacio(
  decoracio: number | null,
  gameMaster: number | null,
  proves: number | null,
  nota2: number | null = null,
  nota3: number | null = null,
  nota4: number | null = null,
): number | null {
  const sub = [decoracio, gameMaster, proves].filter((v): v is number => v !== null);
  const nota1 = sub.length > 0 ? sub.reduce((a, b) => a + b, 0) / sub.length : null;
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
