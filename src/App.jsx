import { useState, useEffect } from 'react';
import { Home, Dumbbell, BarChart3, User, Play, Check, Plus, ChevronRight, Trophy, Clock, Settings, Calendar, TrendingUp, Edit3, X, BookOpen, Search, ArrowLeft, Trash2, ArrowUp, ArrowDown, MoreVertical, RotateCcw, Camera, SkipForward } from 'lucide-react';

const STORAGE_KEY = 'dixx_data_v1';

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

const saveData = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

const resetData = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
};

const initialData = { user: null, history: [], notes: {}, customWorkouts: {}, photo: null, restTime: 90, divisionCount: 4 };

const DixxLogo = ({ size = 40 }) => (
  <img src="/dixx-logo.png" alt="Dixx" width={size} height={size} style={{ display: 'block' }} />
);

const C = {
  bg: '#050d08',
  bgCard: '#0e1f15',
  primary: '#10b981',
  text: '#ffffff',
  textMuted: '#6b8a78',
  border: '#1a3024',
  danger: '#ff6b6b',
};

const Avatar = ({ name, photo, size = 40, onClick }) => {
  const initial = name && name[0] ? name[0].toUpperCase() : '?';
  return (
    <button onClick={onClick} disabled={!onClick} className="rounded-full flex items-center justify-center font-medium transition-transform active:scale-95 overflow-hidden"
      style={{ width: size, height: size, background: C.primary, color: C.bg, fontSize: size * 0.4, cursor: onClick ? 'pointer' : 'default' }}>
      {photo ? <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
    </button>
  );
};

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    } catch (e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
};

const playBeep = (frequency = 800, duration = 150) => {
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
  } catch (e) {}
};

