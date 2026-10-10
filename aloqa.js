let CH=[],act=null,MS=[],uc=null,um=null,ucUid="~",PF=null,hd=0,rs0=0;
const cid=(a,b)=>[a,b].sort().join("_"),oth=c=>c.members.find(x=>x!=uid);
const fh=t=>new Date(t).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
function nk(v){v=v.trim();if(!v)return null;if(v.includes("@"))return"email:"+v.toLowerCase();const d=v.replace(/\D/g,"");if(/^\d{7}$/.test(d))return"id:"+d;const p=nph(d);return p?"tel:"+p:null}
async function nc(){
  if(!db)return toast("Настрой firebase.js");
  if(!uid)return am("in");
  if(ban())return toast("Вы заблокированы");
  const k=nk($("nq").value);if(!k)return toast("Введи ID (7 цифр), телефон или email");
  try{
    const s=await db.collection("handles").doc(k).get();
    if(!s.exists)return toast("Пользователь не найден");
    const o=s.data().uid;if(o==uid)return toast("Это ты 🙂");
    const id=cid(uid,o),ref=db.collection("chats").doc(id),d=await ref.get();
    if(!d.exists)await ref.set({members:[uid,o].sort(),ts:Date.now()});
    $("nq").value="";oc(id);
  }catch(e){toast("Ошибка: "+(e.code||e.message))}
}
function oc(id){
  act=id;MS=[];um&&um();
  try{localStorage.setItem("al_"+uid,id)}catch(e){}
  $("al").classList.add("op");
  const c=CH.find(x=>x.id==id),u=U[c?oth(c):id.split("_").find(x=>x!=uid)]||{};
  $("alR").innerHTML=`<button class="g back" onclick="$('al').classList.remove('op');act=null;rl()">← Чаты</button><div><b>${esc(u.name||"Пользователь")}</b> <small>ID ${esc(u.aid||"")}</small></div><div class="msgs" id="amsgs"></div><div class="row"><input id="ai2" maxlength="1000" placeholder="Сообщение…" onkeydown="if(event.key==='Enter')sm()"><button onclick="sm()">➤</button></div>`;
  um=db.collection("chats").doc(id).collection("msgs").orderBy("ts").limitToLast(200).onSnapshot(s=>{MS=s.docs.map(x=>({id:x.id,...x.data()}));rm()},e=>console.error(e));
  rl();
}
function rm(){
  const el=$("amsgs");if(!el)return;
  el.innerHTML=MS.map(m=>`<div class="m ${m.from==uid?"u":"a"}">${esc(m.text)}<br><small>${fh(m.ts)}</small></div>`).join("")||'<p class="sub">Напиши первым!</p>';
  el.scrollTop=1e9;
}
function sm(){
  const t=$("ai2").value.trim();if(!t||!act)return;
  if(ban())return toast("Вы заблокированы");
  $("ai2").value="";
  const ref=db.collection("chats").doc(act),n=Date.now();
  ref.collection("msgs").add({from:uid,text:t.slice(0,1000),ts:n}).then(()=>ref.update({last:t.slice(0,60),ts:n,lastFrom:uid})).catch(()=>toast("Не отправлено"));
}
function rl(){
  $("chl").innerHTML=[...CH].sort((a,b)=>(b.ts||0)-(a.ts||0)).map(c=>{const u=U[oth(c)]||{};
    return`<div class="ci ${c.id==act?"on":""}" onclick="oc('${esc(c.id)}')"><b>${esc(u.name||"Пользователь")}</b><small>ID ${esc(u.aid||"")}</small><div class="mu">${c.lastFrom==uid?"Ты: ":""}${esc(c.last||"")}</div></div>`}).join("")||(uid?'<p class="sub">Чатов пока нет. Найди собеседника по ID, телефону или email.</p>':"");
}
function rme(){
  const b=$("meBox");
  if(!db){b.innerHTML='<p class="sub">Настрой firebase.js (см. README)</p>';return}
  if(!uid){b.innerHTML='<p class="sub">Войди, чтобы пользоваться Aloqa.</p><button onclick="am(\'in\')">Войти</button> <button class="g" onclick="am(\'up\')">Регистрация</button>';return}
  const u=U[uid]||{};
  b.innerHTML=`<div class="box" style="padding:12px"><b>${esc(u.name||"…")}</b><br>Мой ID: <b>${esc(u.aid||"…")}</b><br><small>${PF&&PF.email?esc(PF.email):""}</small><br><small>${PF&&PF.phone?"📞 +"+esc(PF.phone):""}</small>`+
  (PF&&!PF.phone?`<div class="row"><input id="mp" type="tel" placeholder="Привязать телефон"><button class="g" onclick="ap()">OK</button></div>`:"")+
  `<div class="row"><button class="g" onclick="cp()">🔗 Моя ссылка</button></div></div>`;
}
function cp(){const u=location.href.split("#")[0]+"#u="+(U[uid]||{}).aid;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast("Ссылка скопирована")).catch(()=>toast(u))}
async function ap(){
  const p=nph($("mp").value);if(!p)return toast("Неверный телефон");
  try{await db.collection("handles").doc("tel:"+p).set({uid});await db.collection("profiles").doc(uid).set({phone:p},{merge:true});PF.phone=p;toast("Телефон привязан ✅");rme()}
  catch(e){toast("Номер уже занят")}
}
function rall(){
  if(!db){rme();return}
  if(uid!==ucUid){
    ucUid=uid;uc&&uc();um&&um();CH=[];act=null;PF=null;hd=0;rs0=0;
    $("alR").innerHTML='<p class="sub">Выбери чат или найди собеседника.</p>';
    if(uid){
      uc=db.collection("chats").where("members","array-contains",uid).onSnapshot(s=>{
        CH=s.docs.map(x=>({id:x.id,...x.data()}));rl();
        if(!rs0&&!act&&innerWidth>760){rs0=1;let l=null;try{l=localStorage.getItem("al_"+uid)}catch(e){}if(l&&CH.some(x=>x.id==l))oc(l)}
      },e=>console.error(e));
      db.collection("profiles").doc(uid).get().then(s=>{PF=s.exists?s.data():{};rme()}).catch(()=>{PF={};rme()});
    }
  }
  rme();rl();
  const m=location.hash.match(/^#u=(\d{7})$/);
  if(m&&uid&&!hd&&U[uid]){hd=1;$("nq").value=m[1];nc()}
}
rall();
