import { useMemo } from 'react';
import { Flame, TrendingUp, Trophy, Dumbbell } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { exerciseLibrary } from '../../lib/exercises';
import { calculateStreak, calculatePRs, formatRelative } from '../../lib/workouts';
import { Heatmap } from '../charts/Heatmap';
import { StatRow } from '../ui/Stat';
import { SectionTitle } from '../ui/SectionTitle';
import { ListRow, RowValue } from '../ui/ListRow';
import { FigGlyph } from '../ui/Figures';

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
      <p className="text-sm mb-5" style={{ color: C.textMuted }}>Análise completa do progresso</p>

      {/* Herói da tela: o volume acumulado é o número que cresce a cada treino,
          então ele carrega a escala e os demais viram apoio. */}
      <section
        className="-mx-5 px-5 py-5"
        style={{ background: C.bgCard, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="text-xs" style={{ color: C.textMuted }}>Volume total levantado</div>
        <div
          className="flex items-baseline gap-1 tabular-nums mt-1 mb-5"
          style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 52, lineHeight: 1, color: C.text }}
        >
          {(totalVolume / 1000).toFixed(1)}
          <span style={{ fontSize: 26, color: C.textMuted }}>toneladas</span>
        </div>
        <StatRow
          gap={28}
          items={[
            { value: streak, label: streak === 1 ? 'dia seguido' : 'dias seguidos', icon: Flame },
            { value: totalSessions, label: 'treinos' },
            { value: avgPerWeek, label: 'por semana' },
          ]}
        />
      </section>

      {data.history.length > 0 && (
        <>
          <SectionTitle className="mt-7 mb-3">Consistência</SectionTitle>
          <Heatmap history={data.history} />
        </>
      )}

      <SectionTitle className="mt-7 mb-3">
        {today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
      </SectionTitle>
      <div className="pb-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px]" style={{ color: C.textMuted }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendar.map((done, i) => (
            <div key={i} className="aspect-square rounded-md flex items-center justify-center text-[11px] tabular-nums"
              style={{ fontFamily: C.fontData, fontWeight: 600, background: done ? C.primary : C.bgCard, color: done ? C.primaryOn : C.textMuted, border: (i + 1) === today.getDate() ? `2px solid ${C.text}` : 'none' }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {prs.length > 0 && (
        <>
          <SectionTitle className="mt-6 mb-1">Recordes pessoais</SectionTitle>
          <div>
            {prs.map((pr, i) => (
              <ListRow
                key={i}
                onClick={() => onSelectExercise(pr.exercise)}
                leading={<Trophy size={16} style={{ color: C.warning }} />}
                title={pr.exercise}
                subtitle={formatRelative(pr.date)}
                trailing={<RowValue color={C.primary}>{pr.weight}<span style={{ fontSize: 11 }}>kg</span></RowValue>}
              />
            ))}
          </div>
        </>
      )}

      {allExercises.length > 0 && (
        <>
          <SectionTitle className="mt-6 mb-1">Evolução por exercício</SectionTitle>
          <div>
            {allExercises.map((ex, i) => (
              <ListRow
                key={i}
                onClick={() => onSelectExercise(ex.name)}
                leading={<FigGlyph figKey={ex.fig} size={26} opacity={0.75} />}
                title={ex.name}
                subtitle={`último ${formatRelative(ex.lastDate)}`}
                trailing={
                  <>
                    <RowValue>{ex.count}</RowValue>
                    <TrendingUp size={14} style={{ color: C.primary }} />
                  </>
                }
              />
            ))}
          </div>
        </>
      )}

      {data.history.length === 0 && (
        <div className="py-10 text-center" style={{ color: C.textMuted }}>
          <div className="flex justify-center mb-3"><Dumbbell size={40} color={C.textMuted} /></div>
          <div className="text-sm">Comece seu primeiro treino<br />pra ver suas estatísticas evoluindo!</div>
        </div>
      )}
    </div>
  );
};
