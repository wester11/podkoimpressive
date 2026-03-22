// ── helpers ──────────────────────────────────────────────────────────────────

async function loadCatalog() {
  const res = await fetch("./catalog.json", { cache: "no-store" });
  if (!res.ok) throw new Error("catalog.json not found");
  return res.json();
}

function toBase64Url(input) {
  const utf8 = new TextEncoder().encode(input);
  let bin = "";
  utf8.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildToken() {
  const listVals    = [...document.querySelectorAll("input[data-kind='list']:checked")].map(x => x.value);
  const serviceVals = [...document.querySelectorAll("input[data-kind='service']:checked")].map(x => x.value);
  const payload = `L=${listVals.join(",")};S=${serviceVals.join(",")}`;
  return "PK1_" + toBase64Url(payload);
}

// ── label helpers ────────────────────────────────────────────────────────────

const LIST_LABELS = {
  ai_all:               "🤖  AI-инструменты",
  all_services:         "🌐  Все сервисы",
  cloud_storage:        "☁️  Облачные хранилища",
  creator_platforms:    "🎨  Платформы авторов",
  developer_platforms:  "💻  Разработчики",
  education:            "📚  Образование",
  finance_payment:      "💳  Финансы и платежи",
  forums_communities:   "💬  Форумы / сообщества",
  gaming:               "🎮  Игры",
  messengers_calls:     "📞  Мессенджеры",
  music_streaming:      "🎵  Музыка",
  news_media:           "📰  Новости / медиа",
  productivity_tools:   "🛠️  Продуктивность",
  social_messaging:     "📱  Соц. мессенджеры",
  social_networks:      "👥  Социальные сети",
  video_audio_streaming:"▶️  Видео / стриминг",
  vpn_privacy:          "🔒  VPN / конфиденциальность",
  work_tools:           "💼  Рабочие инструменты",
};

const LIST_DESC = {
  ai_all:               "ChatGPT, Claude, Gemini, Grok, Copilot…",
  all_services:         "Полный агрегированный список всех сервисов",
  cloud_storage:        "Dropbox, OneDrive, Mega…",
  creator_platforms:    "Patreon, Behance, Envato, DeviantArt…",
  developer_platforms:  "GitHub, GitLab, Docker, npm, Cloudflare…",
  education:            "Coursera, Udemy, Duolingo, Khan Academy…",
  finance_payment:      "PayPal, Stripe, Wise, Revolut",
  forums_communities:   "Reddit, Medium, Quora, Stack Overflow",
  gaming:               "Steam, Epic, Battle.net, Riot, EA, Xbox, PS…",
  messengers_calls:     "Telegram, Discord, Signal, Slack, Zoom…",
  music_streaming:      "Spotify, Deezer, Tidal, Apple Music…",
  news_media:           "BBC, CNN, Reuters, Meduza, Радио Свобода…",
  productivity_tools:   "Notion, Figma, Miro, Canva, Trello…",
  social_messaging:     "WhatsApp, Viber, Telegram, Snapchat…",
  social_networks:      "Instagram, Facebook, X, TikTok, Tumblr…",
  video_audio_streaming:"YouTube, Twitch, Vimeo, Kick, Rumble…",
  vpn_privacy:          "Mullvad, NordVPN, ExpressVPN, ProtonVPN…",
  work_tools:           "Slack, Zoom, Skype, Notion, Figma, Miro…",
};

// category → list of service IDs
const SVC_CATEGORIES = [
  { id: "social",   label: "👥  Соц. сети",          services: ["facebook","instagram","x_twitter","tiktok","snapchat","pinterest","linkedin","tumblr"] },
  { id: "msg",      label: "💬  Мессенджеры",         services: ["telegram","whatsapp","discord","signal","viber","skype","slack","zoom","facetime","protonmail"] },
  { id: "video",    label: "▶️  Видео / стриминг",   services: ["youtube","twitch","tiktok","vimeo","kick","rumble","dailymotion","spotify","soundcloud"] },
  { id: "music",    label: "🎵  Музыка",              services: ["spotify","deezer","tidal","apple_music","soundcloud","lastfm"] },
  { id: "gaming",   label: "🎮  Игры",               services: ["steam","epic_games","battle_net","riot_games","ea_games","gog","ubisoft","minecraft","xbox","playstation","roblox","metacritic"] },
  { id: "ai",       label: "🤖  AI",                  services: ["chatgpt","claude","gemini","grok","microsoft_copilot","deepseek","perplexity","cursor","poe","midjourney","huggingface"] },
  { id: "dev",      label: "💻  Разработка",          services: ["github","gitlab","stackoverflow","huggingface","docker_hub","npm_registry","cloudflare"] },
  { id: "cloud",    label: "☁️  Облако",              services: ["dropbox","onedrive","mega","google_news"] },
  { id: "work",     label: "💼  Работа",              services: ["slack","zoom","skype","notion","trello","miro","figma","canva"] },
  { id: "edu",      label: "📚  Образование",         services: ["coursera","udemy","duolingo","khan_academy","edx","skillshare"] },
  { id: "finance",  label: "💳  Финансы",             services: ["paypal","stripe","wise","revolut"] },
  { id: "news",     label: "📰  Новости",             services: ["bbc","cnn","dw","euronews","associated_press","wsj","google_news","meduza","radio_svoboda"] },
  { id: "creator",  label: "🎨  Авторам",             services: ["patreon","behance","deviantart","envato","medium","pinterest"] },
  { id: "vpn",      label: "🔒  VPN",                 services: ["mullvad","nordvpn","expressvpn","protonvpn","protonmail"] },
  { id: "other",    label: "🔧  Прочее",              services: ["reddit","quora","speedtest","twitch"] },
];

// ── render counters & tags ────────────────────────────────────────────────────

function updateCounters() {
  const lists    = [...document.querySelectorAll("input[data-kind='list']:checked")].map(x => x.value);
  const services = [...document.querySelectorAll("input[data-kind='service']:checked")].map(x => x.value);
  const total    = lists.length + services.length;

  document.getElementById("selTotal").textContent = total;
  document.getElementById("listsCnt").textContent = lists.length;
  document.getElementById("svcCnt").textContent   = services.length;

  // tags
  const row = document.getElementById("tagsRow");
  row.innerHTML = "";
  if (!total) {
    row.innerHTML = '<span class="empty-hint">Ничего не выбрано</span>';
    return;
  }
  lists.forEach(v => {
    const tag = document.createElement("span");
    tag.className = "tag tag-list";
    tag.innerHTML = `${LIST_LABELS[v] || v} <i class="rm" data-kind="list" data-val="${v}">✕</i>`;
    row.appendChild(tag);
  });
  services.forEach(v => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `${v} <i class="rm" data-kind="service" data-val="${v}">✕</i>`;
    row.appendChild(tag);
  });

  // update per-category sel counts
  SVC_CATEGORIES.forEach(cat => {
    const selEl = document.getElementById("cat-sel-" + cat.id);
    if (!selEl) return;
    const selCount = cat.services.filter(s => {
      const cb = document.querySelector(`input[data-kind="service"][value="${s}"]`);
      return cb && cb.checked;
    }).length;
    selEl.textContent = selCount ? `(${selCount})` : "";
  });
}

