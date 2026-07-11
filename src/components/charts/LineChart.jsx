import { useState } from 'react';
import { BarChart2, MapPin } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { findPRPoints } from '../../lib/stats';

export const LineChart = ({ data, height = 180, dataKey = 'oneRM', label = '1RM', color, showPRs = false }) => {
  const chartColor = color || C.primary;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 320;
  const [activeIdx, setActiveIdx] = useState(null);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: C.bgCard, color: C.textMuted, borderRadius: C.radiusLg }}>
        <div className="flex justify-center mb-2"><BarChart2 size={36} color={C.textMuted} /></div>
        <div className="text-sm">Sem dados ainda nesse período</div>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: C.bgCard, color: C.textMuted, borderRadius: C.radiusLg }}>
        <div className="flex justify-center mb-2"><MapPin size={36} color={C.textMuted} /></div>
        <div className="text-sm">Faz mais treinos pra ver evolução</div>
        <div className="text-xs mt-2" style={{ color: C.primary }}>Atual: {data[0][dataKey]}{dataKey === 'oneRM' || dataKey === 'weight' ? 'kg' : ''}</div>
      </div>
    );
  }

  const values = data.map(d => d[dataKey]);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;
  const yMin = Math.max(0, minVal - range * 0.15);
  const yMax = maxVal + range * 0.15;
  const yRange = yMax - yMin || 1;

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / (data.length - 1)) * innerWidth;
  const getY = (val) => padding.top + (1 - (val - yMin) / yRange) * innerHeight;

  const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[dataKey])}`).join(' ');
  const areaPath = pathData + ` L ${getX(data.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  const prIndexes = showPRs ? findPRPoints(data) : [];

  const gridLines = [];
  for (let i = 0; i <= 3; i++) {
    const y = padding.top + (i / 3) * innerHeight;
    const val = yMax - (i / 3) * yRange;
    gridLines.push({ y, val: Math.round(val * 10) / 10 });
  }

  const active = activeIdx !== null ? data[activeIdx] : null;

  return (
    <div className="rounded-2xl p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg, border: `1px solid ${C.border}` }} role="img" aria-label={`Gráfico de ${label}, ${data.length} pontos, último valor ${data[data.length - 1][dataKey]}`}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padding.left} y1={g.y} x2={width - padding.right} y2={g.y} stroke={C.border} strokeWidth="0.5" strokeDasharray="2,2" />
            <text x={padding.left - 6} y={g.y + 3} fill={C.textMuted} fontSize="9" textAnchor="end">{g.val}</text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#grad-${dataKey})`} />
        <path d={pathData} fill="none" stroke={chartColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />

        {data.map((d, i) => {
          const isPR = prIndexes.includes(i);
          const isActive = activeIdx === i;
          return (
            <g key={i} onClick={() => setActiveIdx(isActive ? null : i)} style={{ cursor: 'pointer' }}>
              <circle cx={getX(i)} cy={getY(d[dataKey])} r="12" fill="transparent" />
              <circle cx={getX(i)} cy={getY(d[dataKey])} r={isActive ? 6 : isPR ? 5 : 3.5} fill={isPR ? C.warning : chartColor} stroke={C.bgCard} strokeWidth="2"
                style={{ transition: 'r 0.15s ease' }} />
              {isPR && (
                <g transform={`translate(${getX(i) - 7}, ${getY(d[dataKey]) - 22})`}>
                  <rect x="0" y="0" width="14" height="14" rx="3" fill={C.warning} opacity="0.2" />
                  <path d="M4 3h6M7 3v5M5 8c0 1.1.9 2 2 2s2-.9 2-2M4 3c0 1.5-.8 2.5-2 3M10 3c0 1.5.8 2.5 2 3M5.5 10.5h3M7 10.5v1.5" stroke={C.warning} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </g>
              )}
            </g>
          );
        })}

        {active && (
          <g transform={`translate(${Math.min(Math.max(getX(activeIdx), padding.left + 26), width - padding.right - 26)}, ${Math.max(getY(active[dataKey]) - 34, 12)})`}>
            <rect x="-26" y="-14" width="52" height="20" rx="6" fill={C.bg} stroke={C.border} />
            <text x="0" y="0" textAnchor="middle" fill={C.text} fontSize="10" fontWeight="500">
              {active[dataKey]}{dataKey === 'oneRM' || dataKey === 'weight' ? 'kg' : ''}
            </text>
          </g>
        )}

        <text x={getX(0)} y={height - 10} fill={C.textMuted} fontSize="9" textAnchor="middle">
          {new Date(data[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </text>
        <text x={getX(data.length - 1)} y={height - 10} fill={C.textMuted} fontSize="9" textAnchor="middle">
          {new Date(data[data.length - 1].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </text>
      </svg>
      <div className="text-center text-[10px] mt-1" style={{ color: C.textMuted }}>{label}{active ? ` · ${new Date(active.date).toLocaleDateString('pt-BR')}` : ''}</div>
    </div>
  );
};
