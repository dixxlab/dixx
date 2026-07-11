import { X, Plus } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { ExerciseSearchList } from './ExerciseSearchList';
import { FullScreenSheet } from '../ui/Sheet';

export const AddExerciseModal = ({ open, onAdd, onClose }) => (
  <FullScreenSheet open={open}>
    <div className="px-5 pt-6 flex items-center gap-3 mb-4">
      <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar">
        <X size={20} color={C.text} />
      </button>
      <h1 className="text-xl font-medium" style={{ color: C.text }}>Adicionar exercício</h1>
    </div>
    <ExerciseSearchList
      autoFocus
      onPick={onAdd}
      renderTrailing={() => <Plus size={18} style={{ color: C.primary }} />}
    />
  </FullScreenSheet>
);
