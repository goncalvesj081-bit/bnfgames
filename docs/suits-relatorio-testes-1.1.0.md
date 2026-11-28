# SUITS (BNF GAMES) — Relatório de teste

**Versão testada:** 1.1.0 (`suits.html`, commit `89c5fc1` do repositório `bnfgames`)
**Data do teste:** 27/11/2026
**Como foi testado:** uma carreira completa jogada no navegador, da capa até junho de 2028 no calendário do jogo (cerca de 5 meses de jogo). Em paralelo, li o código-fonte para confirmar a causa de cada problema. As linhas citadas são do `suits.html` atual.

**O que a partida cobriu:**
- Tutorial de contagem de prazo
- 1ª fase da OAB (19/20) e 2ª fase (10,00)
- Posse
- 9 casos: 3 de negativação, 3 de acidente como réu e 3 de plano de saúde
- 4 acordos, 3 sentenças, apelação, cumprimento de sentença com penhora, emenda da inicial
- 1 prazo perdido de propósito (revelia)
- 7 dilemas éticos, incluindo uma representação no TED
- Montador com respostas erradas de propósito, para ver as notas e as consequências

**Segunda rodada (seção 8):** a mesma partida seguiu até abril de 2029, com os processos levados até o fim e sem aceitar acordo:
- 2 audiências de instrução no JEC (Cláudia e Fernanda) e 1 na Vara (Rodrigo)
- 3 apelações julgadas pelo TJ (Marcos provida; Vera provida; Raimundo e Kátia desprovidas)
- 1 caso de Súmula 385 até a sentença
- 1 cumprimento de sentença no JEC com penhora

Ao todo, 8 processos encerrados por sentença ou acórdão. Só o caminho dos embargos de declaração não apareceu: nenhuma sentença saiu com omissão.

> Ficou um save de teste no localStorage do navegador (`suits_v1`, personagem "Dr. `<i>João</i>` Teste"). Para jogar do zero, use **Nova carreira** na capa.

---

## Resumo: o que corrigir primeiro

| # | Problema | Gravidade |
|---|---|---|
| 0 | **Faltar à audiência de conciliação (fora do caso "autor no JEC") trava o `endDay` com erro de JavaScript** | **Crítica** |
| 1 | Calendário ignora Carnaval, Semana Santa e Corpus Christi: prazos vencem antes do que venceriam de verdade | Alta |
| 2 | Recorrer escolhendo o preparo "Não vou recorrer" passa sem deserção e ainda ganha "Boa decisão" | Alta |
| 3 | Nas questões da 2ª fase as alternativas não são embaralhadas, e a certa é a "B" em 6 de 8 | Alta |
| 4 | No Montador, a resposta certa de Endereçamento e Preliminares é sempre a primeira opção | Alta |
| 5 | A sentença mostra a data de hoje no jogo, não a data em que foi proferida | Média |
| 6 | O texto da sentença usa a perspectiva do jogador ("sua versão", "nota 10/10", "você foi surpreendido") | Média |
| 7 | Pedido de tutela de urgência na negativação nunca é decidido | Média |
| 8 | Contradição fixa no caso do plano: a criança "entrou no plano quando nasceu", mas o plano tem menos anos que ela | Média |
| 9 | Gênero errado em vários textos ("Doutor(a)", "o escrivão Jussara", "O juiz" com juíza, "Juiza" sem acento) | Média |
| 11 | Cumprimento de sentença e réu não atendido ficam parados indefinidamente, sem prazo (seção 8.1) | Média |
| 12 | Avaliador de texto livre não reconhece negação ("não cabe dano moral" conta como insistir) (seção 8.2) | Alta |
| 13 | Recurso da outra parte sem etapa de contrarrazões; acórdão sem conteúdo (seção 8.1) | Média |
| 10 | Os casos se repetem demais: só existem 3 modelos, com o mesmo texto | Melhoria |

---

## 1. Bugs de lógica e regras

### 1.0 Crash ao faltar à conciliação (Crítica)
- **Onde:** `missAud` (linha 1106), ramo `tp==='conc'`.
- **Causa:** `noDeal(c)` faz `c.aud=null`, e logo depois `G.pop.push({k:'miss', ..., ate:c.aud.d})` tenta ler `c.aud.d`.
- **Erro no console** (2 vezes na partida):
  ```
  TypeError: Cannot read properties of null (reading 'd')
      at missAud … at endDay … at act / fastForward
  ```
- **O que acontece:**
  - O `endDay` para no meio. A data não avança naquele clique, e o jogador acha que o botão falhou.
  - O modal "Audiência perdida" nunca aparece.
  - Ainda assim, a multa e as penalidades de Juízo e Clientes já foram aplicadas, e o processo já pulou para a contestação.
  - O `checkTED()`, o `save()` e o `render()` daquele dia não rodam.
  - Resultado: o jogador perde a audiência sem saber.
  - Aconteceu com a Vera (autora, Vara Cível) e com o Raimundo (réu).
