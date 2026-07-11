import { createContext, useCallback, useContext, useState } from 'react';
import { ConfirmSheet } from './ConfirmSheet';

const ConfirmCtx = createContext(null);

// Substitui confirm()/alert() nativos por sheets no tema do app, disponíveis via hook em qualquer tela.
export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    setState({ ...opts, resolve, isAlert: false });
  }), []);

  const alertUser = useCallback((opts) => new Promise((resolve) => {
    setState({ ...opts, resolve, isAlert: true });
  }), []);

  const handleClose = () => { if (state) { state.resolve(false); setState(null); } };
  const handleConfirm = () => { if (state) state.resolve(true); };

  return (
    <ConfirmCtx.Provider value={{ confirm, alert: alertUser }}>
      {children}
      <ConfirmSheet
        open={!!state}
        title={state?.title}
        message={state?.message}
        danger={state?.danger}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        onConfirm={state?.isAlert ? undefined : handleConfirm}
        onClose={handleClose}
      />
    </ConfirmCtx.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm precisa estar dentro de <ConfirmProvider>');
  return ctx;
};
