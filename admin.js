const $=i=>document.getElementById(i),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f=n=>Number(n).toLocaleString("ru-RU")+" ₽",RL={user:"Пользователь",seller:"Продавец",admin:"Админ",pre:"Преадмин"};
const pn=id=>(P.find(x=>x.id===id)||{n:id}).n,fd=t=>t?new Date(t).toLocaleString("ru-RU",{dateStyle:"short",timeStyle:"short"}):"";
let db,uid=null,U={},O=[],AC=[],LG=[],V="ov",Q="",RF="",ready=false,loaded=false;
const role=()=>(U[uid]&&U[uid].role)||null,own=()=>role()==="pre",isA=()=>role()==="admin"||role()==="pre",nm=()=>(U[uid]&&U[uid].name)||"admin";
const T={ov:"Обзор",tk:"Заявки в помощь",us:"Пользователи",of:"Предложения",pr:"Товары и цены",ch:"Чат админов",rt:"Рейтинг админов",lg:"Журнал действий"};
function toast(t){const e=$("ts");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2200)}
const log=(a,d)=>db.collection("logs").add({uid,name:nm(),a,d:String(d||""),ts:Date.now()}).catch(()=>{});
const canMod=t=>t!=uid&&U[t]&&(own()||(isA()&&["user","seller"].includes(U[t].role)));
const ft=(s,q)=>!q||String(s).toLowerCase().includes(q.toLowerCase());
const tb=(h,r)=>`<div class="tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr>${r||`<tr><td colspan="${h.length}" class="mu">Пусто</td></tr>`}</table></div>`;
const pill=r=>`<span class="pill r-${r}">${RL[r]||r}</span>`;
const logRows=a=>a.map(l=>`<tr><td class="mu">${fd(l.ts)}</td><td>${esc(l.name)}</td><td>${esc(l.a)}</td><td>${esc(l.d)}</td></tr>`).join("");

/* gate & auth */
function gate(m,form){$("app").hidden=true;$("gate").hidden=false;$("gm").textContent=m;$("gf").style.display=form?"grid":"none"}
function gl(){FB.auth.signInWithEmailAndPassword($("ge").value.trim(),$("gp").value).catch(()=>toast("Неверный email или пароль"))}
function check(){
  if(!ready)return;
  if(!uid)return gate("Вход только для админов",1);
  if(!isA())return gate("Нет доступа: аккаунт не админ. Выйди и войди другим.",1);
  if(U[uid].banned)return gate("Аккаунт заблокирован",0);
  $("gate").hidden=true;$("app").hidden=false;
  if(!loaded){loaded=true;sub()}
  render();
}
function sub(){
  const e=x=>console.error(x);
  db.collection("offers").onSnapshot(s=>{O=s.docs.map(x=>({id:x.id,...x.data()}));render()},e);
  db.collection("adminChat").orderBy("ts","desc").limit(150).onSnapshot(s=>{AC=s.docs.map(x=>({id:x.id,...x.data()})).sort((a,b)=>a.ts-b.ts);render()},e);
  db.collection("logs").orderBy("ts","desc").limit(150).onSnapshot(s=>{LG=s.docs.map(x=>({id:x.id,...x.data()}));render()},e);
  P=[];db.collection("products").onSnapshot(s=>{P=s.docs.map(x=>({id:x.id,...x.data(),e:CE[x.data().c]||"📦"}));render()},e);
  db.collection("tickets").orderBy("last","desc").limit(100).onSnapshot(s=>{TKS=s.docs.map(x=>({id:x.id,...x.data()}));render()},e);
}

