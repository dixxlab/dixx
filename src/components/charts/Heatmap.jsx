import { T as C } from '../../theme/tokens';
import { buildHeatmap } from '../../lib/stats';

export const Heatmap = ({ history }) => {
  const grid = buildHeatmap(history);

  const getColor = (count, isFuture) => {
    if (isFuture) return C.bg;
    if (count === 0) return C.bgInset;
    if (count === 1) return 'color-mix(in srgb, var(--accent) 40%, transparent)';
    if (count === 2) return 'color-mix(in srgb, var(--accent) 70%, transparent)';
    return C.primary;
  };

  return (
    <div className="p-4" style={{ background: C.bgCard, borderRadius: C.radiusLg, border: `1px solid ${C.border}` }}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Últimas 12 semanas</div>
        <div className="flex items-center gap-1 text-[9px]" style={{ color: C.textMuted }}>
          <span>Menos</span>
          <div className="w-2 h-2 rounded-sm" style={{ background: C.bgInset }} />
          <div className="w-2 h-2 rounded-sm" style={{ background: 'color-mix(in srgb, var(--accent) 40%, transparent)' }} />
          <div className="w-2 h-2 rounded-sm" style={{ background: 'color-mix(in srgb, var(--accent) 70%, transparent)' }} />
          <div className="w-2 h-2 rounded-sm" style={{ background: C.primary }} />
          <span>Mais</span>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 justify-around mr-1">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-[8px] h-4 flex items-center" style={{ color: C.textMuted }}>{i % 2 === 0 ? d : ''}</div>
          ))}
        </div>
        <div className="flex gap-1 flex-1">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 flex-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="aspect-square rounded-sm transition-transform hover:scale-125"
                  style={{ background: getColor(day.count, day.isFuture), minHeight: '14px' }}
                  title={`${day.date.toLocaleDateString('pt-BR')}: ${day.count} treino(s)`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