- **Correção:** guardar a data antes de mexer no processo:
  ```js
  function missAud(c){const G=S.g,tp=c.aud.tp,dAud=c.aud.d; …
    G.pop.push({k:'miss',c:c.id,lbl:…,ate:dAud,t,a,ch:[]}) }
  ```
  Aproveitando: o `ch:[]` desse pop deveria receber os chips dos `bump` (Juízo −5, Clientes −10), que hoje não aparecem.

### 1.1 Feriados forenses que não existem no calendário (Alta)
- **Onde:** `FER` (linha 415) só tem feriados de data fixa. `isUtil` conta como útil todo dia que não é fim de semana, feriado fixo nem recesso.
- **O que acontece:** o jogo conta como dia útil a segunda e a terça de Carnaval, a Sexta-feira da Paixão e Corpus Christi. Pelo CPC, art. 216, também são feriados forenses os dias sem expediente forense.
- **Exemplos da partida:**
  - Contestação publicada em 17/02/2028 venceu em **09/03**. O cálculo contou 28/02 e 29/02, que são segunda e terça de Carnaval em 2028.
  - Réplica publicada em 28/03 venceu em **18/04**. O cálculo contou 14/04, Sexta-feira da Paixão em 2028.
  - O jogo também me deu expediente normal na segunda de Carnaval (28/02): atendi cliente e protocolei petição nesse dia.
- **Correção:** calcular a Páscoa por ano (algoritmo de Gauss ou Meeus) e derivar dela:
  - segunda e terça de Carnaval (Páscoa −48 e −47)
  - quinta e sexta da Semana Santa (−3 e −2)
  - Corpus Christi (+60)

  Como cada tribunal publica o próprio calendário, dá para deixar uma tabela por UF, começando por MG. Isso também vale para o tutorial (abril de 2027) e para a Agenda de prazos.

### 1.2 Recurso sem preparo é aceito (Alta, exploit)
- **Onde:** formulário "Depois da sentença" (linhas 1268–1272) e `donePos`.
- **O que acontece:**
  - Escolhi "Apelação, em 15 dias úteis" e, no preparo, "**Não vou recorrer**". Essa opção vale `ok:1` e grava `prepOK=1`.
  - Resultado: apelação interposta, sem deserção, sem pagar preparo em dobro, e com "Boa decisão".
  - O inverso também passa sem crítica: "Não recorrer" junto com "Recolher o preparo".
- **Correção:** só mostrar o grupo Preparo quando a escolha for recorrer, ou validar a coerência no `submitForm` e tratar a combinação incoerente como erro.

### 1.3 Pedido de tutela de urgência ignorado na negativação (Média)
- **Onde:** `COURT.despacho` (linha 1158).
- **O que acontece:** o Montador aceita e pontua o pedido "Tutela de urgência para excluir o nome do cadastro", mas o despacho só manda emendar ou citar. O juiz nunca decide a tutela, e o pedido some do processo.
- **Correção:** criar no despacho do caso `neg` uma decisão de tutela (deferida ou indeferida), parecida com a do caso de saúde. Seria uma boa chance de ensinar o agravo também no JEC, onde o caminho é outro (Enunciado 2 da Turma Recursal ou mandado de segurança, conforme o tribunal).

### 1.4 A sentença usa a data de hoje (Média)
- **Onde:** `sentText`, linha 1153: `fmtExt(S.g.date)`.
- **O que acontece:**
  - O autos registram "Sentença: parcialmente procedente" em **11/05**, mas o documento exibido trazia "26 de maio de 2028".
  - Cada vez que se usa "Reler a sentença", a data muda.
- **Correção:** usar `c.sentD`.

### 1.5 Audiência de conciliação do réu marcada pelo advogado, não pelo juízo (Média)
- **Onde:** `doneEstrat` (linha 1282): `audAt(c,'conc',RI(6,10))` quando `lado==='reu'`.
- **O que acontece:**
  - A audiência só é designada quando o jogador assina o contrato. Se o atendimento demora, a audiência demora junto, como se o escritório controlasse a pauta do juízo.
  - O prazo de 6 a 10 dias úteis depois da citação também é curto demais. O art. 334 do CPC pede pelo menos 30 dias de antecedência e citação com pelo menos 20 dias.
- **Correção:** designar a audiência no `newCase` dos casos de réu, com a data correndo independentemente do jogador.

### 1.6 Honorários cobrados sobre valor que a cliente não recebeu (Média)
- **Onde:** `proveito` (linha 1187) soma `c.v.div` em todo resultado de negativação, inclusive acordo.
- **O que acontece:** o contrato era "30% do que ela receber". Num acordo de R$ 700, o escritório cobrou **R$ 467**, que é 30% de 700 + 857. Os R$ 857 eram a dívida declarada inexistente: ela não recebeu esse dinheiro.
- **Correção:**
  - Mudar o texto do contrato para "30% do proveito econômico (inclui o débito cancelado)".
  - Ou tirar `c.v.div` do cálculo. Hoje texto e cálculo dizem coisas diferentes.