/* actions */
const up=(t,d,a)=>db.collection("users").doc(t).update(d).then(()=>log(a,U[t]&&U[t].name)).catch(()=>toast("Нет прав"));
function ub(t,v){if(canMod(t))up(t,{banned:v},v?"бан":"разбан")}
function ud(t){if(!canMod(t)||!confirm("Удалить пользователя и все его предложения?"))return;const n=U[t].name;O.filter(o=>o.sid==t).forEach(o=>db.collection("offers").doc(o.id).delete());db.collection("users").doc(t).delete().then(()=>log("удалил пользователя",n)).catch(()=>toast("Нет прав"))}
function sr(t,r){if(own()&&t!=uid&&U[t].role!=="pre")up(t,{role:r},r=="admin"?"назначил админом":"снял админа")}
function rt(t,v){if(own()&&U[t].role=="admin")up(t,{rating:+v},"оценка "+v+"/5")}
function rn(t,v){if(own()&&U[t].role=="admin")up(t,{note:v.trim().slice(0,200)},"заметка")}
function bk(id,v){const o=O.find(x=>x.id==id);db.collection("offers").doc(id).update({blocked:v}).then(()=>log(v?"заблокировал предложение":"разблокировал",pn(o.pid)+" / "+o.shop)).catch(()=>toast("Нет прав"))}
function dl(id){const o=O.find(x=>x.id==id);if(!o||!confirm("Удалить предложение?"))return;db.collection("offers").doc(id).delete().then(()=>log("удалил предложение",pn(o.pid)+" / "+o.shop)).catch(()=>toast("Нет прав"))}
function ep(id,v){const o=O.find(x=>x.id==id),p=Math.round(+v);if(!o||!(p>0)||p==o.price)return;db.collection("offers").doc(id).update({price:p}).then(()=>log("изменил цену",pn(o.pid)+": "+o.price+" → "+p)).catch(()=>toast("Нет прав"))}
function sa(){const t=$("ci").value.trim();if(!t)return;$("ci").value="";db.collection("adminChat").add({uid,name:nm(),role:role(),text:t.slice(0,500),ts:Date.now()}).catch(()=>toast("Не отправлено"))}
function dc(id){if(own())db.collection("adminChat").doc(id).delete()}

