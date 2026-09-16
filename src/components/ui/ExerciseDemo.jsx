import { useState } from 'react';
import { ChevronDown, ChevronUp, WifiOff } from 'lucide-react';
import { T as C } from '../../theme/tokens';
import { getDemoFrames } from '../../lib/demos';
import { MuscleMap } from './MuscleMap';

/* Os dois quadros só entram no DOM depois que o usuário abre a seção — é aí
   que a requisição acontece e que o service worker passa a cachear aquele
   exercício. Nada de demonstração é pré-carregado: quem só quer bater a série
   não paga nem um byte de rede, e o PWA instalado não incha. */
const DemoFrames = ({ frames }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-xs" style={{ height: 180, color: C.textMuted }}>
        <WifiOff size={20} />
        <span>Demonstração indisponível offline</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ height: 180, borderRadius: C.radiusMd, background: C.bgInset }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: C.textMuted }}>
          carregando…
        </div>
      )}
      <img
        src={frames[0]}
        alt="Posição inicial do movimento"
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.2s' }}
      />
      <img
        src={frames[1]}
        alt="Posição final do movimento"
        loading="lazy"
        decoding="async"
        className="ex-demo-frame absolute inset-0 w-full h-full object-contain"
        style={{ visibility: loaded ? 'visible' : 'hidden' }}
      />
    </div>
  );
};

export const ExerciseDemo = ({ gifUrl, muscle }) => {
  const [open, setOpen] = useState(false);
  const frames = getDemoFrames(gifUrl);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm transition-opacity active:opacity-60"
        style={{ borderTop: `1px solid ${C.border}`, borderBottom: open ? 'none' : `1px solid ${C.border}`, color: C.primary, minHeight: 44 }}
        aria-expanded={open}
      >
        <span>Ver demonstração</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          {frames.length > 0 && <DemoFrames frames={frames} />}
          <div className="text-xs mt-4 mb-2" style={{ color: C.textMuted }}>Músculo trabalhado</div>
          <MuscleMap muscle={muscle} height={120} />
        </div>
      )}
    </div>
  );
};
