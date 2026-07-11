import { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, Trash2, Edit3, Plus } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { AddExerciseModal } from './AddExerciseModal';
import { useConfirm } from '../ui/ConfirmProvider';

export const WorkoutEditor = ({ workout, onSave, onClose }) => {
  const [name, setName] = useState(workout.name);
  const [muscle, setMuscle] = useState(workout.muscle);
  const [exercises, setExercises] = useState(workout.exercises);
  const [showAdd, setShowAdd] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const { alert } = useConfirm();

  const moveUp = (idx) => {
    if (idx === 0) return;
    const newList = [...exercises];
    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    setExercises(newList);
  };

  const moveDown = (idx) => {
    if (idx === exercises.length - 1) return;
    const newList = [...exercises];
    [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    setExercises(newList);
  };

  const removeExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const addExercise = (ex) => {
    setExercises([...exercises, { name: ex.name, sets: ex.defaultSets, reps: ex.defaultReps, fig: ex.fig }]);
    setShowAdd(false);
  };

  const updateExercise = (idx, field, value) => {
    const newList = [...exercises];
    newList[idx] = { ...newList[idx], [field]: value };
    setExercises(newList);
  };

  const handleSave = async () => {
    if (!name.trim()) { await alert({ title: 'Falta um nome', message: 'Coloca um nome no treino antes de salvar.' }); return; }
    if (exercises.length === 0) { await alert({ title: 'Treino vazio', message: 'Adiciona pelo menos 1 exercício antes de salvar.' }); return; }
    const duration = Math.max(20, exercises.length * 6);
    onSave({ ...workout, name: name.trim(), muscle: muscle.trim() || 'Personalizado', exercises, duration });
  };

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Voltar">
          <ArrowLeft size={20} color={C.text} />
        </button>
        <button onClick={handleSave} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.primaryOn, minHeight: 44 }}>
          Salvar
        </button>
      </div>
      <h1 className="text-2xl font-medium mb-1" style={{ color: C.text }}>Editar treino</h1>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>Substitui o {workout.id} padrão</p>
      <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: C.textMuted }}>Nome do treino</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Peito Pesado"
        className="w-full p-3 outline-none text-sm mb-4"
        style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, borderRadius: C.radiusLg }} />
      <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: C.textMuted }}>Grupo muscular</label>
      <input type="text" value={muscle} onChange={(e) => setMuscle(e.target.value)} placeholder="Ex: Peito + Tríceps"
        className="w-full p-3 outline-none text-sm mb-6"
        style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, borderRadius: C.radiusLg }} />
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>Exercícios ({exercises.length})</div>
      </div>
      <div className="space-y-2 mb-3">
        {exercises.map((ex, idx) => (
          <div key={idx} className="p-3" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1" style={{ color: C.text }}>{ex.name}</div>
                {editingIdx === idx ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                      className="w-14 p-2 rounded-lg text-sm outline-none text-center"
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                    <span className="text-xs" style={{ color: C.textMuted }}>séries x</span>
                    <input type="text" value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                      className="w-16 p-2 rounded-lg text-sm outline-none text-center"
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                    <span className="text-xs" style={{ color: C.textMuted }}>reps</span>
                    <button onClick={() => setEditingIdx(null)} className="ml-auto text-xs px-3 py-1 rounded-lg" style={{ background: C.primary, color: C.primaryOn, minHeight: 32 }}>OK</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingIdx(idx)} className="text-xs flex items-center gap-1" style={{ color: C.textMuted, minHeight: 32 }}>
                    {ex.sets} séries × {ex.reps} reps <Edit3 size={10} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="flex-1 p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center" style={{ background: C.bg, opacity: idx === 0 ? 0.3 : 1, minHeight: 40 }}>
                <ArrowUp size={14} style={{ color: C.textMuted }} />
              </button>
              <button onClick={() => moveDown(idx)} disabled={idx === exercises.length - 1} className="flex-1 p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center" style={{ background: C.bg, opacity: idx === exercises.length - 1 ? 0.3 : 1, minHeight: 40 }}>
                <ArrowDown size={14} style={{ color: C.textMuted }} />
              </button>
              <button onClick={() => removeExercise(idx)} className="flex-1 p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center" style={{ background: C.bg, minHeight: 40 }}>
                <Trash2 size={14} style={{ color: C.danger }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setShowAdd(true)} className="w-full p-4 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-medium" style={{ background: 'transparent', border: `1px dashed ${C.primary}`, color: C.primary, borderRadius: C.radiusLg, minHeight: 44 }}>
        <Plus size={16} /> Adicionar exercício
      </button>
      <AddExerciseModal open={showAdd} onAdd={addExercise} onClose={() => setShowAdd(false)} />
    </div>
  );
};
