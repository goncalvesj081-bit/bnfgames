'use strict';
/* SUITS · base: utilidades, versão, save, som, calendário, nomes, indicadores
   Scripts clássicos compartilham o escopo global (carregados em ordem pelo suits.html).
   Mapa do código e regras: CLAUDE.md na raiz do repositório. */
const $=document.getElementById('app');
const R=(a,b)=>a+Math.random()*(b-a);
const RI=(a,b)=>Math.floor(R(a,b+1));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const money=x=>(x<0?'−':'')+'R$ '+Math.abs(Math.round(x)).toLocaleString('pt-BR');
const SM=1600; /* salário mínimo de referência do jogo */

const VERSION='1.1.2',SCHEMA=1,KEY='suits_v1';
const CHANGELOG=[
  {v:'1.1.2',d:'28/11/2026',t:'Bastidores',i:['Código separado em arquivos (dados, motor e telas), para atualizações mais rápidas. Nada muda no jogo nem no save.']},
  {v:'1.1.1',d:'28/11/2026',t:'Correções do relatório de testes',i:[
    'Faltar à conciliação travava o dia com erro. Corrigido, e a multa agora é da parte, como manda o art. 334, §8º',
    'Calendário com Carnaval, Quinta e Sexta-feira Santa e Corpus Christi (CPC, art. 216)',
    'Preparo só aparece quando você recorre; combinações incoerentes não passam mais',
    'Alternativas embaralhadas na 2ª fase, no Montador e nas decisões; gabarito comentado; cronômetro pausa na correção; atalhos A–D',
    'Tutela de urgência decidida também na negativação; prazo real para a cirurgia no caso do plano de saúde',
    'Contrarrazões quando a outra parte recorre; acórdão com relator, ementa e dispositivo',
    'Prazo para o cumprimento de sentença; prazo de embargos visível na agenda',
    'Audiência do réu marcada pelo juízo na citação, não pelo contrato',
    'Sentença na voz do juiz, com a data em que foi proferida',
    'Testemunha do autor variável (cunhada, amiga íntima ou prima: nem toda parente é impedida); depoimento pessoal na instrução',
    'Emenda da inicial reabre só os blocos apontados pelo juiz',
    'Honorários: contrato explica o proveito econômico; sucumbência recíproca na vitória parcial (CPC, art. 86)',
    'Lei 9.656 (planos de saúde) e Súmulas 608 e 609 do STJ no Vade Mecum',
    'Correção de gênero, nomes repetidos, sobrenomes iguais e várias frases',
    'Pedido de devolução de prazo por justa causa (art. 223) também para contestação e réplica',
    '13 questões novas no Exame da OAB']},
  {v:'1.1.0',d:'27/11/2026',t:'Correções da Temporada 1',i:[
    'Rol de testemunhas: ação própria no processo e na aba Prazos, escolhendo as testemunhas conhecidas no atendimento',
    'Prazo de rol perdido sem ação no save antigo: pedido de devolução por justa causa (CPC, art. 223)',
    'Cinco advogados adversários, cada um com um estilo de negociar e de recorrer',
    'Casos não se repetem antes de esgotar os outros tipos, com variações de profissão, bens, procedimentos e fatos',
    'Atendimento sorteado: em cada caso, só uma das perguntas certas faz o cliente lembrar do fato escondido',
    'A resposta ao juiz agora é checada contra os fatos do caso (ex.: Súmula 385)',
    'Sentença sem frases repetidas, com os fundamentos em lista',
    'Recurso: o jogo mostra a tese que havia (ou por que não recorrer)',
    'Honorários sobre o proveito econômico, inclusive o débito declarado inexistente. Processos já encerrados recebem o acerto.',
    'Contestação explica que se protesta pela prova testemunhal e o rol vem depois do saneamento (art. 357, §4º)']},
  {v:'1.0.0',d:'27/11/2026',t:'Temporada 1 — A Beca',i:[
    'Faculdade, Exame da OAB (1ª e 2ª fase) e cerimônia de compromisso',
    'Três casos completos: negativação indevida (Juizado), acidente de trânsito (defesa) e plano de saúde com tutela de urgência',
    'Montador de Peças por blocos: petição inicial e contestação',
    'Audiências de conciliação e de instrução, com contradita e perguntas às testemunhas',
    'Alegações finais em texto livre, com pergunta do juiz',
    'Sentença, embargos, recurso inominado, apelação, agravo e cumprimento de sentença',
    'Prazos em dias úteis, feriados nacionais e recesso forense',
    'Dr. Henrique Prado, o rival do outro lado da mesa',
    'Vade Mecum com busca, favoritos, grifos e desbloqueio',
    'Oito dilemas éticos e o Tribunal de Ética e Disciplina']}
];
const ROADMAP=[
  'Advogado autônomo: captar clientes, definir honorários e abrir o próprio escritório',
  'Novos casos: cobrança com prescrição, despejo e alimentos',
  'Montador para réplica, apelação, contrarrazões, embargos e cumprimento',
  'Sustentação oral no Tribunal de Justiça',
  'Equipe: estagiários, associados e sociedade'
];

