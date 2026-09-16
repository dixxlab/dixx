import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Confetti } from '../ui/Celebration';
import { StatRow } from '../ui/Stat';

export const WorkoutFinished = ({ summary, onClose }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
    {/* O único motion da tela: a comemoração. O fade-up que existia no título
        saiu — ele competia com o confete sem comunicar nada. */}
    <div className="relative mb-6 flex justify-center">
      <Confetti triggerKey="workout-finished" count={24} />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
        <Award size={80} color={C.primary} strokeWidth={1} />
      </motion.div>
    </div>
    <h1 className="text-3xl font-medium mb-2" style={{ color: C.text }}>Treino concluído!</h1>
    <p className="text-sm text-center mb-8" style={{ color: C.textMuted }}>Mais um dia somado na sua jornada.</p>
    <div className="w-full max-w-md mb-8 py-5" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <StatRow
        size="lg"
        gap={32}
        items={[
          { value: summary.exercises, label: 'exercícios', color: C.primary },
          { value: summary.minutes, unit: 'min', label: 'duração', color: C.primary },
          { value: summary.volume, unit: 't', label: 'volume', color: C.primary },
        ]}
      />
    </div>
    <button onClick={onClose} className="w-full max-w-md p-4 font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusMd, minHeight: 44 }}>Voltar pra home</button>
  </div>
);
