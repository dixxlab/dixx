import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from './tokens';

const ThemeContext = createContext(null);

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && THEMES.some(t => t.id === stored)) return stored;
  } catch { /* storage indisponível */ }
  return DEFAULT_THEME;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      if (bg) meta.setAttribute('content', bg);
    }
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* storage indisponível */ }
  }, [theme]);

  const setTheme = (id) => {
    if (THEMES.some(t => t.id === id)) setThemeState(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
};
