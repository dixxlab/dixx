import { useMemo, useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { T as C } from '../../theme/tokens';
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

  const metrics = [
    { val: 'oneRM', label: '1RM estimado', color: C.primary, unit: 'kg' },
    { val: 'weight', label: 'Peso máximo', color: C.info, unit: 'kg' },
    { val: 'volume', label: 'Volume total', color: C.warning, unit: 'kg' },
    { val: 'totalReps', label: 'Reps totais', color: '#a855f7', unit: '' },
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

      {stats && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Peso atual</div>
            <div className="text-xl font-medium tabular-nums" style={{ color: C.text, fontFamily: C.fontData }}>{stats.lastP.weight}kg</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>× {stats.lastP.reps} reps</div>
          </div>
          <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>1RM estimado</div>
            <div className="text-xl font-medium tabular-nums" style={{ color: C.warning, fontFamily: C.fontData }}>{stats.max1RM.toFixed(1)}kg</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>máximo teórico</div>
          </div>
          <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>PR de peso</div>
            <div className="text-xl font-medium flex items-center gap-1 tabular-nums" style={{ color: C.warning, fontFamily: C.fontData }}>{stats.maxWeight}kg <Trophy size={16} color={C.warning} /></div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>recorde absoluto</div>
          </div>
          <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Volume total</div>
            <div className="text-xl font-medium tabular-nums" style={{ color: C.info, fontFamily: C.fontData }}>{(stats.totalVolume / 1000).toFixed(1)}t</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>no período</div>
          </div>
        </div>
      )}

      <InsightCard insights={insights} />

      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Gráfico de evolução</div>
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
          <div className="text-[10px] uppercase tracking-wider mb-2 mt-6" style={{ color: C.textMuted }}>Últimos treinos</div>
          <div className="space-y-2">
            {[...chartData].reverse().slice(0, 5).map((p, i) => (
              <div key={i} className="p-3 flex justify-between items-center" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
                <div>
                  <div className="text-sm font-medium tabular-nums" style={{ color: C.text }}>{p.weight}kg × {p.reps} reps</div>
                  <div className="text-[10px]" style={{ color: C.textMuted }}>{formatRelative(p.date)} • {p.setsCount} sets • {(p.volume / 1000).toFixed(1)}t</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium tabular-nums" style={{ color: C.primary }}>{p.oneRM.toFixed(1)}kg</div>
                  <div className="text-[9px]" style={{ color: C.textMuted }}>1RM</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
