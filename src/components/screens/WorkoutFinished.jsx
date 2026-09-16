import { useEffect, useState } from 'react';
import { motion, useReducedMotion, animate } from 'framer-motion';
import { Dumbbell, TrendingUp, ChevronsUp, ArrowRight, Sparkles } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { DixxMark } from '../ui/Splash';
import { ListRow } from '../ui/ListRow';

const ptbr = (n, casas = 0) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/* Contagem progressiva. O valor exibido vem de estado do React em vez de um
   MotionValue renderizado direto: nesta versão do Motion o MotionValue como
   filho não re-renderiza, e o número ficava preso em zero. O onUpdate é
   callback de subscrição, não setState síncrono dentro do efeito.

   Com movimento reduzido o valor já nasce final — sem número correndo. */
const Contador = ({ value, casas = 0, delay = 0 }) => {
  const reduce = useReducedMotion();
  const [mostrado, setMostrado] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return undefined;
    const controls = animate(0, value, {
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setMostrado(v),
      onComplete: () => setMostrado(value),
    });
    // Rede de segurança: se o ambiente suprimir a animação, um número zerado na
    // tela de conclusão seria pior que não animar.
    const garantia = setTimeout(() => setMostrado(value), (delay + 0.8) * 1000 + 150);
    return () => { controls.stop(); clearTimeout(garantia); };
  }, [value, delay, reduce]);

  return <span>{ptbr(mostrado, casas)}</span>;
};

const Metrica = ({ value, unit, label, casas = 0, delay = 0 }) => (
  <div>
    <div className="flex items-baseline gap-1 tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 34, lineHeight: 1, color: C.text }}>
      <Contador value={value} casas={casas} delay={delay} />
      {unit && <span style={{ fontSize: 17, color: C.textMuted }}>{unit}</span>}
    </div>
    <div className="text-[11px] mt-1.5" style={{ color: C.textMuted }}>{label}</div>
  </div>
);

const Cartao = ({ children, destaque }) => (
  <div
    className="px-4 py-3.5"
    style={{
      background: destaque ? C.primarySoft : C.bgCard,
      border: `1px solid ${destaque ? C.primary : C.border}`,
      borderRadius: C.radiusMd,
    }}
  >
    {children}
  </div>
);

