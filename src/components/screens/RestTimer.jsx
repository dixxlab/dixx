import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { playBeep } from '../../lib/audio';
import { ExerciseThumb } from '../ui/ExerciseThumb';

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

export const RestTimer = ({ restTime, figKey, gifUrl, onSkip, onDone }) => {
  /* O relógio é um instante de término, não um contador decrescente. Navegador
     em segundo plano throttlea (ou congela) setTimeout, então contar pra baixo
     dessincroniza — era por isso que o descanso "quebrava" ao sair e voltar.
     Guardando o fim, recalcular vira uma subtração contra o relógio real, e o
     tempo fora do app não importa mais. */
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
    if (seconds > 0 && seconds <= 3) playBeep(800, 120);
    if (seconds === 0 && !firedRef.current) {
      firedRef.current = true;
      playBeep(1000, 400);
      try { navigator.vibrate?.([200, 100, 200]); } catch { /* sem vibração */ }
      // Só notifica com o app em segundo plano: com a tela à frente o beep já
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

  const progress = (Math.max(0, totalSec - seconds) / totalSec) * 283;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds <= 3 && seconds > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col px-5 pt-6 pb-6" style={{ background: C.bg, paddingTop: 'calc(env(safe-area-inset-top) + 24px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
      <div className="flex justify-between items-center mb-12">
        <div className="text-xs" style={{ color: C.textMuted }}>Descansando...</div>
        <div className="text-xs flex items-center gap-1" style={{ color: C.primary }}><Check size={12} /> Série concluída</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div className="relative w-64 h-64 mb-6" animate={urgent ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 1, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.bgCard} strokeWidth="4" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.primary} strokeWidth="4" strokeDasharray="283" strokeDashoffset={283 - progress} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.25s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Foto do exercício, não o desenho: a 72px o stick figure perdia a
                silhueta e virava forma abstrata. Ver DESIGN.md, seção 5. */}
            <div className="mb-2"><ExerciseThumb gifUrl={gifUrl} figKey={figKey} size={72} /></div>
            <div className="text-6xl font-medium tabular-nums" style={{ color: C.primary, fontFamily: C.fontData }}>{m}:{s.toString().padStart(2, '0')}</div>
            <div className="text-xs mt-1" style={{ color: C.textMuted }}>de {Math.floor(totalSec / 60)}:{(totalSec % 60).toString().padStart(2, '0')}</div>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={add30} className="p-4 font-medium transition-all active:scale-95" style={{ background: C.bgCard, color: C.text, borderRadius: C.radiusLg, minHeight: 44 }}>+30s</button>
        <button onClick={onSkip} className="p-4 font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.primaryOn, borderRadius: C.radiusLg, minHeight: 44 }}>Pular</button>
      </div>
    </div>
  );
};
