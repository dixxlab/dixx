import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Edit3, Check, SkipForward, Trophy } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { initAudio } from '../../lib/audio';
import { getLastSession } from '../../lib/workouts';
import { getMaxWeightEver } from '../../lib/stats';
import { findExerciseByName } from '../../lib/exercises';
import { ExerciseDemo } from '../ui/ExerciseDemo';
import { Confetti } from '../ui/Celebration';
import { SkipModal } from './SkipModal';
import { SubstituteModal } from './SubstituteModal';

// Montado com key={ex.name}: ao trocar de exercício o React remonta com o
// texto do exercício novo, sem efeito pra sincronizar.
const NoteField = ({ initialNote, onSave }) => {
  const [text, setText] = useState(initialNote);
  return (
    <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={() => onSave(text)} placeholder="Ex: subir 2kg semana que vem"
      className="w-full p-3 text-sm outline-none resize-none mb-3"
      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, borderRadius: C.radiusMd }} rows={2} autoFocus />
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
  const [noteOpenFor, setNoteOpenFor] = useState(null);
  const ex = exercises[exerciseIdx];
  const currentSets = sets[exerciseIdx];
  const last = getLastSession(data.history, ex.name);
  const note = data.notes[ex.name] || '';
  const libEx = findExerciseByName(ex.name);
  const showNote = noteOpenFor === ex.name;
  const currentMuscle = libEx?.muscle || null;

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
    <div className="px-5 pt-4 pb-6" style={{ background: C.bg, minHeight: '100%' }}>
      {/* Um bloco só no topo: cabeçalho, progresso, nome e demonstração. Antes
          eram peças empilhadas soltas, e a demonstração aparecia duas vezes —
          o desenho abstrato sempre visível e a foto escondida atrás de um link. */}
      <section className="-mx-5 px-5 pb-3" style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex justify-between items-center">
          <button onClick={() => onFinish(sets, { ...workout, exercises }, elapsed)} className="p-2 -ml-2" style={{ minWidth: 44, minHeight: 44 }} aria-label="Sair do treino"><X size={20} color={C.textMuted} /></button>
          <div className="text-xs tabular-nums" style={{ color: C.textMuted }}>Exercício {exerciseIdx + 1} de {exercises.length}</div>
          <div className="flex items-center gap-1.5" style={{ color: C.primary }}><Clock size={13} /><span className="tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 19, lineHeight: 1 }}>{formatTime(elapsed)}</span></div>
        </div>

        <div className="h-0.5 rounded-full mb-4" style={{ background: C.bg }}>
          <motion.div className="h-full rounded-full" style={{ background: C.primary }}
            animate={{ width: `${((exerciseIdx + activeSetIdx / ex.sets) / exercises.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.01em', textTransform: 'uppercase', color: C.text }}>
            {ex.name}
          </h2>
          <button onClick={() => setNoteOpenFor(showNote ? null : ex.name)} className="p-2 -mr-2 flex-shrink-0 transition-opacity active:opacity-60"
            style={{ color: note || showNote ? C.primary : C.textMuted, minWidth: 44, minHeight: 44 }}
            aria-label={note ? 'Editar nota' : 'Adicionar nota'}>
            <Edit3 size={16} />
          </button>
        </div>
        <div className="text-xs mb-3" style={{ color: C.textMuted }}>
          {last.weight > 0 ? `Última vez: ${last.weight}kg × ${last.reps} reps` : 'Primeira vez! Comece leve pra aprender execução'}
        </div>

        {showNote && <NoteField key={ex.name} initialNote={note} onSave={(text) => onSaveNote(ex.name, text)} />}

        <ExerciseDemo key={ex.name} gifUrl={libEx?.gifUrl} muscle={currentMuscle} compact />
      </section>

      {/* A série em andamento domina; concluídas e pendentes recuam pra linha. */}
      <div className="mt-4 mb-4">
        {currentSets.map((set, idx) => {
          const isActive = idx === activeSetIdx;
          const isDone = set.done;

          if (isActive) {
            return (
              <div key={idx} className="p-4 flex items-center gap-4 mb-2"
                style={{ background: C.primarySoft, border: `1px solid ${C.primary}`, borderRadius: C.radiusMd }}>
                <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 tabular-nums"
                  style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 18, background: C.primary, color: C.primaryOn }}>
                  {idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <input type="number" value={set.weight} onChange={(e) => updateSet(idx, 'weight', e.target.value)}
                      placeholder={last.weight > 0 ? last.weight.toString() : '0'}
                      className="w-full bg-transparent outline-none tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 30, lineHeight: 1.05, color: C.text }} />
                    <div className="text-[10px]" style={{ color: C.textMuted }}>kg</div>
                  </div>
                  <div>
                    <input type="number" value={set.reps} onChange={(e) => updateSet(idx, 'reps', e.target.value)} placeholder={ex.reps}
                      className="w-full bg-transparent outline-none tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 30, lineHeight: 1.05, color: C.text }} />
                    <div className="text-[10px]" style={{ color: C.textMuted }}>reps</div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: `1px solid ${C.border}`, opacity: isDone ? 1 : 0.45 }}>
              <motion.span
                key={`${idx}-${isDone}`}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 tabular-nums"
                style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 12, background: isDone ? C.primary : 'transparent', color: isDone ? C.primaryOn : C.textMuted, border: isDone ? 'none' : `1px solid ${C.border}` }}
                initial={isDone ? { scale: 0.4 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </motion.span>
              {isDone ? (
                <span className="text-sm tabular-nums" style={{ color: C.textMuted }}>
                  <span style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 17, color: C.text }}>{set.weight}</span> kg
                  <span className="mx-1">×</span>
                  <span style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 17, color: C.text }}>{set.reps}</span> reps
                </span>
              ) : (
                <span className="text-sm" style={{ color: C.textMuted }}>a fazer</span>
              )}
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
        <button onClick={() => setShowSkipModal(true)} className="px-4 font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: C.bgCard, color: C.textMuted, borderRadius: C.radiusLg, minHeight: 44, minWidth: 44 }} aria-label="Pular exercício">
          <SkipForward size={18} />
        </button>
        <button onClick={completeSet} className="flex-1 p-4 font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusLg, minHeight: 44 }}>
          <Check size={18} strokeWidth={2.5} /> Concluir série {activeSetIdx + 1}
        </button>
      </div>
      <SkipModal open={showSkipModal} onPostpone={postponeExercise} onSubstitute={() => { setShowSkipModal(false); setShowSubstituteModal(true); }} onClose={() => setShowSkipModal(false)} />
      <SubstituteModal open={showSubstituteModal} currentMuscle={currentMuscle} onSelect={substituteExercise} onClose={() => setShowSubstituteModal(false)} />
    </div>
  );
};
