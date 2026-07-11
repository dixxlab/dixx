import { useState } from 'react';
import { X } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Sheet } from '../ui/Sheet';

export const RestTimePicker = ({ open, currentValue, onSave, onClose }) => {
  const [custom, setCustom] = useState('');
  const presets = [60, 90, 120, 180];
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium" style={{ color: C.text }}>Tempo de descanso</h2>
        <button onClick={onClose} className="p-1 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar"><X size={20} color={C.textMuted} /></button>
      </div>
      <p className="text-xs mb-4" style={{ color: C.textMuted }}>Escolha entre as opções rápidas ou defina um valor customizado.</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {presets.map((sec) => (
          <button key={sec} onClick={() => onSave(sec)}
            className="p-4 rounded-2xl font-medium transition-all active:scale-95"
            style={{ background: currentValue === sec ? C.primary : C.bg, color: currentValue === sec ? C.primaryOn : C.text, border: `1px solid ${currentValue === sec ? C.primary : C.border}`, borderRadius: C.radiusLg, minHeight: 44 }}>
            {sec}s
          </button>
        ))}
      </div>
      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Customizado</div>
      <div className="flex gap-2">
        <input type="number" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ex: 75"
          className="flex-1 p-3 rounded-xl outline-none text-sm"
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
        <button onClick={() => { const val = parseInt(custom); if (val > 0) onSave(val); }} disabled={!custom || parseInt(custom) <= 0}
          className="px-5 rounded-xl font-medium transition-all active:scale-95"
          style={{ background: custom && parseInt(custom) > 0 ? C.primary : C.bg, color: custom && parseInt(custom) > 0 ? C.primaryOn : C.textMuted, opacity: custom && parseInt(custom) > 0 ? 1 : 0.5, minHeight: 44 }}>
          Salvar
        </button>
      </div>
    </Sheet>
  );
};
