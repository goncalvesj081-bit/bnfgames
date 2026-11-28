# Suits — planejamento de novas áreas (v2 do plano)

> Para o Claude Code. Base: `bnfgames/suits.html` **v1.1.0** (Temporada 1 — A Beca,
> com as correções do PR #18). Leia o arquivo inteiro antes de começar.
> A ordem importa: a **Etapa 0** é pré-requisito de todas as outras.
>
> ⚠ = ponto não confirmado na fonte oficial. Confira antes de usar ou deixe de fora.

---

## Onde estamos (retrato da v1.1.0)

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
- Save: `KEY='suits_v1'`, `saveVersion`, `migrate()` **aditivo** (só acrescenta
  campos com padrão) e `postLoad()` para acertos que precisam do jogo carregado.

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

**Dívidas técnicas que a Etapa 0 resolve** (contagem atual no código):
- 22 checagens `c.t==='…'` (11 `neg`, 8 `acid`, 3 `saude`), 21 `rito==='…'` e
  28 `lado==='…'`.
- Funções que só conhecem os 3 casos: `partes`, `vara`, `computeSent` (regras de
  `neg`/`acid`/`saude` dentro dela), `recInfo`, `factCheck`, `COURT.contestRe`,
  `formDef('replica')` e o cabeçalho de valor em `vCase`.
- `FASE`, `ACT`, `PZF` e `COURT` assumem o processo civil.

**Pendências que continuam valendo:**
- **Textos de lei não conferidos.** O `planalto.gov.br` foi liberado na rede do
  ambiente, mas o servidor devolve resposta vazia para a sessão (o proxy
  conecta e o servidor não responde). A tela do Vade Mecum avisa "texto
  transcrito: conferência pendente" em todos os artigos. Ver "Conferência das
  leis" abaixo.
- A 2ª fase da OAB só tem a área Civil.
- O Montador só tem petição inicial e contestação. Réplica, recurso,
  cumprimento e agravo são decisões em formulário.
- O banco da OAB tem 60 questões (distribuídas em 7 disciplinas).

---

## Conferência das leis (tarefa contínua, bloqueia cada versão)

1. Acrescentar ao `VADE` o campo **`ok:1`** por artigo conferido, e mostrar o
   selo "conferido" no Vade Mecum. Artigo sem `ok:1` mantém o aviso atual.
2. **Caminho para conferir:** pedir ao usuário que cole o trecho do Planalto (ou
   suba o HTML salvo da página). O Claude compara caractere por caractere e só
   então marca `ok:1`. Não tentar contornar o bloqueio do Planalto com
   user-agent falso: isso foi barrado pelo ambiente.
3. **Script de checagem** (`tests/vade-refs.js`): lista todo `lei('…')` e todo
   `a:['…']` usado no jogo e falha se algum não existir no `VADE`.
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
- Feriados: hoje só os nacionais fixos (`FER`). Carnaval e Corpus Christi não
  contam. Decidir na 0.2 se entram (cálculo da Páscoa) ou se o jogo assume
  isso com uma nota.

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
- `migrate` (saveVersion 3): cria `repA` a partir do histórico. Para cada caso
  encerrado, soma na área do template o que `closeCase` deu de reputação. Não
  zera nada.
- Casos antigos sem `rito` válido no registro recebem `'comum'` ou `'jec'` (o
  que já tinham).

### 0.6 Testes (entram no repositório)

Hoje os testes rodam fora do repositório. Commitar em `tests/`:
- `tests/play.js`: robô em Playwright que joga uma carreira inteira (OAB e N
  processos), com detecção de loop (mesmo estado por 3 ciclos → encerra o dia)
  e captura de erros de página.
- `tests/mig.js`: gera um save na versão anterior (`git show <tag>:suits.html`),
  carrega na nova e joga até o fim.
- `tests/vade-refs.js`: toda referência de lei existe no `VADE`.
- **Teste de regressão da 0:** sementes fixas (trocar `Math.random` por um RNG
  com semente no modo `#dev`) para jogar os 3 casos nos dois desfechos e comparar
  sentença, prazos e honorários com a v1.1.0.

**Aceite:** zero `c.t==='…'` fora dos templates; zero `rito==='…'` fora de
`RITO`; os testes passam; um save da 1.1 carrega e termina a carreira.

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
orientação** no atendimento. Recusar caso é uma decisão que o jogo ainda não tem.

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

---

## Etapa 5 — Carreira: especialização e escritório (v2.0.0)

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

Números da v1.1.0 em carreira simulada (o robô escolhe sempre a primeira opção):
- 6 processos encerrados em cerca de 8 a 10 meses de jogo;
- Clientes chegava a 100 em 8 meses na 1.0 (corrigido na 1.1 com o custo de 4x
  acima de 90). Medir de novo: a regra é que **nenhum indicador chegue a 100
  antes da metade do 2º ano**;
- o caixa só cresce (salário de associado maior que o custo de vida). Ajustar na
  Etapa 5.

Com cada área nova, o robô de `tests/play.js` precisa saber jogar as peças e as
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
- **Feriados móveis** (Carnaval, Sexta-feira Santa, Corpus Christi) e
  **feriados locais por comarca**.

---

## Ordem sugerida

| Versão | Etapa | Por que nessa ordem |
| --- | --- | --- |
| 1.2.0 | Motor de ritos + testes no repositório | Sem isso, cada área vira um monte de `if`, e sem teste a refatoração é às cegas |
| 1.3.0 | Cível ampliado + peças novas no Montador | Valida o motor sem rito novo; as peças são reusadas pelas outras áreas |
| 1.4.0 | Trabalhista | Rito próprio, mas parecido com o cível (dias úteis) |
| 1.5.0 | Criminal (defesa) | Testa a contagem corrida, o recesso por caso e a lógica de partes (MP × réu) |
| 1.6.0 | Previdenciário | Reaproveita JEC/JEF |
| 2.0.0 | Especialização e escritório | Junta tudo na carreira |

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
- [ ] `migrate` aditivo, testado com um save da versão anterior (`tests/mig.js`).
- [ ] Os 3 casos da Temporada 1 continuam funcionando igual.
