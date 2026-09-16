import { Play, Lightbulb, Flame } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Avatar } from '../ui/Avatar';
import { StatRow } from '../ui/Stat';
import { SectionTitle } from '../ui/SectionTitle';
import { ListRow, RowValue } from '../ui/ListRow';
import { FigGlyph, getDominantFig } from '../ui/Figures';
import { getTodayWorkoutIdx, calculateStreak } from '../../lib/workouts';

export const Dashboard = ({ data, plans, onStartWorkout, onNavigate }) => {
  const todayIdx = getTodayWorkoutIdx(data.history, plans);
  const todayWorkout = plans[todayIdx];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const streak = calculateStreak(data.history);
  // eslint-disable-next-line react-hooks/purity -- "esta semana" é relativo a agora por definição; re-render eventual é inofensivo aqui
  const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekWorkouts = data.history.filter(s => new Date(s.date).getTime() > weekCutoff).length;
  const weekVolume = data.history.filter(s => new Date(s.date).getTime() > weekCutoff)
    .reduce((sum, s) => sum + s.exercises.reduce((es, ex) => es + ex.sets.reduce((ss, set) => ss + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0), 0);
  const todaySets = todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-xs" style={{ color: C.textMuted }}>{greeting},</div>
          <div className="text-xl font-medium" style={{ color: C.text }}>{data.user.name}</div>
        </div>
        <Avatar name={data.user.name} photo={data.photo} size={40} onClick={() => onNavigate('profile')} />
      </div>

      {/* Herói: sangra pras bordas e se distingue por escala, não por moldura de card.
          O stick figure do movimento dominante do treino entra como marca d'água. */}
      <section
        className="-mx-5 px-5 py-5 relative overflow-hidden"
        style={{ background: C.bgCard, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="absolute pointer-events-none" style={{ right: -18, top: 4 }} aria-hidden="true">
          <FigGlyph figKey={getDominantFig(todayWorkout.exercises)} size={150} opacity={0.13} />
        </div>
        <div className="relative">
          <div className="text-xs" style={{ color: C.textMuted }}>{todayLabel}</div>
          <h1
            className="mt-0.5"
            style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.01em', textTransform: 'uppercase', color: C.text }}
          >
            {todayWorkout.name}
          </h1>
          <div className="text-sm mt-0.5 mb-4" style={{ color: C.primary }}>{todayWorkout.muscle}</div>
          <StatRow
            items={[
              { value: todayWorkout.exercises.length, label: 'exercícios' },
              { value: todayWorkout.duration, unit: 'min', label: 'estimado' },
              { value: todaySets, label: 'séries' },
            ]}
          />
          <button
            onClick={() => onStartWorkout(todayWorkout)}
            className="w-full mt-4 p-3 font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusMd, minHeight: 44 }}
          >
            <Play size={16} fill={C.primaryOn} /> Iniciar treino
          </button>
          <div className="flex items-start gap-2 mt-3 text-xs" style={{ color: C.textMuted }}>
            <Lightbulb size={13} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
            <span>Iniciante? Faça 5min de esteira ou bike antes pra aquecer.</span>
          </div>
        </div>
      </section>

      <SectionTitle className="mt-7 mb-3">Esta semana</SectionTitle>
      <div className="pb-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <StatRow
          size="lg"
          gap={28}
          items={[
            { value: weekWorkouts, label: 'treinos' },
            { value: streak, label: 'dias seguidos', icon: Flame },
            { value: (weekVolume / 1000).toFixed(1), unit: 't', label: 'volume' },
          ]}
        />
      </div>

      <SectionTitle className="mt-6 mb-1">Próximos treinos</SectionTitle>
      <div>
        {plans.filter((_, i) => i !== todayIdx).slice(0, 2).map((w) => (
          <ListRow
            key={w.id}
            leading={<FigGlyph figKey={getDominantFig(w.exercises)} size={26} />}
            title={w.name}
            subtitle={w.muscle}
            trailing={<RowValue>{w.exercises.length}</RowValue>}
          />
        ))}
      </div>
    </div>
  );
};
