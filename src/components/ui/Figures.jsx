import { T as C } from '../../theme/tokens';

export const ExerciseAnimStyles = () => (
  <style>{`
    @keyframes ex-supino-bar { 0%,100% { transform: translateY(-22px); } 50% { transform: translateY(0px); } }
    @keyframes ex-supino-fl { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(45deg); } }
    @keyframes ex-supino-fr { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-45deg); } }
    @keyframes ex-rosca-l { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-110deg); } }
    @keyframes ex-rosca-r { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(110deg); } }
    @keyframes ex-agacha-body { 0%,100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
    @keyframes ex-agacha-thigh { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-25deg); } }
    @keyframes ex-agacha-arms { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(35deg); } }
    @keyframes ex-puxada-bar { 0%,100% { transform: translateY(-15px); } 50% { transform: translateY(5px); } }
    @keyframes ex-puxada-arm { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.55); } }
    @keyframes ex-desen-bar { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-22px); } }
    @keyframes ex-desen-arm { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.5); } }
    @keyframes ex-abdo { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-35deg); } }
    @keyframes ex-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes chart-draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
    @keyframes fade-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
    .ex-anim { animation-duration: 2.4s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
    .chart-line { stroke-dasharray: 1000; animation: chart-draw 1.5s ease-out forwards; }
    .fade-up { animation: fade-up 0.4s ease-out; }
  `}</style>
);

export const SupinoFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect x="15" y="58" width="70" height="5" rx="1" fill={C.primary} opacity="0.35"/>
    <rect x="20" y="63" width="4" height="16" fill={C.primary} opacity="0.35"/>
    <rect x="76" y="63" width="4" height="16" fill={C.primary} opacity="0.35"/>
    <rect x="14" y="32" width="3" height="28" fill={C.primary} opacity="0.4"/>
    <rect x="83" y="32" width="3" height="28" fill={C.primary} opacity="0.4"/>
    <ellipse cx="24" cy="52" rx="5" ry="5" fill={C.primary}/>
    <rect x="28" y="48" width="34" height="9" rx="3" fill={C.primary}/>
    <rect x="60" y="50" width="22" height="4" rx="1" fill={C.primary}/>
    <rect x="78" y="50" width="4" height="12" rx="1" fill={C.primary}/>
    <rect x="44" y="36" width="3" height="14" rx="1" fill={C.primary}/>
    <rect x="53" y="36" width="3" height="14" rx="1" fill={C.primary}/>
    <g className="ex-anim" style={{ transformOrigin: '45.5px 38px', animationName: 'ex-supino-fl' }}>
      <rect x="44" y="20" width="3" height="18" rx="1" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ transformOrigin: '54.5px 38px', animationName: 'ex-supino-fr' }}>
      <rect x="53" y="20" width="3" height="18" rx="1" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ animationName: 'ex-supino-bar' }}>
      <rect x="26" y="38" width="48" height="3" rx="1" fill={C.primary}/>
      <rect x="22" y="34" width="6" height="11" rx="1" fill={C.primary}/>
      <rect x="72" y="34" width="6" height="11" rx="1" fill={C.primary}/>
    </g>
  </svg>
);

export const RoscaFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="18" rx="7" ry="8" fill={C.primary}/>
    <rect x="46" y="26" width="8" height="32" rx="3" fill={C.primary}/>
    <rect x="44" y="58" width="12" height="6" rx="2" fill={C.primary}/>
    <rect x="44" y="64" width="4" height="22" rx="1" fill={C.primary}/>
    <rect x="52" y="64" width="4" height="22" rx="1" fill={C.primary}/>
    <rect x="38" y="30" width="3" height="20" rx="1" fill={C.primary}/>
    <g className="ex-anim" style={{ transformOrigin: '39.5px 50px', animationName: 'ex-rosca-l' }}>
      <rect x="38" y="50" width="3" height="18" rx="1" fill={C.primary}/>
      <rect x="34" y="66" width="11" height="7" rx="1.5" fill={C.primary}/>
    </g>
    <rect x="59" y="30" width="3" height="20" rx="1" fill={C.primary}/>
    <g className="ex-anim" style={{ transformOrigin: '60.5px 50px', animationName: 'ex-rosca-r' }}>
      <rect x="59" y="50" width="3" height="18" rx="1" fill={C.primary}/>
      <rect x="55" y="66" width="11" height="7" rx="1.5" fill={C.primary}/>
    </g>
  </svg>
);

export const AgachaFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <g className="ex-anim" style={{ animationName: 'ex-agacha-body' }}>
      <ellipse cx="50" cy="14" rx="6" ry="7" fill={C.primary}/>
      <rect x="46" y="22" width="8" height="26" rx="3" fill={C.primary}/>
      <g className="ex-anim" style={{ transformOrigin: '50px 28px', animationName: 'ex-agacha-arms' }}>
        <rect x="38" y="27" width="14" height="3" rx="1" fill={C.primary}/>
        <rect x="48" y="27" width="14" height="3" rx="1" fill={C.primary}/>
      </g>
      <rect x="44" y="48" width="12" height="6" rx="2" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ transformOrigin: '46px 56px', animationName: 'ex-agacha-thigh' }}>
      <rect x="44" y="56" width="4" height="16" rx="1" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ transformOrigin: '54px 56px', animationName: 'ex-agacha-thigh' }}>
      <rect x="52" y="56" width="4" height="16" rx="1" fill={C.primary}/>
    </g>
    <rect x="40" y="72" width="4" height="16" rx="1" fill={C.primary}/>
    <rect x="56" y="72" width="4" height="16" rx="1" fill={C.primary}/>
    <rect x="20" y="88" width="60" height="2" fill={C.primary} opacity="0.3"/>
  </svg>
);

