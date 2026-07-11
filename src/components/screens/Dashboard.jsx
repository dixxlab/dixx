import { motion } from 'framer-motion';
import { Play, ChevronRight, Lightbulb, Flame, BicepsFlexed } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Avatar } from '../ui/Avatar';
import { StatCard } from '../ui/StatCard';
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

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs" style={{ color: C.textMuted }}>{greeting},</div>
          <div className="text-xl font-medium flex items-center gap-2" style={{ color: C.text }}>{data.user.name} <BicepsFlexed size={18} color={C.primary} /></div>
        </div>
        <Avatar name={data.user.name} photo={data.photo} size={40} onClick={() => onNavigate('profile')} />
      </div>
      <motion.div
        className="p-5 mb-4 transition-all"
        style={{ background: C.bgCard, border: `1px solid ${C.primary}`, borderRadius: C.radiusXl }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Treino de hoje</div>
        <div className="text-xl font-medium mb-1" style={{ color: C.text }}>{todayWorkout.name}</div>
        <div className="text-sm mb-4" style={{ color: C.textMuted }}>{todayWorkout.muscle} • {todayWorkout.exercises.length} exercícios • ~{todayWorkout.duration}min</div>
        <div className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2" style={{ background: C.bg, color: C.textMuted, borderRadius: C.radiusMd }}>
          <span style={{ color: C.primary }}><Lightbulb size={14} /></span>
          <span>Iniciante? Faça 5min de esteira ou bike antes pra aquecer.</span>
        </div>
        <button onClick={() => onStartWorkout(todayWorkout)} className="w-full p-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusLg, minHeight: 44 }}>
          <Play size={16} fill={C.primaryOn} /> Iniciar treino
        </button>
      </motion.div>
      <div className="text-[10px] uppercase tracking-wider mb-2 mt-6" style={{ color: C.textMuted }}>Esta semana</div>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatCard value={weekWorkouts} label="treinos" />
        <StatCard value={streak} label="dias" icon={Flame} />
        <StatCard value={`${(weekVolume / 1000).toFixed(1)}t`} label="volume" />
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Próximos treinos</div>
      <div className="space-y-2">
        {plans.filter((_, i) => i !== todayIdx).slice(0, 2).map((w) => (
          <div key={w.id} className="rounded-2xl p-3 flex justify-between items-center transition-all active:scale-95" style={{ background: C.bgCard, borderRadius: C.radiusLg, minHeight: 44 }}>
            <div>
              <div className="text-sm font-medium" style={{ color: C.text }}>{w.name}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{w.muscle}</div>
            </div>
            <ChevronRight size={18} style={{ color: C.textMuted }} />
          </div>
        ))}
      </div>
    </div>
  );
};
