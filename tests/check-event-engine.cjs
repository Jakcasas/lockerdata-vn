const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../dist/event-engine.js');
const player={id:'p1',name:'Player A',number:10,side:0,position:'FW',starter:true},opponent={...player,id:'p2',name:'Player B',side:1,position:'DF'};
const base={version:1,id:'fixture1',title:'Trận thử',date:'2026-10-01',provenance:'manual_unverified',pitch:{length:105,width:68},players:[player,opponent],events:[]};
const event={id:'e1',matchId:'fixture1',playerId:'p1',minute:45,second:30,period:1,x:90,y:34,endX:null,endY:null,type:'goal',success:true,attributes:{xg:.4}};
assert.equal(E.rating([event],player).score,6.9);
assert.equal(E.rating([],player).score,null);
assert.equal(E.contribution({...event,type:'big_chance_missed'},'FW').delta,-.54);
assert.equal(E.contribution({...event,type:'interception',attributes:{}},'DF').delta,0);
assert.equal(E.contribution({...event,type:'interception',attributes:{inBox:true}},'DF').delta,.42);
assert.equal(E.contribution({...event,type:'save',attributes:{xgot:.8}},'GK').delta,.45);
assert.equal(E.rating(Array.from({length:20},()=>event),player).score,10);
assert.equal(E.rating(Array.from({length:20},()=>({...event,type:'error_goal'})),player).score,1);
assert.deepEqual(E.normalize(10,20,'left'),{x:95,y:48});
assert.equal(E.validateDataset({...base,quality:'published',events:[event]}).quality,'draft');
for(const change of [{x:106},{minute:131},{playerId:'unknown'},{type:'pass'},{second:60},{attributes:{xg:1.2}},{attributes:{opponentId:'p1'}},{id:''},{success:'true'}])assert.throws(()=>E.validateDataset({...base,events:[{...event,...change}]}));
assert.throws(()=>E.validateDataset({...base,events:[event,event]}));
assert.throws(()=>E.validateDataset({...base,players:[player,player]}));
assert.throws(()=>E.validateDataset({...base,date:'2026-02-30'}));
assert.throws(()=>E.validateDataset({...base,events:[{...event,type:'constructor'}]}));
const duel={...event,type:'duel',attributes:{opponentId:'p2'}};
assert.deepEqual(E.duel([duel,event],player.id,opponent.id),{a:1,b:0,total:1});
assert.equal(E.stats([event],player.id).xg,.4);assert.equal(E.stats([{...event,attributes:{}}],player.id).xg,null);
const grid=E.kdeGrid([{x:52.5,y:34}],4.5,21,17);assert.equal(grid.indexOf(Math.max(...grid)),Math.floor(grid.length/2));assert(E.kdeGrid([],4.5).every(v=>v===0));
const inputs={rating:7,output:6,age:28,months:24,base:100000,fx:26500,demand:1,status:1,national:1,tier:1};
assert.equal(E.valuation(inputs).eur,395000);assert.equal(E.valuation(inputs).vnd,10468000000);assert(E.valuation({...inputs,age:21}).eur>E.valuation(inputs).eur);assert.throws(()=>E.valuation({...inputs,fx:NaN}));
// Render every route with all production scripts and a real persistence stub.
const elements=new Map(),storage=new Map(),listeners={};
function el(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},setAttribute(){},addEventListener(){},showModal(){},close(){},insertAdjacentHTML(p,h){this.innerHTML+=h;}});return elements.get(k);}
const sandbox={URLSearchParams,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(type,cb){(listeners[type]??=[]).push(cb);}},location:{hash:''},window:{addEventListener(){},history:{replaceState(){}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,console,matchMedia:()=>({matches:false})};vm.createContext(sandbox);
for(const f of ['app.js','match-center.js','analytics.js','player-heat.js','event-engine.js','studio.js','market-model.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);
for(const route of run('nav.map(n=>n[0])')){sandbox.location.hash='#'+route;run('render()');assert(elements.get('#main').innerHTML.includes('<h1>'));assert(!/NaN|undefined/.test(elements.get('#main').innerHTML),route);}
sandbox.location.hash='#studio';run('studioCreate()');assert.equal(run('studioCurrent().players.length'),40);assert.equal(run('studioData.length'),1);assert(storage.has('lockerdata.datasets.v1'));
run('studioCurrent().events.push({id:"test",matchId:studio.id,playerId:studioCurrent().players[0].id,type:"save",minute:20,second:0,period:1,x:10,y:34,endX:null,endY:null,success:true,attributes:{xgot:.8}})');
sandbox.location.hash='#eventanalysis';run('render()');assert(elements.get('#main').innerHTML.includes('6.45'));assert(!/NaN|undefined/.test(elements.get('#main').innerHTML));
run('studio.from=21');run('render()');assert(elements.get('#main').innerHTML.includes('Điểm — / 10'));
run('studio.compare=studioCurrent().players.find(p=>p.side===1).id');run('render()');assert(elements.get('#main').innerHTML.includes('Tranh chấp đối đầu'));
console.log('PASS: input integrity; exact rating contributions and caps; missing data; KDE metres; duels; valuation; 12 routes; local persistence and 40-player manual analysis.');
