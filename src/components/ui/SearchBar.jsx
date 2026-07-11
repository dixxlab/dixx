import { Search } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { muscleGroups } from '../../lib/exercises';

export const SearchBar = ({ search, onSearchChange, filter, onFilterChange, placeholder = 'Buscar exercício...', autoFocus = false }) => (
  <>
    <div className="relative mb-3">
      <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-3 outline-none text-sm"
        style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, borderRadius: C.radiusLg }}
      />
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {muscleGroups.map((g) => (
        <button
          key={g}
          onClick={() => onFilterChange(g)}
          className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95"
          style={{ background: filter === g ? C.primary : C.bgCard, color: filter === g ? C.primaryOn : C.textMuted, minHeight: 36 }}
        >
          {g}
        </button>
      ))}
    </div>
  </>
);
