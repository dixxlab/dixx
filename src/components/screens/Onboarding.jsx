import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { FigGlyph } from '../ui/Figures';

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', experience: '', division: '' });
  const steps = [
    {
      title: 'Como te chamam?',
      subtitle: 'Três perguntas e seu primeiro treino já sai montado.',
      field: 'name', type: 'input', fig: 'rosca',
    },
    {
      title: 'Há quanto tempo treina?',
      subtitle: `Prazer, ${data.name || 'parceiro'}. Isso define a carga que o app sugere no começo.`,
      field: 'experience', label: 'Experiência', type: 'select', fig: 'agacha',
      options: ['Iniciante', 'Intermediário', 'Avançado'],
    },
    {
      title: 'Quantos dias por semana?',
      subtitle: 'Dá pra mudar depois, no perfil.',
      field: 'division', label: 'Divisão', type: 'select', fig: 'supino',
      options: ['ABCD (4x semana)', 'ABCDE (5x semana)', 'AB (2x semana)'],
    },
  ];
  const current = steps[step];
  const canProceed = data[current.field] !== '';

  return (
    <div className="flex flex-col h-full py-8 overflow-hidden" style={{ background: C.bg }}>
      {/* O contador na condensada e o stick figure do passo substituem o logo
          solto com dots neutros — o app passa a se apresentar com a própria cara. */}
      <div className="px-6 flex items-center gap-3 mb-8">
        <span className="tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 17, color: C.primary }}>
          {String(step + 1).padStart(2, '0')}
        </span>
        <div className="flex gap-1.5 flex-1">
          {steps.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-500" style={{ background: i <= step ? C.primary : C.border }} />
          ))}
        </div>
        <span className="tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 17, color: C.textMuted }}>
          {String(steps.length).padStart(2, '0')}
        </span>
      </div>

      <motion.div
        key={step}
        className="flex-1 flex flex-col relative"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="absolute pointer-events-none" style={{ right: -22, top: -6 }} aria-hidden="true">
          <FigGlyph figKey={current.fig} size={160} opacity={0.12} />
        </div>
        <div className="relative px-6">
          <div>
            <h1 style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 36, lineHeight: 1.04, letterSpacing: '-0.01em', textTransform: 'uppercase', color: C.text, maxWidth: 250 }}>
              {current.title}
            </h1>
            <p className="text-sm mt-2 mb-8" style={{ color: C.textMuted, maxWidth: 260 }}>{current.subtitle}</p>
          </div>
        </div>

        <div className="relative px-6 mt-8">
          {current.label && <label className="text-xs mb-2 block" style={{ color: C.textMuted }}>{current.label}</label>}
          {current.type === 'input' && (
            <input type="text" value={data[current.field]} onChange={(e) => setData({ ...data, [current.field]: e.target.value })} placeholder="Seu nome"
              className="w-full p-4 outline-none transition-all"
              style={{ background: C.bgCard, border: `1px solid ${data[current.field] ? C.primary : C.border}`, color: C.text, borderRadius: C.radiusLg }} autoFocus />
          )}
          {current.type === 'select' && (
            <div className="space-y-2">
              {current.options.map((opt) => (
                <button key={opt} onClick={() => setData({ ...data, [current.field]: opt })}
                  className="w-full p-4 text-left transition-all duration-200 active:scale-[0.98]"
                  style={{ background: data[current.field] === opt ? C.primary : C.bgCard, color: data[current.field] === opt ? C.primaryOn : C.text, border: `1px solid ${data[current.field] === opt ? C.primary : C.border}`, fontWeight: data[current.field] === opt ? 500 : 400, borderRadius: C.radiusLg, minHeight: 44 }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="px-6">
        <button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else onComplete(data); }} disabled={!canProceed}
          className="w-full p-4 font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          style={{ background: canProceed ? C.primary : C.bgCard, color: canProceed ? C.primaryOn : C.textMuted, opacity: canProceed ? 1 : 0.5, borderRadius: C.radiusLg, minHeight: 44 }}>
          {step < steps.length - 1 ? 'Continuar' : 'Montar meu treino'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
