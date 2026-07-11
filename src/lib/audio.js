let audioCtx = null;

export const initAudio = () => {
  if (!audioCtx) {
    try { const AC = window.AudioContext || window.webkitAudioContext; audioCtx = new AC(); } catch { /* AudioContext indisponível neste navegador */ }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
};

export const playBeep = (frequency = 800, duration = 150) => {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration / 1000);
  } catch { /* beep é best-effort, falha silenciosa não deve travar o timer */ }
};
