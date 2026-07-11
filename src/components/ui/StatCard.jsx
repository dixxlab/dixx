import { T as C } from '../../theme/tokens';

export const StatCard = ({ value, label, icon: Icon }) => (
  <div className="p-3 text-center" style={{ background: C.bgCard, borderRadius: C.radiusLg, border: `1px solid ${C.border}` }}>
    <div className="text-xl font-medium flex items-center justify-center gap-1 tabular-nums" style={{ color: C.text, fontFamily: C.fontData }}>
      {Icon && <Icon size={16} color={C.warning} />}{value}
    </div>
    <div className="text-[10px] mt-1" style={{ color: C.textMuted }}>{label}</div>
  </div>
);
