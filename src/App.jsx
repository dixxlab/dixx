import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { ConfirmProvider } from './components/ui/ConfirmProvider';
import { ConfirmSheet } from './components/ui/ConfirmSheet';
import { ExerciseAnimStyles } from './components/ui/Figures';
import { SplashScreen } from './components/ui/Splash';
import { LockScreen } from './components/ui/LockScreen';
import { BottomNav } from './components/ui/BottomNav';
import { loadData, saveData, resetData, initialData } from './lib/storage';
import { getWorkoutPlans, divisionLabelToCount } from './lib/workouts';
import { buildWorkoutSummary } from './lib/stats';
import { watchServiceWorkerUpdate, setPodeRecarregar } from './lib/swUpdate';
import { isUnlocked } from './lib/access';

import { Onboarding } from './components/screens/Onboarding';
import { Dashboard } from './components/screens/Dashboard';
import { WorkoutsList } from './components/screens/WorkoutsList';
import { Library } from './components/screens/Library';
import { WorkoutEditor } from './components/screens/WorkoutEditor';
import { Stats } from './components/screens/Stats';
import { ExerciseEvolution } from './components/screens/ExerciseEvolution';
import { ActiveWorkout } from './components/screens/ActiveWorkout';
import { RestTimer } from './components/screens/RestTimer';
import { Profile } from './components/screens/Profile';
import { WorkoutFinished } from './components/screens/WorkoutFinished';

