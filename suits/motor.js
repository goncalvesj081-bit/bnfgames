'use strict';
/* SUITS · motor: tempo, prazos, tribunal, honorários
   Scripts clássicos compartilham o escopo global (carregados em ordem pelo suits.html).
   Mapa do código e regras: CLAUDE.md na raiz do repositório. */
/* ================================================================
   MOTOR — estado, tempo, processos, tribunal
================================================================= */
const RIVAL={n:'Henrique Prado',t:'Dr. Henrique Prado',firm:'Prado & Leme Advogados'};
const MENTOR={n:'Marta Albuquerque',t:'Dra. Marta Albuquerque',firm:'Albuquerque Advocacia'};
/* advogados da parte contrária: cada um com um estilo que muda a audiência e o recurso */
const ADV={
  prado:{n:'Henrique Prado',f:0,firm:'Prado & Leme Advogados',st:'Elegante e implacável. Só faz acordo barato e adora uma audiência.',off:.85,cnt:-.08,rec:.55,ln:['"Vamos ser práticos, doutor(a)."','"Amanhã a proposta não existe mais."','"Você sabe como esse juízo costuma decidir, não sabe?"']},
  cecilia:{n:'Cecília Monteiro',f:1,firm:'Monteiro Advocacia Empresarial',st:'Técnica e pragmática. Prefere um acordo justo a um risco.',off:1.12,cnt:.12,rec:.3,ln:['"Fiz as contas com calma. Acho que dá para resolvermos hoje."','"Meu cliente prefere encerrar. Vamos conversar com números."']},
  otavio:{n:'Otávio Ramos',f:0,firm:'Ramos & Filhos',st:'Protelatório: recorre de tudo e não tem pressa nenhuma.',off:.8,cnt:-.04,rec:.85,ln:['"Não temos pressa nenhuma, doutor(a)."','"Se não aceitar, a gente se vê no Tribunal. E depois em Brasília."']},
  livia:{n:'Lívia Assunção',f:1,firm:'advogada autônoma',st:'Jovem e combativa. Não recua em audiência.',off:.95,cnt:-.02,rec:.5,ln:['"A parte que eu represento tem razão, e eu vou provar."','"Proposta final. Não vou baixar mais nem um real."']},
  murilo:{n:'Murilo Pacheco',f:0,firm:'Pacheco Contencioso de Massa',st:'Advogado de massa: centenas de processos, pouca atenção a cada um.',off:1.02,cnt:.06,rec:.4,weak:.05,ln:['(Ele confere o número do processo duas vezes antes de falar.) "É... este aqui. Temos uma proposta padrão."','"Tenho mais doze audiências hoje. Fechamos?"']}
};
const advOf=c=>ADV[c&&c.adv]||ADV.prado;
const advT=c=>{const a=advOf(c);return (a.f?'Dra. ':'Dr. ')+a.n};
const advLn=c=>pick(advOf(c).ln).replace('doutor(a)',DOUT());
const FASE={atend:'Atendimento',estrat:'Estratégia e contrato',inicial:'Petição inicial',contest:'Contestação',emenda:'Emenda da inicial',aguarda:'Aguardando o juízo',conc:'Audiência de conciliação',aij:'Audiência de instrução',alg:'Alegações finais',replica:'Réplica',saneamento:'Rol de testemunhas',agravo:'Agravo de instrumento',pos:'Sentença publicada',cumpr:'Cumprimento de sentença',contrarraz:'Contrarrazões',fim:'Encerrado'};
const ACT=['atend','estrat','inicial','contest','emenda','replica','saneamento','agravo','pos','cumpr','alg','contrarraz'];
const hoursDay=()=>{const st=S.g.ind.st;return 8-(st>=70?1:0)-(st>=85?1:0)};
const round100=x=>Math.max(100,Math.round(x/100)*100);
const partes=c=>c.t==='neg'?{a:c.cli.n,r:c.v.emp}:c.t==='acid'?{a:c.v.aut,r:c.cli.n}:{a:`${c.v.filho} ${c.cli.n.split(' ').slice(1).join(' ')}, representado por sua mãe, ${c.cli.n}`,r:c.v.plano};
const vara=c=>c.rito==='jec'?`Juizado Especial Cível de ${CITY()}`:`${c.v.vara||RI(1,9)}ª Vara Cível de ${CITY()}`;
const casesOpen=()=>S.g.cases.filter(c=>!c.done);
const numD=c=>c.lado==='autor'&&!c.autos.some(x=>/protocolada/.test(x.t))?'— (ainda não distribuído)':c.num;
const byId=id=>S.g.cases.find(c=>c.id===id);
const needs=c=>!c.done&&(c.fb||c.ai||c.jc||ACT.includes(c.fase)||(c.aud&&c.aud.d===S.g.date&&!c.aud.ok));
function auto(c,t){c.autos.push({d:S.g.date,t})}
function msg(from,txt,cid){S.g.msgs.unshift({d:S.g.date,from,txt,c:cid||null});S.g.msgs=S.g.msgs.slice(0,40)}
function log(t){S.g.log.unshift({d:S.g.date,t});S.g.log=S.g.log.slice(0,80)}
function spend(h){const G=S.g;if(G.h<h-1e-9){toast(`Faltam horas hoje (precisa de ${fmtH(h)}, restam ${fmtH(G.h)}). ${G.night?'Encerre o dia.':'Encerre o dia ou vire a noite.'}`);return false}G.h=Math.round((G.h-h)*10)/10;return true}
function setPrazo(c,tp,n,lbl,a){c.prazo={tp,n,ini:S.g.date,ate:addUteis(S.g.date,n),lbl,a:a||[]};return c.prazo}
function waitEv(c,ev,n){c.wait={ev,d:addUteis(S.g.date,n)};c.fase='aguarda'}
function audAt(c,tp,n){c.aud={tp,d:addUteis(S.g.date,n)};c.fase='aguarda';auto(c,`Designada ${tp==='conc'?'audiência de conciliação':'audiência de instrução e julgamento'} para ${fmtD(c.aud.d)}.`)}
function dje(c,tit,txt,a,extra){const html=/<b>|<i>|<br>/.test(txt);S.g.pop.push({k:'dje',c:c.id,tit,txt,html,a:a||[],pz:c.prazo&&c.prazo.ini===S.g.date?Object.assign({},c.prazo):null,extra:extra||''});auto(c,nd(tit)+'.'+(c.prazo&&c.prazo.ini===S.g.date?` Prazo: ${c.prazo.lbl}, até ${fmtD(c.prazo.ate)}.`:''));snd('bell')}
function pz(c,tp,n,lbl,a){return setPrazo(c,tp,n,lbl,a)}

function newGame(){const st=UI.setup,f=st.sx==='f';
  S={v:SCHEMA,saveVersion:SAVE_VERSION,ver:VERSION,seenV:VERSION,nome:(st.nome||'').trim().slice(0,40)||(f?'Helena Duarte':'Rafael Duarte'),sx:st.sx,uf:st.uf,phase:'tut',tut:0,tutA:null,ex:null,exN:0,usedQ:[],p2:null,
    vm:{seen:{},fav:{},hl:{},n:0},
    g:{date:'2028-01-24',h:8,ind:{rep:6,cli:60,et:76,jz:50,st:18},gain:{},cx:900,cases:[],advRec:{},deck:[],lastT:null,pop:[],msgs:[],log:[],evDone:[],nextEv:null,nextCase:null,tplN:0,rival:{w:0,l:0,a:0},stats:{won:0,lost:0,part:0,acc:0,miss:0,closed:0},inf:0,ted:[],cargo:'bacharel',oab:'',night:false,week:0,fee:0,earn:0}};
  save();
}
function startCareer(){const G=S.g;G.cargo='assoc';let d=G.date;while(wd(d)!==1||!isWork(d))d=addD(d,1);G.date=d;G.h=hoursDay();
  G.nextCase=addUteis(d,RI(4,5));G.nextEv=addUteis(d,RI(8,11));
  msg(MENTOR.t,`Bem-vind${g('a','o')} à ${MENTOR.firm}, ${DR()} ${S.nome.split(' ').slice(-1)[0]}. Sua sala é a do fim do corredor. Já deixei o primeiro caso na sua mesa. Regra da casa: aqui ninguém perde prazo.`);
  newCase('neg');S.phase='car';UI.tab='painel';save();
}
function buildAtq(c){const T=TPL[c.t],facts={};T.atq.forEach(q=>{if(q.f)(facts[q.f]=facts[q.f]||[]).push(q.id)});
  const rv={},offer=new Set();Object.keys(facts).forEach(f=>{const ids=shuffle(facts[f]);rv[ids[0]]=1;offer.add(ids[0]);if(ids[1]&&chance(.6))offer.add(ids[1])});
  const rest=shuffle(T.atq.filter(q=>!q.f).map(q=>q.id));while(offer.size<7&&rest.length)offer.add(rest.pop());
  c.atq={offer:shuffle([...offer]),rv}}
function atqOffer(c){const T=TPL[c.t];if(!c.atq||!c.atq.offer)return T.atq;return c.atq.offer.map(id=>T.atq.find(q=>q.id===id)).filter(Boolean)}
const atqRv=(c,q)=>!q.f||!c.atq||!c.atq.rv||!!c.atq.rv[q.id];
function pickAdv(){const G=S.g;const recent=G.cases.slice(-2).map(c=>c.adv);if(chance(.32)&&!recent.every(a=>a==='prado'))return 'prado';const ks=Object.keys(ADV).filter(k=>k!=='prado'&&!recent.includes(k));return pick(ks.length?ks:Object.keys(ADV))}
function newCase(t){const G=S.g,T=TPL[t],m=T.make(),jf=chance(.5);
  const U=new Set(G.usedF||G.cases.map(x=>first(x.cli.n)));const fresh=(n,f)=>{let k=0,x=n;while(U.has(first(x))&&k++<25)x=pname(f);U.add(first(x));return x};
  m.cli.n=fresh(m.cli.n,m.cli.f);const V=m.v||{};
  ['aut','testR','ped'].forEach(k=>{if(V[k])V[k]=fresh(V[k],isF(V[k]))});
  if(V.neta){let k=0;while(U.has(V.neta)&&k++<25)V.neta=pick(FN_F);U.add(V.neta)}
  if(V.testA){const ban=new Set(surn(m.cli.n).concat(surn(V.aut||'')));let fn=first(V.testA),k=0;while(U.has(fn)&&k++<25)fn=pick(FN_F);U.add(fn);let sn,j=0;do{sn=pick(SN)}while(ban.has(sn)&&j++<20);V.testA=fn+' '+sn}
  G.usedF=[...U].slice(-44);
  const c=Object.assign({id:'c'+Date.now().toString(36)+RI(100,999),t,num:'',lado:T.lado,fase:'atend',autos:[],asked:[],rev:{},sc:{peca:.5,prova:.5,alg:.5,pen:0},sat:66,start:G.date,juiz:{n:(jf?'Dra. ':'Dr. ')+pname(jf),f:jf,rig:R(.86,1.18)},fa:{},prazo:null,wait:null,aud:null,fb:null,done:false,rol:null},m);
  {const ban=new Set([c.cli.n,c.v.aut,c.v.testA,c.v.testR,c.v.ped].filter(Boolean).flatMap(surn));let k=0;while(surn(c.juiz.n.replace(/^Dra?\. /,'')).some(x=>ban.has(x))&&k++<20)c.juiz.n=(c.juiz.f?'Dra. ':'Dr. ')+pname(c.juiz.f)}
  c.adv=pickAdv();c.rivalT=advT(c);c.num=cnj();buildAtq(c);
  if(c.lado==='reu'){auto(c,`Distribuída a ação de indenização movida por ${c.v.aut}. Patrono do autor: ${advT(c)}.`);auto(c,`Citação de ${c.cli.n}.`);c.aud={tp:'conc',d:addUteis(G.date,RI(22,27))};auto(c,`Designada audiência de conciliação para ${fmtD(c.aud.d)}.`)}
  G.cases.push(c);G.tplN++;G.pop.push({k:'novo',c:c.id});return c}
