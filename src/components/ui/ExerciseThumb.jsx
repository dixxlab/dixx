import { useState } from 'react';
import { T as C } from '../../theme/tokens';
import { getDemoFrames } from '../../lib/demos';
import { FigGlyph } from './Figures';

/* Miniatura circular recortada da foto real do exercício, da mesma fonte que a
   demonstração usa.

   Por que não o stick figure aqui: abaixo de ~80px o desenho de linha perde a
   silhueta e deixa de ler como "pessoa executando o movimento" — vira forma
   abstrata. A foto reconhece na hora, sem depender de execução de ícone em
   tamanho pequeno.

   O desenho continua sendo o fallback, e não é um consolo: é local, instantâneo
   e funciona offline. Entra quando o exercício não tem foto no catálogo ou
   quando a imagem não está em cache e a rede falhou. */
export const ExerciseThumb = ({ gifUrl, figKey, size = 72 }) => {
  const [failed, setFailed] = useState(false);
  const [frame] = getDemoFrames(gifUrl);

  if (!frame || failed) {
    return <FigGlyph figKey={figKey} size={size} opacity={0.55} />;
  }

  return (
    <span
      className="block overflow-hidden rounded-full"
      style={{ width: size, height: size, background: C.bgCard, border: `1px solid ${C.border}` }}
    >
      <img
        src={frame}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </span>
  );
};