// click on ✕ in tag
document.addEventListener("click", e => {
  if (e.target.classList.contains("rm")) {
    const kind = e.target.dataset.kind;
    const val  = e.target.dataset.val;
    const cb   = document.querySelector(`input[data-kind="${kind}"][value="${val}"]`);
    if (cb) { cb.checked = false; updateCounters(); }
  }
});

// ── render lists panel ───────────────────────────────────────────────────────

function renderLists(names, filter) {
  const box = document.getElementById("listsBox");
  box.innerHTML = "";
  const q = (filter || "").toLowerCase();
  let shown = 0;
  names.forEach(name => {
    const label = LIST_LABELS[name] || name;
    const desc  = LIST_DESC[name]   || "";
    if (q && !name.includes(q) && !label.toLowerCase().includes(q) && !desc.toLowerCase().includes(q)) return;
    shown++;
    const div = document.createElement("label");
    div.className = "list-item";
    div.innerHTML = `
      <input type="checkbox" data-kind="list" value="${name}">
      <div>
        <div class="li-name">${label}</div>
        ${desc ? `<div class="li-desc">${desc}</div>` : ""}
      </div>`;
    div.querySelector("input").addEventListener("change", updateCounters);
    box.appendChild(div);
  });
  if (!shown) box.innerHTML = '<div class="no-match">Ничего не найдено</div>';
}

// ── render services panel (categorized) ──────────────────────────────────────