function spawnCase(){const G=S.g;const open=casesOpen();
  /* baralho de modelos: não repete um tipo de caso antes de esgotar os outros */
  let t;if(G.tplN<TPL_ORDER.length)t=TPL_ORDER[G.tplN];else{if(!G.deck||!G.deck.length){G.deck=shuffle(TPL_ORDER);if(G.deck[0]===G.lastT)G.deck.push(G.deck.shift())}const busy=new Set(open.map(c=>c.t));const i=G.deck.findIndex(x=>!busy.has(x));t=G.deck.splice(i>=0?i:0,1)[0]}
  if(open.length<5){G.lastT=t;const c=newCase(t);const a=advOf(c);msg(MENTOR.t,c.lado==='reu'?`Chegou uma defesa para você. Do outro lado, ${advT(c)}: ${a.st.charAt(0).toLowerCase()+a.st.slice(1)}`:`Mais um caso para você. Atenda com calma: cliente bem ouvido é metade da causa.`,c.id)}
  G.nextCase=addUteis(G.date,G.tplN<TPL_ORDER.length?RI(5,8):RI(12,20))}
function spawnEv(){const G=S.g;const left=EVT.filter(e=>!G.evDone.includes(e.id));if(left.length){const e=pick(left);G.pop.push({k:'ev',id:e.id,who:e.who()})}G.nextEv=left.length>1?addUteis(G.date,RI(7,12)):null}

/* ---------- fim do dia ---------- */
function endDay(){const G=S.g;
  casesOpen().forEach(c=>{if(c.aud&&c.aud.d<=G.date&&!c.aud.ok)missAud(c)});
  const used=hoursDay()-G.h,tight=casesOpen().filter(c=>c.prazo&&uteisAte(G.date,c.prazo.ate)<=2).length;bump('st',(G.night?7:used>=7?3:used<=3?-2:0)+Math.min(tight,3)*2);
  const prev=G.date;G.date=nextWork(G.date);G.night=false;
  if(D0(G.date)-D0(prev)>=3*864e5||wd(G.date)<wd(prev))weekly();
  G.h=hoursDay();
  if(G.ind.st>=95){bump('st',-40);G.h=2;G.pop.push({k:'info',tit:'Você apagou',sub:'Estresse',txt:`<p>Na quarta xícara de café, a mão tremeu. Você acordou no sofá do escritório com a ${MENTOR.t} te cobrindo com o paletó dela.</p><p>"Hoje você trabalha meio período e vai pra casa. Prazo de processo a gente cumpre. Prazo do corpo, também." Você só tem 2 horas hoje.</p>`});}
  casesOpen().forEach(c=>{syncFase(c);
    if(c.wait&&c.wait.d<=G.date){const ev=c.wait.ev;c.wait=null;COURT[ev](c)}
    if(c.prazo&&c.prazo.ate<G.date)missPrazo(c);
    if(c.aud&&c.aud.d===G.date&&!c.aud.ok){if(!['atend','estrat'].includes(c.fase))c.fase=c.aud.tp;G.pop.push({k:'info',tit:`Hoje: ${c.aud.tp==='conc'?'audiência de conciliação':'audiência de instrução'}`,sub:c.num,txt:`<p>${esc(vara(c))}. Cliente: ${esc(c.cli.n)}. Do outro lado, ${advT(c)}.</p><p>Abra o processo para entrar na sala. Faltar tem consequência.</p>`,c:c.id});snd('alert')}
    if(['atend','estrat','inicial'].includes(c.fase)&&uteisAte(c.start,G.date)>8&&chance(.35)){c.sat=clamp(c.sat-4,0,100);bump('cli',-1);if(chance(.5)){msg(c.cli.n,TPL[c.t].msgs.wait(c,c.waitN||0),c.id);c.waitN=(c.waitN||0)+1}}
    if(c.t==='saude'&&!c.tut&&!c.cirLate&&G.date>cirD(c)){c.cirLate=1;c.sat=clamp(c.sat-15,0,100);bump('cli',-4);msg(c.cli.n,`${DRF()}, a data da cirurgia passou e nada de autorização. O médico remarcou e disse que agora o risco é maior.`,c.id)}
  });
  if(G.nextCase&&G.date>=G.nextCase)spawnCase();
  if(G.nextEv&&G.date>=G.nextEv)spawnEv();
  checkTED();save();
}
function weekly(){const G=S.g;G.week++;G.cx+=1050-650;log('Salário de associado (R$ 1.050) menos o custo de vida da semana (R$ 650).');
  ['rep','cli','et','jz'].forEach(k=>{if(G.ind[k]>90&&!G.gain[k])G.ind[k]-=1});G.gain={};
  if(G.week===8&&G.stats.closed>=1)msg(MENTOR.t,`Dois meses de casa. Você está indo bem. Continue explicando tudo ao cliente: é isso que traz indicação.`)}
function fastForward(){let n=0;const G=S.g;do{endDay();n++}while(n<15&&!G.pop.length&&!casesOpen().some(c=>needs(c)||(c.prazo&&uteisAte(G.date,c.prazo.ate)<=2)));render();toTop()}

/* ---------- prazos e audiências perdidos ---------- */
function rep(c,p){if(chance(p)){S.g.inf++;bump('et',-8);S.g.ted.push({d:S.g.date,t:`Representação de ${c.cli.n} por prejuízo ao patrocínio (prazo perdido no processo ${c.num}).`});return true}return false}
function missPrazo(c){const G=S.g,P=c.prazo;c.prazo=null;
  if(P.tp==='embargos'){c.embExp=1;c.fase='pos';const n=c.rito==='jec'?10:15;c.prazo={tp:'recurso',n,ini:c.sentD,ate:addUteis(c.sentD,n),lbl:c.rito==='jec'?'Recurso inominado':'Apelação',a:[c.rito==='jec'?'L9099-42':'CPC-1003']};G.pop.push({k:'info',tit:'Prazo dos embargos encerrado',sub:c.num,txt:'<p>Os 5 dias dos embargos de declaração passaram. A omissão da sentença agora só pode ser atacada no recurso, que continua no prazo.</p>',c:c.id});return}
  if(['contest','replica'].includes(P.tp))c.jcAny={tp:P.tp};
  G.stats.miss++;const ch=fx([['cli',-12],['rep',-4],['st',8]]);c.sat=clamp(c.sat-30,0,100);let t='',a=[];
  if(P.tp==='emenda'){t='Você não emendou a inicial no prazo. O juiz indeferiu a petição inicial.';a=['CPC-321'];closeCase(c,'indef')}
  else if(P.tp==='contest'){t='O prazo da contestação passou em branco. Seu cliente é revel: os fatos narrados pelo autor presumem-se verdadeiros.';a=['CPC-344','CPC-355'];c.revel=1;c.sc.pen+=.42;auto(c,'Decretada a revelia do réu.');waitEv(c,'sentenca',RI(8,14))}
  else if(P.tp==='replica'){t='Sem réplica: as alegações do réu ficaram sem resposta. Preclusão.';a=['CPC-350','CPC-351'];c.sc.pen+=.07;waitEv(c,'sentenca',RI(10,18))}
  else if(P.tp==='saneamento'){t='O rol de testemunhas não foi apresentado no prazo. A prova testemunhal está preclusa.';a=['CPC-357','CPC-223'];c.sc.prova-=.22;c.noTest=1;c.rol=null;audAt(c,'aij',RI(18,25))}
  else if(P.tp==='agravo'){t='O prazo do agravo acabou. A decisão que negou a tutela ficou de pé.';a=['CPC-1015','CPC-1003'];c.sat=clamp(c.sat-15,0,100);audAt(c,'conc',RI(14,20))}
  else if(P.tp==='recurso'){t='O prazo do recurso acabou. A sentença transitou em julgado do jeito que estava.';a=[c.rito==='jec'?'L9099-42':'CPC-1003'];afterFinal(c)}
  else if(P.tp==='cumpr'){t='Você deixou o cumprimento de sentença parado. O cliente teve que cobrar você, e o dinheiro continua sem chegar.';a=['CPC-523'];if(!c.cumprWarn){c.cumprWarn=1;pz(c,'cumpr',10,'Pedir o cumprimento (cliente cobrando)',['CPC-523'])}else afterFinal(c,1)}
  else if(P.tp==='contrarraz'){t='O prazo das contrarrazões passou em branco. O recurso da outra parte vai ser julgado sem a sua resposta.';a=['CPC-1010'];c.crQ=0;waitEv(c,'acordao',RI(40,65))}
  else if(P.tp==='embargos'){t='O prazo dos embargos de declaração (5 dias) acabou. A omissão só pode ser atacada no recurso.';a=['CPC-1023'];c.embExp=1;c.fase='pos';c.prazo={tp:'recurso',n:c.rito==='jec'?10:15,ini:c.sentD,ate:addUteis(c.sentD,c.rito==='jec'?10:15),lbl:c.rito==='jec'?'Recurso inominado':'Apelação',a:[c.rito==='jec'?'L9099-42':'CPC-1003']};G.stats.miss--}
  const r=rep(c,P.tp==='cumpr'?.05:.3);
  G.pop.push({k:'miss',c:c.id,lbl:P.lbl,ate:P.ate,t,a,ch,rep:r});snd('lose');setTimeout(shake,80)}
function missAud(c){const G=S.g,tp=c.aud.tp,dAud=c.aud.d;c.aud.ok=true;let t,a;const ch=fx([['jz',-5],['cli',-10],['rep',-2]]);c.sat=clamp(c.sat-25,0,100);
  if(c.rito==='jec'&&c.lado==='autor'){t='Você não compareceu. No Juizado, a ausência do autor extingue o processo.';a=['L9099-51'];closeCase(c,'ext')}
  else if(tp==='conc'){const v=Math.max(50,Math.round(TPL[c.t].val(c)*.02));t=`Ausência injustificada à audiência de conciliação: seu cliente foi multado em ${money(v)} (até 2%), por ato atentatório à dignidade da justiça. A multa é da parte, e ${esc(first(c.cli.n))} está furios${c.cli.f?'a':'o'} com você.`;a=['CPC-334'];c.sat=clamp(c.sat-15,0,100);noDeal(c)}
  else{t='Você faltou à instrução. As provas do seu cliente não foram produzidas.';a=['CPC-364'];c.sc.prova=.12;c.sc.alg=.2;waitEv(c,'sentenca',RI(8,14))}
  G.pop.push({k:'miss',aud:1,c:c.id,lbl:tp==='conc'?'Audiência de conciliação':'Audiência de instrução',ate:dAud,t,a,ch});snd('lose')}
function checkTED(){const G=S.g,lv=G.tedLv||0;
  if(G.inf>=6&&lv<3){G.tedLv=3;G.pop.push({k:'ted',lv:3});S.phase='fim';S.fim='exc'}
  else if(G.inf>=4&&lv<2){G.tedLv=2;fx([['rep',-15],['cli',-10]]);G.ted.push({d:G.date,t:'Suspensão aplicada pelo Tribunal de Ética e Disciplina.'});G.pop.push({k:'ted',lv:2})}
  else if(G.inf>=2&&lv<1){G.tedLv=1;fx([['rep',-5]]);G.ted.push({d:G.date,t:'Censura aplicada pelo Tribunal de Ética e Disciplina.'});G.pop.push({k:'ted',lv:1})}}

