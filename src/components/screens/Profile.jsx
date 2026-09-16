import { useState } from 'react';
import { Clock, Dumbbell, Palette, Camera, ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Avatar } from '../ui/Avatar';
import { SettingRow } from '../ui/SettingRow';
import { SectionTitle } from '../ui/SectionTitle';
import { StatRow } from '../ui/Stat';
import { calculateStreak } from '../../lib/workouts';
import { exerciseLibrary } from '../../lib/exercises';
import { RestTimePicker } from './RestTimePicker';
import { DivisionPicker } from './DivisionPicker';
import { ThemePicker } from './ThemePicker';
import { useTheme } from '../../theme/ThemeContext';
import { useConfirm } from '../ui/ConfirmProvider';

export const Profile = ({ data, onReset, onExport, onChangePhoto, onChangeRestTime, onChangeDivision }) => {
  const [showRestPicker, setShowRestPicker] = useState(false);
  const [showDivisionPicker, setShowDivisionPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { themes, theme } = useTheme();
  const { confirm } = useConfirm();
  const streak = calculateStreak(data.history);
  const customCount = Object.keys(data.customWorkouts || {}).length;
  const restTime = data.restTime || 90;
  const divisionCount = data.divisionCount || 4;
  const divisionLabels = ['', '', 'AB', 'ABC', 'ABCD', 'ABCDE'];
  const currentThemeLabel = themes.find(t => t.id === theme)?.label || 'Meia-noite';

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Resetar todos os dados?',
      message: 'Vai apagar treinos, PRs, histórico e customizações. Essa ação não pode ser desfeita.',
      confirmLabel: 'Apagar tudo',
      danger: true,
    });
    if (ok) onReset();
  };

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <h1 className="text-2xl font-medium mb-5" style={{ color: C.text }}>Perfil</h1>

      {/* Mesma faixa sangrada do herói das outras telas: identidade + os dois
          números que resumem a conta, sem moldura de card. */}
      <section
        className="-mx-5 px-5 py-5"
        style={{ background: C.bgCard, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
            <Avatar name={data.user.name} photo={data.photo} size={64} onClick={onChangePhoto} />
            <div className="absolute bottom-0 right-0 rounded-full flex items-center justify-center" style={{ width: 24, height: 24, background: C.primary, border: `2px solid ${C.bgCard}` }}>
              <Camera size={12} color={C.primaryOn} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-lg font-medium truncate" style={{ color: C.text }}>{data.user.name}</div>
            <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{data.user.experience}</div>
          </div>
        </div>
        <StatRow
          gap={28}
          items={[
            { value: data.history.length, label: 'treinos totais' },
            { value: streak, label: 'streak atual' },
            { value: divisionLabels[divisionCount], label: 'divisão' },
          ]}
        />
      </section>

      <SectionTitle className="mt-7 mb-1">Configurações</SectionTitle>
      <div className="mb-6">
        <SettingRow icon={Clock} label="Tempo de descanso" value={`${restTime}s`} onClick={() => setShowRestPicker(true)} />
        <SettingRow icon={Dumbbell} label="Divisão" value={divisionLabels[divisionCount]} onClick={() => setShowDivisionPicker(true)} />
        <SettingRow icon={Palette} label="Tema" value={currentThemeLabel} onClick={() => setShowThemePicker(true)} />
      </div>

      <SectionTitle className="mb-1">Dados</SectionTitle>
      <div>
        <button onClick={onExport} className="w-full py-3.5 text-left transition-opacity active:opacity-60 flex justify-between items-center" style={{ borderBottom: `1px solid ${C.border}`, minHeight: 44 }}>
          <div>
            <div className="text-sm" style={{ color: C.text }}>Exportar dados</div>
            <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>backup JSON</div>
          </div>
          <ChevronRight size={14} style={{ color: C.textMuted }} />
        </button>
        <button onClick={handleReset} className="w-full py-3.5 text-left transition-opacity active:opacity-60" style={{ color: C.danger, borderBottom: `1px solid ${C.border}`, minHeight: 44 }}>
          <div className="text-sm">Apagar tudo e começar de novo</div>
        </button>
      </div>

      <div className="text-center mt-8 text-xs" style={{ color: C.textMuted }}>
        Dixx · v1.0 · {exerciseLibrary.length} exercícios · {customCount} treino{customCount !== 1 ? 's' : ''} custom
      </div>
      <RestTimePicker open={showRestPicker} currentValue={restTime} onSave={(v) => { onChangeRestTime(v); setShowRestPicker(false); }} onClose={() => setShowRestPicker(false)} />
      <DivisionPicker open={showDivisionPicker} currentValue={divisionCount} onSave={(v) => { onChangeDivision(v); setShowDivisionPicker(false); }} onClose={() => setShowDivisionPicker(false)} />
      <ThemePicker open={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </div>
  );
};
