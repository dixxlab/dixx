import { T as C } from '../../theme/tokens';

/* Diagrama de músculo trabalhado. O corpo é desenhado na mesma linguagem
   geométrica dos stick figures do Figures.jsx (retângulos arredondados e
   elipses) pra não parecer um asset importado de outro app — a silhueta é
   simétrica, então frente e costas compartilham o mesmo desenho base e só
   trocam as regiões destacadas por cima. */

const Silhouette = ({ fill }) => (
  <g fill={fill} opacity="0.3">
    <ellipse cx="50" cy="16" rx="9" ry="11" />
    <rect x="45.5" y="25" width="9" height="8" rx="2" />
    <path d="M32,33 L68,33 L65,70 L62,102 L38,102 L35,70 Z" />
    <ellipse cx="27" cy="41" rx="8.5" ry="9" />
    <ellipse cx="73" cy="41" rx="8.5" ry="9" />
    <rect x="18" y="47" width="11" height="31" rx="5.5" />
    <rect x="71" y="47" width="11" height="31" rx="5.5" />
    <rect x="16" y="79" width="10" height="28" rx="5" />
    <rect x="74" y="79" width="10" height="28" rx="5" />
    <path d="M38,102 L62,102 L60,120 L40,120 Z" />
    <rect x="38" y="117" width="11.5" height="50" rx="5.75" />
    <rect x="50.5" y="117" width="11.5" height="50" rx="5.75" />
    <rect x="39" y="167" width="10" height="40" rx="5" />
    <rect x="51" y="167" width="10" height="40" rx="5" />
  </g>
);

const PEITO = <><rect x="35.5" y="41" width="13" height="21" rx="4" /><rect x="51.5" y="41" width="13" height="21" rx="4" /></>;
const ABDOMEN = <rect x="41" y="65" width="18" height="36" rx="4" />;
const DELTS = <><ellipse cx="27" cy="41" rx="8.5" ry="9" /><ellipse cx="73" cy="41" rx="8.5" ry="9" /></>;
const BRACO_SUP = <><rect x="18" y="47" width="11" height="31" rx="5.5" /><rect x="71" y="47" width="11" height="31" rx="5.5" /></>;
const ANTEBRACO = <><rect x="16" y="79" width="10" height="28" rx="5" /><rect x="74" y="79" width="10" height="28" rx="5" /></>;
const COXA = <><rect x="38" y="117" width="11.5" height="50" rx="5.75" /><rect x="50.5" y="117" width="11.5" height="50" rx="5.75" /></>;
const PANTURRILHA = <><rect x="39" y="167" width="10" height="30" rx="5" /><rect x="51" y="167" width="10" height="30" rx="5" /></>;
const COSTAS = <path d="M34,36 L66,36 L63,62 L55,84 L45,84 L37,62 Z" />;
const GLUTEO = <><ellipse cx="44" cy="111" rx="9" ry="9.5" /><ellipse cx="56" cy="111" rx="9" ry="9.5" /></>;

/* Cada grupo diz o que acende na vista frontal e o que acende nas costas.
   As chaves são exatamente os valores do campo `muscle` em exercises.js. */
const HIGHLIGHTS = {
  'Peito': { front: PEITO },
  'Costas': { back: COSTAS },
  'Pernas': { front: COXA, back: <>{COXA}{PANTURRILHA}</> },
  'Ombro': { front: DELTS, back: DELTS },
  'Bíceps': { front: BRACO_SUP },
  'Tríceps': { back: BRACO_SUP },
  'Abdômen': { front: ABDOMEN },
  'Antebraço': { front: ANTEBRACO, back: ANTEBRACO },
  'Glúteo': { back: GLUTEO },
  'Cardio': { front: <>{COXA}{ABDOMEN}</>, back: <>{COXA}{PANTURRILHA}</> },
};

const BodyView = ({ highlight, label, height }) => (
  <div className="flex flex-col items-center gap-1">
    <svg viewBox="0 0 100 220" height={height} role="img" aria-label={label}>
      <Silhouette fill={C.textMuted} />
      {highlight && <g fill={C.primary}>{highlight}</g>}
    </svg>
    <span className="text-[10px]" style={{ color: C.textMuted }}>{label}</span>
  </div>
);

export const MuscleMap = ({ muscle, height = 132 }) => {
  const regions = HIGHLIGHTS[muscle];
  return (
    <div className="flex items-start justify-center gap-6" style={{ opacity: regions ? 1 : 0.6 }}>
      <BodyView highlight={regions?.front} label="frente" height={height} />
      <BodyView highlight={regions?.back} label="costas" height={height} />
    </div>
  );
};