### 1.7 Opções erradas na Estratégia são corrigidas sem aviso (Baixa/Média)
- **O que acontece:**
  - Escolhi "Juizado" num caso de R$ 110.000. Levei a crítica, mas o processo seguiu no procedimento comum.
  - Escolhi "30% do valor da cirurgia". Levei penalidade de Ética, mas no acordo os honorários foram calculados como 20% do dano moral.
  - Escolhi "Esperar juntar mais documentos, sem pressa" num caso urgente. Não houve atraso nenhum.
- **Correção:** escolher uma linha.
  - Aplicar a escolha errada de verdade, com consequência: indeferimento por incompetência, contrato imoderado, atraso de dias.
  - Ou avisar na tela que "a Dra. Marta corrigiu sua decisão".

### 1.8 Cirurgia urgente sem prazo real (Média)
- **Onde:** `c.v.dias` só aparece no texto.
- **O que acontece:** "o médico marcou para daqui a 12 dias", mas nada acontece se a tutela sair depois dessa data. A urgência, que é o centro do caso, não tem efeito no jogo.
- **Correção:** guardar a data da cirurgia e comparar com a data da tutela ou do agravo. Se passar, o desfecho muda: cliente furiosa, dano moral maior, risco de representação.

### 1.9 Validações faltando no Montador (Baixa)
- "Escolha de 2 a 4 fundamentos" não é validado: dá para avançar com 1 ou nenhum. O `mNext` só valida `end`, `prelim`, `valor` e `imp`. A nota zera depois, mas o aviso deveria vir na hora, como acontece no valor da causa.
- Na Qualificação, Pedidos e Provas também dá para avançar sem marcar nada.

### 1.10 "Virar a noite" sugerido quando não está disponível (Baixa)
- **O que acontece:** com 2h restantes, o aviso diz "Encerre o dia ou **vire a noite**", mas o botão só aparece com menos de 2h (linha 1479: `G.h<2`).
- **Correção:** trocar a condição para `G.h < horas necessárias`, ou ajustar o texto do aviso.

### 1.11 Prazo de embargos invisível (Baixa)
- **O que acontece:**
  - Quando a sentença tem omissão, a única coisa que aparece na Agenda é a Apelação (15 dias).
  - Mas `donePos` declara os embargos intempestivos depois de 5 dias úteis.
  - O jogador pode olhar a agenda, achar que tem 15 dias e perder os embargos sem ter sido avisado.
- **Correção:** abrir também um prazo "Embargos de declaração (5 dias)" na agenda.

### 1.12 Código morto ou inalcançável (Baixa)
- `missPrazo` trata o tipo `cumpr`, mas `afterFinal` sempre zera o prazo antes do cumprimento. O cumprimento não tem prazo e pode ficar parado para sempre.
- O apagão de estresse (linha 1078) diz "Dois dias", mas pula só um. E o dia pulado não processa audiências: uma audiência marcada nesse dia vira falta sem que o jogador tenha tido chance de ir.

### 1.13 Ações sem bloqueio quando há um modal aberto (Baixa)
- `act('end')` e `act('ff')` não conferem se `S.g.pop.length > 0`. Na interface o overlay cobre os botões, então um jogador comum não consegue clicar.
- Ainda assim, com teclado ou um clique rápido, dá para avançar dias com um DJe ou uma audiência "Hoje" ainda na fila. Vale uma guarda simples: `if (S.g.pop.length) return;`.

---

## 2. Texto, narrativa e consistência

### 2.1 Gênero errado
| Texto | Onde | Correção |
|---|---|---|
| "Doutor(a), seu cliente admitiu..." | alegações, linha 886 | `DOUT()` capitalizado |
| "pagar o senhor(a)", "Vi como o(a) senhor(a) trabalha" | dilemas, linha 979 e outras | `g('a senhora','o senhor')` |
| "o escrivão **Jussara**" | linha 999: `pname(chance(.5))` com `f:false` fixo | sortear o sexo e usar "a escrivã" / "o escrivão" |
| "o farmacêutico, **Daniela** Almeida Cardoso" | linha 804: `testR:pname(chance(.5))` | concordar o artigo e a profissão com o sexo sorteado |
| "O juiz já se prepara..." e "O juiz anota..." com juíza (Dra. Regina) | linhas 875 e 790 | usar `c.juiz.f` |
| "Juiza de Direito" | linha 1153 | "Juíza" |
| "Meu cliente tem razão" (dito pela Dra. Lívia, que representa uma empresa) | linha 1015 | "Minha cliente" ou "A empresa" |
| "Dr., eu tô na rua..." / "Dr., meu primo..." | epílogo e dilema | "Doutor" por extenso na fala |

