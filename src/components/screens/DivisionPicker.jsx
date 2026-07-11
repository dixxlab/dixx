import { X, Check } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { Sheet } from '../ui/Sheet';
import { useConfirm } from '../ui/ConfirmProvider';

const options = [
  { count: 2, label: 'AB', desc: '2 dias por semana' },
  { count: 3, label: 'ABC', desc: '3 dias por semana' },
  { count: 4, label: 'ABCD', desc: '4 dias por semana' },
  { count: 5, label: 'ABCDE', desc: '5 dias por semana' },
];

export const DivisionPicker = ({ open, currentValue, onSave, onClose }) => {
  const { confirm } = useConfirm();

  const handleSelect = async (count) => {
    if (count < currentValue) {
      const willDelete = currentValue - count;
      const ok = await confirm({
        title: 'Reduzir divisão?',
        message: `Vai apagar ${willDelete} treino(s) extras e suas customizações.`,
        confirmLabel: 'Reduzir',
        danger: true,
      });
      if (!ok) return;
    }
    onSave(count);
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium" style={{ color: C.text }}>Divisão de treinos</h2>
        <button onClick={onClose} className="p-1 transition-all active:scale-95" style={{ minWidth: 44, minHeight: 44 }} aria-label="Fechar"><X size={20} color={C.textMuted} /></button>
      </div>
      <p className="text-xs mb-4" style={{ color: C.textMuted }}>Escolha quantos treinos diferentes você quer fazer na semana.</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <button key={opt.count} onClick={() => handleSelect(opt.count)}
            className="w-full p-4 text-left transition-all active:scale-[0.98] flex justify-between items-center"
            style={{ background: currentValue === opt.count ? C.primary : C.bg, color: currentValue === opt.count ? C.primaryOn : C.text, border: `1px solid ${currentValue === opt.count ? C.primary : C.border}`, borderRadius: C.radiusLg, minHeight: 44 }}>
            <div>
              <div className="text-base font-medium">{opt.label}</div>
              <div className="text-xs mt-0.5" style={{ color: currentValue === opt.count ? C.primaryOn : C.textMuted, opacity: currentValue === opt.count ? 0.7 : 1 }}>{opt.desc}</div>
            </div>
            {currentValue === opt.count && <Check size={18} />}
          </button>
        ))}
      </div>
    </Sheet>
  );
};
