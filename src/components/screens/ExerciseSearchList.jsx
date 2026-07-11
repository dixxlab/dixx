import { useState } from 'react';
import { Search } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { exerciseLibrary } from '../../lib/exercises';
import { SearchBar } from '../ui/SearchBar';

// Lista com busca + filtro por grupo muscular, compartilhada por Library, AddExerciseModal e SubstituteModal —
// os 3 eram implementações quase idênticas copiadas antes do redesign.
export const ExerciseSearchList = ({ initialFilter = 'Todos', onPick, renderTrailing, autoFocus = false }) => {
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  const filtered = exerciseLibrary.filter(ex => {
    const matchFilter = filter === 'Todos' || ex.muscle === filter;
    const matchSearch = search === '' || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <>
      <div className="px-5 mb-1">
        <SearchBar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} autoFocus={autoFocus} />
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: C.bgCard, color: C.textMuted, borderRadius: C.radiusLg }}>
              <div className="flex justify-center mb-2"><Search size={32} color={C.textMuted} /></div>
              <div className="text-sm">Nenhum exercício encontrado</div>
            </div>
          ) : filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onPick(ex)}
              className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98] flex justify-between items-center"
              style={{ background: C.bgCard, borderRadius: C.radiusLg, minHeight: 44 }}
            >
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: C.text }}>{ex.name}</div>
                <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{ex.muscle} • {ex.equipment}</div>
              </div>
              {renderTrailing ? renderTrailing(ex) : null}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
