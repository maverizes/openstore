/* Birga Games: 15 игр. Каждая — функция run[id](c), c — контекст с общими помощниками */
const run={};let CUR=null;
const bk0=id=>"bg_"+id,best=id=>{try{return+localStorage.getItem(bk0(id))||0}catch(e){return 0}};
function mkc(id){
  const box=$("gb"),cl0=[];let done=0;
  const c={box,
    cv(w,h){const e=document.createElement("canvas");e.width=w;e.height=h;e.className="gc";box.appendChild(e);return e.getContext("2d")},
    tick(fn,ms){const i=setInterval(fn,ms);cl0.push(()=>clearInterval(i))},
    later(fn,ms){const i=setTimeout(fn,ms);cl0.push(()=>clearTimeout(i))},
    raf(fn){let r,on=1,l=performance.now();const s=t=>{if(!on)return;fn(Math.min(40,t-l));l=t;r=requestAnimationFrame(s)};r=requestAnimationFrame(s);cl0.push(()=>{on=0;cancelAnimationFrame(r)})},
    on(t,e,fn){t.addEventListener(e,fn);cl0.push(()=>t.removeEventListener(e,fn))},
    keys(m){c.on(document,"keydown",e=>{const k=e.key.length==1?e.key.toLowerCase():e.key,f=m[k];if(f){e.preventDefault();f(e)}})},
    swipe(L,R,Up,D){let sx=0,sy=0;c.on(box,"pointerdown",e=>{sx=e.clientX;sy=e.clientY});c.on(box,"pointerup",e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;(Math.abs(dx)>Math.abs(dy)?(dx>0?R:L):(dy>0?D:Up))()})},
    arrows(L,R,Up,D){c.keys({ArrowLeft:L,a:L,ArrowRight:R,d:R,ArrowUp:Up,w:Up,ArrowDown:D,s:D});c.swipe(L,R,Up,D)},
    pad(b){const d=document.createElement("div");d.className="pad";b.forEach(([t,fn,rep])=>{const x=document.createElement("button");x.className="g";x.textContent=t;let iv;const st=()=>clearInterval(iv);x.onpointerdown=e=>{e.preventDefault();fn();if(rep)iv=setInterval(fn,90)};x.onpointerup=x.onpointerleave=x.onpointercancel=st;d.appendChild(x);cl0.push(st)});box.appendChild(d)},
    score(n){const e=$("gsc");if(e)e.textContent=n},
    stop(){cl0.splice(0).forEach(f=>f())},
    over(n,m){
      if(done)return;done=1;c.stop();n=Math.round(n);c.score(n);
      if(n>best(id)){try{localStorage.setItem(bk0(id),n)}catch(e){}const e=$("gbs");if(e)e.textContent=n}
      const d=document.createElement("div");d.className="go";d.innerHTML=`<b>${m||"Игра окончена"}</b><div>Счёт: ${n}</div><button onclick="sg('${id}')">Заново</button>`;box.appendChild(d);
      saveScore(id,n);
    }};
  return c;
}
function saveScore(id,n){
  if(!db||!uid||ban()||n<=0)return;
  const r=db.collection("scores").doc(id+"_"+uid);
  r.get().then(s=>{if(!s.exists||s.data().score<n)return r.set({game:id,uid,name:meName(),score:n,ts:Date.now()})}).then(()=>lb(id)).catch(()=>{});
}
function lb(id){
  const el=$("lb");if(!el)return;
  if(!db){el.innerHTML='<small class="mu">Таблица лидеров появится после настройки Firebase</small>';return}
  db.collection("scores").where("game","==",id).get().then(s=>{
    const a=s.docs.map(x=>x.data()).sort((p,q)=>q.score-p.score).slice(0,5);
    if($("lb"))$("lb").innerHTML=(a.length?"<b>🏆 Топ-5</b>"+a.map((x,i)=>`<div class="row" style="justify-content:space-between;margin:2px 0"><span>${i+1}. ${esc(x.name)}</span><b>${x.score}</b></div>`).join(""):'<small class="mu">Рекордов пока нет — стань первым!</small>')+(uid?"":'<br><small class="mu">Войди, чтобы попасть в таблицу.</small>');
  }).catch(()=>{});
}
function sg(id){
  stopG();const g=GM.find(x=>x.id==id);if(!g)return;
  openM(`<div class="row" style="justify-content:space-between;margin:0"><h3>${g.e} ${esc(g.n)}</h3><button class="g" onclick="cl()">✕</button></div><div class="hud"><span>Счёт: <b id="gsc">0</b></span><span>Рекорд: <b id="gbs">${best(id)}</b></span></div><div id="gb"></div><p><small class="mu">${esc(g.d)}</small></p><div id="lb"></div>`);
  CUR={id,c:mkc(id)};run[id](CUR.c);lb(id);
  history.replaceState(null,"",location.pathname+"#g="+id);
}
function stopG(){if(CUR)CUR.c.stop();CUR=null}
function cl(){stopG();$("md").classList.remove("open");if(/^#g=/.test(location.hash))history.replaceState(null,"",location.pathname);list()}
function list(){$("gl").innerHTML=GM.map(g=>`<div class="app" onclick="sg('${g.id}')"><div class="e">${g.e}</div><h3>${esc(g.n)}</h3><p>${esc(g.d)}</p><small class="mu">Рекорд: ${best(g.id)}</small></div>`).join("")}

/* 1. Змейка */
run.snake=c=>{
  const x=c.cv(320,320),N=20,S=16;let s=[[10,10],[9,10],[8,10]],d=[1,0],nd=d,f=[15,10],sc=0;
  const nf=()=>{do f=[Math.random()*N|0,Math.random()*N|0];while(s.some(p=>p[0]==f[0]&&p[1]==f[1]))};
  const dir=(a,b)=>()=>{if(d[0]+a||d[1]+b)nd=[a,b]};
  c.arrows(dir(-1,0),dir(1,0),dir(0,-1),dir(0,1));
  c.pad([["◀",dir(-1,0)],["▲",dir(0,-1)],["▼",dir(0,1)],["▶",dir(1,0)]]);
  const dr=()=>{x.fillStyle="#0b0c12";x.fillRect(0,0,320,320);x.fillStyle="#ef4444";x.fillRect(f[0]*S+2,f[1]*S+2,S-4,S-4);s.forEach((p,i)=>{x.fillStyle=i?"#22c55e":"#86efac";x.fillRect(p[0]*S+1,p[1]*S+1,S-2,S-2)})};
  dr();
  c.tick(()=>{d=nd;const h=[s[0][0]+d[0],s[0][1]+d[1]];if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||s.some(p=>p[0]==h[0]&&p[1]==h[1]))return c.over(sc);s.unshift(h);if(h[0]==f[0]&&h[1]==f[1]){c.score(++sc);nf()}else s.pop();dr()},110);
};
/* 2. Flappy Bird */
run.flappy=c=>{
  const x=c.cv(320,480);let y=240,v=0,P_=[],t=60,sc=0;
  const fl=()=>{v=-5.4};c.keys({" ":fl,ArrowUp:fl,w:fl});c.on(c.box,"pointerdown",fl);
  c.raf(dt=>{const k=dt/16;v+=.32*k;y+=v*k;t+=k;
    if(t>85){t=0;P_.push({x:330,g:110+Math.random()*260,s:0})}
    P_.forEach(p=>p.x-=2.3*k);P_=P_.filter(p=>p.x>-60);
    if(y<12||y>468||P_.some(p=>p.x<92&&p.x+50>68&&(y-12<p.g-65||y+12>p.g+65)))return c.over(sc);
    P_.forEach(p=>{if(!p.s&&p.x+50<80){p.s=1;c.score(++sc)}});
    x.fillStyle="#7dd3fc";x.fillRect(0,0,320,480);x.fillStyle="#16a34a";P_.forEach(p=>{x.fillRect(p.x,0,50,p.g-65);x.fillRect(p.x,p.g+65,50,480)});
    x.fillStyle="#facc15";x.beginPath();x.arc(80,y,12,0,7);x.fill();x.fillStyle="#000";x.fillRect(86,y-5,3,3)});
};
/* 3. Pac-Man */
run.pacman=c=>{
  const x=c.cv(330,242),Z=22,MZ=["###############","#.............#","#.##.#####.##.#","#.............#","#.##.#.#.#.##.#","#....#...#....#","#.##.#.#.#.##.#","#.............#","#.##.#####.##.#","#.............#","###############"];
  const wl=(a,b)=>MZ[b][a]==="#";
  const dots=MZ.map(r=>[...r].map(ch=>ch=="."));dots[7][7]=false;let left=dots.flat().filter(Boolean).length;
  const p={x:7,y:7,dx:0,dy:0,nx:0,ny:0},gh=[{x:1,y:1,dx:0,dy:0,c:"#ef4444"},{x:13,y:9,dx:0,dy:0,c:"#f472b6"}];let sc=0,n=0;
  const sd=(a,b)=>()=>{p.nx=a;p.ny=b};
  c.arrows(sd(-1,0),sd(1,0),sd(0,-1),sd(0,1));c.pad([["◀",sd(-1,0)],["▲",sd(0,-1)],["▼",sd(0,1)],["▶",sd(1,0)]]);
  const hit=()=>gh.some(g=>g.x==p.x&&g.y==p.y);
  const dr=()=>{x.fillStyle="#000";x.fillRect(0,0,330,242);MZ.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch=="#"){x.fillStyle="#2563eb";x.fillRect(i*Z+1,j*Z+1,Z-2,Z-2)}else if(dots[j][i]){x.fillStyle="#fde68a";x.beginPath();x.arc(i*Z+11,j*Z+11,2.5,0,7);x.fill()}}));
    const a=Math.atan2(p.dy,p.dx),m=n%2?.15:.55;x.fillStyle="#facc15";x.beginPath();x.moveTo(p.x*Z+11,p.y*Z+11);x.arc(p.x*Z+11,p.y*Z+11,9,a+m,a+2*Math.PI-m);x.fill();
    gh.forEach(g=>{x.fillStyle=g.c;x.beginPath();x.arc(g.x*Z+11,g.y*Z+11,9,0,7);x.fill();x.fillStyle="#fff";x.fillRect(g.x*Z+7,g.y*Z+8,3,3);x.fillRect(g.x*Z+13,g.y*Z+8,3,3)})};
  dr();
  c.tick(()=>{n++;
    if((p.nx||p.ny)&&!wl(p.x+p.nx,p.y+p.ny)){p.dx=p.nx;p.dy=p.ny}
    if(!wl(p.x+p.dx,p.y+p.dy)){p.x+=p.dx;p.y+=p.dy}
    if(dots[p.y][p.x]){dots[p.y][p.x]=false;left--;c.score(sc+=10)}
    if(hit()){dr();return c.over(sc)}
    if(!left){dr();return c.over(sc+200,"Победа! 🎉")}
    if(n%3)gh.forEach(g=>{
      const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>!wl(g.x+a,g.y+b)),nr=o.filter(([a,b])=>!(a==-g.dx&&b==-g.dy)),q=nr.length?nr:o;
      let m=q[Math.random()*q.length|0];
      if(Math.random()<.7)m=q.reduce((u,w)=>Math.abs(g.x+w[0]-p.x)+Math.abs(g.y+w[1]-p.y)<Math.abs(g.x+u[0]-p.x)+Math.abs(g.y+u[1]-p.y)?w:u);
      g.dx=m[0];g.dy=m[1];g.x+=g.dx;g.y+=g.dy});
    dr();if(hit())c.over(sc)},170);
};
/* 4. Тетрис */
run.tetris=c=>{
  const x=c.cv(200,400),W=10,H=20,Z=20;
  const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]],CL=["","#22d3ee","#facc15","#a855f7","#3b82f6","#f97316","#22c55e","#ef4444"];
  let b=Array.from({length:H},()=>Array(W).fill(0)),p,sc=0,acc=0,end=0;
  const hit=(m,px,py)=>m.some((r,j)=>r.some((v,i)=>v&&(px+i<0||px+i>=W||py+j>=H||(py+j>=0&&b[py+j][px+i]))));
  const nw=()=>{const i=Math.random()*7|0;p={m:SH[i],c:i+1,x:3,y:0};if(hit(p.m,p.x,p.y)){end=1;c.over(sc)}};
  const dr=()=>{x.fillStyle="#0b0c12";x.fillRect(0,0,200,400);const ce=(i,j,k)=>{x.fillStyle=CL[k];x.fillRect(i*Z+1,j*Z+1,Z-2,Z-2)};b.forEach((r,j)=>r.forEach((v,i)=>v&&ce(i,j,v)));if(p&&!end)p.m.forEach((r,j)=>r.forEach((v,i)=>v&&ce(p.x+i,p.y+j,p.c)))};
  const mv=dx=>{if(!end&&!hit(p.m,p.x+dx,p.y))p.x+=dx;dr()};
  const rt=()=>{if(end)return;const m=p.m[0].map((_,i)=>p.m.map(r=>r[i]).reverse());if(!hit(m,p.x,p.y))p.m=m;dr()};
  const dn=()=>{if(end)return;if(!hit(p.m,p.x,p.y+1)){p.y++;dr();return}
    p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&p.y+j>=0)b[p.y+j][p.x+i]=p.c}));
    let n=0;b=b.filter(r=>r.some(v=>!v)||(n++,false));while(b.length<H)b.unshift(Array(W).fill(0));
    if(n)c.score(sc+=[0,100,300,500,800][n]);nw();dr()};
  const hd=()=>{if(end)return;while(!hit(p.m,p.x,p.y+1))p.y++;dn()};
  c.keys({ArrowLeft:()=>mv(-1),a:()=>mv(-1),ArrowRight:()=>mv(1),d:()=>mv(1),ArrowUp:rt,w:rt,ArrowDown:dn,s:dn," ":hd});
  c.swipe(()=>mv(-1),()=>mv(1),rt,hd);
  c.pad([["◀",()=>mv(-1),1],["⟳",rt],["▶",()=>mv(1),1],["▼",dn,1],["⏬",hd]]);
  nw();dr();
  c.raf(dt=>{acc+=dt;if(acc>Math.max(100,650-sc/4)){acc=0;dn()}});
};
/* 5. 2048 */
run.g2048=c=>{
  const x=c.cv(320,320),CL={0:"#1f2937",2:"#eee4da",4:"#ede0c8",8:"#f2b179",16:"#f59563",32:"#f67c5f",64:"#f65e3b",128:"#edcf72",256:"#edcc61",512:"#edc850",1024:"#edc53f",2048:"#edc22e"};
  let g=Array.from({length:4},()=>Array(4).fill(0)),sc=0;
  const add=()=>{const e=[];g.forEach((r,j)=>r.forEach((v,i)=>!v&&e.push([i,j])));if(e.length){const[a,b]=e[Math.random()*e.length|0];g[b][a]=Math.random()<.9?2:4}};
  const sl=r=>{const a=r.filter(v=>v),o=[];for(let i=0;i<a.length;i++){if(a[i]==a[i+1]){o.push(a[i]*2);sc+=a[i]*2;i++}else o.push(a[i])}while(o.length<4)o.push(0);return o};
  const can=()=>g.some((r,j)=>r.some((v,i)=>!v||g[j][i+1]===v||(g[j+1]&&g[j+1][i]===v)));
  const dr=()=>{x.fillStyle="#111827";x.fillRect(0,0,320,320);g.forEach((r,j)=>r.forEach((v,i)=>{x.fillStyle=CL[v]||"#3c3a32";x.fillRect(i*80+4,j*80+4,72,72);if(v){x.fillStyle=v<8?"#776e65":"#fff";x.font="bold "+(v>999?24:32)+"px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(v,i*80+40,j*80+42)}}))};
  const mv=d=>{const o=JSON.stringify(g);
    if(d<2)g=g.map(r=>d?sl([...r].reverse()).reverse():sl(r));
    else{const n=g[0].map((_,i)=>g.map(r=>r[i])).map(r=>d==3?sl([...r].reverse()).reverse():sl(r));g=g[0].map((_,j)=>n.map(r=>r[j]))}
    if(JSON.stringify(g)!=o){add();c.score(sc)}dr();if(!can())c.over(sc)};
  c.arrows(()=>mv(0),()=>mv(1),()=>mv(2),()=>mv(3));
  add();add();dr();
};
/* 6. Сапёр */
run.mines=c=>{
  const N=9,M=10;let first=1,done=0,fm=0,t0=0;
  const G=Array.from({length:N*N},()=>({m:0,o:0,f:0,n:0}));
  const nb=i=>{const r=[],y=i/N|0,q=i%N;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const X=q+b,Y=y+a;if((a||b)&&X>=0&&X<N&&Y>=0&&Y<N)r.push(Y*N+X)}return r};
  c.box.insertAdjacentHTML("beforeend",`<div class="gd" id="msg" style="grid-template-columns:repeat(${N},1fr)"></div><div class="row"><button class="g" id="mf">⛏ Открывать</button><span>💣 <b id="mc">${M}</b></span></div>`);
  const dr=()=>{$("msg").innerHTML=G.map((g,i)=>`<button data-i="${i}" class="${g.o?"o":""}" style="font-size:16px">${g.o?(g.m?"💣":g.n||""):g.f?"🚩":""}</button>`).join("");$("mc").textContent=M-G.filter(g=>g.f).length};
  const plant=s=>{let k=0;while(k<M){const i=Math.random()*N*N|0;if(i!=s&&!G[i].m){G[i].m=1;k++}}G.forEach((g,i)=>g.n=nb(i).filter(j=>G[j].m).length);t0=Date.now()};
  const open=i=>{const st=[i];while(st.length){const j=st.pop(),g=G[j];if(g.o||g.f)continue;g.o=1;if(!g.n&&!g.m)nb(j).forEach(k=>st.push(k))}};
  const click=(i,fl)=>{if(done)return;const g=G[i];
    if(fl||fm){if(!g.o)g.f=g.f?0:1}
    else{if(g.f||g.o)return;if(first){first=0;plant(i)}
      if(g.m){done=1;G.forEach(q=>{if(q.m)q.o=1});dr();return c.over(0,"Бум! 💥")}
      open(i);if(G.every(q=>q.m||q.o)){done=1;dr();return c.over(Math.max(50,1000-Math.round((Date.now()-t0)/1000)*5),"Победа! 🎉")}}
    dr()};
  c.on($("msg"),"click",e=>{const b=e.target.closest("button");if(b)click(+b.dataset.i,0)});
  c.on($("msg"),"contextmenu",e=>{e.preventDefault();const b=e.target.closest("button");if(b)click(+b.dataset.i,1)});
  c.on($("mf"),"click",()=>{fm=fm?0:1;$("mf").textContent=fm?"🚩 Флажки":"⛏ Открывать"});
  dr();
};
/* 7. Крестики-нолики */
run.ttt=c=>{
  const b=Array(9).fill("");let done=0;
  const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win=b=>{for(const[p,q,r]of W)if(b[p]&&b[p]==b[q]&&b[p]==b[r])return b[p];return b.every(v=>v)?"d":""};
  const mm=(b,t)=>{const w=win(b);if(w=="O")return 1;if(w=="X")return-1;if(w=="d")return 0;let r=t=="O"?-2:2;b.forEach((v,i)=>{if(!v){b[i]=t;const s=mm(b,t=="O"?"X":"O");b[i]="";r=t=="O"?Math.max(r,s):Math.min(r,s)}});return r};
  c.box.insertAdjacentHTML("beforeend",'<div class="gd" id="tg" style="grid-template-columns:repeat(3,1fr);width:240px"></div>');
  const dr=()=>{$("tg").innerHTML=b.map((v,i)=>`<button data-i="${i}" style="font-size:34px">${v=="X"?"❌":v=="O"?"⭕":""}</button>`).join("")};
  const end=()=>{const w=win(b);if(!w)return 0;done=1;dr();c.over(w=="X"?100:w=="d"?30:0,w=="X"?"Ты победил! 🎉":w=="d"?"Ничья":"Компьютер выиграл");return 1};
  const ai=()=>{const e=b.map((v,i)=>v?-1:i).filter(i=>i>=0);let m=e[0];if(Math.random()<.25)m=e[Math.random()*e.length|0];else{let bs=-2;e.forEach(i=>{b[i]="O";const s=mm(b,"X");b[i]="";if(s>bs){bs=s;m=i}})}b[m]="O"};
  c.on($("tg"),"click",e=>{const k=e.target.closest("button");if(!k||done)return;const i=+k.dataset.i;if(b[i])return;b[i]="X";if(end())return;ai();if(end())return;dr()});
  dr();
};
/* 8. Память */
run.memory=c=>{
  const E=["🍎","🍌","🍇","🍒","🥝","🍉","🍍","🍓"],a=[...E,...E].sort(()=>Math.random()-.5),fd=Array(16).fill(0);let op=[],mv=0,lock=0;
  c.box.insertAdjacentHTML("beforeend",'<div class="gd" id="mm" style="grid-template-columns:repeat(4,1fr)"></div><div>Ходы: <b id="mmv">0</b></div>');
  const dr=()=>{$("mm").innerHTML=a.map((v,i)=>`<button data-i="${i}" class="${fd[i]?"o":""}" style="font-size:28px">${fd[i]?v:"❔"}</button>`).join("");$("mmv").textContent=mv};
  c.on($("mm"),"click",e=>{const k=e.target.closest("button");if(!k||lock)return;const i=+k.dataset.i;if(fd[i])return;fd[i]=1;op.push(i);dr();
    if(op.length==2){mv++;lock=1;const[p,q]=op;op=[];
      if(a[p]==a[q]){lock=0;dr();if(fd.every(Boolean))c.over(Math.max(20,300-mv*10),"Все пары найдены! 🎉")}
      else c.later(()=>{fd[p]=fd[q]=0;lock=0;dr()},700)}});
  dr();
};
/* 9. Пинг-понг */
run.pong=c=>{
  const x=c.cv(400,260);let py=100,ay=100,bx=200,by=130,vx=3.4,vy=1.6,me=0,ai=0,sc=0;
  const rs=d=>{bx=200;by=130;vx=3.4*d;vy=Math.random()*3-1.5};
  c.on(c.box,"pointermove",e=>{const r=x.canvas.getBoundingClientRect();py=Math.max(0,Math.min(200,(e.clientY-r.top)/r.height*260-30))});
  const up=()=>py=Math.max(0,py-24),dn=()=>py=Math.min(200,py+24);
  c.keys({ArrowUp:up,w:up,ArrowDown:dn,s:dn});
  c.pad([["▲",up,1],["▼",dn,1]]);
  c.raf(dt=>{const k=dt/16;bx+=vx*k;by+=vy*k;
    if(by<4||by>256)vy=-vy;
    ay+=Math.max(-2.4,Math.min(2.4,by-30-ay))*k*.9;ay=Math.max(0,Math.min(200,ay));
    if(vx<0&&bx<22&&bx>8&&by>py&&by<py+60){vx=Math.min(8,-vx*1.06);vy+=(by-py-30)/12}
    if(vx>0&&bx>378&&bx<392&&by>ay&&by<ay+60)vx=-vx*1.04;
    if(bx<0){ai++;if(ai>=5)return c.over(sc,"Поражение");rs(1)}
    if(bx>400){me++;c.score(sc+=10);if(me>=5)return c.over(sc+50,"Победа! 🎉");rs(-1)}
    x.fillStyle="#0b0c12";x.fillRect(0,0,400,260);x.fillStyle="#fff";x.fillRect(10,py,8,60);x.fillRect(382,ay,8,60);x.beginPath();x.arc(bx,by,5,0,7);x.fill();x.font="20px system-ui";x.textAlign="center";x.fillText(me+" : "+ai,200,24)});
};
/* 10. Арканоид */
run.breakout=c=>{
  const x=c.cv(320,400);let px=130,bx=160,by=300,vx=2.6,vy=-3.4,lv=3,sc=0;const br=[];
  for(let j=0;j<5;j++)for(let i=0;i<8;i++)br.push({x:i*40+2,y:40+j*18,a:1,c:["#ef4444","#f97316","#facc15","#22c55e","#3b82f6"][j]});
  c.on(c.box,"pointermove",e=>{const r=x.canvas.getBoundingClientRect();px=Math.max(0,Math.min(260,(e.clientX-r.left)/r.width*320-30))});
  const L=n=>()=>px=Math.max(0,px-n),R=n=>()=>px=Math.min(260,px+n);
  c.keys({ArrowLeft:L(28),a:L(28),ArrowRight:R(28),d:R(28)});c.pad([["◀",L(16),1],["▶",R(16),1]]);
  c.raf(dt=>{const k=dt/16;bx+=vx*k;by+=vy*k;
    if(bx<4||bx>316)vx=-vx;if(by<4)vy=-vy;
    if(vy>0&&by>372&&by<386&&bx>px-4&&bx<px+64){vy=-Math.abs(vy);vx=Math.max(-5,Math.min(5,vx+(bx-px-30)/14))}
    br.forEach(b=>{if(b.a&&bx>b.x&&bx<b.x+36&&by>b.y&&by<b.y+14){b.a=0;vy=-vy;c.score(sc+=10)}});
    if(!br.some(b=>b.a))return c.over(sc+100,"Победа! 🎉");
    if(by>410){lv--;if(!lv)return c.over(sc);bx=160;by=300;vx=2.6;vy=-3.4}
    x.fillStyle="#0b0c12";x.fillRect(0,0,320,400);br.forEach(b=>{if(b.a){x.fillStyle=b.c;x.fillRect(b.x,b.y,36,14)}});
    x.fillStyle="#fff";x.fillRect(px,380,60,8);x.beginPath();x.arc(bx,by,5,0,7);x.fill();x.font="14px system-ui";x.textAlign="left";x.fillText("❤️".repeat(lv),8,20)});
};
/* 11. Захватчики */
run.invaders=c=>{
  const x=c.cv(320,400);let px=150,sh=[],eb=[],al=[],dx=1,sc=0,lv=0,t=0;
  const wave=()=>{al=[];for(let j=0;j<4;j++)for(let i=0;i<6;i++)al.push({x:30+i*40,y:30+j*28,a:1});dx=(dx<0?-1:1)*(1+lv*.35);lv++};
  const mv=d=>()=>{px=Math.max(0,Math.min(296,px+d))},fire=()=>{if(sh.length<3)sh.push({x:px+12,y:370})};
  c.keys({ArrowLeft:mv(-14),a:mv(-14),ArrowRight:mv(14),d:mv(14)," ":fire,ArrowUp:fire});
  c.pad([["◀",mv(-8),1],["🔥",fire],["▶",mv(8),1]]);
  wave();
  c.raf(dt=>{const k=dt/16;t+=k;const A=al.filter(a=>a.a);
    A.forEach(a=>a.x+=dx*k*.6);
    if((dx>0&&A.some(a=>a.x>296))||(dx<0&&A.some(a=>a.x<4))){dx=-dx;A.forEach(a=>a.y+=14)}
    if(t>45&&A.length){t=0;const a=A[Math.random()*A.length|0];eb.push({x:a.x+10,y:a.y+16})}
    sh.forEach(s=>s.y-=6*k);eb.forEach(b=>b.y+=3*k);sh=sh.filter(s=>s.y>0);eb=eb.filter(b=>b.y<410);
    sh.forEach(s=>A.forEach(a=>{if(a.a&&s.x>a.x&&s.x<a.x+22&&s.y>a.y&&s.y<a.y+16){a.a=0;s.y=-9;c.score(sc+=10)}}));
    if(eb.some(b=>b.x>px&&b.x<px+26&&b.y>372)||A.some(a=>a.y>360))return c.over(sc);
    if(!A.some(a=>a.a)){sc+=50;c.score(sc);eb=[];sh=[];wave()}
    x.fillStyle="#0b0c12";x.fillRect(0,0,320,400);x.fillStyle="#22c55e";x.fillRect(px,380,26,10);x.fillRect(px+10,374,6,6);
    x.font="16px system-ui";x.textAlign="left";x.textBaseline="top";al.forEach(a=>a.a&&x.fillText("👾",a.x,a.y));
    x.fillStyle="#fff";sh.forEach(s=>x.fillRect(s.x,s.y,3,10));x.fillStyle="#f87171";eb.forEach(b=>x.fillRect(b.x,b.y,3,10))});
};
/* 12. Динозавр */
run.dino=c=>{
  const x=c.cv(400,160);let y=0,v=0,ob=[],sp=4,sc=0,d=0,nx=120;
  const jump=()=>{if(y==0)v=9.5};
  c.keys({" ":jump,ArrowUp:jump,w:jump});c.on(c.box,"pointerdown",jump);
  c.raf(dt=>{const k=dt/16;
    if(y>0||v>0){v-=.55*k;y=Math.max(0,y+v*k);if(y==0)v=0}
    nx-=sp*k;if(nx<=0){ob.push({x:420,w:14+(Math.random()*16|0),h:24+(Math.random()*22|0)});nx=sp*40+Math.random()*sp*30}
    ob.forEach(o=>o.x-=sp*k);ob=ob.filter(o=>o.x>-40);d+=k;sp=Math.min(9,4+d/700);c.score(sc=Math.floor(d/6));
    if(ob.some(o=>o.x<62&&o.x+o.w>40&&y<o.h))return c.over(sc);
    x.fillStyle="#e5e7eb";x.fillRect(0,0,400,160);x.fillStyle="#6b7280";x.fillRect(0,130,400,2);
    x.fillStyle="#16a34a";ob.forEach(o=>x.fillRect(o.x,130-o.h,o.w,o.h));
    x.fillStyle="#374151";x.fillRect(40,130-28-y,24,28);x.fillRect(56,130-34-y,12,10)});
};
/* 13. Лови крота */
run.mole=c=>{
  let sc=0,tl=30,m=-1;
  c.box.insertAdjacentHTML("beforeend",'<div>⏱ <b id="mt">30</b></div><div class="gd" id="mg" style="grid-template-columns:repeat(3,1fr);width:240px"></div>');
  const dr=()=>{$("mg").innerHTML=Array.from({length:9},(_,i)=>`<button data-i="${i}" style="font-size:34px">${i==m?"🐹":"🕳️"}</button>`).join("")};
  c.on($("mg"),"pointerdown",e=>{const b=e.target.closest("button");if(b&&+b.dataset.i==m){m=-1;c.score(++sc);dr()}});
  c.tick(()=>{m=Math.random()*9|0;dr()},750);
  c.tick(()=>{$("mt").textContent=--tl;if(tl<=0)c.over(sc)},1000);
  dr();
};
/* 14. Simon */
run.simon=c=>{
  const CL=["#ef4444","#22c55e","#3b82f6","#eab308"],seq=[];let ix=0,lock=1,sc=0;
  c.box.insertAdjacentHTML("beforeend",'<div class="gd" id="sg" style="grid-template-columns:repeat(2,1fr);width:240px">'+CL.map((q,i)=>`<button data-i="${i}" style="background:${q};opacity:.45;aspect-ratio:1.2"></button>`).join("")+'</div><div id="sm" class="mu">Смотри…</div>');
  const bs=()=>[...$("sg").children],fl=i=>{bs()[i].style.opacity=1;c.later(()=>bs()[i].style.opacity=.45,350)};
  const play=()=>{lock=1;ix=0;$("sm").textContent="Смотри…";seq.push(Math.random()*4|0);seq.forEach((s,k)=>c.later(()=>fl(s),600+k*600));c.later(()=>{lock=0;$("sm").textContent="Твой ход"},600+seq.length*600)};
  c.on($("sg"),"pointerdown",e=>{const b=e.target.closest("button");if(!b||lock)return;const i=+b.dataset.i;fl(i);
    if(i!=seq[ix])return c.over(sc,"Ошибка!");
    if(++ix==seq.length){c.score(++sc);lock=1;c.later(play,700)}});
  c.later(play,500);
};
/* 15. Пятнашки */
run.puzzle=c=>{
  const a=[...Array(15).keys()].map(i=>i+1).concat(0);let mv=0;
  for(let k=0,z=15;k<300;k++){const nb=[],r=z/4|0,q=z%4;if(r>0)nb.push(z-4);if(r<3)nb.push(z+4);if(q>0)nb.push(z-1);if(q<3)nb.push(z+1);const t=nb[Math.random()*nb.length|0];a[z]=a[t];a[t]=0;z=t}
  c.box.insertAdjacentHTML("beforeend",'<div class="gd" id="pg" style="grid-template-columns:repeat(4,1fr)"></div><div>Ходы: <b id="pm">0</b></div>');
  const dr=()=>{$("pg").innerHTML=a.map((v,i)=>`<button data-i="${i}" class="${v?"f":""}" style="${v?"color:#fff":"visibility:hidden"}">${v||""}</button>`).join("");$("pm").textContent=mv};
  c.on($("pg"),"click",e=>{const b=e.target.closest("button");if(!b)return;const i=+b.dataset.i,z=a.indexOf(0);
    if(Math.abs((i/4|0)-(z/4|0))+Math.abs(i%4-z%4)!=1)return;a[z]=a[i];a[i]=0;mv++;dr();
    if(a.slice(0,15).every((v,k)=>v==k+1))c.over(Math.max(50,600-mv*3),"Собрано! 🎉")});
  dr();
};
/* старт */
list();
const gh0=location.hash.match(/^#g=(\w+)/);if(gh0&&GM.some(g=>g.id==gh0[1]))sg(gh0[1]);
