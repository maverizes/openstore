const g=id=>P.find(x=>x.id===id),f=n=>Number(n).toLocaleString("ru-RU")+" ₽";
let O=[],cat="all",cur=null,hsd=0;
const OO=()=>P===DEMO?O.concat(DEMO_OFFERS):O;
const nf=()=>'<div class="box" style="grid-column:1/-1"><b>Ничего не найдено в каталоге Benefit.</b><p class="sub">Похожие сайты и поиск:</p>'+sgHtml($("q").value||"купить")+"</div>";

/* offers */
const live=pid=>OO().filter(o=>o.pid==pid&&!o.blocked&&!(U[o.sid]&&U[o.sid].banned));
const offs=pid=>OO().filter(o=>o.pid==pid&&(isA()||o.sid==uid||(!o.blocked&&!(U[o.sid]&&U[o.sid].banned)))).sort((a,b)=>a.price-b.price);
const best=pid=>{const l=live(pid);return l.length?Math.min(...l.map(o=>o.price)):0};
const canDel=o=>isA()||(o.sid==uid&&isS()&&!ban());
const acts=o=>o.demo?"":(canDel(o)?`<button class="g" title="Цена" onclick="ep('${esc(o.id)}')">✏</button>`:"")+(canDel(o)?`<button class="g" title="Удалить" onclick="dl('${esc(o.id)}')">🗑</button>`:"")+(isA()?`<button class="g" title="${o.blocked?"Разблокировать":"Заблокировать"}" onclick="bk('${esc(o.id)}',${!o.blocked})">${o.blocked?"✔":"⛔"}</button>`:"");
function dl(id){const o=O.find(x=>x.id==id);if(!db||!o||!canDel(o))return;db.collection("offers").doc(id).delete().catch(()=>toast("Нет прав"))}
function bk(id,v){if(!db||!isA())return;db.collection("offers").doc(id).update({blocked:v}).catch(()=>toast("Ошибка"))}
function post(){
  if(!db)return toast("Нужен вход в Claude");
  if(!isS()||ban())return toast("Нет прав");
  const pid=$("sp").value,shop=$("ss").value.trim().slice(0,40),price=Math.round(+$("sx").value),url=$("su").value.trim().slice(0,300);
  if(!pid)return toast("Сначала добавь товар");if(!shop||!(price>0)||!/^https?:\/\/\S+$/i.test(url))return toast("Заполни магазин, цену и ссылку http(s)://");
  db.collection("offers").add({pid,shop,price,url,sid:uid,sname:meName(),blocked:false,ts:Date.now()}).then(()=>{toast("Опубликовано ✅");$("sx").value=""}).catch(()=>toast("Ошибка"));
}

