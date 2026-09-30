/* LockerData match centre: verified records and demo analysis are separate. */
state.matchMode='verified';
state.hubFilter='all';
state.hubSelection=0;
const oldOverview=overview;
const oldRender=render;
const oldShowMatch=showMatch;
const oldOpenDialog=openDialog;
let focusBeforeDialog=null;
openDialog=function(content){
  if(!$('#detail').open)focusBeforeDialog=document.activeElement;
  oldOpenDialog(content);
  $('#detail').setAttribute('aria-label','Chi tiết bóng đá');
};
$('#detail').addEventListener('close',()=>{if(focusBeforeDialog?.isConnected)focusBeforeDialog.focus();});

function officialTeamIndex(name){return teams.findIndex(t=>t[0]===name);}
function hubRows(){
  if(state.league!=='V.League 1')return [];
  if(state.matchMode==='verified')return official.map((r,i)=>({id:i,home:r[0],away:r[1],scores:r[2].split('–'),status:'finished',time:'KT',venue:r[3],crowd:r[4],yellow:r[5],red:r[6]}));
  return matches.map(m=>({...m,home:teams[m.home][0],away:teams[m.away][0],scores:m.status==='upcoming'?['–','–']:[m.a,m.b],venue:m.ground}));
}
const hubLabels={all:'Tất cả',live:'Đang diễn ra',finished:'Đã kết thúc',upcoming:'Sắp diễn ra'};
function hubCrest(name){const i=officialTeamIndex(name);return i>=0?crest(i):'<span class="crest">CLB</span>';}
function hubListRow(m){return `<button class="fixture-row ${state.hubSelection===m.id?'selected':''}" data-hub-match="${m.id}" aria-pressed="${state.hubSelection===m.id}" aria-label="${m.home} ${m.scores[0]} – ${m.scores[1]} ${m.away}"><span class="fixture-time ${m.status==='live'?'live':''}">${m.time}<small>${m.status==='live'?'Mô phỏng':m.status==='upcoming'?'Giờ mẫu':'Kết thúc'}</small></span><span class="fixture-clubs"><span>${hubCrest(m.home)}<b>${m.home}</b></span><span>${hubCrest(m.away)}<b>${m.away}</b></span></span><span class="fixture-scores"><b>${m.scores[0]}</b><b>${m.scores[1]}</b></span><span class="fixture-chevron">›</span></button>`;}
function fixtureDetail(m){
  if(!m)return `<div class="fixture-empty">${icon('pitch')}<h3>Chưa có trận đấu</h3><p>Không có trận phù hợp trong bộ dữ liệu này. Hãy đổi bộ lọc hoặc giải đấu.</p></div>`;
  const real=state.matchMode==='verified';
  return `<div class="fixture-detail-top"><span>${real?'V.LEAGUE 1 · VÒNG 18':'V.LEAGUE 1 · VÒNG MẪU 18'}</span><span class="${real?'verified-badge':'sample-tag'}">${real?'✓ Nguồn VPF':'Mô phỏng'}</span></div><div class="fixture-detail-score"><div>${hubCrest(m.home)}<b>${m.home}</b></div><div class="fixture-big-score">${m.scores[0]}<span>–</span>${m.scores[1]}<small>${hubLabels[m.status]}</small></div><div>${hubCrest(m.away)}<b>${m.away}</b></div></div><div class="fixture-venue">${icon('pitch')}${m.venue}</div><div class="detail-section-title">${real?'Số liệu từ báo cáo trận đấu':'Thống kê trận mẫu'}</div>${real?`<div class="verified-stats"><div><span>Khán giả</span><b>${fmt(m.crowd)}</b></div><div><span><i class="card-yellow"></i>Thẻ vàng cả trận</span><b>${m.yellow}</b></div><div><span><i class="card-red"></i>Thẻ đỏ cả trận</span><b>${m.red}</b></div></div><div class="coverage-note">${icon('info')}<div><b>Chưa có dữ liệu chuyên sâu</b><p>Báo cáo này không có xG, kiểm soát bóng, đội hình hay tọa độ sự kiện. LockerData không tự điền các chỉ số còn thiếu.</p></div></div><a class="button source-button" href="${officialURL}" target="_blank" rel="noopener">Đọc báo cáo gốc VPF ↗</a><p class="source-timestamp">Báo cáo: 13/04/2026 · Kiểm tra: 23/09/2026<br>Bản ghi lưu trữ, không phải dữ liệu trực tiếp.</p>`:m.status==='upcoming'?'<div class="coverage-note">Trận mẫu chưa bắt đầu. Chưa có thống kê trong trận.</div>':`<div class="match-stat compact-stat"><div class="match-stat-label"><b>${m.xg[0].toFixed(2)}</b><span>Bàn thắng kỳ vọng (xG)</span><b>${m.xg[1].toFixed(2)}</b></div><div class="dual-bar"><i style="width:${m.xg[0]/(m.xg[0]+m.xg[1])*100}%"></i><i style="width:${m.xg[1]/(m.xg[0]+m.xg[1])*100}%"></i></div></div><button class="button primary source-button" data-match="${m.id}">Mở thống kê & đội hình ${icon('arrow')}</button><p class="source-timestamp">Tỉ số và chỉ số trên là dữ liệu mô phỏng cố định.</p>`}`;
}
matchesPage=function(){
  const all=hubRows(),list=all.filter(m=>state.hubFilter==='all'||m.status===state.hubFilter);
  if(!list.some(m=>m.id===state.hubSelection))state.hubSelection=list[0]?.id??null;
  const selected=list.find(m=>m.id===state.hubSelection),real=state.matchMode==='verified';
  return heading('Trung tâm trận đấu','Tỉ số, diễn biến và dữ liệu của bóng đá Việt Nam.',`<span class="connection-label"><i></i>Chưa kết nối trực tiếp</span>`)+`<div class="match-mode-toolbar"><div class="dataset-switch" role="group" aria-label="Nguồn trận đấu"><button class="${real?'active':''}" data-hub-mode="verified" aria-pressed="${real}">✓ Kết quả đã xác minh</button><button class="${!real?'active':''}" data-hub-mode="demo" aria-pressed="${!real}">Trải nghiệm phân tích</button></div><div class="round-label">${real?'Mùa 2025/26 · Vòng 18':'Mùa mẫu 2025/26 · Vòng mẫu 18'}</div></div><div class="match-hub"><section class="panel fixture-list-panel"><div class="fixture-league-title"><span class="league-emblem">V1</span><div><h2>${state.league}</h2><p>${real?'Kết quả lưu trữ từ VPF':'Bộ dữ liệu minh họa'}</p></div><span class="fixture-total">${all.length} trận</span></div><div class="fixture-filters" role="group" aria-label="Trạng thái trận đấu">${Object.entries(hubLabels).map(([id,label])=>`<button class="${state.hubFilter===id?'active':''}" data-hub-filter="${id}" aria-pressed="${state.hubFilter===id}">${label}<span>${id==='all'?all.length:all.filter(m=>m.status===id).length}</span></button>`).join('')}</div><div class="fixture-round-header"><span>${real?'BÁO CÁO NGÀY 13/04/2026':'CÁC TRẬN ĐẤU MÔ PHỎNG'}</span><span>${real?'Đã đối chiếu nguồn':'Không cập nhật trực tiếp'}</span></div><div id="fixture-rows">${list.map(hubListRow).join('')||`<div class="fixture-empty">${icon('clock')}<h3>${state.hubFilter==='live'?'Chưa có dữ liệu trực tiếp':'Không có trận phù hợp'}</h3><p>${state.league==='V.League 2'?'Bộ dữ liệu hiện chưa có trận V.League 2.':real?'Bộ dữ liệu VPF này chỉ chứa các trận đã kết thúc.':'Hãy chọn một trạng thái khác.'}</p><button class="button" data-hub-filter="all">Xem tất cả</button></div>`}</div><div class="fixture-list-footer">${real?'Nguồn: VPF · Cập nhật thủ công':'Dữ liệu mẫu dùng để khám phá giao diện'}<a href="#sources">Thông tin nguồn ↗</a></div></section><section class="panel fixture-detail" aria-label="Chi tiết trận được chọn">${fixtureDetail(selected)}</section></div><div class="match-hub-note">${icon('info')} ${real?'Những chỉ số chưa được nguồn công bố sẽ không được suy đoán.':'Điểm số, thống kê, đội hình và thời gian trong chế độ này đều là minh họa.'}</div>`;
};

