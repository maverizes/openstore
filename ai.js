/* Birga AI: виджет-помощник на всех страницах + поиск + подсказки сайтов */
const SG=[
[/купить|цена|дешев|товар|телефон|ноут|смартфон|техник|магазин|скидк|buy|price/,[["OLX.uz","https://www.olx.uz"],["Uzum Market","https://uzum.uz"],["Asaxiy","https://asaxiy.uz"],["Texnomart","https://texnomart.uz"],["Mediapark","https://mediapark.uz"]]],
[/новост|газет|news|происшеств/,[["Kun.uz","https://kun.uz"],["Daryo","https://daryo.uz"],["Gazeta.uz","https://www.gazeta.uz"]]],
[/учеб|курс|изуч|урок|learn|школ|универ/,[["Coursera","https://www.coursera.org"],["Khan Academy","https://www.khanacademy.org"]]],
[/билет|поездк|отел|путешеств|авиа|тур|hotel|flight/,[["Booking","https://www.booking.com"],["Aviasales","https://www.aviasales.com"]]],
[/работ|ваканси|резюме|job/,[["HH.uz","https://hh.uz"]]],
[/перевод|translate/,[["Google Translate","https://translate.google.com"]]],
[/карт|адрес|маршрут|где наход|map/,[["Google Maps","https://www.google.com/maps"]]]];
function suggest(q){
  const e=encodeURIComponent(q),ql=q.toLowerCase(),out=[];
  SG.forEach(([r,a])=>{if(r.test(ql))a.forEach(x=>out.push(x))});
  out.push(["🔎 Google","https://www.google.com/search?q="+e],["🔎 Яндекс","https://yandex.com/search/?text="+e],["📚 Википедия","https://ru.wikipedia.org/w/index.php?search="+e]);
  return out.slice(0,8);
}
function sgHtml(q){return '<div class="row">'+suggest(q).map(([t,u])=>`<a class="btn g" target="_blank" rel="noopener noreferrer" href="${esc(u)}">${esc(t)}</a>`).join("")+"</div>"}
const STOP="как что где для или это мне хочу найти нужен нужна можно есть про"; 
const stem=w=>w.length>5?w.slice(0,5):w;
function searchAll(q){
  const w=q.toLowerCase().split(/[^a-zа-яё0-9]+/i).filter(x=>x.length>1&&!STOP.split(" ").includes(x)).map(stem);
  if(!w.length)return{p:[],g:[],h:[]};
  const need=Math.max(1,Math.ceil(w.length/2)),sc=s=>{s=s.toLowerCase();return w.filter(x=>s.includes(x)).length};
  const pick=(a,f)=>a.map(x=>[sc(f(x)),x]).filter(x=>x[0]>=need).sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
  return{p:pick(P,x=>x.n+" "+x.s+" "+C[x.c]).slice(0,8),g:pick(GM,x=>x.n+" "+x.d).slice(0,8),h:pick(HELP,x=>x.q+" "+x.a).slice(0,4)};
}
const aiF=n=>Number(n).toLocaleString("ru-RU")+" ₽",aiG=id=>PCP.find(x=>x.id===id),aiT=ids=>ids.reduce((s,i)=>s+aiG(i).p,0);
function localAnswer(t){
  const l=t.toLowerCase(),m=l.replace(/\s/g,"").match(/(\d{2,3})(к|k|тыс)|(\d{5,6})/),bud=m?(m[1]?+m[1]*1000:+m[3]):0;
  if(bud&&/пк|сборк|компьютер|игров|собери/.test(l)){
    const x=B[bud<60000?0:bud<95000?1:2],T=aiT(x.ids);
    return{t:`Под ${aiF(bud)} подойдёт «${x.t}» (≈${aiF(T)} по рынку):\n`+x.ids.map(k=>"• "+aiG(k).n).join("\n")+(T>bud?"\n\nЧуть выше бюджета — возьми SSD 512 ГБ или убери кулер.":"\n\nВ бюджет укладываемся."),l:[["Найти цены в Benefit","benefit.html#cat"],["Проверить совместимость","benefit.html#cmp"]]};
  }
  if(/привет|здравств|салом|\bhi\b|hello|здаров/.test(l))return{t:"Привет! Я Birga AI 🤖 Найду выгодную цену, подберу ПК под бюджет, подскажу по Aloqa, играм и аккаунту. Не справлюсь — позови админа."};
  const r=searchAll(t);
  if(r.p.length||r.g.length){
    return{t:"Вот что нашёл на Birga:"+r.p.slice(0,4).map(x=>`\n• ${x.n} ${x.p?" — рынок ~"+aiF(x.p):""}`).join("")+r.g.slice(0,3).map(x=>`\n• Игра: ${x.n}`).join(""),l:[...r.p.slice(0,4).map(x=>[x.e+" "+x.n,"benefit.html#p="+x.id]),...r.g.slice(0,3).map(x=>[x.e+" "+x.n,"games.html#g="+x.id])]};
  }
  const h=HELP.find(x=>new RegExp(x.k).test(l));
  if(h)return{t:h.a,l:[["Страница помощи","help.html"]]};
  return{t:"Точного ответа на сайте не нашёл 🤔 Вот похожие сайты и поиск по твоему запросу. Если нужен человек — нажми «Позвать админа».",l:suggest(t)};
}
(function(){
  const AIU=typeof BIRGA_AI_URL!=="undefined"?BIRGA_AI_URL:"",hist=[];let busy=0,fails=0;
  document.body.insertAdjacentHTML("beforeend",'<button id="aiB" title="Birga AI">🤖</button><div id="aiP"><div class="ah"><b>🤖 Birga AI</b><button class="g" onclick="aiClose()">✕</button></div><div class="msgs" id="aiM"></div><div class="ar"><input id="aiI" placeholder="Спроси что угодно…" maxlength="500" onkeydown="if(event.key===\'Enter\')aiSend()"><button onclick="aiSend()">➤</button></div><button class="g aa" onclick="aiAdmin()">🧑‍💼 Позвать админа</button></div>');
  $("aiB").onclick=()=>$("aiP").classList.toggle("open");
  function add(u,t,links){
    hist.push({u,t});
    const d=document.createElement("div");d.className="m "+(u?"u":"a");d.textContent=t;
    (links||[]).forEach(([n,h])=>{const a=document.createElement("a");a.className="btn g";a.textContent=n;a.href=h;if(/^https?:/.test(h)){a.target="_blank";a.rel="noopener noreferrer"}d.appendChild(a)});
    $("aiM").appendChild(d);$("aiM").scrollTop=1e9;
  }
  async function remote(){
    const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),20000);
    try{
      const r=await fetch(AIU,{method:"POST",headers:{"Content-Type":"application/json"},signal:ctl.signal,body:JSON.stringify({messages:hist.slice(-10).map(m=>({role:m.u?"user":"assistant",content:m.t}))})});
      if(!r.ok)throw 0;const j=await r.json();if(!j.text)throw 0;return j.text;
    }finally{clearTimeout(tm)}
  }
  window.aiClose=()=>$("aiP").classList.remove("open");
  window.aiOpen=q=>{$("aiP").classList.add("open");if(q){$("aiI").value=q;aiSend()}else $("aiI").focus()};
  window.aiSend=async()=>{
    const i=$("aiI"),t=i.value.trim();if(!t||busy)return;i.value="";add(1,t);busy=1;
    let a;
    if(AIU){
      try{a={t:await remote()};fails=0}
      catch(e){fails++;a=localAnswer(t);a.t="⚠️ ИИ-сервер не отвечает, работаю в базовом режиме.\n\n"+a.t+(fails>=2?"\n\nМожно позвать админа кнопкой ниже.":"")}
    }else a=localAnswer(t);
    setTimeout(()=>{add(0,a.t,a.l);busy=0},AIU?0:250);
  };
  window.aiAdmin=async()=>{
    if(!db)return toast("Нужна настройка Firebase");
    if(!uid){aiClose();return am("in")}
    if(ban())return toast("Вы заблокированы");
    const last=[...hist].reverse().find(m=>m.u),n=Date.now();
    const tr=hist.slice(-10).map(m=>(m.u?"Я: ":"ИИ: ")+m.t).join("\n").slice(0,1500)||"Нужна помощь";
    try{
      const r=await db.collection("tickets").add({uid,name:meName(),subject:(last?last.t:"Нужна помощь").slice(0,80),status:"open",ts:n,last:n});
      await r.collection("msgs").add({uid,name:meName(),staff:false,text:tr,ts:n});
      add(0,"Заявка отправлена админам ✅ Ответ придёт на странице «Помощь».",[["Открыть заявку","help.html#t="+r.id]]);
    }catch(e){toast("Не удалось создать заявку")}
  };
  add(0,"Привет! Я Birga AI 🤖 Спроси про цены, сборку ПК, Aloqa или игры. Например: «Игровой ПК за 70000».");
})();