/* catalog */
function tabs(){$("tabs").innerHTML=[["all","Все"],...Object.entries(C)].map(([k,v])=>`<button class="${k===cat?"on":""}" onclick="cat='${k}';tabs();rc()">${v}</button>`).join("")}
function rc(){
  $("demo").hidden=P!==DEMO;
  const q=$("q").value.toLowerCase(),s=$("so").value,k=x=>best(x.id)||x.p;
  let a=P.filter(x=>(cat=="all"||x.c==cat)&&(x.n+x.s).toLowerCase().includes(q));
  if(s==1)a.sort((x,y)=>k(x)-k(y));if(s==2)a.sort((x,y)=>k(y)-k(x));
  $("grid").innerHTML=a.map(x=>{const l=live(x.id).length,b=best(x.id),sv=b?Math.round((1-b/x.p)*100):0;
    return `<div class="p"><div class="e">${x.e}</div><div class="tag">${C[x.c]}${x.demo?' · <i class="bl" style="background:var(--wa)">ДЕМО</i>':""}</div><div class="n">${x.n}</div><div class="s">${x.s}<br>Рынок ~${f(x.p)}</div><div class="r"><span class="pr">${b?f(b):"—"}</span><small>${l?l+" предл."+(sv>0?" · −"+sv+"%":""):"нет цен"}</small></div><div class="row"><button onclick="sw('${x.id}')" style="flex:1">Где купить</button><button class="g" title="Поделиться" onclick="sh('${x.id}')">🔗</button></div></div>`}).join("")||nf();
}
function sw(id){cur=id;mdr();$("md").classList.add("open")}
function cl(){cur=null;$("md").classList.remove("open");if(/^#p=/.test(location.hash))history.replaceState(null,"",location.pathname+location.search)}
function mdr(){
  if(!cur)return;const x=g(cur),l=offs(cur),mn=best(cur);
  $("mdc").innerHTML=`<div class="row" style="justify-content:space-between;margin:0"><h3>${x.e} ${x.n}</h3><button class="g" onclick="cl()">✕</button></div><div class="sub">${x.s} · рынок ~${f(x.p)}</div>`+
  (l.map(o=>`<div class="it ${o.blocked?"bk":""}"><span><b>${esc(o.shop)}</b> ${o.price==mn&&!o.blocked?'<i class="best">дешевле всех</i>':""}${o.blocked?' <i class="bl">заблокировано</i>':""}<br><small>продавец: ${esc(o.sname)}</small></span><span class="pr">${f(o.price)}</span>${!o.blocked&&/^https?:\/\//i.test(o.url)?`<a class="btn" href="${esc(o.url)}" target="_blank" rel="noopener nofollow noreferrer">Перейти</a>`:""}${acts(o)}</div>`).join("")||'<p class="sub">Пока нет предложений. Продавцы могут добавить цену.</p>')+`<div class="row"><button class="g" onclick="sh('${x.id}')">🔗 Поделиться</button></div>`;
}
function sh(id){
  const u=location.href.split("#")[0]+"#p="+id,x=g(id);
  if(navigator.share){navigator.share({title:x.n,url:u}).catch(()=>{});return}
  (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast("Ссылка скопирована 🔗")).catch(()=>toast(u));
}
function hs(){const m=location.hash.match(/^#p=(\w+)/);if(m&&g(m[1]))sw(m[1])}
addEventListener("hashchange",hs);
addEventListener("keydown",e=>{if(e.key==="Escape")cl()});

const gc=id=>PCP.find(x=>x.id===id);
/* compat */
const sl=[["cpu","Процессор"],["mb","Материнская плата"],["ram","Память"],["gpu","Видеокарта"],["psu","Блок питания"],["case","Корпус"]];
$("cs").innerHTML=sl.map(([k,v])=>`<div><label>${v}</label><select id="x${k}" onchange="chk()"><option value="">— не выбрано —</option>${PCP.filter(x=>x.c==k).map(x=>`<option value="${x.id}">${x.n}</option>`).join("")}</select></div>`).join("");
function chk(){
  const v=k=>gc($("x"+k).value||"_"),c=v("cpu"),m=v("mb"),r=v("ram"),gp=v("gpu"),ps=v("psu"),cs=v("case"),o=[];
  const R=(t,s)=>o.push(`<div class="chk ${t}">${{ok:"✅",er:"❌",wa:"⚠️"}[t]} ${s}</div>`);
  if(c&&m)c.k==m.k?R("ok",`Сокет совпадает (${c.k})`):R("er",`Сокет не подходит: процессор ${c.k}, плата ${m.k}`);
  if(m&&r)m.m==r.m?R("ok",`Память ${r.m} подходит плате`):R("er",`Плата поддерживает ${m.m}, а выбрана ${r.m}`);
  if(c&&r)c.m.includes(r.m)?R("ok","Процессор поддерживает этот тип памяти"):R("er",`Процессор не работает с ${r.m}`);
  if(gp&&cs)gp.l<=cs.l?R("ok",`Видеокарта влезает (${gp.l} мм ≤ ${cs.l} мм)`):R("er",`Видеокарта ${gp.l} мм не влезет в корпус (макс. ${cs.l} мм)`);
  if(c&&gp&&ps){const need=Math.round((c.w+gp.w)*1.3+60);ps.w>=need?R("ok",`Мощности БП хватает (нужно ≈${need} Вт, есть ${ps.w} Вт)`):R("er",`БП слабоват: нужно ≈${need} Вт, есть ${ps.w} Вт`)}
  if(m&&cs)R("ok","Форм-фактор mATX поддерживается корпусами Acc");
  $("res").innerHTML=o.join("")||'<p class="sub">Выбери минимум две детали.</p>';
}
/* builds */
const tot=ids=>ids.reduce((s,i)=>s+gc(i).p,0);
const btot=ids=>ids.reduce((s,i)=>s+(best(i)||gc(i).p),0);
function rb(){$("bds").innerHTML=B.map((b,i)=>`<div class="box"><h3>${b.t}</h3><div class="sub" style="margin:2px 0">${b.d}</div><ul>${b.ids.map(k=>`<li>${gc(k).n} <small>${best(k)?f(best(k)):"~"+f(gc(k).p)}</small></li>`).join("")}</ul><div class="pr">${f(btot(b.ids))}</div><small>рынок ~${f(tot(b.ids))}</small><div class="row"><button class="g" onclick="load(${i})">Проверить совместимость</button></div></div>`).join("")}
function load(i){B[i].ids.forEach(x=>{const c=gc(x).c;if($("x"+c))$("x"+c).value=x});chk();location.hash="cmp"}

function ep(id){
  const o=O.find(x=>x.id==id);if(!db||!o||!canDel(o))return;
  const v=Math.round(+prompt("Новая цена, ₽",o.price));if(!(v>0))return;
  db.collection("offers").doc(id).update({price:v}).then(()=>toast("Цена обновлена")).catch(()=>toast("Нет прав"));
}
function addp(){
  if(!db)return toast("Нужен вход");
  if(!isS()||ban())return toast("Нет прав");
  const c=$("pcat").value,n=$("pnm").value.trim().slice(0,60),s=$("pds").value.trim().slice(0,80),p=Math.max(0,Math.round(+$("pmk").value||0));
  if(n.length<2)return toast("Введи название товара");
  db.collection("products").add({c,n,s,p,sid:uid,sname:meName(),ts:Date.now()}).then(()=>{toast("Товар добавлен ✅");$("pnm").value=$("pds").value=$("pmk").value=""}).catch(()=>toast("Нет прав"));
}
function dpr(id){
  const x=PRD.find(q=>q.id==id);if(!db||!x||!(isA()||x.sid==uid)||!confirm("Удалить товар?"))return;
  O.filter(o=>o.pid==id&&o.sid==uid).forEach(o=>db.collection("offers").doc(o.id).delete());
  db.collection("products").doc(id).delete().catch(()=>toast("Нет прав"));
}
function rsp(){
  const v=$("sp").value,r=P===DEMO?[]:P;
  $("sp").innerHTML=r.length?r.map(x=>`<option value="${esc(x.id)}">${esc(x.n)}</option>`).join(""):'<option value="">— сначала добавь товар —</option>';
  if(v&&r.some(x=>x.id==v))$("sp").value=v;
}
function rs(){
  const mp=P===DEMO?[]:P.filter(x=>x.sid==uid);
  $("mine").innerHTML=(mp.length?'<h3 style="margin-top:14px">Мои товары</h3>'+mp.map(x=>`<div class="it"><span><b>${esc(x.n)}</b> <small>${esc(C[x.c]||"")}</small></span><button class="g" onclick="dpr('${esc(x.id)}')">🗑</button></div>`).join(""):"")+
  O.filter(o=>o.sid==uid).sort((a,b)=>b.ts-a.ts).map(o=>`<div class="it ${o.blocked?"bk":""}"><span><b>${esc((g(o.pid)||{}).n||"товар удалён")}</b> — ${esc(o.shop)} ${o.blocked?'<i class="bl">заблокировано модератором</i>':""}</span><span class="pr">${f(o.price)}</span>${acts(o)}</div>`).join("");
}
function rall(){
  if(!hsd){const m=location.hash.match(/^#p=(\w+)/);if(m&&g(m[1])){hsd=1;sw(m[1])}}
  rc();rb();rs();rsp();mdr();
  $("sell").hidden=!isS();$("ns").hidden=!isS();
}

/* init */
$("pcat").innerHTML=Object.entries(C).map(([k,v])=>`<option value="${k}">${v}</option>`).join("");
tabs();rall();hs();
if(db)db.collection("offers").onSnapshot(x=>{O=x.docs.map(d=>({id:d.id,...d.data()}));rall()},e=>console.error(e));
