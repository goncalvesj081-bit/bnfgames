'use strict';
/* SUITS · caso: negativacao
   Scripts clássicos compartilham o escopo global (carregados em ordem pelo suits.html).
   Mapa do código e regras: CLAUDE.md na raiz do repositório. */
TPL.neg={
  nome:'Negativação indevida',area:'Consumidor',lado:'autor',peca:'inicial',
  make(){const cli={n:pname(true),f:true,idade:RI(52,66),prof:pick(['diarista','costureira','cozinheira','auxiliar de limpeza'])};
    const di=RI(4,9),y=+S.g.date.slice(0,4);
    return {cli,rito:'jec',v:{emp:pick(EMP_TEL),div:RI(23,89)*10+7,dm:pick([6000,8000,10000]),loja:pick(LOJAS),loja2:pick(['Móveis Aliança','Ótica Visão','Magazine Estrela','Lojas Primavera']),ano2:y-RI(1,3),neta:pick(FN_F),item:pick(ITENS),quem:RI(0,QUEM.length-1),vara:RI(1,9),dInc:fmtD(addD(S.g.date,-RI(40,90))),meses:di},hid:{outra:chance(.45),prot:chance(.8)}}},
  intro:c=>`<p>${esc(first(c.cli.n))} tem ${c.cli.idade} anos e trabalha como ${c.cli.prof} há mais de vinte. Senta na beirada da cadeira, com a bolsa no colo, como quem pede licença.</p><p>"Fui comprar ${esc(ITEM(c))} a prazo na ${esc(c.v.loja)}, ${DOUT()}. Era pr${QUEM[c.v.quem||0][1]} minha ${QUEM[c.v.quem||0][0]}, ${QUEM[c.v.quem||0][1]} ${esc(c.v.neta)}, que vai morar comigo. A moça do caixa falou alto, na frente de todo mundo, que meu nome estava sujo. Uma dívida de ${money(c.v.div)} com a ${esc(nd(c.v.emp))}. Eu nunca tive telefone dessa empresa."</p><p>Ela engole seco. "Eu nunca devi nada pra ninguém."</p>`,
  atq:[
    {id:'outra',f:'outra',q:'A senhora já teve o nome negativado antes, por qualquer outra dívida?',a:(c,rv)=>!c.hid.outra?'"Nunca! Sempre paguei tudo em dia. É por isso que dói tanto."':rv?`Ela baixa os olhos. "Teve... uma prestação da ${esc(c.v.loja2)}, em ${c.v.ano2}. Eu fiquei desempregada. Acho que ainda está lá." É uma dívida dela, legítima.`:'"Negativado? Acho que não..." Ela hesita meio segundo a mais do que deveria.',good:1},
    {id:'atras',f:'outra',q:'Nos últimos anos, ficou com alguma conta ou prestação atrasada?',a:(c,rv)=>!c.hid.outra?'"Atrasar, já atrasei uma conta de luz. Mas paguei no mês seguinte."':rv?`"Teve. A prestação da ${esc(c.v.loja2)}, em ${c.v.ano2}. Nunca consegui quitar." Ela olha para o chão. Essa dívida é dela, e deve estar negativada até hoje.`:'"Ah, atraso todo mundo já teve, né? Mas eu sempre dou um jeito."',good:1},
    {id:'cpf',f:'outra',q:'Antes disso, a senhora já tinha consultado o seu CPF no SPC ou no Serasa?',a:(c,rv)=>!c.hid.outra?'"Consultei quando abri o crediário do mercado. Tava limpinho."':rv?`"Consultei uma vez, em ${c.v.ano2}... tinha uma coisa da ${esc(c.v.loja2)}. Mas aquilo era meu mesmo." Uma inscrição anterior, legítima.`:'"Nunca consultei, não. Nem sei como faz."',good:1},
    {id:'prot',f:'prot',q:'A senhora reclamou com a empresa? Anotou algum protocolo?',a:(c,rv)=>!c.hid.prot?'"Liguei, mas não anotei nada. Ficaram me passando de um pra outro."':rv?'Ela tira da bolsa um caderninho: três números de protocolo, com a data e o nome de quem atendeu. "Ninguém resolveu."':'"Liguei, liguei muito. Se anotei..." Ela remexe a bolsa e desiste.',good:1},
    {id:'procon',f:'prot',q:'Procurou o Procon ou o consumidor.gov.br?',a:(c,rv)=>!c.hid.prot?'"Procon não. Eu liguei pra empresa e desisti."':rv?'"Fui no Procon, sim! Tenho o papel da reclamação e os protocolos das ligações." Ela tira tudo de uma pasta de plástico.':'"Procon não. Eu liguei pra empresa mesmo, várias vezes."',good:1},
    {id:'ext',q:'A senhora trouxe o extrato do SPC ou do Serasa?',a:c=>`Ela mostra o extrato impresso: dívida de ${money(c.v.div)} com a ${esc(nd(c.v.emp))}, incluída em ${c.v.dInc}.`+(c.hid.outra?` Mais abaixo, outra linha: dívida com a ${esc(c.v.loja2)}, de ${c.v.ano2}. "Essa aí... essa era minha mesmo." Uma inscrição anterior, legítima.`:''),rev:'ext',good:1},
    {id:'carta',q:'Recebeu alguma carta avisando, antes de negativarem o nome?',a:()=>'"Nenhuma carta, nada." (Anote: quem deve avisar antes da inscrição é o órgão do cadastro, não a empresa.)',rev:'carta',good:1},
    {id:'cena',q:'Alguém viu a cena no caixa da loja?',a:c=>`"A ${esc((x=>x[hashS(c.id)%x.length])(FN_F.filter(n=>n!==c.v.neta&&n!==first(c.cli.n))))}, minha vizinha, tava comigo. Ficou com mais vergonha do que eu."`,rev:'cena',good:1},
    {id:'quanto',q:'Quanto a senhora espera receber com essa ação?',a:()=>'"A vizinha disse que dá uns cinquenta mil. É verdade?" Ela te olha cheia de esperança. Agora você precisa administrar essa expectativa.',good:0,flag:'expect'},
    {id:'ass',q:'Tem certeza de que nunca assinou nada com eles?',a:()=>'"Tenho. Nunca entrei numa loja deles, nem pela internet. Eu nem sei mexer direito no celular."',good:1}
  ],
  estrat:c=>[
    {id:'rito',l:'Qual rito?',opts:[
      {l:'Juizado Especial Cível',d:'Sem custas no 1º grau e mais rápido. O valor cabe com folga no teto de 40 salários mínimos.',ok:1,fb:'Causa simples, valor baixo e prova documental: o Juizado é o caminho natural.',a:['L9099-3','L9099-54'],set:c=>{c.rito='jec'}},
      {l:'Procedimento comum (Vara Cível)',d:'Mais lento e com custas, mas admite perícia complexa.',ok:.4,fb:'Possível, mas sem vantagem aqui: a causa é simples e cabe no Juizado, que é mais rápido e não cobra custas no 1º grau.',a:['CPC-318','L9099-54'],set:c=>{c.rito='comum'}}]},
    {id:'hon',l:'Honorários',opts:[
      {l:'Contrato escrito: 30% do proveito econômico (o que ela receber e o débito cancelado)',d:'Só ganha se ela ganhar.',ok:1,fb:'Por escrito, em dinheiro e sobre o êxito: o modelo comum em causas de consumidor.',a:['CED-48','CED-50'],set:c=>{c.hon={pct:.3,fixo:0}}},
      {l:'"Depois a gente acerta", sem papel',ok:0,fb:'Honorários devem ser contratados, de preferência, por escrito. O "depois a gente acerta" vira briga com o cliente.',a:['CED-48'],fx:[['et',-2]],set:c=>{c.hon={pct:.3,fixo:0,verbal:1}}},
      {l:'R$ 2.500 adiantados, antes de tudo',ok:.3,fb:'É permitido, mas pesado demais para uma diarista. Ela vai sentir no bolso e na confiança.',a:['EAOAB-22'],fx:[['cli',-5]],set:c=>{c.hon={pct:0,fixo:2500}}}]},
    {id:'proc',l:'Procuração',opts:[
      {l:'Colher a procuração assinada hoje',ok:1,fb:'Certo: o advogado postula fazendo prova do mandato.',a:['EAOAB-5','CPC-104']},
      {l:'Protocolar sem procuração e pegar depois',ok:0,fb:'Sem urgência, não há motivo para agir sem procuração. A exceção do art. 104 é para evitar preclusão, decadência, prescrição ou ato urgente.',a:['CPC-104'],fx:[['jz',-1]]}]},
    {id:'exp',l:'O que você diz a ela?',opts:[
      ...(c.rev.outra&&c.hid.outra?[{l:'Explicar que a negativação anterior provavelmente derruba o dano moral, mas que ela tem direito de limpar o nome',ok:1,fb:'Honestidade que protege a cliente: a Súmula 385 afasta o dano moral quando já existe inscrição legítima, mas não o cancelamento.',a:['SUM-STJ385'],fx:[['cli',2]]}]:[]),
      {l:'Explicar o caminho e os riscos, sem prometer valor',ok:1,fb:'Prometer resultado é a receita da frustração. Explicar o processo constrói confiança.',fx:[['cli',2]]},
      {l:'"Fica tranquila, a gente tira uns trinta mil deles"',ok:0,fb:'Prometer resultado gera frustração e flerta com a mercantilização da profissão.',a:['CED-39'],fx:[['et',-2],['cli',3]],set:c=>{c.promise=1}}]}
  ],
  mont:c=>{const jec=c.rito==='jec',out=c.rev.outra&&c.hid.outra;return [
    {k:'end',t:'Endereçamento',a:['CPC-319','CDC-101'],opts:[
      {l:`Ao Juízo do Juizado Especial Cível da Comarca de ${CITY()}`,ok:jec?1:0,why:jec?'':'Você escolheu o procedimento comum: o endereçamento precisa ser à Vara Cível.'},
      {l:`Ao Juízo de Direito de uma das Varas Cíveis da Comarca de ${CITY()}`,ok:jec?0:1,why:jec?'Você escolheu o Juizado: a petição vai para o Juizado Especial Cível.':''},
      {l:`Ao Juízo da Vara de Família da Comarca de ${CITY()}`,ok:0,why:'Vara de Família cuida de alimentos, guarda e divórcio. Não é o caso.'},
      {l:`Ao Juízo do Juizado Especial Cível de Barueri/SP, sede da ré`,ok:.3,why:'O consumidor pode propor a ação no próprio domicílio (CDC, art. 101, I). Levar o caso para a sede da ré só prejudica a cliente.'}]},
    {k:'qual',t:'Qualificação das partes',a:['CPC-319'],items:QUAL},
    {k:'fatos',t:'Fatos',a:['CPC-319'],items:[
      {id:'f1',t:'A autora jamais contratou qualquer serviço com a ré.',rel:1,o:1},
      {id:'f2',t:`Em ${c.v.dInc}, a ré incluiu o nome da autora em cadastro de inadimplentes por suposta dívida de ${money(c.v.div)}.`,rel:1,o:2},
      {id:'f3',t:`Ao tentar comprar ${ITEM(c)} a prazo na ${c.v.loja}, a autora teve o crédito negado, em público.`,rel:1,o:3},
      {id:'f4',t:c.rev.prot&&c.hid.prot?'A autora reclamou três vezes com a ré (protocolos anexos), sem solução.':'A autora procurou a ré para resolver o problema, sem sucesso.',rel:1,o:4},
      ...(out?[{id:'f5',t:`A autora possui inscrição anterior, legítima, por dívida com a ${c.v.loja2}.`,rel:0,why:'Fato que joga contra a cliente: não se narra na inicial. O que muda é o pedido (veja os pedidos).'}]:[]),
      {id:'f6',t:'A autora frequenta a igreja do bairro e é muito querida pelos vizinhos.',rel:0,why:'Irrelevante para o pedido.'}]},
    {k:'fund',t:'Fundamentos jurídicos',a:['CPC-319'],opts:[
      {l:'CDC, art. 14: responsabilidade objetiva do fornecedor de serviços',ok:1,a:['CDC-14']},
      {l:'CDC, art. 6º, VIII: inversão do ônus da prova',ok:1,a:['CDC-6']},
      {l:'CC, arts. 186 e 927: ato ilícito e dever de indenizar',ok:1,a:['CC-186','CC-927']},
      {l:'CDC, art. 43, §2º: comunicação da abertura de cadastro',ok:.5,why:'Vale como reforço, mas o dever de avisar é do órgão do cadastro, não da operadora.',a:['CDC-43']},
      {l:'Súmula 359 do STJ: a operadora não notificou a autora',ok:0,why:'Pegadinha: a Súmula 359 obriga o órgão mantenedor do cadastro a notificar, não o credor. Contra a operadora, não serve.',a:['SUM-STJ359']},
      {l:'Súmula 385 do STJ',ok:0,why:'Essa súmula joga contra a autora: afasta o dano moral quando há inscrição anterior legítima.',a:['SUM-STJ385']},
      {l:'CDC, art. 42, parágrafo único: repetição do indébito em dobro',ok:0,why:'A repetição em dobro exige pagamento indevido. A autora não pagou nada: só foi cobrada e negativada.',a:['CDC-42']},
      {l:'Código Civil de 1916, art. 159',ok:0,why:'Lei revogada. O Código Civil vigente é o de 2002.'},
      {l:'Lei 8.245/91, art. 59',ok:0,why:'Lei errada: é a Lei do Inquilinato.'}]},
    {k:'ped',t:'Pedidos',a:['CPC-319','CPC-292'],opts:[
      {id:'tut',l:'Tutela de urgência para excluir o nome do cadastro',ok:1,a:['CPC-300']},
      {id:'cit',l:'Citação da ré',ok:.5,why:'Neutro: o CPC/2015 não exige pedido de citação (o art. 319 não o lista; quem exigia era o CPC/73). Não pesa na nota.'},
      {id:'decl',l:`Declaração de inexistência do débito de ${money(c.v.div)}`,ok:1,val:c.v.div},
      {id:'dm',l:`Indenização por dano moral de ${money(c.v.dm)}`,ok:out?0:1,val:c.v.dm,why:out?'Com inscrição anterior legítima, a Súmula 385 afasta o dano moral. Pedir assim é perder esse pedido e queimar crédito com o juiz.':'',a:out?['SUM-STJ385']:[]},
      {id:'inv',l:'Inversão do ônus da prova',ok:1,a:['CDC-6']},
      {id:'suc',l:'Condenação da ré em honorários de sucumbência',ok:jec?0:1,why:jec?'No Juizado não há sucumbência no 1º grau (Lei 9.099, art. 55).':'',a:jec?['L9099-55']:[]},
      {id:'mat',l:'Danos materiais de R$ 20.000',ok:0,val:20000,why:'Não decorre dos fatos: nenhum prejuízo material foi narrado.'}]},
    {k:'valor',t:'Valor da causa',a:['CPC-292']},
    {k:'prov',t:'Provas',a:['CPC-319'],opts:[
      {l:'Documental: extrato do cadastro'+(c.rev.prot&&c.hid.prot?' e protocolos':''),ok:1},
      {l:'Depoimento pessoal do representante da ré',ok:1},
      {l:'Perícia grafotécnica',ok:jec?0:.5,why:jec?'O Juizado não comporta perícia complexa. E não há assinatura a periciar: a autora nunca assinou nada.':'Não há assinatura a periciar: a autora nunca assinou nada.'},
      {l:'Inspeção judicial na loja',ok:0,why:'Prova inútil para o caso. Pedir prova sem utilidade irrita o juízo.'}]}
  ]},
  base(c){let t=.78;if(c.hid.prot)t+=.06;return t},
  val(c){return c.v.div+(c.hid.outra?0:c.v.dm)},
  conc(c){return {txt:`A ${c.v.emp} oferece excluir o nome e pagar`,demand:c.v.dm}},
  aij(c){const out=c.hid.outra;return [
    {tp:'choice',tit:'A contestação da ré',txt:`No Juizado, a defesa vem na própria audiência. ${advOf(c).f?'A':'O'} ${advT(c)} entrega a contestação: diz que a linha foi contratada por telefone e junta uma <b>tela do sistema</b> da própria empresa${out?`. E anexa um extrato: <b>${esc(first(c.cli.n))} já tinha outra inscrição, da ${esc(c.v.loja2)}</b>`:''}.`+(out&&!c.rev.outra?` <br><br>${esc(first(c.cli.n))} aperta seu braço. "Eu esqueci, ${DOUT()}..." Você foi pego de surpresa.`:''),
      opts:[
        {l:'Impugnar a tela: é prova unilateral, produzida pela própria ré, sem assinatura nem gravação',ok:1,fb:'Exato: a tela de sistema é documento produzido unilateralmente. E, com a inversão do ônus, cabe à ré provar a contratação.',a:['CDC-6','CPC-373'],eff:c=>{c.sc.prova+=.2}},
        {l:'Pedir prazo para se manifestar depois',ok:.4,fb:'No Juizado tudo se concentra na audiência. Deixar para depois enfraquece a impugnação.',eff:c=>{c.sc.prova+=.05}},
        {l:'Ficar em silêncio para não piorar',ok:0,fb:'Silêncio diante de documento novo é deixar a versão da ré de pé.',eff:c=>{c.sc.prova-=.1}}]},
    {tp:'perg',tit:'Depoimento da preposta da ré',txt:'A preposta da operadora senta, ajeita o crachá e evita olhar para a sua cliente. Você pode fazer duas perguntas.',pick:2,qs:[
      {l:'A empresa tem a gravação da suposta contratação por telefone?',ok:1,k:'grav',ans:'"Não... não localizamos a gravação." A anotação é feita na hora.',eff:.18},
      {l:'Que documento a autora assinou para contratar a linha?',ok:1,k:'doc',ans:'"Não há documento assinado. A venda foi por telefone." Mais uma anotação.',eff:.14},
      {l:'A senhora confirma que a empresa errou, não confirma?',ok:0,ans:'"Indefiro a pergunta, doutor(a): ela induz a resposta." Ninguém nem levanta os olhos.',a:['CPC-459'],eff:0,fx:[['jz',-2]]},
      {l:'A empresa costuma ter muitas reclamações desse tipo?',ok:0,ans:'"Indefiro. A pergunta não tem relação com os fatos deste processo." A preposta respira aliviada.',a:['CPC-459'],eff:0,fx:[['jz',-1]]}]}
  ]},
  alg(c){return {kw:['nunca contrat*','cadastro','negativa*','inscri*','tela','unilateral','gravac*','protocolo*','inversao','onus','responsabilidade objetiva','constrang*',norm(ITEMN(c)).split(' ')[0],'credito','dano moral','cancelamento','inexist*','sumula 385','preexist*'],neg:['contratou a linha','assinou o contrato','a divida existe','deve mesmo','talvez tenha contratado','ela esqueceu de pagar'],
    q:c.hid.outra?{q:'E a anotação anterior da autora, doutor(a)? A Súmula 385 não afasta o dano moral?',kw:['cancelamento','exclus*','inexist*','declara*','limpar','retirada','baixa'],neg:['nao existe','e falsa','nunca teve','nao se aplica'],fact:'s385'}:pickQ(c,[
      (c.aiQ||[]).some(k=>k==='grav'||k==='doc')?{q:'A preposta disse que não há gravação nem contrato assinado. Então, quem tinha que provar a contratação, doutor(a)?',kw:['onus','inversao','re','ré','fornecedor','prova*','373','6'],neg:['a autora tinha que provar','ela devia provar']}:{q:'A ré juntou a tela do sistema com o contrato. Isso não prova a contratação, doutor(a)?',kw:['tela','unilateral','propria re','sistema','assinatura','gravac*','onus','inversao','prova'],neg:['prova sim','realmente prova','contratou']},
      {q:'Qual é o dano moral aqui, doutor(a)? A autora provou o abalo?',kw:['in re ipsa','presumid*','negativa*','cadastro','constrang*','credito','loja','publico','caixa'],neg:['nao houve abalo','nao sofreu']}])}},
  dispo(c,r){const L=[];if(r.decl)L.push(`declarar inexistente o débito de ${money(c.v.div)} e determinar a exclusão definitiva do nome da autora dos cadastros de inadimplentes`);if(r.dm)L.push(`condenar a ré a pagar à autora ${money(r.dm)} a título de danos morais, com correção e juros`);return L},
  epi(c,w){return w?`<p>Três semanas depois, chega uma foto no seu celular. ${esc(ITEM(c)).replace(/^./,x=>x.toUpperCase())} novinh${ITEM(c).startsWith('uma')?'a':'o'}, ainda com o plástico, e ${QUEM[c.v.quem||0][1]} ${esc(c.v.neta)} fazendo careta na frente.</p><p>"Obrigada, ${DOUT()}. Hoje eu dormi a noite inteira."</p>`:`<p>${esc(first(c.cli.n))} escuta a explicação em silêncio. Agradece, educada, e vai embora devagar.</p><p>Na semana seguinte, você passa em frente à ${esc(c.v.loja)}. ${esc(ITEM(c)).replace(/^./,x=>x.toUpperCase()).replace(/^Uma? /,m=>m==='Uma '?'A ':'O ')} ainda está na vitrine.</p>`},
  msgs:{wait:(c,n)=>[`Bom dia, ${DOUT()}. Desculpa incomodar. Tem alguma novidade? Minha ${QUEM[c.v.quem||0][0]} perguntou d${ITEM(c).startsWith('uma')?'a':'o'} ${esc(ITEMN(c))} de novo.`,`${DRF()}, já faz tempo. A loja disse que sem limpar o nome não tem crediário. A gente vai entrar com a ação quando?`,`${DRF()}, eu tô ficando preocupada. Liguei três vezes. Se não for dar, me fala, que eu procuro outro advogado.`][Math.min(n||0,2)],aud:c=>`Comprei uma blusa nova pra audiência. Precisa levar alguma coisa?`}
};
