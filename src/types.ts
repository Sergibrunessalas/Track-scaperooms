export interface ParticipantRating {
  decoracio: number | null;
  gameMaster: number | null;
  proves: number | null;
}

export interface EscapeRoom {
  id: string;
  nom: string;
  empresa: string;
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
  temps: string;
  comarca: string;
  descripcio: string;
}

export const COMARQUES = [
  'Alt Camp', 'Alt Empordà', 'Alt Penedès', 'Alt Urgell', 'Alta Ribagorça',
  'Anoia', 'Bages', 'Baix Camp', 'Baix Ebre', 'Baix Empordà', 'Baix Llobregat',
  'Baix Penedès', 'Barcelonès', 'Berguedà', 'Cerdanya', 'Conca de Barberà',
  'Garraf', 'Garrigues', 'Garrotxa', 'Gironès', 'Maresme', 'Moianès',
  'Montsià', 'Noguera', 'Osona', 'Pallars Jussà', 'Pallars Sobirà',
  'Pla d\'Urgell', 'Pla de l\'Estany', 'Priorat', 'Ribera d\'Ebre',
  'Ripollès', 'Segarra', 'Segrià', 'Selva', 'Solsonès', 'Tarragonès',
  'Terra Alta', 'Urgell', 'Val d\'Aran', 'Vallès Occidental', 'Vallès Oriental',
] as const;

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
    empresa: (data.empresa as string) ?? '',
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
    temps: (data.temps as string) ?? '',
    comarca: (data.comarca as string) ?? '',
    descripcio: (data.descripcio as string) ?? '',
  };
}

export function starsFromScore(score: number | null): string {
  if (score === null) return '';
  const rounded = Math.min(5, Math.max(0, Math.round(score)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

export interface GrupMembre {
  nom: string;
  correu: string;
}

export interface Grup {
  id: string;
  nom: string;
  titular: string;
  membres: GrupMembre[];
  membresCorreus: string[];
  createdAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  pseudonim: string;
}

export interface GrupRoom {
  roomId: string;
  nom: string;
  empresa: string;
  localitzacio: string;
  lat: number | null;
  lng: number | null;
  comarca: string;
  tematica1: string;
  tematica2: string;
  temps: string;
  preu: string;
  web: string;
  imatgeUrl: string;
  // Camps personals (omplerts per l'usuari)
  data: string;
  dificultats: string[];
  ratings: ParticipantRating[];
  puntuacio: number | null;
  participants: string;
  comentaris: string;
  afegitPer: string;
  afegitAt: string;
}

export function generateId(existing: string[]): string {
  const nums = existing.map(id => parseInt(id.replace('er-', '')) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `er-${String(max + 1).padStart(3, '0')}`;
}
