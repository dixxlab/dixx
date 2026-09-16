import { motion } from 'framer-motion';
import { T as C } from '../../theme/tokens';
import { NavGlyph } from './Figures';
import { Avatar } from './Avatar';

// Os `id` são os mesmos que o App usa pra trocar de aba — só os glifos e os
// rótulos mudaram. "Hoje" no lugar de "Home" porque é o que a tela mostra, e
// "Evolução" no lugar de "Stats" porque eram as duas únicas palavras em inglês
// da navegação de um app todo em português.
const tabs = [
  { id: 'home', glyph: 'hoje', label: 'Hoje' },
  { id: 'workouts', glyph: 'treinos', label: 'Treinos' },
  { id: 'stats', glyph: 'evolucao', label: 'Evolução' },
  { id: 'profile', glyph: null, label: 'Perfil' },
];

export const BottomNav = ({ active, onChange, userName, photo }) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 mx-auto px-2 pt-2 flex justify-around z-40"
      style={{
        background: C.bgOverlay,
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderTop: `1px solid ${C.border}`,
        maxWidth: '500px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 6px)',
      }}
    >
      {tabs.map(({ id, glyph, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="relative flex flex-col items-center gap-1 px-3 py-2 transition-transform active:scale-90"
            style={{ minWidth: 56, minHeight: 44 }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-x-1 top-0 bottom-0"
                style={{ background: C.primarySoft, borderRadius: C.radiusMd }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {/* A aba de perfil mostra você: inicial ou foto, em vez de uma
                silhueta humana genérica. */}
            <span style={{ position: 'relative', lineHeight: 0 }}>
              {glyph
                ? <NavGlyph name={glyph} size={21} color={isActive ? C.primary : C.textMuted} />
                : <span style={{ display: 'flex', opacity: isActive ? 1 : 0.45 }}><Avatar name={userName} photo={photo} size={21} /></span>}
            </span>
            <div className="text-[10px] font-medium" style={{ color: isActive ? C.primary : C.textMuted, position: 'relative' }}>{label}</div>
          </button>
        );
      })}
    </div>
  );
};
