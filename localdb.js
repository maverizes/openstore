/* Birga: встроенная локальная база. Включается САМА, если Firebase не настроен (см. firebase.js).
   Те же методы, что у Firebase (auth + firestore) — весь сайт работает без настройки.
   Данные лежат в localStorage этого браузера; две вкладки синхронизируются в реальном времени.
   Для общей базы между разными людьми и устройствами подключи Firebase (README). */
(function () {
  if (window.FB && FB.db) return;
  window.FB = window.FB || {};
  const LS = "birga_db", LA = "birga_auth", LU = "birga_users";
  let store = {}; try { store = JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) {}
  const subs = new Set(), authL = []; let mode = "local", n = 0;
  const clone = o => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(store)); } catch (e) {} };
  const notify = () => { save(); subs.forEach(s => s.run()); };
  const kids = p => Object.keys(store).filter(k => k.startsWith(p + "/") && !k.slice(p.length + 1).includes("/"));
  const snapDoc = p => ({ id: p.split("/").pop(), exists: p in store, data: () => clone(store[p]) });
  const rid = () => "a" + Date.now().toString(36) + (n++) + Math.random().toString(36).slice(2, 6);
  class Q {
    constructor(p, f = [], o = null, l = 0, ll = 0) { this.path = p; this.f = f; this.o = o; this.l = l; this.ll = ll; }
    where(a, op, v) { return new Q(this.path, [...this.f, [a, op, v]], this.o, this.l, this.ll); }
    orderBy(a, d = "asc") { return new Q(this.path, this.f, [a, d], this.l, this.ll); }
    limit(x) { return new Q(this.path, this.f, this.o, x, this.ll); }
    limitToLast(x) { return new Q(this.path, this.f, this.o, this.l, x); }
    _run() {
      let a = kids(this.path).map(k => ({ k, d: store[k] }));
      this.f.forEach(([f, op, v]) => { a = a.filter(x => op == "==" ? x.d[f] === v : op == "array-contains" ? (x.d[f] || []).includes(v) : true); });
      if (this.o) { const [f, d] = this.o; a.sort((x, y) => ((x.d[f] > y.d[f]) ? 1 : (x.d[f] < y.d[f]) ? -1 : 0) * (d == "desc" ? -1 : 1)); }
      if (this.l) a = a.slice(0, this.l); if (this.ll) a = a.slice(-this.ll);
      const docs = a.map(x => snapDoc(x.k)); return { docs, size: docs.length, empty: !docs.length };
    }
    get() { return Promise.resolve(this._run()); }
    onSnapshot(cb) { const s = { run: () => setTimeout(() => cb(this._run()), 0) }; subs.add(s); s.run(); return () => subs.delete(s); }
  }
  class Col extends Q {
    doc(id) { return new Doc(this.path + "/" + (id || rid())); }
    add(d) { const r = this.doc(); store[r.path] = clone(d); notify(); return Promise.resolve(r); }
  }
  class Doc {
    constructor(p) { this.path = p; this.id = p.split("/").pop(); }
    collection(c) { return new Col(this.path + "/" + c); }
    get() { return Promise.resolve(snapDoc(this.path)); }
    set(d, o) {
      if (o && o.merge) store[this.path] = { ...(store[this.path] || {}), ...clone(d) };
      else {
        if (this.path.startsWith("handles/") && this.path in store) return Promise.reject({ code: "permission-denied", message: "exists" });
        d = clone(d);
        // первый зарегистрированный аккаунт — Преадмин (владелец демо)
        if (/^users\/[^/]+$/.test(this.path) && !(this.path in store) && !kids("users").some(k => store[k].role === "pre")) d.role = "pre";
        store[this.path] = d;
      }
      notify(); return Promise.resolve();
    }
    update(d) { if (!(this.path in store)) return Promise.reject({ code: "not-found" }); Object.assign(store[this.path], clone(d)); notify(); return Promise.resolve(); }
    delete() { delete store[this.path]; notify(); return Promise.resolve(); }
    onSnapshot(cb) { const s = { run: () => setTimeout(() => cb(snapDoc(this.path)), 0) }; subs.add(s); s.run(); return () => subs.delete(s); }
  }
  const rd = () => { try { return JSON.parse(sessionStorage.getItem(LA) || localStorage.getItem(LA) || "null"); } catch (e) { return null; } };
  const wr = u => {
    const st = mode === "session" ? sessionStorage : localStorage, ot = mode === "session" ? localStorage : sessionStorage;
    try { ot.removeItem(LA); if (u) st.setItem(LA, JSON.stringify(u)); else { st.removeItem(LA); localStorage.removeItem(LA); sessionStorage.removeItem(LA); } } catch (e) {}
  };
  const cur = () => { const a = rd(); return a ? { uid: a.uid, email: a.email } : null; };
  const fire = () => authL.forEach(f => setTimeout(() => f(cur()), 0));
  const hash = async s => { try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("birga:" + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); } catch (e) { return "p:" + btoa(unescape(encodeURIComponent(s))); } };
  const users = () => { try { return JSON.parse(localStorage.getItem(LU) || "{}"); } catch (e) { return {}; } };
  const auth = {
    get currentUser() { return cur(); },
    onAuthStateChanged(f) { authL.push(f); setTimeout(() => f(cur()), 0); },
    setPersistence(m) { mode = m === "session" ? "session" : "local"; return Promise.resolve(); },
    async createUserWithEmailAndPassword(e, p) {
      e = String(e).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(e)) throw { code: "auth/invalid-email" };
      const u = users(); if (u[e]) throw { code: "auth/email-already-in-use" };
      if (String(p).length < 6) throw { code: "auth/weak-password" };
      const uid = "u" + rid(); u[e] = { uid, h: await hash(p) }; localStorage.setItem(LU, JSON.stringify(u));
      wr({ uid, email: e }); fire(); return { user: { uid, email: e } };
    },
    async signInWithEmailAndPassword(e, p) {
      e = String(e).trim().toLowerCase(); const u = users()[e];
      if (!u || u.h !== await hash(p)) throw { code: "auth/invalid-credential" };
      wr({ uid: u.uid, email: e }); fire(); return { user: { uid: u.uid, email: e } };
    },
    signOut() { wr(null); fire(); return Promise.resolve(); },
  };
  addEventListener("storage", e => {
    if (e.key === LS) { try { store = JSON.parse(e.newValue || "{}"); } catch (_) {} subs.forEach(s => s.run()); }
    if (e.key === LA && !sessionStorage.getItem(LA)) fire();
  });
  FB.auth = auth; FB.db = { collection: p => new Col(p), doc: p => new Doc(p) }; FB.local = true;
})();
