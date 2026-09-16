import { useState } from 'react';
import { Search } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { exerciseLibrary } from '../../lib/exercises';
import { SearchBar } from '../ui/SearchBar';
import { ListRow } from '../ui/ListRow';
import { FigGlyph } from '../ui/Figures';

// Lista com busca + filtro por grupo muscular, compartilhada por Library, AddExerciseModal e SubstituteModal —
// os 3 eram implementações quase idênticas copiadas antes do redesign. Redesenhar aqui alcança as três telas.
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
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        {filtered.length === 0 ? (
          <div className="py-10 text-center" style={{ color: C.textMuted }}>
            <div className="flex justify-center mb-3"><Search size={32} color={C.textMuted} /></div>
            <div className="text-sm">Nenhum exercício encontrado</div>
          </div>
        ) : filtered.map((ex) => (
          <ListRow
            key={ex.id}
            onClick={() => onPick(ex)}
            leading={<FigGlyph figKey={ex.fig} size={26} opacity={0.75} />}
            title={ex.name}
            subtitle={ex.muscle}
            trailing={
              <>
                <span className="text-xs" style={{ color: C.textMuted }}>{ex.equipment}</span>
                {renderTrailing ? renderTrailing(ex) : null}
              </>
            }
          />
        ))}
      </div>
    </>
  );
};
