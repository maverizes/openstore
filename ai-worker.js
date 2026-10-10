// Cloudflare Worker: безопасный прокси к Claude API (ключ хранится в секретах Worker, не на сайте).
// Деплой: dash.cloudflare.com → Workers → Create → вставь код.
// Settings → Variables: ANTHROPIC_KEY (secret), ALLOWED_ORIGIN = https://<user>.github.io
const SYSTEM = `Ты — Birga AI, помощник платформы Birga (Узбекистан): Benefit.uz (поиск выгодных цен), Aloqa.uz (чат по ID/телефону/email), Помощь и 15 мини-игр.
Отвечай кратко и по делу на языке пользователя. Если вопрос вне платформы и ответа нет — предложи полезные сайты (OLX.uz, Uzum, Asaxiy, Texnomart, Mediapark, Kun.uz, Wikipedia и т.п.), не выдумывай ссылки.
Если не можешь помочь — посоветуй нажать «Позвать админа». Не проси пароли и платёжные данные.`;
export default {
  async fetch(req, env) {
    const cors = {"Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*","Access-Control-Allow-Headers": "content-type","Access-Control-Allow-Methods": "POST,OPTIONS"};
    if (req.method === "OPTIONS") return new Response(null, {headers: cors});
    if (req.method !== "POST") return new Response("POST only", {status: 405, headers: cors});
    let body; try { body = await req.json(); } catch { return new Response("bad json", {status: 400, headers: cors}); }
    let msgs = (body.messages || []).slice(-10).map(m => ({role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 2000)}));
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (!msgs.length) return new Response("no messages", {status: 400, headers: cors});
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"x-api-key": env.ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
      body: JSON.stringify({model: env.MODEL || "claude-haiku-5-5", max_tokens: 600, system: SYSTEM, messages: msgs}),
    });
    if (!r.ok) return new Response("upstream error", {status: 502, headers: cors});
    const j = await r.json();
    const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return new Response(JSON.stringify({text}), {headers: {...cors, "content-type": "application/json"}});
  },
};