/* views */
let TKS=[],TK=null,TM=[],utm=null;
const STT={open:"новая",answered:"отвечено",closed:"закрыта"};
function dp(id){const x=P.find(q=>q.id==id);if(!x||!confirm("Удалить товар и все предложения по нему?"))return;O.filter(o=>o.pid==id).forEach(o=>db.collection("offers").doc(o.id).delete());db.collection("products").doc(id).delete().then(()=>log("удалил товар",x.n)).catch(()=>toast("Нет прав"))}
function ot(id){TK=id;TM=[];utm&&utm();utm=db.collection("tickets").doc(id).collection("msgs").orderBy("ts").onSnapshot(s=>{TM=s.docs.map(x=>({id:x.id,...x.data()}));render()},e=>console.error(e));render()}
function rp(){const t=$("ti").value.trim();if(!t||!TK)return;$("ti").value="";const n=Date.now(),r=db.collection("tickets").doc(TK),tt=TKS.find(x=>x.id==TK);r.collection("msgs").add({uid,name:nm(),staff:true,text:t.slice(0,1500),ts:n}).then(()=>r.update({last:n,status:"answered"})).then(()=>log("ответил в заявке",tt&&tt.subject)).catch(()=>toast("Не отправлено"))}
function tcs(st){if(!TK)return;const tt=TKS.find(x=>x.id==TK);db.collection("tickets").doc(TK).update({status:st,last:Date.now()}).then(()=>log(st=="closed"?"закрыл заявку":"открыл заявку",tt&&tt.subject)).catch(()=>toast("Нет прав"))}
const VW={
ov(){
  const us=Object.values(U),c=r=>us.filter(u=>u.role==r).length;
  const st=[["Пользователи",c("user")],["Продавцы",c("seller")],["Админы",c("admin")+c("pre")],["Предложения",O.length],["Заблокировано",O.filter(o=>o.blocked).length],["В бане",us.filter(u=>u.banned).length]];
  return `<div class="cards">${st.map(([a,b])=>`<div class="card"><b>${b}</b><span>${a}</span></div>`).join("")}</div><h3>Последние действия</h3>`+tb(["Время","Кто","Действие","Объект"],logRows(LG.slice(0,8)));
},
us(){
  const ids=Object.keys(U).filter(t=>(!RF||U[t].role==RF)&&ft(U[t].name,Q)).sort((a,b)=>(U[b].ts||0)-(U[a].ts||0));
  return `<div class="tools"><select onchange="RF=this.value;render()"><option value="">Все роли</option>${Object.entries(RL).map(([k,v])=>`<option value="${k}" ${RF==k?"selected":""}>${v}</option>`).join("")}</select></div>`+
  tb(["Имя","Роль","Статус","Регистрация","Действия"],ids.map(t=>{const u=U[t];
    return `<tr class="${u.banned?"x":""}"><td>${esc(u.name)}${t==uid?' <span class="mu">(ты)</span>':""} <small class="mu">ID ${esc(u.aid||"—")}</small></td><td>${pill(u.role)}</td><td>${u.banned?'<span class="pill bad">бан</span>':'<span class="mu">активен</span>'}</td><td class="mu">${fd(u.ts)}</td><td class="a">`+
    (canMod(t)?(u.banned?`<button onclick="ub('${esc(t)}',false)">Разбан</button>`:`<button onclick="ub('${esc(t)}',true)">Бан</button>`)+`<button class="dg" onclick="ud('${esc(t)}')">Удалить</button>`:"")+
    (own()&&t!=uid&&u.role!=="pre"?(u.role=="admin"?`<button onclick="sr('${esc(t)}','user')">Снять админа</button>`:`<button class="pri" onclick="sr('${esc(t)}','admin')">Сделать админом</button>`):"")+`</td></tr>`}).join(""));
},
of(){
  const l=O.filter(o=>ft(pn(o.pid)+o.shop+o.sname,Q)).sort((a,b)=>b.ts-a.ts);
  return tb(["Товар","Магазин","Продавец","Цена, ₽","Статус","Действия"],l.map(o=>`<tr class="${o.blocked?"x":""}"><td>${esc(pn(o.pid))}</td><td>${/^https?:\/\//i.test(o.url)?`<a href="${esc(o.url)}" target="_blank" rel="noopener nofollow noreferrer">${esc(o.shop)}</a>`:esc(o.shop)}</td><td>${esc(o.sname)}</td><td><input type="number" min="1" id="p${esc(o.id)}" value="${o.price}" onchange="ep('${esc(o.id)}',this.value)"></td><td>${o.blocked?'<span class="pill bad">заблокировано</span>':'<span class="mu">активно</span>'}</td><td class="a"><button onclick="bk('${esc(o.id)}',${!o.blocked})">${o.blocked?"Разблок.":"Блок"}</button><button class="dg" onclick="dl('${esc(o.id)}')">Удалить</button></td></tr>`).join(""));
},
pr(){
  return tb(["Товар","Рынок","Мин.","Средняя","Предл.","Мин. к рынку",""],P.filter(x=>ft(x.n,Q)).map(x=>{
    const l=O.filter(o=>o.pid==x.id&&!o.blocked&&!(U[o.sid]&&U[o.sid].banned)).map(o=>o.price);
    const mn=l.length?Math.min(...l):0,av=l.length?Math.round(l.reduce((a,b)=>a+b,0)/l.length):0,d=mn?Math.round((mn/x.p-1)*100):null;
    return `<tr><td>${x.e} ${x.n}</td><td>${f(x.p)}</td><td>${mn?f(mn):"—"}</td><td>${av?f(av):"—"}</td><td>${l.length}</td><td style="color:${d===null?"inherit":d<=0?"var(--ok)":"var(--er)"}">${d===null?"—":(d>0?"+":"")+d+"%"}</td><td><button class="dg" onclick="dp('${esc(x.id)}')">Удалить</button></td></tr>`}).join(""));
},
ch(){
  return `<div class="chat"><div id="cm">${AC.map(m=>`<div class="cm ${m.uid==uid?"me":""}"><small>${esc(m.name)} · ${RL[m.role]||""} · ${fd(m.ts)}${own()?` · <a href="#" onclick="event.preventDefault();dc('${esc(m.id)}')">удалить</a>`:""}</small><br>${esc(m.text)}</div>`).join("")||'<span class="mu">Только для админов. Напиши первым.</span>'}</div><div class="tools"><input id="ci" maxlength="500" placeholder="Сообщение админам…" onkeydown="if(event.key==='Enter')sa()"><button class="pri" onclick="sa()">Отправить</button></div></div>`;
},
rt(){
  const ids=Object.keys(U).filter(t=>U[t].role=="admin"&&ft(U[t].name,Q));
  if(!ids.length)return '<p class="mu">Админов пока нет. Назначь их во вкладке «Пользователи».</p>';
  return `<div class="rg">${ids.map(t=>{const u=U[t],r=u.rating||0;
    return `<div class="rc"><b>${esc(u.name)}${t==uid?" (ты)":""}</b><div class="st">${"★".repeat(r)}${"☆".repeat(5-r)} <span class="mu">${r?r+"/5":"без оценки"}</span></div>`+
    (own()?`<select onchange="rt('${esc(t)}',this.value)"><option value="0">— оценка —</option>${[1,2,3,4,5].map(n=>`<option ${r==n?"selected":""}>${n}</option>`).join("")}</select><input id="n${esc(t)}" maxlength="200" placeholder="Заметка Преадмина" value="${esc(u.note||"")}" onchange="rn('${esc(t)}',this.value)">`:(u.note&&t==uid?`<span class="mu">Заметка: ${esc(u.note)}</span>`:""))+`</div>`}).join("")}</div>`;
},
lg(){return tb(["Время","Кто","Действие","Объект"],logRows(LG.filter(l=>ft(l.name+l.a+l.d,Q))))},
tk(){
  const cur=TKS.find(x=>x.id==TK);
  return `<div class="tkw"><div class="tkl">${TKS.map(t=>`<div class="tki ${t.id==TK?"on":""}" onclick="ot('${esc(t.id)}')"><b>${esc(t.subject)}</b><br><small class="mu">${esc(t.name)} · ${fd(t.last)}</small> <span class="pill ${t.status=="open"?"bad":""}">${STT[t.status]||t.status}</span></div>`).join("")||'<span class="mu">Заявок нет</span>'}</div><div>`+
  (TK?`<div class="chat"><div id="cm">${TM.map(m=>`<div class="cm ${m.staff?"me":""}"><small>${esc(m.name)}${m.staff?" · админ":""} · ${fd(m.ts)}</small><br>${esc(m.text).replace(/\n/g,"<br>")}</div>`).join("")}</div><div class="tools"><input id="ti" maxlength="1500" placeholder="Ответ пользователю…" onkeydown="if(event.key==='Enter')rp()"><button class="pri" onclick="rp()">Ответить</button>${cur&&cur.status=="closed"?'<button onclick="tcs(\'open\')">Открыть</button>':'<button onclick="tcs(\'closed\')">Закрыть</button>'}</div></div>`:'<span class="mu">Выбери заявку слева</span>')+`</div></div>`;
}
};
function go(v){V=v;Q="";$("gs").value="";render()}
function render(){
  if(!isA()||$("app").hidden)return;
  const ae=document.activeElement,aid=ae&&ae.id,av=ae&&ae.value,as=ae&&ae.selectionStart;
  $("me").innerHTML=`<b>${esc(nm())}</b>${pill(role())}`;{const n=TKS.filter(t=>t.status=="open").length;$("tkc").textContent=n?"("+n+")":""}
  document.querySelectorAll("#nv button").forEach(b=>b.classList.toggle("on",b.dataset.v==V));
  $("ttl").textContent=T[V];$("gs").style.display=["us","of","pr","rt","lg"].includes(V)?"":"none";
  $("v").innerHTML=VW[V]();
  if(aid&&aid!=="gs"&&$(aid)&&av!=null){const e=$(aid);if(e.tagName=="INPUT")e.value=av;e.focus();try{e.setSelectionRange(as,as)}catch(x){}}
  if(V=="ch"||(V=="tk"&&TK))$("cm").scrollTop=1e9;
}
/* start */
if(window.FB&&FB.db){
  db=FB.db;
  db.collection("users").onSnapshot(s=>{U={};s.docs.forEach(x=>U[x.id]=x.data());ready=true;check()},e=>gate("Ошибка доступа к базе: "+e.code,0));
  FB.auth.onAuthStateChanged(u=>{uid=u?u.uid:null;check()});
}else gate("Настрой firebase.js (см. README.md)",0);
