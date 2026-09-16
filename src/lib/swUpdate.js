/* O service worker serve o cache primeiro e só depois busca a versão nova. Sem
   ninguém reagindo a isso, o app abria sempre uma versão atrasada: você
   publicava, abria, não via mudança, e a versão nova só aparecia na abertura
   seguinte. Aqui a gente escuta o worker novo assumir e recarrega, pra troca
   acontecer na mesma abertura.

   A trava importa: nunca recarregar no meio de um treino. As séries em
   andamento vivem em memória e um reload apagaria tudo. Nesse caso a troca
   fica pendente e acontece assim que o treino termina. */

// Sem controller no boot é primeira visita: o worker assumindo não significa
// versão nova, e recarregar seria um refresh à toa.
const tinhaControllerNoBoot = typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller;

let versaoNovaPronta = false;
let jaRecarregou = false;
let podeRecarregar = () => false;

const tentarRecarregar = () => {
  if (!versaoNovaPronta || jaRecarregou || !podeRecarregar()) return;
  jaRecarregou = true;
  window.location.reload();
};

/* O App informa quando é seguro trocar (fora de treino e de onboarding). */
export const setPodeRecarregar = (fn) => {
  podeRecarregar = fn;
  tentarRecarregar();
};

export const watchServiceWorkerUpdate = () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!tinhaControllerNoBoot) return;
    versaoNovaPronta = true;
    tentarRecarregar();
  });
};
