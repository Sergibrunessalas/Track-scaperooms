import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { EscapeRoom, starsFromScore } from '../types';

const ACCENT = '#e8490a';
const GOLD   = '#eab308';

interface Props { rooms: EscapeRoom[]; }

export default function WebView({ rooms }: Props) {
  const rated = useMemo(() => rooms.filter(r => r.puntuacio !== null), [rooms]);

  const avgScore = rated.length
    ? rated.reduce((s, r) => s + r.puntuacio!, 0) / rated.length
    : null;

  const bestRoom  = rated.reduce<EscapeRoom | null>((b, r) => !b || r.puntuacio! > b.puntuacio! ? r : b, null);
  const worstRoom = rated.reduce<EscapeRoom | null>((w, r) => !w || r.puntuacio! < w.puntuacio! ? r : w, null);

  const perYear = useMemo(() => {
    const map: Record<string, number> = {};
    rooms.forEach(r => {
      const year = r.data?.match(/\d{4}/)?.[0];
      if (year) map[year] = (map[year] || 0) + 1;
    });
    return Object.entries(map).sort().map(([year, count]) => ({ year, count }));
  }, [rooms]);

  const bestYear = perYear.length ? perYear.reduce((b, y) => y.count > b.count ? y : b) : null;
  const bgImage = bestRoom?.imatgeUrl ?? '';

  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll">
      <div
        style={{
          minHeight: '100%',
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'local',
          backgroundColor: '#111',
        }}
      >
        {/* Overlay fosc per llegibilitat */}
        <div style={{ minHeight: '100%', background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(1px)' }}>
          <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <KpiCard icon="🗺" label="Total rooms" value={rooms.length} />
              <KpiCard icon="⭐" label="Valorats" value={rated.length} />
              <KpiCard icon="📊" label="Nota mitjana" value={avgScore ? avgScore.toFixed(2) : '—'} accent />
              <KpiCard icon="⏳" label="Pendents" value={rooms.length - rated.length} />
            </div>

            {/* Rooms per any */}
            {perYear.length > 0 && (
              <GlassCard title="Rooms per any">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={perYear} barCategoryGap="35%">
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      formatter={(v) => [v, 'Rooms']}
                      contentStyle={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,30,30,0.95)', fontSize: 12, color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {perYear.map((_, i) => <Cell key={i} fill={ACCENT} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            )}

            {/* Rècords */}
            <GlassCard title="🏆 Rècords del grup">
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
                <RecordItem icon="🏢" label="Companyies" name={`${[...new Set(rooms.map(r => r.empresa).filter(Boolean))].length}`}
                  sub="empreses visitades" subColor="#6b7280" />
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
    <div style={{ background: 'rgba(15,15,15,0.72)', backdropFilter: 'blur(14px)', borderRadius: 20, padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, accent }: { icon: string; label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? ACCENT : 'rgba(15,15,15,0.72)',
      backdropFilter: 'blur(14px)',
      border: `1px solid ${accent ? ACCENT : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 20,
      padding: '16px',
    }}>
      <p style={{ fontSize: 24, marginBottom: 6 }}>{icon}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: 'Montserrat, sans-serif' }}>{value}</p>
      <p style={{ fontSize: 11, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function RecordItem({ icon, label, name, sub, subColor }: { icon: string; label: string; name: string; sub?: string; subColor?: string }) {
  return (
    <div>
      <p style={{ fontSize: 22, marginBottom: 4 }}>{icon}</p>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{name}</p>
      {sub && <p style={{ fontSize: 11, fontWeight: 600, color: subColor ?? '#9ca3af', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}