/* ---------- força da causa e sentença ---------- */
function strength(c){const T=TPL[c.t];return clamp(.40*T.base(c)+.22*c.sc.peca+.2*clamp(c.sc.prova,0,1)+.18*c.sc.alg-c.sc.pen+(S.g.ind.jz-50)/600+(advOf(c).weak||0),0,1)}
function computeSent(c){const T=TPL[c.t],s=strength(c),p=clamp((s-.3)*2.3/c.juiz.rig,.04,.96),r=Math.random();
  let lv=r<p-.1?2:r<p+.12?1:0;const F=[],ped=(c.mres&&c.mres.ped)||{};
  const tese=T.base(c),au=c.lado==='autor',noPeca=c.revel&&!au;
  F.push({sg:tese>=.6?1:tese>=.45?0:-1,t:tese>=.6?'A tese era forte e os fatos ajudavam.':tese>=.45?'A tese era razoável, mas dependia das provas.':'A tese era frágil desde o começo.',j:tese>=.6?(au?'a pretensão encontra respaldo nos fatos e no direito aplicável':'a defesa encontra respaldo nos fatos e no direito aplicável'):tese<.45?(au?'a pretensão tem fundamento frágil':'a defesa tem fundamento frágil'):''});
  if(!noPeca){if(c.sc.peca>=.75)F.push({sg:1,t:`Peça bem construída (nota ${f1(c.sc.peca*10)}/10).`,j:au?'a inicial expôs com clareza os fatos, os fundamentos e os pedidos':'a contestação impugnou de forma específica os fatos da inicial'});else if(c.sc.peca<.55)F.push({sg:-1,t:`Peça com falhas (nota ${f1(c.sc.peca*10)}/10).`,a:['CPC-319'],j:au?'a inicial apresenta deficiências na exposição dos fatos e dos pedidos':'a contestação deixou de enfrentar pontos relevantes da inicial'})}
  if(c.sc.prova>=.65)F.push({sg:1,t:'As provas sustentaram a sua versão.',j:au?'a prova produzida confirma a narrativa da inicial':'a prova produzida confirma a dinâmica narrada na defesa'});else if(c.sc.prova<.45)F.push({sg:-1,t:'Faltou prova da sua versão.',a:['CPC-373'],j:au?'a parte autora não se desincumbiu do ônus de provar o fato constitutivo do seu direito (CPC, art. 373, I)':'a parte ré não se desincumbiu do ônus de provar fato impeditivo, modificativo ou extintivo (CPC, art. 373, II)'});
  if(c.sc.alg>=.65)F.push({sg:1,t:'Alegações finais convincentes, com os fatos do caso.',j:'as razões finais demonstraram a coerência entre os fatos alegados e a prova'});else if(c.sc.alg<.45&&c.algDone)F.push({sg:-1,t:'Alegações finais fracas.',a:['CPC-364']});
  if(c.revel)F.push({sg:-1,t:'Revelia: os fatos do autor foram presumidos verdadeiros.',a:['CPC-344'],j:'o réu, citado, não contestou, presumindo-se verdadeiras as alegações de fato da inicial (CPC, art. 344)'});
  if(c.juiz.rig>1.08)F.push({sg:-1,t:`${c.juiz.f?'A juíza':'O juiz'} é conhecid${c.juiz.f?'a':'o'} pelo rigor com a prova.`});
  if(S.g.ind.jz>=65)F.push({sg:1,t:'Sua boa relação com a vara pesou a favor.'});
  let res,dm=0,val=0,omis=null;
  if(c.lado==='autor')res=['improc','parc','proc'][lv];else res=['proc','parc','improc'][lv];
  if(c.t==='neg'){const askDm=!!ped.dm;
    if(c.hid.outra){F.push({sg:-1,t:c.rev.outra?'A inscrição anterior legítima afastou o dano moral (Súmula 385).':'Você foi surpreendido pela inscrição anterior da cliente: não perguntou no atendimento. Sem dano moral (Súmula 385).',a:['SUM-STJ385'],j:'há inscrição anterior legítima em nome da autora, o que afasta a indenização por dano moral (Súmula 385 do STJ), ressalvado o direito ao cancelamento'});if(res==='proc'&&askDm)res='parc'}
    if(res!=='improc'&&askDm&&!c.hid.outra)dm=Math.round(c.v.dm*(res==='proc'?R(.7,1):R(.45,.6))/500)*500;
    if(res==='parc'&&!c.hid.outra&&askDm&&lv===1)dm=Math.round(c.v.dm*.5/500)*500;
    if(res==='proc'&&!askDm&&!c.hid.outra)F.push({sg:-1,t:'Você não pediu dano moral, que era cabível.'});
    val=dm;}
  if(c.t==='acid'){if(res==='proc')val=c.v.dmat+(chance(.3)?Math.round(c.v.dmor*.4/500)*500:0);else if(res==='parc')val=Math.round(c.v.dmat/2/100)*100;
    if(res==='parc'&&!(ped['945']))res='proc',val=c.v.dmat,F.push({sg:-1,t:'Você não pediu, nem subsidiariamente, o reconhecimento da culpa concorrente.',a:['CC-945'],j:'não houve pedido subsidiário de redução da indenização pela culpa concorrente'});}
  if(c.t==='saude'){if(res==='proc')dm=Math.round(c.v.dm*R(.6,1)*(c.cirLate?1.3:1)/500)*500;if(res==='proc'&&!ped.dm)res='parc',F.push({sg:-1,t:'Você não pediu dano moral.'});val=dm}
  if(c.lado==='autor'&&res==='proc'&&dm>0&&chance(.22)){omis='dano moral';res='parc';c.omDm=dm;dm=0;val=0}
  c.sent={res,s,p,lv,F,dm,val,omis,d:S.g.date};c.sentD=S.g.date;
}
const winOf=c=>{const r=c.sent?c.sent.res:null;if(!r)return 0;return c.lado==='autor'?(r==='proc'?1:r==='parc'?.5:0):(r==='improc'?1:r==='parc'?.5:0)};
function sentText(c){const T=TPL[c.t],st=c.sent,P=partes(c),J=c.juiz,jec=c.rito==='jec';const L=[];
  L.push(`Vistos. Trata-se de ação ajuizada por ${P.a}${/representad/.test(P.a)?',':''} em face de ${nd(P.r)}.${jec?' Dispensado o relatório.':' É o relatório. Decido.'}`);
  const JF=st.F.filter(f=>f.j),fav=JF.filter(f=>c.lado==='autor'?f.sg>0:f.sg<0),con=JF.filter(f=>c.lado==='autor'?f.sg<0:f.sg>0);
  const lst=a=>a.map((f,i)=>`(${'abcdefgh'[i]}) ${f.j}`).join('; ')+'.';
  if(fav.length)L.push(`Os elementos dos autos favorecem a pretensão autoral: ${lst(fav)}`);
  if(con.length)L.push(`${fav.length?'Por outro lado, militam contra a pretensão autoral':'Os elementos dos autos não sustentam a pretensão autoral'}: ${lst(con)}`);
  const lbl={proc:'PROCEDENTE',parc:'PARCIALMENTE PROCEDENTE',improc:'IMPROCEDENTE'}[st.res];
  const ds=T.dispo(c,{res:st.res,decl:c.t==='neg'&&st.res!=='improc',dm:st.dm,val:st.val});
  L.push(`Ante o exposto, JULGO ${lbl} o pedido, com resolução do mérito (CPC, art. 487, I)${st.res!=='improc'&&ds.length?', para '+ds.join('; e ')+'.':'.'}`);
  if(st.omis)L.push('<i>(A sentença não diz uma palavra sobre o pedido de dano moral.)</i>');
  L.push(jec?'Sem custas e honorários no primeiro grau (Lei 9.099, art. 55).':'Custas e honorários pela parte vencida.');
  L.push(`P.R.I. ${CITY()}, ${fmtExt(c.sentD||st.d||S.g.date)}. — ${J.n}, ${J.f?'Juíza':'Juiz'} de Direito.`);
  return {L,lbl}}

