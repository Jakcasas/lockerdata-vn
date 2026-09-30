const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const els=new Map();function el(key){if(!els.has(key))els.set(key,{innerHTML:'',textContent:'',value:'',open:false,isConnected:true,classList:{add(){},remove(){},toggle(){},contains(){return false;}},setAttribute(){},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},focus(){},scrollIntoView(){},insertAdjacentHTML(pos,html){this.innerHTML+=html;}});return els.get(key);}
const sandbox={URLSearchParams,document:{querySelector:el,querySelectorAll:()=>[],activeElement:null,addEventListener(){},title:''},location:{hash:''},window:{addEventListener(){},scrollTo(){},history:{replaceState(a,b,hash){sandbox.location.hash=hash;}}},setTimeout,clearTimeout,console,matchMedia:()=>({matches:false})};vm.createContext(sandbox);
for(const f of ['app.js','match-center.js','analytics.js','player-heat.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
for(const route of run('nav.map(n=>n[0])')){sandbox.location.hash='#'+route;run('render()');assert(el('#main').innerHTML.includes('<h1>'));assert(!/NaN|undefined/.test(el('#main').innerHTML),route);}
for(let side=0;side<2;side++)for(let i=0;i<11;i++){
  run(`heatState.side=${side};heatState.player=${i};heatState.from=1;heatState.to=90`);
  const full=run('heatTouches().length');assert(full>0);
  assert.equal(run('heatSummary(heatTouches()).thirds.reduce((a,b)=>a+b,0)'),full);
  assert.equal(run('heatSummary(heatTouches()).lanes.reduce((a,b)=>a+b,0)'),full);
  run('heatState.to=45');const first=run('heatTouches().length');run('heatState.from=46;heatState.to=90');assert.equal(first+run('heatTouches().length'),full);
  assert(!/NaN|undefined/.test(run('playerHeatSVG()')));
}
sandbox.location.hash='#heatmap?match=demo-01&side=1&player=7&from=16&to=30';run('render()');assert.equal(run('heatState.player'),7);assert.equal(run('heatState.from'),16);assert(run('heatTouches().every(e=>e.side===1&&e.player===7&&e.minute>=16&&e.minute<=30)'));
run('applyHeatRange(95,2)');assert.equal(run('heatState.from'),90);assert.equal(run('heatState.to'),90);
sandbox.location.hash='#heatmap?match=vpf-105';run('render()');assert.equal(run('heatTouches(true).length'),0);assert(!el('#main').innerHTML.includes('id="player-heat-svg"'));assert(el('#main').innerHTML.includes('Chưa có tọa độ'));
assert.equal(run('heatSummary([]).average'),null);assert(!/NaN/.test(run('heatZoneBars([0,0,0],["a","b","c"])')));
run("showPlayer(1,'heat')");assert(el('#detail-content').innerHTML.includes('side=1&amp;')||el('#detail-content').innerHTML.includes('side=1&player=7'));run("showPlayer(0,'heat')");assert(el('#detail-content').innerHTML.includes('Chưa có tọa độ'));
console.log('PASS: 10 routes; 22 match-scoped players; periods partition full match; zone totals; deep links; clamped intervals; verified match has no fabricated heatmap; profile links and missing data.');
if(process.argv.includes('--export-example')){
  run("heatState.match='demo-01';heatState.side=1;heatState.player=7;heatState.from=1;heatState.to=90;heatState.mode='density';heatState.points=false");
  fs.writeFileSync(path.join(__dirname,'../docs/LockerData-Quang-Hai-LD01-so-do-nhiet.svg'),run('playerHeatSVG()'));
  console.log('Exported labelled sample SVG for Quang Hai.');
}

