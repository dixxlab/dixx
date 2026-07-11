// Mapeia pros mesmos nomes que o antigo objeto `C` usava (bg, bgCard, primary...),
// só que cada valor agora é uma CSS variable — trocar o tema não exige re-render,
// só troca o atributo data-theme no <html> e a cascade CSS resolve tudo.
export const T = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-elevated)',
  bgInset: 'var(--bg-inset)',
  bgOverlay: 'var(--bg-overlay)',
  primary: 'var(--accent)',
  primaryDark: 'var(--accent-strong)',
  primarySoft: 'var(--accent-soft)',
  primaryOn: 'var(--accent-on)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  border: 'var(--border)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  success: 'var(--success)',
  radiusSm: 'var(--radius-sm)',
  radiusMd: 'var(--radius-md)',
  radiusLg: 'var(--radius-lg)',
  radiusXl: 'var(--radius-xl)',
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
  fontData: 'var(--font-data)',
  fontUi: 'var(--font-ui)',
};

export const THEMES = [
  { id: 'midnight', label: 'Meia-noite', description: 'Grafite profundo + azul gelo', swatchBg: '#08090b', swatchAccent: '#45c1ff' },
  { id: 'ember', label: 'Brasa', description: 'Grafite profundo + vermelho coral', swatchBg: '#0a0908', swatchAccent: '#fb4d4d' },
  { id: 'daylight', label: 'Claro', description: 'Fundo claro, minimalista', swatchBg: '#f7f7f8', swatchAccent: '#2563eb' },
];

export const DEFAULT_THEME = 'midnight';
export const THEME_STORAGE_KEY = 'dixx_theme_v1';
