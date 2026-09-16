import { useEffect, useState } from 'react';
import { motion, useReducedMotion, animate } from 'framer-motion';

/* Marca Dixx — origem em public/brand-proposals/dixx-monolith.svg.
   Os traços ficam como constantes porque a abertura anima o D e o x em tempos
   diferentes, e o mesmo desenho alimenta o ícone estático. */
const D_PATH = 'M370 246h196c201 0 344 146 344 354s-143 354-344 354H370c-33 0-60-27-60-60V306c0-33 27-60 60-60Zm114 151v406h73c108 0 177-79 177-203s-69-203-177-203h-73Z';
const X_PATH = 'm866 706 96 96M962 706l-96 96';
/* Espaçamento em px, não em em: o Framer não interpola em nesta propriedade e
   a animação inteira do elemento morria — o nome ficava com opacity 0, ou seja,
   invisível. 30,6px e 6,12px são 0.9em e 0.18em do tamanho 34. */
const wordmarkBase = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800,
  fontSize: 34,
  lineHeight: 1,
  color: '#f2f3f5',
  marginTop: -4,
};

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

const TRACKING_ABERTO = 30.6; // 0.9em de 34px
const TRACKING_FINAL = 6.12;  // 0.18em de 34px

/* O nome se firma fechando o espaçamento, em vez de só aparecer.

   O valor é conduzido por estado, não pelo `animate` do Framer: ele não
   interpola letterSpacing, e deixar essa propriedade na mão dele derrubava a
   animação inteira do elemento — o nome ficava com opacity 0, invisível.

   Conduzir por uma variável só resolve de quebra o que mais importa aqui: o
   espaçamento é aplicado depois de cada letra, inclusive a última, e empurraria
   a palavra pra direita. A margem negativa é o mesmo valor com sinal trocado,
   então a compensação é exata em todos os quadros, não só no repouso. */
const Wordmark = ({ reduce }) => {
  const [tracking, setTracking] = useState(reduce ? TRACKING_FINAL : TRACKING_ABERTO);

  useEffect(() => {
    if (reduce) return undefined;
    const controls = animate(TRACKING_ABERTO, TRACKING_FINAL, {
      delay: 0.78,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setTracking(v),
      onComplete: () => setTracking(TRACKING_FINAL),
    });
    // Rede de segurança: um nome preso aberto e invisível seria pior que não animar.
    const garantia = setTimeout(() => setTracking(TRACKING_FINAL), 1600);
    return () => { controls.stop(); clearTimeout(garantia); };
  }, [reduce]);

  return (
    <motion.div
      style={{ ...wordmarkBase, letterSpacing: `${tracking}px`, marginRight: `${-tracking}px` }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.78, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      DIXX
    </motion.div>
  );
};

export const SplashScreen = () => {
  const reduce = useReducedMotion();

  // Sem movimento: a marca aparece pronta e some no fim, sem entrada encenada.
  if (reduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 gap-5"
        style={{ background: '#000000' }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: 2.3, times: [0, 0.87, 1] }}
      >
        <DixxMark size={196} />
        <Wordmark reduce />
        <div className="text-sm text-center" style={{ color: '#8b8d97' }}>Evolua a cada repetição.</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 gap-5"
      style={{ background: '#000000' }}
      /* A saída acontece aqui, no container inteiro, pra marca e frase sumirem
         juntas logo antes do app assumir. */
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2.3, times: [0, 0.87, 1], ease: 'easeInOut' }}
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

      <Wordmark reduce={false} />

      <motion.div
        className="text-sm text-center"
        style={{ color: '#8b8d97' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Evolua a cada repetição.
      </motion.div>
    </motion.div>
  );
};
