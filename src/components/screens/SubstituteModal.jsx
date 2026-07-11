import { X, Check } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { ExerciseSearchList } from './ExerciseSearchList';
import { FullScreenSheet } from '../ui/Sheet';

export const SubstituteModal = ({ open, currentMuscle, onSelect, onClose }) => (
  <FullScreenSheet open={open}>
    <div className="px-5 pt-6 flex items-center gap-3 mb-4">
      <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar">
        <X size={20} color={C.text} />
      </button>
      <div className="flex-1">
        <h1 className="text-xl font-medium" style={{ color: C.text }}>Substituir por...</h1>
        <p className="text-xs" style={{ color: C.textMuted }}>Sugestões de {currentMuscle || 'todos'} primeiro</p>
      </div>
    </div>
    <ExerciseSearchList
      autoFocus
      initialFilter={currentMuscle || 'Todos'}
      onPick={onSelect}
      renderTrailing={() => <Check size={16} style={{ color: C.primary }} />}
    />
  </FullScreenSheet>
);