/* ---------- eventos do tribunal ---------- */
const COURT={
  despacho(c){if(c.emenda&&c.emenda.length){pz(c,'emenda',15,'Emenda da inicial',['CPC-321']);c.fase='emenda';dje(c,'Despacho: emende-se a inicial',`Intime-se a parte autora para, no prazo de 15 (quinze) dias, emendar a petição inicial, corrigindo: ${c.emenda.join('; ')}. Pena de indeferimento.`,['CPC-321'])}
    else if(c.t==='neg'&&c.mres&&c.mres.ped&&c.mres.ped.tut&&c.tut==null){const ok=chance(clamp(.5+.3*c.sc.peca+(c.rev.ext?.1:0)-(c.hid.outra?.35:0),.08,.92));c.tut=ok;audAt(c,'conc',RI(18,24));
      dje(c,ok?'Decisão: tutela de urgência DEFERIDA':'Decisão: tutela de urgência INDEFERIDA',ok?`Presentes a probabilidade do direito (a autora nega a contratação e a ré não juntou contrato) e o perigo de dano (restrição de crédito), DEFIRO a tutela para determinar a exclusão do nome da autora dos cadastros de inadimplentes em 5 dias. Cite-se. Designo sessão de conciliação para ${fmtD(c.aud.d)}.`:`${c.hid.outra?'Há outra inscrição em nome da autora, o que afasta o perigo de dano decorrente desta. ':'Não vislumbro, neste momento, a probabilidade do direito. '}INDEFIRO a tutela. Cite-se. Designo sessão de conciliação para ${fmtD(c.aud.d)}.`,['CPC-300']);
      if(ok){c.sat=clamp(c.sat+12,0,100);msg(c.cli.n,`${DRF()}, tiraram meu nome! Fui na loja e o crediário passou. Nem acredito.`,c.id)}else{c.sat=clamp(c.sat-6,0,100);msg(c.cli.n,`${DRF()}, o juiz não tirou meu nome ainda? O que isso quer dizer?`,c.id)}}
    else{audAt(c,'conc',RI(18,24));dje(c,'Despacho: cite-se e designe-se audiência',`Recebo a inicial. Cite-se a ré. ${c.rito==='jec'?'Designo sessão de conciliação':'Designo audiência de conciliação'} para ${fmtD(c.aud.d)}.`,['CPC-334'])}},
  tutela(c){const lau=c.hid.laudo&&c.rev.laudo,p=.28+(lau?.38:c.hid.laudo?.12:0)+.32*c.sc.peca+(c.mres&&c.mres.ped&&c.mres.ped.tut?0:-.6);c.tut=chance(clamp(p,.05,.95));
    if(c.tut){audAt(c,'conc',RI(18,24));dje(c,'Decisão: tutela de urgência DEFERIDA',`Presentes a probabilidade do direito${lau?', demonstrada pelo laudo médico que atesta a urgência,':''} e o perigo de dano, DEFIRO a tutela de urgência para determinar que a ré autorize e custeie a cirurgia em 48 horas, sob pena de multa diária de R$ 5.000. Cite-se.`,['CPC-300']);c.sat=clamp(c.sat+20,0,100);bump('cli',3);msg(c.cli.n,`${DRF()}!!! O hospital ligou. Autorizaram! Eu tô tremendo. Obrigada, obrigada, obrigada.`,c.id);snd('win')}
    else{pz(c,'agravo',15,'Agravo de instrumento',['CPC-1015']);c.fase='agravo';dje(c,'Decisão: tutela de urgência INDEFERIDA',`Não vislumbro, neste momento, elementos que evidenciem a probabilidade do direito${lau?'':', ausente laudo que ateste a urgência'}. INDEFIRO a tutela. Cite-se.`,['CPC-300']);c.sat=clamp(c.sat-10,0,100);msg(c.cli.n,`${c.juiz.f?'A juíza':'O juiz'} negou? Como assim negou? ${DRF()}, a cirurgia é daqui a poucos dias. O que a gente faz agora?`,c.id);snd('lose')}},
  agravoRes(c){const ok=chance(clamp(.45+.4*(c.sc.agr||0)+(c.hid.laudo?.1:0),.1,.92));if(ok){c.tut=true;msg(c.cli.n,'O TJ mandou fazer! O hospital confirmou a data. Eu não sei nem o que dizer.',c.id);c.sat=clamp(c.sat+22,0,100);bump('rep',2);snd('win')}else{c.sat=clamp(c.sat-10,0,100);snd('lose')}
    audAt(c,'conc',RI(14,20));dje(c,ok?'TJ: agravo PROVIDO, tutela concedida':'TJ: agravo desprovido',ok?'O relator deu efeito ativo ao agravo: a ré deve autorizar a cirurgia em 48 horas.':'O tribunal manteve a decisão de primeiro grau.',['CPC-1015'])},
  contestRe(c){pz(c,'replica',15,'Réplica',['CPC-350','CPC-351']);c.fase='replica';dje(c,'Contestação juntada: manifeste-se o autor',c.t==='neg'?`A ré contestou: diz que a linha foi contratada por telefone e junta uma tela do sistema${c.hid.outra?`, além de extrato com inscrição anterior da autora, da ${c.v.loja2}`:''}. Intime-se a parte autora para réplica em 15 dias.`:`A ré contestou: alega doença preexistente e falta de cobertura contratual. Intime-se a parte autora para réplica em 15 dias.`,['CPC-350'])},
  saneam(c){pz(c,'saneamento',15,'Rol de testemunhas',['CPC-357']);c.fase='saneamento';dje(c,'Decisão de saneamento e organização',`Fixo como pontos controvertidos a dinâmica do acidente e a extensão dos danos. O ônus da prova segue o art. 373 do CPC. Defiro a prova testemunhal: rol em até 15 dias.`,['CPC-357','CPC-373'])},
  sentenca(c){computeSent(c);c.jcAny=null;c.fase='pos';const w=winOf(c);if(c.sent.omis)pz(c,'embargos',5,'Embargos de declaração (depois, o recurso)',['CPC-1023']);else if(w<1)pz(c,'recurso',c.rito==='jec'?10:15,c.rito==='jec'?'Recurso inominado':'Apelação',[c.rito==='jec'?'L9099-42':'CPC-1003']);else c.prazo=null;
    auto(c,`Sentença: ${{proc:'procedente',parc:'parcialmente procedente',improc:'improcedente'}[c.sent.res]}.`);S.g.pop.push({k:'sent',c:c.id})},
  embRes(c){if(c.omDm){c.sent.res='proc';c.sent.dm=c.omDm;c.sent.val=c.omDm;c.omDm=0}c.sent.omis=null;c.fase='pos';const w=winOf(c);if(w<1)pz(c,'recurso',c.rito==='jec'?10:15,c.rito==='jec'?'Recurso inominado':'Apelação',[c.rito==='jec'?'L9099-42':'CPC-1003']);else c.prazo=null;c.embDone=1;
    dje(c,'Embargos de declaração ACOLHIDOS',`Acolho os embargos para suprir a omissão: condeno a ré a pagar ${money(c.sent.dm)} a título de danos morais. ${w<1?'Reabre-se o prazo recursal.':''}`,['CPC-1022','CPC-1026']);snd('win')},
  recRival(c){if(chance(advOf(c).rec)){c.recBy='rival';const jec=c.rito==='jec';pz(c,'contrarraz',jec?10:15,'Contrarrazões',[jec?'L9099-42':'CPC-1010']);c.fase='contrarraz';dje(c,'A parte contrária recorreu: apresente contrarrazões',`${advT(c)} interpôs ${jec?'recurso inominado':'apelação'} pedindo a reforma da sentença. Intime-se a parte recorrida para contrarrazões em ${jec?'10':'15'} dias.`,[jec?'L9099-42':'CPC-1010'])}else{auto(c,'Certificado o trânsito em julgado.');afterFinal(c)}},
  acordao(c){const s=strength(c),before=c.sent.res;let txt;
    if(c.recBy==='me'){const ok=chance(clamp(s-.2+(c.recQ||0)*.15,.08,.65));if(ok){c.sent.res=c.lado==='autor'?(c.sent.res==='improc'?'parc':'proc'):(c.sent.res==='proc'?'parc':'improc');if(c.t==='neg'&&c.sent.res!=='improc'&&!c.hid.outra&&!c.sent.dm)c.sent.dm=Math.round(c.v.dm*.6/500)*500;if(c.t==='acid')c.sent.val=c.sent.res==='parc'?Math.round(c.v.dmat/2/100)*100:0;if(c.t==='saude'&&c.sent.res==='proc')c.sent.dm=Math.round(c.v.dm*.6/500)*500;c.sent.val=c.lado==='autor'?c.sent.dm:c.sent.val;txt='O recurso foi PROVIDO. A decisão melhorou para o seu cliente.';snd('win')}else{txt='O recurso foi DESPROVIDO. A sentença foi mantida.';snd('lose')}}
    else{const keep=chance(clamp(.55+.3*s+((c.crQ==null?.6:c.crQ)-.6)*.4,.25,.95));if(keep){txt='O recurso da parte contrária foi DESPROVIDO. Vitória mantida.';snd('win')}else{c.sent.res='parc';if(c.lado==='autor'){c.sent.dm=Math.round((c.sent.dm||0)*.5/500)*500;c.sent.val=c.sent.dm}else c.sent.val=Math.round(c.v.dmat/2/100)*100;txt='O tribunal deu parcial provimento ao recurso da parte contrária.';snd('lose')}}
    const jr=pick(['Des. ','Desa. '])+pname(chance(.5)),rk={proc:'procedente',parc:'parcialmente procedente',improc:'improcedente'},mudou=before!==c.sent.res,quem=c.recBy==='me'?(c.lado==='autor'?'autora':'ré'):(c.lado==='autor'?'ré':'autora');
    const tese=c.recBy==='me'?(c.recTese||''):(c.crQ>=.8?'As contrarrazões demonstraram que a sentença examinou corretamente a prova.':c.crQ===0?'Não foram apresentadas contrarrazões.':'');
    txt=`<b>${c.rito==='jec'?'Turma Recursal':'Câmara Cível do '+TJ()} · Relator${jr.startsWith('Desa')?'a':''}: ${esc(jr)}</b><br><i>Ementa:</i> ${c.rito==='jec'?'Recurso inominado':'Apelação cível'}. ${esc(TPL[c.t].nome)}. ${mudou?'Reforma parcial da sentença.':'Sentença mantida.'}<br><i>Dispositivo:</i> ${mudou?'DERAM provimento':'NEGARAM provimento'} ao recurso da parte ${quem}. A decisão passa a ser: pedido ${rk[c.sent.res]}${c.sent.res!=='improc'&&(c.sent.dm||c.sent.val)?`, com condenação de ${money(c.sent.val||c.sent.dm)}`:''}.${tese?' '+esc(tese):''} ${txt}`;
    dje(c,(c.rito==='jec'?'Turma Recursal':TJ())+': acórdão publicado',txt,[c.rito==='jec'?'L9099-41':'CPC-1009']);afterFinal(c)},
  pagto(c){const amt=c.sent.val||c.sent.dm||0;if(c.cumprOK&&chance(.7)){c.paid=amt;dje(c,'Pagamento realizado',`A ré depositou ${money(amt)} no prazo. ${c.t==='saude'?'O valor fica em conta judicial em nome do menor.':'Expeça-se alvará.'}`,['CPC-523']);closeCase(c,'final')}
    else{const jec=c.rito==='jec';c.paid=Math.round(amt*(jec?1.1:1.2));dje(c,'Sem pagamento: multa e penhora online',`Não houve pagamento voluntário. Acrescento multa de 10%${jec?' (no Juizado, sem honorários no 1º grau: Lei 9.099, art. 55)':' e honorários de 10%'}. Deferida a penhora online: bloqueados ${money(c.paid)}${c.t==='saude'?', a serem depositados em conta judicial em nome do menor':''}.`,['CPC-523'].concat(jec?['L9099-55']:[]));closeCase(c,'final')}}
};
function noDeal(c){c.aud=null;
  if(c.rito==='jec'){audAt(c,'aij',RI(14,22))}
  else if(c.lado==='reu'){const early=['atend','estrat'].includes(c.fase);pz(c,'contest',15,'Contestação',['CPC-335']);if(!early)c.fase='contest';dje(c,'Conciliação infrutífera',`Não houve acordo. O prazo de contestação começa a correr da audiência (CPC, art. 335, I): 15 dias úteis.${early?' Termine o atendimento e assine o contrato e a procuração para contestar.':''}`,['CPC-335'])}
  else{waitEv(c,'contestRe',RI(12,15))}}
function afterFinal(c,late){const w=winOf(c);const amt=c.sent?(c.sent.val||c.sent.dm||0):0;
  if(c.lado==='autor'&&w>0&&amt>0&&!late){c.prazo=null;c.fase='cumpr';pz(c,'cumpr',30,'Pedir o cumprimento de sentença',['CPC-523']);auto(c,'Trânsito em julgado. Possível pedir o cumprimento de sentença.')}
  else closeCase(c,'final')}
/* proveito econômico do cliente: débito afastado + condenação (ou valor do acordo) */
function proveito(c,how,info){if(c.lado!=='autor')return 0;let p=0;
  if(how==='acordo')p=(info&&info.amt)||c.paid||0;else if(c.sent&&c.sent.res!=='improc')p=c.paid||c.sent.val||c.sent.dm||0;else return 0;
  if(c.t==='neg')p+=c.v.div;return p}
function feeOf(c,how,info){const hon=c.hon||{pct:0,fixo:0};let fee=0;if(['indef','ext'].includes(how))return 0;
  if(c.lado==='autor'){const base=hon.base==='dm'?(how==='acordo'?((info&&info.amt)||0):((c.sent&&c.sent.dm)||0)):proveito(c,how,info);fee+=hon.pct*base;
    const sb=c.t==='saude'?(c.v.cir+((c.sent&&c.sent.dm)||0)):TPL[c.t].val(c);
    if(how!=='acordo'&&c.rito!=='jec'&&c.sent)fee+=(c.sent.res==='proc'?.1:c.sent.res==='parc'?.05:0)*sb}
  else if(how!=='acordo'&&c.rito!=='jec'&&c.sent)fee+=(c.sent.res==='improc'?.1:c.sent.res==='parc'?.05:0)*TPL[c.t].val(c);
  return fee}
function closeCase(c,how,info){const G=S.g;if(c.done)return;c.done=true;c.fase='fim';c.prazo=null;c.wait=null;c.aud=null;c.how=how;
  let w=how==='acordo'?(info.good?1:.5):['indef','ext'].includes(how)?0:winOf(c);c.win=w;
  if(how==='acordo'&&c.lado==='autor')c.paid=info.amt||0;
  let fee=Math.round(feeOf(c,how,info||{}));const share=Math.round(fee*.25);c.fee=fee;c.share=share;G.fee+=fee;G.earn+=share;
  const ch=[];if(share)ch.push(bump('cx',share));
  if(how==='acordo'){G.stats.acc++;ch.push(...fx([['rep',2],['cli',info.good?4:1],['jz',1]]))}
  const AR=(G.advRec=G.advRec||{})[c.adv||'prado']=(G.advRec[c.adv||'prado']||{w:0,l:0});const isP=(c.adv||'prado')==='prado';
  if(how==='acordo'){}else if(w>=1){G.stats.won++;AR.w++;if(isP)G.rival.w++;ch.push(...fx([['rep',5],['cli',5],['st',-6]]))}
  else if(w>0){G.stats.part++;ch.push(...fx([['rep',2],['cli',1]]))}
  else{G.stats.lost++;AR.l++;if(isP)G.rival.l++;ch.push(...fx([['rep',-2],['cli',-4],['st',4]]))}
  G.stats.closed++;c.sat=clamp(c.sat+(w>=1?25:w>0?5:-15),0,100);
  G.pop.push({k:'epi',c:c.id,ch});
  if(!G.t1Done&&G.stats.won+G.stats.part+G.stats.lost>=3&&how!=='acordo'&&(G.t1Done=1))G.pop.push({k:'info',tit:'Fim da Temporada 1',sub:'Carreira',txt:`<p>Três processos levados até a sentença. A ${MENTOR.t} te chama na sala dela e fecha a porta.</p><p>"Você tem estômago pra isso. Daqui a pouco vai querer o próprio escritório. Quando chegar a hora, eu te ajudo."</p><p class="mu sm">A carreira solo (captar clientes, definir honorários, abrir o próprio escritório) chega na próxima atualização. Até lá, novos casos continuam chegando.</p>`})}

