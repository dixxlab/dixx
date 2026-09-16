# Sistema de design do Dixx

Regras que emergiram durante o redesign. **Leia antes de mexer em qualquer coisa
visual.** Elas existem porque o app já teve um estado em que cada tela era um
dialeto diferente — e porque, sem elas, o resultado volta a parecer template.

---

## 1. Hierarquia é tamanho e peso, nunca rótulo decorativo

Não usar label em caixa alta com `letter-spacing` como recurso de hierarquia. O
padrão `text-[10px] uppercase tracking-wider` foi removido de 30 lugares em 8
telas e não deve voltar.

Em vez disso:

- Título de seção → `<SectionTitle>` (15px, peso médio, cor `--text`, caixa de frase)
- Rótulo de um valor → texto pequeno, mudo, caixa de frase, logo abaixo do número

Caixa alta só é aceitável como tratamento tipográfico deliberado em escala
grande — o título herói da Dashboard a 40px na condensada. Nunca em 10px.

## 2. Um herói por tela; o resto é lista

Cada tela tem **um** elemento que carrega a escala. Todo o resto é linha.

O herói é uma faixa sangrada — `-mx-5 px-5`, fundo `--bg-elevated`, borda só em
cima e embaixo, sem raio. Ele se distingue por **escala e sangria**, não por
moldura. Ver `Dashboard.jsx`, `Stats.jsx`, `Profile.jsx`, `ExerciseEvolution.jsx`.

O resto usa `<ListRow>`: sem fundo, sem raio, divisor de 1px, linha de logbook.
Se uma tela tem dois blocos com o mesmo peso visual, um dos dois está errado.

## 3. Números na condensada, texto na neutra

- `--font-data` (Barlow Condensed, self-hosted em `public/fonts/`) — peso, PR,
  cronômetro, streak, contadores, volume, número de série, calendário, e o
  título herói de uma tela.
- `--font-ui` (stack do sistema) — todo o resto.

Não trocar a fonte do texto corrido. A personalidade vem dos números.

Valor e unidade são estruturados, não concatenados: `<Stat>`, `<StatRow>` e
`<RowValue unit="kg">` já resolvem isso, incluindo o respiro entre número e
unidade — sem ele, "96.0" colado em "1RM" lê como 96.01.

## 4. Metadado é estrutura, não frase

Nunca montar metadado com bullet: `{muscle} • {n} exercícios • ~{duration}min`
é o antipadrão. Vira par valor/rótulo via `<StatRow>`, ou slots distintos numa
`<ListRow>` (título, subtítulo, trailing).

## 5. Os stick figures são a assinatura visual

`Figures.jsx` é o ativo mais autoral do app. Usar em vez de ícone de estoque
sempre que couber:

- `<FigGlyph>` — versão estática, sem moldura, pra listas e marcas d'água
- `<ExerciseCard>` — versão animada com moldura, pra destaque
- `getDominantFig(exercises)` — o movimento mais frequente de um treino, pra dar
  assinatura própria a cada ficha

O selo "LIVE" do `ExerciseCard` é opt-in (`live`, padrão `false`): só faz
sentido onde algo acontece agora, ou seja, na série em execução.

## 6. Motion só quando comunica

Um momento proposital por interação. Vale manter:

- comemoração de PR (confete) e o ícone da tela de treino concluído
- o spring do check ao concluir série
- a barra de progresso do treino
- o slide do `Sheet` e a transição lateral entre passos do Onboarding
- a pílula da navegação inferior seguindo a aba tocada

Não vale: fade-in automático de entrada de tela ou de card. Foram removidos de
`App.jsx`, `InsightCard.jsx` e `WorkoutFinished.jsx` e não devem voltar.

## 7. Cor sai dos tokens, sempre

Nenhum hex literal em `src/components`. Tudo vem de `tokens.css` via o objeto
`T` de `tokens.js`.

Cuidado ao escolher: `--info` é **idêntico a `--accent`** nos três temas, então
usar os dois lado a lado produz elementos que parecem iguais. Pra série
categórica (chips de métrica, por exemplo) as quatro cores distintas são
`--accent`, `--warning`, `--success` e `--chart-alt`.

## 8. Antes de criar, procurar

`src/components/ui/` já tem: `SectionTitle`, `ListRow` + `RowValue`, `Stat` +
`StatRow`, `Figures` (`FigGlyph`, `ExerciseCard`, `getDominantFig`), `MuscleMap`,
`ExerciseDemo`, `Sheet`, `ConfirmSheet`, `SettingRow`, `SearchBar`, `Avatar`,
`Celebration`.

Se uma tela precisa de algo parecido com um desses, estender o existente em vez
de escrever um parecido ao lado. Já aconteceu de `RowMeta` nascer em
`WorkoutsList` duplicando `RowValue` — os dois viraram um só.

## 9. Voz

Direta, informal, segunda pessoa, de quem treina. "Máquina ocupada? Escolha o
que fazer", "Comece leve pra aprender execução", "Faço esse depois, vou pro
próximo".

Evitar o registro de app de bem-estar genérico — "Vamos te conhecer rapidinho"
é exatamente o tom a não usar.

Empty state é convite pra ação, não aviso cinza de ausência de dados.

## 10. Rede é opcional, menos na demonstração

O app é PWA e precisa funcionar offline na academia. Tudo que a execução do
treino precisa está no precache.

A exceção é a demonstração fotográfica (`ExerciseDemo`), que depende de rede na
primeira vez. Por isso o stick figure continua sendo o visual padrão, instantâneo
e offline, e a demonstração é sob demanda. As imagens ficam **fora** do precache
e entram num `CacheFirst` próprio (`dixx-demos-v1`), cacheando por exercício a
partir da primeira abertura — ver `vite.config.js`.

Se adicionar asset novo que precise funcionar offline, lembrar que o
`globPatterns` padrão do workbox **não inclui woff2**.
