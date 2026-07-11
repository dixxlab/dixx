import { motion, useReducedMotion } from 'framer-motion';
import { T as C } from '../../theme/tokens';

export const DixxLogo = ({ size = 40 }) => (
  <img src="/dixx-logo.png" alt="Dixx" width={size} height={size} style={{ display: 'block' }} />
);

export const SplashScreen = () => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: C.bg }}
    >
      <motion.div
        className="mb-6"
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 18 }}
      >
        <DixxLogo size={96} />
      </motion.div>
      <motion.div
        className="text-4xl font-medium tracking-tight"
        style={{ color: C.primary, letterSpacing: '-0.02em' }}
        initial={reduce ? false : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { delay: 0.35, duration: 0.5 }}
      >
        Dixx
      </motion.div>
      <motion.div
        className="text-sm mt-2"
        style={{ color: C.textMuted }}
        initial={reduce ? false : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { delay: 0.5, duration: 0.5 }}
      >
        seu amigo de treino
      </motion.div>
    </motion.div>
  );
};