export const WorkoutFinished = ({ summary, onClose, onSeeStats }) => {
  const reduce = useReducedMotion();
  const {
    workoutName, completedExercises, completedSets, totalReps, minutes,
    volumeTonnes, highlight, exercises = [], comparison, isFirstOfPlan,
    records = [], weekCount,
  } = summary;

  const temVolume = volumeTonnes > 0;
  const temRecorde = records.length > 0;

  const auxiliar = temRecorde
    ? 'Recorde superado. O próximo já está te esperando.'
    : comparison
      ? 'Hoje você foi além do último treino.'
      : 'Treino feito. Consistência em construção.';

  // Entrada em cascata curta; com movimento reduzido tudo já nasce no lugar.
  const entra = (delay) => (reduce ? {} : {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: C.bg }}>
      <div
        className="flex-1 overflow-y-auto px-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)', paddingBottom: 16 }}
      >
        <motion.div className="flex items-center justify-between mb-7" {...entra(0)}>
          <span style={{ filter: reduce ? 'none' : 'drop-shadow(0 0 12px rgba(69, 193, 255, 0.45))' }}>
            <DixxMark size={34} />
          </span>
          {weekCount > 1 && (
            <span className="text-[11px] px-2.5 py-1" style={{ background: C.bgCard, color: C.textMuted, borderRadius: 999 }}>
              {weekCount}º treino da semana
            </span>
          )}
        </motion.div>

        <motion.div {...entra(0.06)}>
          <div className="text-xs mb-1" style={{ color: C.primary }}>{workoutName} concluído</div>
          <h1 style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 40, lineHeight: 1.03, letterSpacing: '-0.01em', textTransform: 'uppercase', color: C.text }}>
            Você apareceu.<br />Isso conta.
          </h1>
          <p className="text-sm mt-2.5" style={{ color: C.textMuted }}>{auxiliar}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-y-6 gap-x-4 mt-7 px-4 py-5"
          style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: C.radiusLg }}
          {...entra(0.14)}
        >
          <Metrica value={completedExercises} label="exercícios" delay={0.2} />
          <Metrica value={completedSets} label="séries" delay={0.26} />
          <Metrica value={totalReps} label="repetições" delay={0.32} />
          <Metrica value={minutes} unit="min" label="duração" delay={0.38} />
        </motion.div>

        {temVolume && (
          <motion.div className="mt-3" {...entra(0.2)}>
            <Cartao destaque>
              <div className="flex items-baseline gap-1.5 tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 30, lineHeight: 1, color: C.primary }}>
                <Contador value={volumeTonnes} casas={1} delay={0.44} />
                <span style={{ fontSize: 17 }}>t</span>
                <span className="text-sm font-normal" style={{ fontFamily: C.fontUi, color: C.textMuted, marginLeft: 4 }}>movimentadas</span>
              </div>
            </Cartao>
          </motion.div>
        )}

        {highlight && (
          <motion.div className="mt-3" {...entra(0.26)}>
            <Cartao>
              <div className="text-[11px] mb-1.5" style={{ color: C.textMuted }}>Destaque de hoje</div>
              <div className="flex items-center gap-2.5">
                <Dumbbell size={16} style={{ color: C.primary, flexShrink: 0 }} aria-label="Destaque do treino" />
                <span className="text-sm truncate" style={{ color: C.text }}>{highlight.name}</span>
                <span className="ml-auto tabular-nums flex items-baseline gap-1" style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 21, color: C.text }}>
                  {highlight.tipo === 'reps' ? highlight.valor : ptbr(highlight.valor)}
                  {highlight.unidade && <span style={{ fontSize: 12, color: C.textMuted }}>{highlight.unidade}</span>}
                </span>
              </div>
            </Cartao>
          </motion.div>
        )}

        {comparison ? (
          <motion.div className="mt-3" {...entra(0.32)}>
            <Cartao>
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingUp size={15} style={{ color: C.success }} aria-label="Ganho em relação ao treino anterior" />
                <span className="text-[11px]" style={{ color: C.textMuted }}>Contra o último {workoutName}</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {comparison.ganhos.map((g) => (
                  <span key={g.chave} className="flex items-baseline gap-1 tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 600, fontSize: 20, color: C.success }}>
                    +{ptbr(g.valor)}
                    <span className="text-xs font-normal" style={{ fontFamily: C.fontUi, color: C.textMuted }}>{g.unidade}</span>
                  </span>
                ))}
              </div>
            </Cartao>
          </motion.div>
        ) : isFirstOfPlan && (
          <motion.div className="mt-3" {...entra(0.32)}>
            <Cartao>
              <div className="flex items-start gap-2.5">
                <Sparkles size={15} style={{ color: C.primary, flexShrink: 0, marginTop: 2 }} aria-label="Primeiro marco" />
                <span className="text-sm" style={{ color: C.textMuted }}>
                  Primeiro treino registrado. Daqui para frente, sua evolução começa a ganhar forma.
                </span>
              </div>
            </Cartao>
          </motion.div>
        )}

        {temRecorde && (
          <motion.div
            className="mt-3"
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : {
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: [
                '0 0 0px rgba(69, 193, 255, 0)',
                '0 0 26px rgba(69, 193, 255, 0.4)',
                '0 0 10px rgba(69, 193, 255, 0.14)',
              ],
            }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderRadius: C.radiusMd }}
          >
            <Cartao destaque>
              <div className="flex items-center gap-2.5">
                <ChevronsUp size={17} style={{ color: C.primary, flexShrink: 0 }} aria-label="Recorde pessoal" />
                <span className="text-sm font-medium" style={{ color: C.text }}>
                  {records.length === 1 ? `Novo recorde em ${records[0].name}` : `${records.length} novos recordes pessoais`}
                </span>
              </div>
            </Cartao>
          </motion.div>
        )}

        {exercises.length > 0 && (
          <motion.div className="mt-7" {...entra(0.46)}>
            <h2 className="text-[15px] font-medium mb-1" style={{ color: C.text }}>Exercícios</h2>
            {exercises.map((ex) => (
              <ListRow
                key={ex.name}
                title={ex.name}
                subtitle={`${ex.sets} ${ex.sets === 1 ? 'série' : 'séries'}${ex.volume > 0 ? ` · ${ptbr(ex.volume)} kg` : ''}`}
                trailing={ex.isPR ? (
                  <span className="text-[10px] px-2 py-0.5 flex items-center gap-1" style={{ background: C.primarySoft, color: C.primary, borderRadius: 999 }}>
                    <ChevronsUp size={11} aria-hidden="true" /> recorde
                  </span>
                ) : null}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Rodapé fora da rolagem: as ações continuam ao alcance do polegar em
          telas baixas, por mais longo que fique o resumo. */}
      <div
        className="px-5 pt-3"
        style={{ background: C.bg, borderTop: `1px solid ${C.border}`, paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
      >
        <button
          onClick={onSeeStats}
          className="w-full p-4 font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusMd, minHeight: 44 }}
        >
          Ver evolução <ArrowRight size={17} />
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 mt-1 text-sm transition-opacity active:opacity-60"
          style={{ color: C.textMuted, minHeight: 44 }}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
};
