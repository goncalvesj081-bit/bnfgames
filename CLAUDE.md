# BNF GAMES

Portal de jogos em HTML puro, publicado pelo GitHub Pages. Não há etapa de build.
Cada jogo é um `.html` na raiz, e o card dele fica no `index.html`. O
`bnf-config.js` e o `bnf-analytics.js` são compartilhados por todos.

- Commits e PRs em português. Branch de trabalho, PR para o `main` e merge
  quando o usuário pedir.
- Não editar jogos que não fazem parte da tarefa.

## Suits (`suits.html` + pasta `suits/`)

Simulador de carreira na advocacia. Planos e decisões em `docs/`:
- `docs/suits-planejamento.md`: etapas técnicas (motor de ritos, áreas novas);
- `docs/suits-visao.md`: visão de produto (clientes, eventos, carreira);
- `docs/suits-relatorio-testes-*.md`: relatórios de teste do usuário.

### Como o código está organizado

São scripts clássicos carregados **em ordem** pelo `suits.html`. Eles
compartilham o escopo global: uma `const` de um arquivo é visível nos
seguintes. **Não** use o nome `top` em escopo global (`window.top` não é
configurável); o helper de rolagem se chama `toTop()`.

| Arquivo | Conteúdo |
| --- | --- |
| `suits/estilo.css` | Todo o CSS. Cores em `:root` (`--hd`, `--pr`, `--go`…) |
| `suits/base.js` | `VERSION`, `CHANGELOG`, `ROADMAP`, save (`KEY`, `migrate`), som, calendário (dias úteis, feriados fixos e móveis, recesso), nomes, UFs, rostos SVG e indicadores (`bump`, `fx`, `chipsH`) |
| `suits/dados/vade.js` | `VADE` (leis, com o texto), `refL`, `lei()`, `leis()` |
| `suits/dados/oab.js` | `QB` (1ª fase), `D2` (2ª fase), `DISC`, `DIST` |
| `suits/dados/casos/_comum.js` | Listas compartilhadas (`QUAL`, `VEHS`, `WREL`, `PROCS`…), `TPL={}` e `TPL_ORDER` |
| `suits/dados/casos/*.js` | Um template de caso por arquivo (`TPL.neg`, `TPL.acid`, `TPL.saude`) |
| `suits/dados/eventos.js` | `EVT`: dilemas éticos |
| `suits/motor.js` | Advogados adversários (`ADV`), criação de casos, `endDay`, prazos (`setPrazo`, `missPrazo`, `PZF`, `syncFase`), `COURT` (eventos do tribunal), sentença (`computeSent`, `sentText`), honorários (`proveito`, `feeOf`, `closeCase`), formulários de decisão (`formDef`), atendimento, Montador (`gradeBlock`, `protocol`), conciliação, AIJ e texto livre (`gradeAlg`, `gradeQ`, `factCheck`) |
| `suits/telas.js` | Todas as telas (`v*`), `render()`, `act()` (todas as ações por `data-a`) e a inicialização |

**Ao mudar a versão:** atualize `VERSION` em `base.js`, a entrada do
`CHANGELOG` **e** o `?v=` dos `<script>` no `suits.html`, para furar o cache do
GitHub Pages.

### Template de caso (`TPL.x`)

Campos: `nome`, `area`, `lado` ('autor'|'reu'), `peca` ('inicial'|'contest'),
`make()` (sorteia `cli`, `rito`, `v` e `hid`), `intro(c)`, `atq` (perguntas do
atendimento; `f:` marca o fato escondido e `a:(c,rv)` responde conforme a pergunta
revele ou não), `estrat(c)` (grupos de decisão), `mont(c)` (blocos do Montador:
`end`, `qual`, `fatos`, `fund`, `ped`, `valor`, `prov`, `prelim`, `imp`),
`base(c)` (força da tese), `val(c)`, `conc(c)`, `aij(c)`, `alg(c)` (palavras-chave e
pergunta do juiz), `dispo(c,r)`, `epi(c,w)` e `msgs`.
Ainda existem regras com `c.t==='…'` no motor; a Etapa 0 do planejamento move
essas regras para os templates.

### Regras que não podem quebrar

- **Save:** a chave `suits_v1` nunca muda. Campo novo entra em `migrate()`
  (`base.js`) subindo `SAVE_VERSION`, sempre de forma aditiva: nunca apagar,
  renomear ou trocar IDs. Acertos que precisam do jogo carregado vão em `postLoad()`.
- **Prazos:** todo prazo aberto tem uma ação na tela (`syncFase`, `PZF`), e o ato
  praticado baixa o próprio prazo (`submitForm`).
- **Leis:** todo artigo citado precisa existir no `VADE` (rode
  `node tests/vade-refs.js`). O texto deve ser conferido na fonte oficial; o
  Planalto não responde a este ambiente, então peça ao usuário que cole o
  trecho. Artigo conferido recebe `ok:1`.
- **Coerência:** a sentença e o feedback não podem contradizer os fatos do caso.
  Se a sentença cobra um fato, a pergunta que o revela existe no atendimento.
- **Alternativas:** a ordem de exibição é embaralhada com semente estável
  (`sord`). O `data-v` guarda o índice original, nunca a posição correta.

### Testes

```bash
node tests/vade-refs.js            # citações x VADE
node tests/jogar.js [pasta]        # robô (Playwright) joga uma carreira inteira; pasta para screenshots
node tests/migracao.js <ref-git>   # save gerado na versão <ref> carregado na atual e jogado até o fim
```
O jogo expõe `window.__suits` quando aberto com `#dev` na URL. O robô leva
alguns minutos; rode em segundo plano. Uma linha de console sobre
`ERR_TUNNEL_CONNECTION_FAILED` é o analytics sem rede, não é erro do jogo.