/* ---------- formulários de decisão (por fase) ---------- */
function formDef(c){const T=TPL[c.t],jec=c.rito==='jec';
  if(c.fase==='estrat')return {tit:'Estratégia, contrato e procuração',intro:'Antes de qualquer peça: rito, honorários, procuração e expectativa do cliente.',groups:T.estrat(c),hrs:1,done:doneEstrat};
  if(c.fase==='replica'&&c.t==='neg')return {tit:'Réplica',intro:'A operadora diz que a linha foi contratada por telefone e junta uma tela do próprio sistema. Você tem 15 dias para responder.',a:['CPC-350','CPC-351'],hrs:3,groups:[
    {id:'tela',l:'Como responder à tela do sistema?',opts:[
      {l:'Impugnar: é prova unilateral, sem assinatura nem gravação; com o ônus invertido, cabia à ré provar a contratação',ok:1,a:['CDC-6','CPC-373'],eff:c=>{c.sc.prova+=.18}},
      {l:'Dizer que a tela pode ser verdadeira, mas pedir a compreensão do juiz',ok:0,fb:'Admitir a versão da ré contra a própria cliente entrega o caso.',eff:c=>{c.sc.prova-=.15}},
      {l:'Não responder: o juiz percebe sozinho',ok:0,fb:'Documento novo sem impugnação fica de pé. A réplica existe para isso.',a:['CPC-350']}]},
    ...(c.hid.outra?[{id:'s385',l:'E a inscrição anterior que a ré juntou?',opts:[
      {l:'Reconhecer que ela era legítima e concentrar o pedido no cancelamento e na declaração de inexistência',ok:1,a:['SUM-STJ385']},
      {l:'Dizer que a inscrição anterior também é falsa',ok:0,fb:'A cliente devia aquela prestação. Negar fato verdadeiro é alterar a verdade dos fatos.',a:['CPC-80'],fx:[['jz',-4],['et',-2]]},
      {l:'Insistir que o dano moral é devido mesmo assim',ok:.2,fb:'A Súmula 385 afasta o dano moral quando há inscrição legítima anterior. Insistir só gasta crédito com o juiz.',a:['SUM-STJ385']}]}]:[]),
    {id:'prv',l:'Provas',opts:[
      {l:'Pedir o julgamento antecipado: a prova é documental e o ônus é da ré',ok:1,a:['CPC-355'],eff:c=>{c.sc.prova+=.05}},
      {l:'Pedir perícia grafotécnica',ok:0,fb:'Não há assinatura a periciar: a cliente nunca assinou nada.',fx:[['jz',-2]]}]}],done:c=>{waitEv(c,'sentenca',RI(12,20));auto(c,'Réplica protocolada pela autora.');}};
  if(c.fase==='replica')return {tit:'Réplica',intro:`O plano alegou doença preexistente: é fato impeditivo do direito do autor. Você tem 15 dias para responder.`,a:['CPC-350','CPC-351'],hrs:3,groups:[
    {id:'pre',l:'Como responder à preexistência?',opts:[
      {l:'O plano não exigiu exame prévio nem provou má-fé: a recusa por preexistência é ilícita, e o ônus de provar fato impeditivo é da ré',ok:1,a:['SUM-STJ609','CPC-373','L9656-12'],eff:c=>{c.sc.prova+=.15}},
      {l:'Admitir que pode haver preexistência, mas pedir compaixão',ok:0,fb:'Admitir fato controvertido contra o próprio cliente entrega o caso.',eff:c=>{c.sc.prova-=.15}},
      {l:'Não precisa responder: o juiz já sabe',ok:0,fb:'A réplica existe para isso. Sem ela, a alegação fica sem resposta.',a:['CPC-350']}]},
    {id:'prv',l:'Provas',opts:[
      {l:'Pedir o julgamento antecipado: a prova é documental e suficiente',ok:1,a:['CPC-355'],eff:c=>{c.sc.prova+=.05}},
      {l:'Pedir perícia médica',ok:.6,fb:'Possível, mas atrasa. Com laudo e negativa por escrito, a prova documental basta.'},
      {l:'Pedir depoimento de vizinhos',ok:0,fb:'Prova inútil: vizinhos não sabem nada da cobertura.',fx:[['jz',-2]]}]}],done:c=>{waitEv(c,'sentenca',RI(12,20));auto(c,'Réplica protocolada pelo autor.');}};
  if(c.fase==='saneamento'){const cam=c.hid.cam&&c.rev.cam,ped=!!c.rev.ped,known=cam||ped;return {tit:'Apresentar rol de testemunhas',intro:'A decisão de saneamento abriu prazo para o rol (CPC, art. 357, §4º). Escolha quem você vai arrolar entre as testemunhas que conheceu no atendimento.',a:['CPC-357'],hrs:1,groups:[
    {id:'rol',l:'Quem vai no rol?',opts:[
      ...(cam&&ped?[{l:`As duas testemunhas: ${c.v.testR} e ${c.v.ped}`,d:'Até 3 por fato, e até 10 no total (CPC, art. 357, §6º).',ok:1,a:['CPC-357'],eff:c=>{c.sc.prova+=.09;c.rol='both'}}]:[]),
      ...(cam?[{l:`${c.v.testR}, ${FARM(c).slice(2)} da ${c.v.farm}, que viu a batida`,d:'Testemunha presencial e sem vínculo com as partes.',ok:ped?.8:1,fb:ped?'Boa escolha, mas dava para arrolar as duas testemunhas presenciais.':'',a:['CPC-357'],eff:c=>{c.sc.prova+=.06;c.rol='farm'}}]:[]),
      ...(ped?[{l:`${c.v.ped}, que esperava no ponto de ônibus`,d:'Testemunha presencial, a alguns metros do cruzamento.',ok:cam?.6:1,fb:cam?`Boa testemunha, mas dava para arrolar as duas, e ${FARM(c)} estava mais perto e tem o vídeo.`:'',a:['CPC-357'],eff:c=>{c.sc.prova+=.04;c.rol='ped'}}]:[]),
      {l:`${c.cli.n}, o próprio cliente`,ok:0,fb:'Parte não depõe como testemunha. O cliente fala em depoimento pessoal, que é outra prova.',a:['CPC-447'],eff:c=>{c.rol=null;c.noTest=1}},
      {l:'Não arrolar ninguém',ok:known?0:.6,fb:known?'Você conhecia uma testemunha e abriu mão dela.':'Sem nenhuma testemunha identificada no atendimento, não havia quem arrolar. Faltou perguntar.',eff:c=>{c.rol=null;c.noTest=1}}]},
    {id:'out',l:'Outras provas',opts:[
      ...(cam?[{l:`Juntar o vídeo da câmera da ${c.v.farm}`,ok:1,eff:c=>{c.sc.prova+=.22}}]:[]),
      {l:'Pedir perícia de engenharia de tráfego',ok:.3,fb:'Cara e lenta para um acidente que testemunha e vídeo resolvem. O juízo não gosta de prova inútil.',fx:[['jz',-2]]},
      {l:'Nenhuma outra prova',ok:cam?.3:1,fb:cam?'Você tinha um vídeo e não usou.':''}]}],done:c=>{c.prazo=null;c.jc=0;c.saneDone=1;auto(c,`O autor apresentou o rol de testemunhas (${c.v.testA}).`);auto(c,c.rol?`Rol de testemunhas apresentado pelo réu, por sua defesa: ${c.rol==='both'?c.v.testR+' e '+c.v.ped:c.rol==='farm'?c.v.testR:c.v.ped}.`:'O réu não arrolou testemunhas.');audAt(c,'aij',RI(18,25))}}}
  if(c.fase==='agravo')return {tit:'Tutela negada: e agora?',intro:`A cirurgia está marcada. ${esc(first(c.cli.n))} liga a cada hora.`,a:['CPC-1015'],hrs:4,groups:[
    {id:'rec',l:'Qual recurso?',opts:[
      {l:'Agravo de instrumento ao Tribunal, em 15 dias úteis',ok:1,a:['CPC-1015','CPC-1003'],set:c=>{c.agOK=1}},
      {l:'Apelação',ok:0,fb:'Apelação é contra sentença. Contra decisão interlocutória sobre tutela, cabe agravo de instrumento.',a:['CPC-1009','CPC-1015']},
      {l:'Esperar a sentença',ok:0,fb:'A criança não pode esperar a sentença. A tutela negada se ataca com agravo de instrumento.',a:['CPC-1015']}]},
    {id:'urg',l:'Pedido ao relator',opts:[
      {l:'Pedir antecipação da tutela recursal, com o laudo e a data da cirurgia',ok:1,eff:c=>{c.sc.agr=(c.sc.agr||0)+.5}},
      {l:'Só o agravo, sem pedido urgente',ok:.4,fb:'Sem pedido urgente, o agravo pode ser julgado depois da data da cirurgia.'}]}],
    done:c=>{if(c.agOK){c.sc.agr=(c.sc.agr||0)+.3;waitEv(c,'agravoRes',RI(3,6));auto(c,'Agravo de instrumento interposto no '+TJ()+'.')}else{audAt(c,'conc',RI(14,20));dje(c,'Recurso não conhecido','O recurso escolhido não cabe contra decisão interlocutória sobre tutela provisória.',['CPC-1015'])}}};
  if(c.fase==='pos'){const st=c.sent,w=winOf(c),G=[];
    if(st.omis&&!c.embExp)G.push({id:'emb',l:'A sentença tem algum vício?',opts:[
      {l:`Sim: omissão sobre o pedido de ${st.omis}. Opor embargos de declaração (5 dias)`,ok:1,a:['CPC-1022','CPC-1023'],set:c=>{c.embOp=1}},
      {l:'Apelar direto, sem embargar',ok:.3,fb:'A omissão se corrige com embargos de declaração, que são mais rápidos e interrompem o prazo do recurso.',a:['CPC-1022','CPC-1026']},
      {l:'Aceitar a sentença como está',ok:0,fb:'O juiz esqueceu um pedido. Sem embargos, ele fica sem resposta.',a:['CPC-1022']}]});
    else if(!c.embDone&&!st.omis)G.push({id:'emb',l:'A sentença tem algum vício?',opts:[
      {l:'Não há omissão, contradição ou obscuridade: não embargar',ok:1,a:['CPC-1022']},
      {l:'Embargar mesmo assim, para ganhar prazo',ok:0,fb:'Embargos manifestamente protelatórios geram multa de até 2% do valor da causa.',a:['CPC-1026'],fx:[['jz',-4],['cx',-150]]}]});
    if(w<1||st.omis){const RI_=recInfo(c),noOk=RI_.strong?.3:1,noFb=RI_.strong?'Havia tese para recurso: '+RI_.tese:'Boa orientação. '+RI_.tese,yesOk=RI_.strong?1:.4,yesFb=RI_.strong?'Tese do recurso: '+RI_.tese:'O recurso cabe, mas a tese é fraca. '+RI_.tese;
      G.push({id:'rec',l:'Recorrer?',opts:jec?[
      {l:'Recurso inominado, em 10 dias, para a Turma Recursal',ok:yesOk,fb:yesFb,a:['L9099-41','L9099-42'].concat(RI_.a),set:c=>{c.recT='ok'}},
      {l:'Apelação, em 15 dias úteis',ok:0,fb:'No Juizado não cabe apelação: cabe recurso inominado, em 10 dias. É o erro clássico.',a:['L9099-41','L9099-42'],set:c=>{c.recT='bad'}},
      {l:'Não recorrer e orientar o cliente',kind:'no',ok:noOk,fb:noFb,a:RI_.a,set:c=>{c.recT='no'}}]:[
      {l:'Apelação, em 15 dias úteis',ok:yesOk,fb:yesFb,a:['CPC-1009','CPC-1003'].concat(RI_.a),set:c=>{c.recT='ok'}},
      {l:'Recurso inominado, em 10 dias',ok:0,fb:'Recurso inominado é do Juizado. Na Vara Cível, contra sentença, cabe apelação.',a:['CPC-1009','L9099-41'],set:c=>{c.recT='bad'}},
      {l:'Agravo de instrumento',ok:0,fb:'Agravo é contra decisão interlocutória do rol do art. 1.015. Contra sentença, apelação.',a:['CPC-1015','CPC-1009'],set:c=>{c.recT='bad'}},
      {l:'Não recorrer e orientar o cliente',kind:'no',ok:noOk,fb:noFb,a:RI_.a,set:c=>{c.recT='no'}}]});
      const recSel=c.fa&&c.fa.rec!=null?G[G.length-1].opts[c.fa.rec]:null;
      if(recSel&&recSel.kind!=='no')G.push({id:'prep',l:jec?'Preparo (Juizado: em até 48 horas após a interposição)':'Preparo',opts:[
        {l:jec?'Recolher o preparo nas 48 horas seguintes à interposição, sem esperar intimação':'Recolher o preparo e juntar o comprovante com o recurso',ok:1,a:[jec?'L9099-42':'CPC-1007'],set:c=>{c.prepOK=1}},
        {l:'Recolher só quando o juiz mandar',ok:0,fb:jec?'No Juizado, o preparo é feito em 48 horas, independentemente de intimação, sob pena de deserção.':'Sem preparo na interposição, você será intimado a pagar em dobro, sob pena de deserção.',a:[jec?'L9099-42':'CPC-1007'],set:c=>{c.prepOK=0}}]});
      else if(recSel)c.prepOK=1}
    return {tit:'Depois da sentença',intro:'Leia a sentença com lupa antes de decidir.',hrs:1,groups:G,done:donePos}}
  if(c.fase==='contrarraz')return {tit:'Contrarrazões',intro:`${advT(c)} recorreu. As contrarrazões são a sua chance de defender a sentença antes do julgamento.`,a:[c.rito==='jec'?'L9099-42':'CPC-1010'],hrs:3,groups:[
    {id:'cr',l:'O que você sustenta?',opts:[
      {l:'Que a sentença examinou corretamente a prova e o direito, rebatendo ponto a ponto as razões do recurso',ok:1,eff:c=>{c.crQ=1}},
      {l:'Que o recurso é protelatório, sem enfrentar os argumentos',ok:.3,fb:'Chamar de protelatório sem enfrentar os argumentos não convence o tribunal.',eff:c=>{c.crQ=.4}},
      {l:'Concordar com parte do recurso, para parecer razoável',ok:0,fb:'Contrarrazões defendem a decisão favorável ao seu cliente. Concordar com o recurso entrega o que foi ganho.',eff:c=>{c.crQ=.1}}]},
    {id:'pq',l:'Algum pedido a mais?',opts:[
      {l:'Nenhum: contrarrazões não servem para pedir a reforma a seu favor (para isso, recurso próprio ou adesivo)',ok:1},
      {l:'Pedir, nas contrarrazões, o aumento da condenação',ok:0,fb:'Pedido de reforma a favor de quem não recorreu exige recurso próprio. Nas contrarrazões, ele não é conhecido.'}]}],done:c=>{waitEv(c,'acordao',RI(40,65));auto(c,`Contrarrazões apresentadas pela parte ${c.lado==='autor'?(c.cli.f?'autora':'autora'):'ré'}.`)}};
  if(c.fase==='cumpr')return {tit:'Cumprimento de sentença',intro:`A decisão transitou em julgado. Hora de transformar a vitória em dinheiro na conta de ${esc(first(c.cli.n))}.`,a:['CPC-523'],hrs:1,groups:[
    {id:'req',l:'O que pedir?',opts:[
      {l:'Requerer o cumprimento, com intimação da ré para pagar em 15 dias',ok:1,a:['CPC-523'],set:c=>{c.cumprOK=1}},
      {l:'Esperar a ré pagar espontaneamente, sem pedir nada',ok:0,fb:'O cumprimento definitivo depende de requerimento do exequente.',a:['CPC-523'],set:c=>{c.cumprOK=0}}]},
    {id:'pen',l:'Penhora online',opts:[
      {l:'Só se não houver pagamento no prazo de 15 dias',ok:1,a:['CPC-523']},
      {l:'Já, junto com o requerimento',ok:0,fb:'Antes do prazo de 15 dias, o devedor tem o direito de pagar. A penhora vem depois (art. 523, §3º).',a:['CPC-523'],fx:[['jz',-2]]}]}],done:c=>{waitEv(c,'pagto',16);auto(c,'Requerido o cumprimento de sentença.')}};
  return null}
