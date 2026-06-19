import { useState } from 'react';
import { Pencil, ExternalLink, Star, Link } from 'lucide-react';
import { EscapeRoom, starsFromScore } from '../types';

interface RoomCardProps {
  room: EscapeRoom;
  rank: number;
  selected: boolean;
  canEdit: boolean;
  isAdmin: boolean;
  onClick: () => void;
  onEdit: () => void;
}

export default function RoomCard({ room, rank, selected, canEdit, isAdmin, onClick, onEdit }: RoomCardProps) {
  const tems = [room.tematica1, room.tematica2].filter(Boolean);
  const stars = starsFromScore(room.puntuacio);
  const rated = room.puntuacio !== null;
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/?sala=${room.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-150 ${
        selected
          ? 'border-accent bg-orange-50 shadow-md'
          : 'border-transparent bg-white hover:border-accent/30 hover:shadow-sm'
      }`}
    >
      {/* Rank badge */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          rated
            ? 'bg-accent text-white'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        #{rank}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{room.nom}</p>
          {room.web && (
            <a
              href={room.web}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 text-gray-400 hover:text-accent transition-colors"
              title="Visitar web del local"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {room.data && (
            <span className="text-xs text-gray-400">{room.data}</span>
          )}
          {room.preu && (
            <span className="text-xs text-green-700 font-medium">
              <span className="inline-block bg-green-500 text-white font-bold rounded px-1 mr-0.5 leading-tight">€</span>
              {room.preu}
            </span>
          )}
        </div>
        {tems.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {tems.map((t) => (
              <span
                key={t}
                className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        {rated ? (
          <>
            <p className="text-accent font-bold text-sm leading-tight">{room.puntuacio!.toFixed(1)}</p>
            <p className="text-accent text-xs leading-tight" style={{ letterSpacing: '-1px' }}>
              {stars}
            </p>
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">Pendent</span>
        )}
      </div>

      {/* Botó compartir */}
      <button
        onClick={handleShare}
        className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100 ${
          copied ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
        }`}
        title={copied ? 'Copiat!' : 'Copiar enllaç'}
      >
        {copied ? <span className="text-xs font-bold">✓</span> : <Link size={12} />}
      </button>

      {/* Llapis per admins, estrella per valoradors */}
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
            selected
              ? 'text-accent bg-accent/10 opacity-100'
              : 'text-gray-400 hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100'
          }`}
          title="Editar"
        >
          <Pencil size={13} />
        </button>
      )}
      {canEdit && !isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
            selected
              ? 'text-yellow-500 bg-yellow-50 opacity-100'
              : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 opacity-0 group-hover:opacity-100'
          }`}
          title="Valorar"
        >
          <Star size={13} />
        </button>
      )}
    </div>
  );
}
