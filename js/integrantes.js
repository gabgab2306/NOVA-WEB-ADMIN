let members=[],houses=[],page=1;const size=6;
document.addEventListener('DOMContentLoaded',async()=>{
 const[m,h]=await Promise.all([sb.from('integrantes').select('*').order('nombre_completo'),sb.from('casas').select('*').order('nombre')]);
 if(m.error||h.error)return toast((m.error||h.error).message);
 members=m.data||[];houses=h.data||[];
 $('houseFilter').innerHTML='<option value="">Todas las Casas</option>'+houses.map(h=>`<option value="${h.id}">${esc(h.nombre)}</option>`).join('');
 $('search').oninput=()=>{page=1;render()};$('houseFilter').onchange=()=>{page=1;render()};render();
});
function render(){
 const q=$('search').value.toLowerCase(),hf=$('houseFilter').value;
 const data=members.filter(x=>(!hf||x.casa_id===hf)&&[x.nombre_completo,x.username,x.curso,x.seccion,x.email].join(' ').toLowerCase().includes(q));
 $('memberCount').textContent=data.length+' INTEGRANTES';
 $('list').innerHTML=data.length?'<div class="member-grid">'+data.slice((page-1)*size,page*size).map(x=>`<article class="member-card">
 <div class="member-card-top"><div class="member-avatar">${esc((x.nombre_completo||'?').split(' ').map(n=>n[0]).slice(0,2).join(''))}</div><div class="member-identity"><b>${esc(x.nombre_completo)}</b><small>@${esc(x.username||'sin-usuario')}</small></div></div>
 <div class="member-meta"><span><small>CURSO</small><b>${esc(x.curso||'Sin curso')} · ${esc(x.seccion||'')}</b></span><span><small>ESTADO</small><b class="member-status ${x.activo?'active':'inactive'}">${x.activo?'Activo':'Inactivo'}</b></span></div>
 <div class="member-house-box"><small>CASA</small><select class="member-house" onchange="assign('${x.id}',this.value)"><option value="">Sin casa</option>${houses.map(h=>`<option value="${h.id}" ${h.id===x.casa_id?'selected':''}>${esc(h.nombre)}</option>`).join('')}</select></div>
 <div class="member-actions"><button class="action feedback-action" onclick="feedbackMember('${x.id}')">Agregar feedback</button><button class="action" onclick="editMember('${x.id}')">Editar ficha</button></div>
</article>`).join('')+'</div>':'<div class="empty">No hay integrantes.</div>';
 const pages=Math.max(1,Math.ceil(data.length/size));$('pager').innerHTML=Array.from({length:pages},(_,i)=>`<button class="${i+1===page?'active':''}" onclick="go(${i+1})">${i+1}</button>`).join('');
}
window.go=n=>{page=n;render()};
window.assign=async(id,casa_id)=>{const{error}=await sb.from('integrantes').update({casa_id:casa_id||null}).eq('id',id);if(error)return toast(error.message);members=members.map(x=>x.id===id?{...x,casa_id:casa_id||null}:x);render();toast('Casa asignada. ✦')};

async function getAssignment(table,id){const{data,error}=await sb.from(table).select('*').eq('integrante_id',id).maybeSingle();return{data,error}}
function inputValue(id){return $(id)?.value?.trim()||null}
function selectedAreas(){return [...document.querySelectorAll('input[name="area"]:checked')].map(x=>x.value)}

