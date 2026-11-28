# Suits — planejamento de novas áreas (v3 do plano · modelo de referência)

> Para o Claude Code. Base: **v1.1.2** no `main` (PR #20). O código está separado
> em `suits.html` + pasta `suits/`. **Leia primeiro o `CLAUDE.md` da raiz**, que tem
> o mapa dos arquivos; abra só os arquivos que a tarefa toca.
> A ordem importa: a **Etapa 0** é pré-requisito de todas as outras.
> Visão de produto (clientes, eventos, carreira): `docs/suits-visao.md`.
>
> ⚠ = ponto não confirmado na fonte oficial. Confira antes de usar ou deixe de fora.

---

## Onde estamos (retrato da v1.1.2)

**Histórico recente:**
- 1.1.0 (PR #18): rol de testemunhas, advogados adversários, atendimento sorteado,
  honorários sobre o proveito econômico.
- 1.1.1 (PR #19): correções do relatório de testes (`docs/suits-relatorio-testes-1.1.0.md`),
  com save v3. Feriados móveis, contrarrazões, acórdão, prazo de cumprimento,
  tutela na negativação, alternativas embaralhadas, gabarito comentado.
- 1.1.2 (PR #20): código separado em arquivos, `CLAUDE.md` e testes no repositório.

**Funciona e deve ser preservado:**
- Fatos escondidos no atendimento: `buildAtq` sorteia, por caso, qual pergunta
  candidata (`f:`) revela o fato, e garante que a pergunta que revela o fato
  cobrado na sentença está entre as oferecidas.
- Montador de Peças por blocos (`end`, `qual`, `fatos`, `fund`, `ped`, `valor`,
  `prov`, `prelim`, `imp`), com nota e feedback por bloco.
- Resposta ao juiz checada contra os fatos do caso (`factCheck`).
- Indicadores com retorno decrescente: o ponto custa 2x acima de 80 e 4x acima de
  90. Os chips de efeito mostram "(máx.)".
- Advogados adversários com estilo (`ADV`): proposta de acordo, aceite de
  contraproposta e chance de recurso.
- Baralho de modelos (`G.deck`): não repete o tipo de caso antes de esgotar os
  outros.
- Honorários: fixo + percentual sobre o **proveito econômico** (`proveito`,
  `feeOf`).
- Save: `KEY='suits_v1'`, `SAVE_VERSION=3`, `migrate()` **aditivo** (só acrescenta
  campos com padrão) e `postLoad()` para acertos que precisam do jogo carregado.
- Alternativas embaralhadas com semente estável (`sord`); o `data-v` guarda o
  índice original.
- Calendário com feriados nacionais fixos e móveis (Carnaval, Quinta e
  Sexta-feira Santa, Corpus Christi) e recesso de 20/12 a 20/1.

**Lições dos bugs da 1.0 (viram regra do motor):**
1. **Todo ato praticado baixa o próprio prazo.** Hoje isso é o mapa `PZF`
   (prazo → fase) em `submitForm`. O bug do "rol perdido" era um prazo cumprido
   que continuava aberto.
2. **Todo prazo aberto precisa ter uma ação na tela** (`syncFase`). Na agenda,
   cada prazo tem um botão de ação ("Apresentar rol", "Fazer réplica"…).
3. **Feedback nunca esconde a ação pendente** (`vCase` mostra os dois).
4. **Valor com uma fonte só.** Nenhuma tela recalcula o valor; todas leem do
   caso.
5. **Sentença e feedback têm que concordar com os fatos.** Se a sentença cita um
   fato, a pergunta que o revela existiu; se a sentença afasta um pedido por uma
   súmula, a resposta ao juiz que contraria a súmula não pode ser "firme".

**Dívidas técnicas que a Etapa 0 resolve** (contagem na v1.1.2, cresceu com as
correções da 1.1.1):
- `c.t==='…'`: 21 em `motor.js`, 5 em `telas.js` e 4 em `base.js`.
- `rito==='…'`: 28 em `motor.js` e 2 em `telas.js`.
- `lado==='…'`: 26 em `motor.js`, 9 em `telas.js` e 1 em `base.js`.
- As listas específicas de cada caso (`VEHS`, `WREL`, `PROCS`, `ITENS`…) ficaram
  em `dados/casos/_comum.js`. Elas devem ir para o arquivo do próprio caso.
- Funções que só conhecem os 3 casos: `partes`, `vara`, `computeSent` (regras de
  `neg`/`acid`/`saude` dentro dela), `recInfo`, `factCheck`, `COURT.despacho`
  (tutela da negativação), `COURT.contestRe`, `formDef('replica')`, `proveito`,
  `feeOf`, a checagem de urgência da cirurgia em `endDay`, os dilemas que
  procuram casos abertos (`EVT.who`) e o cabeçalho de valor em `vCase`.
- `FASE`, `ACT`, `PZF` e `COURT` assumem o processo civil.

**Pendências que continuam valendo:**
- **Textos de lei não conferidos.** O `planalto.gov.br` foi liberado na rede do
  ambiente, mas o servidor devolve resposta vazia para a sessão (o proxy
  conecta e o servidor não responde). A tela do Vade Mecum avisa "texto
  transcrito: conferência pendente" em todos os artigos. Ver "Conferência das
  leis" abaixo.
- A 2ª fase da OAB só tem a área Civil.
- O Montador só tem petição inicial e contestação (a emenda reabre os blocos da
  inicial). Réplica, recurso, contrarrazões, cumprimento e agravo são decisões em
  formulário.
- O banco da OAB tem 72 questões na 1ª fase e 12 na 2ª.
- Só existem 3 modelos de caso. As variações internas ajudam, mas a repetição
  ainda aparece depois de uns 6 casos. A Etapa 1 é a resposta.

---

## Como este plano se junta à visão de produto

O `docs/suits-visao.md` define **três pilares**: Advocacia (processos), Carreira
(trajetória) e Gestão (escritório, equipe, dinheiro). Toda funcionalidade nova
precisa fortalecer pelo menos um. Este plano cuida do pilar Advocacia (motor e
áreas do Direito). A visão cuida dos outros dois. As duas trilhas andam juntas,
na distribuição que a própria visão sugere:

| Versão | Trilha técnica (este plano) | Trilha de experiência (visão) | Pilar |
| --- | --- | --- | --- |
| 1.2.0 | Motor de ritos | Primeiro ciclo jogável + histórico de carreira + motor de eventos | Advocacia, Carreira |
| 1.3.0 | Cível ampliado | Clientes com personalidade e relacionamento | Advocacia, Carreira |
| 1.4.0 | Trabalhista | Eventos de rotina e dilemas sem resposta perfeita | Carreira |
| 1.5.0 | Criminal | Personagens recorrentes, rivalidade e casos especiais | Carreira |
| 1.6.0 | Previdenciário | Rede de contatos e clientes que voltam | Carreira, Gestão |
| 2.0.0 | Especialização e escritório | Níveis de carreira, escritório, equipe, Temporada 2 | Carreira, Gestão |

**Princípios da visão que viram regra de código:**
- **Decisão com consequência.** Toda escolha mexe em pelo menos um destes:
  caso, cliente, reputação, dinheiro ou carreira. E aparece no histórico.
- **Nem tudo é prova jurídica.** Eventos de comunicação, organização e
  negociação valem tanto quanto peças.
- **Nem todo dilema tem resposta certa.** Os eventos ganham opções com
  *trade-off* (custo e ganho diferentes), e não só certo e errado: `ok` deixa de
  ser obrigatório e o feedback mostra o que se ganhou e o que se perdeu.
- **Complexidade gradual.** Indicadores e sistemas novos aparecem quando a
  carreira chega neles. Ninguém vê "equipe" sendo associado júnior.
- **Narrativa nasce da mecânica.** Personagens reagem ao que o jogador fez
  (histórico), em vez de textos soltos.
- **Sem punição inexplicável.** Evento aleatório não pune o que o jogador não
  podia entender nem prevenir. Essa é a mesma lição do bug do rol.

---

## Cenário brasileiro atual (pesquisa de novembro de 2026)

O que mudou na advocacia e no Judiciário e ainda não está no jogo, com o lugar
de cada item no plano. Fontes ao final da seção. Tudo aqui também passa pela
**conferência das leis**: os itens com ⚠ tinham informação conflitante ou
secundária na pesquisa.

### Tecnologia e rotina do advogado

| Tema | Situação hoje | No jogo | Etapa |
| --- | --- | --- | --- |
| **IA generativa na advocacia** | Recomendação 001/2024 do CFOAB (diretrizes: revisão humana, sigilo, transparência com o cliente). Plano Nacional de IA na Advocacia (jun/2026). Em ago/2026, o CFOAB autorizou ações contra empresas de IA que praticam atos privativos. No Judiciário, Resolução CNJ 615/2025. | **Assistente de IA no escritório:** economiza horas na redação, mas a peça que não é revisada pode trazer jurisprudência inventada (sanção, juízo −, representação). Dilemas: colar dados do cliente numa IA pública (sigilo); avisar ou não o cliente; "robô-advogado" captando clientes. | 1.4 (dilemas) e 2.0 (ferramenta) |
| **Domicílio Judicial Eletrônico** | Obrigatório para pessoas jurídicas citadas e intimadas (Res. CNJ 455/2022; obrigatoriedade em 2025). Datas de adesão e multa variam entre as fontes ⚠. | Quando o réu é empresa, a citação é eletrônica e o prazo começa pela confirmação no Domicílio. Pegadinha: empresa que não se cadastrou. | 1.2 (motor de ritos: citação por tipo de réu) |
| **Feriado local no recurso** | Lei 14.939/2024: o tribunal manda corrigir a falta de prova de feriado local, em vez de declarar o recurso intempestivo (CPC, art. 1.003, §6º). STJ e STF divergem sobre a aplicação ⚠. | Feriados por comarca, e um evento "recurso no último dia, que era feriado municipal": o jogador precisa juntar a prova. | 1.2 (calendário) |
| **Tempo real dos processos** | Justiça em Números 2025 (dados de 2024): em média 2 anos e 9 meses na fase de conhecimento e 5 anos e 3 meses na execução. Um em cada quatro processos tem gratuidade. | O jogo comprime o tempo (um caso leva de 3 a 6 meses). Documentar o fator de compressão no balanceamento e mostrar ao jogador, no fim do caso, quanto tempo levaria na vida real. | Balanceamento |

### Direito material e processual que afeta os casos

| Tema | Situação hoje | No jogo | Etapa |
| --- | --- | --- | --- |
| **Juros e correção (Lei 14.905/2024)** | Correção pelo IPCA e juros legais pela Selic menos o IPCA (CC, arts. 389 e 406), com piso zero. STF validou a aplicação da Selic. | O bloco **`liquidacao`** do Montador (Etapa 2) e o cumprimento de sentença usam essa regra. Pegadinha: aplicar 1% ao mês, a regra antiga. | 1.3 e 1.4 |
| **Plano de saúde fora do rol da ANS** | STF, ADI 7265 (set/2025): a Lei 14.454/2022 é constitucional, mas a cobertura fora do rol exige **5 critérios cumulativos** e consulta obrigatória ao **NatJus** ⚠ (conferir a lista no acórdão). | Variação nova do caso do plano: procedimento **fora do rol**. A tutela fica mais difícil, e o jogador precisa reunir prescrição, evidência científica e parecer do NatJus. O caso atual, de doença preexistente, continua. | 1.3 |
| **Superendividamento** | Lei 14.181/2021 (repactuação global de dívidas preservando o mínimo existencial). Decreto 11.150/2022, alterado pelo 11.567/2023, fixou o mínimo existencial em valor fixo, contestado nos tribunais e no STF (ADPFs 1005 e 1006) ⚠. | **Caso novo do cível**, muito comum: cliente com vários empréstimos e cartões. Audiência de repactuação com todos os credores. Ótimo para o pilar "nem tudo é sentença". | 1.3 |
| **Desjudicialização de família** | Res. CNJ 571/2024: inventário e partilha em cartório mesmo com herdeiro menor ou incapaz. Divórcio em cartório com filhos menores só quando as questões dos filhos já foram resolvidas judicialmente. Advogado obrigatório no ato. | Nos casos de família, a primeira decisão é **cartório ou Judiciário**. Escolher o caminho certo poupa meses ao cliente e é o tipo de orientação que gera indicação. | 1.3 |
| **Honorários de sucumbência** | STJ, Tema 1076: a equidade só vale para proveito econômico inestimável ou irrisório, ou para valor da causa muito baixo. Nas demais causas, de 10% a 20% (CPC, art. 85, §2º ⚠). | `feeOf` usa 10% fixo; passa a usar a faixa de 10% a 20% conforme o desempenho, e a equidade nas causas de valor baixo. | 1.2 |
| **Pejotização (Tema 1389 do STF)** | Repercussão geral reconhecida em abr/2025; processos sobre o tema **suspensos no país todo** até o julgamento de mérito (competência, validade e ônus da prova). Sem julgamento final na pesquisa ⚠. | Caso trabalhista "PJ que era empregado": o processo fica **sobrestado**. Ensina a suspensão por repercussão geral e o que dizer ao cliente que espera. | 1.4 |
| **Reconhecimento de pessoas** | STJ (HC 598.886 e seguintes): o art. 226 do CPP não é mera recomendação; reconhecimento fora do rito, inclusive por foto, é nulo. Res. CNJ 484/2022. Reforçado pelo STJ em 2026. | Já previsto na Etapa 3. Ganha base mais firme. | 1.5 |
| **Juiz das garantias** | STF validou em 2023, com 12 meses prorrogáveis por mais 12 para implantar. Em 2025, cerca de 16 tribunais estaduais tinham implantado ⚠. | No criminal, o juiz do inquérito e o da ação podem ser diferentes conforme a comarca. Detalhe de realismo, não mecânica central. | 1.5 |
| **Benefício por incapacidade** | Novo Atestmed (Portaria Conjunta MPS/INSS 13/2026): a análise documental passa a ser a via prioritária, com benefício de até 90 dias sem perícia presencial ⚠. A fila da perícia caiu em 2026. | No previdenciário, o primeiro passo do auxílio por incapacidade é o pedido documental no INSS. Só depois da negativa vem a ação. | 1.6 |
| **Reforma do Código Civil** | PL 4/2025 em comissão no Senado (prazo até 22/12/2026), sem votação. Mais de 900 artigos alterados. | Nada muda agora. Mas o `VADE` precisa aceitar **vigência por data** (`vig:{de,ate}`), para o jogo poder trocar artigos quando uma lei mudar, sem quebrar saves. | 1.2 (estrutura do VADE) |

### Mercado e carreira

| Tema | Situação hoje | No jogo | Etapa |
| --- | --- | --- | --- |
| **Tamanho da advocacia** | Cerca de 1,5 milhão de advogados inscritos (Quadro da OAB, nov/2026). A OAB tem programas para a jovem advocacia. | O mercado é competitivo: o jogador recém-inscrito não tem clientes próprios, e por isso a carreira começa como associado. Na Temporada 2, a captação legítima (indicação, reputação, publicidade sóbria) é o que diferencia. | 2.0 |
| **Advocacia dativa** | Convênios com as seccionais, como o da OAB-SP, reajustado em 2026, pagam honorários tabelados pelo Estado. | **Fonte de renda do autônomo iniciante:** inscrever-se na advocacia dativa traz casos (muitos criminais e de família), com honorários baixos e fixos. É uma decisão de carreira com trade-off. | 2.0 |
| **Reforma tributária** | LC 214/2025: redução de 30% de IBS e CBS para profissões intelectuais regulamentadas, como a advocacia. 2026 é ano-teste e a CBS entra em 2027. Opção pelo Simples para 2027 em set/2026 ⚠. | Na gestão do escritório, uma decisão anual de **regime tributário** (Simples ou fora dele), com o custo visível. Sem planilha. | 2.0 |
| **Exame de Ordem** | Formato mantido (80 questões com 50% para aprovar; peça + 4 questões). 47º EOU em 2026. Reaproveitamento da 1ª fase para quem reprova na 2ª. Taxa por volta de R$ 350 ⚠. | O jogo já segue o formato e o reaproveitamento. Atualizar a taxa de reprovação (hoje R$ 300) depois de conferir o edital. | 1.2 |

**Fontes desta seção:**
- IA: [Recomendação do CFOAB sobre IA](https://www.oab.org.br/noticia/62711/confira-versao-final-da-recomendacao-do-cfoab-sobre-o-uso-de-ia-na-pratica-juridica), [Plano Nacional de IA na Advocacia](https://www.oab.org.br/noticia/64289/cfoab-lanca-o-plano-nacional-para-orientar-uso-da-ia-e-ampliar-oportunidades-para-a-advocacia), [OAB contra empresas de IA que praticam atos privativos](https://www.oab.org.br/util/print/64465?print=Noticia), [CNJ: norma de IA no Judiciário](https://www.oab.org.br/noticia/62921/nova-norma-do-cnj-define-regras-para-ia-no-judiciario-com-participacao-da-oab)
- Domicílio Judicial Eletrônico: [CNJ, cinco perguntas](https://www.cnj.jus.br/cinco-perguntas-para-entender-o-domicilio-judicial-eletronico/), [Migalhas](https://www.migalhas.com.br/depeso/431782/domicilio-judicial-eletronico-obrigatorio-a-pj-em-todos-os-tribunais)
- Feriado local: [Lei 14.939/2024](https://legis.senado.leg.br/norma/39385229), [AASP sobre o STJ](https://www.aasp.org.br/?p=82954)
- Tempo dos processos: [Justiça em Números 2025, sumário](https://www.cnj.jus.br/wp-content/uploads/2025/10/sumario-executivo-2025.pdf), [gratuidade](https://www.conjur.com.br/2025-set-25/um-em-cada-quatro-processos-tem-gratuidade-de-justica-no-brasil//?print=1)
- Juros: [Lei 14.905/2024](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/Lei/L14905.htm), [STF valida a Selic](https://www.conjur.com.br/2025-set-15/stf-valida-aplicacao-da-selic-para-correcao-de-dividas-civis//?print=1)
- Rol da ANS: [STF fixa critérios](https://noticias.stf.jus.br/postsnoticias/stf-fixa-criterios-para-que-planos-de-saude-cubram-tratamentos-fora-da-lista-da-ans/), [acórdão da ADI 7265](https://legis.senado.leg.br/norma/41502636)
- Superendividamento: [ConJur, mínimo existencial](https://www.conjur.com.br/2025-set-28/superendividamento-minimo-existencial-e-limite-de-repactuacao-de-divida//?print=1), [repactuação pode excluir juros](https://www.conjur.com.br/?p=884457)
- Família: [Resolução CNJ 571/2024](https://atos.cnj.jus.br/atos/detalhar/5705), [IBDFAM](https://ibdfam.org.br/noticias/12170)
- Honorários: [Tema 1076 do STJ](https://informativos.trilhante.com.br/temas-stj/tema-repetitivo-1076-stj)
- Pejotização: [Agência Brasil](https://agenciabrasil.ebc.com.br/justica/noticia/2025-04/stf-suspende-todas-acoes-do-pais-sobre-pejotizacao-de-trabalhadores), [ConJur](https://www.conjur.com.br/?p=843263)
- Reconhecimento de pessoas: [Resolução CNJ 484/2022](https://atos.cnj.jus.br/atos/detalhar/4883), [ConJur 2026](https://www.conjur.com.br/2026-abr-06/norma-do-cpp-sobre-reconhecimento-pessoal-nao-e-mera-recomendacao-reforca-stj//?print=1)
- Juiz das garantias: [STF proclama o resultado](https://noticias.stf.jus.br/postsnoticias/juiz-das-garantias-stf-proclama-resultado-do-julgamento/), [estudo UnB](https://periodicos.unb.br/index.php/redunb/article/download/58028/44111/226621)
- INSS: [Novo Atestmed](https://agenciagov.ebc.com.br/noticias/202603/novo-atestmed-acelera-a-decisao-de-analise-de-beneficios-por-incapacidade-temporaria), [fila da perícia](https://www.contabeis.com.br/noticias/77832/fila-da-pericia-do-inss-cai-59-em-2026/)
- Código Civil: [Agência Senado](https://www12.senado.leg.br/noticias/materias/2026/01/20/reforma-do-codigo-civil-pode-avancar-no-senado-em-2026), [PL 4/2025](https://www25.senado.leg.br/web/atividade/materias/-/materia/166998)
- Mercado: [Quadro de Advogados da OAB](https://www.oab.org.br/institucionalconselhofederal/quadroAdvogados), [advocacia dativa OAB-SP](https://www.oabsp.org.br/jornaldaadvocacia/26-03-02-1816-novo-convenio-da-advocacia-dativa-traz-reajustes-de-ate-antecipacao-de-honorarios-e-sistema-integrado-de-pagamento)
- Tributário: [OAB-SP, simulador](https://www.oabsp.org.br/jornaldaadvocacia/26-10-29-1807-oab-sp-lanca-simulador-gratuito-para-calcular-imposto-da-reforma-tributaria), [OAB, impacto da reforma](https://www.oab.org.br/noticia/62445/luta-por-justica-fiscal-o-impacto-da-reforma-tributaria-na-advocacia)
- Exame de Ordem: [cronograma do 47º e 48º EOU](https://www.oab.org.br/util/print/64207?print=Noticia)

---

## Conferência das leis (tarefa contínua, bloqueia cada versão)

1. Acrescentar ao `VADE` o campo **`ok:1`** por artigo conferido, e mostrar o
   selo "conferido" no Vade Mecum. Artigo sem `ok:1` mantém o aviso atual.
2. **Caminho para conferir:** pedir ao usuário que cole o trecho do Planalto (ou
   suba o HTML salvo da página). O Claude compara caractere por caractere e só
   então marca `ok:1`. Não tentar contornar o bloqueio do Planalto com
   user-agent falso: isso foi barrado pelo ambiente.
3. **Script de checagem:** ✅ feito: `tests/vade-refs.js`. Hoje acusa 414
   citações, todas no `VADE`, e 105 artigos ainda sem `ok:1`.
4. **Regra da versão:** uma área nova só vai para o `main` com os artigos dela
   conferidos, ou com o aviso explícito no CHANGELOG.

---

## Etapa 0 — Motor de ritos (refatoração, v1.2.0)

**Objetivo:** um caso novo entra só adicionando um template. Um rito novo entra
só adicionando uma entrada em `RITO`.

### 0.1 Registro de ritos

```js
const RITO = {
  comum:{ nome:'Procedimento comum', area:'civel', contagem:'uteis', recesso:'cpc220',
    orgao:c=>`${c.v.vara}ª Vara Cível de ${CITY()}`,
    prazos:{ contest:{n:15,a:['CPC-335']}, replica:{n:15,a:['CPC-350']}, rol:{n:15,a:['CPC-357']},
             emenda:{n:15,a:['CPC-321']}, recurso:{n:15,a:['CPC-1003']}, embargos:{n:5,a:['CPC-1023']},
             agravo:{n:15,a:['CPC-1015']} },
    recursos:{ sentenca:{nome:'Apelação',prazo:'recurso',preparo:'dobro'} },
    audiencias:['conc','aij'], pecas:['inicial','contest'] },
  jec:{ ... recursos:{sentenca:{nome:'Recurso inominado',n:10,preparo:'48h-desercao'}}, ausencia:{autor:'extincao',reu:'revelia'} },
  /* novos: trab_ord, trab_sum, penal_ord, jecrim, jef */
};
```

- `contagem: 'uteis' | 'corridos'`. `setPrazo(c, tipo)` lê `n`, `a` e a
  contagem do rito do caso. Não recebe mais o número solto.
- `recesso`: `'cpc220'` (20/12 a 20/1, CPC, art. 220), `'clt775A'` ⚠,
  `'cpp798A'` ⚠ (ver Etapa 3) ou `null`.
- `ausencia`: o que acontece quando cada lado falta à audiência. Hoje isso está
  espalhado em `missAud`.
- `recursos`: nome, prazo, preparo/depósito e efeito. As opções de "Recorrer?"
  passam a ser geradas daqui, e a pegadinha (o recurso do rito errado) sai de
  graça: as opções erradas são os recursos dos **outros** ritos.

### 0.2 Calendário

- `addCorridos(s,n)` ao lado de `addUteis`, e `diasAte(a,b,contagem)`
  generalizando `uteisAte`.
- Prazo corrido que **vence** em dia sem expediente é prorrogado para o
  próximo dia útil (CPP, art. 798, §3º ⚠). O jogo deve ensinar isso na caixa
  de cálculo da intimação (`prazoBox`).
- A caixa de cálculo e a agenda mostram "dias úteis" ou "dias corridos" ao lado
  de cada prazo.
- Feriados móveis: ✅ feito na 1.1.1 (`pascoa`, `movY`, `ferNome` em `base.js`).
  Falta só a tabela de feriados por UF/tribunal, se quiser.

### 0.3 Templates declaram tudo

Hooks novos do template (todos opcionais, com padrão no motor):

| Hook | Substitui |
| --- | --- |
| `rito`, `area`, `lado` | os ternários de rito e área |
| `partes(c) → {a, r}` | a função `partes` com `neg`/`acid`/`saude` |
| `orgao(c)` | `vara(c)` (sobrescreve o do rito) |
| `valorLbl(c) → [rótulo, valor]` | o cabeçalho "Dívida contestada / Valor cobrado / Custo" |
| `sent(c, base) → base` | as regras próprias dentro de `computeSent` (Súmula 385, culpa concorrente, obrigação de fazer) |
| `recTese(c) → {strong, tese, a}` | `recInfo` |
| `factCheck(c, fato, texto)` | o `if(fact==='s385')` atual |
| `contRe(c)` e `replica(c)` | o texto da contestação da ré e o formulário de réplica |
| `rol(c) → testemunhas conhecidas` | o formulário de saneamento do acidente |
| `witness(c) → etapa da AIJ` | o `perg` da própria testemunha |

### 0.4 `COURT` vira despachante

`COURT[evento](c)` passa a chamar `RITO[c.rito].on[evento]` quando existir e o
padrão do motor quando não existir. O cível atual vai inteiro para
`RITO.comum` e `RITO.jec`, **sem mudar o comportamento**.

### 0.5 Reputação por área e migração

- `G.repA = {civel, trab, penal, prev}`. A Reputação geral continua no topo.
- `migrate` (saveVersion 4): cria `repA` a partir do histórico. Para cada caso
  encerrado, soma na área do template o que `closeCase` deu de reputação. Não
  zera nada.
- Casos antigos sem `rito` válido no registro recebem `'comum'` ou `'jec'` (o
  que já tinham).

### 0.6 Testes

✅ Já estão no repositório (1.1.2):
- `tests/jogar.js`: robô em Playwright que joga uma carreira inteira (OAB e N
  processos), com detecção de loop e captura de erros de página.
- `tests/migracao.js <ref-git>`: gera um save na versão `<ref>`, carrega na atual
  e joga até o fim.
- `tests/vade-refs.js`: toda referência de lei existe no `VADE`.

Falta para a Etapa 0:
- **Teste de regressão com semente fixa:** trocar `Math.random` por um RNG com
  semente no modo `#dev`, jogar os 3 casos nos dois desfechos e comparar
  sentença, prazos e honorários com a v1.1.2.
- **Robô mais esperto:** hoje ele escolhe a primeira opção, que depois do
  embaralhamento é aleatória (perde muito e cai em indeferimento da inicial).
  No modo `#dev`, expor a resposta certa para o robô também testar o caminho da
  vitória.

**Aceite:** zero `c.t==='…'` fora dos templates; zero `rito==='…'` fora de
`RITO`; os testes passam; um save da 1.1.2 carrega e termina a carreira.

### 0.7 Primeiro ciclo jogável da visão (junto com a Etapa 0)

O `docs/suits-visao.md` pede um ciclo completo antes de crescer. O motor já tem
quase tudo; faltam três peças pequenas:
1. **Aceitar ou recusar o caso** no fim do atendimento (hoje todo caso é aceito).
   Recusar com orientação é a resposta certa para o caso prescrito da Etapa 1.
2. **Ficha do cliente:** promover `c.sat` a `confianca` e acrescentar `paciencia`
   e `expectativa` (esta já existe em parte: `c.expect` e `c.promise`). Os
   recados (`msgs.wait`) já escalam o tom.
3. **Consequência dias depois:** fila `G.ecos` com eventos agendados a partir do
   resultado (indicação de novo cliente, reclamação, cliente que volta com outro
   problema). Vai num arquivo novo, `suits/dados/ecos.js`.
4. **Histórico de carreira** (`G.hist`): cada decisão relevante vira uma linha
   (data, caso, decisão, consequência). Ele aparece numa aba "Carreira" e é a
   matéria-prima dos ecos, das promoções e das falas dos personagens ("você me
   explicou tudo daquela vez").
5. **Motor de eventos genérico:** hoje `EVT` só tem dilemas éticos. Ele passa a
   aceitar `categoria` (ética, rotina, cliente, colega, oportunidade),
   `condicao(G)` (quando pode aparecer), `custo` (horas e dinheiro, visíveis antes
   da escolha) e `eco` (consequência agendada). Os 8 dilemas atuais migram sem
   mudar o texto.

O ciclo da visão (seção 13) fica assim: mensagem → atendimento → aceitar ou
recusar → processo → decisão ou acordo → reação do cliente → registro no
histórico → eco dias depois.

---

## Etapa 1 — Cível ampliado (v1.3.0)

Valida o motor sem rito novo e traz as peças que as outras áreas vão reusar.

| Caso | Rito | Lição central | Fato escondido | Base |
| --- | --- | --- | --- | --- |
| Cobrança de dívida | comum ou jec | Prescrição: a dívida tem 6 anos | Data do vencimento (o cliente "acha" que foi recente) | CC, art. 206, §5º, I ⚠ |
| Despejo por falta de pagamento | comum (Lei do Inquilinato) | Liminar com caução; purgação da mora | O inquilino já purgou a mora uma vez | Lei 8.245, arts. 59, §1º, IX e 62 ⚠ |
| Alimentos | comum (Vara de Família) | Provisórios; prisão só pelas 3 últimas prestações | O devedor tem renda informal | Lei 5.478, art. 4º; CPC, art. 528; Súmula 309 do STJ ⚠ |
| Divórcio com guarda (lado réu) | comum (família) | Mediação; segredo de justiça | O cliente quer usar o filho como moeda (evento ético) | CPC, arts. 189, II e 693 a 699 ⚠ |

**Montador (novas peças, reutilizáveis):** réplica, apelação, contrarrazões,
embargos de declaração e cumprimento de sentença. O bloco novo **`vicio`**
(apontar omissão, contradição ou obscuridade num trecho da sentença) serve aos
embargos de todas as áreas.

**Pegadinha transversal nova:** a cobrança prescrita deve ser **recusada com
orientação** no atendimento (a decisão de recusar chega na 0.7).

### Clientes com personalidade (visão, seção 4)

- Ficha do cliente: **confiança**, **paciência**, **expectativa**, **condição
  financeira** e **perfil** (ansioso, desconfiado, prático, emotivo). Nem tudo
  aparece como número: o perfil muda o tom dos recados e das falas.
- A paciência controla a frequência e o tom dos recados (`msgs.wait` já escala)
  e o risco de o cliente trocar de advogado.
- A expectativa nasce do atendimento: prometer resultado sobe a expectativa e o
  tombo depois (`c.promise` já existe).
- **Resultado bem explicado segura o cliente mesmo na derrota.** Novo momento no
  fim do processo: "explicar a decisão ao cliente", com escolhas de comunicação.
- Satisfação alta gera **indicação** (eco); um cliente encerrado pode **voltar**
  com outro problema (template novo com `cliente` reaproveitado).
- Dilema da visão para esta versão: **cliente insatisfeito ameaça trocar de
  advogado** (explicar, renegociar a comunicação, propor acordo ou encerrar a
  relação de forma adequada, com o art. 112 do CPC já no Vade).

---

## Etapa 2 — Trabalhista (v1.4.0)

### Rito (CLT)

| Ponto | Regra | Base |
| --- | --- | --- |
| Prescrição | 2 anos após o fim do contrato para ajuizar, cobrando os últimos 5 | CF, art. 7º, XXIX; CLT, art. 11 ⚠ |
| Petição inicial | Pedido certo, determinado e **com valor**; sem valor, extinção sem resolução do mérito | CLT, art. 840, §§1º e 3º ⚠ |
| Sumaríssimo × ordinário | Até 40 salários mínimos: sumaríssimo, com no máximo **2** testemunhas por parte (no ordinário, **3**) | CLT, arts. 852-A, 852-H, §2º e 821 ⚠ |
| Audiência una | Reclamante ausente: **arquivamento** (e custas, salvo justificativa); reclamada ausente: **revelia e confissão** | CLT, art. 844 e §2º ⚠ |
| Conciliação | Proposta na abertura e de novo antes da sentença | CLT, arts. 846 e 850 ⚠ |
| Defesa | Na audiência (no PJe, até a audiência) | CLT, art. 847 ⚠ |
| Ônus da prova | Regra própria, com distribuição dinâmica | CLT, art. 818 ⚠ |
| Prazos | Dias úteis | CLT, art. 775 ⚠ |
| Recesso | 20/12 a 20/1 | CLT, art. 775-A ⚠ |
| Recurso ordinário | **8 dias**, com depósito recursal e custas | CLT, arts. 895 e 899 ⚠ |
| Embargos de declaração | 5 dias | CLT, art. 897-A ⚠ |
| Honorários | Sucumbência de 5% a 15%, inclusive recíproca | CLT, art. 791-A ⚠ |
| Justiça gratuita | Critério de renda próprio | CLT, art. 790, §§3º e 4º ⚠ |
| Jus postulandi | A parte pode atuar sem advogado, com limites | CLT, art. 791; Súmula 425 do TST ⚠ |

**Para o motor:** `RITO.trab_sum` e `RITO.trab_ord` com `ausencia:
{autor:'arquivamento', reu:'revelia_confissao'}`, `contagem:'uteis'`,
`recesso:'clt775A'` e o recurso ordinário com `deposito:true`.
**Honorários do jogador:** contratual (percentual do êxito, o padrão do
reclamante) mais sucumbência de 5% a 15% (`feeOf` ganha `sucPct` por rito).

### Casos (6)

| Caso | Lado | Lição | Fato escondido |
| --- | --- | --- | --- |
| Trabalho sem carteira | reclamante | Requisitos do vínculo (CLT, arts. 2º e 3º ⚠); prova testemunhal | Áudios do patrão cobrando horário (subordinação) |
| Verbas rescisórias atrasadas | reclamante | Multa do art. 477, §8º ⚠ | A data real do pagamento (extrato bancário) |
| Horas extras sem ponto | reclamante | Mais de 20 empregados exige controle; sem ele, vale a jornada alegada (CLT, art. 74, §2º; Súmula 338 do TST ⚠) | Quantos empregados a empresa tem |
| Insalubridade | reclamante | Perícia obrigatória (CLT, arts. 189 a 195 ⚠) | O EPI nunca foi entregue (sem ficha) |
| Rescisão indireta | reclamante | A justa causa do empregador (CLT, art. 483 ⚠) | Salário pago "por fora" |
| Assédio moral | reclamada | Dano extrapatrimonial com parâmetros (CLT, arts. 223-A a 223-G ⚠); preposto (art. 843, §1º ⚠) | O gerente já tinha outra queixa interna |

**Pegadinhas:** apelação em 15 dias no lugar do recurso ordinário em 8; recurso
sem depósito recursal (deserção); faltar à audiência una; arrolar 3 testemunhas
no sumaríssimo; pedido sem valor.

**Montador:** reclamação trabalhista com o bloco **`liquidacao`** (calcular cada
pedido: saldo de salário, aviso, 13º e férias proporcionais + 1/3, FGTS + 40%,
multa do 477), contestação e recurso ordinário. O bloco `valor` atual vira caso
particular de `liquidacao`.

**Ética nova:** o cliente pede para "aumentar um pouco" as horas extras na
inicial (alterar a verdade dos fatos; CPC, art. 80, II, já no Vade).

### Eventos de rotina e dilemas profissionais (visão, seções 3 e 8)

Entram pelo motor de eventos da 0.7, em `suits/dados/eventos.js`. Alguns
exemplos:
- a Dra. Marta pede que você assuma um processo delicado (mais carga, mais
  reputação se der certo);
- um colega pede ajuda para preparar uma audiência (custa horas e rende
  relacionamento);
- um erro administrativo exige retrabalho (protocolo no processo errado);
- fim de expediente: terminar a peça, estudar (Vade Mecum) ou ir para casa
  (estresse);
- proposta de outro escritório (salário maior × ficar com a Marta).

Dilemas com *trade-off*, e não com resposta única, nas categorias da visão:
comunicação de riscos, pressão por resultado, relação com colegas e organização
de prazos. Os dilemas que envolvem ética ou lei continuam com a resposta
juridicamente correta e o artigo.

**Vade novo:** CLT (só os artigos usados) e Súmulas do TST.

---

## Etapa 3 — Criminal: defesa (v1.5.0)

O jogador é **advogado de defesa**. O rival natural é o **Ministério Público**:
criar um promotor fixo, com o mesmo papel narrativo do Dr. Henrique Prado (placar
na tela do Painel), e um pool de promotores com estilo, como o `ADV`.

### Rito (CPP, procedimento comum ordinário)

| Fase | Regra | Base |
| --- | --- | --- |
| Flagrante e custódia | Relaxar flagrante ilegal, conceder liberdade provisória ou decretar preventiva | CPP, arts. 310 e 312 a 316 ⚠ |
| Habeas corpus | Contra prisão ilegal, a qualquer tempo | CF, art. 5º, LXVIII (já no Vade); CPP, arts. 647 e 648 ⚠ |
| ANPP | Antes da denúncia: sem violência ou grave ameaça, pena mínima abaixo de 4 anos, confissão | CPP, art. 28-A ⚠ |
| Resposta à acusação | **10 dias**, obrigatória; testemunhas arroladas aqui (última chance) | CPP, arts. 396 (já no Vade) e 396-A ⚠ |
| Absolvição sumária | Hipóteses taxativas | CPP, art. 397 ⚠ |
| AIJ | Ofendido, testemunhas de acusação, de defesa, peritos e **interrogatório por último** | CPP, art. 400 ⚠ |
| Alegações finais | 20 + 10 minutos orais, ou memoriais em 5 dias | CPP, art. 403 ⚠ |
| Apelação | **5 dias** para interpor (já no Vade) e 8 para as razões | CPP, arts. 593 e 600 ⚠ |
| Prazos | **Contínuos**, em dias corridos | CPP, art. 798 ⚠ |
| Recesso | Suspensão de 20/12 a 20/1, **exceto** réu preso, Maria da Penha e medidas urgentes | CPP, art. 798-A ⚠ (incluído pela Lei 14.365/2022) |

**Para o motor:** `RITO.penal_ord` com `contagem:'corridos'` e
`recesso:'cpp798A'`. A exceção do réu preso faz o recesso **depender do caso**:
`recesso` pode ser uma função `(c) => bool`. Prisão vira estado do cliente
(`c.preso`), que muda prazos, urgência e a satisfação da família semana a semana.

### JECrim (infração de menor potencial ofensivo)

- Transação penal e suspensão condicional do processo (Lei 9.099, arts. 61, 76
  e 89 ⚠).
- Na violência doméstica contra a mulher **não cabem** (Lei 11.340, art. 41;
  Súmula 536 do STJ ⚠).
- **Pegadinha a mais:** no JECrim a apelação é em **10 dias**, com razões juntas
  (Lei 9.099, art. 82, §1º ⚠). No CPP são 5 dias para interpor e 8 para as
  razões. É o mesmo tipo de erro do recurso inominado × apelação da Temporada 1.

### Casos (5)

| Caso | Lição | Fato escondido |
| --- | --- | --- |
| Furto de baixo valor | Insignificância (requisitos do STF); furto privilegiado (CP, art. 155, §2º ⚠) | Reincidência (pode derrubar a insignificância) |
| Porte de droga: uso × tráfico | Critérios de distinção; pedir desclassificação (Lei 11.343, arts. 28 e 33 ⚠) | A balança de precisão era do irmão |
| Roubo com reconhecimento por foto | Reconhecimento sem as formalidades não serve sozinho (CPP, art. 226 ⚠) | A vítima viu a foto antes, no grupo do bairro |
| Lesão em violência doméstica | Sem transação; medidas protetivas; ação incondicionada (Lei 11.340, art. 41; Súmulas 536 e 542 do STJ ⚠) | Descumprimento anterior de medida protetiva |
| Flagrante com entrada em casa sem mandado | Prova ilícita (CF, art. 5º, XI, já no Vade, e LVI; CPP, art. 157 ⚠) | O "consentimento" foi dado por um vizinho |

**Ética (eventos novos):**
- O cliente confessa ao advogado: há sigilo, e o advogado defende sem mentir ao
  juízo (CED, arts. 35 a 38 ⚠).
- A família pede para "dar um jeito" com a testemunha (CP, arts. 342 e 343, já
  no Vade; art. 344 ⚠).
- O cliente quer que você leve um celular para o presídio. Recusar: é crime (CP,
  art. 349-A ⚠).

**Montador:** resposta à acusação (com o bloco **`rol`** obrigatório),
pedido de liberdade provisória, memoriais e apelação.

**Ponte com o Distintivo:** os dois jogos estão no mesmo domínio do GitHub
Pages, então o Suits pode ler o save do Distintivo
(`localStorage['distintivo_v4']`, só leitura, dentro de `try/catch`). Se existir,
o caso do reconhecimento por foto vem "do inquérito de [cidade da carreira do
jogador no Distintivo]". Se o jogador cometeu esse erro como delegado, o caso
abre com uma fala sobre isso. Sem save do Distintivo, o caso usa uma cidade
padrão.

**Fica para depois:** Tribunal do Júri, em etapa própria.

### Personagens recorrentes e casos especiais (visão, seções 7 e 10)

- **Promotor fixo** como rival da área penal, com o mesmo papel narrativo do Dr.
  Prado. Os advogados de `ADV` passam a lembrar dos encontros anteriores
  (histórico): "da última vez você me tirou a testemunha na contradita".
- **Casos especiais** (raros, com regra própria): repercussão na cidade, alto
  valor, conflito de interesses, caso em que o melhor resultado é o acordo, caso
  que cruza áreas (o roubo com reconhecimento por foto + a ponte com o
  Distintivo). Exigem mais de uma habilidade: peça, audiência, imprensa e
  cliente. Deixam marca duradoura no histórico e na reputação.

---

## Etapa 4 — Previdenciário (v1.6.0)

- **Requerimento no INSS primeiro.** Sem pedido administrativo, em regra falta
  interesse de agir (STF, RE 631.240 ⚠). Pegadinha do atendimento: o cliente
  "já foi no INSS" e não há protocolo nenhum.
- **Juizado Especial Federal:** até 60 salários mínimos; recurso inominado em 10
  dias para a Turma Recursal (Lei 10.259, arts. 3º e 5º ⚠; Lei 9.099, art. 42,
  já no Vade). Prazos em dias úteis nos Juizados (Lei 9.099, art. 12-A ⚠); vale
  conferir e acrescentar esse artigo também ao JEC atual.
- **Casos:**
  - aposentadoria por idade rural, com prova testemunhal e início de prova
    material (Súmula 149 do STJ ⚠);
  - BPC/LOAS, com renda e perícia social (Lei 8.742, art. 20 ⚠);
  - auxílio por incapacidade, com perícia médica e quesitos;
  - revisão de benefício com decadência de 10 anos (Lei 8.213, art. 103 ⚠). É o
    "caso prescrito" da área: deve ser recusado com orientação.
- **Para o motor:** `RITO.jef` reaproveita o `jec` (dias úteis, recurso
  inominado). Muda o órgão, o teto (60 SM) e o réu (INSS, autarquia federal).
- **Montador:** petição inicial no JEF (com o bloco **`quesitos`** para a perícia)
  e recurso inominado.
- **Vade novo:** Lei 8.213, Lei 8.742 e Lei 10.259.

### Rede de contatos e clientes que voltam (visão, seções 4 e 11)

- **Contatos** (`G.rede`): pessoas conhecidas na carreira (ex-clientes, colegas,
  assistentes sociais, peritos, servidores). Elas indicam clientes, abrem portas
  e às vezes pedem favores (dilemas).
- O previdenciário é a área natural para isso: no interior, um cliente bem
  atendido traz a família e os vizinhos.

---

## Etapa 5 — Carreira: especialização e escritório (v2.0.0)

**Níveis de carreira (visão, seção 5).** O jogo deixa de ter só "associado":

| Nível | Posição | O que muda no jogo |
| --- | --- | --- |
| 1 | Bacharel | OAB (já existe) |
| 2 | Advogado júnior | Casos passados pela Dra. Marta, com revisão dela (hoje é isso) |
| 3 | Advogado pleno | Escolhe casos, atende sem supervisão, primeiros clientes próprios |
| 4 | Advogado sênior | Casos complexos e especiais; orienta um estagiário |
| 5 | Sócio | Participa do resultado do escritório e das decisões |
| 6 | Dono de escritório | Capta clientes, contrata, paga as contas |

A **promoção combina critérios**, nunca uma pontuação só: experiência (casos
encerrados), qualidade técnica (nota das peças e audiências), reputação, ética,
relação com clientes e prazos cumpridos. A Dra. Marta faz uma avaliação de
desempenho periódica que lê o histórico e explica o que falta.

**Temporadas (visão, seção 10):** a Temporada 1 (o começo) termina com a decisão
sobre o futuro. A Temporada 2 (independência) é esta etapa. A Temporada 3
(reconhecimento: casos grandes, concorrentes, tribunais superiores) e a 4
(legado: formar gente, finais diferentes de carreira) ficam depois que o ciclo
principal estiver sólido.

**Gestão sem planilha:** aluguel, sistemas e equipe aparecem como decisões
pontuais com consequência clara (contratar agora ou esperar, aceitar mais casos
ou não), e não como tabela de custos.

1. **2ª fase da OAB por área:** Civil, Trabalho ou Penal (a FGV oferece 7 áreas;
   o jogo começa com 3). A peça do exame vem da área escolhida e vira a primeira
   especialidade (`repA` inicial).
2. **Especialização:** a `repA` define o fluxo de clientes. O generalista recebe
   de tudo, com teto de reputação mais baixo. O especialista recebe causas
   maiores da área. O baralho de modelos (`G.deck`) passa a ser **ponderado por
   área**.
3. **Escritório autônomo:** captar clientes **sem captação vedada** (eventos de
   publicidade, Provimento 205/2021 do CFOAB ⚠), definir honorários e pagar
   aluguel. O salário de associado (R$ 1.050/semana) some; o caixa passa a
   depender só de honorários. Hoje o caixa só cresce: este é o momento de
   balancear.
4. **Equipe:** estagiário (pesquisa e protocolo, mas não assina sozinho;
   Estatuto, art. 3º, §2º ⚠) e associado (assume processos, com risco de perder
   prazo quando sobrecarregado: o motor já sabe gerar "prazo perdido").
5. **Agenda cruzada:** audiência trabalhista e criminal no mesmo dia, prazo
   corrido e prazo útil misturados. É aqui que o motor da Etapa 0 se paga.
6. **Migração (saveVersion 4):** quem está na carreira de associado continua
   associado. A Temporada 2 abre com o convite da Dra. Marta Albuquerque para
   sair do escritório (já anunciado no fim da Temporada 1).

---

## Balanceamento (rever a cada versão com o robô de testes)

Números da v1.1.0 em carreira simulada (antes do embaralhamento):
- 6 processos encerrados em cerca de 8 a 10 meses de jogo;
- Clientes chegava a 100 em 8 meses na 1.0 (corrigido na 1.1 com o custo de 4x
  acima de 90). Medir de novo: a regra é que **nenhum indicador chegue a 100
  antes da metade do 2º ano**;
- o caixa só cresce (salário de associado maior que o custo de vida). Ajustar na
  Etapa 5.

Com cada área nova, o robô de `tests/jogar.js` precisa saber jogar as peças e as
audiências dela. **Atualizar o robô faz parte do aceite.**

---

## Ideias para depois (sem ordem)

- **Fazenda Pública:** mandado de segurança (120 dias de decadência; Lei 12.016,
  art. 23 ⚠) e prazo em dobro para a Fazenda (CPC, art. 183 ⚠).
- **Tribunal do Júri:** pronúncia, plenário, debates e quesitação.
- **Tribunais superiores:** REsp/RE com prequestionamento.
- **Modo "audiência real":** o jogador digita o relatório de uma audiência que
  assistiu e o jogo transforma em caso jogável (combina com os relatórios de
  audiência da faculdade).
- **Feriados locais por comarca** (os móveis já entraram na 1.1.1).
- **Áreas da visão ainda sem etapa:** Empresarial e Administrativo.

---

## Ordem sugerida

| Versão | Etapa | Por que nessa ordem |
| --- | --- | --- |
| 1.2.0 | Motor de ritos + primeiro ciclo da visão | Sem o motor, cada área vira um monte de `if`; o ciclo prova que é uma carreira, não um banco de questões |
| 1.3.0 | Cível ampliado + peças novas no Montador | Valida o motor sem rito novo; as peças são reusadas pelas outras áreas |
| 1.4.0 | Trabalhista | Rito próprio, mas parecido com o cível (dias úteis) |
| 1.5.0 | Criminal (defesa) | Testa a contagem corrida, o recesso por caso e a lógica de partes (MP × réu) |
| 1.6.0 | Previdenciário | Reaproveita JEC/JEF |
| 2.0.0 | Especialização e escritório | Junta tudo na carreira |

## Aceite de cada funcionalidade de experiência (visão, seção 14)

- [ ] Fortalece pelo menos um pilar (Advocacia, Carreira ou Gestão).
- [ ] O jogador entende o que está acontecendo e por que decide.
- [ ] Custo de tempo e dinheiro visível antes da escolha.
- [ ] Consequência coerente e registrada no histórico.
- [ ] Nenhuma punição aleatória sem explicação.
- [ ] Não contradiz o estado do processo nem os fatos do caso.
- [ ] Save antigo continua funcionando (`tests/migracao.js`).
- [ ] Funciona no celular e no desktop.
- [ ] Passa na pergunta-guia: *isso faz o jogador sentir que vive uma carreira na
      advocacia, ou só acrescenta mais uma tela?*

## Aceite de cada área

- [ ] Pelo menos 4 casos, cada um com fatos escondidos (pergunta certa sorteada) e
      uma pegadinha jurídica.
- [ ] Rito completo até o trânsito em julgado ou o acordo.
- [ ] Todo prazo tem ação na tela e é baixado quando o ato é praticado.
- [ ] Prazos com a contagem certa (útil ou corrida) e o recesso certo, visíveis na
      agenda e explicados na caixa da intimação.
- [ ] Peças da área no Montador, com feedback por bloco.
- [ ] Recurso com tese coerente com a sentença; resposta ao juiz checada contra os
      fatos.
- [ ] 15 questões novas da área no banco da OAB.
- [ ] Todos os artigos novos no `VADE` e no `tests/vade-refs.js`, conferidos (`ok:1`)
      ou listados como pendentes no CHANGELOG.
- [ ] `migrate` aditivo, testado com um save da versão anterior (`tests/migracao.js`).
- [ ] Os 3 casos da Temporada 1 continuam funcionando igual.
