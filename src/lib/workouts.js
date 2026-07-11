export const defaultWorkoutPlans = [
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

export const getWorkoutPlans = (customWorkouts = {}) => {
  return defaultWorkoutPlans.map(w => customWorkouts[w.id] || w);
};

export const getLastSession = (history, exerciseName) => {
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

export const calculateStreak = (history) => {
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

export const calculatePRs = (history) => {
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

export const getTodayWorkoutIdx = (history, plans) => {
  if (history.length === 0) return 0;
  const lastSession = history[history.length - 1];
  const lastIdx = plans.findIndex(w => w.id === lastSession.workoutId);
  return (lastIdx + 1) % plans.length;
};

export const formatRelative = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  if (diff < 30) return `há ${Math.floor(diff / 7)} sem`;
  return `há ${Math.floor(diff / 30)} meses`;
};

// Converte a escolha textual do onboarding em divisionCount real.
// Corrige o bug em que a divisão escolhida no onboarding nunca era aplicada.
export const divisionLabelToCount = (division) => {
  if (!division) return 4;
  if (division.startsWith('AB (')) return 2;
  if (division.startsWith('ABCDE')) return 5;
  if (division.startsWith('ABCD')) return 4;
  return 4;
};
