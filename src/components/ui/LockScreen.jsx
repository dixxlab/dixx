import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { DixxMark } from './Splash';
import { PinPad, DURACAO_TREMOR } from './PinPad';
import { APP_PASSWORD, unlock } from '../../lib/access';

const PADRAO = { titulo: 'Opa, opa, opa', sub: 'Digite a senha pra continuar, bobão 👀', tom: 'normal' };

// A zoação escala com os erros seguidos e trava na última — errar a décima vez
// não precisa de frase nova, precisa que a última continue doendo.
const ZOACOES = [
  ['Errou, trouxa', 'Tenta de novo, gênio'],
  ['Ihh, de novo?', 'Vergonha alheia rolando aqui'],
  ['Affs', 'Não é dia do seu aniversário não'],
  ['Kkkkkkk que isso', 'Desiste, vai'],
  ['Só rindo da sua cara agora', 'Fica tentando, eu tenho o dia todo'],
];

const REVERTER_MS = 2600;

/* Trava da entrada. Cobre a tela inteira por cima de tudo, então o conteúdo
   real nunca aparece antes do PIN conferir.

   `aparecer` segura a entrada encenada enquanto a abertura ainda está por cima:
   o fundo já é opaco desde o primeiro quadro (é ele que esconde o app), só os
   elementos é que esperam a vez de surgir. */
