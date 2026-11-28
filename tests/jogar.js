const {chromium}=require('playwright');
const OUT=process.argv[2]||require('os').tmpdir();
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
await p.goto('file://'+require('path').resolve(__dirname,'../suits.html')+'#dev');
const ck=async s=>{for(let k=0;k<5;k++){try{await p.locator(s).first().click({timeout:1500});return}catch(e){if(k===4){await p.screenshot({path:'fail.png',fullPage:true});const info=await p.evaluate(()=>{const S=__suits.S;return JSON.stringify({pop:S.g.pop.map(x=>x.k),ui:__suits.UI.open,sent:__suits.UI.sent,modal:__suits.UI.modal})});throw new Error('missing '+s+' '+info)}}}};
const tryc=async s=>{if(!(await p.$(s)))return false;try{await p.locator(s).first().click({timeout:1500});return true}catch(e){return false}};
await p.screenshot({path:OUT+'/cover.png'});
await ck('[data-a=new]');await p.fill('[data-in=nome]','Teste Silva');await ck('[data-a=start]');
await ck('[data-a=tut]');await ck('[data-a=tut]');await ck('[data-a=tutPick][data-v="2027-04-26"]');await p.screenshot({path:OUT+'/tut.png'});await ck('[data-a=tut]');await ck('[data-a=oab1]');
for(let i=0;i<20;i++){await p.locator('[data-a=ans1]').nth(i%4).click();if(i===0)await p.screenshot({path:OUT+'/oab1.png'});await ck('[data-a=next1]')}
let txt=await p.textContent('body');console.log('oab1:',(txt.match(/\d+\/20/)||['?'])[0]);
await p.evaluate(()=>{__suits.act('oab2')});
for(let k=0;k<10;k++){await tryc('[data-a=mSel],[data-a=mVal]');for(let q=0;q<3;q++){if(await p.locator('[data-a=mChk]').count()>q)await p.locator('[data-a=mChk]').nth(q).click({timeout:1500}).catch(()=>{})}
 if(k===2)await p.screenshot({path:OUT+'/mont.png'});
 if(await p.$('[data-a=mExam]')){await ck('[data-a=mExam]');break}await ck('[data-a=mNext]')}
