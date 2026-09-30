const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const els=new Map();
function el(key){if(!els.has(key))els.set(key,{innerHTML:'',textContent:'',value:'',open:false,isConnected:true,classList:{add(){},remove(){},toggle(){},contains(){return false;}},setAttribute(){},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},focus(){},scrollIntoView(){},insertAdjacentHTML(pos,html){this.innerHTML+=html;}});return els.get(key);}
const sandbox={document:{querySelector:el,querySelectorAll:()=>[],activeElement:null,addEventListener(){},title:''},location:{hash:''},window:{addEventListener(){},scrollTo(){}},setTimeout,clearTimeout,console,matchMedia:()=>({matches:false})};vm.createContext(sandbox);
for(const file of ['app.js','match-center.js','analytics.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
for(const route of ['overview','matches','analytics','lineups','players','transfers','compare','valuation','sources']){sandbox.location.hash='#'+route;run('render()');assert(el('#main').innerHTML.includes('<h1>'));assert(!/NaN|undefined/.test(el('#main').innerHTML),route);}
assert(run('archiveTeams.every(t=>t.starters.length===11&&t.subs.length===9&&new Set([...t.starters,...t.subs].map(p=>p[0])).size===20)'));
assert.equal(run('analysisEvents.filter(e=>e.type==="touch").length'),880);
assert.equal(run('analysisEvents.filter(e=>e.type==="shot").length'),25);
assert(run('analysisEvents.every(e=>e.x>=0&&e.x<=100&&e.y>=0&&e.y<=100&&e.minute>=1&&e.minute<=90)'));
for(const a of [.1,1.5,4])for(const b of [.1,1.2,4]){const odds=run(`poissonOutcome(${a},${b})`);assert(Math.abs(odds.reduce((x,y)=>x+y)-100)<1e-9);assert(odds.every(x=>x>=0&&x<=100));}
assert(Math.abs(run('poissonOutcome(1.5,1.5)[0]-poissonOutcome(1.5,1.5)[2]'))<1e-9);
assert(run('poissonOutcome(4,.1)[0]>poissonOutcome(.1,4)[0]'));
for(let side=0;side<2;side++)for(const period of ['all','first','second']){
run(`lab.team=${side};lab.period='${period}';lab.minute=90;lab.player='all'`);
const touches=run('selectedEvents().filter(e=>e.type==="touch").length');
assert.equal(run('eventStats().reduce((n,r)=>n+r.touches,0)'),touches);
assert(Math.abs(run('eventStats().reduce((n,r)=>n+r.xg,0)')-run('sum(selectedEvents().filter(e=>e.type==="shot"),"xg")'))<1e-9);
assert(!/NaN|undefined/.test(run('labOutput()')));
}
run('lab.minute=0');assert.equal(run('periodEvents().length'),0);assert(!/NaN/.test(run('labOutput()')));
run("lab.query='Doan Van Hau'");assert.equal(run('filteredTransfers().length'),1);
run("lab.query='';lab.transferType='in'");assert.equal(run('filteredTransfers().length'),4);
run("state.league='V.League 2'");assert.equal(run('filteredTransfers().length'),0);assert(!run('lineupsPage()').includes('named-pitch'));
console.log('PASS: 9 routes; 40 verified roster entries; event totals, periods and player aggregation; empty timeline; normalized Poisson outcomes; Vietnamese transfer filters; missing league data.');


