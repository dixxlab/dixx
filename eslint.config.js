import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Context + hook (ThemeContext, ConfirmProvider) e componente + factory de componentes
      // (Figures) no mesmo arquivo são padrões intencionais aqui — só afeta a granularidade
      // do Fast Refresh em dev, não é um bug.
      'react-refresh/only-export-components': 'off',
    },
  },
])