window.editMember=async id=>{
 const base=members.find(x=>x.id===id);if(!base)return;
 const [rAreas,rMun,rDebate,rStaff]=await Promise.all([getAssignment('integrante_areas',id),getAssignment('mun_asignaciones',id),getAssignment('debate_tripletas',id),getAssignment('staff_asignaciones',id)]);
 if(rAreas.error||rMun.error||rDebate.error||rStaff.error)return toast('No se pudo cargar toda la ficha.');
 const areas=rAreas.data||[],mun=rMun.data||null,debate=rDebate.data||null,staff=rStaff.data||null;
 $('modal').innerHTML=`<div class="editor">
 <div class="editor-head"><div><span class="eyebrow">FICHA COMPLETA DEL INTEGRANTE</span><h2>${esc(base.nombre_completo)}</h2></div><button class="close" onclick="closeModal()">×</button></div>
 <form id="editForm">
 <div class="editor-section"><span class="eyebrow">01 · INFORMACIÓN PERSONAL</span><div class="editor-grid">
 <label>Nombre completo<input id="eNombre" value="${esc(base.nombre_completo)}"></label><label>Username<input id="eUser" value="${esc(base.username||'')}"></label>
 <label>Curso<input id="eCurso" value="${esc(base.curso||'')}"></label><label>Sección<input id="eSeccion" value="${esc(base.seccion||'')}"></label>
 <label>Teléfono<input id="eTel" value="${esc(base.telefono||'')}"></label><label>Correo<input value="${esc(base.email||'')}" readonly></label>
 <label>Casa<select id="eCasa"><option value="">Sin casa</option>${houses.map(h=>`<option value="${h.id}" ${h.id===base.casa_id?'selected':''}>${esc(h.nombre)}</option>`).join('')}</select></label>
 <label>Estado<select id="eAct"><option value="true" ${base.activo?'selected':''}>Activo</option><option value="false" ${!base.activo?'selected':''}>Inactivo</option></select></label>
 </div></div>
 <div class="editor-section"><span class="eyebrow">02 · INTERESES Y EXPERIENCIA</span><div class="editor-grid">
 <div class="full"><label>Áreas de interés</label><div class="check-grid">${['MUN / ONU','Debate','Oratoria','Artística','Staff'].map(a=>`<label class="check"><input type="checkbox" name="interes" value="${a}" ${Array.isArray(base.intereses)&&base.intereses.includes(a)?'checked':''}> ${a}</label>`).join('')}</div></div>
 <label>¿Tiene experiencia?<select id="eExp"><option value="false" ${!base.experiencia?'selected':''}>No</option><option value="true" ${base.experiencia?'selected':''}>Sí</option></select></label>
 <label class="full">Detalle de experiencia<textarea id="eDetalle" rows="2">${esc(base.detalle_experiencia||'')}</textarea></label>
 <label class="full">Motivación<textarea id="eMot" rows="3">${esc(base.motivacion||'')}</textarea></label>
 </div></div>
 <div class="editor-section"><span class="eyebrow">03 · ÁREAS ASIGNADAS</span><div class="area-editor">${['Artística','MUN / ONU','Debate','Oratoria','Staff'].map(a=>{const row=areas.find(x=>x.area===a);return '<div class="area-row"><label class="check"><input type="checkbox" name="area" value="'+a+'" '+(row?'checked':'')+'> '+a+'</label><input class="area-detail" data-area="'+a+'" value="'+esc(row?.detalle||'')+'" placeholder="Detalle / función en esta área"></div>'}).join('')}</div></div></div>
 <div class="editor-section"><span class="eyebrow">04 · MUN / ONU</span><div class="editor-grid">
 <label>País<input id="ePais" value="${esc(mun?.pais||'')}"></label><label>Comisión<input id="eComision" value="${esc(mun?.comision||'')}"></label><label class="full">Delegación<input id="eDelegacion" value="${esc(mun?.delegacion||'')}"></label>
 </div></div>
 <div class="editor-section"><span class="eyebrow">05 · DEBATE</span><div class="editor-grid">
 <label>Nombre de tripleta<input id="eTripleta" value="${esc(debate?.nombre_tripleta||'')}"></label><label>Compañeros<input id="eCompaneros" value="${esc(Array.isArray(debate?.companeros)?debate.companeros.join(', '):'')}"></label>
 </div></div>
 <div class="editor-section"><span class="eyebrow">06 · STAFF</span><div class="editor-grid">
 <label>Rol<input id="eRol" value="${esc(staff?.rol||'')}"></label><label>Área de Staff<input id="eAreaStaff" value="${esc(staff?.area_staff||'')}"></label>
 </div></div>
 <div class="actions"><button type="button" class="ghost" onclick="closeModal()">Cancelar</button><button class="primary compact">Guardar ficha completa</button></div>
 </form></div>`;
 $('modal').hidden=false;
 $('editForm').onsubmit=async e=>{
   e.preventDefault();
   const patch={nombre_completo:inputValue('eNombre'),username:inputValue('eUser'),curso:inputValue('eCurso'),seccion:inputValue('eSeccion'),telefono:inputValue('eTel'),experiencia:$('eExp').value==='true',detalle_experiencia:inputValue('eDetalle'),motivacion:inputValue('eMot'),intereses:[...document.querySelectorAll('input[name="interes"]:checked')].map(x=>x.value),casa_id:$('eCasa').value||null,activo:$('eAct').value==='true'};
   const{error}=await sb.from('integrantes').update(patch).eq('id',id);if(error)return toast(error.message);
   const a=selectedAreas();
   let op=await sb.from('integrante_areas').delete().eq('integrante_id',id);if(op.error)return toast(op.error.message);
   if(a.length){op=await sb.from('integrante_areas').insert(a.map(area=>({integrante_id:id,area,detalle:document.querySelector('.area-detail[data-area="'+CSS.escape(area)+'"]')?.value.trim()||null})));if(op.error)return toast(op.error.message)}
   const munPayload={pais:inputValue('ePais'),comision:inputValue('eComision'),delegacion:inputValue('eDelegacion')};
   op=await saveOne('mun_asignaciones',id,munPayload);if(op.error)return toast(op.error.message);
   const debatePayload={nombre_tripleta:inputValue('eTripleta'),companeros:inputValue('eCompaneros')?[inputValue('eCompaneros')].join(',').split(',').map(x=>x.trim()).filter(Boolean):[]};
   op=await saveOne('debate_tripletas',id,debatePayload);if(op.error)return toast(op.error.message);
   const staffPayload={rol:inputValue('eRol'),area_staff:inputValue('eAreaStaff')};
   op=await saveOne('staff_asignaciones',id,staffPayload);if(op.error)return toast(op.error.message);
   members=members.map(x=>x.id===id?{...x,...patch}:x);closeModal();render();toast('Ficha completa actualizada. ✦');
 };
};
async function saveOne(table,id,payload){
 const clean=Object.fromEntries(Object.entries(payload).filter(([,v])=>v!==null&&v!==''||(Array.isArray(v)&&v.length)));
 const has=Object.values(clean).some(v=>Array.isArray(v)?v.length:v);
 const existing=await sb.from(table).select('id').eq('integrante_id',id).maybeSingle();if(existing.error)return existing;
 if(!has){if(existing.data)return await sb.from(table).delete().eq('id',existing.data.id);return{error:null}}
 if(existing.data)return await sb.from(table).update(clean).eq('id',existing.data.id);
 return await sb.from(table).insert({integrante_id:id,...clean});
}
window.closeModal=()=>{$('modal').hidden=true};

