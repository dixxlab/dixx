export const STORAGE_KEY = 'dixx_data_v1';

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

export const saveData = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage indisponível/cheio, falha silenciosa */ }
};

export const resetData = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage indisponível */ }
};

export const initialData = { user: null, history: [], notes: {}, customWorkouts: {}, photo: null, restTime: 90, divisionCount: 4 };
