/* Birga: общий код для всех страниц — шапка, тема, вход/регистрация, роли */
const $=i=>document.getElementById(i),
esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const RL={user:"Пользователь",seller:"Продавец",admin:"Админ",pre:"Преадмин"};
let db=null,uid=null,own=false,U={},PRD=[];
const role=()=>(U[uid]&&U[uid].role)||null,
ban=()=>!own&&!!(U[uid]&&U[uid].banned),
isA=()=>role()==="admin"||role()==="pre",
isS=()=>role()==="seller"||isA(),
meName=()=>(U[uid]&&U[uid].name)||"Гость";
function toast(t){const e=$("ts");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),2400)}
function cl(){$("md").classList.remove("open")}
function openM(h){$("mdc").innerHTML=h;$("md").classList.add("open")}
function tg(){const r=document.documentElement,d=r.dataset.theme?r.dataset.theme=="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=d?"light":"dark";try{localStorage.setItem("th",r.dataset.theme)}catch(e){}}
try{const t=localStorage.getItem("th");if(t)document.documentElement.dataset.theme=t}catch(e){}
addEventListener("keydown",e=>{if(e.key==="Escape")cl()});
document.body.insertAdjacentHTML("afterbegin",'<header><div class="w"><nav><a class="logo" href="index.html">Birga</a><div class="l"><a href="benefit.html">🛍 Benefit</a><a href="aloqa.html">💬 Aloqa</a><a href="help.html">🆘 Помощь</a><a href="games.html">🎮 Игры</a><a id="na" href="admin.html" hidden>⚙ Админ</a></div><button class="g" onclick="tg()">🌓</button><span id="au"></span></nav></div></header>');
document.body.insertAdjacentHTML("beforeend",'<div class="modal" id="md" onclick="if(event.target===this)cl()"><div class="box" id="mdc"></div></div><div class="toast" id="ts"></div>');
if(window.FB&&FB.local&&!sessionStorage.getItem("nb"))document.querySelector("header").insertAdjacentHTML("afterend",'<div class="nb"><span>🧪 Демо-режим: данные хранятся только в этом браузере. Первый зарегистрированный аккаунт становится <b>Преадмином</b>. Для общей базы подключи Firebase (см. README).</span><button class="g" onclick="try{sessionStorage.setItem(\'nb\',1)}catch(e){}this.parentNode.remove()">✕</button></div>');
document.querySelectorAll("nav .l a").forEach(a=>{if(location.pathname.endsWith(a.getAttribute("href")))a.style.color="var(--tx)"});

/* телефон: только цифры, 9 цифр → +998 */
function nph(s){let d=String(s||"").replace(/\D/g,"");if(!d)return"";if(d.length==9)d="998"+d;return d.length>=10&&d.length<=15?d:""}

/* вход / регистрация */
const er=e=>toast(({"auth/invalid-credential":"Неверный email или пароль","auth/email-already-in-use":"Этот email уже занят","auth/weak-password":"Пароль — минимум 6 символов","auth/invalid-email":"Неверный email","auth/too-many-requests":"Слишком много попыток, подожди"})[e.code]||e.message||"Ошибка");
function ra(){
  const a=$("au");
  if(!db){a.innerHTML="<small>демо: настрой firebase.js</small>";return}
  const lp=FB.local?'<span class="pill" title="Данные хранятся в этом браузере. Подключи Firebase для общей базы.">Демо-база</span> ':"";
  if(!uid){a.innerHTML=lp+'<button onclick="am(\'in\')">Войти</button>';$("na").hidden=true;return}
  const r=role();
  a.innerHTML=lp+`<span class="badge">${r?esc(meName())+" · "+RL[r]+(ban()?" · бан":""):"…"}</span> <button class="g" onclick="FB.auth.signOut()">Выйти</button>`;
  $("na").hidden=!isA();
}
function am(t){
  const up=t=="up";setTimeout(()=>{try{if(!up&&$("re"))$("re").value=localStorage.getItem("em")||""}catch(e){}},0);
  openM(`<div class="row" style="justify-content:space-between;margin:0"><h3>${up?"Регистрация":"Вход"}</h3><button class="g" onclick="cl()">✕</button></div><div class="fm" style="grid-template-columns:1fr;margin-top:10px">${up?'<div><label>Имя</label><input id="rn" maxlength="30"></div>':""}<div><label>Email</label><input id="re" type="email" autocomplete="email"></div>${up?'<div><label>Телефон (необязательно — для поиска в Aloqa)</label><input id="rt" type="tel" placeholder="90 123 45 67"></div>':""}<div><label>Пароль</label><input id="rp" type="password" autocomplete="${up?"new-password":"current-password"}" onkeydown="if(event.key===\'Enter\')${up?"reg()":"li()"}"></div>${up?'<div><label>Роль</label><select id="rr"><option value="user">Пользователь — цены, чаты, игры</option><option value="seller">Продавец — ещё и публикует цены</option></select></div>':""}${up?"":'<label style="display:flex;gap:8px;align-items:center;font-size:13px"><input id="rm" type="checkbox" checked style="width:auto"> Запомнить меня на этом устройстве</label>'}<button onclick="${up?"reg()":"li()"}">${up?"Создать аккаунт":"Войти"}</button><small>${up?'Есть аккаунт? <a href="#" onclick="event.preventDefault();am(\'in\')">Войти</a>':'Нет аккаунта? <a href="#" onclick="event.preventDefault();am(\'up\')">Регистрация</a>'}</small></div>`);
}
function li(){
  const em=$("re").value.trim(),keep=$("rm")?$("rm").checked:true;
  FB.auth.setPersistence(keep?"local":"session")
    .then(()=>FB.auth.signInWithEmailAndPassword(em,$("rp").value))
    .then(()=>{try{keep?localStorage.setItem("em",em):localStorage.removeItem("em")}catch(e){}cl()}).catch(er);
}
async function reg(){
  const n=$("rn").value.trim().slice(0,30),r=$("rr").value,em=$("re").value.trim(),raw=$("rt").value.trim(),ph=nph(raw);
  if(n.length<2)return toast("Имя от 2 символов");
  if(raw&&!ph)return toast("Неверный телефон");
  try{
    const c=await FB.auth.createUserWithEmailAndPassword(em,$("rp").value),u=c.user.uid;
    let aid=0;
    for(let i=0;i<8&&!aid;i++){const a=String(Math.floor(1e6+Math.random()*9e6));try{await db.collection("handles").doc("id:"+a).set({uid:u});aid=a}catch(e){}}
    if(!aid)throw{message:"Не удалось выдать ID — проверь правила Firestore"};
    await db.collection("users").doc(u).set({name:n,role:r==="seller"?"seller":"user",banned:false,ts:Date.now(),aid});
    await db.collection("handles").doc("email:"+em.toLowerCase()).set({uid:u}).catch(()=>{});
    if(ph)await db.collection("handles").doc("tel:"+ph).set({uid:u}).catch(()=>toast("Этот телефон уже занят"));
    await db.collection("profiles").doc(u).set({email:em,phone:ph}).catch(()=>{});
    try{localStorage.setItem("em",em)}catch(e){}cl();toast("Добро пожаловать, "+n+"!");
  }catch(e){er(e)}
}

/* состояние: страницы определяют rall() — вызывается при любом изменении */
function upd(){ra();if(typeof rall==="function")rall()}
if(window.FB&&FB.db){
  db=FB.db;
  FB.auth.onAuthStateChanged(u=>{uid=u?u.uid:null;own=role()==="pre";upd()});
  db.collection("products").onSnapshot(s=>{PRD=s.docs.map(x=>({id:x.id,...x.data(),e:CE[x.data().c]||"📦"}));P=PRD.length?PRD:DEMO;upd()},e=>console.error(e));
  db.collection("users").onSnapshot(s=>{U={};s.docs.forEach(x=>U[x.id]=x.data());own=role()==="pre";upd()},e=>console.error(e));
}
ra();