window.feedbackMember=async id=>{
 const base=members.find(x=>x.id===id);if(!base)return;
 const {data:activities,error}=await sb.from('actividades').select('*').order('fecha',{ascending:false});
 if(error)return toast(error.message);
 const list=activities||[];
 const {data:evaluations,error:evError}=await sb.from('evaluaciones').select('*').eq('integrante_id',id);
 if(evError)return toast(evError.message);
 $('modal').innerHTML='<div class="editor feedback-editor"><div class="editor-head"><div><span class="eyebrow">RETROALIMENTACIÓN DEL INTEGRANTE</span><h2>'+esc(base.nombre_completo)+'</h2></div><button class="close" onclick="closeModal()">×</button></div><form id="feedbackForm"><div class="editor-section"><span class="eyebrow">ACTIVIDAD</span><div class="editor-grid"><label class="full">Seleccionar actividad<select id="feedbackActivity"><option value="">Elige una actividad</option>'+list.map(a=>'<option value="'+a.id+'">'+esc(a.nombre)+' · '+esc(a.estado||'')+'</option>').join('')+'</select></label></div></div><div class="editor-section"><span class="eyebrow">FEEDBACK</span><div class="editor-grid"><label class="full">Retroalimentación<textarea id="feedbackText" rows="7" placeholder="Escribe aquí la retroalimentación para este integrante..."></textarea></label></div></div><div class="actions"><button type="button" class="ghost" onclick="closeModal()">Cancelar</button><button class="primary compact">Guardar feedback</button></div></form></div>';
 $('modal').hidden=false;
 const actSel=$('feedbackActivity'),txt=$('feedbackText');
 actSel.onchange=()=>{const found=(evaluations||[]).find(e=>e.actividad_id===actSel.value);txt.value=found?.feedback||''};
 $('feedbackForm').onsubmit=async e=>{
  e.preventDefault();
  const actividad_id=actSel.value,feedback=txt.value.trim();
  if(!actividad_id)return toast('Selecciona una actividad.');
  if(!feedback)return toast('Escribe el feedback.');
  const {data:{user}}=await sb.auth.getUser();
  let op=await sb.from('evaluaciones').delete().eq('integrante_id',id).eq('actividad_id',actividad_id);
  if(op.error)return toast(op.error.message);
  op=await sb.from('evaluaciones').insert({integrante_id:id,actividad_id,feedback,evaluador:user?.id||null,criterios:[],total:null,maximo:null});
  if(op.error)return toast(op.error.message);
  closeModal();toast('Feedback guardado. ✦');
 };
};
