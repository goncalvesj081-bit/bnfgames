'use strict';
/* SUITS · caso: plano-saude
   Scripts clássicos compartilham o escopo global (carregados em ordem pelo suits.html).
   Mapa do código e regras: CLAUDE.md na raiz do repositório. */
TPL.saude={
  nome:'Plano de saúde nega cirurgia',area:'Saúde / Consumidor',lado:'autor',peca:'inicial',
  make(){const cli={n:pname(true),f:true,idade:RI(29,41),prof:pick(['operadora de caixa','recepcionista','professora','auxiliar administrativa'])};const filho=pick(['Davi','Miguel','Arthur','Heitor','Théo','Gael']);
    return {cli,rito:'comum',v:{plano:pick(PLANOS),filho,idade:RI(5,9),cir:RI(9,15)*10000,dm:pick([10000,15000,20000]),anos:RI(3,6),dias:RI(12,20),proc:RI(0,PROCS.length-1),renda:RI(2,3),vara:RI(1,30)},hid:{laudo:chance(.85),car:1,neg:chance(.8)}}},
  intro:c=>`<p>${esc(first(c.cli.n))} entra com uma pasta de exames abraçada contra o peito. O filho, ${esc(c.v.filho)}, de ${c.v.idade} anos, tem ${esc(PROC(c).d)} e precisa de uma ${esc(PROC(c).n)}. O médico marcou para ${fmtL(cirD(c))}${cirD(c)>S.g.date?`, daqui a ${Math.round((D0(cirD(c))-D0(S.g.date))/864e5)} dias`:': a data já passou'}.</p><p>"O plano negou, ${DOUT()}. Disseram que é doença preexistente. Eu pago a ${esc(c.v.plano)} todo mês, nunca atrasei. A cirurgia custa ${money(c.v.cir)}. Eu não tenho esse dinheiro. Eu não tenho nem metade."</p><p>Ela para, respira. "Ele pergunta toda noite se vai doer."</p>`,
  atq:[
    {id:'laudo',f:'laudo',q:'O médico escreveu no laudo que a cirurgia é urgente?',a:(c,rv)=>!c.hid.laudo?'"Ele falou que é urgente, mas no papel só pôs a indicação da cirurgia."':rv?'Ela procura na pasta e entrega: "Risco de agravamento do quadro em curto prazo. Indicação cirúrgica urgente." Assinado e carimbado.':'"Ele falou que é urgente... deve estar escrito em algum lugar aqui." A pasta tem trinta folhas.',good:1},
    {id:'risco',f:'laudo',q:'O que o médico disse que acontece se esperar?',a:(c,rv)=>!c.hid.laudo?'"Que é melhor não esperar. Mas não quis pôr no papel."':rv?'"Que pode piorar a qualquer momento. Eu pedi pra ele escrever." Ela acha o laudo: "indicação cirúrgica urgente, risco de agravamento".':'"Que é melhor não esperar." Ela não lembra de mais nada.',good:1},
    {id:'car',q:'Há quanto tempo vocês têm o plano?',a:c=>`"Eu tenho o plano há ${c.v.idade+1+hashS(c.id)%3} anos. O ${esc(c.v.filho)} entrou como dependente logo que nasceu, há ${c.v.idade} anos." Recém-nascido inscrito no prazo entra sem carência, e qualquer carência já passou faz tempo.`,rev:'car',good:1},
    {id:'neg',f:'neg',q:'A negativa veio por escrito?',a:(c,rv)=>!c.hid.neg?'"Foi por telefone. Eu anotei o protocolo, pelo menos."':rv?'Ela mostra um e-mail do plano: "Procedimento negado: doença ou lesão preexistente." Data e protocolo.':'"Acho que veio... não sei se eu apaguei."',good:1},
    {id:'como',f:'neg',q:'Como o plano comunicou a recusa?',a:(c,rv)=>!c.hid.neg?'"Uma moça ligou. Eu anotei o protocolo num papel."':rv?'"Mandaram e-mail. Tá aqui: procedimento negado, doença preexistente." Com data e protocolo.':'"Uma moça ligou, eu acho. Ou foi mensagem?"',good:1},
    {id:'renda',q:'Qual a renda da família?',a:c=>`"Eu ganho uns ${money((c.v.renda||2)*SM)}. O pai dele não ajuda." Isso conta para a gratuidade da justiça.`,rev:'renda',good:1},
    {id:'culpa',q:'A senhora escondeu alguma doença quando contratou?',a:()=>'Ela fica vermelha. "Como eu ia saber? Ele nasceu depois do contrato!" Pergunta pertinente, mas doeu.',good:.5,fx:[['cli',-1]]},
    {id:'imp',q:'A senhora já pensou em fazer pelo SUS?',a:()=>'"A fila é de oito meses. O médico disse que ele não tem oito meses."',good:0}
  ],
  estrat:c=>[
    {id:'rito',l:'Qual rito?',opts:[
      {l:'Procedimento comum, na Vara Cível, com tutela de urgência',d:`A cirurgia custa ${money(c.v.cir)}: acima do teto do Juizado.`,ok:1,fb:`Certo. O valor econômico (${money(c.v.cir)} + dano moral) passa de 40 salários mínimos (${money(40*SM)}), e a causa pode exigir perícia.`,a:['CPC-318','L9099-3'],set:c=>{c.rito='comum'}},
      {l:'Juizado Especial Cível',ok:0,fb:`O valor passa do teto do Juizado: 40 salários mínimos (${money(40*SM)}). E pode haver perícia médica, que o Juizado não comporta. A ${MENTOR.t} revisou e manteve a ação na Vara Cível.`,a:['L9099-3'],set:c=>{c.rito='comum'},fx:[['jz',-1]]}]},
    {id:'hon',l:'Honorários',opts:[
      {l:'20% do dano moral que ela receber, por escrito, e nada adiantado',ok:1,fb:'Ela não tem dinheiro agora e o que importa é a cirurgia. Honorário só sobre o êxito em dinheiro, por escrito.',a:['CED-48','CED-50'],set:c=>{c.hon={pct:.2,fixo:0,base:'dm'}}},
      {l:'R$ 5.000 adiantados, senão não dá',ok:0,fb:'Ela não tem. Exigir isso agora é deixar a criança sem a cirurgia.',fx:[['cli',-8],['rep',-1]],set:c=>{c.hon={pct:0,fixo:5000}}},
      {l:'30% do valor da cirurgia',ok:0,fb:'A cirurgia é obrigação de fazer: o plano paga o hospital, não a cliente. Cobrar percentual sobre ela é tirar da mãe um dinheiro que ela nunca vai ver. Honorário imoderado. A ${MENTOR.t} refez o contrato: 20% do dano moral.',a:['CED-50'],fx:[['et',-3],['cli',-5]],set:c=>{c.hon={pct:.2,fixo:0,base:'dm'}}}]},
    {id:'proc',l:'Procuração e urgência',opts:[
      {l:'Colher a procuração e protocolar ainda esta semana',ok:1,fb:'Urgência real exige agilidade.',a:['EAOAB-5'],fx:[['cli',3]]},
      {l:'Esperar juntar mais documentos, sem pressa',ok:0,fb:'A cirurgia está marcada. Demorar é deixar o perigo de dano acontecer. Você perdeu 4 dias úteis.',fx:[['cli',-4]],set:c=>{c.slow=1}}]}
  ],
  mont:c=>[
    {k:'end',t:'Endereçamento',a:['CPC-319'],opts:[
      {l:`Ao Juízo de Direito de uma das Varas Cíveis da Comarca de ${CITY()}`,ok:1},
      {l:`Ao Juizado Especial Cível de ${CITY()}`,ok:0,why:`Valor acima do teto do Juizado (${money(40*SM)}).`},
      {l:`Ao Juízo da Vara de Família de ${CITY()}`,ok:0,why:'Não é causa de família: é contrato de plano de saúde.'},
      {l:`Ao Juízo da Vara da Fazenda Pública de ${CITY()}`,ok:0,why:'O plano é empresa privada. Fazenda Pública seria contra o Estado (ex.: SUS).'}]},
    {k:'qual',t:'Qualificação das partes',a:['CPC-319'],items:QUALM},
    {k:'fatos',t:'Fatos',a:['CPC-319'],items:[
      {id:'a1',t:`O autor, ${c.v.filho}, de ${c.v.idade} anos, é beneficiário dependente da ré desde o nascimento, com mensalidades em dia.`,rel:1,o:1},
      {id:'a2',t:'O médico assistente indicou '+PROC(c).n+(c.rev.laudo&&c.hid.laudo?', com laudo atestando urgência e risco de agravamento.':'.'),rel:1,o:2},
      {id:'a3',t:'A ré negou a cobertura alegando doença preexistente'+(c.rev.neg&&c.hid.neg?', por e-mail.':'.'),rel:1,o:3},
      {id:'a4',t:`A cirurgia está marcada para ${fmtD(cirD(c))} e custa ${money(c.v.cir)}, valor que a família não tem.`,rel:1,o:4},
      {id:'a5',t:'O pai da criança não paga pensão.',rel:0,why:'Assunto de outra ação (alimentos). Aqui só desvia o foco.'},
      {id:'a6',t:'A mãe pensou em fazer pelo SUS, mas desistiu.',rel:0,why:'Não ajuda e pode sugerir que existe alternativa.'}]},
    {k:'fund',t:'Fundamentos jurídicos',a:['CPC-319'],opts:[
      {l:'CPC, art. 300: tutela de urgência (probabilidade do direito e perigo de dano)',ok:1,a:['CPC-300']},
      {l:'CDC, art. 14: responsabilidade do fornecedor de serviços',ok:1,a:['CDC-14']},
      {l:'CDC, art. 6º, VIII: inversão do ônus da prova',ok:1,a:['CDC-6']},
      {l:'CC, arts. 186 e 927: dano moral pela recusa indevida',ok:.7,a:['CC-186','CC-927']},
      {l:'Súmula 609 do STJ: recusa por preexistência, sem exame prévio, é ilícita',ok:1,a:['SUM-STJ609']},
      {l:'Lei 9.656, art. 35-C: cobertura obrigatória de urgência',ok:1,a:['L9656-35C']},
      {l:'CPC, art. 1.015, I: agravo de instrumento',ok:0,why:'Agravo é recurso. Não se fundamenta a inicial nele.'},
      {l:'Súmula 385 do STJ',ok:0,why:'Súmula sobre negativação. Nada a ver.'},
      {l:'CC, art. 206, §3º, V: prescrição em 3 anos',ok:0,why:'Prescrição é matéria de defesa e nem se aplica aqui.'},
      {l:'Lei 9.099, art. 3º',ok:0,why:'Lei do Juizado. A causa vai para a Vara Cível.'}]},
    {k:'ped',t:'Pedidos',a:['CPC-319','CPC-292'],opts:[
      {id:'tut',l:'Tutela de urgência: autorizar a cirurgia em 48 horas, sob multa diária',ok:1,a:['CPC-300']},
      {id:'cit',l:'Citação da ré',ok:.5,why:'Neutro: o CPC/2015 não exige pedido de citação (o art. 319 não o lista; quem exigia era o CPC/73). Não pesa na nota.'},
      {id:'obr',l:`Procedência, confirmando a obrigação de custear a cirurgia (${money(c.v.cir)})`,ok:1,val:c.v.cir},
      {id:'dm',l:`Dano moral de ${money(c.v.dm)}`,ok:1,val:c.v.dm},
      {id:'grat',l:'Gratuidade da justiça',ok:1,a:['CPC-98']},
      {id:'suc',l:'Condenação da ré em custas e honorários de sucumbência',ok:1,a:['EAOAB-23']},
      {id:'pris',l:'Prisão do diretor do plano em caso de descumprimento',ok:0,why:'Não há prisão civil por isso. O meio coercitivo é a multa.'}]},
    {k:'valor',t:'Valor da causa',a:['CPC-292']},
    {k:'prov',t:'Provas e audiência',a:['CPC-319'],opts:[
      {l:'Documental: laudo, negativa, contrato e comprovantes de pagamento',ok:1},
      {l:'Perícia médica, se necessária',ok:1},
      {l:'Opção pela audiência de conciliação',ok:1,a:['CPC-319','CPC-334']},
      {l:'Testemunhal: vizinhos que conhecem a família',ok:0,why:'Não provam nada sobre a cobertura. Prova inútil.'}]}
  ],
  base(c){let t=.62;if(c.hid.laudo)t+=.12;if(c.hid.neg)t+=.04;return t},
  val(c){return c.v.dm},
  conc(c){return {txt:`A ${c.v.plano} propõe manter a cirurgia autorizada e pagar`,demand:c.v.dm}},
  alg(){return null},
  dispo(c,r){const L=[`confirmar a tutela e condenar a ré a custear integralmente a cirurgia indicada`];if(r.dm)L.push(`condenar a ré a pagar ${money(r.dm)} a título de danos morais`);return L},
  epi(c,w){return w?`<p>Na véspera da alta, ${esc(first(c.cli.n))} manda um desenho por foto. Um boneco de jaleco, outro de terno e gravata, e um menino no meio, de mãos dadas com os dois.</p><p>Embaixo, em letra de criança: <b>"obrigado doutor do papel"</b>.</p>`:`<p>A cirurgia foi feita: a liminar garantiu. Mas a sentença negou o resto, e ${esc(first(c.cli.n))} vai ter que lidar com a cobrança do hospital.</p><p>Ela agradece mesmo assim. "Ele tá vivo, ${DOUT()}. O resto a gente vê."</p>`},
  msgs:{wait:(c,n)=>[`${DRF()}, desculpa a hora. O ${c.v.filho} teve falta de ar hoje de novo. Sai a liminar?`,`${DRF()}, a cirurgia é dia ${fmtDs(cirD(c))}. Já entraram com o pedido?`,`${DRF()}, pelo amor de Deus. Ele não pode esperar. Me liga.`][Math.min(n||0,2)],aud:c=>'O hospital ligou perguntando da autorização. O que eu falo?'}
};
