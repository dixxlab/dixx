import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeContext';
import { ConfirmProvider } from './components/ui/ConfirmProvider';
import { ExerciseAnimStyles } from './components/ui/Figures';
import { SplashScreen } from './components/ui/Splash';
import { BottomNav } from './components/ui/BottomNav';
import { loadData, saveData, resetData, initialData } from './lib/storage';
import { getWorkoutPlans, divisionLabelToCount } from './lib/workouts';

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
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [evolutionExercise, setEvolutionExercise] = useState(null);

  const plans = getWorkoutPlans(data.customWorkouts).slice(0, data.divisionCount || 4);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { saveData(data); }, [data]);

  const handleOnboardingComplete = (userData) => {
    // A divisão escolhida no onboarding precisa virar divisionCount de fato,
    // senão o usuário escolhe "AB" e continua recebendo o plano ABCD padrão.
    const divisionCount = divisionLabelToCount(userData.division);
    setData({ ...data, user: userData, divisionCount });
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
  const contentKey = evolutionExercise || (editingWorkout ? 'edit' : (showLibrary ? 'library' : activeTab));

  return (
    <div
      className="w-full mx-auto relative overflow-hidden flex flex-col"
      style={{
        fontFamily: 'var(--font-ui)',
        minHeight: '100dvh',
        height: '100dvh',
        maxWidth: '500px',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <ExerciseAnimStyles />
      {showSplash && <SplashScreen key="splash" />}

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {view === 'onboarding' && (
          <div key="onboarding" className="h-full">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        )}
        {view === 'main' && data.user && (
          <>
            <motion.div
              key={contentKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {showEvolution ? (
                <ExerciseEvolution history={data.history} exerciseName={evolutionExercise} onClose={() => setEvolutionExercise(null)} />
              ) : editingWorkout ? (
                <WorkoutEditor workout={editingWorkout} onSave={handleSaveCustomWorkout} onClose={() => setEditingWorkout(null)} />
              ) : showLibrary ? (
                <Library onClose={() => setShowLibrary(false)} />
              ) : (
                <>
                  {activeTab === 'home' && <Dashboard data={data} plans={plans} onStartWorkout={handleStartWorkout} onNavigate={setActiveTab} />}
                  {activeTab === 'workouts' && <WorkoutsList data={data} plans={plans} onSelectWorkout={handleStartWorkout} onOpenLibrary={() => setShowLibrary(true)} onEditWorkout={setEditingWorkout} onResetWorkout={handleResetWorkout} />}
                  {activeTab === 'stats' && <Stats data={data} onSelectExercise={setEvolutionExercise} />}
                  {activeTab === 'profile' && <Profile data={data} onReset={handleReset} onExport={handleExport} onChangePhoto={handleChangePhoto} onChangeRestTime={handleChangeRestTime} onChangeDivision={handleChangeDivision} />}
                </>
              )}
            </motion.div>
            {!showLibrary && !editingWorkout && !showEvolution && <BottomNav active={activeTab} onChange={setActiveTab} />}
          </>
        )}
        {view === 'workout' && activeWorkout && (
          <div key="workout" className="h-full">
            <ActiveWorkout data={data} workout={activeWorkout} onFinish={handleFinishWorkout} onShowRest={handleShowRest} onSaveNote={handleSaveNote} />
          </div>
        )}
        {view === 'finished' && finishedSummary && <WorkoutFinished summary={finishedSummary} onClose={() => { setView('main'); setActiveTab('home'); setFinishedSummary(null); }} />}
        {showRest && <RestTimer restTime={data.restTime || 90} onSkip={handleRestDone} onDone={handleRestDone} />}
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
