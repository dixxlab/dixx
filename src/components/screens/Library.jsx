import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { ExerciseCard } from '../ui/Figures';
import { ExerciseSearchList } from './ExerciseSearchList';
import { exerciseLibrary } from '../../lib/exercises';

export const Library = ({ onClose }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (selectedExercise) {
    return (
      <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedExercise(null)} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Voltar">
            <ArrowLeft size={20} color={C.text} />
          </button>
          <h1 className="text-lg font-medium" style={{ color: C.text }}>{selectedExercise.name}</h1>
        </div>
        <div className="mb-5"><ExerciseCard figKey={selectedExercise.fig} size={120} /></div>
        <div className="rounded-2xl p-4 mb-4" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Músculo</div>
              <div className="text-sm font-medium" style={{ color: C.primary }}>{selectedExercise.muscle}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Equipamento</div>
              <div className="text-sm" style={{ color: C.text }}>{selectedExercise.equipment}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Séries</div>
              <div className="text-sm" style={{ color: C.text }}>{selectedExercise.defaultSets}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Repetições</div>
              <div className="text-sm" style={{ color: C.text }}>{selectedExercise.defaultReps}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Como executar</div>
          <div className="text-sm leading-relaxed" style={{ color: C.text }}>{selectedExercise.description}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-28 flex flex-col" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar">
            <ArrowLeft size={20} color={C.text} />
          </button>
          <h1 className="text-2xl font-medium" style={{ color: C.text }}>Biblioteca</h1>
        </div>
        <p className="text-sm mb-4" style={{ color: C.textMuted }}>{exerciseLibrary.length} exercícios disponíveis</p>
      </div>
      <ExerciseSearchList
        onPick={setSelectedExercise}
        renderTrailing={() => <ChevronRight size={16} style={{ color: C.textMuted }} />}
      />
    </div>
  );
};
