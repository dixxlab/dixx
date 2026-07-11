// Calcula 1RM estimado (fórmula Epley: weight * (1 + reps/30))
export const estimate1RM = (weight, reps) => {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;
  if (w === 0 || r === 0) return 0;
  if (r === 1) return w;
  return w * (1 + r / 30);
};

// Filtra histórico por período (em dias)
export const filterByPeriod = (history, days) => {
  if (days === 'all') return history;
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return history.filter(s => new Date(s.date).getTime() >= cutoff);
};

// Pega o melhor set de um exercício em uma sessão (maior 1RM estimado)
export const getBestSetOfSession = (session, exerciseName) => {
  const ex = session.exercises.find(e => e.name === exerciseName);
  if (!ex || ex.sets.length === 0) return null;
  let best = null;
  let bestRM = 0;
  for (const set of ex.sets) {
    const rm = estimate1RM(set.weight, set.reps);
    if (rm > bestRM) {
      bestRM = rm;
      best = { weight: parseFloat(set.weight) || 0, reps: parseInt(set.reps) || 0, oneRM: rm };
    }
  }
  return best;
};

// Cria pontos do gráfico pra um exercício
export const buildChartData = (history, exerciseName, days) => {
  const filtered = filterByPeriod(history, days);
  const points = [];
  for (const session of filtered) {
    const best = getBestSetOfSession(session, exerciseName);
    if (best) {
      const ex = session.exercises.find(e => e.name === exerciseName);
      const totalVolume = ex.sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
      const totalReps = ex.sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
      points.push({
        date: session.date,
        weight: best.weight,
        reps: best.reps,
        oneRM: Math.round(best.oneRM * 10) / 10,
        volume: totalVolume,
        totalReps,
        setsCount: ex.sets.length,
      });
    }
  }
  return points;
};

// Maior peso já registrado pra um exercício em todo o histórico (qualquer sessão, não só as 5 mais recentes)
export const getMaxWeightEver = (history, exerciseName) => {
  let max = 0;
  for (const session of history) {
    const ex = session.exercises.find(e => e.name === exerciseName);
    if (!ex) continue;
    for (const set of ex.sets) {
      const w = parseFloat(set.weight) || 0;
      if (w > max) max = w;
    }
  }
  return max;
};

// Encontra os PRs (recordes) no histórico
export const findPRPoints = (chartData) => {
  const prIndexes = [];
  let maxWeight = 0;
  chartData.forEach((p, i) => {
    if (p.weight > maxWeight) {
      maxWeight = p.weight;
      if (i > 0) prIndexes.push(i); // só marca PR se não for o primeiro
    }
  });
  return prIndexes;
};

// Gera insights inteligentes
export const generateInsights = (chartData) => {
  if (chartData.length === 0) return [];
  const insights = [];

  // Insight 1: comparar último com penúltimo
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    const diff = last.weight - prev.weight;
    if (diff > 0) {
      insights.push({ type: 'success', icon: 'up', text: `+${diff}kg desde o último treino! Continua nessa pegada.` });
    } else if (diff < 0) {
      insights.push({ type: 'warning', icon: 'down', text: `Reduziu ${Math.abs(diff)}kg em relação ao último. Dia ruim ou de propósito?` });
    } else {
      insights.push({ type: 'info', icon: 'right', text: `Mesmo peso do último treino. Tenta subir 2,5kg no próximo!` });
    }
  }

  // Insight 2: detectar platô (3+ treinos com mesmo peso máximo)
  if (chartData.length >= 3) {
    const lastThree = chartData.slice(-3);
    const allSameWeight = lastThree.every(p => p.weight === lastThree[0].weight);
    if (allSameWeight && lastThree[0].weight > 0) {
      insights.push({ type: 'warning', icon: 'alert', text: `Platô detectado: ${lastThree.length} treinos com ${lastThree[0].weight}kg. Variar reps ou descansar 1 semana pode ajudar.` });
    }
  }

  // Insight 3: progresso geral
  if (chartData.length >= 4) {
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const totalGain = last.weight - first.weight;
    if (totalGain > 0) {
      const pct = ((last.weight - first.weight) / first.weight * 100).toFixed(0);
      insights.push({ type: 'success', icon: 'rocket', text: `+${totalGain}kg (+${pct}%) desde o primeiro treino. Tá voando!` });
    }
  }

  // Insight 4: estimar quando bate PR
  if (chartData.length >= 3) {
    const recent = chartData.slice(-3);
    const trend = (recent[2].weight - recent[0].weight) / 2; // ganho médio por treino
    if (trend > 0) {
      const next = recent[2].weight + trend;
      insights.push({ type: 'info', icon: 'target', text: `Próximo treino: tenta ${Math.round(next * 2) / 2}kg (na tendência atual).` });
    }
  }

  return insights;
};

// Calcula heatmap dos últimos 12 semanas
export const buildHeatmap = (history) => {
  const weeks = 12;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7) + 1);
  startDate.setHours(0, 0, 0, 0);

  // Conta treinos por dia
  const countByDay = {};
  history.forEach(s => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    countByDay[key] = (countByDay[key] || 0) + 1;
  });

  // Monta grid de 12 semanas (7 dias cada)
  const grid = [];
  let current = new Date(startDate);
  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      const count = countByDay[key] || 0;
      const isFuture = current > today;
      week.push({ date: new Date(current), count, isFuture });
      current.setDate(current.getDate() + 1);
    }
    grid.push(week);
  }
  return grid;
};
