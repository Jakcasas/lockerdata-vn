'use strict';
// A match-scoped view over the same sample events used in the analytics centre.
const heatState={match:'demo-01',side:1,player:7,from:1,to:90,mode:'density',points:false};
function heatReadRoute(){
  const q=new URLSearchParams(location.hash.split('?')[1]||'');
  if(q.has('match'))heatState.match=q.get('match')==='vpf-105'?'vpf-105':'demo-01';
  if(q.has('side'))heatState.side=q.get('side')==='0'?0:1;
  if(q.has('player'))heatState.player=Math.max(0,Math.min(10,Math.trunc(Number(q.get('player')))||0));
  if(q.has('from'))heatState.from=Math.max(1,Math.min(90,Math.trunc(Number(q.get('from')))||1));
  if(q.has('to'))heatState.to=Math.max(heatState.from,Math.min(90,Math.trunc(Number(q.get('to')))||90));
}
function heatHref(side,player,match='demo-01'){return `#heatmap?match=${match}&side=${side}&player=${player}&from=1&to=90`;}
function heatSyncRoute(){
  const hash=`#heatmap?match=${heatState.match}&side=${heatState.side}&player=${heatState.player}&from=${heatState.from}&to=${heatState.to}`;
  try{window.history.replaceState(null,'',hash);}catch{/* A file preview may disallow replacing its URL. */}
}
function heatTouches(full=false){if(heatState.match!=='demo-01')return [];return analysisEvents.filter(e=>e.type==='touch'&&e.side===heatState.side&&e.player===heatState.player&&(full||(e.minute>=heatState.from&&e.minute<=heatState.to)));}
function heatSummary(rows){
  const thirds=[0,0,0],lanes=[0,0,0];rows.forEach(e=>{thirds[Math.min(2,Math.floor(e.x/100*3))]++;lanes[Math.min(2,Math.floor(e.y/100*3))]++;});
  return {count:rows.length,thirds,lanes,average:rows.length?[sum(rows,'x')/rows.length,sum(rows,'y')/rows.length]:null};
}
function heatDensity(rows){return Array.from({length:960},(_,i)=>{const x=(i%40+.5)/40*100,y=(Math.floor(i/40)+.5)/24*100;return rows.reduce((n,e)=>n+Math.exp(-((x-e.x)**2+(y-e.y)**2)/(2*6**2)),0);});}
function playerHeatSVG(){
  const rows=heatTouches(),player=archiveTeams[heatState.side].starters[heatState.player],density=heatDensity(rows),peak=Math.max(.001,...heatDensity(heatTouches(true))),a=heatSummary(rows).average;
  const colors=density.map((v,i)=>{const f=v/peak;return f<.025?'':`<rect x="${i%40*15}" y="${Math.floor(i/40)*15}" width="15.5" height="15.5" fill="hsl(${150-145*f} 90% ${50+f*7}%)" opacity="${Math.min(.96,f*1.7)}"/>`;}).join('');
  const dots=rows.map(e=>`<circle cx="${e.x*6}" cy="${e.y*3.6}" r="${heatState.mode==='touches'?4:2.6}" fill="#fcf9cb" stroke="#12372c" stroke-width="1"><title>${e.minute}′ · x ${e.x.toFixed(1)}%, y ${e.y.toFixed(1)}% · ${player[1]}</title></circle>`).join('');
  return `<svg id="player-heat-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 408" role="img" aria-label="Sơ đồ nhiệt mô phỏng của ${esc(player[1])} trong trận mẫu LD-01, phút ${heatState.from} đến ${heatState.to}, ${rows.length} lần chạm"><title>${esc(player[1])} · Hà Nội–CAHN · LD-01 · MÔ PHỎNG · ${heatState.from}–${heatState.to}′</title><defs><filter id="player-density-blur"><feGaussianBlur stdDeviation="5"/></filter><clipPath id="heat-field-clip"><rect width="600" height="360" rx="8"/></clipPath></defs><rect width="600" height="408" rx="8" fill="#123c32"/><g clip-path="url(#heat-field-clip)">${[0,1,2,3,4,5].map(i=>`<rect x="${i*100}" y="0" width="50" height="360" fill="#ffffff" opacity=".025"/>`).join('')}${heatState.mode==='density'?`<g filter="url(#player-density-blur)">${colors}</g>`:''}${pitchLines()}${heatState.mode==='touches'||heatState.points?dots:''}${a?`<circle cx="${a[0]*6}" cy="${a[1]*3.6}" r="8" fill="none" stroke="white" stroke-width="2"/><path d="M${a[0]*6-12} ${a[1]*3.6}h24M${a[0]*6} ${a[1]*3.6-12}v24" stroke="white" stroke-width="1.5"><title>Vị trí chạm trung bình</title></path>`:''}</g><text x="16" y="380" font-family="Arial,sans-serif" font-size="12" fill="#c6dfd3">MÔ PHỎNG · ${esc(player[1])} · ${heatState.from}–${heatState.to}′</text><text x="16" y="398" font-family="Arial,sans-serif" font-size="11" fill="#aac6b7">LockerData.VN · LD-01 · Hướng tấn công chuẩn hóa →</text></svg>`;
}
function heatZoneBars(counts,labels){const total=counts.reduce((a,b)=>a+b,0),percent=total?percentageParts(counts):[0,0,0];return `<div class="heat-zone-bars">${counts.map((n,i)=>`<div><span>${labels[i]}</span><b>${total?percent[i].toFixed(1)+'%':'—'}</b><div class="heat-zone-track"><i style="width:${percent[i]}%"></i></div><small>${n} lần chạm</small></div>`).join('')}</div>`;}
function heatTimeline(){const all=heatTouches(true),bins=Array.from({length:6},(_,i)=>all.filter(e=>e.minute>i*15&&e.minute<=(i+1)*15).length),max=Math.max(1,...bins);return `<div class="heat-timeline" aria-label="Chạm bóng theo khoảng 15 phút">${bins.map((n,i)=>`<button data-heat-range="${i*15+1},${(i+1)*15}" aria-label="Xem phút ${i*15+1} đến ${(i+1)*15}: ${n} lần chạm" aria-pressed="${heatState.from===i*15+1&&heatState.to===(i+1)*15}"><b>${n}</b><span class="heat-time-column"><i style="height:${n/max*100}%"></i></span><small>${i*15+1}–${(i+1)*15}′</small></button>`).join('')}</div>`;}
function heatResult(){
  const t=archiveTeams[heatState.side],p=t.starters[heatState.player],rows=heatTouches(),stats=heatSummary(rows),all=heatTouches(true);
  if(heatState.match==='vpf-105')return `<section class="panel heat-missing"><span class="heat-missing-symbol">⌖</span><h2>Chưa có tọa độ cho trận này</h2><p>Danh sách VPF xác nhận ${p[1]} đá chính trong trận Hà Nội–CAHN ngày 08/03/2026. Nguồn hiện có không cung cấp vị trí chạm bóng theo phút, nên chưa thể vẽ sơ đồ nhiệt thực tế.</p><div><a class="button" href="#lineups">Xem danh sách thi đấu</a><button class="button primary" data-heat-demo="true">Thử sơ đồ nhiệt với dữ liệu mô phỏng</button></div></section>`;
  return `<section class="heat-player-strip"><div class="heat-shirt" style="--shirt:${t.color}">${p[0]}</div><div><h2>${p[1]}</h2><p>${t.name} · ${p[2]} · Trận mẫu LD-01</p></div><div class="heat-player-window"><b>${heatState.from}–${heatState.to}′</b><span>Khoảng phân tích</span></div></section><div class="heat-workspace"><section class="panel heat-map-card"><div class="heat-map-head"><h2>Sơ đồ nhiệt cá nhân</h2><div class="segmented">${[['density','Mật độ'],['touches','Điểm chạm']].map(([id,label])=>`<button data-heat-mode="${id}" class="${heatState.mode===id?'active':''}" aria-pressed="${heatState.mode===id}">${label}</button>`).join('')}</div></div>${playerHeatSVG()}<div class="heat-map-legend"><span>Ít <i></i> Nhiều</span><label><input id="heat-show-points" type="checkbox" ${heatState.points?'checked':''}> Hiện điểm chạm</label><span>⊕ Vị trí chạm trung bình</span></div>${rows.length?'':'<p class="heat-empty-inline" role="status">Không có lần chạm nào trong khoảng phút này. Hãy mở rộng khoảng thời gian.</p>'}<p class="heat-explainer">Màu thể hiện mật độ các lần chạm đã ghi nhận. Thang màu cố định theo toàn trận của cầu thủ đang chọn; đây không phải quãng đường chạy hay thời gian đứng trong vùng.</p><div class="heat-map-actions"><span>${rows.length}/${all.length} lần chạm trong bộ lọc</span><button class="button" data-heat-export="true">${icon('download')} Tải sơ đồ SVG</button></div></section><aside class="heat-insights"><section class="panel heat-stat-card"><span class="heat-small-label">CHẠM BÓNG TRONG KHOẢNG ĐÃ CHỌN</span><strong>${stats.count}</strong><p>${all.length?(stats.count/all.length*100).toFixed(1):'0'}% số chạm trong trận mẫu</p><h3>Phân bố theo chiều dọc</h3>${heatZoneBars(stats.thirds,['⅓ sân nhà','⅓ giữa sân','⅓ tấn công'])}<h3>Phân bố theo chiều ngang</h3>${heatZoneBars(stats.lanes,['Cánh trái','Trung lộ','Cánh phải'])}</section><section class="panel heat-average"><h3>Vị trí chạm trung bình</h3><p>${stats.average?`<b>x ${stats.average[0].toFixed(1)}% · y ${stats.average[1].toFixed(1)}%</b>`:'Chưa có lần chạm để tính.'}</p><span>x: từ sân nhà đến khung thành đối phương.<br>y: từ cánh trái đến cánh phải.</span></section></aside></div><section class="panel heat-history"><div class="heat-map-head"><div><h2>Nhịp tham gia vào bóng</h2><p>Toàn trận mẫu · Bấm một cột để xem khoảng 15 phút</p></div></div>${heatTimeline()}<details><summary>Danh sách ${rows.length} lần chạm trong khoảng đã chọn</summary><div class="table-wrap"><table><thead><tr><th>Phút</th><th>x (%)</th><th>y (%)</th><th>Khu vực</th></tr></thead><tbody>${rows.map(e=>`<tr><td>${e.minute}′</td><td>${e.x.toFixed(1)}</td><td>${e.y.toFixed(1)}</td><td>${['Sân nhà','Giữa sân','Tấn công'][Math.min(2,Math.floor(e.x/100*3))]}</td></tr>`).join('')||'<tr><td colspan="4">Không có lần chạm trong khoảng này.</td></tr>'}</tbody></table></div></details></section>`;
}
function playerHeatPage(){
  heatReadRoute();
  if(state.league!=='V.League 1')return heading('Sơ đồ nhiệt cầu thủ','Dữ liệu theo từng trận')+'<div class="panel empty">Chưa có tọa độ cầu thủ V.League 2. Chọn V.League 1 để thử bộ dữ liệu mẫu.</div>';
  return heading('Sơ đồ nhiệt cầu thủ','Một cầu thủ trong một trận · Lọc theo hiệp và khoảng phút',`<span class="${heatState.match==='demo-01'?'sample-tag':'select'}">${heatState.match==='demo-01'?'Tọa độ mô phỏng':'Chưa có tọa độ thực tế'}</span>`)+`<div class="panel heat-controls"><label>Trận đấu<select id="heat-match"><option value="demo-01" ${heatState.match==='demo-01'?'selected':''}>LD-01 · Hà Nội 2–1 CAHN · Trận mẫu 90 phút</option><option value="vpf-105" ${heatState.match==='vpf-105'?'selected':''}>VPF · Hà Nội–CAHN · 08/03/2026 · Chưa có tọa độ</option></select></label><label>Cầu thủ<select id="heat-person">${archiveTeams.map((t,side)=>`<optgroup label="${t.name}">${t.starters.map((p,i)=>`<option value="${side}:${i}" ${heatState.side===side&&heatState.player===i?'selected':''}>${p[0]} · ${p[1]}</option>`).join('')}</optgroup>`).join('')}</select></label></div><div class="heat-time-controls"><div class="heat-presets">${[[1,90,'Cả trận'],[1,45,'Hiệp 1'],[46,90,'Hiệp 2']].map(([from,to,label])=>`<button data-heat-range="${from},${to}" aria-pressed="${heatState.from===from&&heatState.to===to}" ${heatState.match!=='demo-01'?'disabled':''}>${label}</button>`).join('')}</div><label>Từ phút <input id="heat-from" aria-label="Từ phút" type="number" min="1" max="90" value="${heatState.from}" ${heatState.match!=='demo-01'?'disabled':''}></label><label>Đến phút <input id="heat-to" aria-label="Đến phút" type="number" min="1" max="90" value="${heatState.to}" ${heatState.match!=='demo-01'?'disabled':''}></label><button class="text-link" data-heat-apply="true" ${heatState.match!=='demo-01'?'disabled':''}>Áp dụng</button></div><p class="heat-provenance">${heatState.match==='demo-01'?'Trận và các lần chạm là mô phỏng cố định, không phải dữ liệu thi đấu thực hay Opta.':'Trận lưu trữ: đã có danh sách thi đấu VPF; chưa có dữ liệu sự kiện x/y.'}</p><div id="player-heat-result">${heatResult()}</div>`;
}
function refreshPlayerHeat(full=false){heatSyncRoute();if(full)render();else{const out=$('#player-heat-result');if(out)out.innerHTML=heatResult();}}
function applyHeatRange(from,to){heatState.from=Math.max(1,Math.min(90,Math.trunc(Number(from))||1));heatState.to=Math.max(heatState.from,Math.min(90,Math.trunc(Number(to))||90));refreshPlayerHeat(true);}
function exportPlayerHeat(){
  if(heatState.match!=='demo-01')return;
  const svg=playerHeatSVG(),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`LockerData-LD01-${norm(archiveTeams[heatState.side].starters[heatState.player][1]).replace(/\s+/g,'-')}-${heatState.from}-${heatState.to}-MO-PHONG.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Đã xuất sơ đồ kèm tên cầu thủ, khoảng phút và nhãn mô phỏng.');
}
pageViews.heatmap=playerHeatPage;nav.splice(3,0,['heatmap','Nhiệt cầu thủ','pitch']);
const priorHeatLabOutput=labOutput;
labOutput=function(){return `<div class="heat-lab-link"><a class="button" href="${heatHref(lab.team,lab.player==='all'?(lab.team===1?7:5):+lab.player)}">Mở sơ đồ nhiệt riêng của một cầu thủ →</a></div>`+priorHeatLabOutput();};
const priorHeatShowPlayer=showPlayer;
showPlayer=function(id,tab='overview'){
  const p=players[id];let found=null;archiveTeams.forEach((t,side)=>t.starters.forEach((r,i)=>{if(norm(r[1])===norm(p.name))found={side,i};}));
  if(tab!=='heat'){priorHeatShowPlayer(id,tab);if(found){const host=$('#detail-content .detail-main');if(host)host.insertAdjacentHTML('beforeend',`<a class="button heat-profile-link" href="${heatHref(found.side,found.i)}">Sơ đồ nhiệt ${p.name} trong trận mẫu Hà Nội–CAHN →</a>`);}return;}
  state.selected=id;state.detailTab=tab;
  openDialog(`<span class="sample-tag">Dữ liệu theo trận</span><div class="profile-header">${avatar(p)}<div><h2>${p.name}</h2><p>Sơ đồ nhiệt cần các lần chạm của một trận cụ thể.</p></div></div>${found?`<div class="heat-profile-empty"><h3>Hà Nội – Công an Hà Nội · Trận mẫu LD-01</h3><p>Xem bản đồ mật độ, từng lần chạm, lọc hiệp và khoảng phút cho ${p.name}. Tọa độ trong trận mẫu là mô phỏng.</p><a class="button primary" href="${heatHref(found.side,found.i)}">Mở sơ đồ nhiệt trận này →</a></div>`:'<div class="empty">Chưa có tọa độ theo trận cho cầu thủ này. Không thể suy ra sơ đồ nhiệt thực từ bàn thắng, số phút hoặc vị trí thi đấu.</div>'}<button class="text-link heat-profile-link" data-profile-tab="overview">← Trở lại hồ sơ</button>`);
};
document.addEventListener('change',e=>{
  if(e.target.id==='heat-match'){heatState.match=e.target.value;refreshPlayerHeat(true);}
  if(e.target.id==='heat-person'){[heatState.side,heatState.player]=e.target.value.split(':').map(Number);refreshPlayerHeat(true);}
  if(e.target.id==='heat-show-points'){heatState.points=e.target.checked;refreshPlayerHeat();}
});
document.addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;
  if(el.dataset.heatRange){const [a,b]=el.dataset.heatRange.split(',');applyHeatRange(a,b);}
  if(el.dataset.heatApply)applyHeatRange($('#heat-from').value,$('#heat-to').value);
  if(el.dataset.heatMode){heatState.mode=el.dataset.heatMode;refreshPlayerHeat();}
  if(el.dataset.heatDemo){heatState.match='demo-01';refreshPlayerHeat(true);}
  if(el.dataset.heatExport)exportPlayerHeat();
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&['heat-from','heat-to'].includes(e.target.id)){e.preventDefault();applyHeatRange($('#heat-from').value,$('#heat-to').value);}});
render();

