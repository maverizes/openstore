// Конфиг Firebase (см. README). Пока значения YOUR_… — сайт работает в демо-режиме без входа.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID",
};
// Адрес вашего ИИ-прокси (Cloudflare Worker из ai-worker.js). Пусто = встроенный базовый режим.
const BIRGA_AI_URL = "";
window.FB = {};
if (firebaseConfig.apiKey !== "YOUR_API_KEY" && window.firebase) {
  firebase.initializeApp(firebaseConfig);
  FB.auth = firebase.auth();
  FB.db = firebase.firestore();
  FB.db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); // кэш данных между перезагрузками
}
