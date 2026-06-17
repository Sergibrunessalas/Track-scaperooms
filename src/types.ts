export interface EscapeRoom {
  id: string;
  nom: string;
  localitzacio: string;
  lat: number | null;
  lng: number | null;
  data: string;
  dificultat: string;
  decoracio: number | null;
  gameMaster: number | null;
  proves: number | null;
  puntuacio: number | null;
  comentaris: string;
  participants: string;
  imatgeUrl: string;
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
  proves: number | null
): number | null {
  const vals = [decoracio, gameMaster, proves].filter((v): v is number => v !== null);
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
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