function renderServices(allServices, filter) {
  const box = document.getElementById("servicesBox");
  box.innerHTML = "";
  const q = (filter || "").toLowerCase();

  // collect which services are known and in which category
  const assigned = new Set();
  SVC_CATEGORIES.forEach(cat => cat.services.forEach(s => assigned.add(s)));

  // add "other" for uncategorised
  const otherCat = SVC_CATEGORIES.find(c => c.id === "other") || { id: "other", label: "🔧  Прочее", services: [] };
  allServices.forEach(s => { if (!assigned.has(s)) otherCat.services.push(s); });

  SVC_CATEGORIES.forEach(cat => {
    // filter members to those that exist in catalog
    const members = cat.services.filter(s => allServices.includes(s));
    // apply search
    const visible = q ? members.filter(s => s.includes(q)) : members;
    if (!visible.length) return;

    const block = document.createElement("div");
    block.className = "cat-block";

    const head = document.createElement("div");
    head.className = "cat-head";
    head.id = "cat-head-" + cat.id;
    head.innerHTML = `
      <span class="arrow">▶</span>
      <span>${cat.label}</span>
      <span class="cat-sel" id="cat-sel-${cat.id}"></span>
      <span class="cat-cnt">${visible.length}</span>`;

    const body = document.createElement("div");
    body.className = "cat-body" + (q ? "" : " hidden");
    body.id = "cat-body-" + cat.id;

    head.addEventListener("click", () => {
      const isOpen = !body.classList.contains("hidden");
      body.classList.toggle("hidden", isOpen);
      head.classList.toggle("open", !isOpen);
    });

    if (q) head.classList.add("open");

    visible.forEach(svc => {
      const item = document.createElement("label");
      item.className = "svc-item";
      item.innerHTML = `<input type="checkbox" data-kind="service" value="${svc}"><span class="svc-label">${svc}</span>`;
      item.querySelector("input").addEventListener("change", updateCounters);
      body.appendChild(item);
    });

    block.appendChild(head);
    block.appendChild(body);
    box.appendChild(block);
  });

  if (!box.children.length) box.innerHTML = '<div class="no-match">Ничего не найдено</div>';
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const catalog = await loadCatalog();
  const allLists    = catalog.lists    || [];
  const allServices = catalog.services || [];

  renderLists(allLists, "");
  renderServices(allServices, "");
  updateCounters();

  // search
  document.getElementById("listsSearch").addEventListener("input", e => {
    renderLists(allLists, e.target.value);
    updateCounters();
  });
  document.getElementById("svcSearch").addEventListener("input", e => {
    renderServices(allServices, e.target.value);
    updateCounters();
  });

  // select all / clear for lists
  document.getElementById("listsSelAll").addEventListener("click", () => {
    document.querySelectorAll("input[data-kind='list']").forEach(cb => { cb.checked = true; });
    updateCounters();
  });
  document.getElementById("listsClearBtn").addEventListener("click", () => {
    document.querySelectorAll("input[data-kind='list']").forEach(cb => { cb.checked = false; });
    updateCounters();
  });

  // select all / clear for services
  document.getElementById("svcSelAll").addEventListener("click", () => {
    document.querySelectorAll("input[data-kind='service']").forEach(cb => { cb.checked = true; });
    updateCounters();
  });
  document.getElementById("svcClearBtn").addEventListener("click", () => {
    document.querySelectorAll("input[data-kind='service']").forEach(cb => { cb.checked = false; });
    updateCounters();
  });

  // generate
  const tokenEl = document.getElementById("token");
  document.getElementById("gen").addEventListener("click", () => {
    tokenEl.value = buildToken();
  });

  // copy
  const copyBtn = document.getElementById("copy");
  copyBtn.addEventListener("click", async () => {
    if (!tokenEl.value) tokenEl.value = buildToken();
    await navigator.clipboard.writeText(tokenEl.value);
    copyBtn.textContent = "✔ Скопировано";
    copyBtn.classList.add("copied");
    setTimeout(() => { copyBtn.textContent = "📋 Копировать"; copyBtn.classList.remove("copied"); }, 1800);
  });

  // reset all
  document.getElementById("resetAll").addEventListener("click", () => {
    document.querySelectorAll("input[data-kind='list'],input[data-kind='service']").forEach(cb => { cb.checked = false; });
    tokenEl.value = "";
    updateCounters();
  });
}

main().catch(e => {
  console.error(e);
  alert("Не удалось загрузить catalog.json: " + e.message);
});
