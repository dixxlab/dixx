import { T as C } from '../../theme/tokens';

/* Linha de ficha/logbook: sem fundo de card, sem raio, só um divisor de 1px.
   É o nível "lista" da hierarquia — deliberadamente mais plano que o herói de
   cada tela, pra que os dois não disputem a mesma atenção. */
export const ListRow = ({ leading, title, subtitle, trailing, onClick, danger }) => {
  const content = (
    <>
      {leading && <div className="flex-shrink-0 flex items-center">{leading}</div>}
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm truncate" style={{ color: danger ? C.danger : C.text }}>{title}</div>
        {subtitle && <div className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>{subtitle}</div>}
      </div>
      {trailing && <div className="flex-shrink-0 flex items-center gap-2">{trailing}</div>}
    </>
  );

  const style = { borderBottom: `1px solid ${C.border}`, minHeight: 44 };

  if (!onClick) {
    return <div className="flex items-center gap-3 py-3" style={style}>{content}</div>;
  }
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 transition-opacity active:opacity-60" style={style}>
      {content}
    </button>
  );
};

/* Valor à direita de uma ListRow, na fonte de display. A unidade fica menor,
   muda e com um respiro do número — sem isso "96.0" + "1RM" lê como 96.01. */
export const RowValue = ({ children, unit, color }) => (
  <span className="flex items-baseline tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 19, color: color || C.textMuted }}>
    {children}
    {unit && <span style={{ fontSize: 11, marginLeft: 2, color: C.textMuted }}>{unit}</span>}
  </span>
);
