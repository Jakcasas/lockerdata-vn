const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const els=new Map();
function el(key){if(!els.has(key))els.set(key,{innerHTML:'',textContent:'',value:'',open:false,isConnected:true,classList:{add(){},remove(){},toggle(){},contains(){return false;}},setAttribute(){},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},focus(){},scrollIntoView(){}});return els.get(key);}
const sandbox={document:{querySelector:el,querySelectorAll:()=>[],activeElement:null,addEventListener(){},title:''},location:{hash:''},window:{addEventListener(){},scrollTo(){}},setTimeout,clearTimeout,console,matchMedia:()=>({matches:false})};
vm.createContext(sandbox);
for(const f of ['app.js','match-center.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
for(const route of ['overview','players','matches','compare','valuation','sources']){sandbox.location.hash='#'+route;run('render()');assert(el('#main').innerHTML.includes('<h1>'));assert(!el('#main').innerHTML.includes('NaN'));}
assert.equal(run('hubRows().length'),7);
assert(run("hubRows().every(r=>r.status==='finished')"));
assert.equal(run('hubRows().reduce((s,r)=>s+r.crowd,0)'),42100);
assert(run("fixtureDetail(hubRows()[0]).includes('11')"));
assert(!run("fixtureDetail(hubRows()[0]).includes('dual-bar')"));
run("state.hubFilter='live'");assert(run("matchesPage().includes('Chưa có dữ liệu trực tiếp')"));
run("state.matchMode='demo';state.hubFilter='upcoming'");assert.equal(run("hubRows().filter(m=>m.status==='upcoming').length"),1);
assert(run("matchesPage().includes('Chưa có thống kê trong trận')"));
run("state.league='V.League 2'");assert.equal(run('hubRows().length'),0);assert(!run("overview().includes('verified-strip')"));
run("state.league='V.League 1';state.search='Quang Hai'");assert.equal(run('getPlayers().length'),1);
assert(run('players.every(p=>rate(p)>=1&&rate(p)<=10&&Number.isFinite(value(p)))'));
assert(run('value(players[0],22,1500,8)>value(players[0],35,1500,8)'));
for(const p of run('players'))for(const tab of ['overview','stats','history','heat']){run(`showPlayer(${p.id},'${tab}')`);assert(el('#detail-content').innerHTML.includes(p.name));}
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!m[1].includes('://'))assert(fs.existsSync(path.join(__dirname,'../dist',m[1])),`Missing asset ${m[1]}`);}
console.log('PASS: six routes, verified vs demo data, status filters, V.League 2 empty state, Vietnamese search, valuation, 72 player panels, all local asset references.');