function doneEstrat(c){const G=S.g;auto(c,'Contrato de honorários e procuração assinados.');const hon=c.hon||{pct:.3,fixo:0};
  if(hon.fixo){const sh=Math.round(hon.fixo*.25);c.fb.ch.push(bump('cx',sh));G.fee+=hon.fixo;G.earn+=sh}
  if(c.lado==='autor')c.fase='inicial';else if(c.prazo&&c.prazo.tp==='contest')c.fase='contest';else if(c.aud)c.fase='aguarda';else audAt(c,'conc',RI(15,20))}
function recInfo(c){const st=c.sent,r=st.res,s=strength(c);
  if(c.revel&&c.lado==='reu')return {strong:false,tese:'Seu cliente foi revel. Na apelação não dá para trazer fatos que não foram alegados em primeiro grau, salvo força maior (art. 1.014). Restaria discutir o valor da condenação.',a:['CPC-344','CPC-1014']};
  if(c.t==='neg'){if(c.hid.outra&&r!=='proc')return {strong:false,tese:'A anotação anterior da cliente era legítima e a sentença afastou o dano moral pela Súmula 385. Recorrer só para insistir nele é apostar contra a jurisprudência do STJ.',a:['SUM-STJ385']};
    if(r==='improc')return {strong:s>=.38,tese:'A ré não provou a contratação (ônus invertido) e a tela de sistema é prova unilateral; a negativação indevida gera dano moral.',a:['CDC-6','CDC-14','CC-186']};
    return {strong:true,tese:'O dano moral foi fixado abaixo do pedido: dá para pedir a majoração, já que a negativação indevida, com constrangimento público, é grave.',a:['CC-186','CC-927']}}
  if(c.t==='acid'){if(r==='proc')return {strong:s>=.38,tese:'Cabia ao autor provar a culpa do réu (art. 373, I); a mudança de faixa sem seta e o uso do celular indicam culpa exclusiva do autor ou, no mínimo, culpa concorrente (art. 945).',a:['CPC-373','CC-945']};
    return {strong:!!(c.hid.cam&&c.rev.cam),tese:c.hid.cam&&c.rev.cam?'O vídeo da câmera mostra a mudança de faixa sem seta: dá para pedir o reconhecimento da culpa exclusiva do autor e afastar a condenação.':'Sem vídeo nem testemunha forte, afastar a culpa concorrente é difícil. A metade do dano já é um resultado razoável.',a:['CC-945','CPC-373']}}
  if(r==='improc')return {strong:true,tese:'O laudo atesta a urgência e o plano não provou a preexistência, que é fato impeditivo e ônus da ré (art. 373, II).',a:['CPC-373','CPC-300']};
  return {strong:true,tese:'A recusa indevida de cobertura urgente gera dano moral: a sentença negou esse pedido e cabe recurso para obtê-lo.',a:['CC-186','CDC-14']}}
function donePos(c){const jec=c.rito==='jec';
  if(c.embOp){c.embOp=0;if(c.embExp||uteisAte(c.sentD,S.g.date)>5){dje(c,'Embargos não conhecidos: intempestivos','Os embargos foram opostos depois do prazo de 5 dias.',['CPC-1023']);c.sent.omis=null;c.omDm=0;c.embDone=1;return}
    c.prazo=null;waitEv(c,'embRes',RI(5,8));auto(c,'Opostos embargos de declaração.');return}
  if(c.recT==='ok'){c.prazo=null;if(!c.prepOK){if(jec){dje(c,'Recurso deserto','O preparo não foi feito em 48 horas. Recurso não conhecido (deserção).',['L9099-42']);afterFinal(c);return}bump('cx',-300);auto(c,'Preparo recolhido em dobro.')}
    c.recBy='me';c.recQ=1;c.recTese=recInfo(c).tese;waitEv(c,'acordao',RI(40,65));auto(c,jec?'Interposto recurso inominado.':'Interposta apelação.');return}
  if(c.recT==='bad'){c.prazo=null;dje(c,'Recurso não conhecido',jec?'No Juizado, contra sentença, cabe recurso inominado (Lei 9.099, art. 41), em 10 dias. A apelação não foi conhecida.':'O recurso escolhido não cabe contra sentença.',[jec?'L9099-41':'CPC-1009']);afterFinal(c);return}
  c.prazo=null;if(winOf(c)>=1)waitEv(c,'recRival',RI(10,14));else afterFinal(c)}
function submitForm(c){const F=formDef(c);if(!F)return;const ans=c.fa||{};if(F.groups.some(gr=>ans[gr.id]==null))return toast('Responda todos os itens.');
  if(!spend(F.hrs))return;const items=[],ch=[];let tot=0;
  F.groups.forEach(gr=>{const o=gr.opts[ans[gr.id]];if(!o)return;tot+=o.ok;items.push({ok:o.ok>=1?1:o.ok>=.5?.5:0,l:gr.l,c:o.l,t:o.fb||(o.ok>=1?'Boa decisão.':''),a:o.a||[]});ch.push(...fx(o.fx));if(o.set)o.set(c);if(o.eff)o.eff(c)});
  const sc=tot/F.groups.length;ch.push(...fx(sc>=.9?[['jz',1],['cli',1]]:sc<.5?[['cli',-2]]:[]));
  c.fb={tit:F.tit,items,ch,sc};c.fa={};snd(sc>=.8?'ok':'no');const f0=c.fase,P0=c.prazo;F.done(c,ans,sc);
  /* ato praticado: baixa o prazo da fase que acabou de ser cumprida */
  if(P0&&c.prazo===P0&&PZF[P0.tp]===f0)c.prazo=null;save();render()}
const PZF={saneamento:'saneamento',contest:'contest',replica:'replica',emenda:'emenda',agravo:'agravo',recurso:'pos',embargos:'pos',cumpr:'cumpr',contrarraz:'contrarraz'};
/* garante que todo prazo aberto tenha a ação correspondente na tela */
function syncFase(c){if(!c.done&&c.prazo&&c.fase==='aguarda'&&!c.ai&&PZF[c.prazo.tp]&&!(c.wait&&PZF[c.prazo.tp]!=='pos'))c.fase=PZF[c.prazo.tp]}