### 2.2 Contradições nos casos
- **Plano de saúde:** "Faz 3 anos. O Heitor entrou como dependente quando nasceu", sendo que Heitor tem 7 anos. Isso acontece em todo caso desse modelo: `idade:RI(5,9)` e `anos:RI(3,6)` (linha 894). Correção: `anos = idade` (desde o nascimento), ou mudar a fala para "entrou como dependente aos X anos".
- **Negativação:** a filha que vai morar com a cliente se chamava **Edna**, e a testemunha da cena no caixa também era "a Edna, minha vizinha". O nome da testemunha vem de `hashS(c.id)` (linha 722), sem conferir `c.v.neta`.
- **Dilemas com nomes que não existem:** "É Carlos Peixoto Pinto, parte contrária num dos seus processos", mas as partes contrárias reais eram Carlos Monteiro e duas empresas. O mesmo acontece com "Rogério não atende", "Márcio, um cliente" e "Josué". Correção: sortear entre partes e clientes reais da carreira (`who:e.who()` na linha 1069), ou dizer "um potencial cliente".
- **Alegações finais:** a juíza diz que "seu cliente admitiu no depoimento", mas o cliente não depôs em nenhum momento da AIJ.
- **Acidente:** "Eu bati na frente dele, do lado direito", em uma história em que o outro carro é que entrou na frente da van.
- **"Fim da Temporada 1":** a mensagem diz "três processos do começo ao fim", mas os três primeiros encerrados foram acordos.

### 2.3 Texto da sentença
- A sentença está em segunda pessoa e com linguagem de jogo: "(b) peça bem construída (**nota 10/10**); (c) as provas sustentaram **a sua** versão"; "você foi surpreendido pela inscrição anterior da cliente".
- Na defesa (réu), a frase "militam contra a pretensão autoral" lista os pontos do jogador ("peça bem construída").
- Na revelia, a sentença cita "peça com falhas (nota 5/10)", mas não houve peça: é o valor padrão `sc.peca=.5`.
- **Correção:** separar dois textos.
  - `F.t`: o feedback de jogo, que aparece em "Por que você venceu".
  - `F.j`: a frase do juiz, por exemplo "a ré não se desincumbiu do ônus de provar a contratação", "a prova testemunhal confirmou a dinâmica narrada na defesa".
- **Pontuação:** falta vírgula em "representado por sua mãe, Rosana Vieira[,] em face de...".

### 2.4 Detalhes de texto
- "**S.A..**" com ponto duplo (Linha Azul Telecomunicações S.A.., na linha 713 e na conciliação). Já existe `P.r.replace(/\.$/,'')` na sentença; dá para aplicar o mesmo nesses outros lugares.
- "Faltou pedir: declaração de inexistência do débito de **r$ 447**" e "Faltou: ... **cpf ou cnpj**": o `.toLowerCase()` nas linhas 1326 e 1333 estraga siglas. Melhor baixar só a primeira letra.
- "**1 atos**" no cabeçalho dos autos (linha 1580): falta o singular.
- "Horas hoje: **4.5h**": usar vírgula no padrão pt-BR.
- "Conciliação infrutífera **Prazo:** Contestação, até...": falta ponto entre o título do DJe e o prazo (linha 1037).
- "tem uma má-formação nos rins e precisa de uma cirurgia nos rins": repetição. A grafia recomendada é "malformação".
- "mudou de faixa sem dar seta e entrou na minha frente sem seta": "sem seta" repetido.
- O estilo do adversário aparece duas vezes no mesmo parágrafo da conciliação: logo depois do nome e de novo no card ao lado.
- O modal de falta em audiência diz "**Prazo perdido** · Audiência de conciliação" (linha 1591). Melhor: "Audiência perdida".
- Conciliação no JEC cita "CPC, art. 334". Lá a referência é Lei 9.099, arts. 16 e 21.
- Na conciliação da negativação sem dano moral pedido: "O pedido em dinheiro é de R$ 857". Os R$ 857 são o débito a declarar inexistente, não um pedido em dinheiro.
- Acordo do réu (pagou R$ 13.800 de R$ 22.500): o feedback diz "Acordo abaixo do que a causa valia... o cliente pode se arrepender". É a frase do autor; para o réu, o raciocínio é o inverso.
- Epílogo de acordo do réu mostra "Honorários do escritório: R$ 0", embora o fixo de R$ 3.000 já tenha sido pago. Vale mostrar "honorários fixos já recebidos".

---

## 3. Realismo jurídico

Nada disso quebra o jogo, mas ajudaria quem usa o jogo para estudar.

1. **Endereçamento:** a petição inicial não escolhe a vara ("Ao Juízo da 2ª Vara Cível"), porque a distribuição é por sorteio. O certo é "Ao Juízo de Direito de uma das Varas Cíveis da Comarca de...". Hoje a vara escolhida é sempre a que recebe o processo.
2. **Número CNJ antes do ajuizamento:** o caso aparece com número de processo ainda no atendimento ("Ainda não há processo: o caso está no escritório"). Melhor mostrar "—" até o protocolo.
3. **Quota litis (dilema "Metade da casa"):** o Código de Ética, art. 50, §1º, admite honorários em bem do cliente quando ele comprovadamente não tem dinheiro, que é exatamente a situação do dilema. A opção "Aceitar metade da casa" está certa em ser errada (50% + sucumbência passa da vantagem e não há contrato escrito), mas o feedback poderia citar o §1º para não ensinar que bem nunca pode.
4. **"Condenar o autor a pagar dano moral ao réu, aqui na contestação":** está como pegadinha, mas a **reconvenção** é feita justamente na contestação (CPC, art. 343). O cliente ficou duas semanas sem trabalhar: lucros cessantes em reconvenção seria uma opção legítima e interessante.
5. **Caso do plano de saúde:**
   - Faltam no Vade Mecum e nos fundamentos a **Lei 9.656/98** (art. 12, III, "b": recém-nascido incluído no plano sem carência nem cobertura parcial temporária; art. 35-C: cobertura obrigatória de urgência e emergência) e as **Súmulas 608 e 609 do STJ**.
   - A tese da réplica ("o plano não fez exame prévio nem provou má-fé") é literalmente a Súmula 609, mas o jogo cita só o art. 373.