const store={mem:{},set(k,v){try{localStorage.setItem(k,v)}catch(e){this.mem[k]=v}},get(k){try{const r=localStorage.getItem(k);return r===null?(this.mem[k]||null):r}catch(e){return this.mem[k]||null}},del(k){try{localStorage.removeItem(k)}catch(e){}delete this.mem[k]}};
let S=null;
const UI={screen:'cover',tab:'painel',open:null,setup:{nome:'',sx:'f',uf:'MG'},vm:null,vq:'',vc:'',vf:false,toast:null,txt:'',txt2:'',modal:null,mute:store.get('suits_mute')==='1',sel:''};
function save(){if(S)store.set(KEY,JSON.stringify(S))}
const SAVE_VERSION=3;
/* Migração ADITIVA: só acrescenta campos novos com valor padrão.
   Nunca apaga, renomeia ou troca IDs. A chave do localStorage é a mesma. */
function migrate(s){
  if(!s||typeof s!=='object'||!s.v||s.v>SCHEMA)return null;
  if(!s.saveVersion)s.saveVersion=1;
  if(s.saveVersion<2&&s.g){const G=s.g;
    if(!G.advRec)G.advRec={};if(!G.deck)G.deck=[];if(G.lastT===undefined)G.lastT=null;
    (G.cases||[]).forEach(c=>{
      if(!c.adv)c.adv='prado';
      /* prazo já cumprido que a versão antiga esquecia de baixar (causava "prazo perdido" falso) */
      if(c.prazo&&c.fase==='aguarda'&&['replica','saneamento','agravo','cumpr'].includes(c.prazo.tp)&&(c.wait||c.aud))c.prazo=null;
      if(!c.atq)c.atq={offer:null,rv:null,legacy:1};
      if(c.t==='acid'&&c.v&&!c.v.ped)c.v.ped='Sandra Moreira';
      if(c.rol===undefined)c.rol=null;
      /* prazo de rol que ficou sem ação no save antigo: oferece devolução (CPC, art. 223) */
      if(c.noTest&&!c.done&&c.t==='acid'&&!c.ai&&!(c.sent))c.jc=1;
      if(c.prazo&&c.prazo.tp==='saneamento'&&c.fase!=='saneamento'&&!c.done)c.fase='saneamento';
    });
    s.saveVersion=2}
  if(s.saveVersion<3&&s.g){const G=s.g;
    if(!G.usedF)G.usedF=(G.cases||[]).map(c=>first(c.cli.n));
    if(G.t1Done===undefined)G.t1Done=(G.stats&&G.stats.closed>=3)?1:0;
    if(s.ex&&s.ex.perm===undefined)s.ex.perm=s.ex.q.map(()=>[0,1,2,3]);
    (G.cases||[]).forEach(c=>{
      if(c.t==='acid'&&c.v&&!c.v.wrel)c.v.wrel='cunhada';
      if(c.t==='saude'&&c.v&&!c.v.cirD)c.v.cirD=addD(c.start,c.v.dias||15);
      /* réu sem audiência marcada: o juízo designa (antes dependia do contrato) */
      if(!c.done&&c.lado==='reu'&&['atend','estrat'].includes(c.fase)&&!c.aud&&!c.prazo){let d=G.date,n=RI(10,15);while(n>0){d=addD(d,1);if(isUtil(d))n--}c.aud={tp:'conc',d};(c.autos=c.autos||[]).push({d:G.date,t:`Designada audiência de conciliação para ${fmtD(d)}.`})}
      /* cumprimento parado sem prazo */
      if(!c.done&&c.fase==='cumpr'&&!c.prazo){let d=G.date,n=15;while(n>0){d=addD(d,1);if(isUtil(d))n--}c.prazo={tp:'cumpr',n:15,ini:G.date,ate:d,lbl:'Pedir o cumprimento de sentença',a:['CPC-523']}}
    });
    s.saveVersion=3}
  return s;
}
/* acertos que precisam do jogo carregado (rodam uma vez por campo) */
function postLoad(){const G=S.g;if(!G)return;
  G.cases.forEach(c=>{if(c.done&&!c.feeFix&&c.hon&&c.hon.pct>0&&(c.fee||0)===0&&(c.win||0)>0){const fee=Math.round(feeOf(c,c.how,{amt:c.paid||0}));c.feeFix=1;if(fee>0){const sh=Math.round(fee*.25);c.fee=fee;c.share=sh;G.fee+=fee;G.earn+=sh;G.cx+=sh;msg(MENTOR.t,`Acerto de honorários: o processo de ${c.cli.n} gerou ${money(fee)} sobre o proveito econômico. Sua parte (${money(sh)}) já está no caixa.`,c.id)}}});
  save()}
