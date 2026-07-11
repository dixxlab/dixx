import { useState } from 'react';
import { Clock, Dumbbell, Palette, Camera, ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Avatar } from '../ui/Avatar';
import { SettingRow } from '../ui/SettingRow';
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
      <h1 className="text-2xl font-medium mb-6" style={{ color: C.text }}>Perfil</h1>
      <div className="p-5 mb-6 text-center" style={{ background: C.bgCard, borderRadius: C.radiusLg }}>
        <div className="mx-auto mb-3 relative" style={{ width: 80, height: 80 }}>
          <Avatar name={data.user.name} photo={data.photo} size={80} onClick={onChangePhoto} />
          <div className="absolute bottom-0 right-0 rounded-full flex items-center justify-center" style={{ width: 28, height: 28, background: C.primary, border: `2px solid ${C.bgCard}` }}>
            <Camera size={14} color={C.primaryOn} />
          </div>
        </div>
        <div className="text-lg font-medium" style={{ color: C.text }}>{data.user.name}</div>
        <div className="text-xs" style={{ color: C.textMuted }}>{data.user.experience} • {divisionLabels[divisionCount]}</div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <div>
            <div className="text-xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{data.history.length}</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>treinos totais</div>
          </div>
          <div>
            <div className="text-xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{streak}</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>streak atual</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Configurações</div>
      <div className="space-y-1 mb-6">
        <SettingRow icon={Clock} label="Tempo de descanso" value={`${restTime}s`} onClick={() => setShowRestPicker(true)} />
        <SettingRow icon={Dumbbell} label="Divisão" value={divisionLabels[divisionCount]} onClick={() => setShowDivisionPicker(true)} />
        <SettingRow icon={Palette} label="Tema" value={currentThemeLabel} onClick={() => setShowThemePicker(true)} />
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Dados</div>
      <div className="space-y-1">
        <button onClick={onExport} className="w-full p-4 text-left transition-all active:scale-[0.98] flex justify-between items-center" style={{ background: C.bgCard, borderRadius: C.radiusLg, minHeight: 44 }}>
          <div>
            <div className="text-sm font-medium" style={{ color: C.text }}>Exportar dados</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>backup JSON</div>
          </div>
          <ChevronRight size={16} style={{ color: C.textMuted }} />
        </button>
        <button onClick={handleReset} className="w-full p-4 text-left transition-all active:scale-[0.98]" style={{ background: C.bgCard, color: C.danger, borderRadius: C.radiusLg, minHeight: 44 }}>
          <div className="text-sm font-medium">Resetar dados (refazer onboarding)</div>
        </button>
      </div>
      <div className="text-center mt-8 text-[10px]" style={{ color: C.textMuted }}>Dixx · v1.0 · {exerciseLibrary.length} exercícios · {customCount} treino{customCount !== 1 ? 's' : ''} custom</div>
      <RestTimePicker open={showRestPicker} currentValue={restTime} onSave={(v) => { onChangeRestTime(v); setShowRestPicker(false); }} onClose={() => setShowRestPicker(false)} />
      <DivisionPicker open={showDivisionPicker} currentValue={divisionCount} onSave={(v) => { onChangeDivision(v); setShowDivisionPicker(false); }} onClose={() => setShowDivisionPicker(false)} />
      <ThemePicker open={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </div>
  );
};
