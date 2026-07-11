import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Edit3, Check, SkipForward, Trophy } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { initAudio } from '../../lib/audio';
import { getLastSession } from '../../lib/workouts';
import { getMaxWeightEver } from '../../lib/stats';
import { exerciseLibrary } from '../../lib/exercises';
import { ExerciseCard } from '../ui/Figures';
import { Confetti } from '../ui/Celebration';
import { SkipModal } from './SkipModal';
import { SubstituteModal } from './SubstituteModal';

// Isolado num componente próprio, montado com key={ex.name}: ao trocar de exercício o React
// remonta com estado zerado (sem precisar de um efeito pra "resetar" showNote/noteText).
const NoteEditor = ({ initialNote, onSave }) => {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState(initialNote);
  return (
    <>
      <button onClick={() => setShowNote(!showNote)} className="text-xs mt-2 mb-4 flex items-center gap-1 transition-all" style={{ color: C.primary, minHeight: 32 }}>
        <Edit3 size={12} /> {initialNote ? 'Editar nota' : 'Adicionar nota'}
      </button>
      {showNote && (
        <div className="mb-4">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} onBlur={() => onSave(noteText)} placeholder="Ex: subir 2kg semana que vem"
            className="w-full p-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, borderRadius: C.radiusMd }} rows={2} />
        </div>
      )}
    </>
  );
};

