import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { SectionTitle } from '../ui/SectionTitle';
import { StatRow } from '../ui/Stat';
import { ExerciseCard } from '../ui/Figures';
import { ExerciseSearchList } from './ExerciseSearchList';
import { exerciseLibrary } from '../../lib/exercises';

export const Library = ({ onClose }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (selectedExercise) {
    return (
      <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setSelectedExercise(null)} className="p-2 -ml-2 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Voltar">
            <ArrowLeft size={20} color={C.text} />
          </button>
          <h1 className="text-lg font-medium" style={{ color: C.text }}>{selectedExercise.name}</h1>
        </div>

        {/* O stick figure animado é o herói desta tela — já se distingue por moldura
            e escala próprias, então tudo abaixo dele fica plano. Sem o selo LIVE:
            aqui não tem nada acontecendo ao vivo. */}
        <div className="mb-5"><ExerciseCard figKey={selectedExercise.fig} size={120} /></div>

        <div className="pb-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="text-sm" style={{ color: C.primary }}>{selectedExercise.muscle}</div>
          <div className="text-xs mb-4" style={{ color: C.textMuted }}>{selectedExercise.equipment}</div>
          <StatRow
            gap={28}
            items={[
              { value: selectedExercise.defaultSets, label: 'séries' },
              { value: selectedExercise.defaultReps, label: 'repetições' },
            ]}
          />
        </div>

        <SectionTitle className="mt-6 mb-2">Como executar</SectionTitle>
        <p className="text-sm leading-relaxed" style={{ color: C.text }}>{selectedExercise.description}</p>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-28 flex flex-col" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="px-5">
        <div className="flex items-center gap-3 mb-1">
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
