import { X, Check } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { useTheme } from '../../theme/ThemeContext';

export const ThemePicker = ({ open, onClose }) => {
  const { theme, setTheme, themes } = useTheme();
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium" style={{ color: C.text }}>Tema</h2>
        <button onClick={onClose} className="p-1 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar"><X size={20} color={C.textMuted} /></button>
      </div>
      <div className="space-y-2">
        {themes.map((t) => (
          <button key={t.id} onClick={() => { setTheme(t.id); onClose(); }}
            className="w-full p-4 text-left transition-all active:scale-[0.98] flex items-center gap-3"
            style={{ background: theme === t.id ? C.primarySoft : C.bg, border: `1px solid ${theme === t.id ? C.primary : C.border}`, borderRadius: C.radiusLg, minHeight: 44 }}>
            <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 32, height: 32, background: t.swatchBg, border: `1px solid ${C.border}` }}>
              <div style={{ width: '100%', height: '100%', background: `radial-gradient(circle at 65% 35%, ${t.swatchAccent}, transparent 60%)` }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: C.text }}>{t.label}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{t.description}</div>
            </div>
            {theme === t.id && <Check size={18} style={{ color: C.primary }} />}
          </button>
        ))}
      </div>
    </Sheet>
  );
};