/* ---------- atendimento ---------- */
function ask(c,id){const T=TPL[c.t],q=T.atq.find(x=>x.id===id);if(!q||c.asked.includes(q.id)||c.asked.length>=4)return;if(!spend(.5))return;c.asked.push(q.id);if(q.rev)c.rev[q.rev]=1;if(q.f&&atqRv(c,q))c.rev[q.f]=1;if(q.fx)fx(q.fx);if(q.flag)c[q.flag]=1;save();render()}
function endAtend(c){const T=TPL[c.t];const good=c.asked.map(id=>T.atq.find(q=>q.id===id)).filter(q=>q&&q.good>=1).length;const hidden=[...new Set(T.atq.filter(q=>q.f&&c.hid[q.f]&&!c.rev[q.f]).map(q=>q.f))];
  const items=[{ok:good>=3?1:good>=2?.5:0,l:'Perguntas',c:`${good} de ${c.asked.length} perguntas úteis`,t:good>=3?'Bom atendimento: você foi atrás dos fatos que decidem o caso.':'Faltou cavar os fatos. Cliente quase nunca conta tudo de primeira.'}];
  if(hidden.length)items.push({ok:0,l:'Ficou de fora',c:'Algum fato importante ficou sem pergunta',t:'Ainda há algo que o cliente não contou. Isso pode aparecer na pior hora.'});
  const ch=fx(good>=3?[['cli',3]]:[['cli',-1]]);c.sat=clamp(c.sat+(good>=3?8:0),0,100);c.fb={tit:'Atendimento concluído',items,ch};c.fase='estrat';auto(c,'Primeiro atendimento ao cliente.');save();render()}

/* ---------- montador de peças ---------- */
function montBlocks(c){return TPL[c.t].mont(c)}
function mInit(c){if(!c.m)c.m={i:0,a:{}};const b=montBlocks(c)[c.m.i];if(b&&b.k==='fatos'&&!c.m.a.fatos)c.m.a.fatos={ord:shuffle(b.items.map(x=>x.id)),off:{}};if(b&&!c.m.a[b.k])c.m.a[b.k]=b.k==='end'||b.k==='prelim'||b.k==='valor'?{sel:null}:b.k==='imp'?{v:{}}:{ch:{}};return c.m}
function valorOpts(c){const B=montBlocks(c),ped=B.find(b=>b.k==='ped'),ch=(c.m.a.ped&&c.m.a.ped.ch)||{};const vals=ped.opts.filter((o,i)=>ch[i]&&o.val).map(o=>o.val);const sum=vals.reduce((a,b)=>a+b,0);const all=ped.opts.filter(o=>o.val).map(o=>o.val);
  const set=new Set([sum,Math.max(...all,0),all[0]||1000,40*SM]);if(set.size<4)set.add(sum+5000);return {sum,opts:[...set].filter(x=>x>0).sort((a,b)=>a-b)}}
function gradeBlock(c,b){const a=c.m.a[b.k]||{},fb=[];let s=0;
  if(b.k==='end'||b.k==='prelim'){const o=b.opts[a.sel];s=o?o.ok:0;if(o&&o.ok>=1)fb.push([1,'Correto.']);else fb.push([0,(o&&o.why)||'Nenhuma opção escolhida.',b.a])}
  else if(b.k==='qual'){const ch=a.ch||{};let R=0,r=0,d=0;const miss=[],extra=[];b.items.forEach((it,i)=>{if(it.ok){R++;if(ch[i])r++;else miss.push(it.l)}else if(ch[i]){d++;extra.push(it.l)}});s=clamp(r/R-.25*d,0,1);
    if(miss.length)fb.push([0,'Faltou: '+miss.map(lowerFirst).join(', ')+'.',['CPC-319']]);if(extra.length)fb.push([0,'Desnecessário: '+extra.map(lowerFirst).join(', ')+'.']);if(!miss.length&&!extra.length)fb.push([1,'Qualificação completa, como pede o art. 319, II.'])}
  else if(b.k==='fatos'){const ord=a.ord||[],off=a.off||{},it=id=>b.items.find(x=>x.id===id);const rel=b.items.filter(x=>x.rel),irr=b.items.filter(x=>!x.rel);const kept=ord.filter(id=>!off[id]).map(it);
    const relK=kept.filter(x=>x.rel),irrK=kept.filter(x=>!x.rel);let pairs=0,okp=0;for(let i=0;i<relK.length;i++)for(let j=i+1;j<relK.length;j++){pairs++;if(relK[i].o<relK[j].o)okp++}const os=pairs?okp/pairs:1;
    s=.5*relK.length/rel.length+.25*(irr.length?1-irrK.length/irr.length:1)+.25*os;
    rel.filter(x=>off[x.id]).forEach(x=>fb.push([0,'Você descartou um fato essencial: "'+x.t+'"']));irrK.forEach(x=>fb.push([0,'"'+x.t+'" '+x.why]));if(os<1)fb.push([0,'A narrativa ficou fora de ordem. Conte os fatos na sequência em que aconteceram.']);if(s>=.99)fb.push([1,'Fatos relevantes, na ordem certa, sem nada que prejudique o cliente.'])}
  else if(b.k==='fund'){const ch=a.ch||{};const sel=b.opts.filter((o,i)=>ch[i]);const tg=Math.min(3,b.opts.filter(o=>o.ok>=1).length);const gs=sel.reduce((x,o)=>x+(o.ok>=.5?o.ok:0),0),bad=sel.filter(o=>o.ok<.5);s=clamp(gs/tg-.34*bad.length,0,1);if(sel.length<2||sel.length>4){s=Math.min(s,.5);fb.push([0,'Escolha de 2 a 4 fundamentos.'])}
    bad.forEach(o=>fb.push([0,o.l+': '+o.why,o.a]));sel.filter(o=>o.ok>0&&o.ok<1&&o.why).forEach(o=>fb.push([.5,o.l+': '+o.why,o.a]));if(!bad.length&&s>=.9)fb.push([1,'Fundamentação sólida.'])}
  else if(b.k==='ped'||b.k==='prov'){const ch=a.ch||{};let n=0,okc=0;b.opts.forEach((o,i)=>{if(o.ok>0&&o.ok<1){if(ch[i]&&o.why)fb.push([.5,o.l+': '+o.why,o.a]);return}n++;const on=!!ch[i];if(on===(o.ok>=1))okc++;else if(on)fb.push([0,o.l+': '+(o.why||'não cabe aqui.'),o.a]);else fb.push([0,'Faltou '+(b.k==='ped'?'pedir':'indicar')+': '+lowerFirst(o.l)+'.'+(o.miss?' '+o.miss:''),o.miss?['CPC-336','CPC-357']:o.a])});s=n?okc/n:1;if(s>=.99)fb.push([1,b.k==='ped'?'Pedidos certos, todos decorrentes dos fatos.':'Provas úteis e suficientes.'])}
  else if(b.k==='valor'){const V=valorOpts(c);s=a.sel===V.sum?1:0;fb.push(s?[1,`Correto: ${money(V.sum)}, a soma dos pedidos com valor econômico.`]:[0,`Valor errado. Com pedidos cumulados, o valor da causa é a soma de todos eles: ${money(V.sum)} (CPC, art. 292, V e VI).`,['CPC-292']])}
  else if(b.k==='imp'){const v=a.v||{};let ok=0;b.items.forEach((it,i)=>{const ans=v[i];const want=typeof it.imp==='function'?it.imp(c):it.imp;if(ans===want)ok++;else if(want&&ans!==1)fb.push([0,`Não impugnado: "${it.t}" presume-se verdadeiro. ${it.why}`,['CPC-341']]);else fb.push([0,`"${it.t}": ${it.why}`,['CPC-80']])});s=ok/b.items.length;if(s>=.99)fb.push([1,'Cada fato foi enfrentado de forma específica.'])}
  return {s:clamp(s,0,1),fb}}
function protocol(c,ctx){const B=montBlocks(c);const res=B.map(b=>({k:b.k,t:b.t,a:b.a,...gradeBlock(c,b)}));const sc=res.reduce((x,r)=>x+r.s,0)/res.length;
  const idAns=k=>{const o={},bb=B.find(b=>b.k===k);if(bb){const ch=(c.m.a[k]&&c.m.a[k].ch)||{};bb.opts.forEach((x,i)=>{if(ch[i]&&x.id)o[x.id]=1})}return o};
  const pedAns=idAns('ped');
  c.mres={sc,res,ped:pedAns,prov:idAns('prov')};
  if(ctx==='exam')return sc;
  if(ctx==='emenda'){if(!spend(2))return}else{if(!spend(5))return;c.sc.peca=sc;c.mA=JSON.parse(JSON.stringify(c.m.a))}const ch=fx(sc>=.85?[['jz',2],['rep',1]]:sc<.5?[['jz',-3]]:[]);
  const T=TPL[c.t];
  if(ctx==='emenda'){const q=res.find(r=>r.k==='qual'),v=res.find(r=>r.k==='valor');const still=(q&&q.s<.7)||(v&&v.s<1);c.mA=JSON.parse(JSON.stringify(c.m.a));c.m=null;c.prazo=null;
    if(still){auto(c,'Emenda insuficiente.');dje(c,'Sentença: petição inicial indeferida','A emenda não corrigiu o que foi determinado. Indefiro a petição inicial (art. 321, parágrafo único).',['CPC-321']);closeCase(c,'indef');save();render();toTop();return}
    c.sc.peca=Math.max(c.sc.peca,sc*.9);c.emenda=[];c.emK=[];auto(c,'Emenda à inicial protocolada.');waitEv(c,'despacho',RI(3,6));c.fb={tit:`Emenda protocolada — nota da peça ${f1(sc*10)}/10`,blocks:res.filter(r=>['qual','valor'].includes(r.k)),ch:[]};snd('ok');save();render();toTop();return}
  if(T.peca==='inicial'){const q=res.find(r=>r.k==='qual'),v=res.find(r=>r.k==='valor'),e=res.find(r=>r.k==='end');c.emenda=[];c.emK=[];if(q&&q.s<.7){c.emenda.push('a qualificação completa das partes (art. 319, II)');c.emK.push('qual')}if(v&&v.s<1){c.emenda.push('o valor da causa (art. 292)');c.emK.push('valor')}
    if(e&&e.s===0){bump('jz',-3);c.redistrib=1}auto(c,'Petição inicial protocolada.'+(c.redistrib?' Endereçamento equivocado: autos redistribuídos.':''));
    if(c.t==='saude')waitEv(c,'tutela',RI(2,4)+(c.redistrib?6:0)+(c.slow?4:0));else waitEv(c,'despacho',RI(3,6)+(c.redistrib?8:0))}
  else{auto(c,'Contestação protocolada.');waitEv(c,'saneam',RI(16,24));c.prazo=null}
  c.fb={tit:(T.peca==='inicial'?'Petição inicial':'Contestação')+` protocolada — nota ${f1(sc*10)}/10`,blocks:res,ch};c.m=null;snd(sc>=.75?'ok':'no');save();render();toTop()}

/* ---------- conciliação ---------- */
function concInfo(c){const T=TPL[c.t],claim=T.val(c)||1000,s=strength(c);
  const A=advOf(c);if(c.lado==='autor'){const fair=claim*s,offer=round100(claim*clamp(s,.25,.9)*(c.concR||(c.concR=R(.42,.62)))*A.off);return {claim,fair,offer,counter:round100(claim*.85)}}
  const fair=claim*(1-s),offer=round100(claim*(c.concR||(c.concR=R(.5,.7)))/A.off);return {claim,fair,offer,counter:round100(claim*.3)}}