function load(){try{const r=store.get(KEY);return r?migrate(JSON.parse(r)):null}catch(e){return null}}
function toast(t){UI.toast=t;render();clearTimeout(toast.h);toast.h=setTimeout(()=>{UI.toast=null;render()},2800)}
const toTop=()=>window.scrollTo(0,0);
const fmtH=h=>String(Math.round(h*10)/10).replace('.',',')+'h';
const nd=t=>String(t).replace(/\.$/,'');
const lowerFirst=t=>String(t).replace(/^./,x=>x.toLowerCase());
const g=(f,m)=>S&&S.sx==='m'?m:f;
const DR=()=>g('Dra.','Dr.');
const DOUT=()=>g('doutora','doutor');
const DRF=()=>g('Doutora','Doutor');

/* ---------- som (WebAudio, sem arquivos) ---------- */
let AC=null;
function tone(f1,f2,dur,type,vol,delay){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const n=AC.currentTime+(delay||0),o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,n);o.frequency.exponentialRampToValueAtTime(f2,n+dur);gn.gain.setValueAtTime(vol,n);gn.gain.exponentialRampToValueAtTime(.0001,n+dur);o.connect(gn);gn.connect(AC.destination);o.start(n);o.stop(n+dur+.03)}catch(e){}}
function snd(t){if(UI.mute)return;
  if(t==='thud'){tone(120,38,.45,'sine',.7);tone(60,30,.3,'triangle',.25)}
  else if(t==='win'){tone(392,392,.5,'triangle',.14);tone(523,523,.5,'triangle',.12,.12);tone(659,659,.8,'triangle',.12,.24)}
  else if(t==='lose'){tone(220,150,.8,'sawtooth',.05);tone(165,110,.9,'sine',.12,.1)}
  else if(t==='bell'){tone(880,870,.5,'sine',.1);tone(1320,1310,.35,'sine',.04)}
  else if(t==='alert'){tone(520,520,.12,'square',.05);tone(520,520,.12,'square',.05,.18)}
  else if(t==='tick'){tone(1200,1200,.03,'square',.03)}
  else if(t==='ok'){tone(660,990,.15,'sine',.08)}
  else if(t==='no'){tone(300,200,.2,'sine',.1)}
}
function shake(){document.body.classList.remove('shake');void document.body.offsetWidth;document.body.classList.add('shake');setTimeout(()=>document.body.classList.remove('shake'),500)}