6. **Qualificação de menor:** no caso de saúde o autor tem 7 anos, mas a qualificação pede estado civil e profissão. Falta a opção "qualificação do representante legal".
7. **Dinheiro do menor:** "transformar a vitória em dinheiro na conta de Rosana". A indenização é do filho; o normal é depósito em conta judicial ou poupança vinculada.
8. **Redistribuição no JEC:** errar o foro no Juizado leva à extinção (Lei 9.099, art. 51, III), não à redistribuição. E a incompetência relativa não é declarada de ofício (Súmula 33 do STJ).
9. **Rol de testemunhas com um nome só:** o formulário deixa arrolar apenas uma das duas testemunhas presenciais. O CPC permite até 10, sendo 3 por fato (art. 357, §6º).
10. **AIJ:** o depoimento pessoal pedido na contestação nunca acontece. A AIJ tem só contradita e a sua testemunha; não há reinquirição da testemunha contrária.
11. **Multa por falta à conciliação:**
    - A mensagem diz "multa de R$ X (2%)", mas o caixa do advogado perde **metade** de X.
    - A multa do art. 334, §8º, é da **parte**, não do advogado.
    - No caso de negativação, 2% de R$ 447 dá R$ 9, e o jogador perdeu R$ 5. A consequência real é praticamente nula.

---

## 4. Balanceamento e padrões exploráveis

- **Alternativas sem embaralhar:**
  - A 1ª fase embaralha (`perm`). A 2ª fase não (`vOab2`, linha 1457: `q.o.map((o,i)=>…)`), e em `D2` a certa é o índice 1 em 6 de 8 questões.
  - O Montador também não embaralha `opts` (Endereçamento e Preliminares: a certa é sempre a primeira).
  - Os formulários de Estratégia, Réplica e Pós-sentença também trazem a boa prática quase sempre em primeiro.
  - Isso se aprende em poucos casos. **Correção:** embaralhar na renderização, com uma semente por caso para a ordem não mudar a cada `render()`.
- **Banco de questões pequeno:**
  - São 63 questões na 1ª fase. Em algumas disciplinas o banco mal passa da cota por exame: Constitucional tem 5 para 2 por exame, Penal 5 para 2, Processo Penal 4 para 1.
  - Na 2ª fase são só 8 questões para 4 sorteadas, então quem repete a 2ª fase revê quase tudo.
  - Além disso, 51 das 63 questões da 1ª fase têm a resposta no índice 1 do banco. Não aparece para o jogador por causa do embaralhamento, mas o `data-v` no DOM entrega.
- **Montador generoso:** acertei 10/10 em todas as peças sem dificuldade depois da primeira. Os distratores são fáceis ("Código Civil de 1916", "Lei 8.245/91", "Prisão do diretor do plano"). Distratores mais finos ajudariam, por exemplo: Súmula 359 (já existe e é ótima), art. 42 do CDC, dano material sem prova, valor da causa contando juros.
- **Estresse irrelevante:** passei 5 meses de jogo com estresse 0 na maior parte do tempo. Com 8h por dia e poucos casos simultâneos, a pressão nunca aparece. Sugestão: mais casos simultâneos na Temporada 1, custo de estresse por audiência, ou um evento fixo de semana pesada.
- **Caixa sobe sem uso:** R$ 9.000+ em 4 meses, sem onde gastar até a "próxima atualização". Vale pensar em gastos: curso, terno, Vade Mecum novo, ajudar a cliente.

---

## 5. Interface e experiência

- **Feedback picado:** os chips de indicadores aparecem repetidos e sem somar, por exemplo "Ética −2, Ética −2, Clientes +2, Clientes −2" ou "Clientes +2, Juízo +1, Clientes +1". Somar por indicador antes de exibir (`chipsH`).
- **Emenda da inicial em um clique:** o despacho manda corrigir a qualificação, e "Emendar e protocolar" resolve sozinho, sem tocar no resto da peça (fundamentos e pedidos errados continuam). Seria mais interessante reabrir o Montador só nos blocos apontados.
- **Mensagens repetidas:** a cliente esquecida manda o mesmo recado várias vezes ("Minha neta perguntou do guarda-roupa de novo"). Variar o texto ou subir o tom a cada mensagem.
- **Exame da OAB:**
  - Não há revisão das questões no resultado, só o placar por disciplina. Um "ver gabarito comentado" ajudaria a estudar.
  - O cronômetro congela na tela enquanto a explicação está aberta, mas o tempo real continua correndo, porque o prazo é absoluto. Isso confunde. Sugestões: mostrar a correção só no fim, como no exame real, ou pausar de verdade.
  - Na 2ª fase, o feedback das questões mostra só o artigo, sem explicação (o `D2` não tem o campo `e`).
  - Faltam atalhos de teclado (A–D) e o tutorial de prazo não deixa tentar de novo.