export const PuxadaFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <line x1="30" y1="0" x2="30" y2="22" stroke={C.primary} strokeWidth="1.5" opacity="0.5"/>
    <line x1="70" y1="0" x2="70" y2="22" stroke={C.primary} strokeWidth="1.5" opacity="0.5"/>
    <g className="ex-anim" style={{ animationName: 'ex-puxada-bar' }}>
      <rect x="22" y="22" width="56" height="3" rx="1" fill={C.primary}/>
      <rect x="22" y="20" width="3" height="7" fill={C.primary}/>
      <rect x="75" y="20" width="3" height="7" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ transformOrigin: '38px 30px', animationName: 'ex-puxada-arm' }}>
      <rect x="36" y="30" width="3" height="22" rx="1" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ transformOrigin: '61px 30px', animationName: 'ex-puxada-arm' }}>
      <rect x="61" y="30" width="3" height="22" rx="1" fill={C.primary}/>
    </g>
    <ellipse cx="50" cy="42" rx="6" ry="7" fill={C.primary}/>
    <rect x="46" y="50" width="8" height="24" rx="3" fill={C.primary}/>
    <rect x="44" y="74" width="4" height="14" rx="1" fill={C.primary}/>
    <rect x="52" y="74" width="4" height="14" rx="1" fill={C.primary}/>
  </svg>
);

export const DesenFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="28" rx="6" ry="7" fill={C.primary}/>
    <rect x="46" y="36" width="8" height="24" rx="3" fill={C.primary}/>
    <rect x="44" y="60" width="4" height="28" rx="1" fill={C.primary}/>
    <rect x="52" y="60" width="4" height="28" rx="1" fill={C.primary}/>
    <g className="ex-anim" style={{ transformOrigin: '42px 40px', animationName: 'ex-desen-arm' }}>
      <rect x="40" y="22" width="3" height="18" rx="1" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ transformOrigin: '57px 40px', animationName: 'ex-desen-arm' }}>
      <rect x="57" y="22" width="3" height="18" rx="1" fill={C.primary}/>
    </g>
    <g className="ex-anim" style={{ animationName: 'ex-desen-bar' }}>
      <rect x="36" y="18" width="11" height="7" rx="1.5" fill={C.primary}/>
      <rect x="53" y="18" width="11" height="7" rx="1.5" fill={C.primary}/>
    </g>
  </svg>
);

export const AbdoFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect x="10" y="72" width="80" height="2" fill={C.primary} opacity="0.3"/>
    <rect x="58" y="58" width="22" height="4" rx="1" fill={C.primary}/>
    <rect x="76" y="58" width="4" height="14" rx="1" fill={C.primary}/>
    <rect x="58" y="62" width="4" height="10" rx="1" fill={C.primary}/>
    <g className="ex-anim" style={{ transformOrigin: '60px 62px', animationName: 'ex-abdo' }}>
      <rect x="30" y="58" width="30" height="8" rx="3" fill={C.primary}/>
      <ellipse cx="28" cy="62" rx="6" ry="6" fill={C.primary}/>
      <rect x="20" y="56" width="3" height="12" rx="1" fill={C.primary} transform="rotate(-30 21 62)"/>
      <rect x="32" y="52" width="3" height="12" rx="1" fill={C.primary} transform="rotate(30 33 58)"/>
    </g>
  </svg>
);

export const GenericFig = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="22" rx="7" ry="8" fill={C.primary}/>
    <rect x="46" y="30" width="8" height="28" rx="3" fill={C.primary}/>
    <rect x="44" y="58" width="12" height="6" rx="2" fill={C.primary}/>
    <rect x="44" y="64" width="4" height="22" rx="1" fill={C.primary}/>
    <rect x="52" y="64" width="4" height="22" rx="1" fill={C.primary}/>
    <rect x="30" y="34" width="3" height="18" rx="1" fill={C.primary}/>
    <rect x="67" y="34" width="3" height="18" rx="1" fill={C.primary}/>
    <rect x="26" y="50" width="11" height="7" rx="1.5" fill={C.primary}/>
    <rect x="63" y="50" width="11" height="7" rx="1.5" fill={C.primary}/>
  </svg>
);

export const getExerciseFig = (key) => {
  const map = { supino: SupinoFig, rosca: RoscaFig, agacha: AgachaFig, puxada: PuxadaFig, desen: DesenFig, abdo: AbdoFig };
  return map[key] || GenericFig;
};

export const ExerciseCard = ({ figKey, size = 110 }) => {
  const Fig = getExerciseFig(figKey);
  return (
    <div style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-inset) 100%)', borderRadius: 'var(--radius-lg)', padding: '14px', position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', background: C.primarySoft, color: C.primary, fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', background: C.primary, borderRadius: '50%', animation: 'ex-pulse 1.5s ease-in-out infinite' }} />
        LIVE
      </div>
      {/* eslint-disable-next-line react-hooks/static-components -- getExerciseFig só faz lookup num mapa estático de componentes já declarados no módulo, nunca cria um novo */}
      <Fig size={size} />
    </div>
  );
};
