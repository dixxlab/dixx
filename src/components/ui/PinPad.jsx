import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { T as C } from '../../theme/tokens';

export const PIN_LENGTH = 4;

/* Três intensidades de tremor, uma por faixa de erros seguidos. As durações
   ficam expostas em DURACAO_TREMOR porque quem chama precisa limpar o estado
   no instante em que o tremor acaba — um tempo fixo pra todas erraria o alvo
   nas duas mais longas, cortando a animação no meio ou deixando as bolinhas
   cheias depois que ela já terminou. */
const TREMORES = {
  1: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1], x: [0, -10, 9, -6, 4, 0], rotate: [0, 0, 0, 0, 0, 0] },
  2: { duration: 0.5, times: [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1], x: [0, -16, 14, -11, 8, -3, 0], rotate: [0, -2, 2, -1.5, 1, 0, 0] },
  3: { duration: 0.6, times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1], x: [0, -22, 20, -17, 14, -9, 5, 0], rotate: [0, -4, 4, -3, 2, -1, 0, 0] },
};

export const DURACAO_TREMOR = { 1: 400, 2: 500, 3: 600 };

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const Tecla = ({ children, onClick, estilo }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center transition-transform active:scale-90"
    style={{
      aspectRatio: '1',
      borderRadius: '50%',
      border: `1px solid ${C.border}`,
      background: `linear-gradient(180deg, ${C.bgCard}, ${C.bg})`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), ${C.shadowMd}`,
      color: C.text,
      fontFamily: C.fontData,
      fontWeight: 700,
      fontSize: 28,
      ...estilo,
    }}
  >
    {children}
  </button>
);

const ESTILO_APAGAR = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  color: C.textMuted,
  fontFamily: C.fontUi,
  fontWeight: 500,
  fontSize: 15,
};

/* Teclado numérico + as quatro bolinhas, com os dígitos digitados por conta
   própria: quem usa só precisa reagir ao PIN pronto, em `onComplete`.

   Pra zerar os dígitos depois de um erro, quem usa muda a `key` deste
   componente. Remontar é o jeito idiomático de reiniciar estado no React; um
   prop "limpar" observado por efeito faria o mesmo com um render a mais e um
   ciclo de vida paralelo pra manter em dia. */
export const PinPad = ({ onComplete, tremor, sucesso = false, bloqueado = false, tecladoFisico = true }) => {
  const reduce = useReducedMotion();
  const [valor, setValor] = useState('');
  // O buffer espelhado em ref evita depender do estado dentro do handler: duas
  // teclas no mesmo quadro leriam o mesmo valor antigo e a segunda se perderia.
  const valorRef = useRef('');
  const completeRef = useRef(onComplete);
  const timerRef = useRef(null);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const digitar = (k) => {
    if (bloqueado || valorRef.current.length >= PIN_LENGTH) return;
    const novo = valorRef.current + k;
    valorRef.current = novo;
    setValor(novo);
    // O respiro de 150ms existe pra quarta bolinha aparecer preenchida antes do
    // veredito; sem ele o tremor começa antes de a tecla dar sinal de vida.
    if (novo.length === PIN_LENGTH) {
      timerRef.current = setTimeout(() => completeRef.current(novo), 150);
    }
  };

  const apagar = () => {
    if (bloqueado) return;
    valorRef.current = valorRef.current.slice(0, -1);
    setValor(valorRef.current);
  };

  // Os handlers mudam de identidade a cada render; a ref evita reassinar o
  // listener do teclado a cada tecla digitada.
  const acaoRef = useRef(null);
  useEffect(() => { acaoRef.current = { digitar, apagar }; });
  useEffect(() => {
    if (!tecladoFisico) return undefined;
    const aoTeclar = (e) => {
      if (e.key >= '0' && e.key <= '9') acaoRef.current?.digitar(e.key);
      if (e.key === 'Backspace') acaoRef.current?.apagar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [tecladoFisico]);

  const cor = sucesso ? C.success : C.primary;

  /* O tremor é disparado por controle imperativo, e não por um `animate` que
     muda de valor nem por remontagem via key.

     O equivalente do `void offsetWidth` da demo não existe aqui: dois erros
     seguidos no mesmo nível produzem keyframes idênticos, e o Framer compara
     por valor — o segundo tremor simplesmente não rodaria. Remontar por key
     também não serve, e é pior porque parece certo: um motion recém-montado
     sem `initial` assume o estado final de cara, sem animar, então o tremor
     sumia inteiro em vez de só não repetir. `start()` reinicia sempre. */
  const controles = useAnimationControls();
  useEffect(() => {
    if (!tremor || reduce) return;
    const t = TREMORES[tremor.nivel];
    controles.start({ x: t.x, rotate: t.rotate }, { duration: t.duration, times: t.times });
  }, [tremor, reduce, controles]);

  return (
    <>
      <motion.div
        className="flex justify-center"
        style={{ gap: 17 }}
        animate={controles}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => {
          const cheia = i < valor.length;
          return (
            <span
              key={i}
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                border: `2px solid ${cheia ? cor : C.border}`,
                background: cheia ? cor : 'transparent',
                boxShadow: cheia ? `0 0 12px ${cor}` : 'none',
                transition: 'background 0.15s, border-color 0.15s, box-shadow 0.2s',
              }}
            />
          );
        })}
      </motion.div>

      <div className="grid grid-cols-3 w-full" style={{ gap: 16, maxWidth: 260 }}>
        {TECLAS.map((n) => <Tecla key={n} onClick={() => digitar(n)}>{n}</Tecla>)}
        <span aria-hidden="true" />
        <Tecla onClick={() => digitar('0')}>0</Tecla>
        <Tecla onClick={apagar} estilo={ESTILO_APAGAR}>apagar</Tecla>
      </div>
    </>
  );
};
