import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { EscapeRoom, starsFromScore } from '../types';

const ACCENT = '#e8490a';
const GOLD   = '#eab308';
const SCORE_COLORS = ['#dc2626', '#f97316', '#eab308', '#84cc16', '#22c55e'];

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

  const scoreDist = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rated.forEach(r => {
      const s = Math.min(5, Math.max(1, Math.round(r.puntuacio!)));
      counts[s]++;
    });
    return [5, 4, 3, 2, 1].map(s => ({ label: '★'.repeat(s), count: counts[s], star: s }));
  }, [rated]);

  const topEmpreses = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    rated.forEach(r => {
      if (!r.empresa) return;
      if (!map[r.empresa]) map[r.empresa] = { total: 0, count: 0 };
      map[r.empresa].total += r.puntuacio!;
      map[r.empresa].count++;
    });
    return Object.entries(map)
      .filter(([, v]) => v.count >= 2)
      .map(([empresa, { total, count }]) => ({ empresa, avg: total / count, count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);
  }, [rated]);

  const temaData = useMemo(() => {
    const map: Record<string, number> = {};
    rooms.forEach(r => {
      [r.tematica1, r.tematica2].filter(Boolean).forEach(t => { map[t] = (map[t] || 0) + 1; });
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10).map(([tema, count]) => ({ tema, count }));
  }, [rooms]);

  const bestYear = perYear.length ? perYear.reduce((b, y) => y.count > b.count ? y : b) : null;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 sidebar-scroll">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Títol */}
        <div>
          <h2 className="font-montserrat text-2xl font-black text-gray-900">Estadístiques del grup</h2>
          <p className="text-sm text-gray-500 mt-1">Resum de totes les aventures fetes junts</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon="🗺" label="Total rooms" value={rooms.length} />
          <KpiCard icon="⭐" label="Valorats" value={rated.length} />
          <KpiCard icon="📊" label="Nota mitjana" value={avgScore ? avgScore.toFixed(2) : '—'} accent />
          <KpiCard icon="⏳" label="Pendents" value={rooms.length - rated.length} />
        </div>

        {/* Gràfiques principals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Rooms per any */}
          {perYear.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-sm text-gray-700 mb-4">Rooms per any</h3>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={perYear} barCategoryGap="35%">
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(v) => [v, 'Rooms']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #f3f4f6', fontSize: 12 }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {perYear.map((_, i) => <Cell key={i} fill={ACCENT} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribució de puntuacions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm text-gray-700 mb-4">Distribució de puntuacions</h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={scoreDist} layout="vertical" barCategoryGap="25%">
                <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  formatter={(v) => [v, 'Rooms']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #f3f4f6', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {scoreDist.map((d, i) => <Cell key={i} fill={SCORE_COLORS[4 - i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top companyies */}
        {topEmpreses.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm text-gray-700 mb-5">Millors companyies <span className="text-gray-400 font-normal">(mínim 2 rooms valorades)</span></h3>
            <div className="space-y-4">
              {topEmpreses.map((e, i) => (
                <div key={e.empresa} className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-300 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-800 truncate">{e.empresa}</span>
                      <span className="text-xs text-gray-400 ml-3 flex-shrink-0">{e.count} rooms</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(e.avg / 5) * 100}%`, background: i === 0 ? GOLD : ACCENT }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-700 w-8 text-right">{e.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rècords + Temàtiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Rècords */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm text-gray-700 mb-4">🏆 Rècords del grup</h3>
            <div className="space-y-4">
              {bestRoom && (
                <RecordRow icon="🥇" label="Millor room" name={bestRoom.nom} sub={`${starsFromScore(bestRoom.puntuacio)} ${bestRoom.puntuacio?.toFixed(1)}`} subColor={GOLD} />
              )}
              {worstRoom && worstRoom.id !== bestRoom?.id && (
                <RecordRow icon="😅" label="Menys valorada" name={worstRoom.nom} sub={`${starsFromScore(worstRoom.puntuacio)} ${worstRoom.puntuacio?.toFixed(1)}`} subColor="#9ca3af" />
              )}
              {bestYear && (
                <RecordRow icon="📅" label={`Any més actiu`} name={bestYear.year} sub={`${bestYear.count} rooms`} subColor={ACCENT} />
              )}
              <RecordRow icon="🏢" label="Companyies visitades" name={`${[...new Set(rooms.map(r => r.empresa).filter(Boolean))].length} empreses`} />
            </div>
          </div>

          {/* Temàtiques */}
          {temaData.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-sm text-gray-700 mb-4">Temàtiques més freqüents</h3>
              <div className="space-y-2.5">
                {temaData.map((t, i) => (
                  <div key={t.tema} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-300 w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate">{t.tema}</span>
                        <span className="text-xs font-bold text-gray-500 ml-2">{t.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(t.count / temaData[0].count) * 100}%`, background: ACCENT, opacity: Math.max(0.3, 1 - i * 0.07) }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, accent }: { icon: string; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm border ${accent ? 'border-accent' : 'border-gray-100 bg-white'}`}
      style={accent ? { background: ACCENT } : {}}>
      <p className="text-2xl mb-2">{icon}</p>
      <p className={`text-2xl font-black font-montserrat leading-none ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs font-medium mt-1 ${accent ? 'text-white/75' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
}

function RecordRow({ icon, label, name, sub, subColor }: { icon: string; label: string; name: string; sub?: string; subColor?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl leading-none mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
        <p className="text-sm font-bold text-gray-800 truncate">{name}</p>
        {sub && <p className="text-xs font-semibold mt-0.5" style={{ color: subColor ?? '#6b7280' }}>{sub}</p>}
      </div>
    </div>
  );
}
