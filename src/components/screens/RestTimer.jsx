import { useEffect, useRef, useState } from 'react';
import { T as C } from '../../theme/tokens';
import { playBeep, playDoneChime } from '../../lib/audio';

// Uma vez por sessão: pedir a cada série seria abusivo, e o navegador ignora
// de qualquer jeito depois da primeira resposta.
let permissionAsked = false;
const askNotificationPermission = () => {
  if (permissionAsked) return;
  permissionAsked = true;
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  } catch { /* navegador sem suporte a Notification */ }
};

const notifyRestOver = async () => {
  const body = 'Bora pra próxima série.';
  // Em PWA instalado no Android, o Chrome só aceita notificação vinda do service
  // worker; `new Notification` direto lança. Tenta o SW primeiro.
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      reg.showNotification('Descanso acabou', { body, icon: '/pwa-192x192.png', tag: 'dixx-rest' });
      return;
    }
  } catch { /* cai pro caminho direto abaixo */ }
  try {
    new Notification('Descanso acabou', { body, icon: '/pwa-192x192.png', tag: 'dixx-rest' });
  } catch { /* sem suporte; beep e vibração já cobrem */ }
};

const RING_R = 15;
const RING_C = 2 * Math.PI * RING_R;

/* O descanso é sempre uma pílula flutuante — não existe mais versão de tela
   cheia. Um cronômetro de 90s ocupando a tela inteira roubava o treino de
   quem só queria conferir o próximo peso, e a tela cheia não mostrava nada
   que a pílula não mostre. */
export const RestTimer = ({ restTime, onSkip, onDone }) => {
  /* O relógio é um instante de término, não um contador decrescente. Navegador
     em segundo plano throttlea (ou congela) setTimeout, então contar pra baixo
     dessincroniza. Guardando o fim, recalcular vira uma subtração contra o
     relógio real — e é isso que também deixa o timer sobreviver a navegar
     pelo app com ele rodando. */
  const [endAt, setEndAt] = useState(() => Date.now() + restTime * 1000);
  const [totalSec, setTotalSec] = useState(restTime);
  const [seconds, setSeconds] = useState(restTime);
  const onDoneRef = useRef(onDone);
  const firedRef = useRef(false);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => { askNotificationPermission(); }, []);

  // Recalcula continuamente e também no exato instante em que a tela volta a
  // ficar visível, que é quando o drift acumulado precisa ser corrigido.
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [endAt]);

  // Depende só de `seconds` (não de `onDone`, recriado a cada render do pai) —
  // evita repetir o beep se o App re-renderizar durante o descanso.
  useEffect(() => {
    // 3-2-1 sobe de tom: três bipes idênticos não avisam que a contagem está
    // acabando, a escada ascendente avisa sem precisar olhar pra tela.
    if (seconds > 0 && seconds <= 3) {
      const pitch = { 3: 700, 2: 800, 1: 950 }[seconds];
      playBeep(pitch, 120);
    }
    if (seconds === 0 && !firedRef.current) {
      firedRef.current = true;
      playDoneChime();
      try { navigator.vibrate?.([200, 100, 200]); } catch { /* sem vibração */ }
      // Só notifica com o app em segundo plano: com a tela à frente o som já
      // resolve e a notificação seria ruído.
      if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        notifyRestOver();
      }
      onDoneRef.current();
    }
  }, [seconds]);

  // O +30s empurra o fim e o total junto, senão o anel de progresso passa a
  // calcular contra um total que não existe mais.
  const add30 = () => { setEndAt(e => e + 30000); setTotalSec(t => t + 30); };

  const ringProgress = (Math.max(0, totalSec - seconds) / totalSec) * RING_C;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const tempo = `${m}:${s.toString().padStart(2, '0')}`;
  const urgent = seconds <= 3 && seconds > 0;

  return (
    <div
      className="fixed left-0 right-0 mx-auto px-5 z-40 flex justify-center pointer-events-none"
      style={{ maxWidth: '500px', bottom: 'calc(env(safe-area-inset-bottom) + 74px)' }}
    >
      <div
        className="flex items-center gap-1 pointer-events-auto"
        style={{ background: C.bgCard, border: `1px solid ${urgent ? C.primary : C.border}`, borderRadius: 999, boxShadow: C.shadowLg, paddingLeft: 6, paddingRight: 4 }}
      >
        <div className="flex items-center gap-2 pl-1 pr-2 py-2" style={{ minHeight: 44 }}>
          <div className="relative" style={{ width: 34, height: 34 }}>
            <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="17" cy="17" r={RING_R} fill="none" stroke={C.border} strokeWidth="3" />
              <circle
                cx="17" cy="17" r={RING_R} fill="none" stroke={C.primary} strokeWidth="3"
                strokeDasharray={RING_C} strokeDashoffset={RING_C - ringProgress} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.25s linear' }}
              />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="tabular-nums" style={{ fontFamily: C.fontData, fontWeight: 700, fontSize: 20, color: C.primary }}>{tempo}</span>
            <span className="text-[10px]" style={{ color: C.textMuted }}>descanso</span>
          </div>
        </div>
        <button
          onClick={add30}
          className="px-3 py-2 text-xs font-medium transition-opacity active:opacity-60"
          style={{ color: C.text, borderLeft: `1px solid ${C.border}`, minHeight: 44 }}
        >
          +30s
        </button>
        <button
          onClick={onSkip}
          className="px-3 py-2 text-xs font-medium transition-opacity active:opacity-60"
          style={{ color: C.primaryOn, background: C.primary, borderRadius: 999, minHeight: 44 }}
        >
          Pular
        </button>
      </div>
    </div>
  );
};