const exerciseLibrary = [
  { id: 'supino-reto', name: 'Supino Reto', muscle: 'Peito', equipment: 'Barra', fig: 'supino', defaultSets: 4, defaultReps: '10', description: 'Deite no banco, segure a barra na largura dos ombros. Desça controlado até o peito e empurre pra cima.' },
  { id: 'supino-inclinado', name: 'Supino Inclinado', muscle: 'Peito', equipment: 'Barra', fig: 'supino', defaultSets: 3, defaultReps: '12', description: 'Banco inclinado 30-45°. Trabalha mais a porção superior do peito. Foco em manter cotovelos a 45°.' },
  { id: 'supino-declinado', name: 'Supino Declinado', muscle: 'Peito', equipment: 'Barra', fig: 'supino', defaultSets: 3, defaultReps: '12', description: 'Banco declinado. Foca a porção inferior do peito. Pés bem fixos no apoio.' },
  { id: 'supino-halteres', name: 'Supino com Halteres', muscle: 'Peito', equipment: 'Halteres', fig: 'supino', defaultSets: 3, defaultReps: '12', description: 'Amplitude maior que com barra. Halteres descem até a linha do peito, palmas viradas pra frente.' },
  { id: 'crucifixo', name: 'Crucifixo', muscle: 'Peito', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Braços levemente flexionados. Abra em arco até sentir alongamento, fechando como se abraçasse um barril.' },
  { id: 'crossover', name: 'Crossover na Polia', muscle: 'Peito', equipment: 'Polia', fig: 'puxada', defaultSets: 3, defaultReps: '15', description: 'Polias altas. Traga as mãos em direção ao centro do corpo. Aperte o peito no final do movimento.' },
  { id: 'mergulho', name: 'Mergulho (Dips)', muscle: 'Peito', equipment: 'Paralelas', fig: 'agacha', defaultSets: 3, defaultReps: '10', description: 'Incline o tronco pra frente pra focar mais peito. Desça até os cotovelos formarem 90°.' },
  { id: 'peck-deck', name: 'Peck Deck (Voador)', muscle: 'Peito', equipment: 'Máquina', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Máquina específica. Aperte os braços contra os apoios sem usar impulso. Foco em apertar o peito.' },
  { id: 'puxada-alta', name: 'Puxada Alta', muscle: 'Costas', equipment: 'Polia', fig: 'puxada', defaultSets: 4, defaultReps: '10', description: 'Pegada larga, puxe a barra até a altura do queixo. Foque em puxar com os cotovelos, não com as mãos.' },
  { id: 'puxada-pegada-fechada', name: 'Puxada Pegada Fechada', muscle: 'Costas', equipment: 'Polia', fig: 'puxada', defaultSets: 3, defaultReps: '12', description: 'Pegada neutra ou supinada. Foca mais a parte inferior das costas e bíceps. Tronco levemente inclinado.' },
  { id: 'remada-curvada', name: 'Remada Curvada', muscle: 'Costas', equipment: 'Barra', fig: 'puxada', defaultSets: 3, defaultReps: '12', description: 'Tronco a 45°, puxe a barra em direção ao umbigo. Cotovelos próximos ao corpo.' },
  { id: 'remada-sentada', name: 'Remada Sentada', muscle: 'Costas', equipment: 'Polia', fig: 'puxada', defaultSets: 3, defaultReps: '12', description: 'Costas retas, puxe o triângulo até o abdômen. Aperte as escápulas no final do movimento.' },
  { id: 'remada-cavalinho', name: 'Remada Cavalinho (T-Bar)', muscle: 'Costas', equipment: 'Barra T', fig: 'puxada', defaultSets: 3, defaultReps: '10', description: 'Pegada neutra na barra. Puxe contra o abdômen. Ótimo pra espessura das costas.' },
  { id: 'remada-unilateral', name: 'Remada Unilateral (Serrote)', muscle: 'Costas', equipment: 'Halter', fig: 'puxada', defaultSets: 3, defaultReps: '12', description: 'Apoie joelho e mão no banco. Puxe o halter até a lateral do tronco. Foco unilateral pra corrigir desequilíbrios.' },
  { id: 'pulldown', name: 'Pulldown com Braços Retos', muscle: 'Costas', equipment: 'Polia', fig: 'puxada', defaultSets: 3, defaultReps: '15', description: 'Braços estendidos, traga a barra até as coxas. Isola o latíssimo. Sem flexão dos cotovelos.' },
  { id: 'levantamento-terra', name: 'Levantamento Terra', muscle: 'Costas', equipment: 'Barra', fig: 'agacha', defaultSets: 4, defaultReps: '8', description: 'Composto pesado. Costas retas, quadril desce, barra próxima ao corpo. Cuidado com a execução.' },
  { id: 'pull-up', name: 'Barra Fixa', muscle: 'Costas', equipment: 'Barra Fixa', fig: 'puxada', defaultSets: 4, defaultReps: '8', description: 'Pegada pronada, suba até o queixo passar da barra. Movimento controlado, sem balanço.' },
  { id: 'agachamento-livre', name: 'Agachamento Livre', muscle: 'Pernas', equipment: 'Barra', fig: 'agacha', defaultSets: 4, defaultReps: '10', description: 'Rei dos exercícios. Pés na largura dos ombros, desce até as coxas paralelas ao chão. Costas retas.' },
  { id: 'agachamento-frontal', name: 'Agachamento Frontal', muscle: 'Pernas', equipment: 'Barra', fig: 'agacha', defaultSets: 3, defaultReps: '10', description: 'Barra apoiada na clavícula. Mais focado em quadríceps. Tronco mais ereto que o livre.' },
  { id: 'leg-press', name: 'Leg Press', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Pés na altura média do apoio. Desça até os joelhos formarem 90°. Não trave os joelhos no topo.' },
  { id: 'hack-squat', name: 'Hack Squat', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Máquina com apoio nas costas. Foca quadríceps. Desça controlado, joelhos alinhados com os pés.' },
  { id: 'cadeira-extensora', name: 'Cadeira Extensora', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Isolado de quadríceps. Estenda até quase travar o joelho, segure 1 segundo no topo.' },
  { id: 'avanco', name: 'Avanço (Afundo)', muscle: 'Pernas', equipment: 'Halteres', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Passo à frente, desce até os dois joelhos formarem 90°. Alterne pernas. Trabalha equilíbrio.' },
  { id: 'sissy-squat', name: 'Sissy Squat', muscle: 'Pernas', equipment: 'Corpo livre', fig: 'agacha', defaultSets: 3, defaultReps: '15', description: 'Avançado. Joelhos vão pra frente enquanto tronco inclina pra trás. Isolamento extremo de quadríceps.' },
  { id: 'stiff', name: 'Stiff', muscle: 'Pernas', equipment: 'Barra', fig: 'agacha', defaultSets: 3, defaultReps: '10', description: 'Pernas semi-rígidas, desça a barra até sentir alongamento no posterior. Foco em isquiotibiais.' },
  { id: 'mesa-flexora', name: 'Mesa Flexora', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Deitado, flexione os joelhos contraindo o posterior. Movimento controlado em ambas as fases.' },
  { id: 'cadeira-flexora', name: 'Cadeira Flexora Sentada', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Sentado, flexione os joelhos. Alternativa à mesa flexora. Mantém o quadril mais estável.' },
  { id: 'good-morning', name: 'Good Morning', muscle: 'Pernas', equipment: 'Barra', fig: 'agacha', defaultSets: 3, defaultReps: '10', description: 'Barra nas costas, incline o tronco pra frente mantendo costas retas. Trabalha posterior e lombar.' },
  { id: 'panturrilha-pe', name: 'Panturrilha em Pé', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 4, defaultReps: '15', description: 'Suba na ponta dos pés o máximo possível, segure 1 segundo no topo. Trabalha gastrocnêmio.' },
  { id: 'panturrilha-sentado', name: 'Panturrilha Sentado', muscle: 'Pernas', equipment: 'Máquina', fig: 'agacha', defaultSets: 4, defaultReps: '15', description: 'Foca o sóleo. Joelhos a 90°, suba na ponta dos pés. Amplitude completa de movimento.' },
  { id: 'desenvolvimento', name: 'Desenvolvimento Militar', muscle: 'Ombro', equipment: 'Barra', fig: 'desen', defaultSets: 4, defaultReps: '10', description: 'Barra na altura dos ombros, empurre acima da cabeça. Foco no deltoide anterior e médio.' },
  { id: 'desenvolvimento-halteres', name: 'Desenvolvimento com Halteres', muscle: 'Ombro', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Sentado ou em pé. Mais natural que com barra. Halteres partem da altura dos ombros.' },
  { id: 'arnold-press', name: 'Arnold Press', muscle: 'Ombro', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Halteres começam com palmas pra dentro, gira durante a subida. Trabalha todo o deltoide.' },
  { id: 'elevacao-lateral', name: 'Elevação Lateral', muscle: 'Ombro', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Levante os halteres lateralmente até a altura dos ombros. Pouco peso, foco na execução. Isola o deltoide médio.' },
  { id: 'elevacao-frontal', name: 'Elevação Frontal', muscle: 'Ombro', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Levante os halteres à frente até a altura dos ombros. Foca o deltoide anterior.' },
  { id: 'crucifixo-inverso', name: 'Crucifixo Inverso', muscle: 'Ombro', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '15', description: 'Tronco inclinado, abra os braços lateralmente. Foca o deltoide posterior. Pouco peso.' },
  { id: 'encolhimento', name: 'Encolhimento (Shrug)', muscle: 'Ombro', equipment: 'Halteres', fig: 'desen', defaultSets: 3, defaultReps: '15', description: 'Eleve os ombros em direção às orelhas. Segure 1 segundo no topo. Trabalha trapézio superior.' },
  { id: 'rosca-direta', name: 'Rosca Direta', muscle: 'Bíceps', equipment: 'Barra', fig: 'rosca', defaultSets: 4, defaultReps: '10', description: 'Cotovelos fixos ao lado do corpo. Suba a barra até a altura do peito sem balançar o tronco.' },
  { id: 'rosca-martelo', name: 'Rosca Martelo', muscle: 'Bíceps', equipment: 'Halteres', fig: 'rosca', defaultSets: 3, defaultReps: '12', description: 'Pegada neutra (martelo). Trabalha bíceps + braquial. Cotovelos fixos.' },
  { id: 'rosca-alternada', name: 'Rosca Alternada', muscle: 'Bíceps', equipment: 'Halteres', fig: 'rosca', defaultSets: 3, defaultReps: '12', description: 'Halteres, um braço de cada vez. Supina o punho durante a subida. Mais foco em cada braço.' },
  { id: 'rosca-concentrada', name: 'Rosca Concentrada', muscle: 'Bíceps', equipment: 'Halter', fig: 'rosca', defaultSets: 3, defaultReps: '10', description: 'Cotovelo apoiado na coxa interna. Isola muito o bíceps. Movimento bem controlado.' },
  { id: 'rosca-scott', name: 'Rosca Scott', muscle: 'Bíceps', equipment: 'Barra W', fig: 'rosca', defaultSets: 3, defaultReps: '12', description: 'Banco Scott, cotovelos fixos no apoio. Pico de contração no bíceps. Cuidado pra não estender total.' },
  { id: 'triceps-pulley', name: 'Tríceps Pulley', muscle: 'Tríceps', equipment: 'Polia', fig: 'puxada', defaultSets: 4, defaultReps: '10', description: 'Cotovelos fixos ao lado do corpo. Estenda os braços completamente, segure 1 segundo embaixo.' },
  { id: 'triceps-testa', name: 'Tríceps Testa', muscle: 'Tríceps', equipment: 'Barra W', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Deitado, barra desce em direção à testa. Cotovelos fixos apontando pro teto.' },
  { id: 'triceps-frances', name: 'Tríceps Francês', muscle: 'Tríceps', equipment: 'Halter', fig: 'desen', defaultSets: 3, defaultReps: '12', description: 'Halter atrás da cabeça, com as duas mãos. Estenda os braços pra cima. Trabalha cabeça longa.' },
  { id: 'triceps-corda', name: 'Tríceps Corda', muscle: 'Tríceps', equipment: 'Polia', fig: 'puxada', defaultSets: 3, defaultReps: '12', description: 'Corda na polia alta. Abra as mãos no final do movimento pra maior contração.' },
  { id: 'triceps-mergulho-banco', name: 'Mergulho no Banco', muscle: 'Tríceps', equipment: 'Banco', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Mãos apoiadas no banco atrás. Desça com cotovelos pra trás, não pros lados. Foca tríceps.' },
  { id: 'abdominal-reto', name: 'Abdominal Reto', muscle: 'Abdômen', equipment: 'Corpo livre', fig: 'abdo', defaultSets: 3, defaultReps: '20', description: 'Deitado, suba o tronco contraindo o abdômen. Não puxe o pescoço, queixo pra cima.' },
  { id: 'prancha', name: 'Prancha', muscle: 'Abdômen', equipment: 'Corpo livre', fig: 'abdo', defaultSets: 3, defaultReps: '30s', description: 'Isométrico. Apoie nos antebraços, corpo reto da cabeça aos pés. Não deixe o quadril cair.' },
  { id: 'abdominal-infra', name: 'Abdominal Infra (Pernas)', muscle: 'Abdômen', equipment: 'Corpo livre', fig: 'abdo', defaultSets: 3, defaultReps: '15', description: 'Deitado, eleve as pernas em direção ao peito. Trabalha mais a parte inferior do abdômen.' },
  { id: 'abdominal-oblique', name: 'Abdominal Oblíquo', muscle: 'Abdômen', equipment: 'Corpo livre', fig: 'abdo', defaultSets: 3, defaultReps: '15', description: 'Suba o tronco torcendo, cotovelo em direção ao joelho oposto. Trabalha laterais do abdômen.' },
  { id: 'abdominal-bicicleta', name: 'Abdominal Bicicleta', muscle: 'Abdômen', equipment: 'Corpo livre', fig: 'abdo', defaultSets: 3, defaultReps: '20', description: 'Pedalando no ar, encoste cotovelo no joelho oposto alternadamente. Trabalha reto + oblíquo.' },
  { id: 'prancha-lateral', name: 'Prancha Lateral', muscle: 'Abdômen', equipment: 'Corpo livre', fig: 'abdo', defaultSets: 3, defaultReps: '30s', description: 'Apoie num antebraço só, corpo de lado. Trabalha oblíquos. Faça os dois lados.' },
  { id: 'rosca-punho', name: 'Rosca de Punho', muscle: 'Antebraço', equipment: 'Barra', fig: 'rosca', defaultSets: 3, defaultReps: '15', description: 'Antebraços apoiados, só os punhos saem do apoio. Flexione os punhos pra cima.' },
  { id: 'rosca-inversa', name: 'Rosca Inversa', muscle: 'Antebraço', equipment: 'Barra', fig: 'rosca', defaultSets: 3, defaultReps: '12', description: 'Pegada pronada (palmas pra baixo). Trabalha braquiorradial e antebraços.' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'Glúteo', equipment: 'Barra', fig: 'agacha', defaultSets: 4, defaultReps: '12', description: 'Costas no banco, barra no quadril. Eleve o quadril contraindo o glúteo no topo. Aperte 1 segundo.' },
  { id: 'elevacao-pelvica', name: 'Elevação Pélvica', muscle: 'Glúteo', equipment: 'Corpo livre', fig: 'agacha', defaultSets: 3, defaultReps: '15', description: 'Deitado, pés no chão. Eleve o quadril contraindo o glúteo. Versão sem peso da hip thrust.' },
  { id: 'coice-polia', name: 'Coice na Polia (Glúteo)', muscle: 'Glúteo', equipment: 'Polia', fig: 'agacha', defaultSets: 3, defaultReps: '12', description: 'Tornozeleira na polia baixa. Eleve a perna pra trás contraindo o glúteo. Tronco estável.' },
  { id: 'abducao', name: 'Abdução de Quadril', muscle: 'Glúteo', equipment: 'Máquina', fig: 'agacha', defaultSets: 3, defaultReps: '15', description: 'Máquina específica. Abra as pernas contra a resistência. Foca glúteo médio.' },
  { id: 'esteira', name: 'Esteira (Caminhada/Corrida)', muscle: 'Cardio', equipment: 'Esteira', fig: 'agacha', defaultSets: 1, defaultReps: '20min', description: 'Aquecimento ou cardio principal. Comece em ritmo confortável, vá aumentando aos poucos.' },
  { id: 'bike', name: 'Bicicleta Ergométrica', muscle: 'Cardio', equipment: 'Bike', fig: 'agacha', defaultSets: 1, defaultReps: '20min', description: 'Cardio sem impacto, bom pra quem tem problema no joelho. Mantenha cadência constante.' },
  { id: 'eliptico', name: 'Elíptico', muscle: 'Cardio', equipment: 'Elíptico', fig: 'desen', defaultSets: 1, defaultReps: '20min', description: 'Cardio sem impacto que envolve membros superiores. Postura ereta, movimento fluido.' },
  { id: 'hiit', name: 'HIIT', muscle: 'Cardio', equipment: 'Variado', fig: 'agacha', defaultSets: 8, defaultReps: '30s', description: 'Treino intervalado de alta intensidade. 30s forte + 30s leve, repete várias vezes. Queima muita caloria.' },
];

const muscleGroups = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps', 'Abdômen', 'Antebraço', 'Glúteo', 'Cardio'];

const ExerciseAnimStyles = () => (
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
    .ex-anim { animation-duration: 2.4s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
  `}</style>
);

const SplashStyles = () => (
  <style>{`
    @keyframes splash-logo-in { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes splash-text-in { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes splash-glow { 0%, 100% { filter: drop-shadow(0 0 8px rgba(16,185,129,0.4)); } 50% { filter: drop-shadow(0 0 24px rgba(16,185,129,0.8)); } }
    @keyframes splash-fadeout { 0% { opacity: 1; } 100% { opacity: 0; pointer-events: none; } }
    @keyframes tab-enter { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes modal-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    .splash-logo { animation: splash-logo-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both, splash-glow 2s ease-in-out 0.7s infinite; }
    .splash-text-1 { animation: splash-text-in 0.6s ease-out 0.5s both; }
    .splash-text-2 { animation: splash-text-in 0.6s ease-out 0.75s both; }
    .splash-container { animation: splash-fadeout 0.5s ease-in 2.5s both; }
    .tab-content { animation: tab-enter 0.25s ease-out; }
    .modal-in { animation: modal-in 0.25s ease-out; }
  `}</style>
);

const SplashScreen = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center splash-container" style={{ background: C.bg }}>
    <div className="splash-logo mb-6"><DixxLogo size={96} /></div>
    <div className="splash-text-1 text-4xl font-medium tracking-tight" style={{ color: C.primary, letterSpacing: '-0.02em' }}>Dixx</div>
    <div className="splash-text-2 text-sm mt-2" style={{ color: C.textMuted }}>seu amigo de treino</div>
  </div>
);

const SupinoFig = ({ size = 90 }) => (
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

const RoscaFig = ({ size = 90 }) => (
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

const AgachaFig = ({ size = 90 }) => (
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

const PuxadaFig = ({ size = 90 }) => (
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

const DesenFig = ({ size = 90 }) => (
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

const AbdoFig = ({ size = 90 }) => (
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

const GenericFig = ({ size = 90 }) => (
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

const getExerciseFig = (key) => {
  const map = { supino: SupinoFig, rosca: RoscaFig, agacha: AgachaFig, puxada: PuxadaFig, desen: DesenFig, abdo: AbdoFig };
  return map[key] || GenericFig;
};

const ExerciseCard = ({ figKey, size = 110 }) => {
  const Fig = getExerciseFig(figKey);
  return (
    <div style={{ background: 'linear-gradient(135deg, #1a3024 0%, #0e1f15 100%)', borderRadius: '16px', padding: '14px', position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(16,185,129,0.25)', color: C.primary, fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', background: C.primary, borderRadius: '50%', animation: 'ex-pulse 1.5s ease-in-out infinite' }} />
        LIVE
      </div>
      <Fig size={size} />
    </div>
  );
};

const defaultWorkoutPlans = [
  { id: 'A', name: 'Treino A', muscle: 'Peito + Tríceps', duration: 45, exercises: [
    { name: 'Supino Reto', sets: 4, reps: '10', fig: 'supino' },
    { name: 'Supino Inclinado', sets: 3, reps: '12', fig: 'supino' },
    { name: 'Crucifixo', sets: 3, reps: '12', fig: 'desen' },
    { name: 'Tríceps Pulley', sets: 4, reps: '10', fig: 'puxada' },
    { name: 'Tríceps Testa', sets: 3, reps: '12', fig: 'desen' },
    { name: 'Mergulho', sets: 3, reps: '10', fig: 'agacha' },
  ]},
  { id: 'B', name: 'Treino B', muscle: 'Costas + Bíceps', duration: 50, exercises: [
    { name: 'Puxada Alta', sets: 4, reps: '10', fig: 'puxada' },
    { name: 'Remada Curvada', sets: 3, reps: '12', fig: 'puxada' },
    { name: 'Remada Sentada', sets: 3, reps: '12', fig: 'puxada' },
    { name: 'Rosca Direta', sets: 4, reps: '10', fig: 'rosca' },
    { name: 'Rosca Martelo', sets: 3, reps: '12', fig: 'rosca' },
    { name: 'Rosca Concentrada', sets: 3, reps: '10', fig: 'rosca' },
  ]},
  { id: 'C', name: 'Treino C', muscle: 'Pernas', duration: 55, exercises: [
    { name: 'Agachamento Livre', sets: 4, reps: '10', fig: 'agacha' },
    { name: 'Leg Press', sets: 3, reps: '12', fig: 'agacha' },
    { name: 'Cadeira Extensora', sets: 3, reps: '12', fig: 'agacha' },
    { name: 'Mesa Flexora', sets: 3, reps: '12', fig: 'agacha' },
    { name: 'Stiff', sets: 3, reps: '10', fig: 'agacha' },
    { name: 'Panturrilha em Pé', sets: 4, reps: '15', fig: 'agacha' },
    { name: 'Abdominal', sets: 3, reps: '20', fig: 'abdo' },
  ]},
  { id: 'D', name: 'Treino D', muscle: 'Ombro + Abdômen', duration: 40, exercises: [
    { name: 'Desenvolvimento', sets: 4, reps: '10', fig: 'desen' },
    { name: 'Elevação Lateral', sets: 3, reps: '12', fig: 'desen' },
    { name: 'Elevação Frontal', sets: 3, reps: '12', fig: 'desen' },
    { name: 'Encolhimento', sets: 3, reps: '15', fig: 'desen' },
    { name: 'Abdominal Reto', sets: 3, reps: '20', fig: 'abdo' },
    { name: 'Prancha', sets: 3, reps: '30s', fig: 'abdo' },
  ]},
  { id: 'E', name: 'Treino E', muscle: 'Braços', duration: 40, exercises: [
    { name: 'Rosca Direta', sets: 4, reps: '10', fig: 'rosca' },
    { name: 'Rosca Martelo', sets: 3, reps: '12', fig: 'rosca' },
    { name: 'Rosca Scott', sets: 3, reps: '12', fig: 'rosca' },
    { name: 'Tríceps Pulley', sets: 4, reps: '10', fig: 'puxada' },
    { name: 'Tríceps Testa', sets: 3, reps: '12', fig: 'desen' },
    { name: 'Tríceps Corda', sets: 3, reps: '12', fig: 'puxada' },
  ]},
];

const getWorkoutPlans = (customWorkouts = {}) => {
  return defaultWorkoutPlans.map(w => customWorkouts[w.id] || w);
};

const getLastSession = (history, exerciseName) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    const ex = session.exercises.find(e => e.name === exerciseName);
    if (ex && ex.sets.length > 0) {
      const lastSet = ex.sets[ex.sets.length - 1];
      return { weight: parseFloat(lastSet.weight) || 0, reps: parseInt(lastSet.reps) || 0 };
    }
  }
  return { weight: 0, reps: 0 };
};

const calculateStreak = (history) => {
  if (history.length === 0) return 0;
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  for (const session of sorted) {
    const sessionDate = new Date(session.date);
    const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= streak + 1) { streak++; currentDate = sessionDate; }
    else break;
  }
  return streak;
};

const calculatePRs = (history) => {
  const prs = {};
  for (const session of history) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        const w = parseFloat(set.weight) || 0;
        if (!prs[ex.name] || w > prs[ex.name].weight) {
          prs[ex.name] = { weight: w, date: session.date };
        }
      }
    }
  }
  return Object.entries(prs).map(([name, data]) => ({ exercise: name, ...data }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
};

const getTodayWorkoutIdx = (history, plans) => {
  if (history.length === 0) return 0;
  const lastSession = history[history.length - 1];
  const lastIdx = plans.findIndex(w => w.id === lastSession.workoutId);
  return (lastIdx + 1) % plans.length;
};

const formatRelative = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  if (diff < 30) return `há ${Math.floor(diff / 7)} sem`;
  return `há ${Math.floor(diff / 30)} meses`;
};

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', experience: '', division: '' });
  const steps = [
    { title: 'Bem-vindo ao Dixx', subtitle: 'Seu app de treino. Vamos te conhecer rapidinho.', field: 'name', label: 'Como você se chama?', type: 'input' },
    { title: `Prazer, ${data.name || 'parceiro'}!`, subtitle: 'Qual seu nível na academia?', field: 'experience', label: 'Experiência', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado'] },
    { title: 'Última coisa', subtitle: 'Como você quer dividir os treinos?', field: 'division', label: 'Divisão', type: 'select', options: ['ABCD (4x semana)', 'ABCDE (5x semana)', 'AB (2x semana)'] },
  ];
  const current = steps[step];
  const canProceed = data[current.field] !== '';
  return (
    <div className="flex flex-col h-full px-6 py-8" style={{ background: C.bg }}>
      <div className="flex gap-2 mb-12">
        {steps.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500" style={{ background: i <= step ? C.primary : C.bgCard }} />
        ))}
      </div>
      <div className="flex justify-center mb-8"><DixxLogo size={64} /></div>
      <h1 className="text-3xl font-medium text-white mb-2 text-center">{current.title}</h1>
      <p className="text-sm text-center mb-10" style={{ color: C.textMuted }}>{current.subtitle}</p>
      <div className="flex-1">
        <label className="text-xs uppercase tracking-wider mb-3 block" style={{ color: C.textMuted }}>{current.label}</label>
        {current.type === 'input' && (
          <input type="text" value={data[current.field]} onChange={(e) => setData({ ...data, [current.field]: e.target.value })} placeholder="Digite seu nome"
            className="w-full p-4 rounded-2xl text-white outline-none transition-all"
            style={{ background: C.bgCard, border: `1px solid ${data[current.field] ? C.primary : C.border}` }} autoFocus />
        )}
        {current.type === 'select' && (
          <div className="space-y-2">
            {current.options.map((opt) => (
              <button key={opt} onClick={() => setData({ ...data, [current.field]: opt })}
                className="w-full p-4 rounded-2xl text-left transition-all duration-200"
                style={{ background: data[current.field] === opt ? C.primary : C.bgCard, color: data[current.field] === opt ? C.bg : C.text, border: `1px solid ${data[current.field] === opt ? C.primary : C.border}`, fontWeight: data[current.field] === opt ? 500 : 400 }}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else onComplete(data); }} disabled={!canProceed}
        className="w-full p-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
        style={{ background: canProceed ? C.primary : C.bgCard, color: canProceed ? C.bg : C.textMuted, opacity: canProceed ? 1 : 0.5 }}>
        {step < steps.length - 1 ? 'Continuar' : 'Começar!'} <ChevronRight size={18} />
      </button>
    </div>
  );
};

const StatCard = ({ value, label, icon }) => (
  <div className="rounded-2xl p-3 text-center" style={{ background: C.bgCard }}>
    <div className="text-xl font-medium flex items-center justify-center gap-1" style={{ color: C.primary }}>
      {icon && <span className="text-base">{icon}</span>}{value}
    </div>
    <div className="text-[10px] mt-1" style={{ color: C.textMuted }}>{label}</div>
  </div>
);

const Dashboard = ({ data, plans, onStartWorkout, onNavigate }) => {
  const todayIdx = getTodayWorkoutIdx(data.history, plans);
  const todayWorkout = plans[todayIdx];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const streak = calculateStreak(data.history);
  const weekWorkouts = data.history.filter(s => (Date.now() - new Date(s.date)) < 7 * 24 * 60 * 60 * 1000).length;
  const weekVolume = data.history.filter(s => (Date.now() - new Date(s.date)) < 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, s) => sum + s.exercises.reduce((es, ex) => es + ex.sets.reduce((ss, set) => ss + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0), 0);

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs" style={{ color: C.textMuted }}>{greeting},</div>
          <div className="text-xl font-medium text-white flex items-center gap-2">{data.user.name} <span>💪</span></div>
        </div>
        <Avatar name={data.user.name} photo={data.photo} size={40} onClick={() => onNavigate('profile')} />
      </div>
      <div className="rounded-3xl p-5 mb-4 transition-all" style={{ background: C.bgCard, border: `1px solid ${C.primary}` }}>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Treino de hoje</div>
        <div className="text-xl font-medium text-white mb-1">{todayWorkout.name}</div>
        <div className="text-sm mb-4" style={{ color: C.textMuted }}>{todayWorkout.muscle} • {todayWorkout.exercises.length} exercícios • ~{todayWorkout.duration}min</div>
        <div className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2" style={{ background: C.bg, color: C.textMuted }}>
          <span style={{ color: C.primary }}>💡</span>
          <span>Iniciante? Faça 5min de esteira ou bike antes pra aquecer.</span>
        </div>
        <button onClick={() => onStartWorkout(todayWorkout)} className="w-full p-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95" style={{ background: C.primary, color: C.bg }}>
          <Play size={16} fill={C.bg} /> Iniciar treino
        </button>
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2 mt-6" style={{ color: C.textMuted }}>Esta semana</div>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatCard value={weekWorkouts} label="treinos" />
        <StatCard value={streak} label="dias" icon="🔥" />
        <StatCard value={`${(weekVolume / 1000).toFixed(1)}t`} label="volume" />
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Próximos treinos</div>
      <div className="space-y-2">
        {plans.filter((_, i) => i !== todayIdx).slice(0, 2).map((w) => (
          <div key={w.id} className="rounded-2xl p-3 flex justify-between items-center transition-all active:scale-95" style={{ background: C.bgCard }}>
            <div>
              <div className="text-sm font-medium text-white">{w.name}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{w.muscle}</div>
            </div>
            <ChevronRight size={18} style={{ color: C.textMuted }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkoutsList = ({ data, plans, onSelectWorkout, onOpenLibrary, onEditWorkout, onResetWorkout }) => {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const todayIdx = getTodayWorkoutIdx(data.history, plans);

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <h1 className="text-2xl font-medium text-white mb-1">Seus treinos</h1>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>Divisão {plans.map(p => p.id).join('')}</p>
      <div className="space-y-3">
        {plans.map((w, i) => {
          const isCustom = !!data.customWorkouts[w.id];
          return (
            <div key={w.id} className="rounded-2xl relative" style={{ background: C.bgCard, borderLeft: i === todayIdx ? `3px solid ${C.primary}` : 'none' }}>
              <button onClick={() => onSelectWorkout(w)} className="w-full p-4 text-left transition-all active:scale-95" style={{ paddingLeft: i === todayIdx ? '13px' : '16px', paddingRight: '50px' }}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-white">{w.name}</div>
                    {isCustom && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.bgCard, color: C.primary, border: `1px solid ${C.primary}` }}>CUSTOM</span>}
                  </div>
                  {i === todayIdx && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.primary, color: C.bg }}>HOJE</span>}
                </div>
                <div className="text-xs" style={{ color: C.textMuted }}>{w.muscle} • {w.exercises.length} exercícios • ~{w.duration}min</div>
              </button>
              <button onClick={() => setMenuOpenId(menuOpenId === w.id ? null : w.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-all active:scale-95">
                <MoreVertical size={18} style={{ color: C.textMuted }} />
              </button>
              {menuOpenId === w.id && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpenId(null)} />
                  <div className="absolute right-2 top-12 rounded-xl shadow-lg z-40 modal-in overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.border}`, minWidth: '180px' }}>
                    <button onClick={() => { setMenuOpenId(null); onEditWorkout(w); }} className="w-full px-4 py-3 text-left text-sm text-white flex items-center gap-2 transition-all active:scale-95" style={{ background: C.bgCard }}>
                      <Edit3 size={14} style={{ color: C.primary }} /> Editar treino
                    </button>
                    {isCustom && (
                      <button onClick={() => { setMenuOpenId(null); onResetWorkout(w.id); }} className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition-all active:scale-95" style={{ background: C.bgCard, color: C.danger, borderTop: `1px solid ${C.border}` }}>
                        <RotateCcw size={14} /> Resetar pro padrão
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        <button onClick={onOpenLibrary} className="w-full rounded-2xl p-4 transition-all active:scale-95 flex items-center justify-center gap-2 font-medium" style={{ background: C.bgCard, color: C.primary, border: `1px solid ${C.primary}` }}>
          <BookOpen size={16} /> Ver biblioteca completa
        </button>
      </div>
    </div>
  );
};

const Library = ({ onClose }) => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filtered = exerciseLibrary.filter(ex => {
    const matchFilter = filter === 'Todos' || ex.muscle === filter;
    const matchSearch = search === '' || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (selectedExercise) {
    return (
      <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedExercise(null)} className="p-2 -ml-2 transition-all active:scale-95">
            <ArrowLeft size={20} color={C.text} />
          </button>
          <h1 className="text-lg font-medium text-white">{selectedExercise.name}</h1>
        </div>
        <div className="mb-5"><ExerciseCard figKey={selectedExercise.fig} size={120} /></div>
        <div className="rounded-2xl p-4 mb-4" style={{ background: C.bgCard }}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Músculo</div>
              <div className="text-sm font-medium" style={{ color: C.primary }}>{selectedExercise.muscle}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Equipamento</div>
              <div className="text-sm text-white">{selectedExercise.equipment}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Séries</div>
              <div className="text-sm text-white">{selectedExercise.defaultSets}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Repetições</div>
              <div className="text-sm text-white">{selectedExercise.defaultReps}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: C.bgCard }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Como executar</div>
          <div className="text-sm text-white leading-relaxed">{selectedExercise.description}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95">
          <ArrowLeft size={20} color={C.text} />
        </button>
        <h1 className="text-2xl font-medium text-white">Biblioteca</h1>
      </div>
      <p className="text-sm mb-4" style={{ color: C.textMuted }}>{exerciseLibrary.length} exercícios disponíveis</p>
      <div className="relative mb-4">
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar exercício..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl text-white outline-none text-sm"
          style={{ background: C.bgCard, border: `1px solid ${C.border}` }} />
      </div>
      <div className="flex gap-2 overflow-x-auto mb-4 pb-2" style={{ scrollbarWidth: 'none' }}>
        {muscleGroups.map((g) => (
          <button key={g} onClick={() => setFilter(g)}
            className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95"
            style={{ background: filter === g ? C.primary : C.bgCard, color: filter === g ? C.bg : C.textMuted }}>
            {g}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.bgCard, color: C.textMuted }}>
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-sm">Nenhum exercício encontrado</div>
          </div>
        ) : filtered.map((ex) => (
          <button key={ex.id} onClick={() => setSelectedExercise(ex)} className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 flex justify-between items-center" style={{ background: C.bgCard }}>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{ex.name}</div>
              <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{ex.muscle} • {ex.equipment}</div>
            </div>
            <ChevronRight size={16} style={{ color: C.textMuted }} />
          </button>
        ))}
      </div>
    </div>
  );
};

const AddExerciseModal = ({ onAdd, onClose }) => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = exerciseLibrary.filter(ex => {
    const matchFilter = filter === 'Todos' || ex.muscle === filter;
    const matchSearch = search === '' || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col modal-in" style={{ background: C.bg }}>
      <div className="px-5 pt-6 flex items-center gap-3 mb-4">
        <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95">
          <X size={20} color={C.text} />
        </button>
        <h1 className="text-xl font-medium text-white">Adicionar exercício</h1>
      </div>
      <div className="px-5 mb-4">
        <div className="relative mb-3">
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar exercício..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-white outline-none text-sm"
            style={{ background: C.bgCard, border: `1px solid ${C.border}` }} autoFocus />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {muscleGroups.map((g) => (
            <button key={g} onClick={() => setFilter(g)}
              className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95"
              style={{ background: filter === g ? C.primary : C.bgCard, color: filter === g ? C.bg : C.textMuted }}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: C.bgCard, color: C.textMuted }}>
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-sm">Nenhum exercício encontrado</div>
            </div>
          ) : filtered.map((ex) => (
            <button key={ex.id} onClick={() => onAdd(ex)} className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 flex justify-between items-center" style={{ background: C.bgCard }}>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{ex.name}</div>
                <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{ex.muscle} • {ex.equipment}</div>
              </div>
              <Plus size={18} style={{ color: C.primary }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorkoutEditor = ({ workout, onSave, onClose }) => {
  const [name, setName] = useState(workout.name);
  const [muscle, setMuscle] = useState(workout.muscle);
  const [exercises, setExercises] = useState(workout.exercises);
  const [showAdd, setShowAdd] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const newList = [...exercises];
    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    setExercises(newList);
  };

  const moveDown = (idx) => {
    if (idx === exercises.length - 1) return;
    const newList = [...exercises];
    [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    setExercises(newList);
  };

  const removeExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const addExercise = (ex) => {
    setExercises([...exercises, { name: ex.name, sets: ex.defaultSets, reps: ex.defaultReps, fig: ex.fig }]);
    setShowAdd(false);
  };

  const updateExercise = (idx, field, value) => {
    const newList = [...exercises];
    newList[idx] = { ...newList[idx], [field]: value };
    setExercises(newList);
  };

  const handleSave = () => {
    if (!name.trim()) { alert('Coloca um nome no treino!'); return; }
    if (exercises.length === 0) { alert('Adiciona pelo menos 1 exercício!'); return; }
    const duration = Math.max(20, exercises.length * 6);
    onSave({ ...workout, name: name.trim(), muscle: muscle.trim() || 'Personalizado', exercises, duration });
  };

  if (showAdd) {
    return <AddExerciseModal onAdd={addExercise} onClose={() => setShowAdd(false)} />;
  }

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="p-2 -ml-2 transition-all active:scale-95">
          <ArrowLeft size={20} color={C.text} />
        </button>
        <button onClick={handleSave} className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.bg }}>
          Salvar
        </button>
      </div>
      <h1 className="text-2xl font-medium text-white mb-1">Editar treino</h1>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>Substitui o {workout.id} padrão</p>
      <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: C.textMuted }}>Nome do treino</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Peito Pesado"
        className="w-full p-3 rounded-2xl text-white outline-none text-sm mb-4"
        style={{ background: C.bgCard, border: `1px solid ${C.border}` }} />
      <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: C.textMuted }}>Grupo muscular</label>
      <input type="text" value={muscle} onChange={(e) => setMuscle(e.target.value)} placeholder="Ex: Peito + Tríceps"
        className="w-full p-3 rounded-2xl text-white outline-none text-sm mb-6"
        style={{ background: C.bgCard, border: `1px solid ${C.border}` }} />
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>Exercícios ({exercises.length})</div>
      </div>
      <div className="space-y-2 mb-3">
        {exercises.map((ex, idx) => (
          <div key={idx} className="rounded-2xl p-3" style={{ background: C.bgCard }}>
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-1">{ex.name}</div>
                {editingIdx === idx ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                      className="w-14 p-2 rounded-lg text-white text-sm outline-none text-center"
                      style={{ background: C.bg, border: `1px solid ${C.border}` }} />
                    <span className="text-xs" style={{ color: C.textMuted }}>séries x</span>
                    <input type="text" value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                      className="w-16 p-2 rounded-lg text-white text-sm outline-none text-center"
                      style={{ background: C.bg, border: `1px solid ${C.border}` }} />
                    <span className="text-xs" style={{ color: C.textMuted }}>reps</span>
                    <button onClick={() => setEditingIdx(null)} className="ml-auto text-xs px-3 py-1 rounded-lg" style={{ background: C.primary, color: C.bg }}>OK</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingIdx(idx)} className="text-xs flex items-center gap-1" style={{ color: C.textMuted }}>
                    {ex.sets} séries × {ex.reps} reps <Edit3 size={10} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="flex-1 p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center"
                style={{ background: C.bg, opacity: idx === 0 ? 0.3 : 1 }}>
                <ArrowUp size={14} style={{ color: C.textMuted }} />
              </button>
              <button onClick={() => moveDown(idx)} disabled={idx === exercises.length - 1} className="flex-1 p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center"
                style={{ background: C.bg, opacity: idx === exercises.length - 1 ? 0.3 : 1 }}>
                <ArrowDown size={14} style={{ color: C.textMuted }} />
              </button>
              <button onClick={() => removeExercise(idx)} className="flex-1 p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center" style={{ background: C.bg }}>
                <Trash2 size={14} style={{ color: C.danger }} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setShowAdd(true)} className="w-full rounded-2xl p-4 transition-all active:scale-95 flex items-center justify-center gap-2 font-medium" style={{ background: 'transparent', border: `1px dashed ${C.primary}`, color: C.primary }}>
        <Plus size={16} /> Adicionar exercício
      </button>
    </div>
  );
};

const ActiveWorkout = ({ data, workout, onFinish, onShowRest, onSaveNote }) => {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [postponed, setPostponed] = useState([]);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [sets, setSets] = useState(workout.exercises.map(ex => Array(ex.sets).fill(null).map(() => ({ weight: '', reps: '', done: false }))));
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const ex = workout.exercises[exerciseIdx];
  const currentSets = sets[exerciseIdx];
  const last = getLastSession(data.history, ex.name);
  const note = data.notes[ex.name] || '';
  const [noteText, setNoteText] = useState(note);

  const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}`; };
  useEffect(() => { const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { setNoteText(data.notes[ex.name] || ''); setShowNote(false); }, [exerciseIdx, ex.name, data.notes]);

  const completeSet = () => {
    initAudio();
    const newSets = [...sets];
    const set = newSets[exerciseIdx][activeSetIdx];
    if (!set.weight) set.weight = last.weight > 0 ? last.weight.toString() : '0';
    if (!set.reps) set.reps = ex.reps;
    set.done = true;
    setSets(newSets);
   onShowRest(() => {
      if (activeSetIdx < ex.sets - 1) setActiveSetIdx(activeSetIdx + 1);
      else if (exerciseIdx < workout.exercises.length - 1) { setExerciseIdx(exerciseIdx + 1); setActiveSetIdx(0); }
      else if (postponed.length > 0) {
        // Volta pros exercícios adiados
        const next = postponed[0];
        setPostponed(postponed.slice(1));
        setExerciseIdx(next);
        setActiveSetIdx(0);
      }
      else onFinish(sets, workout, elapsed);
    });
  };
  const updateSet = (idx, field, value) => { const newSets = [...sets]; newSets[exerciseIdx][idx][field] = value; setSets(newSets); };

  const postponeExercise = () => {
    setPostponed([...postponed, exerciseIdx]);
    setShowSkipModal(false);
    if (exerciseIdx < workout.exercises.length - 1) {
      setExerciseIdx(exerciseIdx + 1);
      setActiveSetIdx(0);
    } else if (postponed.length > 0) {
      // Volta pros adiados
      const next = postponed[0];
      setPostponed(postponed.slice(1));
      setExerciseIdx(next);
      setActiveSetIdx(0);
    } else {
      onFinish(sets, workout, elapsed);
    }
  };

  return (
    <div className="px-5 pt-6 pb-6" style={{ background: C.bg, minHeight: '100%' }}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => onFinish(sets, workout, elapsed)} className="p-2 -ml-2"><X size={20} color={C.textMuted} /></button>
        <div className="text-xs" style={{ color: C.textMuted }}>Exercício {exerciseIdx + 1} de {workout.exercises.length}</div>
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: C.primary }}><Clock size={12} /> {formatTime(elapsed)}</div>
      </div>
      <div className="h-1 rounded-full mb-6" style={{ background: C.bgCard }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ background: C.primary, width: `${((exerciseIdx + activeSetIdx / ex.sets) / workout.exercises.length) * 100}%` }} />
      </div>
      <div className="mb-4"><ExerciseCard figKey={ex.fig} size={110} /></div>
      <div className="mb-1">
        <h2 className="text-xl font-medium text-white">{ex.name}</h2>
        <div className="text-xs mt-1" style={{ color: C.textMuted }}>
          {last.weight > 0 ? `Última vez: ${last.weight}kg × ${last.reps} reps` : '🆕 Primeira vez! Comece leve pra aprender execução'}
        </div>
      </div>
      <button onClick={() => setShowNote(!showNote)} className="text-xs mt-2 mb-4 flex items-center gap-1 transition-all" style={{ color: C.primary }}>
        <Edit3 size={12} /> {note ? 'Editar nota' : 'Adicionar nota'}
      </button>
      {showNote && (
        <div className="mb-4">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} onBlur={() => onSaveNote(ex.name, noteText)} placeholder="Ex: subir 2kg semana que vem"
            className="w-full p-3 rounded-xl text-sm text-white outline-none resize-none"
            style={{ background: C.bgCard, border: `1px solid ${C.border}` }} rows={2} />
        </div>
      )}
      <div className="space-y-2 mb-4">
        {currentSets.map((set, idx) => {
          const isActive = idx === activeSetIdx;
          const isDone = set.done;
          const isPending = idx > activeSetIdx;
          return (
            <div key={idx} className="rounded-xl p-3 flex items-center gap-3 transition-all"
              style={{ background: C.bgCard, border: isActive ? `1px solid ${C.primary}` : 'none', opacity: isPending ? 0.5 : 1 }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{ background: isDone ? C.primary : C.bg, color: isDone ? C.bg : isActive ? C.primary : C.textMuted, border: !isDone ? `1px solid ${isActive ? C.primary : C.border}` : 'none' }}>
                {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <input type="number" value={set.weight} onChange={(e) => updateSet(idx, 'weight', e.target.value)} disabled={!isActive || isDone}
                    placeholder={last.weight > 0 ? last.weight.toString() : '0'}
                    className="w-full bg-transparent text-white text-sm outline-none font-medium" style={{ color: isDone ? C.primary : C.text }} />
                  <div className="text-[9px]" style={{ color: C.textMuted }}>kg</div>
                </div>
                <div>
                  <input type="number" value={set.reps} onChange={(e) => updateSet(idx, 'reps', e.target.value)} disabled={!isActive || isDone} placeholder={ex.reps}
                    className="w-full bg-transparent text-white text-sm outline-none font-medium" style={{ color: isDone ? C.primary : C.text }} />
                  <div className="text-[9px]" style={{ color: C.textMuted }}>reps</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShowSkipModal(true)} className="px-4 rounded-2xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: C.bgCard, color: C.textMuted }}>
          <SkipForward size={18} />
        </button>
        <button onClick={completeSet} className="flex-1 p-4 rounded-2xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: C.primary, color: C.bg }}>
          <Check size={18} strokeWidth={2.5} /> Concluir série {activeSetIdx + 1}
        </button>
      </div>
      {showSkipModal && <SkipModal onPostpone={postponeExercise} onSubstitute={() => { setShowSkipModal(false); setShowSubstituteModal(true); }} onClose={() => setShowSkipModal(false)} />}
    </div>
  );
};

const SkipModal = ({ onPostpone, onSubstitute, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center modal-in" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl p-5 pb-8" style={{ background: C.bgCard }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Pular exercício</h2>
          <button onClick={onClose} className="p-1 transition-all active:scale-95"><X size={20} color={C.textMuted} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Máquina ocupada? Escolha o que fazer:</p>
        <div className="space-y-2">
          <button onClick={onPostpone} className="w-full p-4 rounded-2xl text-left transition-all active:scale-95 flex items-center gap-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '24px' }}>🔄</div>
            <div>
              <div className="text-sm font-medium text-white">Adiar pro final</div>
              <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Faço esse depois, vou pro próximo</div>
            </div>
          </button>
          <button onClick={onSubstitute} className="w-full p-4 rounded-2xl text-left transition-all active:scale-95 flex items-center gap-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '24px' }}>🔀</div>
            <div>
              <div className="text-sm font-medium text-white">Substituir por outro</div>
              <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Troco por exercício similar</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const RestTimer = ({ restTime, onSkip, onDone }) => {
  const [seconds, setSeconds] = useState(restTime);
  useEffect(() => {
    if (seconds <= 0) { onDone(); return; }
    if (seconds <= 3 && seconds > 0) playBeep(800, 120);
    const t = setTimeout(() => {
      setSeconds(s => {
        if (s - 1 === 0) playBeep(1000, 400);
        return s - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [seconds, onDone]);
  const progress = ((restTime - seconds) / restTime) * 283;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className="fixed inset-0 z-50 flex flex-col px-5 pt-6 pb-6" style={{ background: C.bg }}>
      <div className="flex justify-between items-center mb-12">
        <div className="text-xs" style={{ color: C.textMuted }}>Descansando...</div>
        <div className="text-xs flex items-center gap-1" style={{ color: C.primary }}><Check size={12} /> Série concluída</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 mb-6">
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.bgCard} strokeWidth="4"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.primary} strokeWidth="4" strokeDasharray="283" strokeDashoffset={283 - progress} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-medium" style={{ color: C.primary }}>{m}:{s.toString().padStart(2, '0')}</div>
            <div className="text-xs mt-2" style={{ color: C.textMuted }}>de {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setSeconds(s => s + 30)} className="p-4 rounded-2xl font-medium text-white transition-all active:scale-95" style={{ background: C.bgCard }}>+30s</button>
        <button onClick={onSkip} className="p-4 rounded-2xl font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.bg }}>Pular</button>
      </div>
    </div>
  );
};

const Stats = ({ data }) => {
  const streak = calculateStreak(data.history);
  const prs = calculatePRs(data.history);
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const calendar = Array.from({ length: daysInMonth }, (_, i) => {
    const dayDate = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return data.history.some(s => new Date(s.date).toDateString() === dayDate.toDateString());
  });

  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <h1 className="text-2xl font-medium text-white mb-6">Sua jornada</h1>
      <div className="rounded-2xl p-4 mb-4" style={{ background: C.bgCard }}>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Sequência atual</div>
        <div className="flex items-center gap-3">
          <div className="text-4xl">🔥</div>
          <div>
            <div className="text-3xl font-medium" style={{ color: C.primary }}>{streak} {streak === 1 ? 'dia' : 'dias'}</div>
            <div className="text-xs" style={{ color: C.textMuted }}>total: {data.history.length} treinos</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>{today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</div>
      <div className="rounded-2xl p-4 mb-4" style={{ background: C.bgCard }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px]" style={{ color: C.textMuted }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendar.map((done, i) => (
            <div key={i} className="aspect-square rounded-md flex items-center justify-center text-[10px] font-medium"
              style={{ background: done ? C.primary : C.bg, color: done ? C.bg : C.textMuted, border: (i + 1) === today.getDate() ? `2px solid ${C.text}` : 'none' }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      {prs.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} style={{ color: C.primary }} />
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Recordes pessoais</div>
          </div>
          <div className="space-y-2 mb-6">
            {prs.map((pr, i) => (
              <div key={i} className="rounded-2xl p-3 flex justify-between items-center" style={{ background: C.bgCard }}>
                <div>
                  <div className="text-sm font-medium text-white">{pr.exercise}</div>
                  <div className="text-[10px]" style={{ color: C.textMuted }}>{formatRelative(pr.date)}</div>
                </div>
                <div className="font-medium flex items-center gap-1" style={{ color: C.primary }}>{pr.weight}kg <span>🏆</span></div>
              </div>
            ))}
          </div>
        </>
      )}
      {data.history.length === 0 && (
        <div className="rounded-2xl p-6 text-center" style={{ background: C.bgCard, color: C.textMuted }}>
          <div className="text-4xl mb-2">🏋️</div>
          <div className="text-sm">Comece seu primeiro treino<br/>pra ver suas estatísticas!</div>
        </div>
      )}
    </div>
  );
};

const SettingRow = ({ icon: Icon, label, value, onClick }) => (
  <button onClick={onClick} className="w-full rounded-2xl p-4 transition-all active:scale-95 flex justify-between items-center" style={{ background: C.bgCard }}>
    <div className="flex items-center gap-3">
      <Icon size={16} style={{ color: C.primary }} />
      <div className="text-sm text-white">{label}</div>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-xs" style={{ color: C.textMuted }}>{value}</div>
      <ChevronRight size={14} style={{ color: C.textMuted }} />
    </div>
  </button>
);

const RestTimePicker = ({ currentValue, onSave, onClose }) => {
  const [custom, setCustom] = useState('');
  const presets = [60, 90, 120, 180];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center modal-in" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl p-5 pb-8" style={{ background: C.bgCard }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Tempo de descanso</h2>
          <button onClick={onClose} className="p-1 transition-all active:scale-95"><X size={20} color={C.textMuted} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Escolha entre as opções rápidas ou defina um valor customizado.</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {presets.map((sec) => (
            <button key={sec} onClick={() => onSave(sec)}
              className="p-4 rounded-2xl font-medium transition-all active:scale-95"
              style={{ background: currentValue === sec ? C.primary : C.bg, color: currentValue === sec ? C.bg : C.text, border: `1px solid ${currentValue === sec ? C.primary : C.border}` }}>
              {sec}s
            </button>
          ))}
        </div>
        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Customizado</div>
        <div className="flex gap-2">
          <input type="number" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ex: 75"
            className="flex-1 p-3 rounded-xl text-white outline-none text-sm"
            style={{ background: C.bg, border: `1px solid ${C.border}` }} />
          <button onClick={() => { const val = parseInt(custom); if (val > 0) onSave(val); }} disabled={!custom || parseInt(custom) <= 0}
            className="px-5 rounded-xl font-medium transition-all active:scale-95"
            style={{ background: custom && parseInt(custom) > 0 ? C.primary : C.bg, color: custom && parseInt(custom) > 0 ? C.bg : C.textMuted, opacity: custom && parseInt(custom) > 0 ? 1 : 0.5 }}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

const DivisionPicker = ({ currentValue, onSave, onClose }) => {
  const options = [
    { count: 2, label: 'AB', desc: '2 dias por semana' },
    { count: 3, label: 'ABC', desc: '3 dias por semana' },
    { count: 4, label: 'ABCD', desc: '4 dias por semana' },
    { count: 5, label: 'ABCDE', desc: '5 dias por semana' },
  ];
  const handleSelect = (count) => {
    if (count < currentValue) {
      const willDelete = currentValue - count;
      if (!confirm(`Vai apagar ${willDelete} treino(s) extras e suas customizações. Tem certeza?`)) return;
    }
    onSave(count);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center modal-in" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl p-5 pb-8" style={{ background: C.bgCard }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Divisão de treinos</h2>
          <button onClick={onClose} className="p-1 transition-all active:scale-95"><X size={20} color={C.textMuted} /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Escolha quantos treinos diferentes você quer fazer na semana.</p>
        <div className="space-y-2">
          {options.map((opt) => (
            <button key={opt.count} onClick={() => handleSelect(opt.count)}
              className="w-full p-4 rounded-2xl text-left transition-all active:scale-95 flex justify-between items-center"
              style={{ background: currentValue === opt.count ? C.primary : C.bg, color: currentValue === opt.count ? C.bg : C.text, border: `1px solid ${currentValue === opt.count ? C.primary : C.border}` }}>
              <div>
                <div className="text-base font-medium">{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: currentValue === opt.count ? C.bg : C.textMuted, opacity: currentValue === opt.count ? 0.7 : 1 }}>{opt.desc}</div>
              </div>
              {currentValue === opt.count && <Check size={18} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Profile = ({ data, onReset, onExport, onChangePhoto, onChangeRestTime, onChangeDivision }) => {
  const [showRestPicker, setShowRestPicker] = useState(false);
  const [showDivisionPicker, setShowDivisionPicker] = useState(false);
  const streak = calculateStreak(data.history);
  const customCount = Object.keys(data.customWorkouts || {}).length;
  const restTime = data.restTime || 90;
  const divisionCount = data.divisionCount || 4;
  const divisionLabels = ['', '', 'AB', 'ABC', 'ABCD', 'ABCDE'];
  return (
    <div className="px-5 pt-6 pb-28" style={{ background: C.bg, minHeight: '100%' }}>
      <h1 className="text-2xl font-medium text-white mb-6">Perfil</h1>
      <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: C.bgCard }}>
        <div className="mx-auto mb-3 relative" style={{ width: 80, height: 80 }}>
          <Avatar name={data.user.name} photo={data.photo} size={80} onClick={onChangePhoto} />
          <div className="absolute bottom-0 right-0 rounded-full flex items-center justify-center" style={{ width: 28, height: 28, background: C.primary, border: `2px solid ${C.bgCard}` }}>
            <Camera size={14} color={C.bg} />
          </div>
        </div>
        <div className="text-lg font-medium text-white">{data.user.name}</div>
        <div className="text-xs" style={{ color: C.textMuted }}>{data.user.experience} • {divisionLabels[divisionCount]}</div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <div>
            <div className="text-xl font-medium" style={{ color: C.primary }}>{data.history.length}</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>treinos totais</div>
          </div>
          <div>
            <div className="text-xl font-medium" style={{ color: C.primary }}>{streak}</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>streak atual</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Configurações</div>
      <div className="space-y-1 mb-6">
        <SettingRow icon={Clock} label="Tempo de descanso" value={`${restTime}s`} onClick={() => setShowRestPicker(true)} />
        <SettingRow icon={Dumbbell} label="Divisão" value={divisionLabels[divisionCount]} onClick={() => setShowDivisionPicker(true)} />
        <SettingRow icon={Settings} label="Tema" value="Verde floresta" />
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Dados</div>
      <div className="space-y-1">
        <button onClick={onExport} className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 flex justify-between items-center" style={{ background: C.bgCard }}>
          <div>
            <div className="text-sm font-medium text-white">Exportar dados</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>backup JSON</div>
          </div>
          <ChevronRight size={16} style={{ color: C.textMuted }} />
        </button>
        <button onClick={onReset} className="w-full rounded-2xl p-4 text-left transition-all active:scale-95" style={{ background: C.bgCard, color: C.danger }}>
          <div className="text-sm font-medium">Resetar dados (refazer onboarding)</div>
        </button>
      </div>
      <div className="text-center mt-8 text-[10px]" style={{ color: C.textMuted }}>Dixx · v0.6 · {exerciseLibrary.length} exercícios · {customCount} treino{customCount !== 1 ? 's' : ''} custom 💾</div>
      {showRestPicker && <RestTimePicker currentValue={restTime} onSave={(v) => { onChangeRestTime(v); setShowRestPicker(false); }} onClose={() => setShowRestPicker(false)} />}
      {showDivisionPicker && <DivisionPicker currentValue={divisionCount} onSave={(v) => { onChangeDivision(v); setShowDivisionPicker(false); }} onClose={() => setShowDivisionPicker(false)} />}
    </div>
  );
};

const WorkoutFinished = ({ summary, onClose }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
    <div className="text-7xl mb-4">🎉</div>
    <h1 className="text-3xl font-medium text-white mb-2">Treino concluído!</h1>
    <p className="text-sm text-center mb-8" style={{ color: C.textMuted }}>Mais um dia somado na sua jornada.</p>
    <div className="w-full max-w-md rounded-2xl p-5 mb-8" style={{ background: C.bgCard }}>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div><div className="text-2xl font-medium" style={{ color: C.primary }}>{summary.exercises}</div><div className="text-[10px]" style={{ color: C.textMuted }}>exercícios</div></div>
        <div><div className="text-2xl font-medium" style={{ color: C.primary }}>{summary.minutes}min</div><div className="text-[10px]" style={{ color: C.textMuted }}>duração</div></div>
        <div><div className="text-2xl font-medium" style={{ color: C.primary }}>{summary.volume}t</div><div className="text-[10px]" style={{ color: C.textMuted }}>volume</div></div>
      </div>
    </div>
    <button onClick={onClose} className="w-full max-w-md p-4 rounded-2xl font-medium transition-all active:scale-95" style={{ background: C.primary, color: C.bg }}>Voltar pra home</button>
  </div>
);

const BottomNav = ({ active, onChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'workouts', icon: Dumbbell, label: 'Treinos' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto px-2 pt-3 flex justify-around z-40" style={{ background: C.bg, maxWidth: '500px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} className="flex flex-col items-center gap-1 px-3 py-2 transition-all active:scale-95">
            <Icon size={20} style={{ color: isActive ? C.primary : C.textMuted }} />
            <div className="text-[9px] font-medium" style={{ color: isActive ? C.primary : C.textMuted }}>{label}</div>
          </button>
        );
      })}
    </div>
  );
};

export default function App() {
  const [data, setData] = useState(() => {
    const loaded = loadData() || initialData;
    if (!loaded.customWorkouts) loaded.customWorkouts = {};
    if (!loaded.restTime) loaded.restTime = 90;
    if (!loaded.divisionCount) loaded.divisionCount = 4;
    return loaded;
  });
  const [view, setView] = useState(data.user ? 'main' : 'onboarding');
  const [activeTab, setActiveTab] = useState('home');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showRest, setShowRest] = useState(false);
  const [restCallback, setRestCallback] = useState(null);
  const [finishedSummary, setFinishedSummary] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const plans = getWorkoutPlans(data.customWorkouts).slice(0, data.divisionCount || 4);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { saveData(data); }, [data]);

  const handleOnboardingComplete = (userData) => {
    setData({ ...data, user: userData });
    setView('main');
  };

  const handleStartWorkout = (workout) => {
    setActiveWorkout(workout);
    setView('workout');
  };

  const handleFinishWorkout = (sets, workout, seconds) => {
    const session = {
      date: new Date().toISOString(),
      workoutId: workout.id,
      exercises: workout.exercises.map((ex, i) => ({
        name: ex.name,
        sets: sets[i].filter(s => s.done).map(s => ({ weight: s.weight, reps: s.reps })),
      })).filter(ex => ex.sets.length > 0),
    };

    if (session.exercises.length > 0) {
      const newData = { ...data, history: [...data.history, session] };
      setData(newData);
      const totalVolume = session.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0);
      setFinishedSummary({
        exercises: session.exercises.length,
        minutes: Math.floor(seconds / 60),
        volume: (totalVolume / 1000).toFixed(1),
      });
      setView('finished');
    } else {
      setView('main');
    }
    setActiveWorkout(null);
  };

  const handleShowRest = (cb) => { setRestCallback(() => cb); setShowRest(true); };
  const handleRestDone = () => { setShowRest(false); if (restCallback) restCallback(); };

  const handleReset = () => {
    if (confirm('Tem certeza? Vai apagar todos os dados (treinos, PRs, histórico, customizações).')) {
      resetData();
      setData(initialData);
      setView('onboarding');
      setActiveTab('home');
    }
  };

  const handleSaveNote = (exerciseName, text) => {
    setData({ ...data, notes: { ...data.notes, [exerciseName]: text } });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dixx-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCustomWorkout = (workout) => {
    setData({ ...data, customWorkouts: { ...data.customWorkouts, [workout.id]: workout } });
    setEditingWorkout(null);
  };

  const handleResetWorkout = (workoutId) => {
    if (confirm('Resetar esse treino pro padrão? Você vai perder as customizações.')) {
      const newCustom = { ...data.customWorkouts };
      delete newCustom[workoutId];
      setData({ ...data, customWorkouts: newCustom });
    }
  };

  const handleChangePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { setData({ ...data, photo: ev.target.result }); };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleChangeRestTime = (seconds) => {
    setData({ ...data, restTime: seconds });
  };

  const handleChangeDivision = (newCount) => {
    const currentCount = data.divisionCount || 4;
    if (newCount < currentCount) {
      const idsToRemove = ['A', 'B', 'C', 'D', 'E'].slice(newCount);
      const newCustom = { ...data.customWorkouts };
      idsToRemove.forEach(id => delete newCustom[id]);
      setData({ ...data, divisionCount: newCount, customWorkouts: newCustom });
    } else {
      setData({ ...data, divisionCount: newCount });
    }
  };

  return (
    <div
      className="w-full mx-auto relative overflow-hidden flex flex-col"
      style={{
        background: C.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        minHeight: '100dvh',
        height: '100dvh',
        maxWidth: '500px',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <ExerciseAnimStyles />
      <SplashStyles />
      {showSplash && <SplashScreen />}

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {view === 'onboarding' && (
          <div key="onboarding" className="tab-content h-full">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        )}
        {view === 'main' && data.user && (
          <>
            <div key={editingWorkout ? 'edit' : (showLibrary ? 'library' : activeTab)} className="tab-content">
              {editingWorkout ? (
                <WorkoutEditor workout={editingWorkout} onSave={handleSaveCustomWorkout} onClose={() => setEditingWorkout(null)} />
              ) : showLibrary ? (
                <Library onClose={() => setShowLibrary(false)} />
              ) : (
                <>
                  {activeTab === 'home' && <Dashboard data={data} plans={plans} onStartWorkout={handleStartWorkout} onNavigate={setActiveTab} />}
                  {activeTab === 'workouts' && <WorkoutsList data={data} plans={plans} onSelectWorkout={handleStartWorkout} onOpenLibrary={() => setShowLibrary(true)} onEditWorkout={setEditingWorkout} onResetWorkout={handleResetWorkout} />}
                  {activeTab === 'stats' && <Stats data={data} />}
                  {activeTab === 'profile' && <Profile data={data} onReset={handleReset} onExport={handleExport} onChangePhoto={handleChangePhoto} onChangeRestTime={handleChangeRestTime} onChangeDivision={handleChangeDivision} />}
                </>
              )}
            </div>
            {!showLibrary && !editingWorkout && <BottomNav active={activeTab} onChange={setActiveTab} />}
          </>
        )}
        {view === 'workout' && activeWorkout && (
          <div key="workout" className="tab-content">
            <ActiveWorkout data={data} workout={activeWorkout} onFinish={handleFinishWorkout} onShowRest={handleShowRest} onSaveNote={handleSaveNote} />
          </div>
        )}
        {view === 'finished' && finishedSummary && <WorkoutFinished summary={finishedSummary} onClose={() => { setView('main'); setActiveTab('home'); setFinishedSummary(null); }} />}
        {showRest && <RestTimer restTime={data.restTime || 90} onSkip={handleRestDone} onDone={handleRestDone} />}
      </div>
    </div>
  );
}