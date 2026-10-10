let TKS=[],tk=null,tm=[],ut=null,utm=null,tuid="~",hh=0;
const ST={open:"ждёт ответа",answered:"есть ответ",closed:"закрыта"};
const fd=t=>t?new Date(t).toLocaleString("ru-RU",{dateStyle:"short",timeStyle:"short"}):"";
async function nt(){
  const s=$("ts1").value.trim(),t=$("tt").value.trim();
  if(!s||!t)return toast("Заполни тему и сообщение");
  if(ban())return toast("Вы заблокированы");
  const n=Date.now();
  try{
    const r=await db.collection("tickets").add({uid,name:meName(),subject:s.slice(0,80),status:"open",ts:n,last:n});
    await r.collection("msgs").add({uid,name:meName(),staff:false,text:t.slice(0,1500),ts:n});
    $("ts1").value=$("tt").value="";ot(r.id);toast("Заявка отправлена ✅");
  }catch(e){toast("Не отправлено")}
}
function ot(id){
  tk=id;tm=[];utm&&utm();
  $("tkt").innerHTML=`<b id="tkh"></b><div class="msgs" id="tkm" style="max-height:340px"></div><div class="row"><input id="tr" maxlength="1500" placeholder="Ответить…" onkeydown="if(event.key==='Enter')trp()"><button onclick="trp()">➤</button></div><div class="row"><button class="g" onclick="tcl()">Закрыть заявку</button></div>`;
  utm=db.collection("tickets").doc(id).collection("msgs").orderBy("ts").onSnapshot(s=>{tm=s.docs.map(x=>({id:x.id,...x.data()}));rt()},e=>console.error(e));
  rt();rtl();
}
function rt(){
  const t=TKS.find(x=>x.id==tk),m=$("tkm");if(!m)return;
  $("tkh").textContent=t?t.subject+" · "+(ST[t.status]||""):"";
  m.innerHTML=tm.map(x=>`<div class="m ${x.staff?"a":"u"}"><small>${x.staff?"👮 Админ":esc(x.name)} · ${fd(x.ts)}</small><br>${esc(x.text)}</div>`).join("");
  m.scrollTop=1e9;
}
function trp(){
  const t=$("tr").value.trim();if(!t||!tk)return;
  if(ban())return toast("Вы заблокированы");
  $("tr").value="";const n=Date.now(),ref=db.collection("tickets").doc(tk);
  ref.collection("msgs").add({uid,name:meName(),staff:false,text:t.slice(0,1500),ts:n}).then(()=>ref.update({last:n,status:"open"})).catch(()=>toast("Не отправлено"));
}
function tcl(){if(tk)db.collection("tickets").doc(tk).update({status:"closed",last:Date.now()}).catch(()=>toast("Ошибка"))}
function rtl(){
  $("tkl").innerHTML=[...TKS].sort((a,b)=>b.last-a.last).map(t=>`<div class="ci ${t.id==tk?"on":""}" onclick="ot('${esc(t.id)}')"><b>${esc(t.subject)}</b><br><small class="mu">${fd(t.last)}</small> <span class="pill">${ST[t.status]||t.status}</span></div>`).join("")||'<p class="sub">Заявок пока нет.</p>';
}
function rall(){
  $("faq").innerHTML=HELP.map(h=>`<details><summary>${esc(h.q)}</summary><p>${esc(h.a)}</p></details>`).join("");
  $("tkw").hidden=!uid||!db;
  $("tkg").innerHTML=!db?'<p class="sub">Настрой firebase.js (см. README)</p>':!uid?'<button onclick="am(\'in\')">Войти, чтобы написать админам</button>':"";
  if(!db)return;
  if(uid!==tuid){
    tuid=uid;ut&&ut();utm&&utm();TKS=[];tk=null;hh=0;
    if(uid)ut=db.collection("tickets").where("uid","==",uid).onSnapshot(s=>{TKS=s.docs.map(x=>({id:x.id,...x.data()}));rtl();rt();if(!hh){const m=location.hash.match(/^#t=(\w+)/);if(m&&TKS.some(x=>x.id==m[1])){hh=1;ot(m[1])}}},e=>console.error(e));
  }
  rtl();
}
rall();
