'use strict';
/* SUITS · caso: acidente
   Scripts clássicos compartilham o escopo global (carregados em ordem pelo suits.html).
   Mapa do código e regras: CLAUDE.md na raiz do repositório. */
TPL.acid={
  nome:'Acidente de trânsito (defesa)',area:'Responsabilidade civil',lado:'reu',peca:'contest',
  make(){const veh=pick(Object.keys(VEHS));const cli={n:pname(false),f:false,idade:RI(24,52),prof:VEHS[veh].prof};const aut=pname(chance(.3));
    return {cli,rito:'comum',v:{aut,dmat:RI(9,16)*1000+RI(1,9)*100,dmor:pick([10000,15000]),filhos:RI(1,3),cruz:pick(['Av. Brasil com a Rua Tupis','Rua Padre Eustáquio com a Av. Silva Lobo','Av. Amazonas com a Rua Goitacazes']),farm:pick(['Drogaria Popular','Farmácia Bom Preço','Drogaria Central']),testA:pick(FN_F)+' '+pick(SN),testR:pname(chance(.5)),ped:pname(true),veh,wrel:pick(Object.keys(WREL)),vara:RI(1,32)},hid:{cam:chance(.75),cel:chance(.8),amass:chance(.65)}}},
  intro:c=>`<p>${esc(first(c.cli.n))} chega ${VEH(c).chega}. Tem ${c.cli.idade} anos e ${c.v.filhos} ${c.v.filhos>1?'filhos':'filho'}. Coloca o mandado de citação na mesa como se fosse uma bomba.</p><p>"Ele tá me cobrando ${money(c.v.dmat+c.v.dmor)}, ${DOUT()}. Diz que eu furei o sinal na ${esc(c.v.cruz)}. Mentira. Ele mudou de faixa sem dar seta e ${VEH(c).queda}. Eu fiquei duas semanas sem trabalhar."</p><p>"Se eu perder, vão levar ${VEH(c).a==='a'?'minha':'meu'} ${VEH(c).n}. ${VEH(c).a==='a'?'A':'O'} ${VEH(c).n} é o meu trabalho."</p>`,
  atq:[
    {id:'cam',f:'cam',q:'Tinha alguma câmera ou testemunha por perto?',a:(c,rv)=>!c.hid.cam?'"Tinha gente na calçada, mas câmera eu acho que não. Era tudo casa ali."':rv?`"Tinha a ${esc(c.v.farm)} na esquina! ${FARM(c).replace(/^./,x=>x.toUpperCase())}, ${esc(c.v.testR)}, viu tudo e falou que a câmera deles pega o cruzamento."`:`"Câmera? Não reparei, ${DOUT()}. Eu tava no chão."`,good:1},
    {id:'loc',f:'cam',q:'O que tem em cada esquina daquele cruzamento?',a:(c,rv)=>!c.hid.cam?'"Casa, um terreno baldio e um ponto de ônibus."':rv?`"Uma padaria, o ponto de ônibus e a ${esc(c.v.farm)}... Opa! A farmácia tem câmera virada pra rua. E ${FARM(c)}, ${esc(c.v.testR)}, saiu pra me ajudar."`:'"Ah, padaria, ponto de ônibus, uma farmácia... comércio normal."',good:1},
    {id:'socorro',f:'cam',q:'Quem te ajudou a levantar depois da batida?',a:(c,rv)=>!c.hid.cam?'"Ninguém, eu levantei sozinho. O cara do carro nem desceu."':rv?`"${FARM(c).replace(/^./,x=>x.toUpperCase())} da ${esc(c.v.farm)}, ${esc(c.v.testR)}. Disse que viu tudo e que a câmera da loja pega o cruzamento."`:'"Um senhor de jaleco. Não peguei o nome, eu tava zonzo."',good:1},
    {id:'cel',f:'cel',q:'Você viu o que o motorista estava fazendo antes da batida?',a:(c,rv)=>!c.hid.cel?'"Tava olhando pra frente, acho. Só mudou de faixa sem seta."':rv?'"Tava com o celular na mão, mexendo. Eu vi quando ele virou a cabeça pra baixo."':'"Eu tava olhando pra minha faixa. Não reparei nele antes da batida."',good:1},
    {id:'dist',f:'cel',q:'Ele freou ou buzinou antes de bater?',a:(c,rv)=>!c.hid.cel?'"Freou em cima. Mas já tava na minha faixa."':rv?'"Agora que você perguntou... ele nem freou. Tava olhando pra baixo. Lembro da luz da tela no rosto dele."':'"Não lembro se freou. Foi tudo muito rápido."',good:1},
    {id:'amass',f:'amass',q:'O orçamento que ele juntou bate com o estrago da batida?',a:(c,rv)=>!c.hid.amass?'"Bate, sim. Bati na lateral direita dele, perto da roda da frente. É isso que tá no orçamento."':rv?'Você lê o orçamento com ele. "Peraí: porta traseira esquerda? Ele entrou na minha frente e eu bati na lateral direita dele, perto da roda da frente!" O orçamento cobra um dano que não é dessa batida.':`"Orçamento? Nem li direito, ${DOUT()}."`,good:1},
    {id:'fotos',f:'amass',q:'Você tirou fotos dos dois veículos na hora?',a:(c,rv)=>!c.hid.amass?'"Tirei. Lateral direita, perto da roda da frente, igualzinho ao orçamento dele."':rv?'Ele mostra as fotos no celular: o carro do autor foi atingido na lateral direita, perto da roda da frente. Mas o orçamento cobra a porta traseira esquerda!':'"Tirei não. Tava preocupado com o prejuízo."',good:1},
    {id:'ponto',q:'Tinha alguém no ponto de ônibus que viu a batida?',a:c=>`"Uma moça, ${esc(c.v.ped||'Sandra')}. Ela me deu o telefone e disse que testemunhava se precisasse."`,rev:'ped',good:1},
    {id:'cnh',q:'Sua CNH e o licenciamento do veículo estão em dia?',a:()=>'"Tudo em dia. Eu vivo disso, não posso dar mole."',good:1},
    {id:'beb',q:'Você tinha bebido?',a:()=>'Ele se ofende. "Eram dez da manhã, eu tava trabalhando!" Pergunta válida, mas o jeito pesou.',good:0,fx:[['cli',-2]]},
    {id:'cul',q:'Você assume alguma culpa?',a:()=>'"Eu tava a uns 40, no limite da via. Talvez eu pudesse ter freado antes, sei lá." Anote: isso pode virar culpa concorrente.',good:1}
  ],
  estrat:c=>[
    {id:'hon',l:'Honorários',opts:[
      {l:'Fixos de R$ 3.000, em 4 parcelas, por escrito',ok:1,fb:'Na defesa não há "êxito" em dinheiro para o cliente: honorário fixo, parcelado e por escrito é o mais justo.',a:['CED-48','EAOAB-22'],set:c=>{c.hon={pct:0,fixo:3000}}},
      {l:'40% do valor que ele deixar de pagar',ok:.3,fb:'Possível, mas confuso e caro para quem já está apertado. Ele desconfia.',fx:[['cli',-3]],set:c=>{c.hon={pct:0,fixo:4500}}},
      {l:`${VEH(c).a==='a'?'A':'O'} ${VEH(c).n} como garantia dos honorários`,ok:0,fb:'Pegar o instrumento de trabalho do cliente como garantia é desproporcional e cria conflito de interesses com a própria causa.',a:['CED-50'],fx:[['et',-3],['cli',-4]],set:c=>{c.hon={pct:0,fixo:3000}}}]},
    {id:'proc',l:'Procuração',opts:[
      {l:'Colher a procuração hoje',ok:1,a:['EAOAB-5']},
      {l:'Contestar primeiro, procuração depois',ok:0,fb:'Não há urgência que justifique: o prazo de contestação nem começou. Procuração primeiro.',a:['CPC-104'],fx:[['jz',-1]]}]},
    {id:'exp',l:'O que você diz a ele?',opts:[
      {l:'Que a defesa depende de impugnar cada fato e provar a versão dele',ok:1,fb:'Na contestação vale a impugnação especificada: o que não for contestado presume-se verdadeiro.',a:['CPC-341','CPC-336'],fx:[['cli',2]]},
      {l:'"Relaxa, essa causa é ganha"',ok:0,fb:'Ninguém sabe disso ainda. Promessa vira frustração.',fx:[['et',-1]]},
      {l:'Que um acordo pode ser melhor que o risco',ok:.7,fb:'Pode ser, e é bom ele saber disso. Mas avalie as provas antes.',a:['CPC-3'],fx:[['cli',1]]}]}
  ],
  mont:c=>[
    {k:'end',t:'Endereçamento',a:['CPC-336'],opts:[
      {l:`Ao Juízo da ${c.v.vara}ª Vara Cível da Comarca de ${CITY()} (autos nº ${c.num})`,ok:1},
      {l:`Ao Juizado Especial Cível de ${CITY()}`,ok:0,why:'A ação já corre na Vara Cível. A contestação vai para o juízo onde está o processo.'},
      {l:`Ao Tribunal de Justiça (${TJ()})`,ok:0,why:'O tribunal só entra em recurso. A defesa é no 1º grau.'},
      {l:`Ao Juízo da Vara da Fazenda Pública`,ok:0,why:'Não há ente público na causa.'}]},
    {k:'prelim',t:'Preliminares',a:['CPC-336'],opts:[
      {l:'Nenhuma preliminar cabível: ir direto ao mérito',ok:1},
      {l:'Inépcia da inicial',ok:0,why:'A inicial narra fatos e pedidos com clareza. Preliminar sem base irrita o juízo.'},
      {l:'Incompetência do juízo',ok:0,why:'O acidente foi na comarca e o réu mora nela. Não há incompetência.'},
      {l:'Ilegitimidade passiva',ok:0,why:`O réu é o condutor d${VEH(c).a} ${VEH(c).n}. Ele é parte legítima.`}]},
    {k:'imp',t:'Impugnação de cada fato',a:['CPC-341'],items:[
      {t:'O réu avançou o sinal vermelho.',imp:1,why:'Falso, segundo o cliente: o autor mudou de faixa sem seta.'},
      {t:'O autor trafegava com atenção e regularmente.',imp:1,why:'O autor estava com o celular na mão.'},
      {t:`O dano no veículo é de ${money(c.v.dmat)}, conforme orçamento.`,imp:c.hid.amass?1:0,why:c.hid.amass?'O orçamento inclui a porta traseira esquerda, que não foi atingida (a batida foi na lateral direita).':'O orçamento bate com a batida. Impugnar sem base é alterar a verdade (art. 80, II).'},
      {t:`O acidente ocorreu no cruzamento da ${c.v.cruz}.`,imp:0,why:'É verdade. Negar fato verdadeiro é litigância de má-fé (art. 80, II).'},
      {t:'O autor sofreu abalo moral indenizável.',imp:1,why:'Acidente com dano só material, sem lesão, em regra não gera dano moral.'}]},
    {k:'fund',t:'Fundamentos jurídicos',a:['CPC-336'],opts:[
      {l:'CPC, art. 373, I: cabe ao autor provar o fato constitutivo (a culpa do réu)',ok:1,a:['CPC-373']},
      {l:'CC, art. 186: não houve culpa do réu, logo não há ato ilícito',ok:1,a:['CC-186']},
      {l:'CC, art. 945: subsidiariamente, culpa concorrente do autor',ok:1,a:['CC-945']},
      {l:'CPC, art. 341: o autor não comprovou o dano da porta traseira',ok:c.hid.amass?.5:0,why:c.hid.amass?'Ideia certa, artigo errado: o art. 341 é ônus do réu. O ponto é o ônus do autor (art. 373, I).':'O art. 341 é ônus do réu, não argumento contra o autor.',a:['CPC-341']},
      {l:'CDC, art. 14: responsabilidade objetiva',ok:0,why:'Não há relação de consumo entre dois motoristas.'},
      {l:'Súmula 385 do STJ',ok:0,why:'Súmula sobre negativação. Nada a ver com acidente.'},
      {l:'Código Civil de 1916, art. 159',ok:0,why:'Lei revogada.'},
      {l:'Lei 9.099, art. 3º',ok:0,why:'Lei do Juizado. A causa corre na Vara Cível.'}]},
    {k:'ped',t:'Pedidos',a:['CPC-336'],opts:[
      {id:'imp',l:'Improcedência dos pedidos',ok:1},
      {id:'945',l:'Subsidiariamente, redução da indenização pela culpa concorrente',ok:1,a:['CC-945']},
      {id:'suc',l:'Condenação do autor em custas e honorários de sucumbência',ok:1,a:['EAOAB-23']},
      {id:'prv',l:'Produção de todas as provas admitidas',ok:1},
      {id:'dmr',l:'Pedir, no meio da contestação e sem reconvenção, que o autor pague dano moral ao réu',ok:0,why:'Pedido próprio do réu exige reconvenção (art. 343), proposta na contestação mas como pedido autônomo. Solto no meio da defesa, não é conhecido.',a:['CPC-343']},
      {id:'rcv',l:'Reconvenção: lucros cessantes pelos dias sem trabalhar',ok:.5,why:'Cabe reconvenção na própria contestação (art. 343). Mas sem comprovante de renda e de dias parados, é uma aposta.',a:['CPC-343']},
      {id:'tut',l:`Tutela de urgência para proteger ${VEH(c).a} ${VEH(c).n}`,ok:0,why:'Não há ameaça atual ao veículo. Pedido sem base.'}]},
    {k:'prov',t:'Provas',a:['CPC-336','CPC-357'],note:'Na contestação você protesta pelas provas que pretende produzir (art. 336). Os nomes das testemunhas não vão aqui: entram no rol, depois que o juiz sanear o processo (CPC, art. 357, §4º).',opts:[
      {l:'Testemunhal (os nomes vão no rol, depois do saneamento)',ok:1,miss:'Sem protestar pela prova testemunhal na contestação, você corre o risco de não poder ouvir ninguém. O rol com os nomes vem depois, no prazo do art. 357, §4º.'},
      ...(c.rev.cam&&c.hid.cam?[{l:`Documental: vídeo da câmera da ${c.v.farm}`,ok:1}]:[]),
      {id:'dp',l:'Depoimento pessoal do autor',ok:1},
      {l:'Perícia de engenharia de tráfego',ok:.3,why:'Cara e desnecessária: o vídeo e a testemunha resolvem.'}]}
  ],
  base(c){let t=.4;if(c.hid.cam&&c.rev.cam)t+=.18;if(c.rev.cel)t+=.07;if(c.hid.amass&&c.rev.amass)t+=.08;return t},
  val(c){return c.v.dmat+c.v.dmor},
  conc(c){return {txt:`${c.v.aut} aceita encerrar o processo se o seu cliente pagar`}},
  aij(c){return [
    {tp:'choice',tit:'A testemunha do autor',txt:`A testemunha do autor é chamada. Ao ser qualificada, ${esc(c.v.testA)} diz, com naturalidade: <b>${WR(c).fala}</b> ${JZ(c)} já se prepara para tomar o compromisso.`,opts:WR(c).ok==='contra'?[
      {l:'Contraditar agora, antes do depoimento',ok:1,fb:'Na hora certa. '+WR(c).fb,a:WR(c).a,eff:c=>{c.sc.prova+=.16}},
      {l:'Deixar passar e atacar o depoimento nas alegações finais',ok:0,fb:'A contradita é feita antes do depoimento. Depois, a questão está preclusa e o depoimento vale como de testemunha compromissada.',a:['CPC-457'],eff:c=>{c.sc.prova-=.12}},
      {l:'Protestar em voz alta que ela vai mentir',ok:0,fb:`Sem fundamento técnico, é só teatro. ${JZ(c)} não gosta.`,fx:[['jz',-4]],eff:c=>{c.sc.prova-=.08}}]:[
      {l:'Contraditar: parente do autor não pode depor',ok:0,fb:WR(c).fb,a:WR(c).a,fx:[['jz',-2]],eff:c=>{c.sc.prova-=.04}},
      {l:'Deixar depor e preparar perguntas sobre o que ela realmente viu',ok:1,fb:'Certo. '+WR(c).fb,a:WR(c).a,eff:c=>{c.sc.prova+=.08}},
      {l:'Protestar em voz alta que ela vai mentir',ok:0,fb:`Sem fundamento técnico, é só teatro. ${JZ(c)} não gosta.`,fx:[['jz',-4]],eff:c=>{c.sc.prova-=.08}}]},
    ...(c.mres&&c.mres.prov&&c.mres.prov.dp?[{tp:'perg',tit:`Depoimento pessoal do autor, ${c.v.aut}`,txt:'Você pediu o depoimento pessoal do autor na contestação. Ele senta e ajeita o colarinho. Escolha duas perguntas.',pick:2,qs:[
      {l:'O senhor estava usando o celular no momento da batida?',ok:1,ans:c.hid.cel?`"Eu... só olhei o GPS rapidinho." ${JZ(c)} para de escrever e olha para ele.`:'"Não, o celular tava no suporte." Ele parece seguro.',eff:c.hid.cel?.16:0},
      {l:'O senhor deu seta antes de mudar de faixa?',ok:1,ans:'"Dei, claro." Mas ele demora meio segundo para responder.',eff:.05},
      {l:'O senhor confirma que mudou de faixa sem olhar, não confirma?',ok:0,ans:'"Indefiro. A pergunta induz a resposta, doutor(a)."',a:['CPC-459'],eff:0,fx:[['jz',-2]]},
      {l:'Quanto o senhor ganha por mês?',ok:0,ans:'"Indefiro. Sem relação com os fatos controvertidos."',a:['CPC-459'],eff:0,fx:[['jz',-1]]}]}]:[]),
    ...((c.saneDone&&!c.rol)||c.noTest?[]:[{tp:'perg',tit:c.rol==='ped'?`Sua testemunha: ${c.v.ped}, que estava no ponto`:c.rol==='farm'||c.rol==='both'||(c.hid.cam&&c.rev.cam)?`Sua testemunha: ${c.v.testR}, ${FARM(c).slice(2)}`:'Sua testemunha: um pedestre que estava no ponto',txt:'Agora é a sua vez. Perguntas diretas, à testemunha que você arrolou. Escolha duas.',pick:2,qs:[
      {l:'O que a testemunha viu no momento da batida?',ok:1,ans:`"O carro prata mudou de faixa sem seta, em cima d${VEH(c).a} ${VEH(c).n}. ${VEH(c).dono.replace(/^./,x=>x.toUpperCase())} não teve como desviar."`,eff:.16},
      {l:'Onde a testemunha estava e o que dava para ver dali?',ok:1,ans:c.hid.cam&&c.rev.cam?'"No balcão da farmácia, de frente pro cruzamento. E a nossa câmera grava tudo: eu entreguei o vídeo pro advogado."':'"No ponto de ônibus, a uns dez metros. Vi bem."',eff:c.hid.cam&&c.rev.cam?.2:.08},
      {l:'A testemunha viu que o carro invadiu a faixa, não viu?',ok:0,ans:'"Indefiro. A pergunta induz a resposta, doutor(a)." O advogado do autor sorri.',a:['CPC-459'],eff:0,fx:[['jz',-2]]},
      {l:'O motorista do carro estava com o celular?',ok:1,ans:c.hid.cel?'"Estava. Eu vi a luz da tela no rosto dele." O advogado do autor para de sorrir.':'"Isso eu não reparei, não."',eff:c.hid.cel?.12:0}]}])
  ]},
  alg(c){return {kw:['seta','faixa','mudou de faixa','celular','camera','video','farmac*','testemunha','cunhad*','informante','orcamento','porta traseira','onus','373','culpa','945','concorrente','improcedencia',VEH(c).n,'trabalho'],neg:['avancou o sinal','furou o sinal','estava correndo','culpa do meu cliente','meu cliente errou','assumimos a culpa'],
    q:pickQ(c,[{q:'O autor diz que seu cliente vinha acima da velocidade. O que a defesa tem contra isso, doutor(a)?',kw:['video','camera','testemunha','velocidade','limite','prova','onus','373','farmac*','seta','faixa'],neg:['estava correndo','acima da velocidade sim']},
      {q:'Se houve culpa dos dois, como fica a indenização, doutor(a)?',kw:['945','concorrente','proporc*','reduc*','metade','gravidade'],neg:['culpa exclusiva do meu cliente','e culpa dele']},
      ...(c.hid.amass&&c.rev.amass?[{q:'E o orçamento juntado pelo autor, doutor(a)? A defesa impugnou o valor?',kw:['porta traseira','orcamento','impugn*','nao corresponde','fotos','lateral','roda'],neg:['valor correto','orcamento esta certo']}]:[])])}},
  dispo(c,r){const L=[];if(r.res==='improc')L.push('julgar IMPROCEDENTES os pedidos, condenando o autor em custas e honorários de 10% do valor da causa');else if(r.res==='parc')L.push(`reconhecer a culpa concorrente e condenar o réu a pagar ${money(r.val)}, metade do dano material comprovado`);else L.push(`condenar o réu a pagar ${money(r.val)} ao autor, com correção e juros`);return L},
  epi(c,w){return w?`<p>${esc(first(c.cli.n))} manda um áudio de 40 segundos. Dá para ouvir o barulho do trânsito e o motor ligado.</p><p>"${DRF()}, eu tô na rua trabalhando. Minha mulher chorou quando eu contei. Obrigado por acreditar em mim."</p>`:`<p>${esc(first(c.cli.n))} vende ${VEH(c).a} ${VEH(c).n} para pagar a condenação. Manda uma mensagem curta: "Fiz o que deu."</p><p>Duas semanas depois, você o vê no ponto de ônibus, de uniforme, indo trabalhar de outro jeito.</p>`},
  msgs:{wait:(c,n)=>[`${DRF()}, o cara do carro passou aqui na rua de novo e ficou me encarando. Vai dar certo, né?`,`${DRF()}, ninguém me ligou ainda. O prazo não tá correndo?`,`${DRF()}, minha mulher tá achando que a gente vai perder ${VEH(c).a} ${VEH(c).n}. Preciso de uma resposta.`][Math.min(n||0,2)],aud:c=>'Tô nervoso pra audiência. Vou de camisa social, pode ser?'}
};