/* ---------- calendário: dias úteis, feriados e recesso ---------- */
const D0=s=>{const p=s.split('-').map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]))};
const DS=d=>d.toISOString().slice(0,10);
const addD=(s,n)=>{const d=D0(s);d.setUTCDate(d.getUTCDate()+n);return DS(d)};
const wd=s=>D0(s).getUTCDay();
const FER={'01-01':'Confraternização Universal','04-21':'Tiradentes','05-01':'Dia do Trabalho','09-07':'Independência','10-12':'Nossa Senhora Aparecida','11-02':'Finados','11-15':'Proclamação da República','11-20':'Dia da Consciência Negra','12-25':'Natal'};
/* feriados móveis (forenses): Carnaval, Quinta e Sexta-feira Santa, Corpus Christi (CPC, art. 216) */
const MOV={};
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g_=Math.floor((b-f+1)/3),h=(19*a+b-d-g_+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),dd=((h+l-7*m+114)%31)+1;return `${y}-${String(mo).padStart(2,'0')}-${String(dd).padStart(2,'0')}`}
function movY(y){if(MOV[y])return MOV[y];const P=pascoa(y),o={};[[-48,'Carnaval'],[-47,'Carnaval'],[-3,'Quinta-feira Santa'],[-2,'Sexta-feira da Paixão'],[60,'Corpus Christi']].forEach(([n,t])=>{o[addD(P,n)]=t});return MOV[y]=o}
const ferNome=s=>FER[s.slice(5)]||movY(+s.slice(0,4))[s]||'';
const isFer=s=>!!ferNome(s);
const isRec=s=>{const m=+s.slice(5,7),d=+s.slice(8,10);return (m===12&&d>=20)||(m===1&&d<=20)};
const isWork=s=>wd(s)!==0&&wd(s)!==6&&!isFer(s);      /* dia de expediente */
const isUtil=s=>isWork(s)&&!isRec(s);                 /* dia que conta prazo (CPC, arts. 219 e 220) */
const nextWork=s=>{let d=addD(s,1);while(!isWork(d))d=addD(d,1);return d};
const addUteis=(s,n)=>{let d=s;while(n>0){d=addD(d,1);if(isUtil(d))n--}return d};
const uteisAte=(a,b)=>{if(b<=a)return 0;let n=0,d=a;while(d<b){d=addD(d,1);if(isUtil(d))n++}return n};
const WD=['dom','seg','ter','qua','qui','sex','sáb'];
const MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const fmtD=s=>s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4);
const fmtDs=s=>s.slice(8,10)+'/'+s.slice(5,7);
const fmtL=s=>WD[wd(s)]+', '+fmtDs(s);
const fmtExt=s=>+s.slice(8,10)+' de '+MES[+s.slice(5,7)-1]+' de '+s.slice(0,4);

/* ---------- nomes (fictícios, com lista de bloqueio) ---------- */
const FN_F=['Maria','Ana','Lúcia','Cláudia','Rosângela','Patrícia','Juliana','Fernanda','Aline','Sandra','Vera','Lurdes','Tereza','Simone','Daniela','Kátia','Marlene','Denise','Raquel','Viviane','Elaine','Jussara','Cristiane','Regina','Sueli','Tatiane','Priscila','Neusa','Edna','Rosana'];
const FN_M=['José','João','Antônio','Carlos','Paulo','Valdir','Márcio','Rogério','Edson','Luiz','Sérgio','Reinaldo','Wellington','Anderson','Cristiano','Gilberto','Adriano','Fábio','Renato','Marcos','Josué','Ademir','Leandro','Rodrigo','Elias','Nilton','Osvaldo','Raimundo','Jair','Everton'];
const SN=['Silva','Santos','Oliveira','Souza','Pereira','Costa','Rodrigues','Almeida','Nascimento','Lima','Araújo','Ferreira','Carvalho','Gomes','Martins','Rocha','Ribeiro','Barbosa','Moreira','Teixeira','Mendes','Cardoso','Correia','Batista','Freitas','Pinto','Campos','Vieira','Monteiro','Dias','Moraes','Siqueira','Fonseca','Lacerda','Peixoto','Quintino','Brandão','Toledo'];
const FAMOUS=new Set(['Fernanda Lima','Fernanda Souza','Ana Moura','Simone Mendes','João Gomes','Paulo Costa','Carlos Alberto','Daniela Mercury','Fábio Assunção','Rodrigo Santoro','Marcos Mion','Rogério Ceni','Reinaldo Azevedo','Adriano Imperador','Juliana Paes','Cláudia Raia','Patrícia Poeta','Regina Duarte','Sandra Annenberg','Leandro Lima','Edson Arantes','Marcos Pontes','Rodrigo Faro','Luiz Fernando','José Dirceu','Antônio Fagundes','Tatiane Silva','Ana Costa','Jair Rodrigues','Neusa Borges','Elaine Mickely','Ademir Silva','Raquel Dodge','Sérgio Moraes']);
function pname(f){let n,k=0;do{n=pick(f?FN_F:FN_M)+' '+pick(SN)+(chance(.5)?' '+pick(SN):'')}while((FAMOUS.has(n)||FAMOUS.has(n.split(' ').slice(0,2).join(' ')))&&++k<30);return n}
const first=n=>n.split(' ')[0];
const isF=n=>FN_F.includes(first(String(n||'')));
const surn=n=>String(n||'').split(' ').slice(1);
/* embaralhamento estável (mesma ordem a cada render), semeado por texto */
function sord(seed,n){const r=rngS(seed),a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rngS(seed){let t=hashS(String(seed))>>>0;return()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296}}

