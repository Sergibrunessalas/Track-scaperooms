import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import { EscapeRoom, Grup, starsFromScore } from '../types';
import GrupsView from './GrupsView';

const ACCENT = '#e8490a';
const GOLD   = '#eab308';

function exportTop10(rooms: EscapeRoom[]) {
  const top = [...rooms]
    .filter(r => r.puntuacio !== null)
    .sort((a, b) => b.puntuacio! - a.puntuacio!)
    .slice(0, 10);

  const W = 580, ROW = 52, PAD = 24, HEADER = 100, FOOTER = 40;
  const H = HEADER + top.length * ROW + PAD + FOOTER;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2; // retina
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Fons
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#18181b'); bg.addColorStop(1, '#09090b');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Títol
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 TOP 10 ESCAPE ROOMS', W / 2, 38);
  ctx.fillStyle = '#71717a';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Track Scaperooms · trackscaperooms.vercel.app', W / 2, 60);

  // Línia separadora
  ctx.strokeStyle = '#27272a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, 75); ctx.lineTo(W - PAD, 75); ctx.stroke();

  const MEDALS = ['🥇', '🥈', '🥉'];

  top.forEach((room, i) => {
    const y = HEADER + i * ROW;
    const isTop3 = i < 3;

    // Fons fila
    ctx.fillStyle = isTop3 ? 'rgba(234,179,8,0.08)' : (i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent');
    ctx.fillRect(PAD, y + 4, W - PAD * 2, ROW - 6);

    // Rank
    if (i < 3) {
      ctx.font = '18px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(MEDALS[i], PAD + 4, y + 30);
    } else {
      ctx.fillStyle = '#52525b';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${i + 1}`, PAD + 6, y + 28);
    }

    // Nom
    ctx.fillStyle = '#f4f4f5';
    ctx.font = `${isTop3 ? 'bold 14px' : '13px'} system-ui, sans-serif`;
    ctx.textAlign = 'left';
    const nom = room.nom.length > 38 ? room.nom.slice(0, 35) + '…' : room.nom;
    ctx.fillText(nom, PAD + 38, y + 22);

    // Empresa
    ctx.fillStyle = '#71717a';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(room.empresa || '', PAD + 38, y + 38);

    // Puntuació
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(room.puntuacio!.toFixed(1), W - PAD, y + 26);

    // Estrelles
    ctx.fillStyle = GOLD;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(starsFromScore(room.puntuacio), W - PAD, y + 40);
  });

  // Footer
  ctx.fillStyle = '#3f3f46';
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Generat el ${new Date().toLocaleDateString('ca-ES')}`, W / 2, H - 14);

  const a = document.createElement('a');
  a.download = 'top10-escape-rooms.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

type WVPage = 'overview' | 'grups' | 'grup-stats';

interface Props { rooms: EscapeRoom[]; }

export default function WebView({ rooms }: Props) {
  const [page, setPage] = useState<WVPage>('overview');
  const [selectedGrup, setSelectedGrup] = useState<Grup | null>(null);

  /* ── Grups sub-view ── */
  if (page === 'grups') {
    return (
      <div className="flex-1 overflow-y-auto sidebar-scroll" style={{ background: 'linear-gradient(to bottom, #18181b, #09090b)' }}>
        <div className="max-w-5xl mx-auto p-6">
          <GrupsView
            rooms={rooms}
            onBack={() => setPage('overview')}
            onViewStats={(g) => { setSelectedGrup(g); setPage('grup-stats'); }}
          />
        </div>
      </div>
    );
  }

  /* ── Grup stats ── */
  if (page === 'grup-stats' && selectedGrup) {
    const members = selectedGrup.membres
      .flatMap(m => [m.nom.trim(), m.correu.trim()])
      .filter(Boolean)
      .map(s => s.toLowerCase());
    const grupRooms = members.length
      ? rooms.filter(r => members.some(t => (r.participants ?? '').toLowerCase().includes(t)))
      : rooms;
    return <StatsContent
      rooms={grupRooms}
      breadcrumb={
        <nav className="flex items-center gap-1.5 text-xs">
          <button onClick={() => setPage('overview')} className="text-white/50 hover:text-white transition-colors">Estadístiques</button>
          <span className="text-white/30">›</span>
          <button onClick={() => setPage('grups')} className="text-white/50 hover:text-white transition-colors">Grups</button>
          <span className="text-white/30">›</span>
          <span className="text-white font-medium">{selectedGrup.nom}</span>
        </nav>
      }
    />;
  }

  return <StatsContent rooms={rooms} onOpenGrups={() => setPage('grups')} />;
}

interface StatsContentProps {
  rooms: EscapeRoom[];
  onOpenGrups?: () => void;
  breadcrumb?: React.ReactNode;
}

function StatsContent({ rooms, onOpenGrups, breadcrumb }: StatsContentProps) {
  const rated = rooms.filter(r => r.puntuacio !== null);
  const avgScore = rated.length
    ? rated.reduce((s, r) => s + r.puntuacio!, 0) / rated.length
    : null;
  const bestRoom  = rated.reduce<EscapeRoom | null>((b, r) => !b || r.puntuacio! > b.puntuacio! ? r : b, null);
  const worstRoom = rated.reduce<EscapeRoom | null>((w, r) => !w || r.puntuacio! < w.puntuacio! ? r : w, null);
  const perYear = (() => {
    const map: Record<string, number> = {};
    rooms.forEach(r => {
      const year = r.data?.match(/\d{4}/)?.[0];
      if (year) map[year] = (map[year] || 0) + 1;
    });
    return Object.entries(map).sort().map(([year, count]) => ({ year, count }));
  })();
  const bestYear = perYear.length ? perYear.reduce((b, y) => y.count > b.count ? y : b) : null;
  const bgImage = bestRoom?.imatgeUrl ?? '';

  return (
    <div
      className="flex-1 overflow-y-auto sidebar-scroll no-select"
      onMouseDown={(e) => { if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault(); }}
    >
      <div
        style={{
          minHeight: '100%',
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'contain',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#111',
        }}
      >
        <div style={{ minHeight: '100%', background: 'rgba(0,0,0,0.35)' }}>
          <div className="max-w-5xl mx-auto p-6 space-y-6">

            {breadcrumb}

            {/* Accions */}
            <div className="flex items-center justify-between pt-1">
              {onOpenGrups && (
                <button
                  onClick={onOpenGrups}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  👥 Grups
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => exportTop10(rooms)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.2)')}
                >
                  <Download size={14} />
                  Exportar Top 10
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon="🗺" label="Total rooms" value={rooms.length} />
              <KpiCard icon="⭐" label="Valorats" value={rated.length} />
              <KpiCard icon="📊" label="Nota mitjana" value={avgScore ? avgScore.toFixed(2) : '—'} accent />
              <KpiCard icon="⏳" label="Pendents" value={rooms.length - rated.length} />
            </div>

            {/* Rooms per any */}
            {perYear.length > 0 && (
              <GlassCard title="Rooms per any">
                <div style={{ userSelect: 'none' }}>
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={perYear} barCategoryGap="35%" style={{ cursor: 'default' }}>
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        formatter={(v) => [v, 'Rooms']}
                        contentStyle={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,30,30,0.95)', fontSize: 13, color: '#fff' }}
                        labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 13 }}
                        itemStyle={{ color: '#fff', fontSize: 13 }}
                        cursor={false}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {perYear.map((_, i) => <Cell key={i} fill={ACCENT} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            )}

            {/* Rècords */}
            <GlassCard title="🏆 Rècords">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bestRoom && (
                  <RecordItem icon="🥇" label="Millor room" name={bestRoom.nom}
                    sub={`${starsFromScore(bestRoom.puntuacio)} ${bestRoom.puntuacio?.toFixed(1)}`} subColor={GOLD} />
                )}
                {worstRoom && worstRoom.id !== bestRoom?.id && (
                  <RecordItem icon="😅" label="Menys valorada" name={worstRoom.nom}
                    sub={`${starsFromScore(worstRoom.puntuacio)} ${worstRoom.puntuacio?.toFixed(1)}`} subColor="#9ca3af" />
                )}
                {bestYear && (
                  <RecordItem icon="📅" label="Any més actiu" name={bestYear.year}
                    sub={`${bestYear.count} rooms`} subColor={ACCENT} />
                )}
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <h3 style={{ fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</h3>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, accent }: { icon: string; label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <p style={{ fontSize: 22, marginBottom: 4, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>{icon}</p>
      <p style={{ fontSize: 32, fontWeight: 900, color: accent ? '#fb923c' : '#fff', lineHeight: 1, fontFamily: 'Montserrat, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>{value}</p>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{label}</p>
    </div>
  );
}

function RecordItem({ icon, label, name, sub, subColor }: { icon: string; label: string; name: string; sub?: string; subColor?: string }) {
  return (
    <div>
      <p style={{ fontSize: 22, marginBottom: 4, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>{icon}</p>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>{name}</p>
      {sub && <p style={{ fontSize: 11, fontWeight: 600, color: subColor ?? '#9ca3af', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{sub}</p>}
    </div>
  );
}
