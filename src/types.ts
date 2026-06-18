export interface ParticipantRating {
  decoracio: number | null;
  gameMaster: number | null;
  proves: number | null;
}

export interface EscapeRoom {
  id: string;
  nom: string;
  localitzacio: string;
  lat: number | null;
  lng: number | null;
  data: string;
  dificultats: string[];
  ratings: ParticipantRating[];
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

export function calcPuntuacio(ratings: ParticipantRating[]): number | null {
  const notes = ratings.map((r) => {
    const subs = [r.decoracio, r.gameMaster, r.proves].filter((v): v is number => v != null);
    return subs.length > 0 ? subs.reduce((a, b) => a + b, 0) / subs.length : null;
  }).filter((v): v is number => v !== null);
  if (!notes.length) return null;
  return Math.round(notes.reduce((a, b) => a + b, 0) / notes.length * 10) / 10;
}

export function normalizeRoom(data: Record<string, unknown>): EscapeRoom {
  if (Array.isArray(data.ratings) && Array.isArray(data.dificultats)) {
    return data as unknown as EscapeRoom;
  }
  // Migrate from old individual-field format
  const dificultats = [
    (data.dificultat as string) ?? '',
    (data.dificultat2 as string) ?? '',
    (data.dificultat3 as string) ?? '',
    (data.dificultat4 as string) ?? '',
  ];
  const ratings: ParticipantRating[] = [
    { decoracio: (data.decoracio as number) ?? null, gameMaster: (data.gameMaster as number) ?? null, proves: (data.proves as number) ?? null },
    { decoracio: (data.decoracio2 as number) ?? null, gameMaster: (data.gameMaster2 as number) ?? null, proves: (data.proves2 as number) ?? null },
    { decoracio: (data.decoracio3 as number) ?? null, gameMaster: (data.gameMaster3 as number) ?? null, proves: (data.proves3 as number) ?? null },
    { decoracio: (data.decoracio4 as number) ?? null, gameMaster: (data.gameMaster4 as number) ?? null, proves: (data.proves4 as number) ?? null },
  ];
  return {
    id: data.id as string,
    nom: (data.nom as string) ?? '',
    localitzacio: (data.localitzacio as string) ?? '',
    lat: (data.lat as number) ?? null,
    lng: (data.lng as number) ?? null,
    data: (data.data as string) ?? '',
    dificultats,
    ratings,
    puntuacio: (data.puntuacio as number) ?? null,
    comentaris: (data.comentaris as string) ?? '',
    participants: (data.participants as string) ?? '',
    imatgeUrl: (data.imatgeUrl as string) ?? '',
    preu: (data.preu as string) ?? '',
    web: (data.web as string) ?? '',
    tematica1: (data.tematica1 as string) ?? '',
    tematica2: (data.tematica2 as string) ?? '',
  };
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