/* ---------- UFs (segmento J=8, código do tribunal) ---------- */
const UFS={AC:['Acre','Rio Branco','01'],AL:['Alagoas','Maceió','02'],AP:['Amapá','Macapá','03'],AM:['Amazonas','Manaus','04'],BA:['Bahia','Salvador','05'],CE:['Ceará','Fortaleza','06'],DF:['Distrito Federal','Brasília','07'],ES:['Espírito Santo','Vitória','08'],GO:['Goiás','Goiânia','09'],MA:['Maranhão','São Luís','10'],MT:['Mato Grosso','Cuiabá','11'],MS:['Mato Grosso do Sul','Campo Grande','12'],MG:['Minas Gerais','Belo Horizonte','13'],PA:['Pará','Belém','14'],PB:['Paraíba','João Pessoa','15'],PR:['Paraná','Curitiba','16'],PE:['Pernambuco','Recife','17'],PI:['Piauí','Teresina','18'],RJ:['Rio de Janeiro','Rio de Janeiro','19'],RN:['Rio Grande do Norte','Natal','20'],RS:['Rio Grande do Sul','Porto Alegre','21'],RO:['Rondônia','Porto Velho','22'],RR:['Roraima','Boa Vista','23'],SC:['Santa Catarina','Florianópolis','24'],SE:['Sergipe','Aracaju','25'],SP:['São Paulo','São Paulo','26'],TO:['Tocantins','Palmas','27']};
const CITY=()=>UFS[S.uf][1];
const TJ=()=>S.uf==='DF'?'TJDFT':'TJ'+S.uf;
function cnj(){const n=String(RI(1,9999999)).padStart(7,'0'),a=(S.g?S.g.date:'2028-01-01').slice(0,4),tr=UFS[S.uf][2],o=String(RI(24,9999)).padStart(4,'0');let dd='00';try{const r=Number(BigInt(n+a+'8'+tr+o+'00')%97n);dd=String(98-r).padStart(2,'0')}catch(e){}return `${n}-${dd}.${a}.8.${tr}.${o}`}

