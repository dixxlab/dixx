import { motion, useReducedMotion } from 'framer-motion';

/* Marca Dixx — origem em public/brand-proposals/dixx-monolith.svg.
   Os traços ficam como constantes porque a abertura anima o D e o x em tempos
   diferentes, e o mesmo desenho alimenta o ícone estático. */
const D_PATH = 'M370 246h196c201 0 344 146 344 354s-143 354-344 354H370c-33 0-60-27-60-60V306c0-33 27-60 60-60Zm114 151v406h73c108 0 177-79 177-203s-69-203-177-203h-73Z';
const X_PATH = 'm866 706 96 96M962 706l-96 96';
const TICK_PATH = 'M344 275h201';

const Defs = () => (
  <defs>
    <linearGradient id="dixx-d" x1="310" y1="246" x2="910" y2="954" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFFFF" />
      <stop offset=".46" stopColor="#EEF2F4" />
      <stop offset="1" stopColor="#B8C0C8" />
    </linearGradient>
    <linearGradient id="dixx-x" x1="850" y1="690" x2="978" y2="790" gradientUnits="userSpaceOnUse">
      <stop stopColor="#C9F2FF" />
      <stop offset=".4" stopColor="#45C1FF" />
      <stop offset="1" stopColor="#087DB8" />
    </linearGradient>
    <filter id="dixx-lift" x="260" y="196" width="710" height="820" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="23" stdDeviation="19" floodColor="#000000" floodOpacity=".72" />
    </filter>
  </defs>
);

/* Versão estática da marca, sem animação. */
export const DixxMark = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="236 210 800 800" fill="none" role="img" aria-label="Dixx">
    <Defs />
    <path d={D_PATH} fill="url(#dixx-d)" fillRule="evenodd" filter="url(#dixx-lift)" />
    <path d={X_PATH} stroke="url(#dixx-x)" strokeLinecap="round" strokeWidth="26" style={{ filter: 'drop-shadow(0 0 10px rgba(69, 193, 255, 0.55))' }} />
    <path d={TICK_PATH} stroke="#FFFFFF" strokeLinecap="round" strokeOpacity=".55" strokeWidth="8" />
  </svg>
);

export const SplashScreen = () => {
  const reduce = useReducedMotion();

  // Sem movimento: a marca aparece pronta e some no fim, sem entrada encenada.
  if (reduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
        style={{ background: '#000000' }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: 2.3, times: [0, 0.8, 1] }}
      >
        <DixxMark size={196} />
        <div className="text-sm mt-7 text-center" style={{ color: '#8b8d97' }}>Evolua a cada repetição.</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{ background: '#000000' }}
      /* A saída acontece aqui, no container inteiro, pra marca e frase sumirem
         juntas logo antes do app assumir. */
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2.3, times: [0, 0.82, 1], ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg width={196} height={196} viewBox="236 210 800 800" fill="none" role="img" aria-label="Dixx">
          <Defs />
          <motion.path
            d={D_PATH}
            fill="url(#dixx-d)"
            fillRule="evenodd"
            filter="url(#dixx-lift)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* O x entra depois do D e acende: é ele que carrega o azul da marca. */}
          <motion.path
            d={X_PATH}
            stroke="url(#dixx-x)"
            strokeLinecap="round"
            strokeWidth="26"
            initial={{ opacity: 0, filter: 'drop-shadow(0 0 0px rgba(69, 193, 255, 0))' }}
            animate={{
              opacity: 1,
              filter: [
                'drop-shadow(0 0 0px rgba(69, 193, 255, 0))',
                'drop-shadow(0 0 22px rgba(69, 193, 255, 0.95))',
                'drop-shadow(0 0 9px rgba(69, 193, 255, 0.5))',
              ],
            }}
            transition={{ delay: 0.46, duration: 0.85, times: [0, 0.45, 1], ease: 'easeOut' }}
          />
          <motion.path
            d={TICK_PATH}
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeOpacity=".55"
            strokeWidth="8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="text-sm mt-7 text-center"
        style={{ color: '#8b8d97' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.78, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        Evolua a cada repetição.
      </motion.div>
    </motion.div>
  );
};
