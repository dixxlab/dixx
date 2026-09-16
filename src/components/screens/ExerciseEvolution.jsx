import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { SectionTitle } from '../ui/SectionTitle';
import { StatRow } from '../ui/Stat';
import { ListRow, RowValue } from '../ui/ListRow';
import { buildChartData, generateInsights } from '../../lib/stats';
import { formatRelative } from '../../lib/workouts';
import { LineChart } from '../charts/LineChart';
import { InsightCard } from '../charts/InsightCard';

export const ExerciseEvolution = ({ history, exerciseName, onClose }) => {
  const [period, setPeriod] = useState(90);
  const [metric, setMetric] = useState('oneRM');

  const chartData = useMemo(() => buildChartData(history, exerciseName, period), [history, exerciseName, period]);
  const insights = useMemo(() => generateInsights(chartData, exerciseName), [chartData, exerciseName]);

  const periods = [
    { val: 7, label: '7d' },
    { val: 30, label: '30d' },
    { val: 90, label: '90d' },
    { val: 365, label: '1ano' },
    { val: 'all', label: 'Tudo' },
  ];

  // Quatro cores distintas de verdade: --info é igual a --accent nos três temas,
  // então usá-lo aqui deixava duas chips idênticas. --chart-alt entrou nos tokens
  // pra substituir o roxo que estava hardcoded e não acompanhava o tema.
  const metrics = [
    { val: 'oneRM', label: '1RM estimado', color: C.primary, unit: 'kg' },
    { val: 'weight', label: 'Peso máximo', color: C.warning, unit: 'kg' },
    { val: 'volume', label: 'Volume total', color: C.success, unit: 'kg' },
    { val: 'totalReps', label: 'Reps totais', color: C.chartAlt, unit: '' },
  ];

  const currentMetric = metrics.find(m => m.val === metric);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const lastP = chartData[chartData.length - 1];
    const maxWeight = Math.max(...chartData.map(p => p.weight));
    const max1RM = Math.max(...chartData.map(p => p.oneRM));
    const totalSessions = chartData.length;
    const totalVolume = chartData.reduce((sum, p) => sum + p.volume, 0);
    return { lastP, maxWeight, max1RM, totalSessions, totalVolume };
  }, [chartData]);

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Voltar">
          <ArrowLeft size={20} color={C.text} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-medium" style={{ color: C.text }}>{exerciseName}</h1>
          <p className="text-xs" style={{ color: C.textMuted }}>{chartData.length} treino(s) no período</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4 pb-2 mt-4" style={{ scrollbarWidth: 'none' }}>
        {periods.map((p) => (
          <button key={p.val} onClick={() => setPeriod(p.val)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all active:scale-95"
            style={{ background: period === p.val ? C.primary : C.bgCard, color: period === p.val ? C.primaryOn : C.textMuted, minHeight: 32 }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Herói: o peso que você está levantando agora. Os quatro cards genéricos
          idênticos viraram um número grande e três stats de apoio. */}
      {stats && (
        <section
          className="-mx-5 px-5 py-5 mb-4"
          style={{ background: C.bgCard, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
        >
          <div className="text-xs" style={{ color: C.textMuted }}>Peso atual</div>
          <div
            className="flex items-baseline gap-1 tabular-nums mt-1"
            style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 46, lineHeight: 1, color: C.text }}
          >
            {stats.lastP.weight}
            <span style={{ fontSize: 24, color: C.textMuted }}>kg</span>
          </div>
          <div className="text-xs mb-5 mt-1" style={{ color: C.textMuted }}>× {stats.lastP.reps} repetições</div>
          <StatRow
            gap={26}
            items={[
              { value: stats.max1RM.toFixed(1), unit: 'kg', label: '1RM estimado' },
              { value: stats.maxWeight, unit: 'kg', label: 'PR de peso', color: C.warning },
              { value: (stats.totalVolume / 1000).toFixed(1), unit: 't', label: 'volume' },
            ]}
          />
        </section>
      )}

      <InsightCard insights={insights} />

      <SectionTitle className="mb-3">Gráfico de evolução</SectionTitle>
      <div className="flex gap-2 overflow-x-auto mb-3 pb-2" style={{ scrollbarWidth: 'none' }}>
        {metrics.map((m) => (
          <button key={m.val} onClick={() => setMetric(m.val)}
            className="px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all active:scale-95"
            style={{ background: metric === m.val ? m.color : C.bgCard, color: metric === m.val ? C.bg : C.textMuted, minHeight: 32 }}>
            {m.label}
          </button>
        ))}
      </div>

      <LineChart data={chartData} dataKey={metric} label={currentMetric.label} color={currentMetric.color} showPRs={metric === 'weight' || metric === 'oneRM'} />

      {chartData.length > 0 && (
        <>
          <SectionTitle className="mb-1 mt-6">Últimos treinos</SectionTitle>
          <div>
            {[...chartData].reverse().slice(0, 5).map((p, i) => (
              <ListRow
                key={i}
                title={`${p.weight}kg × ${p.reps} reps`}
                subtitle={formatRelative(p.date)}
                trailing={
                  <>
                    <RowValue unit="séries">{p.setsCount}</RowValue>
                    <RowValue unit="1RM" color={C.primary}>{p.oneRM.toFixed(1)}</RowValue>
                  </>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
