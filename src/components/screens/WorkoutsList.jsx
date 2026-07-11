import { useState } from 'react';
import { MoreVertical, Edit3, RotateCcw, BookOpen } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { getTodayWorkoutIdx } from '../../lib/workouts';
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
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>Divisão {plans.map(p => p.id).join('')}</p>
      <div className="space-y-3">
        {plans.map((w, i) => {
          const isCustom = !!data.customWorkouts[w.id];
          return (
            <div key={w.id} className="relative" style={{ background: C.bgCard, borderLeft: i === todayIdx ? `3px solid ${C.primary}` : 'none', borderRadius: C.radiusLg }}>
              <button onClick={() => onSelectWorkout(w)} className="w-full p-4 text-left transition-all active:scale-[0.98]" style={{ paddingLeft: i === todayIdx ? '13px' : '16px', paddingRight: '50px', minHeight: 44 }}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium" style={{ color: C.text }}>{w.name}</div>
                    {isCustom && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.bgCard, color: C.primary, border: `1px solid ${C.primary}` }}>CUSTOM</span>}
                  </div>
                  {i === todayIdx && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.primary, color: C.primaryOn }}>HOJE</span>}
                </div>
                <div className="text-xs" style={{ color: C.textMuted }}>{w.muscle} • {w.exercises.length} exercícios • ~{w.duration}min</div>
              </button>
              <button onClick={() => setMenuOpenId(menuOpenId === w.id ? null : w.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Mais opções">
                <MoreVertical size={18} style={{ color: C.textMuted }} />
              </button>
              {menuOpenId === w.id && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpenId(null)} />
                  <div className="absolute right-2 top-12 z-40 overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.border}`, minWidth: '180px', borderRadius: C.radiusMd }}>
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
        <button onClick={onOpenLibrary} className="w-full p-4 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-medium" style={{ background: C.bgCard, color: C.primary, border: `1px solid ${C.primary}`, borderRadius: C.radiusLg, minHeight: 44 }}>
          <BookOpen size={16} /> Ver biblioteca completa
        </button>
      </div>
    </div>
  );
};
