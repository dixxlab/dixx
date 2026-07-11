import { AlertTriangle } from 'lucide-react';
import { Sheet } from './Sheet';
import { T as C } from '../../theme/tokens';

// Substitui confirm()/alert() nativos do browser por um bottom sheet no tema do app.
export const ConfirmSheet = ({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onClose }) => {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-start gap-3 mb-4">
        {danger && (
          <div className="flex-shrink-0 mt-0.5" style={{ color: C.danger }}>
            <AlertTriangle size={20} />
          </div>
        )}
        <div>
          <h2 className="text-lg font-medium" style={{ color: C.text }}>{title}</h2>
          {message && <p className="text-sm mt-1" style={{ color: C.textMuted }}>{message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        {onConfirm && (
          <button onClick={onClose} className="flex-1 p-4 rounded-2xl font-medium transition-all active:scale-95" style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, minHeight: 44 }}>
            {cancelLabel}
          </button>
        )}
        <button
          onClick={() => { if (onConfirm) onConfirm(); onClose(); }}
          className="flex-1 p-4 rounded-2xl font-medium transition-all active:scale-95"
          style={{ background: danger ? C.danger : C.primary, color: danger ? '#fff' : C.primaryOn, minHeight: 44 }}
        >
          {onConfirm ? confirmLabel : 'Entendi'}
        </button>
      </div>
    </Sheet>
  );
};