export const LockScreen = ({ aparecer = true, onUnlock }) => {
  const reduce = useReducedMotion();
  const [texto, setTexto] = useState(PADRAO);
  const [tremor, setTremor] = useState(null);
  const [limpar, setLimpar] = useState(0);
  const [etapa, setEtapa] = useState('travado');

  const tentativasRef = useRef(0);
  const tremorIdRef = useRef(0);
  const reverterRef = useRef(null);
  const limparRef = useRef(null);
  const sequenciaRef = useRef([]);
  const unlockRef = useRef(onUnlock);
  useEffect(() => { unlockRef.current = onUnlock; });

  useEffect(() => () => {
    clearTimeout(reverterRef.current);
    clearTimeout(limparRef.current);
    sequenciaRef.current.forEach(clearTimeout);
  }, []);

  const errou = () => {
    /* Os dois timers da tentativa anterior morrem aqui, antes de qualquer
       coisa. Sem cancelar o de reverter, o relógio de 2,6s do erro anterior
       ainda estaria correndo e apagaria a frase nova no meio — a zoação
       escalaria na lógica e não na tela. */
    clearTimeout(reverterRef.current);
    clearTimeout(limparRef.current);

    const [titulo, sub] = ZOACOES[Math.min(tentativasRef.current, ZOACOES.length - 1)];
    tentativasRef.current += 1;
    const nivel = tentativasRef.current >= 5 ? 3 : tentativasRef.current >= 3 ? 2 : 1;

    setTexto({ titulo, sub, tom: 'errado' });
    tremorIdRef.current += 1;
    setTremor({ nivel, id: tremorIdRef.current });

    // Casado com a duração real deste nível: limpar antes cortaria o tremor no
    // meio, limpar depois deixaria as bolinhas cheias num campo já parado.
    limparRef.current = setTimeout(() => {
      setTremor(null);
      setLimpar((n) => n + 1);
    }, DURACAO_TREMOR[nivel]);

    reverterRef.current = setTimeout(() => setTexto(PADRAO), REVERTER_MS);
  };

  const acertou = () => {
    clearTimeout(reverterRef.current);
    clearTimeout(limparRef.current);
    setTremor(null);
    // Grava a senha que abriu, não um "sim": é o que deixa a troca da senha
    // no código expulsar este aparelho na próxima abertura.
    unlock();
    setEtapa('certo');
    setTexto((t) => ({ ...t, sub: 'Isso aí!', tom: 'bom' }));
    sequenciaRef.current = [
      setTimeout(() => setEtapa('desbloqueado'), 450),
      setTimeout(() => setEtapa('saindo'), 1400),
      // O app já está montado atrás; a saída só descobre ele.
      setTimeout(() => unlockRef.current(), 1850),
    ];
  };

  const conferir = (valor) => { if (valor === APP_PASSWORD) acertou(); else errou(); };

  const corDoTexto = texto.tom === 'errado' ? C.danger : texto.tom === 'bom' ? C.success : C.textMuted;
  // O acerto tem três momentos: as bolinhas ficam verdes ainda na camada do
  // teclado, só depois a camada da comemoração entra, e só então o conjunto
  // sai de cena. Um flag só pros três faria a comemoração aparecer junto com
  // as bolinhas verdes, atropelando o instante que dá sentido a elas.
  const mostraTeclado = etapa === 'travado' || etapa === 'certo';
  const mostraFestejo = etapa === 'desbloqueado' || etapa === 'saindo';
  const acertado = etapa !== 'travado';

  const entra = (delay) => (reduce
    ? { initial: false, animate: { opacity: aparecer ? 1 : 0 } }
    : {
      initial: { opacity: 0, y: 10 },
      animate: aparecer ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
      transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    });

  const trocaDeCamada = { duration: 0.45, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden" style={{ background: C.bg }}>
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: etapa === 'saindo' ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* As duas camadas ocupam o retângulo da tela, sem altura combinada:
            é o que impede o teclado de vazar por cima do texto quando o
            conteúdo cresce mais que um container de medida fixa. A camada
            travada rola por dentro se a tela for baixa demais pra ela. */}
        <motion.div
          className="absolute inset-0 overflow-y-auto"
          style={{ pointerEvents: mostraTeclado ? 'auto' : 'none' }}
          animate={mostraTeclado ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={trocaDeCamada}
        >
          {/* A folga é generosa de propósito e conta a área segura: a trava
              sangra até a borda física da tela, e sem isso o topo do conteúdo
              podia nascer debaixo do notch num aparelho recortado. */}
          <div
            className="min-h-full flex flex-col items-center justify-center px-6"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top) + 40px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)',
            }}
          >
            <motion.div className="flex items-center gap-2 mb-5" {...entra(0)}>
              <span style={{ filter: reduce ? 'none' : `drop-shadow(0 0 10px ${C.primary})`, lineHeight: 0 }}>
                <DixxMark size={20} />
              </span>
              <span style={{ fontFamily: C.fontData, fontWeight: 800, fontSize: 15, letterSpacing: '0.18em', color: C.text }}>
                DIXX
              </span>
            </motion.div>

            <motion.h1
              className="text-center mb-1"
              style={{ fontFamily: C.fontData, fontWeight: 800, fontSize: 27, lineHeight: 1.1, color: C.text }}
              {...entra(0.06)}
            >
              {texto.titulo}
            </motion.h1>

            {/* Altura reservada: a frase troca de tamanho a cada erro e sem isso
                as bolinhas e o teclado pulariam junto. */}
            <motion.p
              className="text-center text-sm mb-7 flex items-start justify-center"
              style={{ color: corDoTexto, minHeight: 34, transition: 'color 0.2s' }}
              {...entra(0.12)}
            >
              {texto.sub}
            </motion.p>

            <motion.div className="flex flex-col items-center w-full" style={{ gap: 36, maxWidth: 260 }} {...entra(0.18)}>
              <PinPad
                key={limpar}
                onComplete={conferir}
                tremor={tremor}
                sucesso={acertado}
                bloqueado={etapa !== 'travado'}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
          animate={mostraFestejo ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={trocaDeCamada}
        >
          <motion.div
            className="flex items-center justify-center mb-3"
            style={{ width: 62, height: 62, borderRadius: '50%', background: C.successSoft, boxShadow: `0 0 24px ${C.successSoft}` }}
            animate={mostraFestejo && !reduce ? { scale: [0.5, 1], opacity: [0, 1] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Check size={28} strokeWidth={2.5} style={{ color: C.success }} />
          </motion.div>
          <div style={{ fontFamily: C.fontData, fontWeight: 800, fontSize: 23, color: C.text }}>
            Ih, era o Alex mesmo
          </div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>Bora treinar, campeão</div>
        </motion.div>
      </motion.div>
    </div>
  );
};
