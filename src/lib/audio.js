let audioCtx = null;

export const initAudio = () => {
  if (!audioCtx) {
    try { const AC = window.AudioContext || window.webkitAudioContext; audioCtx = new AC(); } catch { /* AudioContext indisponível neste navegador */ }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
};

/* A rampa de entrada de 8ms não é enfeite: saltar direto pro volume alvo é uma
   descontinuidade na onda, e o alto-falante responde com um clique seco antes
   do tom. Subindo em 8ms o clique some sem que o bipe soe lento. */
export const playBeep = (frequency = 800, duration = 150) => {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = frequency;
    // currentTime é lido uma vez: entre as chamadas ele anda, e agendar cada
    // etapa contra um instante diferente desalinharia a rampa.
    const now = audioCtx.currentTime;
    // 0.0001 em vez de 0: rampa exponencial não parte de zero absoluto.
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
    osc.start(now);
    osc.stop(now + duration / 1000);
  } catch { /* beep é best-effort, falha silenciosa não deve travar o timer */ }
};

// Dois tons em sequência rápida — soa como "pronto!", não como um bipe único.
export const playDoneChime = () => {
  playBeep(880, 130);
  setTimeout(() => playBeep(1320, 260), 110);
};
