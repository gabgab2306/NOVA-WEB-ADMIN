const SUPABASE_URL='https://hogbjrbaeedlyglegjle.supabase.co';
const SUPABASE_KEY='sb_publishable_NWG23rPztabdaFhEyNtN5w_rrCeMTC5';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,storage:sessionStorage}});
const $=id=>document.getElementById(id);
const meta={Pegaso:['#e9e4d5','♢','🪽'],Cronos:['#4c91ff','◷','⏳'],Fénix:['#e0bd67','ϟ','🔥'],Argos:['#55c98b','◉','👁️'],Olimpo:['#ef646e','△','⚡']};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
async function requireDirectiva(){const{data:{session}}=await sb.auth.getSession();if(!session){location.replace('index.html');return false}const{data,error}=await sb.rpc('is_directiva');if(error||data!==true){await sb.auth.signOut();location.replace('index.html');return false}return true}
function shell(active){$('shell').innerHTML=`<aside class="sidebar"><div class="brand"><div class="brand-symbol">N</div><div><b>NOVA</b><small>WEB OFICIAL</small></div></div><div class="side-label">CENTRO DE MANDO</div><nav class="nav">
<a class="${active==='dashboard'?'active':''}" href="dashboard.html"><span>⌂</span>Inicio</a>
<a class="${active==='preregistros'?'active':''}" href="preregistros.html"><span>✦</span>Pre-registros</a>
<a class="${active==='integrantes'?'active':''}" href="integrantes.html"><span>♙</span>Integrantes</a>
<a class="${active==='actividades'?'active':''}" href="actividades.html"><span>◇</span>Actividades</a>
<a class="${active==='areas'?'active':''}" href="areas.html"><span>✧</span>Áreas</a>
<a class="${active==='casas'?'active':''}" href="casas.html"><span>◈</span>Casas</a>
<a class="${active==='logros'?'active':''}" href="logros.html"><span>✦</span>Logros</a>
<a class="${active==='historial'?'active':''}" href="historial.html"><span>↯</span>Historial</a>
</nav><div class="side-bottom"><div class="access"><i class="pulse"></i><div><b>Sesión segura</b><small>Activa en esta pestaña</small></div></div><button id="logout" class="side-btn">↪ Cerrar sesión</button></div></aside>`;
$('logout').onclick=async()=>{await sb.auth.signOut();sessionStorage.clear();location.replace('index.html')}}
function toast(msg){let t=document.querySelector('.toast');if(t)t.remove();t=document.createElement('div');t.className='toast';t.textContent=msg;Object.assign(t.style,{position:'fixed',right:'22px',bottom:'22px',zIndex:99,padding:'12px 16px',background:'#0d1b2c',border:'1px solid #2b4968',borderRadius:'10px',color:'#fff',boxShadow:'0 15px 40px #0008',fontSize:'11px'});document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
document.addEventListener('DOMContentLoaded',async()=>{if(!$('shell'))return;const ok=await requireDirectiva();if(!ok)return;shell(document.body.dataset.page||'');});
