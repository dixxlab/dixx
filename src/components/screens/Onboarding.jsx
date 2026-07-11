import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { DixxLogo } from '../ui/Splash';

export const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', experience: '', division: '' });
  const steps = [
    { title: 'Bem-vindo ao Dixx', subtitle: 'Seu app de treino. Vamos te conhecer rapidinho.', field: 'name', label: 'Como você se chama?', type: 'input' },
    { title: `Prazer, ${data.name || 'parceiro'}!`, subtitle: 'Qual seu nível na academia?', field: 'experience', label: 'Experiência', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado'] },
    { title: 'Última coisa', subtitle: 'Como você quer dividir os treinos?', field: 'division', label: 'Divisão', type: 'select', options: ['ABCD (4x semana)', 'ABCDE (5x semana)', 'AB (2x semana)'] },
  ];
  const current = steps[step];
  const canProceed = data[current.field] !== '';

  return (
    <div className="flex flex-col h-full px-6 py-8" style={{ background: C.bg }}>
      <div className="flex gap-2 mb-12">
        {steps.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500" style={{ background: i <= step ? C.primary : C.bgCard }} />
        ))}
      </div>
      <div className="flex justify-center mb-8"><DixxLogo size={64} /></div>
      <motion.div
          key={step}
          className="flex-1"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
        >
          <h1 className="text-3xl font-medium mb-2 text-center" style={{ color: C.text }}>{current.title}</h1>
          <p className="text-sm text-center mb-10" style={{ color: C.textMuted }}>{current.subtitle}</p>
          <label className="text-xs uppercase tracking-wider mb-3 block" style={{ color: C.textMuted }}>{current.label}</label>
          {current.type === 'input' && (
            <input type="text" value={data[current.field]} onChange={(e) => setData({ ...data, [current.field]: e.target.value })} placeholder="Digite seu nome"
              className="w-full p-4 rounded-2xl outline-none transition-all"
              style={{ background: C.bgCard, border: `1px solid ${data[current.field] ? C.primary : C.border}`, color: C.text, borderRadius: C.radiusLg }} autoFocus />
          )}
          {current.type === 'select' && (
            <div className="space-y-2">
              {current.options.map((opt) => (
                <button key={opt} onClick={() => setData({ ...data, [current.field]: opt })}
                  className="w-full p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
                  style={{ background: data[current.field] === opt ? C.primary : C.bgCard, color: data[current.field] === opt ? C.primaryOn : C.text, border: `1px solid ${data[current.field] === opt ? C.primary : C.border}`, fontWeight: data[current.field] === opt ? 500 : 400, borderRadius: C.radiusLg, minHeight: 44 }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
      </motion.div>
      <button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else onComplete(data); }} disabled={!canProceed}
        className="w-full p-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
        style={{ background: canProceed ? C.primary : C.bgCard, color: canProceed ? C.primaryOn : C.textMuted, opacity: canProceed ? 1 : 0.5, borderRadius: C.radiusLg, minHeight: 44 }}>
        {step < steps.length - 1 ? 'Continuar' : 'Começar!'} <ChevronRight size={18} />
      </button>
    </div>
  );
};
