/* LockerData event format v1: metres, normalized attacking direction, explicit provenance. */
'use strict';
var LockerEngine=(()=>{
  const pitch={length:105,width:68};
  const definitions={
    touch:{label:'Chạm bóng',weight:0},pass:{label:'Chuyền bóng',weight:0,end:true},shot:{label:'Dứt điểm',weight:0},
    goal:{label:'Bàn thắng',weight:1},assist:{label:'Kiến tạo',weight:.5},key_pass:{label:'Chuyền tạo cơ hội',weight:.25,end:true},
    big_chance_missed:{label:'Bỏ lỡ cơ hội lớn',weight:-.45},interception:{label:'Đánh chặn',weight:.35},
    tackle:{label:'Tắc bóng',weight:.15},dribble:{label:'Rê bóng',weight:0},duel:{label:'Tranh chấp',weight:0},
    recovery:{label:'Thu hồi bóng',weight:0},goal_line_clearance:{label:'Cứu bóng trên vạch vôi',weight:.8},
    dangerous_loss:{label:'Mất bóng nguy hiểm',weight:-.4},error_goal:{label:'Lỗi dẫn tới bàn thua',weight:-1.2},
    save:{label:'Cứu thua',weight:.25},claim:{label:'Bắt bóng bổng',weight:.2},yellow:{label:'Thẻ vàng',weight:-.3},
    red:{label:'Thẻ đỏ trực tiếp',weight:-1.5},penalty_foul:{label:'Phạm lỗi gây penalty',weight:-.8}
  };
  const finite=n=>typeof n==='number'&&Number.isFinite(n);
  function validateDataset(raw){
    if(!raw||raw.version!==1||!Array.isArray(raw.players)||!Array.isArray(raw.events))throw Error('File phải có version: 1, players và events.');
    if(!raw.id||typeof raw.id!=='string'||raw.id.length>120)throw Error('Thiếu mã trận hợp lệ.');
    if(typeof raw.title!=='string'||!raw.title.trim()||raw.title.length>180)throw Error('Tên trận phải có từ 1 đến 180 ký tự.');
    if(raw.date){const timestamp=typeof raw.date==='string'?Date.parse(raw.date+'T00:00:00Z'):NaN;if(!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)||!Number.isFinite(timestamp)||new Date(timestamp).toISOString().slice(0,10)!==raw.date)throw Error('Ngày trận phải hợp lệ theo YYYY-MM-DD.');}
    if(raw.pitch?.length!==105||raw.pitch?.width!==68)throw Error('Tọa độ cần dùng sân 105 × 68 mét.');
    if(!['sample','manual_unverified'].includes(raw.provenance))throw Error('Xuất xứ phải là sample hoặc manual_unverified.');
    if(raw.players.length<1||raw.players.length>100||raw.events.length>10000)throw Error('Giới hạn: 100 cầu thủ và 10.000 sự kiện mỗi file.');
    const ids=new Set();
    const roster=raw.players.map(p=>{
      if(!p||typeof p.id!=='string'||!p.id||p.id.length>120||ids.has(p.id))throw Error('Mã cầu thủ thiếu hoặc bị trùng.');ids.add(p.id);
      if(typeof p.name!=='string'||!p.name.trim()||p.name.length>120||![0,1].includes(p.side)||!['GK','DF','MF','FW'].includes(p.position))throw Error('Thông tin cầu thủ không hợp lệ.');
      if(!Number.isInteger(p.number)||p.number<1||p.number>999)throw Error('Số áo không hợp lệ.');
      return {id:p.id,name:p.name.trim(),side:p.side,position:p.position,number:p.number,starter:p.starter!==false};
    });
    const eventIds=new Set();
    const events=raw.events.map(e=>{
      if(!e||typeof e.id!=='string'||!e.id||e.id.length>150||eventIds.has(e.id))throw Error('Mã sự kiện thiếu hoặc bị trùng.');eventIds.add(e.id);
      if(e.matchId!==raw.id||!ids.has(e.playerId)||typeof e.type!=='string'||!Object.hasOwn(definitions,e.type))throw Error('Sự kiện không thuộc trận/cầu thủ hợp lệ.');
      if(!Number.isInteger(e.minute)||e.minute<0||e.minute>130||!Number.isInteger(e.second)||e.second<0||e.second>59||![1,2,3,4].includes(e.period))throw Error('Phút, giây hoặc hiệp không hợp lệ.');
      if(!finite(e.x)||!finite(e.y)||e.x<0||e.x>105||e.y<0||e.y>68)throw Error('Tọa độ đầu phải nằm trong sân 105 × 68m.');
      const hasEnd=e.endX!==null&&e.endX!==undefined;
      if(hasEnd!== (e.endY!==null&&e.endY!==undefined))throw Error('Điểm cuối cần cả x và y.');
      if(hasEnd&&(!finite(e.endX)||!finite(e.endY)||e.endX<0||e.endX>105||e.endY<0||e.endY>68))throw Error('Điểm cuối nằm ngoài sân.');
      if(definitions[e.type].end&&!hasEnd)throw Error('Chuyền bóng cần điểm đầu và điểm nhận.');
      if(typeof e.success!=='boolean')throw Error('Kết quả sự kiện cần true hoặc false.');
      const attributes={};
      if(e.attributes?.xg!==undefined){if(!finite(e.attributes.xg)||e.attributes.xg<0||e.attributes.xg>1)throw Error('xG phải từ 0 đến 1.');attributes.xg=e.attributes.xg;}
      if(e.attributes?.xgot!==undefined){if(!finite(e.attributes.xgot)||e.attributes.xgot<0||e.attributes.xgot>1)throw Error('xGOT phải từ 0 đến 1.');attributes.xgot=e.attributes.xgot;}
      if(e.attributes?.inBox===true)attributes.inBox=true;
      if(e.attributes?.opponentId){const opponent=roster.find(p=>p.id===e.attributes.opponentId),actor=roster.find(p=>p.id===e.playerId);if(!opponent||opponent.side===actor.side)throw Error('Đối thủ phải thuộc đội còn lại.');attributes.opponentId=opponent.id;}
      return {id:e.id,matchId:raw.id,playerId:e.playerId,type:e.type,minute:e.minute,second:e.second,period:e.period,x:e.x,y:e.y,endX:hasEnd?e.endX:null,endY:hasEnd?e.endY:null,success:e.success,attributes};
    }).sort((a,b)=>a.minute*60+a.second-b.minute*60-b.second);
    return {version:1,id:raw.id,title:raw.title.trim(),date:typeof raw.date==='string'?raw.date.slice(0,10):'',season:typeof raw.season==='string'?raw.season.slice(0,30):'',source:typeof raw.source==='string'?raw.source.slice(0,500):'',provenance:raw.provenance,pitch:{...pitch},players:roster,events,quality:'draft'};
  }
  function normalize(x,y,direction='right'){return direction==='left'?{x:105-x,y:68-y}:{x,y};}
  function contribution(e,position){
    let coefficient=1,weight=definitions[e.type]?.weight||0;
    if(['goal','assist','key_pass','interception','tackle','save','claim','goal_line_clearance'].includes(e.type)&&!e.success)return {weight:0,coefficient:1,delta:0};
    if(e.type==='goal')coefficient=position==='DF'?1.3:position==='MF'?1.1:position==='FW'?.9:1;
    if(e.type==='key_pass'&&position==='DF')coefficient=1.2;
    if(e.type==='big_chance_missed')coefficient=position==='FW'?1.2:.8;
    if(e.type==='interception'){weight=e.attributes?.inBox?.35:0;if(['DF','GK'].includes(position))coefficient=1.2;}
    if(e.type==='tackle'&&['DF','MF'].includes(position))coefficient=1.1;
    if(e.type==='dangerous_loss'&&position==='DF')coefficient=1.3;
    if(e.type==='save'){if(position!=='GK')weight=0;else weight=.25+.25*(e.attributes?.xgot??0);}
    if(e.type==='claim'&&position!=='GK')weight=0;
    return {weight,coefficient,delta:weight*coefficient};
  }
  function rating(events,player){
    const own=events.filter(e=>e.playerId===player.id),breakdown=own.map(e=>({event:e,...contribution(e,player.position)})).filter(r=>r.delta!==0);
    const raw=6+breakdown.reduce((s,e)=>s+e.delta,0);
    return {score:own.length?Math.max(1,Math.min(10,raw)):null,raw,breakdown,eventCount:own.length,version:'LD-events-1.0'};
  }
  function stats(events,playerId){
    const own=events.filter(e=>e.playerId===playerId),shots=own.filter(e=>['shot','goal','big_chance_missed'].includes(e.type)),passes=own.filter(e=>['pass','key_pass'].includes(e.type));
    const xgEvents=shots.filter(e=>finite(e.attributes.xg));
    return {events:own.length,touches:own.filter(e=>!['yellow','red','penalty_foul'].includes(e.type)).length,goals:own.filter(e=>e.type==='goal'&&e.success).length,shots:shots.length,passes:passes.length,passSuccess:passes.filter(e=>e.success).length,xg:xgEvents.length?xgEvents.reduce((s,e)=>s+e.attributes.xg,0):null,xgCoverage:[xgEvents.length,shots.length],tackles:own.filter(e=>e.type==='tackle'&&e.success).length};
  }
  function kdeGrid(points,h=4.5,cols=40,rows=26,denominator=points.length){
    if(!finite(h)||h<=0||h>30)throw Error('Bandwidth không hợp lệ.');
    const divisor=Math.max(1,denominator)*2*Math.PI*h*h;
    return Array.from({length:cols*rows},(_,i)=>{const x=(i%cols+.5)/cols*105,y=(Math.floor(i/cols)+.5)/rows*68;return points.reduce((s,p)=>s+Math.exp(-((x-p.x)**2+(y-p.y)**2)/(2*h*h)),0)/divisor;});
  }
  function duel(events,a,b){const out={a:0,b:0,total:0};events.filter(e=>['duel','tackle','dribble'].includes(e.type)).forEach(e=>{if((e.playerId===a&&e.attributes.opponentId===b)||(e.playerId===b&&e.attributes.opponentId===a)){out.total++;if((e.playerId===a&&e.success)||(e.playerId===b&&!e.success))out.a++;else out.b++;}});return out;}
  function valuation(input){
    const ranges={rating:[0,10],output:[0,10],age:[16,45],months:[0,60],base:[1000,1000000],fx:[10000,100000],demand:[.1,4],status:[.1,3],national:[1,1.5],tier:[.5,2]};
    for(const [key,[low,high]]of Object.entries(ranges))if(!finite(input[key])||input[key]<low||input[key]>high)throw Error('Tham số '+key+' ngoài giới hạn.');
    const age=input.age<22?1.3:input.age<25?1.15:input.age<=28?1:input.age<=31?.85:.75;
    const contract=input.months===0?.6:input.months<=6?.75:input.months<=12?.9:input.months<=24?1:1.1;
    const performance=input.rating*.35+input.output*.25;
    const eur=input.base*performance*age*input.national*contract*input.tier;
    return {eur:Math.round(eur/1000)*1000,vnd:Math.round(eur*input.fx*input.demand*input.status/1000000)*1000000,factors:{age,contract,performance,national:input.national,tier:input.tier},version:'LD-value-2.0'};
  }
  return {pitch,definitions,validateDataset,normalize,contribution,rating,stats,kdeGrid,duel,valuation};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LockerEngine;