- **Satisfação do cliente sem número:** na aba Clientes, a satisfação aparece só como barra. Bom mostrar o valor também, inclusive por acessibilidade.
- **Layout em tela larga:** no desktop (1470px), o painel ocupa cerca de 70% da largura e deixa uma faixa vazia à direita. O painel de "O rival" e os recados poderiam ocupar uma terceira coluna.
- **Carimbo da sentença:** o carimbo "PROCEDENTE" cai em cima do dispositivo e tapa o texto durante a leitura. Dá para posicioná-lo na margem ou reduzir a opacidade.

---

## 6. Ideias de melhoria (conteúdo e mecânica)

1. **Mais modelos de caso.** Hoje são 3 (`neg`, `acid`, `saude`) com o mesmo texto: mesma loja, "Farmácia Bom Preço", "Vida Plena Saúde", "eletricista autônomo", "Era pra minha filha que vai morar comigo". Em 5 meses joguei cada um 3 vezes. Candidatos naturais:
   - cobrança indevida/repetição em dobro (CDC 42)
   - vício do produto (CDC 18)
   - despejo por falta de pagamento (Lei 8.245)
   - alimentos
   - usucapião
   - atraso de voo
2. **Variações dentro do mesmo modelo:** sortear a dinâmica do acidente (sinal, faixa, traseira), o motivo da negativa do plano (carência, rol da ANS, preexistência) e o produto da negativação (empréstimo, cartão, telefone).
3. **Ligar os dilemas à carreira:** usar clientes e partes reais, como na seção 2.2. O dilema da repórter, por exemplo, poderia citar o caso de plano em andamento.
4. **Consequência da urgência no caso de saúde** (seção 1.8), incluindo a possibilidade de pedir o cumprimento da tutela e a multa diária se o plano descumprir.
5. **AIJ mais completa:** depoimento pessoal, reinquirição da testemunha contrária e indeferimento de pergunta indutiva (CPC 459) com custo para quem insiste.
6. **Calendário real por tribunal** (seção 1.1), com o selo "recesso forense" que já existe, mais "sem expediente: Carnaval".
7. **Mais conteúdo para estudo:** revisão do exame, glossário, e marcar no Vade Mecum onde cada artigo apareceu no jogo.

---

## 7. O que já funciona bem

- A **contagem de prazos** (exclui o início, inclui o vencimento, recesso de 20/12 a 20/01) está correta nos casos testados, e a caixa "Publicação → começa → vence" no DJe ensina bem.
- O **Montador** e a correção bloco a bloco com fundamento são excelentes como ferramenta de estudo. A pegadinha da Súmula 359 (notificação pelo órgão mantenedor) é muito boa.
- A **contradita da cunhada** (CPC 447) e a **Súmula 385** escondida no atendimento, que só aparece se você perguntar, são os melhores momentos do jogo: recompensam ouvir o cliente.
- A **correção das alegações finais** por palavras-chave com detecção de negação funcionou bem (88/100 em um texto bem escrito).
- Os **dilemas éticos** são bem escritos, com fundamento no Estatuto e no Código de Ética.
- O nome com HTML (`<i>João</i>`) foi escapado corretamente em toda a interface. O único erro de JavaScript da partida foi o da seção 1.0.
- O save com migração aditiva (`migrate`/`postLoad`) é uma boa prática.

---

## 8. Segunda rodada: processos jogados até o fim

Problemas novos que só apareceram nas fases finais (instrução, sentença, recurso e cumprimento).

### 8.1 Bugs de fluxo
- **Cumprimento de sentença parado sem limite.**
  - O processo da Cláudia transitou em julgado em 09/10/2028 e ficou em "Cumprimento de sentença" até 29/03/2029 (5 meses), sem prazo na agenda e sem nenhum lembrete. O "Avançar" passa por cima.
  - O mesmo acontece com o réu citado que não foi atendido: como a conciliação só é marcada no contrato (seção 1.5), o caso do Antônio ficou meses parado sem prazo correr.
  - **Correção:** criar um prazo "cumpr" ao transitar (o código já trata esse tipo em `missPrazo`) e designar a audiência do réu no ato da citação.
- **Contrarrazões automáticas.** Quando a outra parte recorre, `COURT.recRival` já escreve "O escritório apresentou contrarrazões" e manda os autos subirem. Falta a etapa do jogador: intimação para contrarrazões em 15 dias úteis (CPC, art. 1.010, §1º) ou em 10 dias no JEC (Lei 9.099, art. 42, §2º), com prazo na agenda e um formulário curto.
- **Acórdão vazio.**
  - O DJe diz apenas "O recurso foi PROVIDO. A decisão melhorou para o seu cliente". Não diz o que mudou, quem foi o relator nem qual tese foi acolhida.
  - O julgamento também é rápido demais: apelação interposta em 26/05 e acórdão publicado em 03/07.
  - **Sugestão:** um mini-acórdão (ementa e dispositivo) gerado a partir de `c.sent` antes e depois do julgamento.
