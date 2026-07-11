import { X, RefreshCw, Shuffle } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Sheet } from '../ui/Sheet';

export const SkipModal = ({ open, onPostpone, onSubstitute, onClose }) => {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium" style={{ color: C.text }}>Pular exercício</h2>
        <button onClick={onClose} className="p-1 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar"><X size={20} color={C.textMuted} /></button>
      </div>
      <p className="text-xs mb-4" style={{ color: C.textMuted }}>Máquina ocupada? Escolha o que fazer:</p>
      <div className="space-y-2">
        <button onClick={onPostpone} className="w-full p-4 text-left transition-all active:scale-[0.98] flex items-center gap-3" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.radiusLg, minHeight: 44 }}>
          <div style={{ color: C.primary }}><RefreshCw size={24} /></div>
          <div>
            <div className="text-sm font-medium" style={{ color: C.text }}>Adiar pro final</div>
            <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Faço esse depois, vou pro próximo</div>
          </div>
        </button>
        <button onClick={onSubstitute} className="w-full p-4 text-left transition-all active:scale-[0.98] flex items-center gap-3" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.radiusLg, minHeight: 44 }}>
          <div style={{ color: C.info }}><Shuffle size={24} /></div>
          <div>
            <div className="text-sm font-medium" style={{ color: C.text }}>Substituir por outro</div>
            <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Troco por exercício similar</div>
          </div>
        </button>
      </div>
    </Sheet>
  );
};
