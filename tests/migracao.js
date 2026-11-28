/* Uso: node tests/migracao.js <ref-git-da-versão-antiga>   (ex.: node tests/migracao.js 44b49a0)
   Gera um save na versão antiga, carrega na versão atual e joga até o fim. */
const {chromium}=require('playwright');const {execSync}=require('child_process');const path=require('path'),os=require('os'),fs=require('fs');
const REF=process.argv[2]||'HEAD~1';const OLD=fs.mkdtempSync(path.join(os.tmpdir(),'suits-old-'));
execSync(`git archive ${REF} suits.html $(git ls-tree -d --name-only ${REF} suits) | tar -x -C ${OLD}`,{cwd:path.resolve(__dirname,'..'),shell:'/bin/bash'});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});let p=await ctx.newPage();
const errs=[];const hook=pg=>{pg.on('pageerror',e=>errs.push('PAGEERR '+e.message))};hook(p);
const ck=async s=>{for(let k=0;k<5;k++){try{await p.locator(s).first().click({timeout:1500});return}catch(e){if(k===4)throw new Error('missing '+s)}}};
const tryc=async s=>{if(!(await p.$(s)))return false;try{await p.locator(s).first().click({timeout:1500});return true}catch(e){return false}};
const OUT='.';
async function loop(N,stopFn){let shots=99;
for(let it=0;it<N;it++){if(await p.evaluate(stopFn))break;
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
}
await p.goto('file://'+OLD+'/suits.html#dev');
await p.evaluate(()=>{const A=__suits.act;A('new');A('start');__suits.S.phase='posse';A('prometo')});
await loop(2500,()=>__suits.S.g.cases.some(c=>c.prazo&&c.prazo.tp==='saneamento')&&__suits.S.g.stats.closed>=2);
const before=await p.evaluate(()=>{const S=__suits.S;return {date:S.g.date,closed:S.g.stats.closed,cases:S.g.cases.map(c=>[c.id,c.t,c.fase,c.prazo&&c.prazo.tp,c.fee])}});console.log('OLD',JSON.stringify(before));
p=await ctx.newPage();hook(p);await p.goto('file://'+require('path').resolve(__dirname,'../suits.html')+'#dev');await p.evaluate(()=>{__suits.act('continue');__suits.act('newsClose')});
const mid=await p.evaluate(()=>{const S=__suits.S;return {sv:S.saveVersion,cases:S.g.cases.map(c=>[c.id,c.t,c.fase,c.adv,c.prazo&&c.prazo.tp,c.fee,c.jc])}});console.log('NEW',JSON.stringify(mid));
await p.evaluate(()=>__suits.act('tab','prazos'));await p.screenshot({path:require('path').join(require('os').tmpdir(),'suits-prazos.png')});
await loop(2500,()=>__suits.S.g.stats.closed>=9);
const fin=await p.evaluate(()=>{const S=__suits.S;return {date:S.g.date,stats:S.g.stats,advRec:S.g.advRec,cases:S.g.cases.map(c=>[c.t,c.adv,c.fase,c.how,c.win,c.fee,c.cli.n])}});console.log('FIN',JSON.stringify(fin));
console.log(errs.slice(0,10).join('\n')||'no errors');await b.close()})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