- **Honorários R$ 0 em vitória parcial.** Kátia: a cirurgia de R$ 130.000 foi garantida, mas o dano moral foi negado. O contrato era "20% do dano moral", então o escritório recebeu R$ 0, e a parcial não tem sucumbência (`feeOf` só soma 10% quando `res==='proc'`). Pelo art. 86 do CPC, na sucumbência recíproca há honorários proporcionais.
- **Nota da peça arredondada para cima.** Uma inicial com dois blocos marcados ✗ (Fatos 9/10 e Pedidos 9/10) aparece no título como "NOTA 10/10" (`Math.round(sc*10)`). Mostre uma casa decimal ou arredonde para baixo.
- **O Montador entrega a prova antes da hora.** Na contestação do Rodrigo apareceu "Documental: vídeo da câmera de estabelecimento próximo", mesmo sem eu ter descoberto a câmera no atendimento. A opção só deveria aparecer se `c.rev.cam`.
- **Divisor de frases quebra em "art."**: `sentences()` corta em "art. 373", e o trecho destacado sai "pelo art.⏎373, I, do CPC". Trate as abreviações comuns (art., inc., fls., Dr., Dra.) antes de dividir.

### 8.2 Correção das respostas livres
- **Causa do erro relatado no item 9.4:** a regex `insists` do `factCheck` (linha 1388) não considera negação.
  - "Não **cabe dano moral**" casa com `/cabe dano moral/`.
  - "Não **merece indenização**" casa com `/merece (a )?indeniza/`.
  - Resultado: a resposta honesta é limitada a 40.
  - Já a `admits` exige palavras específicas ("reconhec", "se aplica", "legitim"…). Quem escreve "a súmula afasta o dano moral" não marca ponto.
  - **Correção:** passar cada termo por `negated()`, como o `gradeAlg` já faz, e aceitar "afasta" como admissão.
- **Pergunta do juiz repetida:** "Seu cliente admitiu no depoimento que poderia ter freado antes" saiu em todos os acidentes, mesmo sem depoimento do cliente na AIJ.
- **A juíza contradiz a audiência:** "A ré juntou a tela do sistema com o contrato. Isso não prova a contratação?", logo depois de a preposta dizer que "não há documento assinado". A pergunta do juiz deveria depender do que foi revelado na instrução.

### 8.3 Texto da sentença e dos recursos
- A sentença lista "(e) **sua boa relação com a vara pesou a favor**". Nenhum juiz escreveria isso; dá a entender favorecimento. Mantenha só no "Por que você venceu".
- **Tese de recurso errada com a Súmula 385.** Vera (inscrição anterior legítima, sentença improcedente): o feedback recomendou apelar dizendo que "a negativação indevida gera dano moral". O `recInfo` só considera `hid.outra` quando o resultado é `parc`.
- **Tese do réu revel cita fatos que nunca entraram no processo** ("a mudança de faixa sem seta e o uso do celular"). Na apelação do revel não cabem fatos novos (CPC, art. 1.014). A tese deveria ser outra (nulidade de citação, valor) ou o feedback deveria dizer que não há tese.
- **Epílogo de vitória parcial com fala de derrota:** "Volte quando tiver mais estrada, doutor" (Prado, na Fernanda). Em `vPop`, a frase do rival usa `w>=1`; parcial cai no ramo de derrota.
- **Cumprimento no JEC** acrescentou "multa de 10% **e honorários de 10%**". No Juizado não há honorários no 1º grau (Lei 9.099, art. 55). Vale conferir o enunciado do FONAJE sobre o art. 523, §1º.

### 8.4 Coerência dos fatos
- **Atendimento se contradiz:** "Não deu pra ver direito, foi tudo muito rápido" e, duas perguntas depois, "Tava olhando pra baixo, pro celular. Eu vi a luz da tela."
- **Extrato incompleto:** a cliente admite uma dívida da Lojas Primavera que "deve estar negativada até hoje", mas o extrato que ela mostra traz só a inscrição da Linha Azul. Se `hid.outra`, o extrato deveria mostrar as duas (e aí a pergunta do extrato também revelaria a Súmula 385).
- **A cunhada aparece em todos os acidentes** (mesma fala, "Sou cunhada dele. Irmã da esposa."). Em um caso ela tinha o mesmo sobrenome do réu (Ana Moraes × Rodrigo Barbosa Moraes), o que confunde de quem ela é parente.
- **Gênero:** "Com a palavra, o advogado do autor" (a cliente era autora); "**O** Dra. Cecília Monteiro entrega a contestação".
- **"Daqui a 12 dias"** continua igual na petição, mesmo depois de dias corridos desde o atendimento (seção 1.8).

