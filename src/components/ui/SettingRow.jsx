import { ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';

export const SettingRow = ({ icon: Icon, label, value, onClick }) => (
  <button onClick={onClick} className="w-full p-4 transition-all active:scale-[0.98] flex justify-between items-center" style={{ background: C.bgCard, borderRadius: C.radiusLg, minHeight: 44 }}>
    <div className="flex items-center gap-3">
      <Icon size={16} style={{ color: C.primary }} />
      <div className="text-sm" style={{ color: C.text }}>{label}</div>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-xs" style={{ color: C.textMuted }}>{value}</div>
      <ChevronRight size={14} style={{ color: C.textMuted }} />
    </div>
  </button>
);
