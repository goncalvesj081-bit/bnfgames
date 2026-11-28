/* Confere se todo artigo citado no jogo existe no Vade Mecum (suits/dados/vade.js).
   Uso: node tests/vade-refs.js   → sai com código 1 se faltar algum artigo. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const dir=path.resolve(__dirname,'../suits');
const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(f.endsWith('.js'))files.push(p)}})(dir);
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(dir,'dados/vade.js'),'utf8')+';this.VADE=VADE;',ctx);
const V=ctx.VADE,codes=Object.keys(V).join('|');const re=new RegExp(`'(${codes})-([0-9A-Z]+)'`,'g');
const miss=new Map();let total=0;const unchecked=new Set();
for(const f of files){const t=fs.readFileSync(f,'utf8');let m;while((m=re.exec(t))){total++;const [,c,a]=m;if(!V[c].arts[a])miss.set(`${c}-${a}`,path.relative(dir,f))}}
for(const c of Object.keys(V))for(const a of Object.keys(V[c].arts))if(!V[c].arts[a].ok)unchecked.add(`${c}-${a}`);
console.log(`${total} citações; ${Object.values(V).reduce((n,c)=>n+Object.keys(c.arts).length,0)} artigos no Vade; ${unchecked.size} ainda sem conferência na fonte (ok:1).`);
if(miss.size){console.log('FALTAM no VADE:');for(const [k,f] of miss)console.log('  '+k+'  ('+f+')');process.exit(1)}
console.log('Todas as citações existem no VADE.');
