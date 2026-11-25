/* Talking — entraînement à la conversation fondé sur la recherche.
 * Mécaniques pédagogiques :
 *  - leçons courtes sourcées + situations avec feedback expliqué (pratique délibérée)
 *  - rappels espacés des leçons (pratique de récupération, répétition espacée)
 *  - « Parle 60 s » avec comptage des béquilles + réécoute avec préparation cognitive
 *  - défis terrain gradués avec plan « Quand…, je… » et comparaison prédiction / réalité
 */
(() => {
  'use strict';

  const KEY = 'talking.state.v2';
  const $app = document.getElementById('app');
  const $tabs = document.getElementById('tabs');
  const SRS_DAYS = [1, 3, 7, 16, 35];

  // ---------- icônes (traits 24×24) ----------
  const P = {
    home: '<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.4-3.8 4.2-5.6 7.5-5.6s6.1 1.8 7.5 5.6"/>',
    flame: '<path d="M12 3c.9 3.4 5 5.5 5 10.2a5 5 0 0 1-10 0c0-2.3 1-3.9 2.3-5 .2 1.7 1 2.7 2 3.1-.1-3 .2-5.7.7-8.3z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11m0-11-11 11"/>',
    right: '<path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5"/>',
    left: '<path d="M19 12H5m5.5-5.5L5 12l5.5 5.5"/>',
    chev: '<path d="m9.5 6 6 6-6 6"/>',
    mic: '<rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>',
    book: '<path d="M3.5 5.5C5.5 4.4 8.6 4 12 6c3.4-2 6.5-1.6 8.5-.5V19c-2-1.1-5.1-1.5-8.5.5-3.4-2-6.5-1.6-8.5-.5z"/><path d="M12 6v13.5"/>',
    recall: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5V8H16"/>',
    chat: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9.5L5 20v-4H5.5A1.5 1.5 0 0 1 4 14.5z"/>',
    pen: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.3 8.7-2 4.6-4.6 2 2-4.6z"/>',
    bulb: '<path d="M9.5 17.5h5M10.5 20.5h3M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5.9 1.1.9 1.9v.1h5v-.1c0-.8.3-1.4.9-1.9A5.8 5.8 0 0 0 12 3.5z"/>',
    download: '<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14"/>',
    shield: '<path d="M12 3.5 5 6.3v5c0 4.3 2.9 7.6 7 9.2 4.1-1.6 7-4.9 7-9.2v-5z"/>',
    aim: '<circle cx="12" cy="12" r="7.5"/><path d="M12 2.5v4.5M12 17v4.5M2.5 12H7M17 12h4.5"/>',
    ear: '<path d="M7.5 9.5a4.75 4.75 0 1 1 9.5 0c0 3.2-3 4.1-3 7.1a3.2 3.2 0 0 1-6 1.4"/><path d="M10.5 10a1.75 1.75 0 1 1 3.5 0"/>',
    story: '<path d="M6 3.5h9.5L19 7v13.5H6z"/><path d="M9 10h7M9 13.5h7M9 17h4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    head: '<path d="M4 15.5V12a8 8 0 0 1 16 0v3.5"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>',
    library: '<path d="M5 4v16M9.5 4v16M14 5.5l4.5 15"/>',
    map: '<path d="m9 4.5-5.5 2v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    trash: '<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.9 12.2A1.5 1.5 0 0 0 8.9 20.5h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7M9.5 7V4.5h5V7"/>',
    spark: '<path d="M12 3.5 13.8 10 20.5 12l-6.7 2L12 20.5 10.2 14 3.5 12l6.7-2z"/>',
    pin: '<path d="M12 20.5s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0c0 4.9-6.5 10.5-6.5 10.5z"/><circle cx="12" cy="10" r="2.3"/>',
    briefcase: '<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3.5 12.5h17"/>',
    users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5c1-3.3 3.4-5 6.5-5s5.5 1.7 6.5 5"/><path d="M15.5 5.3a3.5 3.5 0 0 1 0 6.4M17.5 14.7c2 .6 3.3 2.2 4 4.8"/>',
    heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5z"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 0 1-13.1 5M4.5 12a7.5 7.5 0 0 1 13.1-5"/><path d="M17.6 3.5V7h-3.5M6.4 20.5V17h3.5"/>',
  };
  const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const SKILL_IC = { smalltalk: 'chat', assurance: 'shield', clarte: 'aim', ecoute: 'ear', recit: 'story' };
  const GOAL_IC = { pro: 'briefcase', social: 'users', love: 'heart', all: 'globe' };

  // ---------- état ----------
  const fresh = () => ({
    profile: null,
    progress: { xp: 0, streak: 0, lastDay: null, days: {}, lessonsDone: [], sessions: 0, fillerHistory: [] },
    srs: {},
    missions: [],
    missionLevel: 1,
  });
  let state = load();
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (!s) return fresh();
      const f = fresh();
      return Object.assign(f, s, { progress: Object.assign(f.progress, s.progress || {}) });
    } catch { return fresh(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ } }

  // ---------- utilitaires ----------
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => dayKey();
  const addDays = (k, n) => { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() + n); return dayKey(d); };
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl = s => esc(s).replace(/\n/g, '<br>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
  const render = html => { $app.innerHTML = html; window.scrollTo(0, 0); };
  const on = (sel, ev, fn) => $app.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));
  const $ = sel => $app.querySelector(sel);
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const lessonById = id => LESSONS.find(l => l.id === id);
  const LETTERS = 'ABCDE';
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch { } };
  const evTag = lvl => `<span class="ev ev-${lvl}">${EVIDENCE[lvl].label}</span>`;
  const label = (icon, text) => `<p class="eyebrow">${ic(icon)}<span>${text}</span></p>`;

  function bump(skill, n) { const L = state.profile.levels; L[skill] = clamp((L[skill] || 0) + n, 0, 100); }
  function overall() { const L = state.profile.levels; return Math.round(avg(Object.keys(SKILLS).map(k => L[k] || 0))); }
  function weakest() { const L = state.profile.levels; return Object.keys(SKILLS).sort((a, b) => L[a] - L[b]); }
  function streakAlive() { const p = state.progress; if (!p.lastDay) return 0; return daysBetween(p.lastDay, today()) <= 1 ? p.streak : 0; }
  function markDay(minutes) {
    const p = state.progress, t = today();
    if (p.lastDay !== t) { p.streak = p.lastDay && daysBetween(p.lastDay, t) === 1 ? p.streak + 1 : 1; p.lastDay = t; }
    p.days[t] = (p.days[t] || 0) + minutes; p.sessions++;
  }

  // ---------- plateforme, version et mises à jour ----------
  const BUILD = window.TALKING_BUILD || { version: '0.0.0-dev', repo: 'DSQZRuRu/talking' };
  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const APK_URL = `https://github.com/${BUILD.repo}/releases/latest/download/talking.apk`;
  function newer(a, b) {
    const pa = String(a).replace(/^v/, '').split(/[.-]/).map(Number), pb = String(b).replace(/^v/, '').split(/[.-]/).map(Number);
    for (let i = 0; i < 3; i++) { const x = pa[i] || 0, y = pb[i] || 0; if (Number.isNaN(x) || Number.isNaN(y)) return false; if (x !== y) return x > y; }
    return false;
  }
  let latestRelease = null;
  async function checkUpdate() {
    try {
      const r = await fetch(`https://api.github.com/repos/${BUILD.repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      const asset = (j.assets || []).find(a => /\.apk$/i.test(a.name));
      latestRelease = { version: j.tag_name.replace(/^v/, ''), url: asset ? asset.browser_download_url : APK_URL };
      showBanner();
    } catch { /* hors ligne : on garde le lien direct */ }
  }
  // Module natif de mise à jour (Android) : télécharge l'APK puis ouvre l'installeur système.
  const Updater = isNative() && window.capacitorExports && window.capacitorExports.registerPlugin ? window.capacitorExports.registerPlugin('AppUpdater') : null;
  let updating = false;
  async function runUpdate(onStatus) {
    const url = latestRelease ? latestRelease.url : APK_URL;
    if (!Updater) { location.href = url; return; }
    if (updating) return;
    updating = true;
    let sub;
    try {
      onStatus('Téléchargement…');
      sub = await Updater.addListener('progress', e => {
        if (e && e.step === 'permission') onStatus('Autorise Talking à installer ses mises à jour, puis reviens');
        else if (e && typeof e.percent === 'number') onStatus(`Téléchargement… ${e.percent} %`);
      });
      await Updater.downloadAndInstall({ url });
      onStatus('Confirme l\'installation');
    } catch (err) {
      onStatus(`${(err && err.message) || 'La mise à jour a échoué'}. Réessaie.`, true);
    } finally {
      updating = false;
      try { sub && sub.remove(); } catch { }
    }
  }

  function showBanner() {
    const $b = document.getElementById('banner');
    let html = '';
    if (isNative()) {
      if (latestRelease && newer(latestRelease.version, BUILD.version)) {
        html = `${ic('download')}<span><b>Version ${esc(latestRelease.version)} disponible</b><small id="bstatus">Tu as la ${esc(BUILD.version)}</small></span><button class="bbtn" id="bupdate">Mettre à jour</button>`;
      }
    } else {
      let hidden = false; try { hidden = localStorage.getItem('talking.banner.hidden') === '1'; } catch { }
      if (!hidden) html = `${ic('download')}<span><b>Talking pour Android</b><small>${latestRelease ? `Version ${esc(latestRelease.version)}` : 'Fichier APK'}</small></span><a class="bbtn" href="${esc(latestRelease ? latestRelease.url : APK_URL)}">Télécharger</a><button class="bx" aria-label="Masquer">${ic('x')}</button>`;
    }
    $b.innerHTML = html; $b.hidden = !html;
    const u = $b.querySelector('#bupdate');
    if (u) u.onclick = () => runUpdate((msg, failed) => {
      const st = $b.querySelector('#bstatus'); if (st) st.textContent = msg;
      u.disabled = updating; u.textContent = failed ? 'Réessayer' : updating ? '…' : 'Mettre à jour';
    });
    const x = $b.querySelector('.bx');
    if (x) x.onclick = () => { try { localStorage.setItem('talking.banner.hidden', '1'); } catch { } showBanner(); };
  }

  // Reconnaissance vocale native (Android) exposée avec l'interface de webkitSpeechRecognition.
  // Le moteur Android s'arrête à chaque silence : on enchaîne les segments jusqu'à stop().
  function nativeSpeechClass() {
    const SP = isNative() && window.capacitorSpeechRecognition && window.capacitorSpeechRecognition.SpeechRecognition;
    if (!SP) return null;
    return class NativeSR {
      constructor() { this.lang = 'fr-FR'; this.active = false; this.cur = ''; this.handles = []; }
      emit(final) {
        if (!this.cur) return;
        this.onresult && this.onresult({ resultIndex: 0, results: [{ 0: { transcript: this.cur }, isFinal: final }] });
        if (final) this.cur = '';
      }
      async start() {
        this.active = true;
        try {
          const perm = await SP.requestPermissions();
          if (perm && perm.speechRecognition && perm.speechRecognition !== 'granted') { this.active = false; this.onerror && this.onerror({ error: 'not-allowed' }); return; }
        } catch { }
        this.handles.push(await SP.addListener('partialResults', d => { const m = d && d.matches && d.matches[0]; if (m) { this.cur = m; this.emit(false); } }));
        this.handles.push(await SP.addListener('listeningState', d => { if (d && d.status === 'stopped') this.emit(true); }));
        this.segment();
        this.poll = setInterval(async () => {
          if (!this.active) return;
          try { const { listening } = await SP.isListening(); if (!listening) { this.emit(true); this.segment(); } } catch { }
        }, 1200);
      }
      async segment() {
        if (!this.active || this.starting) return;
        this.starting = true;
        try { await SP.start({ language: this.lang, maxResults: 1, partialResults: true, popup: false }); } catch { }
        this.starting = false;
      }
      stop() {
        this.active = false; clearInterval(this.poll);
        this.emit(true);
        try { SP.stop(); } catch { }
        this.handles.forEach(h => { try { h.remove(); } catch { } }); this.handles = [];
        this.onend = null;
      }
    };
  }

  // ---------- répétition espacée ----------
  function srsSchedule(id) { if (!state.srs[id]) state.srs[id] = { box: 0, due: addDays(today(), SRS_DAYS[0]) }; }
  function srsAnswer(id, ok) {
    const c = state.srs[id] || { box: 0 };
    c.box = ok ? Math.min(c.box + 1, SRS_DAYS.length - 1) : 0;
    c.due = addDays(today(), SRS_DAYS[c.box]);
    state.srs[id] = c;
  }
  function dueRecalls(max) {
    const t = today();
    return Object.entries(state.srs).filter(([, c]) => c.due <= t).sort((a, b) => a[1].due < b[1].due ? -1 : 1)
      .slice(0, max).map(([id]) => lessonById(id)).filter(Boolean);
  }

  // ---------- défis ----------
  const pendingMission = () => state.missions.find(m => m.status === 'planned');
  const doneMissions = () => state.missions.filter(m => m.status === 'done');
  function adjustMissionLevel() {
    const recent = state.missions.filter(m => m.status !== 'planned' && m.lvl === state.missionLevel).slice(-3);
    const done = recent.filter(m => m.status === 'done');
    if (done.length >= 2 && state.missionLevel < 4) state.missionLevel++;
    else if (recent.length >= 2 && recent.slice(-2).every(m => m.status === 'skipped') && state.missionLevel > 1) state.missionLevel--;
  }

  // ---------- composants ----------
  function scale(id, lo, hi, n = 11) {
    return `<div class="scale" id="${id}" style="--n:${n}">${[...Array(n)].map((_, v) => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="scale-ends"><span>${lo}</span><span>${hi}</span></div>`;
  }
  function wireScale(id, cb) {
    on(`#${id} button`, 'click', e => {
      const b = e.currentTarget;
      $app.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('on', x === b));
      cb(+b.dataset.v);
    });
  }
  const opts = (list, attr = 'k') => `<div class="opts">${list.map((t, k) => `<button class="opt" data-${attr}="${k}"><span class="key">${LETTERS[k]}</span><span class="txt">${esc(t)}</span></button>`).join('')}</div>`;
  function skillRows(L, extra) {
    return `<div class="skills">${Object.entries(SKILLS).map(([k, s]) => `
      <div class="skill">${ic(SKILL_IC[k])}<span class="sn">${s.name}${extra && extra.focus && extra.focus.includes(k) ? '<em>priorité</em>' : ''}</span>
        <div class="track"><i style="width:${L[k]}%"></i></div><b>${L[k]}</b>${extra && extra.delta ? `<small class="${extra.delta[k] > 0 ? 'up' : ''}">${extra.delta[k] > 0 ? '+' + extra.delta[k] : ''}</small>` : ''}</div>`).join('')}</div>`;
  }
  const stat = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;

  // ---------- fenêtres de dialogue de l'app (à la place de confirm/alert du système) ----------
  let dialogOpen = null;
  function dialog({ title, body = '', confirm = 'OK', cancel = null, danger = false, icon = 'chat' }) {
    return new Promise(resolve => {
      if (dialogOpen) dialogOpen(false);
      const el = document.createElement('div');
      el.className = 'sheet-wrap';
      el.innerHTML = `<div class="sheet-bg"></div>
        <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t">
          <span class="sheet-ic ${danger ? 'danger' : ''}">${ic(icon)}</span>
          <h2 id="sheet-t">${esc(title)}</h2>${body ? `<p>${esc(body)}</p>` : ''}
          <div class="sheet-actions">
            <button class="btn ${danger ? 'danger' : 'primary'}" data-r="1">${esc(confirm)}</button>
            ${cancel ? `<button class="btn secondary" data-r="0">${esc(cancel)}</button>` : ''}
          </div></div>`;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('in'));
      const close = r => {
        if (dialogOpen !== close) return;
        dialogOpen = null; el.classList.remove('in');
        setTimeout(() => el.remove(), 220);
        resolve(r);
      };
      dialogOpen = close;
      el.querySelector('.sheet-bg').onclick = () => close(false);
      el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => close(b.dataset.r === '1'));
      el.querySelector(cancel ? '[data-r="0"]' : '[data-r="1"]').focus();
    });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && dialogOpen) dialogOpen(false); });

  // Bouton retour d'Android (et du navigateur) : il revient en arrière dans l'app au lieu de la fermer.
  // Chaque écran secondaire déclare son « retour » ; on garde une entrée d'historique tant qu'il y en a un.
  let backHandler = null, backPushed = false, ignorePop = false;
  function setBack(fn) {
    backHandler = fn;
    if (fn && !backPushed) { history.pushState({ talking: 1 }, ''); backPushed = true; }
    else if (!fn && backPushed) { backPushed = false; ignorePop = true; history.back(); }
  }
  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    backPushed = false;
    if (dialogOpen) { dialogOpen(false); history.pushState({ talking: 1 }, ''); backPushed = true; return; }
    const h = backHandler;
    if (h) { history.pushState({ talking: 1 }, ''); backPushed = true; h(); }
  });

  // ---------- navigation ----------
  function showTabs(active) {
    if (active) setBack(active === 'home' ? null : Home);
    $tabs.hidden = !active;
    document.body.classList.toggle('with-tabs', !!active);
    $tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.tab === active));
  }
  $tabs.innerHTML = `
    <button data-tab="home">${ic('home')}<span>Aujourd'hui</span></button>
    <button data-tab="practice">${ic('target')}<span>S'entraîner</span></button>
    <button data-tab="profile">${ic('user')}<span>Profil</span></button>`;
  $tabs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    ({ home: Home, practice: Practice, profile: Profile })[b.dataset.tab]();
  });

  // ================= ONBOARDING =================
  function Welcome() {
    showTabs(null);
    setBack(null);
    render(`
      <section class="screen welcome">
        <p class="wordmark">talking<i>.</i></p>
        <h1 class="display">Arrête de parler de la <span class="strike">météo<svg viewBox="0 0 120 20" preserveAspectRatio="none"><path d="M3 13c18-5 36-8 57-7s40 3 57-1"/></svg></span>.</h1>
        <div class="demo" aria-label="Exemple de conversation">
          <div class="bubble them">Grosse journée&nbsp;?</div>
          <div class="bubble me flat">Ouais… drôle de temps, hein&nbsp;?</div>
          <p class="demo-label">Après quelques séances</p>
          <div class="bubble me">Trois réunions et zéro café, je survis. Et toi, ta journée&nbsp;?</div>
        </div>
        <p class="lead">Tu n'es pas mauvais avec les gens. Tu bloques, c'est tout. Ça s'entraîne, quelques minutes par jour, avec des techniques issues de la recherche en psychologie.</p>
        <ol class="steps">
          <li><span>01</span><div><b>Apprendre</b><p>Une technique validée, expliquée en 2 minutes, sources à l'appui.</p></div></li>
          <li><span>02</span><div><b>Pratiquer</b><p>Des situations réelles, à l'écrit et à voix haute.</p></div></li>
          <li><span>03</span><div><b>Oser</b><p>Un petit défi dans ta vraie vie, et tu compares avec ce que tu redoutais.</p></div></li>
        </ol>
        <figure class="fact">
          <blockquote>Après une conversation avec un inconnu, on sous-estime presque toujours à quel point l'autre nous a apprécié.</blockquote>
          <figcaption>Boothby et al., <i>Psychological Science</i>, 2018</figcaption>
        </figure>
        <div class="footer-cta">
          <button class="btn primary" id="go">Commencer le test<span class="sub">2 min</span></button>
          <p class="fine">Gratuit, sans compte. Tes données restent sur ton appareil.</p>
        </div>
      </section>`);
    on('#go', 'click', () => Quiz(0, { __hist: [] }));
  }

  const TOTAL_STEPS = QUIZ.length + 3;
  const qhead = (i, back) => `<div class="qhead">${back ? `<button class="icon-btn" id="back" aria-label="Retour">${ic('left')}</button>` : '<span class="icon-btn ghost"></span>'}
    <div class="meter"><i style="width:${(i / TOTAL_STEPS) * 100}%"></i></div><span class="count">${Math.min(i + 1, TOTAL_STEPS)}/${TOTAL_STEPS}</span></div>`;

  function Quiz(i, need) {
    showTabs(null);
    if (i >= QUIZ.length) return Spin(need);
    const q = QUIZ[i];
    render(`
      <section class="screen">
        ${qhead(i, i > 0)}
        ${label('chat', 'Tes réflexes')}
        <h2 class="title">${esc(q.q)}</h2>
        ${opts(q.options.map(o => o.t))}
      </section>`);
    on('.opt', 'click', e => {
      if (e.currentTarget.disabled) return;
      $app.querySelectorAll('.opt').forEach(b => { b.disabled = true; });
      e.currentTarget.classList.add('sel');
      const o = q.options[+e.currentTarget.dataset.k];
      const n = Object.assign({}, need, { __hist: need.__hist.concat([o.w]) });
      for (const [k, v] of Object.entries(o.w)) n[k] = (n[k] || 0) + v;
      setTimeout(() => Quiz(i + 1, n), 140);
    });
    const goBack = () => {
      if (i === 0) { state.profile ? Profile() : Welcome(); return; }
      const hist = need.__hist.slice(); const last = hist.pop() || {};
      const n = Object.assign({}, need, { __hist: hist });
      for (const [k, v] of Object.entries(last)) n[k] -= v;
      Quiz(i - 1, n);
    };
    on('#back', 'click', goBack);
    setBack(goBack);
  }

  function Spin(need) {
    setBack(() => { });
    const ans = [null, null, null];
    render(`
      <section class="screen">
        ${qhead(QUIZ.length, false)}
        ${label('shield', 'Ton trac')}
        <h2 class="title">À quel point ces phrases te décrivent&nbsp;?</h2>
        <p class="note">Questionnaire Mini-SPIN (Connor et al., 2001), utilisé pour repérer le trac social. Ce n'est pas un diagnostic.</p>
        ${MINISPIN.map((s, i) => `<div class="spin-item"><p>${esc(s)}</p>
          <div class="scale" data-i="${i}" style="--n:5">${MINISPIN_SCALE.map((l, v) => `<button type="button" data-v="${v}" aria-label="${l}">${v}</button>`).join('')}</div>
          <div class="scale-ends"><span>${MINISPIN_SCALE[0]}</span><span>${MINISPIN_SCALE[4]}</span></div></div>`).join('')}
        <div class="footer-cta"><button class="btn primary" id="ok" disabled>Continuer</button></div>
      </section>`);
    on('.scale button', 'click', e => {
      const b = e.currentTarget, i = +b.parentElement.dataset.i;
      ans[i] = +b.dataset.v;
      b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      $('#ok').disabled = ans.some(a => a === null);
    });
    on('#ok', 'click', () => Goal(need, ans.reduce((a, b) => a + b, 0)));
  }

  function Goal(need, spin) {
    setBack(() => { });
    render(`
      <section class="screen">
        ${qhead(QUIZ.length + 1, false)}
        ${label('compass', 'Ton objectif')}
        <h2 class="title">Où veux-tu être plus à l'aise&nbsp;?</h2>
        <div class="tiles">${GOALS.map(g => `<button class="tile" data-g="${g.id}">${ic(GOAL_IC[g.id])}<b>${g.t}</b><small>${g.d}</small></button>`).join('')}</div>
      </section>`);
    on('.tile', 'click', e => Setup(need, spin, e.currentTarget.dataset.g));
  }

  function Setup(need, spin, goal) {
    setBack(() => { });
    render(`
      <section class="screen">
        ${qhead(QUIZ.length + 2, false)}
        ${label('user', 'Dernière chose')}
        <h2 class="title">Comment t'appelles-tu&nbsp;?</h2>
        <input id="name" class="input" maxlength="30" placeholder="Ton prénom (optionnel)" autocomplete="given-name">
        <p class="field-label">Temps par jour</p>
        <div class="seg" id="mins">${[5, 9, 15].map(m => `<button data-m="${m}" class="${m === 9 ? 'on' : ''}">${m} min</button>`).join('')}</div>
        <p class="note">Des séances courtes et régulières font mieux retenir que de longues séances espacées.</p>
        <div class="footer-cta"><button class="btn primary" id="ok">Voir mon plan</button></div>
      </section>`);
    let minutes = 9;
    on('#mins button', 'click', e => {
      minutes = +e.currentTarget.dataset.m;
      $app.querySelectorAll('#mins button').forEach(b => b.classList.toggle('on', b === e.currentTarget));
    });
    on('#ok', 'click', () => {
      const name = $('#name').value.trim();
      Analyzing(() => {
        const levels = {};
        for (const k of Object.keys(SKILLS)) levels[k] = clamp(72 - (need[k] || 0) * 8, 15, 80);
        if (spin >= 6) levels.assurance = clamp(levels.assurance - 8, 10, 80);
        state = fresh();
        state.profile = { name, goal, minutes, levels, start: Object.assign({}, levels), spin, createdAt: today() };
        state.profile.focus = weakest().slice(0, 3);
        state.missionLevel = spin >= 5 ? 1 : 2;
        save();
        Plan(true);
      });
    });
  }

  function Analyzing(done) {
    render(`<section class="screen center analyzing">
      <div class="loader"><i></i><i></i><i></i></div>
      <h2 class="title">On construit ton plan</h2>
      <ul class="checks" id="chk"><li>${ic('check')}Tes réflexes en conversation</li><li>${ic('check')}Ton niveau de trac</li><li>${ic('check')}Tes premiers défis</li></ul></section>`);
    $app.querySelectorAll('#chk li').forEach((li, i) => setTimeout(() => li.classList.add('ok'), 350 + i * 450));
    setTimeout(done, 1800);
  }

  function spinMessage(spin) {
    if (spin >= 6) return `<div class="callout warn"><b>Ton score de trac est élevé : ${spin}/12</b>
      <p>Chez l'adulte, 6 ou plus au Mini-SPIN peut signaler une anxiété sociale marquée. Ce n'est pas un diagnostic, et c'est très courant. Talking t'aide à t'entraîner, mais si ce trac te fait éviter des choses importantes, un psychologue formé aux TCC (thérapies cognitives et comportementales) est le traitement de référence, et il marche bien.</p></div>`;
    if (spin >= 3) return `<div class="callout"><b>Trac modéré : ${spin}/12</b><p>C'est normal, la plupart des gens en ressentent un peu. Les défis progressifs sont faits pour ça.</p></div>`;
    return `<div class="callout"><b>Trac faible : ${spin}/12</b><p>Tu peux te concentrer sur les techniques et viser des défis plus ambitieux.</p></div>`;
  }

  function Plan(first) {
    showTabs(first ? null : 'profile');
    if (first) setBack(() => { });
    const p = state.profile; const f = p.focus;
    const goal = GOALS.find(g => g.id === p.goal);
    const weeks = [
      { t: 'Débloquer', d: `Priorité ${SKILLS[f[0]].name.toLowerCase()}. Petits défis quotidiens, niveau ${state.missionLevel}.` },
      { t: 'Consolider', d: `Priorité ${SKILLS[f[1]].name.toLowerCase()}. Les rappels espacés fixent la semaine 1.` },
      { t: 'S\'affirmer', d: `Priorité ${SKILLS[f[2]].name.toLowerCase()}. Défis plus ambitieux selon tes réussites.` },
      { t: 'Ancrer', d: 'Tout combiner en situation réelle et mesurer ton écart entre prédiction et réalité.' },
    ];
    render(`
      <section class="screen">
        ${first ? '' : `<button class="link-back" id="back">${ic('left')}Profil</button>`}
        ${label('spark', first ? 'Ton résultat' : 'Ton plan')}
        <h2 class="title">${p.name ? esc(p.name) + ', voici' : 'Voici'} ton point de départ</h2>
        <div class="score-hero">
          <div class="big">${overall()}<small>/100</small></div>
          <p>Score de départ<br><span>${ic(GOAL_IC[goal.id])}${goal.t} · ${p.minutes} min/jour</span></p>
        </div>
        ${skillRows(p.levels, { focus: f })}
        <p class="note">Score indicatif calculé à partir de tes réponses, pour choisir tes priorités. Ce n'est pas une mesure scientifique.</p>
        ${spinMessage(p.spin ?? 0)}
        <h3 class="section">Tes 4 semaines</h3>
        <ol class="timeline">${weeks.map((w, i) => `<li><span class="dot">${i + 1}</span><div><b>${w.t}</b><p>${esc(w.d)}</p></div></li>`).join('')}</ol>
        <h3 class="section">Chaque jour</h3>
        <div class="howto">
          <div>${ic('book')}<b>Apprendre</b><p>Une technique sourcée</p></div>
          <div>${ic('chat')}<b>Pratiquer</b><p>Écrit et oral</p></div>
          <div>${ic('recall')}<b>Retenir</b><p>Rappels à J+1, J+3, J+7…</p></div>
          <div>${ic('compass')}<b>Oser</b><p>Un défi réel</p></div>
        </div>
        ${first ? '<div class="footer-cta"><button class="btn primary" id="start">Commencer ma première séance</button></div>' : ''}
      </section>`);
    on('#start', 'click', () => Session());
    on('#back', 'click', Profile);
    if (!first) setBack(Profile);
  }

  // ================= ACCUEIL =================
  function Home() {
    showTabs('home');
    const p = state.profile, pr = state.progress;
    const doneToday = (pr.days[today()] || 0) > 0;
    const week = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = dayKey(d);
      return { l: 'DLMMJVS'[d.getDay()], n: d.getDate(), on: !!pr.days[k], t: k === today() };
    });
    const lesson = nextLesson();
    const pm = pendingMission();
    const dues = Math.min(dueRecalls(9).length, 2);
    const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const plan = [
      dues ? ['recall', `${plural(dues, 'rappel')}`, '1 min'] : null,
      ['book', 'Leçon', '2 min'],
      ['chat', '2 situations', '2 min'],
      ['pen', 'Reformulation', '1 min'],
      ['mic', 'Parle 60 secondes', '2 min'],
      pm ? null : ['compass', 'Défi terrain', '1 min'],
    ].filter(Boolean);
    render(`
      <section class="screen home">
        <header class="hello">
          <div><p class="date">${esc(dateStr)}</p><h1 class="display sm">${greeting()}${p.name ? `, ${esc(p.name)}` : ''}.</h1></div>
          <div class="streak ${streakAlive() ? 'lit' : ''}" title="Jours d'affilée">${ic('flame')}<b>${streakAlive()}</b></div>
        </header>
        <div class="week">${week.map(d => `<div class="${d.on ? 'on' : ''} ${d.t ? 'is-today' : ''}"><span>${d.l}</span><i>${d.on ? ic('check') : d.n}</i></div>`).join('')}</div>
        ${pm ? missionCard(pm) : ''}
        <article class="today ${doneToday ? 'done' : ''}">
          <div class="today-top">${label(SKILL_IC[lesson.skill], doneToday ? 'Séance faite aujourd\'hui' : `Séance du jour · ~${p.minutes} min`)}${evTag(lesson.level)}</div>
          <h2 class="today-title">${esc(lesson.title)}</h2>
          <ul class="pills">${plan.map(([i, t]) => `<li>${ic(i)}${t}</li>`).join('')}</ul>
          <button class="btn ${doneToday ? 'secondary' : 'invert'}" id="go">${doneToday ? 'Refaire une séance' : 'C\'est parti'}${ic('right')}</button>
        </article>
        ${predictionCard()}
        <div class="stats">${stat(overall(), 'Score')}${stat(doneMissions().length, 'Défis réussis')}${stat(`${pr.lessonsDone.length}<small>/${LESSONS.length}</small>`, 'Leçons')}</div>
        <h3 class="section">Tes compétences</h3>
        ${skillRows(p.levels)}
      </section>`);
    on('#go', 'click', () => Session());
    on('#mdone', 'click', () => MissionReport(pendingMission()));
    on('#mskip', 'click', () => MissionSkip(pendingMission()));
  }
  function greeting() { const h = new Date().getHours(); return h < 5 ? 'Bonsoir' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'; }

  function missionCard(m) {
    return `<article class="mission">
      <div class="mission-top">${label('compass', `Défi en cours · niveau ${m.lvl}/4`)}</div>
      <p class="mt">${esc(m.t)}</p>
      <p class="plan">« ${esc(m.plan)} »</p>
      <div class="row2"><button class="btn primary sm" id="mdone">${ic('check')}C'est fait</button><button class="btn secondary sm" id="mskip">Pas fait</button></div>
    </article>`;
  }

  function predictionCard() {
    const d = doneMissions().filter(m => m.ok != null && m.predOk != null);
    if (!d.length) return '';
    const gapOk = avg(d.map(m => m.ok - m.predOk)), gapAnx = avg(d.map(m => m.anx - m.predAnx));
    const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
    return `<article class="insight">
      ${label('spark', `Prédiction et réalité · ${plural(d.length, 'défi')}`)}
      <div class="insight-nums"><div><b class="${gapOk >= 0 ? 'pos' : ''}">${sgn(gapOk)}</b><span>résultat vs prévu</span></div><div><b class="${gapAnx <= 0 ? 'pos' : ''}">${sgn(gapAnx)}</b><span>stress vs prévu</span></div></div>
      <p>${gapOk > 0 ? 'Tes défis se passent mieux que tu ne le prédis, comme le montre la recherche. Ce sont tes propres données.' : 'Continue : c\'est en accumulant les expériences que les prédictions se recalibrent.'}</p>
    </article>`;
  }

  function nextLesson() {
    const done = state.progress.lessonsDone;
    const order = state.profile.focus.concat(weakest());
    for (const sk of order) { const l = LESSONS.find(x => x.skill === sk && !done.includes(x.id)); if (l) return l; }
    return LESSONS.find(x => !done.includes(x.id)) || pick(LESSONS);
  }

  // ================= DÉFIS : bilan =================
  function MissionReport(m) {
    showTabs(null);
    let anx = null, ok = null;
    render(`
      <section class="screen">
        <button class="link-back" id="cancel">${ic('left')}Retour</button>
        ${label('compass', 'Bilan du défi')}
        <h2 class="title">Bravo d'avoir osé.</h2>
        <p class="quote-sm">${esc(m.t)}</p>
        <p class="field-label">Ton stress pendant le défi</p>${scale('anx', 'Aucun', 'Maximum')}
        <p class="field-label">Comment ça s'est passé en vrai</p>${scale('ok', 'Très mal', 'Très bien')}
        <p class="field-label">Une chose que tu as remarquée <span>optionnel</span></p>
        <textarea id="note" class="input" rows="2" placeholder="Ex. : il m'a posé plein de questions en retour"></textarea>
        <div class="footer-cta"><button class="btn primary" id="save" disabled>Comparer à ma prédiction</button></div>
      </section>`);
    wireScale('anx', v => { anx = v; check(); }); wireScale('ok', v => { ok = v; check(); });
    function check() { $('#save').disabled = anx === null || ok === null; }
    on('#cancel', 'click', Home);
    setBack(Home);
    on('#save', 'click', () => {
      Object.assign(m, { status: 'done', anx, ok, note: $('#note').value.trim(), doneOn: today() });
      state.progress.xp += 40; bump('assurance', 3); bump('smalltalk', 1);
      adjustMissionLevel(); save(); buzz(15);
      const dOk = ok - m.predOk, dAnx = anx - m.predAnx;
      render(`
        <section class="screen result">
          ${label('spark', 'Prédiction et réalité')}
          <h2 class="title">${dOk > 0 ? 'Mieux que prévu.' : dOk === 0 ? 'Exactement comme prévu.' : 'Moins bien que prévu, mais fait.'}</h2>
          <div class="versus">
            <div><span>Tu prévoyais</span><b>${m.predOk}<small>/10</small></b><em>stress ${m.predAnx}/10</em></div>
            ${ic('right')}
            <div class="real"><span>En vrai</span><b>${ok}<small>/10</small></b><em>stress ${anx}/10</em></div>
          </div>
          <p class="lead">${dOk > 0 ? `Ça s'est passé ${dOk} point${dOk > 1 ? 's' : ''} mieux que ce que tu imaginais.` : dOk === 0 ? 'Ta prédiction était juste.' : 'Ça arrive. Le simple fait de l\'avoir fait compte.'}${dAnx < 0 ? ` Et tu as eu moins peur que prévu.` : ''}</p>
          <p class="note">Tester ses prédictions dans la réalité au lieu de les croire sur parole, c'est le cœur des thérapies cognitives et comportementales. Prochain niveau de défi : ${state.missionLevel}/4.</p>
          <div class="footer-cta"><button class="btn primary" id="h">Continuer</button></div>
        </section>`);
      on('#h', 'click', Home);
    });
  }
  function MissionSkip(m) {
    showTabs(null);
    render(`
      <section class="screen">
        <button class="link-back" id="cancel">${ic('left')}Retour</button>
        ${label('compass', 'Défi non réalisé')}
        <h2 class="title">Pas grave. Qu'est-ce qui a bloqué&nbsp;?</h2>
        ${opts(['Pas eu l\'occasion', 'J\'ai eu trop peur', 'J\'ai oublié'], 'r')}
      </section>`);
    on('#cancel', 'click', Home);
    setBack(Home);
    on('.opt', 'click', e => {
      const r = ['occasion', 'peur', 'oubli'][+e.currentTarget.dataset.r];
      Object.assign(m, { status: 'skipped', reason: r, doneOn: today() });
      adjustMissionLevel();
      if (r === 'peur' && state.missionLevel > 1) state.missionLevel--;
      save();
      const tip = {
        occasion: 'Choisis un défi qui colle à ta journée de demain, avec un moment précis dans le « Quand… ».',
        peur: 'C\'est une information utile, pas un échec. On choisit un défi un cran plus facile : l\'exposition marche quand elle est progressive.',
        oubli: 'Un plan « Quand [moment précis], je [action] » augmente nettement les chances de passer à l\'action. Rends ton « quand » plus concret.',
      }[r];
      render(`<section class="screen result"><span class="result-ic">${ic('compass')}</span><h2 class="title">On ajuste.</h2><p class="lead">${esc(tip)}</p>
        <p class="note">Prochain défi au niveau ${state.missionLevel}/4.</p>
        <div class="footer-cta"><button class="btn primary" id="n">Choisir un nouveau défi</button><button class="btn ghost" id="h">Plus tard</button></div></section>`);
      on('#n', 'click', () => MissionPlan(null, Home));
      on('#h', 'click', Home);
    });
  }

  // ================= DÉFIS : planification =================
  function MissionPlan(S, after) {
    if (pendingMission()) { after(); return; }
    const lvl = state.missionLevel;
    const usedRecently = new Set(state.missions.slice(-6).map(m => m.t));
    let pool = MISSIONS.filter(m => m.lvl === lvl && !usedRecently.has(m.t));
    if (pool.length < 2) pool = MISSIONS.filter(m => m.lvl === lvl);
    const choices = shuffle(pool).slice(0, 2);
    let chosen = null, predAnx = null, predOk = null;
    const html = `
      ${label('compass', `Défi terrain · niveau ${lvl}/4`)}
      <h2 class="title">Ton défi pour les prochaines 24&nbsp;h</h2>
      <div id="mopts">${opts(choices.map(m => m.t))}</div>
      <div id="mform" class="reveal" hidden>
        <p class="field-label">Ton plan précis</p>
        <textarea id="plan" class="input" rows="2"></textarea>
        <p class="note">Formuler « Quand [situation], je [action] » augmente fortement les chances de passer à l'action (Gollwitzer & Sheeran, 2006, 94 études).</p>
        <p class="field-label">Ton stress prévu</p>${scale('pa', 'Aucun', 'Maximum')}
        <p class="field-label">Comment tu penses que ça va se passer</p>${scale('po', 'Très mal', 'Très bien')}
        <p class="note">Sois honnête : demain, tu compareras ta prédiction à la réalité.</p>
        <div class="footer-cta"><button class="btn primary" id="commit" disabled>Je m'engage</button></div>
      </div>
      ${S ? '' : '<button class="btn ghost" id="cancel">Annuler</button>'}`;
    if (S) { render(frame(S, html)); startClock(S); wireQuit(); } else { showTabs(null); render(`<section class="screen">${html}</section>`); setBack(after); }
    const check = () => { $('#commit').disabled = !chosen || predAnx === null || predOk === null || $('#plan').value.trim().length < 8; };
    on('#mopts .opt', 'click', e => {
      chosen = choices[+e.currentTarget.dataset.k];
      $app.querySelectorAll('#mopts .opt').forEach(b => b.classList.toggle('sel', b === e.currentTarget));
      $('#mform').hidden = false;
      $('#plan').value = `Quand je serai ${chosen.when}, je `;
      $('#plan').focus(); check();
    });
    on('#plan', 'input', check);
    wireScale('pa', v => { predAnx = v; check(); }); wireScale('po', v => { predOk = v; check(); });
    on('#cancel', 'click', after);
    on('#commit', 'click', () => {
      state.missions.push({ id: Date.now(), lvl, t: chosen.t, when: chosen.when, plan: $('#plan').value.trim(), predAnx, predOk, plannedOn: today(), status: 'planned' });
      if (S) S.xp += 10;
      save(); after();
    });
  }

  // ================= SÉANCE =================
  function Session() {
    showTabs(null);
    const lesson = nextLesson();
    const focus = state.profile.focus, goal = state.profile.goal;
    const recalls = dueRecalls(2).filter(l => l.id !== lesson.id);
    const pool = SCENARIOS.filter(s => s.skill === lesson.skill || s.principle === lesson.id || focus.includes(s.skill));
    const ranked = shuffle(pool).sort((a, b) => ((b.principle === lesson.id) * 2 + (b.ctx === goal)) - ((a.principle === lesson.id) * 2 + (a.ctx === goal)));
    const scen = ranked.slice(0, 2);
    while (scen.length < 2) { const s = pick(SCENARIOS); if (!scen.includes(s)) scen.push(s); }
    const rewritePool = lesson.skill === 'ecoute' ? REWRITES.filter(r => r.support) : REWRITES;
    const steps = [
      ...recalls.map(l => ({ type: 'recall', lesson: l })),
      { type: 'lesson', lesson },
      ...scen.map(s => ({ type: 'scenario', s })),
      { type: 'rewrite', r: pick(rewritePool) },
      { type: 'speak', prompt: pick(PROMPTS) },
    ];
    if (!pendingMission()) steps.push({ type: 'mission' });
    runStep({ steps, i: 0, t0: Date.now(), correct: 0, total: 0, xp: 0 });
  }

  function frame(S, inner) {
    return `<section class="screen session">
      <div class="sbar"><button class="icon-btn" id="quit" aria-label="Quitter">${ic('x')}</button>
        <div class="segs">${S.steps.map((_, k) => `<i class="${k < S.i ? 'done' : k === S.i ? 'cur' : ''}"></i>`).join('')}</div>
        <span class="clock" id="clock">0:00</span></div>
      ${inner}</section>`;
  }
  let clockTimer;
  function startClock(S) {
    clearInterval(clockTimer);
    const tick = () => { const c = document.getElementById('clock'); if (c) c.textContent = fmt(Math.round((Date.now() - S.t0) / 1000)); };
    tick(); clockTimer = setInterval(tick, 1000);
  }
  function wireQuit() {
    on('#quit', 'click', askQuit);
    setBack(askQuit);
  }
  async function askQuit() {
    const solo = currentSession && currentSession.solo;
    const ok = await dialog({
      title: solo ? 'Arrêter l\'exercice ?' : 'Quitter la séance ?',
      body: solo ? 'Tu pourras le reprendre quand tu veux.' : 'Ce que tu as fait dans cette séance ne comptera pas pour ta série du jour.',
      confirm: 'Quitter', cancel: solo ? 'Continuer' : 'Continuer la séance', danger: true, icon: 'x',
    });
    if (!ok) return;
    stopAudio(); clearInterval(clockTimer); save();
    solo ? Practice() : Home();
  }
  let currentSession = null;
  function next(S) { S.i++; runStep(S); }
  function runStep(S) {
    currentSession = S;
    if (S.i >= S.steps.length) return Finish(S);
    const st = S.steps[S.i];
    if (st.type === 'mission') return MissionPlan(S, () => next(S));
    ({ recall: StepRecall, lesson: StepLesson, scenario: StepScenario, rewrite: StepRewrite, speak: StepSpeak })[st.type](S, st);
    startClock(S); wireQuit();
  }
  const continueBtn = (txt = 'Continuer') => `<div class="footer-cta"><button class="btn primary" id="n">${txt}${ic('right')}</button></div>`;
  function feedback(ok, title, body, extra = '') {
    return `<div class="fb ${ok ? 'ok' : 'ko'}"><p class="fb-title">${ic(ok ? 'check' : 'x')}${title}</p><p>${body}</p>${extra}</div>`;
  }

  function StepRecall(S, st) {
    const L = st.lesson, q = pick(L.recall);
    const order = shuffle(q.o.map((t, k) => ({ t, k })));
    render(frame(S, `
      ${label('recall', `Rappel · ${esc(L.title)}`)}
      <h2 class="title">${esc(q.q)}</h2>
      ${opts(order.map(o => o.t), 'i')}
      <div id="fb"></div>`));
    on('.opt', 'click', e => {
      const i = +e.currentTarget.dataset.i, ok = order[i].k === q.a;
      $app.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (order[k].k === q.a) b.classList.add('good'); else if (k === i) b.classList.add('bad'); });
      srsAnswer(L.id, ok); S.total++; if (ok) { S.correct++; S.xp += 10; bump(L.skill, 1); }
      buzz(ok ? 12 : [20, 40, 20]);
      const dd = daysBetween(today(), state.srs[L.id].due);
      $('#fb').innerHTML = feedback(ok, ok ? 'Bien retenu' : 'Pas tout à fait', esc(L.cards[1].p), `<p class="fb-meta">${ic('clock')}Prochain rappel dans ${plural(dd, 'jour')}</p>`) + continueBtn();
      on('#n', 'click', () => next(S));
    });
  }

  function StepLesson(S, st, c = 0) {
    const L = st.lesson, card = L.cards[c], last = c === L.cards.length - 1;
    render(frame(S, `
      <div class="lesson-head">${label(SKILL_IC[L.skill], `Leçon · ${SKILLS[L.skill].name}`)}${evTag(L.level)}</div>
      <h2 class="title">${esc(L.title)}</h2>
      <article class="lesson">
        <p class="lesson-count">${c + 1}<span>/${L.cards.length}</span></p>
        <h3>${esc(card.h)}</h3>
        <p>${esc(card.p)}</p>
        ${card.ex ? `<blockquote class="example">${nl(card.ex)}</blockquote>` : ''}
      </article>
      ${last ? `<details class="sources"><summary>${ic('library')}Sources (${L.src.length})</summary><ol>${L.src.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>` : ''}
      <div class="footer-cta row2">${c > 0 ? `<button class="btn secondary icon" id="p" aria-label="Précédent">${ic('left')}</button>` : ''}<button class="btn primary grow" id="n">${last ? 'J\'ai compris' : 'Suivant'}${ic('right')}</button></div>`));
    const redraw = k => { StepLesson(S, st, k); startClock(S); wireQuit(); };
    on('#p', 'click', () => redraw(c - 1));
    on('#n', 'click', () => {
      if (!last) return redraw(c + 1);
      if (!state.progress.lessonsDone.includes(L.id)) { state.progress.lessonsDone.push(L.id); bump(L.skill, 2); }
      srsSchedule(L.id); S.xp += 10; next(S);
    });
  }

  function StepScenario(S, st) {
    const s = st.s; const o_ = shuffle(s.options); const Pr = lessonById(s.principle);
    render(frame(S, `
      ${label('chat', `Situation · ${SKILLS[s.skill].name}`)}
      <p class="where">${ic('pin')}${esc(s.where)}</p>
      <div class="bubble them">${esc(s.them)}</div>
      <p class="field-label">Ta réponse</p>
      ${opts(o_.map(o => o.t))}
      <div id="fb"></div>`));
    let answered = false;
    on('.opt', 'click', e => {
      if (answered) return; answered = true;
      const o = o_[+e.currentTarget.dataset.k];
      $app.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (o_[k].ok) b.classList.add('good'); else if (b === e.currentTarget) b.classList.add('bad'); });
      S.total++; if (o.ok) { S.correct++; S.xp += 15; bump(s.skill, 2); } else S.xp += 5;
      buzz(o.ok ? 12 : [20, 40, 20]);
      const best = o_.find(x => x.ok);
      $('#fb').innerHTML = feedback(o.ok, o.ok ? 'Bien joué' : 'Pas tout à fait', esc(o.fb) + (o.ok ? '' : `<br><span class="muted">La meilleure réponse : ${esc(best.fb)}</span>`),
        Pr ? `<p class="fb-meta">${ic('book')}Principe : ${esc(Pr.title)}</p>` : '') + continueBtn();
      on('#n', 'click', () => next(S));
      $('#fb').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function analyzeRewrite(txt, r) {
    const t = ' ' + txt.toLowerCase().replace(/[’]/g, "'") + ' ';
    const q = /\?/.test(txt);
    const self = /(^|[^\p{L}])(je|j'|moi|mon|ma|mes|m'|me)(?=[^\p{L}]|$)/u.test(t);
    const shift = /^\s*(moi aussi|moi je|moi,|le mien|la mienne|pareil|ça m'est arrivé)/.test(t);
    const meteo = /(météo|il fait (beau|chaud|froid)|la pluie|il pleut)/.test(t);
    if (r.support) return [
      { ok: !shift, t: 'Tu gardes l\'attention sur l\'autre (pas de « moi aussi » d\'entrée)' },
      { ok: q, t: 'Tu poses une question de relance' },
      { ok: /!|oh|waouh|génial|bravo|super|trop bien|incroyable|mince|aïe|dur|peur|content|félicit/.test(t), t: 'Tu réagis à son émotion' },
    ];
    return [
      { ok: txt.length >= Math.max(25, r.flat.length * 2), t: 'Tu en dis plus qu\'une réponse minimale' },
      { ok: self, t: 'Tu partages quelque chose de vrai sur toi' },
      { ok: q, t: 'Tu relances avec une question' },
      { ok: !meteo || /météo|chaud/.test(r.them.toLowerCase()), t: 'Tu évites de te réfugier dans la météo' },
    ];
  }
  function StepRewrite(S, st) {
    const r = st.r;
    render(frame(S, `
      ${label('pen', `Reformulation · ${r.support ? 'Écoute' : 'Conversation'}`)}
      <div class="bubble them">${esc(r.them)}</div>
      <div class="bubble me flat">${esc(r.flat)}</div>
      <p class="instr">${r.support
        ? 'Cette réponse ramène le sujet vers toi ou l\'éteint. Réécris-la en <b>réponse de soutien</b> : réagis à son émotion et pose une question sur son histoire.'
        : 'Cette réponse tue la conversation. Réécris-la avec <b>une info vraie sur toi et une question en retour</b>.'}</p>
      <textarea id="txt" class="input" rows="3" placeholder="Ta réponse…"></textarea>
      <div class="footer-cta" id="checkwrap"><button class="btn primary" id="check">Vérifier</button></div>
      <div id="fb"></div>`));
    on('#check', 'click', () => {
      const v = $('#txt').value.trim(); if (!v) { $('#txt').focus(); return; }
      const ch = analyzeRewrite(v, r); const score = ch.filter(c => c.ok).length; const good = score >= ch.length - 1;
      S.xp += 5 * score; if (good) bump(r.support ? 'ecoute' : 'smalltalk', 2);
      buzz(good ? 12 : [20, 40, 20]);
      $('#checkwrap').remove(); $('#txt').disabled = true;
      $('#fb').innerHTML = `
        <ul class="checklist">${ch.map(c => `<li class="${c.ok ? 'ok' : 'ko'}">${ic(c.ok ? 'check' : 'x')}${c.t}</li>`).join('')}</ul>
        ${feedback(good, good ? 'Excellente reformulation' : 'Bonne base, tu peux aller plus loin', `Exemple : « ${esc(r.sample)} »`, '<p class="fb-meta">Vérification automatique par mots-clés : fie-toi surtout à l\'exemple.</p>')}
        ${continueBtn()}`;
      on('#n', 'click', () => next(S));
    });
  }

  // ---- Parle 60 s ----
  let rec = null, speakTimer = null, mediaRec = null, mediaStream = null;
  function stopAudio() {
    clearInterval(speakTimer);
    if (rec) { try { rec.onend = null; rec.stop(); } catch { } rec = null; }
    if (mediaRec && mediaRec.state !== 'inactive') { try { mediaRec.stop(); } catch { } }
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
  }
  function countFillers(text) {
    const t = ' ' + text.toLowerCase().replace(/[’]/g, "'").replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ') + ' ';
    let n = 0; const found = {};
    for (const f of FILLERS) {
      const m = t.match(new RegExp(`(?<![\\p{L}'])(?:${f.pat})(?![\\p{L}])`, 'gu'));
      if (m) { n += m.length; found[f.label] = m.length; }
    }
    return { n, found };
  }

  // Met en évidence les mots-béquilles dans la transcription en direct.
  function highlightFillers(text) {
    let out = esc(text);
    for (const f of FILLERS) out = out.replace(new RegExp(`(?<![\\p{L}'])(${f.pat})(?![\\p{L}])`, 'giu'), '<mark>$1</mark>');
    return out;
  }
  function StepSpeak(S, st) {
    const NSR = nativeSpeechClass();
    const SR = NSR || window.SpeechRecognition || window.webkitSpeechRecognition;
    // Sur Android, le moteur vocal et l'enregistreur se disputent le micro : on privilégie l'analyse vocale.
    const canRec = !NSR && !!(navigator.mediaDevices && window.MediaRecorder);
    render(frame(S, `
      ${label('mic', 'Parle 60 secondes')}
      <h2 class="title">${esc(st.prompt.t)}</h2>
      <p class="tip">${ic('bulb')}<span>${esc(st.prompt.tip)}</span></p>
      <div class="mic">
        <div class="wave" id="wave" aria-hidden="true">${[30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 25].map((h, k) => `<i style="height:${h}%;animation-delay:${(k % 5) * .09}s"></i>`).join('')}</div>
        <p class="timer" id="t">1:00</p>
        <div class="timebar"><i id="ring"></i></div>
        <button id="mic" class="mic-btn" aria-label="Démarrer l'enregistrement"><span class="mic-core" id="micic">${ic('mic')}</span></button>
        <p class="note center" id="mhint">Appuie pour commencer. Quand tu cherches tes mots, fais une pause plutôt qu'un « euh ».</p>
      </div>
      ${SR ? '' : '<p class="note center">Reconnaissance vocale indisponible sur ce navigateur (essaie Chrome, Edge ou Safari) : tu compteras tes « euh » toi-même.</p>'}
      <p id="live" class="live"></p>
      <div id="fb"></div>
      <button class="btn ghost" id="skip">Passer cet exercice</button>`));
    let running = false, left = 60, transcript = '', interim = '', chunks = [], startedAt = 0;
    const $t = $('#t'), $live = $('#live'), $ring = $('#ring');

    const finish = () => {
      if (!running) return; running = false;
      const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      clearInterval(speakTimer);
      if (rec) { try { rec.onend = null; rec.stop(); } catch { } rec = null; }
      $('#mic').classList.remove('rec'); $('#wave').classList.remove('on'); $('#mic').disabled = true; $('#micic').innerHTML = ic('check');
      $('#mhint').textContent = 'Terminé.';
      $('#skip')?.remove();
      const afterAudio = url => {
        if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
        const spoken = (transcript + ' ' + interim).trim();
        if (SR && spoken.split(/\s+/).length >= 5) speakResult(S, spoken, secs, url);
        else manualResult(S, url);
      };
      if (mediaRec && mediaRec.state !== 'inactive') {
        mediaRec.onstop = () => afterAudio(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: mediaRec.mimeType || 'audio/webm' })) : null);
        mediaRec.stop();
      } else afterAudio(null);
    };

    on('#mic', 'click', async () => {
      if (running) { finish(); return; }
      running = true; startedAt = Date.now(); buzz(10);
      $('#mic').classList.add('rec'); $('#wave').classList.add('on'); $('#micic').innerHTML = ic('stop'); $('#mhint').textContent = 'Appuie pour arrêter.';
      if (canRec) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRec = new MediaRecorder(mediaStream); chunks = [];
          mediaRec.ondataavailable = e => e.data.size && chunks.push(e.data);
          mediaRec.start();
        } catch { mediaRec = null; }
      }
      if (SR) {
        rec = new SR(); rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = true;
        rec.onresult = ev => {
          interim = '';
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const r = ev.results[i]; if (r.isFinal) transcript += ' ' + r[0].transcript; else interim += r[0].transcript;
          }
          $live.innerHTML = highlightFillers((transcript + ' ' + interim).trim().split(/\s+/).slice(-22).join(' '));
        };
        rec.onerror = () => { };
        rec.onend = () => { if (running && rec) { try { rec.start(); } catch { } } };
        try { rec.start(); } catch { }
      }
      speakTimer = setInterval(() => {
        left--; $t.textContent = fmt(Math.max(0, left));
        $ring.style.width = `${((60 - left) / 60) * 100}%`;
        if (left <= 0) finish();
      }, 1000);
    });
    on('#skip', 'click', () => { stopAudio(); next(S); });
  }

  // Réécoute avec « préparation cognitive » (Harvey, Clark, Ehlers & Rapee, 2000).
  function playbackBlock(url) {
    if (!url) return '';
    return `<article class="replay" id="replay">
      ${label('head', 'Réécoute-toi')}
      <p class="note">D'abord, note comment tu penses avoir sonné. Puis écoute-toi comme si c'était un inconnu : on se juge souvent plus sévèrement que les autres ne nous jugent.</p>
      <p class="field-label">Avant d'écouter, je pense avoir sonné…</p>${scale('pre', 'Très mal', 'Très bien')}
      <div id="player" hidden><audio controls src="${url}"></audio>
      <p class="field-label">Après écoute, honnêtement</p>${scale('post', 'Très mal', 'Très bien')}<p id="rgap" class="rgap"></p></div>
    </article>`;
  }
  function wirePlayback() {
    let pre = null;
    wireScale('pre', v => { pre = v; $('#player').hidden = false; });
    wireScale('post', v => {
      const d = v - pre;
      $('#rgap').innerHTML = d > 0 ? `<b class="pos">+${d}</b> Tu sonnes mieux que tu ne le pensais.` : d === 0 ? 'Ta perception était juste.' : 'Note un point précis à améliorer pour la prochaine fois.';
    });
  }

  function speakResult(S, text, secs, url) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const { n, found } = countFillers(text);
    const foundTxt = Object.keys(found).length ? `Repérés : ${Object.entries(found).map(([k, v]) => `« ${esc(k)} » ×${v}`).join(', ')}.` : 'Aucune béquille repérée.';
    if (secs < 20) {
      S.xp += 10;
      $('#fb').innerHTML = `<div class="stats">${stat(words, 'mots')}${stat(n, 'béquilles')}${stat(secs + '<small>s</small>', 'durée')}</div>
        ${feedback(false, 'Prise trop courte pour mesurer ton débit', `${foundTxt} Essaie de tenir au moins 20 secondes, idéalement les 60 : c'est en continuant malgré les blancs qu'on progresse.`)}
        ${playbackBlock(url)}${continueBtn()}`;
      if (url) wirePlayback();
      on('#n', 'click', () => next(S)); return;
    }
    const perMin = Math.round(n / secs * 60 * 10) / 10;
    const wpm = Math.round(words / secs * 60);
    const hist = state.progress.fillerHistory;
    const prev = hist.length ? avg(hist.slice(-5).map(h => h.perMin)) : null;
    if (words > 30) hist.push({ d: today(), perMin, wpm });
    const better = prev !== null && perMin < prev;
    S.xp += 20 + (better ? 10 : 0); bump('clarte', better ? 3 : 1); bump('assurance', 1);
    const pace = wpm > 200 ? 'Débit rapide : marque une pause à la fin de chaque idée.' : wpm < 100 ? 'Débit posé. Les blancs s\'entendent moins que tu ne le crois.' : 'Débit confortable.';
    $('#fb').innerHTML = `
      <div class="stats">${stat(words, 'mots')}${stat(perMin, 'béquilles / min')}${stat(wpm, 'mots / min')}</div>
      ${feedback(true, prev === null ? 'Première mesure enregistrée' : better ? 'Mieux que ta moyenne récente' : 'Mesure enregistrée',
        `${foundTxt} ${prev === null ? 'Les prochaines seront comparées à celle-ci.' : better ? `Ta moyenne récente était de ${prev.toFixed(1)} par minute.` : `Ta moyenne récente : ${prev.toFixed(1)} par minute. L'objectif est de progresser par rapport à toi, pas d'atteindre zéro.`}`,
        `<p class="fb-meta">${pace} Chiffres indicatifs : la reconnaissance vocale rate parfois des « euh ».</p>`)}
      ${playbackBlock(url)}${continueBtn()}`;
    if (url) wirePlayback();
    on('#n', 'click', () => next(S));
  }
  function manualResult(S, url) {
    $('#fb').innerHTML = `${playbackBlock(url)}
      <p class="field-label">Combien de « euh », « du coup », « en fait » as-tu remarqué&nbsp;?</p>
      <div class="seg" id="self">${['0 à 2', '3 à 5', '6 à 10', 'Plus de 10'].map((l, k) => `<button data-k="${k}">${l}</button>`).join('')}</div>`;
    if (url) wirePlayback();
    on('#self button', 'click', e => {
      const k = +e.currentTarget.dataset.k; S.xp += 20; bump('clarte', 1); bump('assurance', 1);
      $app.querySelectorAll('#self button').forEach(b => { b.disabled = true; b.classList.toggle('on', +b.dataset.k === k); });
      $('#self').insertAdjacentHTML('afterend', feedback(true, 'Bravo d\'avoir parlé à voix haute', 'Demain, vise une tranche de moins en remplaçant des « euh » par des pauses.') + continueBtn());
      on('#n', 'click', () => next(S));
    });
  }

  function Finish(S) {
    clearInterval(clockTimer); stopAudio();
    const secs = Math.round((Date.now() - S.t0) / 1000);
    if (S.solo) {
      state.progress.xp += S.xp; save();
      render(`<section class="screen result"><span class="result-ic">${ic('check')}</span><h2 class="title">Bien joué.</h2>
        <p class="lead">${S.total ? `${S.correct} bonne${S.correct > 1 ? 's' : ''} réponse${S.correct > 1 ? 's' : ''} sur ${S.total}.` : 'Exercice terminé.'}</p>
        <div class="footer-cta"><button class="btn primary" id="b">Continuer</button></div></section>`);
      on('#b', 'click', Practice); setBack(Practice); return;
    }
    const before = streakAlive();
    markDay(Math.max(1, Math.round(secs / 60)));
    state.progress.xp += S.xp; save(); buzz([10, 60, 10]);
    const st = state.progress.streak, pm = pendingMission();
    render(`
      <section class="screen result">
        <span class="result-ic big">${ic('flame')}<b>${state.progress.streak}</b></span>
        <h1 class="display">Séance terminée.</h1>
        <p class="lead">${S.correct} bonne${S.correct > 1 ? 's' : ''} réponse${S.correct > 1 ? 's' : ''} sur ${S.total}, en ${fmt(secs)}.</p>
        <div class="stats">${stat(st, st > 1 ? 'jours d\'affilée' : 'jour d\'affilée')}${stat('+' + S.xp, 'points')}${stat(overall(), 'score')}</div>
        ${st > before && st > 1 ? '<p class="note center">Série prolongée. La régularité compte plus que la durée.</p>' : ''}
        ${pm ? `<article class="mission">${label('compass', 'Ton défi')}<p class="plan">« ${esc(pm.plan)} »</p><p class="note">Reviens dans l'app après pour comparer avec ta prédiction.</p></article>` : ''}
        <div class="footer-cta"><button class="btn primary" id="home">Retour à l'accueil</button></div>
      </section>`);
    on('#home', 'click', Home);
    setBack(Home);
  }

  // ================= ENTRAÎNEMENT LIBRE =================
  const row = (attrs, icon, title, sub, right = ic('chev')) => `<button class="row" ${attrs}><span class="row-ic">${ic(icon)}</span><span class="row-txt"><b>${title}</b><small>${sub}</small></span>${right}</button>`;
  function Practice() {
    showTabs('practice');
    render(`
      <section class="screen">
        <h1 class="display sm">S'entraîner</h1>
        <p class="lead sm">Des exercices à la carte, en plus de ta séance du jour.</p>
        <div class="group">
          ${row('data-a="scen"', 'chat', 'Situations', `${SCENARIOS.length} scènes : ascenseur, chef, rendez-vous…`)}
          ${row('data-a="rew"', 'pen', 'Reformulation', 'Transformer une réponse plate')}
          ${row('data-a="speak"', 'mic', 'Parle 60 secondes', 'Béquilles, débit, réécoute')}
          ${row('data-a="recall"', 'recall', 'Réviser', 'Questions sur les leçons déjà vues')}
          ${row('data-a="mission"', 'compass', 'Défi terrain', pendingMission() ? 'Un défi est en cours' : 'Choisir un défi réel')}
        </div>
        <h3 class="section">Bibliothèque</h3>
        ${Object.keys(SKILLS).map(k => `<p class="group-label">${ic(SKILL_IC[k])}${SKILLS[k].name}</p><div class="group">${LESSONS.filter(l => l.skill === k).map(l =>
          row(`data-l="${l.id}"`, state.progress.lessonsDone.includes(l.id) ? 'check' : 'book', esc(l.title), evTag(l.level))).join('')}</div>`).join('')}
      </section>`);
    const solo = steps => { showTabs(null); runStep({ steps, i: 0, t0: Date.now(), correct: 0, total: 0, xp: 0, solo: true }); };
    on('[data-a]', 'click', e => {
      const a = e.currentTarget.dataset.a;
      if (a === 'scen') solo(shuffle(SCENARIOS).slice(0, 5).map(s => ({ type: 'scenario', s })));
      if (a === 'rew') solo(shuffle(REWRITES).slice(0, 3).map(r => ({ type: 'rewrite', r })));
      if (a === 'speak') solo([{ type: 'speak', prompt: pick(PROMPTS) }]);
      if (a === 'recall') {
        const seen = state.progress.lessonsDone.map(lessonById).filter(Boolean);
        if (!seen.length) { dialog({ title: 'Rien à réviser pour l\'instant', body: 'Les révisions portent sur les leçons que tu as déjà vues. Fais d\'abord ta séance du jour.', confirm: 'Compris', icon: 'recall' }); return; }
        solo(shuffle(seen).slice(0, 5).map(l => ({ type: 'recall', lesson: l })));
      }
      if (a === 'mission') { if (pendingMission()) Home(); else MissionPlan(null, Home); }
    });
    on('[data-l]', 'click', e => solo([{ type: 'lesson', lesson: lessonById(e.currentTarget.dataset.l) }]));
  }

  // ================= PROFIL =================
  function Profile() {
    showTabs('profile');
    const p = state.profile, pr = state.progress;
    const total = Object.values(pr.days).reduce((a, b) => a + b, 0);
    const journal = state.missions.filter(m => m.status !== 'planned').slice(-8).reverse();
    const delta = {}; for (const k of Object.keys(SKILLS)) delta[k] = p.levels[k] - (p.start?.[k] ?? p.levels[k]);
    render(`
      <section class="screen">
        <div class="profile-head"><span class="avatar">${esc((p.name || 'T')[0].toUpperCase())}</span><div><h1 class="display sm">${p.name ? esc(p.name) : 'Mon profil'}</h1><p class="note">Depuis le ${new Date(p.createdAt + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p></div></div>
        <div class="stats">${stat(streakAlive(), 'série')}${stat(total, 'minutes')}${stat(doneMissions().length, 'défis réussis')}</div>
        <h3 class="section">Progression depuis le départ</h3>
        ${skillRows(p.levels, { delta })}
        ${pr.fillerHistory.length ? `<h3 class="section">Béquilles par minute</h3><div class="chart">${pr.fillerHistory.length > 1 ? sparkline(pr.fillerHistory.map(h => h.perMin)) : ''}<p class="note">${pr.fillerHistory.length > 1 ? `Dernières mesures : ${pr.fillerHistory.slice(-6).map(h => h.perMin).join(' · ')}` : `Première mesure : ${pr.fillerHistory[0].perMin} par minute. La courbe apparaîtra dès la deuxième.`}</p></div>` : ''}
        ${journal.length ? `<h3 class="section">Journal des défis</h3><ul class="journal">${journal.map(m => `<li class="${m.status}"><span class="jdot">${ic(m.status === 'done' ? 'check' : 'x')}</span><div><p>${esc(m.t)}</p>${m.status === 'done' ? `<small>Prévu ${m.predOk}/10, réel ${m.ok}/10 · stress ${m.predAnx} → ${m.anx}</small>` : '<small>Non réalisé</small>'}${m.note ? `<small class="jnote">« ${esc(m.note)} »</small>` : ''}</div></li>`).join('')}</ul>` : ''}
        <h3 class="section">Réglages</h3>
        <div class="group">
          ${isNative()
            ? `<button class="row" id="apk"><span class="row-ic">${ic('download')}</span><span class="row-txt"><b>${latestRelease && newer(latestRelease.version, BUILD.version) ? `Mettre à jour vers la ${esc(latestRelease.version)}` : 'Réinstaller la dernière version'}</b><small id="apkst">Installée : ${esc(BUILD.version)}${latestRelease ? ` · dernière : ${esc(latestRelease.version)}` : ''}</small></span>${ic('chev')}</button>`
            : `<a class="row" id="apk" href="${esc(latestRelease ? latestRelease.url : APK_URL)}"><span class="row-ic">${ic('download')}</span><span class="row-txt"><b>Télécharger l'app Android</b><small>Fichier APK${latestRelease ? ` · version ${esc(latestRelease.version)}` : ''}</small></span>${ic('chev')}</a>`}
          ${row('id="plan"', 'map', 'Mon plan', 'Profil de départ et 4 semaines')}
          ${row('id="src"', 'library', 'Sources et méthode', 'Toutes les études citées')}
          ${row('id="retake"', 'refresh', 'Refaire le test', 'Recalcule ton profil, efface la progression')}
          ${row('id="reset"', 'trash', 'Tout effacer', 'Supprime tes données de cet appareil')}
        </div>
        <p class="note disclaimer">${esc(DISCLAIMER)}</p>
        <p class="note center version">Talking ${esc(BUILD.version)}</p>
      </section>`);
    if (isNative()) on('#apk', 'click', () => runUpdate(msg => { const st = $('#apkst'); if (st) st.textContent = msg; }));
    on('#plan', 'click', () => Plan(false));
    on('#src', 'click', Sources);
    on('#retake', 'click', async () => {
      if (await dialog({ title: 'Refaire le test ?', body: 'Ton profil sera recalculé et ta progression remise à zéro : série, leçons, défis et mesures.', confirm: 'Refaire le test', cancel: 'Annuler', danger: true, icon: 'refresh' })) Quiz(0, { __hist: [] });
    });
    on('#reset', 'click', async () => {
      if (await dialog({ title: 'Tout effacer ?', body: 'Toutes tes données seront supprimées de ce téléphone. Impossible de revenir en arrière.', confirm: 'Tout effacer', cancel: 'Annuler', danger: true, icon: 'trash' })) { state = fresh(); save(); Welcome(); }
    });
  }
  function sparkline(vals) {
    const v = vals.slice(-20); if (v.length < 2) return '';
    const max = Math.max(...v, 1), w = 300, h = 64;
    const pts = v.map((x, i) => [(i / (v.length - 1)) * w, h - (x / max) * (h - 12) - 6]);
    const line = pts.map(p => p.join(',')).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" class="spark" preserveAspectRatio="none"><polygon points="0,${h} ${line} ${w},${h}" class="area"/><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }

  function Sources() {
    showTabs('profile');
    render(`
      <section class="screen">
        <button class="link-back" id="b">${ic('left')}Profil</button>
        <h1 class="display sm">Sources et méthode</h1>
        <h3 class="section">La méthode</h3>
        <ul class="method">
          <li><b>Pratique délibérée.</b> Des exercices courts avec un retour immédiat et expliqué.</li>
          <li><b>Récupération et espacement.</b> Se tester à J+1, J+3, J+7… retient mieux que relire (Roediger & Karpicke, 2006 ; Cepeda et al., 2006).</li>
          <li><b>Exposition graduée.</b> Le cœur des TCC du trac social (Clark & Wells, 1995) : prédire, tester, comparer.</li>
          <li><b>Intentions de mise en œuvre.</b> « Quand…, je… » (Gollwitzer & Sheeran, 2006).</li>
          <li><b>Réécoute préparée.</b> Prédire puis s'écouter « comme un autre » améliore l'image qu'on a de sa prestation (Harvey et al., 2000). Effet sur l'anxiété elle-même : non démontré.</li>
        </ul>
        <h3 class="section">Niveaux de preuve</h3>
        <div class="legend">${Object.keys(EVIDENCE).map(evTag).join('')}</div>
        <p class="note">On distingue ce qui est démontré, ce qui est prometteur, les techniques de formateurs, et les mythes. Les scores de l'app sont indicatifs.</p>
        <h3 class="section">Références par leçon</h3>
        ${LESSONS.map(l => `<div class="ref"><div class="ref-head"><b>${esc(l.title)}</b>${evTag(l.level)}</div><ol>${l.src.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>`).join('')}
        <div class="ref"><div class="ref-head"><b>Test initial</b></div><ol><li>Connor, Kobak, Churchill, Katzelnick & Davidson (2001). Mini-SPIN: A brief screening assessment for generalized social anxiety disorder. Depression and Anxiety, 14(2).</li></ol></div>
        <p class="note disclaimer">${esc(DISCLAIMER)}</p>
      </section>`);
    on('#b', 'click', Profile);
    setBack(Profile);
  }

  // ---------- démarrage ----------
  // Pas de service worker dans l'app native : les fichiers viennent de l'APK.
  if (!isNative() && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  showBanner();
  checkUpdate();
  state.profile ? Home() : Welcome();
})();