function concDo(c,v){const I=concInfo(c),G=S.g;if(!c.aud||c.aud.ok)return;G.h=Math.max(0,Math.round((G.h-3)*10)/10);bump('st',3);
  c.aud=null;let items=[],ch=[];
  const good=c.lado==='autor'?I.offer>=.75*I.fair:I.offer<=1.25*I.fair;
  if(v==='aceita'){items.push({ok:good?1:.5,l:'Acordo',c:`Fechado em ${money(I.offer)}`,t:c.lado==='autor'?(good?'Acordo bom: valor perto do que a causa vale, sem o risco e a demora do processo.':'Acordo abaixo do que a causa valia. Às vezes vale a paz, mas o cliente pode se arrepender.'):(good?'Acordo razoável: seu cliente paga menos do que o risco de uma condenação justificaria.':'Acordo caro: seu cliente pagou mais do que o risco justificava. Talvez valesse arriscar a defesa.'),a:['CPC-3','CPC-487']});
    auto(c,`Acordo homologado: ${money(I.offer)}.`);c.fb={tit:'Audiência de conciliação',items,ch};closeCase(c,'acordo',{amt:I.offer,good})}
  else if(v==='contra'){const p=clamp((c.lado==='autor'?strength(c)-.12:strength(c)-.05)+advOf(c).cnt,.08,.85);if(chance(p)){items.push({ok:1,l:'Contraproposta',c:`Aceita: ${money(I.counter)}`,t:`${advT(c)} consulta o cliente por telefone e aceita.`,a:['CPC-3']});auto(c,`Acordo homologado: ${money(I.counter)}.`);c.fb={tit:'Audiência de conciliação',items,ch};closeCase(c,'acordo',{amt:I.counter,good:true})}
    else{items.push({ok:.5,l:'Contraproposta',c:'Recusada',t:`"Sem chance, ${DOUT()}." Sem acordo, o processo segue.`});c.fb={tit:'Audiência de conciliação',items,ch};noDeal(c)}}
  else{items.push({ok:good?.5:1,l:'Proposta',c:'Recusada',t:good?'A proposta era razoável. Recusar é apostar na sentença.':'Recusar uma proposta ruim foi a decisão certa.'});bump('st',2);c.fb={tit:'Audiência de conciliação',items,ch};noDeal(c)}
  save();render();toTop()}

/* ---------- audiência de instrução ---------- */
function pickQ(c,arr){return arr[hashS(c.id+'q')%arr.length]}
const JZ=c=>c.juiz&&c.juiz.f?'A juíza':'O juiz';
function aijSteps(c){return TPL[c.t].aij?TPL[c.t].aij(c):[]}
function aijStart(c){if(c.ai)return;spend(Math.min(4,S.g.h))||(S.g.h=0);bump('st',4);c.ai={i:0,pk:[],shown:false};c.aud.ok=true;save();render()}
function aijChoose(c,i){const st=aijSteps(c)[c.ai.i];if(c.ai.shown)return;const o=st.opts[i];c.ai.sel=i;c.ai.shown=true;if(o.eff)o.eff(c);c.ai.ch=fx(o.fx);snd(o.ok>=1?'ok':'no');save();render()}
function aijAsk(c,i){const st=aijSteps(c)[c.ai.i];if(c.ai.pk.includes(i)||c.ai.pk.length>=st.pick)return;c.ai.pk.push(i);const q=st.qs[i];(c.aiQ=c.aiQ||[]).push(q.k||i);c.sc.prova+=q.eff||0;fx(q.fx);snd(q.ok?'ok':'no');save();render()}
function aijNext(c){const n=aijSteps(c).length;c.ai.i++;c.ai.pk=[];c.ai.shown=false;c.ai.sel=null;if(c.ai.i>=n){c.ai=null;c.aud=null;c.fase='alg';UI.txt='';UI.txt2='';auto(c,'Audiência de instrução: provas produzidas.')}save();render();toTop()}

/* ---------- texto livre: alegações finais ---------- */
const STOP=new Set('a o e de da do das dos em no na nos nas um uma uns umas que se por para pra com sem nao mas ou como ao aos foi ser sao era esta esse essa isso este isto ele ela eles elas seu sua seus suas meu minha nosso nossa ja tambem quando entao porque pois mais muito ha tem ter foram sido pelo pela pelos pelas sobre entre ate depois antes so mesmo assim todo toda cada qual quem onde lhe me te nos vos excelencia doutor doutora senhor senhora juiz juiza'.split(' '));
const JARG=['data venia','in casu','outrossim','destarte','ex positis','mormente','precipuamente'];
function esc2(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function findTerm(n,t){const pre=t.endsWith('*'),b=esc2(pre?t.slice(0,-1):t);const re=new RegExp('(^|[^a-z0-9])('+b+(pre?'[a-z]*':'s?')+')(?![a-z0-9])','g');const out=[];let m;while((m=re.exec(n)))out.push({i:m.index+m[1].length,w:m[2]});return out}
const has2=(n,list)=>list.filter(t=>findTerm(n,t).length);
function negated(n,i){const before=n.slice(Math.max(0,i-60),i).trim().split(/\s+/).slice(-5).join(' ');return /(^| )(nao|nunca|jamais|nem|sem)( |$)|alega que|diz que|afirma que|sustenta que|segundo o autor|segundo a re|teria/.test(before)}
function sentences(t){const A=/\b(arts?|inc|incs|fls|dr|dra|sr|sra|n|nº|par|al)\./gi;return String(t||'').replace(A,m=>m.slice(0,-1)+'\u2024').split(/(?<=[.!?;])\s+|\n+/).map(x=>x.replace(/\u2024/g,'.').trim()).filter(x=>x.length>3)}
function gradeAlg(t,A){const ss=sentences(t),n=norm(t),words=n.split(/[^a-z0-9%]+/).filter(Boolean),w=words.length,fb=[];let s=22;const seen=new Set(),hits=[];
  ss.forEach(se=>{const ns=norm(se);const m=has2(ns,A.kw).filter(x=>!seen.has(x)&&findTerm(ns,x).some(z=>!negated(ns,z.i))).slice(0,2);m.forEach(x=>seen.add(x));if(m.length)hits.push(se)});
  const kf=seen.size;s+=Math.min(kf,6)*8;fb.push([kf>=3?1:0,kf>=3?`Usou os fatos e as provas do caso (${kf} pontos)`:'Faltou trazer os fatos e as provas do caso. Diga o que aconteceu e o que provou.',hits.slice(0,2)]);
  const jg=has2(n,JARG).length;if(jg>=2){s-=4;fb.push([0,'Juridiquês demais. Juiz quer clareza, não latim.'])}
  const REV={'282':'319','297':'335','405':'447','273':'300','475-j':'523','515':'1.013','522':'1.015'};const rv=Object.keys(REV).filter(k=>new RegExp('art\\.?\\s*'+k.replace('-','\\-')+'(?![0-9])').test(n)&&!/cpc\/?15|2015/.test(n)&&(/cpc|codigo de processo/.test(n)));
  if(rv.length){s-=6;fb.push([0,`Artigo do CPC/73, revogado: art. ${rv[0]} (no CPC/2015, art. ${REV[rv[0]]}).`])}
  const ped=has2(n,['requer*','pede*','pedido*','procedencia','improcedencia','condena*','julg*','reconhec*']).length>0;if(ped)s+=10;fb.push([ped?1:0,ped?'Fechou com um pedido claro':'Terminou sem pedir nada: diga o que quer que o juiz decida.']);
  const bad=[];ss.forEach(se=>{const ns=norm(se);A.neg.forEach(k=>findTerm(ns,k).forEach(m=>{if(!negated(ns,m.i)&&!bad.includes(se))bad.push(se)}))});if(bad.length){s-=24;fb.push([0,'Argumento contra o próprio cliente',bad.slice(0,2)])}
  const stop=words.filter(x=>STOP.has(x)).length;if(w>=8&&stop/w<.2){s-=30;fb.push([0,'Parece uma lista de palavras soltas, não uma argumentação.'])}
  if(w<30){s-=15;fb.push([0,`Curto demais (${w} palavras). Você tem 20 minutos.`])}else if(w>280){s-=5;fb.push([0,`Longo demais (${w} palavras). Seja objetivo.`])}else s+=8;
  return {s:Math.round(clamp(s,0,100)),fb}}
/* checa a resposta contra os fatos do caso (ex.: Súmula 385 com anotação anterior legítima) */
function factCheck(t,c,fact){const n=norm(t);
  if(fact==='s385'&&c.hid.outra){
    /* cada termo passa pela checagem de negação: "não cabe dano moral" é admissão, não insistência */
    const hit=(ns,t)=>findTerm(ns,t).some(m=>!negated(ns,m.i));let insists=false,admits=false;
    sentences(t).forEach(se=>{const ns=norm(se);
      if(/nao se aplica|nao incide|afast\w* a sumula|superar a sumula/.test(ns))insists=true;
      if(['cabe dano moral','dano moral e devido','dano moral devido','merece indeniza*','direito ao dano moral','mantem o dano moral','faz jus ao dano moral'].some(x=>hit(ns,x)))insists=true;
      if(['reconhec*','admit*','de fato','realmente','aplica-se','se aplica','incide','legitim*','afasta*','procede'].some(x=>hit(ns,x))||/nao (cabe|ha|e devido|tem direito ao) dano moral|sem dano moral/.test(ns))admits=true});
    if(insists||!admits)return {cap:40,msg:'A anotação anterior da cliente era legítima: a Súmula 385 se aplica e afasta o dano moral. A resposta honesta reconhece isso e defende o cancelamento e a declaração de inexistência do débito.',a:['SUM-STJ385']}}
  return null}
function gradeQ(t,Q,c){const n=norm(t),ss=sentences(t);let k=0;const seen=new Set();ss.forEach(se=>{const ns=norm(se);has2(ns,Q.kw).forEach(x=>{if(findTerm(ns,x).some(z=>!negated(ns,z.i)))seen.add(x)})});k=seen.size;let s=k>=2?90:k===1?60:20;const bad=ss.filter(se=>Q.neg.some(x=>findTerm(norm(se),x).some(m=>!negated(norm(se),m.i))));if(bad.length)s-=40;if(n.split(/\s+/).length<6)s-=15;const fc=c&&Q.fact?factCheck(t,c,Q.fact):null;if(fc)s=Math.min(s,fc.cap);return {s:clamp(s,0,100),bad,fc}}
function algSubmit(c){const A=TPL[c.t].alg(c);if(!c.algR){if(norm(UI.txt).split(/\s+/).filter(Boolean).length<5)return toast('Escreva suas alegações (pelo menos algumas frases).');const r=gradeAlg(UI.txt,A);if(c.t==='neg'&&c.hid.outra&&c.rev.outra&&/dano moral/.test(norm(UI.txt))&&!/385/.test(norm(UI.txt))){r.s=Math.max(0,r.s-15);r.fb.push([0,'Você sabia da inscrição anterior legítima e pediu dano moral sem enfrentar a Súmula 385.'])}c.algR={t:UI.txt,r};UI.txt2='';snd('tick')}
  else if(!c.algR.q){if(norm(UI.txt2).split(/\s+/).filter(Boolean).length<3)return toast('Responda ao juiz em uma ou duas frases.');c.algR.q=gradeQ(UI.txt2,A.q,c);c.algR.qt=UI.txt2;c.sc.alg=(c.algR.r.s*.7+c.algR.q.s*.3)/100;c.algDone=1;fx(c.sc.alg>=.7?[['jz',2]]:c.sc.alg<.4?[['jz',-1]]:[]);snd(c.sc.alg>=.6?'ok':'no')}
  save();render()}
function algFinish(c){c.algR.done=1;auto(c,'Alegações finais orais. Autos conclusos para sentença.');waitEv(c,'sentenca',RI(9,16));save();render();toTop()}

/* ---------- dilemas éticos ---------- */
function evChoose(i){const P=S.g.pop[0],E=EVT.find(e=>e.id===P.id);if(P.sel!=null)return;const o=E.opts[i];P.sel=i;P.ch=fx(o.fx);if(o.inf){S.g.inf++;S.g.ted.push({d:S.g.date,t:`Representação ético-disciplinar: ${E.tit.toLowerCase()}.`})}S.g.evDone.push(E.id);snd(o.ok>=1?'ok':'no');checkTED();save();render()}

