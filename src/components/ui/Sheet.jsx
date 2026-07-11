import { motion } from 'framer-motion';
import { T as C } from '../../theme/tokens';

// Bottom sheet primitivo — usado por SkipModal, RestTimePicker, DivisionPicker, ConfirmSheet etc.
// Nota: AnimatePresence não é usado aqui de propósito — em teste, sua animação de saída não
// disparava o callback de conclusão nesse projeto (framer-motion 12 + React 19), deixando o
// modal preso na tela pra sempre depois de "fechar". Conditional render simples + animação só
// de entrada é 100% confiável; o fechamento é instantâneo, o que é uma troca aceitável.
export const Sheet = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-5"
        style={{ background: C.bgCard, borderRadius: '28px 28px 0 0', paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Modal fullscreen — usado por Library, AddExerciseModal, SubstituteModal, WorkoutEditor (via composição das telas).
export const FullScreenSheet = ({ open, children }) => {
  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: C.bg }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
