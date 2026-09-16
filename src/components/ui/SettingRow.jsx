import { ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';

export const SettingRow = ({ icon: Icon, label, value, onClick }) => (
  <button
    onClick={onClick}
    className="w-full py-3.5 transition-opacity active:opacity-60 flex justify-between items-center"
    style={{ borderBottom: `1px solid ${C.border}`, minHeight: 44 }}
  >
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