overview=function(){
  let html=oldOverview();
  const strip=`<section class="verified-strip"><div><span class="verified-badge">✓ DỮ LIỆU THỰC TẾ</span><h2>Kết quả V.League từ VPF</h2><p>7 trận · Vòng 18 mùa 2025/26 · Bản lưu trữ</p></div><div class="verified-mini-score"><span>Hà Nội</span><b>3 – 0</b><span>Hà Tĩnh</span></div><div class="verified-mini-score"><span>Nam Định</span><b>1 – 2</b><span>HAGL</span></div><a href="#matches" data-open-verified="true" class="button">Xem kết quả ${icon('arrow')}</a></section>`;
  const marker='<div class="metrics">';
  return state.league==='V.League 1'?html.replace(marker,strip+marker):html;
};

render=function(){
  pageViews.overview=overview;pageViews.matches=matchesPage;
  oldRender();
  $('#menu').setAttribute('aria-expanded','false');
  $('#menu').setAttribute('aria-controls','sidebar');
  const h=$('#main h1');if(h)h.setAttribute('tabindex','-1');
  if(state.page==='players'){
    const counter=$('.tab-count');if(counter)counter.id='player-count';
    $('#player-results').setAttribute('aria-live','polite');
  }
};

// Handle only the new match-centre controls before the existing listeners.
document.addEventListener('click',e=>{
  const el=e.target.closest('button,a');if(!el)return;
  if(el.dataset.hubMode){state.matchMode=el.dataset.hubMode;state.hubFilter='all';state.hubSelection=0;render();}
  if(el.dataset.hubFilter){state.hubFilter=el.dataset.hubFilter;render();}
  if(el.dataset.hubMatch!==undefined){state.hubSelection=+el.dataset.hubMatch;render();if(matchMedia('(max-width:760px)').matches)$('.fixture-detail').scrollIntoView({behavior:'smooth',block:'start'});}
  if(el.dataset.openVerified||el.dataset.official){state.matchMode='verified';state.hubFilter='all';state.hubSelection=0;}
  if(el.matches('.skip')){e.preventDefault();e.stopImmediatePropagation();$('#main').focus();$('#main').scrollIntoView();}
},true);
document.addEventListener('click',e=>{
  if(e.target.closest('#menu'))$('#menu').setAttribute('aria-expanded',String($('#sidebar').classList.contains('open')));
  else if(!e.target.closest('#sidebar')&&$('#sidebar').classList.contains('open')){$('#sidebar').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');}
});
document.addEventListener('input',e=>{if(e.target.id==='player-search'&&$('#player-count'))$('#player-count').textContent=getPlayers().length;});
window.addEventListener('hashchange',()=>{
  if(location.hash==='#matches'&&state.matchFilter==='official'){state.matchMode='verified';state.matchFilter='all';render();}
});
render();

