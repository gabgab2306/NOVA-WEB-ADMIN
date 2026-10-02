document.addEventListener('DOMContentLoaded',async()=>{
 await new Promise(resolve=>{if(document.querySelector('#shell .sidebar'))resolve(true);else document.addEventListener('nova-admin-ready',()=>resolve(true),{once:true})});
 const $=id=>document.getElementById(id);
 const dateKey=value=>{if(!value)return'';const d=new Date(value);if(Number.isNaN(d.getTime()))return'';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const displayDate=value=>{if(!value)return'Fecha pendiente';const d=new Date(value);return Number.isNaN(d.getTime())?String(value):d.toLocaleDateString('es-DO',{day:'2-digit',month:'short'})};
 const houseStyle=name=>{const m=meta[name]||['#a9b5c7','✦','✦'];return{color:m[0],symbol:m[1],emoji:m[2]}};
 const setHtml=(id,html)=>{const el=$(id);if(el)el.innerHTML=html};
 function renderTrend(pre){
  const el=$('registrationTrend');if(!el)return;
  const days=[];const today=new Date();today.setHours(0,0,0,0);
  for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);days.push({key:dateKey(d),label:d.toLocaleDateString('es-DO',{weekday:'short'}).replace('.',''),count:0})}
  const map=new Map(days.map(d=>[d.key,d]));pre.forEach(x=>{const k=dateKey(x.fecha_registro||x.created_at);if(map.has(k))map.get(k).count++});
  const max=Math.max(1,...days.map(d=>d.count)),points=days.map((d,i)=>({x:36+i*86,y:112-(d.count/max)*78,count:d.count,...d}));
  const line=points.map(p=>p.x+','+p.y).join(' '),area='36,112 '+line+' 552,112';
  const total=days.reduce((s,d)=>s+d.count,0),peak=Math.max(...days.map(d=>d.count));
  el.innerHTML='<div class="trend-summary"><div><small>ÚLTIMOS 7 DÍAS</small><b>'+total+'</b><span>solicitudes</span></div><div class="trend-peak"><small>DÍA CON MÁS REGISTROS</small><b>'+peak+'</b><span>en un día</span></div></div><div class="trend-svg-wrap"><svg class="trend-svg" viewBox="0 0 590 155" role="img" aria-label="Gráfico de pre-registros por día"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#42aaff" stop-opacity=".27"/><stop offset="100%" stop-color="#42aaff" stop-opacity="0"/></linearGradient></defs><path d="M36 34H552 M36 73H552 M36 112H552" stroke="#1b3047" stroke-dasharray="3 5" fill="none"/><polygon points="'+area+'" fill="url(#trendFill)"/><polyline points="'+line+'" fill="none" stroke="#55b7ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+points.map(p=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="4" fill="#07111e" stroke="#70c4ff" stroke-width="2"><title>'+p.label+': '+p.count+' solicitudes</title></circle><text x="'+p.x+'" y="139" text-anchor="middle" fill="#7488a2" font-size="10">'+esc(p.label)+'</text>').join('')+'</svg></div>';
 }
 function renderParticipation(members,houses){
  const el=$('houseParticipation');if(!el)return;
  const active=members.filter(m=>m.activo!==false),counts=new Map(houses.map(h=>[h.id,0]));let unassigned=0;
  active.forEach(m=>{if(m.casa_id&&counts.has(m.casa_id))counts.set(m.casa_id,counts.get(m.casa_id)+1);else unassigned++});
  const max=Math.max(1,...counts.values());
  el.innerHTML=houses.map(h=>{const s=houseStyle(h.nombre),n=counts.get(h.id)||0,pct=Math.round(n/max*100);return'<div class="participation-row"><div class="participation-label"><span class="participation-symbol" style="--house:'+s.color+'">'+s.symbol+'</span><b>'+esc(h.nombre)+'</b><strong>'+n+'</strong></div><div class="participation-track"><i style="--house:'+s.color+';width:'+pct+'%"></i></div></div>'}).join('')||'<div class="empty-small">Todavía no hay Casas registradas.</div>';
  const note=$('unassignedNotice');if(note){note.hidden=unassigned===0;note.innerHTML='<span>!</span><div><b>'+unassigned+' integrante'+(unassigned===1?'':'s')+' sin Casa asignada</b><small>La asignación se gestiona desde el módulo Casas.</small></div><a href="casas.html">Revisar ↗</a>'}
 }
 function renderRecent(pre){
  const items=pre.slice().sort((a,b)=>new Date(b.fecha_registro||b.created_at||0)-new Date(a.fecha_registro||a.created_at||0)).slice(0,5);
  setHtml('recent',items.length?'<div class="recent-list">'+items.map(x=>{const name=x.nombre_completo||x.nombre||x.nombre_visible||'Nuevo registro',status=String(x.estado||'pendiente').toLowerCase();return'<div class="dashboard-person"><div class="person-initial">'+esc(String(name).trim().split(/\\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase())+'</div><div class="person-copy"><b>'+esc(name)+'</b><small>'+esc(x.correo||x.email||'Correo no indicado')+' · '+esc(x.curso||'Curso pendiente')+'</small></div><span class="status '+(status==='aprobado'?'aprobado':status==='rechazado'?'rechazado':'pendiente')+'">'+esc(status)+'</span><time>'+esc(displayDate(x.fecha_registro||x.created_at))+'</time></div>'}).join('')+'</div>':'<div class="empty-small">Todavía no hay pre-registros.</div>');
 }
 function renderAgenda(acts){
  const upcoming=acts.filter(a=>a.estado!=='Finalizada'&&(!a.fecha||dateKey(a.fecha)>=dateKey(new Date()))).sort((a,b)=>new Date(a.fecha||'2999-01-01')-new Date(b.fecha||'2999-01-01')).slice(0,4);
  setHtml('upcoming',upcoming.length?'<div class="agenda-list">'+upcoming.map(a=>{const d=a.fecha?new Date(a.fecha+'T00:00:00'):null;return'<div class="dashboard-agenda-item"><div class="agenda-date-block"><b>'+(d&&!Number.isNaN(d.getTime())?d.getDate():'—')+'</b><small>'+(d&&!Number.isNaN(d.getTime())?d.toLocaleDateString('es-DO',{month:'short'}):'POR DEFINIR')+'</small></div><div><b>'+esc(a.nombre||'Actividad NOVA')+'</b><small>'+esc(a.tipo||'Actividad del club')+'</small></div></div>'}).join('')+'</div>':'<div class="empty-small">No hay actividades próximas. Puedes crear una desde Agenda.</div>');
 }
 function renderRanking(houses){
  const sorted=houses.slice().sort((a,b)=>(Number(b.puntos)||0)-(Number(a.puntos)||0)),max=Math.max(1,...sorted.map(h=>Number(h.puntos)||0));
  setHtml('ranking',sorted.map((h,i)=>{const s=houseStyle(h.nombre),pts=Number(h.puntos)||0;return'<article class="rank-card" style="--house:'+s.color+'"><div class="rank-card-top"><span>POSICIÓN '+String(i+1).padStart(2,'0')+'</span><span>'+s.symbol+'</span></div><div class="rank-card-name"><span>'+s.emoji+'</span><h4>'+esc(h.nombre)+'</h4></div><b class="rank-card-points">'+pts.toLocaleString('es-DO')+' <small>PTS</small></b><div class="rank-card-track"><i style="width:'+Math.max(0,pts/max*100)+'%"></i></div><small class="rank-card-caption">'+(pts===0?'Lista para sumar puntos':Math.round(pts/max*100)+'% del máximo actual')+'</small></article>'}).join('')||'<div class="empty-small">Las Casas aparecerán aquí cuando estén configuradas.</div>');
 }
 async function loadDashboard(){
  const results=await Promise.all([
   sb.from('pre_registros').select('*').order('fecha_registro',{ascending:false}),
   sb.from('integrantes').select('*'),
   sb.from('casas').select('*').order('puntos',{ascending:false}),
   sb.from('actividades').select('*').order('fecha',{ascending:true}),
   sb.from('movimientos_puntos').select('*').order('fecha',{ascending:false}).limit(10)
  ]);
  const failed=results.find(x=>x.error);if(failed){toast('No pudimos actualizar algunos datos del centro.');setHtml('stats','<article class="stat stat-error"><span>Conexión temporalmente limitada</span><small>Recarga en unos segundos.</small></article>');return}
  const pre=results[0].data||[],members=results[1].data||[],houses=results[2].data||[],acts=results[3].data||[],mov=results[4].data||[];
  const active=members.filter(x=>x.activo!==false).length,pending=pre.filter(x=>String(x.estado||'pendiente').toLowerCase()==='pendiente').length,approved=pre.filter(x=>String(x.estado||'').toLowerCase()==='aprobado').length,totalPoints=houses.reduce((s,h)=>s+(Number(h.puntos)||0),0);
  setHtml('stats',[
   ['✧','Pre-registros',pre.length,'Solicitudes recibidas','blue'],
   ['◌','Pendientes',pending,'Por revisar','gold'],
   ['♙','Integrantes activos',active,'Cuentas de integrantes','green'],
   ['✦','Puntos de Casas',totalPoints.toLocaleString('es-DO'),'Puntuación acumulada','violet']
  ].map(x=>'<article class="stat stat-'+x[4]+'"><div class="stat-top"><span>'+x[0]+'</span><i>↗</i></div><small>'+x[1]+'</small><b>'+x[2]+'</b><em>'+x[3]+'</em></article>').join(''));
  renderTrend(pre);renderParticipation(members,houses);renderRecent(pre);renderAgenda(acts);renderRanking(houses);
  const updated=$('lastUpdated');if(updated)updated.textContent='Actualizado '+new Date().toLocaleTimeString('es-DO',{hour:'2-digit',minute:'2-digit'});
  const recentPanel=document.querySelector('.dashboard-recent .panel-head h3');if(recentPanel)recentPanel.setAttribute('title',approved+' solicitudes aprobadas');
  const recentEl=$('recent');if(recentEl&&mov.length){const movementHint=document.createElement('div');movementHint.className='dashboard-movement-note';movementHint.innerHTML='<span>↯</span><div><b>'+mov.length+' movimientos recientes de puntos</b><small>El historial completo está disponible en el módulo correspondiente.</small></div><a href="historial.html">Ver historial ↗</a>';recentEl.appendChild(movementHint)}
 }
 await loadDashboard();
 sb.channel('nova-admin-dashboard-live').on('postgres_changes',{event:'*',schema:'public',table:'pre_registros'},loadDashboard).on('postgres_changes',{event:'*',schema:'public',table:'integrantes'},loadDashboard).on('postgres_changes',{event:'*',schema:'public',table:'casas'},loadDashboard).on('postgres_changes',{event:'*',schema:'public',table:'actividades'},loadDashboard).on('postgres_changes',{event:'*',schema:'public',table:'movimientos_puntos'},loadDashboard).subscribe();
});