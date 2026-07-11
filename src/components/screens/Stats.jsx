import { useMemo } from 'react';
import { Flame, Activity, Trophy, TrendingUp, Calendar, Award, BarChart3, Dumbbell } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { exerciseLibrary } from '../../lib/exercises';
import { calculateStreak, calculatePRs, formatRelative } from '../../lib/workouts';
import { Heatmap } from '../charts/Heatmap';

export const Stats = ({ data, onSelectExercise }) => {
  const streak = calculateStreak(data.history);
  const prs = calculatePRs(data.history);
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const calendar = Array.from({ length: daysInMonth }, (_, i) => {
    const dayDate = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return data.history.some(s => new Date(s.date).toDateString() === dayDate.toDateString());
  });

  const allExercises = useMemo(() => {
    const map = {};
    data.history.forEach(s => {
      s.exercises.forEach(ex => {
        if (!map[ex.name]) {
          map[ex.name] = { name: ex.name, count: 0, lastDate: s.date };
          const libEx = exerciseLibrary.find(e => e.name === ex.name);
          map[ex.name].fig = libEx ? libEx.fig : 'desen';
        }
        map[ex.name].count++;
        if (new Date(s.date) > new Date(map[ex.name].lastDate)) {
          map[ex.name].lastDate = s.date;
        }
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [data.history]);

  const totalVolume = data.history.reduce((sum, s) =>
    sum + s.exercises.reduce((es, ex) =>
      es + ex.sets.reduce((ss, set) =>
        ss + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0), 0);
  const totalSessions = data.history.length;
  /* eslint-disable react-hooks/purity -- média histórica relativa a agora; re-render eventual é inofensivo aqui */
  const avgPerWeek = totalSessions > 0 ?
    (totalSessions / Math.max(1, Math.ceil((Date.now() - new Date(data.history[0].date)) / (1000 * 60 * 60 * 24 * 7)))).toFixed(1) : 0;
  /* eslint-enable react-hooks/purity */

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <h1 className="text-2xl font-medium mb-1" style={{ color: C.text }}>Sua evolução</h1>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>Análise completa do progresso</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} style={{ color: C.warning }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Streak</div>
          </div>
          <div className="text-2xl font-medium tabular-nums" style={{ color: C.text, fontFamily: C.fontData }}>{streak} {streak === 1 ? 'dia' : 'dias'}</div>
        </div>
        <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} style={{ color: C.info }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Treinos/sem</div>
          </div>
          <div className="text-2xl font-medium tabular-nums" style={{ color: C.text, fontFamily: C.fontData }}>{avgPerWeek}</div>
        </div>
        <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} style={{ color: C.warning }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Total treinos</div>
          </div>
          <div className="text-2xl font-medium tabular-nums" style={{ color: C.text, fontFamily: C.fontData }}>{totalSessions}</div>
        </div>
        <div className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} style={{ color: C.info }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Volume total</div>
          </div>
          <div className="text-2xl font-medium tabular-nums" style={{ color: C.text, fontFamily: C.fontData }}>{(totalVolume / 1000).toFixed(1)}t</div>
        </div>
      </div>

      {data.history.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2 mt-4">
            <Calendar size={14} style={{ color: C.primary }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Consistência</div>
          </div>
          <Heatmap history={data.history} />
        </>
      )}

      <div className="text-[10px] uppercase tracking-wider mb-2 mt-4" style={{ color: C.textMuted }}>{today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</div>
      <div className="p-4 mb-4" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px]" style={{ color: C.textMuted }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendar.map((done, i) => (
            <div key={i} className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium tabular-nums"
              style={{ background: done ? C.primary : C.bg, color: done ? C.primaryOn : C.textMuted, border: (i + 1) === today.getDate() ? `2px solid ${C.text}` : 'none' }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {prs.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2 mt-4">
            <Award size={14} style={{ color: C.warning }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Recordes pessoais</div>
          </div>
          <div className="space-y-2 mb-4">
            {prs.map((pr, i) => (
              <button key={i} onClick={() => onSelectExercise(pr.exercise)} className="w-full p-3 flex justify-between items-center transition-all active:scale-[0.98]" style={{ background: C.bgCard, borderRadius: C.radiusLg, minHeight: 44 }}>
                <div className="text-left">
                  <div className="text-sm font-medium" style={{ color: C.text }}>{pr.exercise}</div>
                  <div className="text-[10px]" style={{ color: C.textMuted }}>{formatRelative(pr.date)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium flex items-center gap-1 tabular-nums" style={{ color: C.primary }}>{pr.weight}kg <Trophy size={14} color={C.warning} /></div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {allExercises.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2 mt-4">
            <BarChart3 size={14} style={{ color: C.primary }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Evolução por exercício</div>
          </div>
          <div className="space-y-2">
            {allExercises.map((ex, i) => (
              <button key={i} onClick={() => onSelectExercise(ex.name)} className="w-full p-3 flex justify-between items-center transition-all active:scale-[0.98]" style={{ background: C.bgCard, borderRadius: C.radiusLg, minHeight: 44 }}>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium" style={{ color: C.text }}>{ex.name}</div>
                  <div className="text-[10px]" style={{ color: C.textMuted }}>{ex.count} treino(s) • último {formatRelative(ex.lastDate)}</div>
                </div>
                <TrendingUp size={14} style={{ color: C.primary }} />
              </button>
            ))}
          </div>
        </>
      )}

      {data.history.length === 0 && (
        <div className="p-6 text-center" style={{ background: C.bgCard, color: C.textMuted, borderRadius: C.radiusLg }}>
          <div className="flex justify-center mb-2"><Dumbbell size={40} color={C.textMuted} /></div>
          <div className="text-sm">Comece seu primeiro treino<br />pra ver suas estatísticas evoluindo!</div>
        </div>
      )}
    </div>
  );
};