for(let i=0;i<4;i++){await ck('[data-a=ans2]');await ck('[data-a=next2]')}
txt=await p.textContent('body');console.log('oab2:',(txt.match(/APROVADO\(A\) NO EXAME|NÃO APROVADO/)||['?'])[0]);
await p.evaluate(()=>{__suits.S.phase='posse';__suits.render()});
await ck('[data-a=prometo]');
await p.screenshot({path:OUT+'/painel.png'});
let shots=0;
for(let it=0;it<1500;it++){
 const st=await p.evaluate(()=>{const S=__suits.S;return {ph:S.phase,pop:S.g.pop[0]&&S.g.pop[0].k,closed:S.g.stats.closed,date:S.g.date}});
 if(st.ph!=='car'){console.log('phase',st.ph);break}
 if(st.closed>=6){console.log('closed 6 at',st.date);break}
 if(st.pop){ if(shots<10&&['sent','dje','ev','epi','miss'].includes(st.pop)){await p.waitForTimeout(st.pop==='sent'?11000:300);await p.screenshot({path:OUT+`/pop_${shots}_${st.pop}.png`});shots++}
   if(await tryc('[data-a=evC]:not([disabled])'))continue;
   if(await tryc('[data-a=popOk]'))continue;
   if(await tryc('[data-a=popOpen]'))continue; }
 const cid=await p.evaluate(()=>{const S=__suits.S;const c=S.g.cases.find(c=>!c.done&&(c.fb||c.ai||['atend','estrat','inicial','contest','emenda','replica','saneamento','agravo','pos','cumpr','alg'].includes(c.fase)||(c.aud&&c.aud.d===S.g.date&&!c.aud.ok)));return c?c.id:null});
 let did=false;
 const sig=await p.evaluate(()=>{const S=__suits.S;return S.g.date+S.g.h+JSON.stringify(S.g.cases.map(c=>c.fase+(c.m?c.m.i:'')+(c.fb?1:0)+c.asked.length+(c.ai?c.ai.i+''+c.ai.pk.length+c.ai.shown:'')+(c.algR?1:0)))});
 if(sig===globalThis.lastSig){globalThis.same=(globalThis.same||0)+1;if(globalThis.same>3){await p.evaluate(()=>__suits.act('end'));globalThis.same=0;continue}}else globalThis.same=0;globalThis.lastSig=sig;
 if(cid){await p.evaluate(id=>__suits.act('open',id),cid);
   did=true;
   if(await tryc('[data-a=fbOk]'))continue;
   if(await tryc('[data-a=ask]'))continue;
   if(await tryc('[data-a=endAt]'))continue;
   if(await p.$('[data-a=fSel]')){const groups={};for(let r=0;r<6;r++){const vs=await p.$$eval('[data-a=fSel]',a=>a.map(x=>x.dataset.v));const nx=vs.find(v=>!groups[v.split(':')[0]]);if(!nx)break;groups[nx.split(':')[0]]=1;await ck(`[data-a=fSel][data-v="${nx}"]`)}await ck('[data-a=fGo]');continue}
   if(await tryc('[data-a=mStart]'))continue;
   if(await p.$('[data-a=mProt],[data-a=mNext]')){await tryc('[data-a=mSel],[data-a=mVal]');for(let q=0;q<3;q++){if(await p.locator('[data-a=mChk]').count()>q)await p.locator('[data-a=mChk]').nth(q).click({timeout:1500}).catch(()=>{})}for(let q=0;q<12;q+=2){if(await p.locator('[data-a=mImp]').count()>q)await p.locator('[data-a=mImp]').nth(q).click({timeout:1500}).catch(()=>{})}
     if(!(await tryc('[data-a=mProt]')))await ck('[data-a=mNext]');continue}
   if(await tryc('[data-a=emendar]'))continue;
   if(await tryc('[data-a=conc][data-v=recusa]'))continue;
   if(await tryc('[data-a=aijGo]'))continue;
   if(await tryc('[data-a=aijC]:not([disabled])'))continue;
   if(await tryc('[data-a=aijQ]:not([disabled])'))continue;
   if(await tryc('[data-a=aijN]'))continue;
   if(await p.$('[data-in=txt]')){await p.fill('[data-in=txt]','Excelência, a autora nunca contratou a linha. A tela do sistema é prova unilateral, produzida pela própria ré, sem gravação. O cadastro foi indevido e houve constrangimento público na loja. Com a inversão do ônus, a ré não provou nada. Requer a procedência dos pedidos.');await ck('[data-a=alg]');continue}
   if(await p.$('[data-in=txt2]')){await p.fill('[data-in=txt2]','A tela é unilateral e não há gravação nem assinatura, Excelência.');await ck('[data-a=alg]');continue}
   if(await tryc('[data-a=algEnd]'))continue;
 }
 await p.evaluate(()=>__suits.act('ff'));
}
const fin=await p.evaluate(()=>{const S=__suits.S;return {date:S.g.date,stats:S.g.stats,ind:S.g.ind,cx:S.g.cx,vm:S.vm.n,inf:S.g.inf,adv:S.g.advRec,cases:S.g.cases.map(c=>[c.t,c.adv,c.fase,c.how,c.win,c.fee,c.cli.n,c.cli.prof])}});
console.log(JSON.stringify(fin));
await p.evaluate(()=>__suits.act('tab','vade'));await p.screenshot({path:OUT+'/vade.png'});
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__suits.act('tab','painel'));await p.screenshot({path:OUT+'/mobile.png'});
console.log('mobile scrollWidth',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log(errs.slice(0,15).join('\n')||'no errors');await b.close()})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