export const ActiveWorkout = ({ data, workout, onFinish, onShowRest, onSaveNote }) => {
  const [exercises, setExercises] = useState(workout.exercises);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [postponed, setPostponed] = useState([]);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [sets, setSets] = useState(workout.exercises.map(ex => Array(ex.sets).fill(null).map(() => ({ weight: '', reps: '', done: false }))));
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [celebration, setCelebration] = useState({ key: 0, isPR: false });
  const ex = exercises[exerciseIdx];
  const currentSets = sets[exerciseIdx];
  const last = getLastSession(data.history, ex.name);
  const note = data.notes[ex.name] || '';
  const currentMuscle = exerciseLibrary.find(e => e.name === ex.name)?.muscle || null;

  const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}`; };
  useEffect(() => { const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, []);

  const completeSet = () => {
    initAudio();
    const newSets = [...sets];
    const set = newSets[exerciseIdx][activeSetIdx];
    if (!set.weight) set.weight = last.weight > 0 ? last.weight.toString() : '0';
    if (!set.reps) set.reps = ex.reps;
    set.done = true;
    setSets(newSets);

    const completedWeight = parseFloat(set.weight) || 0;
    const prevMax = getMaxWeightEver(data.history, ex.name);
    const isPR = prevMax > 0 && completedWeight > prevMax;
    setCelebration(c => ({ key: c.key + 1, isPR }));

    onShowRest(() => {
      const doneIdxs = new Set();
      newSets.forEach((exSets, i) => { if (exSets.every(s => s.done)) doneIdxs.add(i); });

      if (activeSetIdx < ex.sets - 1) {
        setActiveSetIdx(activeSetIdx + 1);
      } else {
        let nextIdx = -1;
        for (let i = 0; i < exercises.length; i++) {
          if (!doneIdxs.has(i) && !postponed.includes(i) && i !== exerciseIdx) {
            nextIdx = i;
            break;
          }
        }
        if (nextIdx >= 0) {
          setExerciseIdx(nextIdx);
          setActiveSetIdx(0);
        } else if (postponed.length > 0) {
          const next = postponed[0];
          setPostponed(postponed.slice(1));
          setExerciseIdx(next);
          setActiveSetIdx(0);
        } else {
          onFinish(sets, { ...workout, exercises }, elapsed);
        }
      }
    });
  };

  const updateSet = (idx, field, value) => { const newSets = [...sets]; newSets[exerciseIdx][idx][field] = value; setSets(newSets); };

  const postponeExercise = () => {
    setPostponed([...postponed, exerciseIdx]);
    setShowSkipModal(false);
    let nextIdx = -1;
    for (let i = 0; i < exercises.length; i++) {
      if (i !== exerciseIdx && !postponed.includes(i) && !sets[i].every(s => s.done)) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx >= 0) {
      setExerciseIdx(nextIdx);
      setActiveSetIdx(0);
    } else {
      onFinish(sets, { ...workout, exercises }, elapsed);
    }
  };

  const substituteExercise = (newEx) => {
    const newExercises = [...exercises];
    newExercises[exerciseIdx] = { name: newEx.name, sets: ex.sets, reps: ex.reps, fig: newEx.fig };
    setExercises(newExercises);
    setShowSubstituteModal(false);
    setActiveSetIdx(0);
    const newSetsArr = [...sets];
    newSetsArr[exerciseIdx] = Array(ex.sets).fill(null).map(() => ({ weight: '', reps: '', done: false }));
    setSets(newSetsArr);
  };

  return (
    <div className="px-5 pt-6 pb-6" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => onFinish(sets, { ...workout, exercises }, elapsed)} className="p-2 -ml-2" style={{ minWidth: 44, minHeight: 44 }} aria-label="Sair do treino"><X size={20} color={C.textMuted} /></button>
        <div className="text-xs" style={{ color: C.textMuted }}>Exercício {exerciseIdx + 1} de {exercises.length}</div>
        <div className="flex items-center gap-1 text-xs font-medium tabular-nums" style={{ color: C.primary }}><Clock size={12} /> {formatTime(elapsed)}</div>
      </div>
      <div className="h-1 rounded-full mb-6" style={{ background: C.bgCard }}>
        <motion.div className="h-full rounded-full" style={{ background: C.primary }}
          animate={{ width: `${((exerciseIdx + activeSetIdx / ex.sets) / exercises.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>
      <div className="mb-4"><ExerciseCard figKey={ex.fig} size={110} /></div>
      <div className="mb-1">
        <h2 className="text-xl font-medium" style={{ color: C.text }}>{ex.name}</h2>
        <div className="text-xs mt-1" style={{ color: C.textMuted }}>
          {last.weight > 0 ? `Última vez: ${last.weight}kg × ${last.reps} reps` : 'Primeira vez! Comece leve pra aprender execução'}
        </div>
      </div>
      <NoteEditor key={ex.name} initialNote={note} onSave={(text) => onSaveNote(ex.name, text)} />
      <div className="space-y-2 mb-4">
        {currentSets.map((set, idx) => {
          const isActive = idx === activeSetIdx;
          const isDone = set.done;
          const isPending = idx > activeSetIdx;
          return (
            <div key={idx} className="rounded-xl p-3 flex items-center gap-3 transition-all"
              style={{ background: C.bgCard, border: isActive ? `1px solid ${C.primary}` : 'none', opacity: isPending ? 0.5 : 1, borderRadius: C.radiusMd }}>
              <motion.div
                key={`${idx}-${isDone}`}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 tabular-nums"
                style={{ background: isDone ? C.primary : C.bg, color: isDone ? C.primaryOn : isActive ? C.primary : C.textMuted, border: !isDone ? `1px solid ${isActive ? C.primary : C.border}` : 'none' }}
                initial={isDone ? { scale: 0.4 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
              </motion.div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <input type="number" value={set.weight} onChange={(e) => updateSet(idx, 'weight', e.target.value)} disabled={!isActive || isDone}
                    placeholder={last.weight > 0 ? last.weight.toString() : '0'}
                    className="w-full bg-transparent text-sm outline-none font-medium" style={{ color: isDone ? C.primary : C.text }} />
                  <div className="text-[9px]" style={{ color: C.textMuted }}>kg</div>
                </div>
                <div>
                  <input type="number" value={set.reps} onChange={(e) => updateSet(idx, 'reps', e.target.value)} disabled={!isActive || isDone} placeholder={ex.reps}
                    className="w-full bg-transparent text-sm outline-none font-medium" style={{ color: isDone ? C.primary : C.text }} />
                  <div className="text-[9px]" style={{ color: C.textMuted }}>reps</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative flex gap-2">
        {celebration.key > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <Confetti triggerKey={celebration.key} count={celebration.isPR ? 26 : 12} />
          </div>
        )}
        {celebration.isPR && celebration.key > 0 && (
          <motion.div
            key={celebration.key}
            className="absolute -top-8 left-1/2 flex items-center gap-1 text-xs font-medium whitespace-nowrap"
            style={{ color: C.warning, transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Trophy size={14} /> Novo PR!
          </motion.div>
        )}
        <button onClick={() => setShowSkipModal(true)} className="px-4 rounded-2xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: C.bgCard, color: C.textMuted, borderRadius: C.radiusLg, minHeight: 44, minWidth: 44 }} aria-label="Pular exercício">
          <SkipForward size={18} />
        </button>
        <button onClick={completeSet} className="flex-1 p-4 rounded-2xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusLg, minHeight: 44 }}>
          <Check size={18} strokeWidth={2.5} /> Concluir série {activeSetIdx + 1}
        </button>
      </div>
      <SkipModal open={showSkipModal} onPostpone={postponeExercise} onSubstitute={() => { setShowSkipModal(false); setShowSubstituteModal(true); }} onClose={() => setShowSkipModal(false)} />
      <SubstituteModal open={showSubstituteModal} currentMuscle={currentMuscle} onSelect={substituteExercise} onClose={() => setShowSubstituteModal(false)} />
    </div>
  );
};