const AppShell = () => {
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
  // Desbloqueado só vale enquanto a senha gravada bater com a que está no
  // código: trocar APP_PASSWORD joga todo aparelho de volta pra trava.
  const [locked, setLocked] = useState(!isUnlocked());
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [evolutionExercise, setEvolutionExercise] = useState(null);
  // Treino que o usuário tentou iniciar tendo outro pausado.
  const [conflito, setConflito] = useState(null);
  const decisaoRef = useRef(null);

  const plans = getWorkoutPlans(data.customWorkouts).slice(0, data.divisionCount || 4);

  useEffect(() => {
    // Acompanha a animação da abertura (2,3s), que já faz o próprio fade de saída.
    const t = setTimeout(() => setShowSplash(false), 2300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { saveData(data); }, [data]);

  // Versão nova do app entra na mesma abertura, mas nunca no meio de um treino
  // ou do onboarding — recarregar ali apagaria séries ou respostas em memória.
  useEffect(() => { watchServiceWorkerUpdate(); }, []);
  useEffect(() => { setPodeRecarregar(() => view === 'main' && !showRest); }, [view, showRest]);

  const handleOnboardingComplete = (userData) => {
    // A divisão escolhida no onboarding precisa virar divisionCount de fato,
    // senão o usuário escolhe "AB" e continua recebendo o plano ABCD padrão.
    const divisionCount = divisionLabelToCount(userData.division);
    setData({ ...data, user: userData, divisionCount });
    setView('main');
  };

  const pausado = data.inProgressWorkout;

  const abrirTreino = (workout) => { setActiveWorkout(workout); setView('workout'); };

  const retomarPausado = () => {
    const plano = plans.find(w => w.id === pausado?.workoutId);
    // O plano pode ter sumido (divisão reduzida, custom resetado): descarta.
    if (!plano) { setData(d => ({ ...d, inProgressWorkout: null })); return; }
    abrirTreino(plano);
  };

  const handleStartWorkout = (workout) => {
    // Mesmo treino já aberto (pausado nesta sessão, ou saído pelo X):
    // tocar em "iniciar" volta pra ele.
    if (activeWorkout?.id === workout.id) { setView('workout'); return; }
    // Treino diferente por cima de um em andamento ou pausado: pergunta antes
    // de descartar o progresso, em vez de trocar por baixo do usuário.
    if (activeWorkout || pausado) { setConflito(workout); return; }
    abrirTreino(workout);
  };

  /* Sair não é terminar. O progresso vai pro inProgressWorkout e o treino
     continua em andamento — activeWorkout não é zerado. */
  const handleExitWorkout = (estado) => {
    setShowRest(false);
    setData(d => ({
      ...d,
      inProgressWorkout: {
        workoutId: activeWorkout?.id ?? null,
        exercises: estado.exercises,
        exerciseIdx: estado.exerciseIdx,
        sets: estado.sets,
        postponed: estado.postponed,
        elapsed: estado.elapsed,
        startedAt: d.inProgressWorkout?.startedAt ?? new Date().toISOString(),
      },
    }));
    setView('main');
    setActiveTab('home');
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
      // Concluído de verdade: nada de resquício "em andamento" pra trás.
      const newData = { ...data, history: [...data.history, session], inProgressWorkout: null };
      setData(newData);
      setFinishedSummary(buildWorkoutSummary({
        session,
        workoutName: workout.name,
        seconds,
        previousHistory: data.history,
      }));
      setView('finished');
    } else {
      setData(d => ({ ...d, inProgressWorkout: null }));
      setView('main');
    }
    setActiveWorkout(null);
  };

  const handleShowRest = (cb) => { setRestCallback(() => cb); setShowRest(true); };
  const handleRestDone = () => { setShowRest(false); if (restCallback) restCallback(); };

  const handleReset = () => {
    resetData();
    setData(initialData);
    setView('onboarding');
    setActiveTab('home');
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
    const newCustom = { ...data.customWorkouts };
    delete newCustom[workoutId];
    setData({ ...data, customWorkouts: newCustom });
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

  const showEvolution = !!evolutionExercise;
  // Vale tanto pro treino aberto nesta sessão quanto pro pausado que sobreviveu
  // a fechar o app.
  const idEmAndamento = activeWorkout?.id ?? pausado?.workoutId ?? null;
  const nomeEmAndamento = activeWorkout?.name ?? plans.find(w => w.id === pausado?.workoutId)?.name ?? 'Treino';
  const contentKey = evolutionExercise || (editingWorkout ? 'edit' : (showLibrary ? 'library' : activeTab));

  return (
    <div
      className="w-full mx-auto relative overflow-hidden flex flex-col"
      style={{
        fontFamily: 'var(--font-ui)',
        // Fundo explícito também aqui: o container tem altura fixa, e sem cor
        // própria qualquer folga entre ele e a borda da tela ficava sem pintura.
        background: 'var(--bg)',
        minHeight: '100dvh',
        height: '100dvh',
        maxWidth: '500px',
        paddingTop: 'env(safe-area-inset-top)',
        // Simétrico ao topo: reserva a área segura de baixo pra nada renderizar
        // debaixo da barra de gestos.
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <ExerciseAnimStyles />
      {showSplash && <SplashScreen key="splash" />}
      {/* Acima de tudo menos da abertura, e montado desde o primeiro quadro: o
          fundo opaco dele é o que garante que o dashboard nunca pisque antes
          da senha conferir. */}
      {locked && (
        <LockScreen
          aparecer={!showSplash}
          onUnlock={() => setLocked(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {view === 'onboarding' && (
          <div key="onboarding" className="h-full">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        )}
        {view === 'main' && data.user && (
          <>
            <div key={contentKey}>
              {showEvolution ? (
                <ExerciseEvolution history={data.history} exerciseName={evolutionExercise} onClose={() => setEvolutionExercise(null)} />
              ) : editingWorkout ? (
                <WorkoutEditor workout={editingWorkout} onSave={handleSaveCustomWorkout} onClose={() => setEditingWorkout(null)} />
              ) : showLibrary ? (
                <Library onClose={() => setShowLibrary(false)} />
              ) : (
                <>
                  {activeTab === 'home' && <Dashboard data={data} plans={plans} onStartWorkout={handleStartWorkout} onNavigate={setActiveTab} idEmAndamento={idEmAndamento} />}
                  {activeTab === 'workouts' && <WorkoutsList data={data} plans={plans} onSelectWorkout={handleStartWorkout} onOpenLibrary={() => setShowLibrary(true)} onEditWorkout={setEditingWorkout} onResetWorkout={handleResetWorkout} idEmAndamento={idEmAndamento} />}
                  {activeTab === 'stats' && <Stats data={data} onSelectExercise={setEvolutionExercise} onNavigate={setActiveTab} />}
                  {activeTab === 'profile' && <Profile data={data} onReset={handleReset} onExport={handleExport} onChangePhoto={handleChangePhoto} onChangeRestTime={handleChangeRestTime} onChangeDivision={handleChangeDivision} />}
                </>
              )}
            </div>
            {!showLibrary && !editingWorkout && !showEvolution && <BottomNav active={activeTab} onChange={setActiveTab} userName={data.user.name} photo={data.photo} />}
          </>
        )}
        {view === 'workout' && activeWorkout && (
          <div key="workout" className="h-full">
            <ActiveWorkout
              data={data}
              workout={activeWorkout}
              resume={pausado?.workoutId === activeWorkout.id ? pausado : null}
              descansando={showRest}
              onFinish={handleFinishWorkout}
              onExit={handleExitWorkout}
              onShowRest={handleShowRest}
              onSaveNote={handleSaveNote}
            />
          </div>
        )}
        {view === 'finished' && finishedSummary && (
          <WorkoutFinished
            summary={finishedSummary}
            onClose={() => { setView('main'); setActiveTab('home'); setFinishedSummary(null); }}
            onSeeStats={() => { setView('main'); setActiveTab('stats'); setFinishedSummary(null); }}
          />
        )}
        {conflito && (
          <ConfirmSheet
            open
            danger
            title={`${nomeEmAndamento} em andamento`}
            message={pausado
              ? `Você parou no exercício ${(pausado.exerciseIdx ?? 0) + 1} de ${pausado.exercises?.length ?? 0}. Começar o ${conflito.name} agora descarta esse progresso.`
              : `Começar o ${conflito.name} agora descarta o progresso do ${nomeEmAndamento}.`}
            confirmLabel={`Começar ${conflito.name}`}
            cancelLabel="Continuar o de antes"
            onConfirm={() => { decisaoRef.current = 'novo'; }}
            onClose={() => {
              // onClose roda depois do onConfirm também, então a decisão fica no ref.
              const decisao = decisaoRef.current;
              decisaoRef.current = null;
              const novo = conflito;
              setConflito(null);
              if (decisao === 'novo') {
                setShowRest(false);
                setData(d => ({ ...d, inProgressWorkout: null }));
                abrirTreino(novo);
              } else if (activeWorkout) {
                setView('workout');
              } else {
                retomarPausado();
              }
            }}
          />
        )}
        {showRest && (
          <RestTimer
            restTime={data.restTime || 90}
            onSkip={handleRestDone}
            onDone={handleRestDone}
          />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <AppShell />
      </ConfirmProvider>
    </ThemeProvider>
  );
}
