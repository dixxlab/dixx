import { motion } from 'framer-motion';
import { Home, Dumbbell, BarChart3, User } from 'lucide-react';
import { T as C } from '../../theme/tokens';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'workouts', icon: Dumbbell, label: 'Treinos' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

export const BottomNav = ({ active, onChange }) => {
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
      {tabs.map(({ id, icon: Icon, label }) => {
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
            <Icon size={20} style={{ color: isActive ? C.primary : C.textMuted, position: 'relative' }} />
            <div className="text-[9px] font-medium" style={{ color: isActive ? C.primary : C.textMuted, position: 'relative' }}>{label}</div>
          </button>
        );
      })}
    </div>
  );
};
