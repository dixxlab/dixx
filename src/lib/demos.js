/* Demonstrações vêm do free-exercise-db (github.com/yuhonas/free-exercise-db),
   publicado sob a Unlicense — domínio público, sem exigência de atribuição ou
   licença viral. Foi essa a razão de não usar os forks do ExerciseDB: a licença
   deles cobre o código da API, não os GIFs, que vêm do dataset comercial.

   A base entrega dois quadros por exercício (início e fim do movimento) em vez
   de um GIF. Alternando os dois, o resultado lê como um loop de demonstração
   pesando ~140KB no total, contra 1-2MB de um GIF equivalente. */

/* Recebe o `gifUrl` do catálogo (a pasta do exercício no CDN) e devolve os dois
   quadros. Nada é baixado aqui: as URLs só viram requisição quando o usuário
   abre a demonstração e o <img> entra no DOM. */
export const getDemoFrames = (gifUrl) =>
  (gifUrl ? [`${gifUrl}/0.jpg`, `${gifUrl}/1.jpg`] : []);
