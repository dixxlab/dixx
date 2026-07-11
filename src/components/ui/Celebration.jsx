import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { T as C } from '../../theme/tokens';

const COLORS = [C.primary, C.warning, C.success, C.info];

// Hash determinístico (não usa Math.random — React exige componentes puros durante o render).
// Mesmo seed sempre gera o mesmo valor, mas seeds diferentes (por partícula/disparo) parecem variados.
const pseudoRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Confete leve pra celebrar série concluída / PR batido.
// `triggerKey` deve mudar (ex: incrementar contador) toda vez que quiser disparar de novo.
export const Confetti = ({ triggerKey, count = 18 }) => {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    if (reduce) return [];
    const baseSeed = (Number(triggerKey) || 0) * 97;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (pseudoRandom(baseSeed + i) - 0.5) * 0.6;
      const distance = 50 + pseudoRandom(baseSeed + i + 0.33) * 55;
      return {
        angle,
        distance,
        delay: pseudoRandom(baseSeed + i + 0.66) * 0.06,
        size: 4 + pseudoRandom(baseSeed + i + 0.99) * 5,
        color: COLORS[i % COLORS.length],
      };
    });
  }, [triggerKey, count, reduce]);

  if (reduce || particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ overflow: 'visible' }}>
      {particles.map((p, i) => (
        <motion.span
          key={`${triggerKey}-${i}`}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.angle) * p.distance, y: Math.sin(p.angle) * p.distance - 16, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.65, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};
