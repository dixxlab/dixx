import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { playBeep } from '../../lib/audio';

export const RestTimer = ({ restTime, onSkip, onDone }) => {
  const [seconds, setSeconds] = useState(restTime);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  // Efeitos dependem só de `seconds` (não de `onDone`, recriado a cada render do pai) —
  // evita reagendar o timer/repetir beep se o App re-renderizar durante o descanso.
  useEffect(() => {
    if (seconds > 0 && seconds <= 3) playBeep(800, 120);
    if (seconds === 0) { playBeep(1000, 400); onDoneRef.current(); }
  }, [seconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const progress = ((restTime - seconds) / restTime) * 283;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds <= 3 && seconds > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col px-5 pt-6 pb-6" style={{ background: C.bg, paddingTop: 'calc(env(safe-area-inset-top) + 24px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
      <div className="flex justify-between items-center mb-12">
        <div className="text-xs" style={{ color: C.textMuted }}>Descansando...</div>
        <div className="text-xs flex items-center gap-1" style={{ color: C.primary }}><Check size={12} /> Série concluída</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div className="relative w-64 h-64 mb-6" animate={urgent ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 1, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.bgCard} strokeWidth="4" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.primary} strokeWidth="4" strokeDasharray="283" strokeDashoffset={283 - progress} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{m}:{s.toString().padStart(2, '0')}</div>
            <div className="text-xs mt-2" style={{ color: C.textMuted }}>de {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}</div>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setSeconds(s => s + 30)} className="p-4 rounded-2xl font-medium transition-all active:scale-95" style={{ background: C.bgCard, color: C.text, borderRadius: C.radiusLg, minHeight: 44 }}>+30s</button>
        <button onClick={onSkip} className="p-4 rounded-2xl font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusLg, minHeight: 44 }}>Pular</button>
      </div>
    </div>
  );
};
