import { useState } from 'react';
import { MoreVertical, Edit3, RotateCcw, BookOpen } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { getTodayWorkoutIdx } from '../../lib/workouts';
import { ExerciseThumb } from '../ui/ExerciseThumb';
import { getWorkoutThumb } from '../../lib/demos';
import { RowValue } from '../ui/ListRow';
import { useConfirm } from '../ui/ConfirmProvider';

export const WorkoutsList = ({ data, plans, onSelectWorkout, onOpenLibrary, onEditWorkout, onResetWorkout }) => {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const todayIdx = getTodayWorkoutIdx(data.history, plans);
  const { confirm } = useConfirm();

  const handleReset = async (workoutId) => {
    setMenuOpenId(null);
    const ok = await confirm({ title: 'Resetar esse treino?', message: 'Você vai perder as customizações e voltar pro padrão.', confirmLabel: 'Resetar', danger: true });
    if (ok) onResetWorkout(workoutId);
  };

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <h1 className="text-2xl font-medium mb-1" style={{ color: C.text }}>Seus treinos</h1>
      <p className="text-sm mb-5" style={{ color: C.textMuted }}>Divisão {plans.map(p => p.id).join('')}</p>

      <div>
        {plans.map((w, i) => {
          const isCustom = !!data.customWorkouts[w.id];
          const isToday = i === todayIdx;
          return (
            <div key={w.id} className="relative flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
              <button
                onClick={() => onSelectWorkout(w)}
                className="flex-1 min-w-0 flex items-center gap-3 py-3.5 text-left transition-opacity active:opacity-60"
                style={{ minHeight: 44 }}
              >
                <ExerciseThumb {...getWorkoutThumb(w.exercises)} size={38} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: isToday ? C.primary : C.text }}>{w.name}</span>
                    {isToday && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.primarySoft, color: C.primary }}>hoje</span>}
                    {isCustom && <span className="text-[10px]" style={{ color: C.textMuted }}>custom</span>}
                  </div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>{w.muscle}</div>
                </div>
                <div className="flex items-baseline gap-3 flex-shrink-0">
                  <RowValue unit="ex">{w.exercises.length}</RowValue>
                  <RowValue unit="min">{w.duration}</RowValue>
                </div>
              </button>
              <button
                onClick={() => setMenuOpenId(menuOpenId === w.id ? null : w.id)}
                className="p-2 -mr-2 transition-opacity active:opacity-60"
                style={{ minWidth: 44, minHeight: 44 }}
                aria-label="Mais opções"
              >
                <MoreVertical size={18} style={{ color: C.textMuted }} />
              </button>
              {menuOpenId === w.id && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpenId(null)} />
                  <div className="absolute right-0 top-12 z-40 overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.border}`, minWidth: '180px', borderRadius: C.radiusMd }}>
                    <button onClick={() => { setMenuOpenId(null); onEditWorkout(w); }} className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition-all active:scale-95" style={{ background: C.bgCard, color: C.text, minHeight: 44 }}>
                      <Edit3 size={14} style={{ color: C.primary }} /> Editar treino
                    </button>
                    {isCustom && (
                      <button onClick={() => handleReset(w.id)} className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition-all active:scale-95" style={{ background: C.bgCard, color: C.danger, borderTop: `1px solid ${C.border}`, minHeight: 44 }}>
                        <RotateCcw size={14} /> Resetar pro padrão
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpenLibrary}
        className="w-full mt-6 p-3 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-medium text-sm"
        style={{ background: C.bgCard, color: C.primary, border: `1px solid ${C.border}`, borderRadius: C.radiusMd, minHeight: 44 }}
      >
        <BookOpen size={16} /> Ver biblioteca completa
      </button>
    </div>
  );
};
