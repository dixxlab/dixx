/* Senha única do app. Pra "expulsar" alguém com acesso, troca esse valor e
   publica de novo — quem tinha a senha antiga vai ser pedido a digitar a
   nova, e sem saber, fica travado pra sempre.

   Ela mora aqui, no código, e não nos dados salvos do usuário de propósito:
   dado salvo é por aparelho, então quem abrisse o link pela primeira vez num
   celular qualquer não teria senha nenhuma pra bater e entraria direto. */
export const APP_PASSWORD = '1234';

const KEY = 'dixx_unlocked_with';

/* O aparelho não guarda "já desbloqueou", guarda COM QUAL senha desbloqueou.
   É essa diferença que faz o expulsar funcionar: depois de trocar a senha
   acima, o valor gravado aqui continua sendo o antigo, deixa de bater, e o
   aparelho volta pra tela de senha sozinho na próxima abertura. */
export const isUnlocked = () => {
  try { return localStorage.getItem(KEY) === APP_PASSWORD; } catch { return false; }
};

export const unlock = () => {
  try { localStorage.setItem(KEY, APP_PASSWORD); } catch { /* storage indisponível */ }
};
