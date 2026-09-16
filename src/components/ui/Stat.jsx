import { T as C } from '../../theme/tokens';

const SIZES = { sm: 19, md: 26, lg: 32 };

/* Par valor/rótulo: o número vai na fonte de display (condensada), o rótulo fica
   em caixa de frase, pequeno e mudo. É a peça que substitui tanto os metadados
   colados com bullet ("7 exercícios • ~60min") quanto os labels em caixa alta. */
export const Stat = ({ value, unit, label, size = 'md', color, icon: Icon }) => {
  const px = SIZES[size] || SIZES.md;
  return (
    <div>
      <div
        className="flex items-baseline gap-1 tabular-nums"
        style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: px, lineHeight: 1, color: color || C.text }}
      >
        {Icon && <Icon size={Math.round(px * 0.5)} color={C.warning} style={{ alignSelf: 'center' }} />}
        {value}
        {unit && <span style={{ fontSize: Math.round(px * 0.56), color: C.textMuted }}>{unit}</span>}
      </div>
      <div className="text-[10px] mt-1" style={{ color: C.textMuted }}>{label}</div>
    </div>
  );
};

/* Linha horizontal de stats — a alternativa estruturada à frase com bullets. */
export const StatRow = ({ items, size = 'md', gap = 26 }) => (
  <div className="flex" style={{ gap }}>
    {items.map((item, i) => <Stat key={i} size={size} {...item} />)}
  </div>
);