---

## 9. Pendências da sua lista (para incluir na correção)

Regra do save, que vale para todas as correções: **não mudar a chave do localStorage (`suits_v1`), só acrescentar campos na `migrate()` subindo o `saveVersion`, e manter os IDs existentes.** O código já tem essa estrutura (`SAVE_VERSION=2`, `migrate`, `postLoad`); cada correção que precisar de campo novo entra como `saveVersion 3`.

Legenda: ✔ confirmei nesta partida · ↔ já está no relatório (seção) · ◻ não reproduzi, mas mantenho.

**🔴 Alta**
1. **Casos repetidos.** ✔ Só existem 3 modelos (`TPL_ORDER`), com texto quase fixo. O baralho evita repetir o mesmo tipo seguido, mas com 3 tipos a repetição é inevitável. ↔ 6.1 e 6.2. Precisa de mais modelos, não só de embaralhar.
2. **Atendimento previsível.** ✔ em parte. As perguntas oferecidas já são sorteadas (`buildAtq`), mas as respostas úteis são sempre as mesmas (câmera, ponto, orçamento). Sortear também qual fato existe em cada caso (`hid`) e garantir que todo fato usado na sentença tenha uma pergunta disponível.
3. **Interrupção do juiz igual.** ✔ ↔ 8.2. Banco de perguntas por tipo de ação, condicionado ao que foi revelado.
4. **Réplica e resposta ao juiz por palavra-chave.** ✔ Causa encontrada ↔ 8.2 (`factCheck` sem negação).
5. **Prazo do rol de testemunhas.** ◻ Na v1.1.0 o fluxo funcionou nos dois casos com saneamento ("Apresentar rol" na agenda e no processo). Vale um teste com save antigo, já que a `migrate()` mexe exatamente nisso (`c.jc`, `saneamento`).
6. **Contrarrazões.** ✔ ↔ 8.1.
7. **Resumo dos pedidos na ficha do processo.** Concordo. `c.mres.ped` já guarda os pedidos marcados; é só exibir no card do processo, nas alegações e na sentença.

**🟡 Média**
8. **Templates de sentença.** ✔ ↔ 2.3 e 8.3. Quando só há pontos contra, o texto começa por "Por outro lado…".
9. **Sobrenome do juiz igual ao da parte (CPC, art. 144).** ◻ Não vi com juiz, mas vi testemunha com o sobrenome do réu. Aplicar o filtro em `pname` para juiz, testemunhas e partes do mesmo caso.
10. **Nomes repetidos.** ✔ Lurdes e Denise apareceram como cliente e como testemunha em casos diferentes. Guardar os nomes já usados na carreira, não só o primeiro nome dos clientes abertos.
11. **Gênero nas perguntas.** ✔ ↔ 2.1 e 8.4.
12. **Pedido de citação na inicial.** ✔ Fui penalizado com "Faltou pedir: citação da ré". O CPC/2015 não exige isso no art. 319 (exigia o art. 282, VII, do CPC/73). Deixar neutro ou trocar por "opção pela audiência de conciliação" (art. 319, VII).
13. **Artigos do CPC/73 aceitos.** ◻ Faz sentido criar uma lista de artigos revogados no avaliador do texto livre (ex.: CPC/73 405 → 447, 282 → 319, 297 → 335) e dar feedback de "artigo do código revogado".
14. **Feedback de recurso sem tese.** ✔ ↔ 8.3 (recomendação contrária à Súmula 385).
15. **Valores inconsistentes (R$ 837 × R$ 857).** ◻ Não reproduzi; nos meus casos o valor bateu. Pode ser o `postLoad`/`migrate` regenerando `c.v` em save antigo; vale conferir.
16. **Honorários R$ 0 em vitória parcial.** ✔ ↔ 8.1.

**🟢 Baixa**
17. **Preparo aparece sem recurso.** ✔ ↔ 1.2 (além disso, hoje é um exploit). No JEC, mostrar o prazo de 48h após a interposição (Lei 9.099, art. 42, §1º).
18. **Contagem do "Fim da Temporada 1".** ✔ ↔ 2.2. O gatilho é `stats.closed===3`, que conta acordos. Ou o texto muda, ou o gatilho passa a contar só sentenças.
19. **Opções óbvias demais** ("a senhora gosta de trabalhar na empresa?"). ✔ Trocar por distratores plausíveis: pergunta indutiva, pergunta sobre fato já provado, pergunta que abre espaço para a preposta explicar.
20. **Protesto por prova testemunhal.** ✔ Já existe na v1.1.0: o bloco Provas da contestação explica que os nomes vão no rol depois (art. 357, §4º). Pode marcar como feito.
21. **Justa causa (CPC, art. 223).** Hoje só existe para o rol de testemunhas (`c.jc`, ação `jc`). Generalizar para qualquer prazo perdido, com chance menor quando a causa for do próprio advogado.

✅ **Já corrigido** (da sua lista): adversários variados com estilo próprio (Prado, Pacheco, Ramos, Assunção, Monteiro). Confirmado na partida.