/* ---------- rostos (SVG próprio, determinístico) ---------- */
function hashS(t){let h=7;for(const c of String(t))h=(h*31+c.charCodeAt(0))>>>0;return h}
function face(name,fem,bg){
  const h=hashS(name),sk=['#F1D1B5','#E4B793','#CF9970','#B07650','#875838'][h%5],hc=['#1F1712','#3A2A1E','#6B4A2E','#2A2A2A','#9C7A4E','#A7A7A7'][(h>>3)%6];
  const sty=fem?['long','bun','bob'][(h>>6)%3]:['short','buzz','bald','side'][(h>>6)%4],gl=(h>>11)%5===0,beard=!fem&&(h>>9)%3===0;
  let o=`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg||'#E9DED2'}"/>`;
  if(sty==='long')o+=`<path d="M14 30c0-14 8-21 18-21s18 7 18 21v22H14z" fill="${hc}"/>`;
  o+=`<path d="M10 64c2-11 10-16 22-16s20 5 22 16z" fill="${fem?'#7A2433':'#3B3F4A'}"/><rect x="27" y="40" width="10" height="9" fill="${sk}"/>`;
  o+=`<ellipse cx="32" cy="29" rx="12.5" ry="14.5" fill="${sk}"/>`;
  if(sty==='short'||sty==='side')o+=`<path d="M19.5 27c0-10 5.5-14 12.5-14s12.5 4 12.5 14c-2-5-6-7-12.5-7s-10.5 2-12.5 7z" fill="${hc}"/>`;
  if(sty==='buzz')o+=`<path d="M20 25c1-8 6-11 12-11s11 3 12 11c-3-3-7-4-12-4s-9 1-12 4z" fill="${hc}" opacity=".8"/>`;
  if(sty==='bun')o+=`<circle cx="32" cy="12" r="5" fill="${hc}"/><path d="M19.5 28c0-10 5.5-14 12.5-14s12.5 4 12.5 14c-3-6-7-8-12.5-8s-9.5 2-12.5 8z" fill="${hc}"/>`;
  if(sty==='bob')o+=`<path d="M18 36c-1-15 5-22 14-22s15 7 14 22c-1-9-4-14-14-14s-13 5-14 14z" fill="${hc}"/>`;
  if(sty==='long')o+=`<path d="M19.5 28c0-10 5.5-14 12.5-14s12.5 4 12.5 14c-3-6-7-8-12.5-8s-9.5 2-12.5 8z" fill="${hc}"/>`;
  o+=`<circle cx="27" cy="30" r="1.5" fill="#2A1E18"/><circle cx="37" cy="30" r="1.5" fill="#2A1E18"/><path d="M28 37c2.5 1.6 5.5 1.6 8 0" stroke="#7A4A3A" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  if(beard)o+=`<path d="M20 31c1 10 6 13 12 13s11-3 12-13c-2 5-6 7-12 7s-10-2-12-7z" fill="${hc}" opacity=".85"/>`;
  if(gl)o+=`<g fill="none" stroke="#2A2A2A" stroke-width="1.2"><circle cx="27" cy="30" r="4"/><circle cx="37" cy="30" r="4"/><path d="M31 30h2"/></g>`;
  return o+'</svg>';
}
const SCALE='<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#A8843A" stroke-width="2"><path d="M32 8v46M18 54h28M14 18h36"/><path d="M14 18l-8 16h16zM50 18l-8 16h16z"/><path d="M6 34c0 4 4 6 8 6s8-2 8-6M42 34c0 4 4 6 8 6s8-2 8-6"/></g><circle cx="32" cy="8" r="3" fill="#A8843A"/></svg>';

/* ---------- indicadores com retorno decrescente ---------- */
const IND={rep:'Reputação',cli:'Clientes',et:'Ética (OAB)',jz:'Juízo',st:'Estresse'};
function bump(k,d){
  const G=S.g;if(k==='cx'){G.cx+=d;return {k,d}}
  let x=G.ind[k];const b=x;
  if(k==='st')x=clamp(x+d,0,100);
  else if(d>0){let r=d;while(r>1e-6){const c=x>=90?4:x>=80?2:1;const s=Math.min(1,r/c);x+=s;r-=s*c}x=Math.min(100,x);G.gain[k]=1}
  else x=Math.max(0,x+d);
  G.ind[k]=x;return {k,d:Math.round(x)-Math.round(b),raw:d,max:d>0&&x>=100};
}
function fx(list){return (list||[]).map(a=>bump(a[0],a[1])).filter(c=>c.d!==0||c.max)}
function chipsH(cs0){if(!cs0||!cs0.length)return '';const ag={};cs0.forEach(c=>{if(!c)return;const k=c.k;if(!ag[k])ag[k]={k,d:0,max:false};ag[k].d+=c.d||0;ag[k].max=ag[k].max||c.max});const cs=Object.values(ag).filter(c=>c.d!==0||c.max);if(!cs.length)return '';return '<div class="chips">'+cs.map(c=>{
  if(c.k==='cx')return `<span class="chip ${c.d>=0?'up':'dn'}">Caixa ${c.d>=0?'+':'−'}${money(Math.abs(c.d)).replace('R$ ','R$ ')}</span>`;
  const good=c.k==='st'?c.d<0:c.d>0;return `<span class="chip ${good?'up':'dn'}">${IND[c.k]} ${c.d>0?'+':''}${c.d}${c.max?' (máx.)':''}</span>`}).join('')+'</div>'}

