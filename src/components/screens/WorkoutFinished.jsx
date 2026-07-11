import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Confetti } from '../ui/Celebration';

export const WorkoutFinished = ({ summary, onClose }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
    <div className="relative mb-6 flex justify-center">
      <Confetti triggerKey="workout-finished" count={24} />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
        <Award size={80} color={C.primary} strokeWidth={1} />
      </motion.div>
    </div>
    <motion.h1 className="text-3xl font-medium mb-2" style={{ color: C.text }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      Treino concluído!
    </motion.h1>
    <p className="text-sm text-center mb-8" style={{ color: C.textMuted }}>Mais um dia somado na sua jornada.</p>
    <div className="w-full max-w-md p-5 mb-8" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div><div className="text-2xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{summary.exercises}</div><div className="text-[10px]" style={{ color: C.textMuted }}>exercícios</div></div>
        <div><div className="text-2xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{summary.minutes}min</div><div className="text-[10px]" style={{ color: C.textMuted }}>duração</div></div>
        <div><div className="text-2xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{summary.volume}t</div><div className="text-[10px]" style={{ color: C.textMuted }}>volume</div></div>
      </div>
    </div>
    <button onClick={onClose} className="w-full max-w-md p-4 rounded-2xl font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusLg, minHeight: 44 }}>Voltar pra home</button>
  </div>
);
