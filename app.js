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

  // ---------- état ----------
  const fresh = () => ({
    profile: null, // { name, goal, minutes, levels, start, focus, spin, createdAt }
    progress: { xp: 0, streak: 0, lastDay: null, days: {}, lessonsDone: [], sessions: 0, fillerHistory: [] },
    srs: {},        // lessonId -> { box, due }
    missions: [],   // { id, t, when, plan, predAnx, predOk, plannedOn, status:'planned'|'done'|'skipped', anx, ok, note, doneOn }
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
  const render = html => { $app.innerHTML = html; window.scrollTo(0, 0); };
  const on = (sel, ev, fn) => $app.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));
  const $ = sel => $app.querySelector(sel);
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const lessonById = id => LESSONS.find(l => l.id === id);
  const badge = lvl => `<span class="ev ev-${lvl}">${EVIDENCE[lvl].icon} ${EVIDENCE[lvl].label}</span>`;

  function bump(skill, n) { const L = state.profile.levels; L[skill] = clamp((L[skill] || 0) + n, 0, 100); }
  function overall() { const L = state.profile.levels; const ks = Object.keys(SKILLS); return Math.round(avg(ks.map(k => L[k] || 0))); }
  function weakest() { const L = state.profile.levels; return Object.keys(SKILLS).sort((a, b) => L[a] - L[b]); }
  function streakAlive() { const p = state.progress; if (!p.lastDay) return 0; return daysBetween(p.lastDay, today()) <= 1 ? p.streak : 0; }
  function markDay(minutes) {
    const p = state.progress, t = today();
    if (p.lastDay !== t) { p.streak = p.lastDay && daysBetween(p.lastDay, t) === 1 ? p.streak + 1 : 1; p.lastDay = t; }
    p.days[t] = (p.days[t] || 0) + minutes; p.sessions++;
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

  // ---------- navigation ----------
  function showTabs(active) {
    $tabs.hidden = !active;
    $tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.tab === active));
  }
  $tabs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    ({ home: Home, practice: Practice, profile: Profile })[b.dataset.tab]();
  });

  // ================= ONBOARDING =================
  function Welcome() {
    showTabs(null);
    render(`
      <section class="screen center hero">
        <div class="logo">💬</div>
        <h1>Arrête de parler <s>de la météo</s>.</h1>
        <p class="lead">Tu n'es pas mauvais·e avec les gens : tu bloques, c'est tout. Et ça s'entraîne.<br>
        <b>~9 minutes par jour</b> de techniques issues de la recherche en psychologie, et de vrais défis dans ta vie.</p>
        <div class="proofs">
          <div><b>🔬</b><span>Chaque technique est sourcée</span></div>
          <div><b>🔁</b><span>Rappels espacés pour retenir</span></div>
          <div><b>🌍</b><span>Défis réels, progressifs</span></div>
        </div>
        <div class="card left fact"><p class="step">Le saviez-vous ?</p>
          <p>Après une conversation avec un inconnu, on sous-estime presque toujours à quel point l'autre nous a apprécié.</p>
          <p class="src">Boothby et al., <i>Psychological Science</i>, 2018</p></div>
        <button class="btn primary big" id="go">Faire le test (2 min)</button>
        <p class="muted small">Gratuit · Sans compte · Tes données restent sur ton appareil</p>
      </section>`);
    on('#go', 'click', () => Quiz(0, { __hist: [] }));
  }

  const TOTAL_STEPS = QUIZ.length + 3;
  const bar = i => `<div class="progress"><div style="width:${(i / TOTAL_STEPS) * 100}%"></div></div>`;

  function Quiz(i, need) {
    showTabs(null);
    if (i >= QUIZ.length) return Spin(need);
    const q = QUIZ[i];
    render(`
      <section class="screen">
        ${bar(i)}
        <p class="step">Tes réflexes · ${i + 1} / ${QUIZ.length}</p>
        <h2>${esc(q.q)}</h2>
        <div class="choices">${q.options.map((o, k) => `<button class="choice" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
        ${i > 0 ? '<button class="btn ghost" id="back">← Retour</button>' : ''}
      </section>`);
    on('.choice', 'click', e => {
      const o = q.options[+e.currentTarget.dataset.k];
      const n = Object.assign({}, need, { __hist: need.__hist.concat([o.w]) });
      for (const [k, v] of Object.entries(o.w)) n[k] = (n[k] || 0) + v;
      Quiz(i + 1, n);
    });
    on('#back', 'click', () => {
      const hist = need.__hist.slice(); const last = hist.pop() || {};
      const n = Object.assign({}, need, { __hist: hist });
      for (const [k, v] of Object.entries(last)) n[k] -= v;
      Quiz(i - 1, n);
    });
  }

  function Spin(need) {
    const ans = [null, null, null];
    render(`
      <section class="screen">
        ${bar(QUIZ.length)}
        <p class="step">Ton trac · 3 questions</p>
        <h2>À quel point ces phrases te décrivent ?</h2>
        <p class="muted small">Questionnaire Mini-SPIN (Connor et al., 2001), utilisé pour repérer le trac social. Ce n'est pas un diagnostic.</p>
        ${MINISPIN.map((s, i) => `<div class="card spin"><p>${esc(s)}</p>
          <div class="scale" data-i="${i}">${MINISPIN_SCALE.map((l, v) => `<button data-v="${v}" title="${l}"><b>${v}</b><span>${l}</span></button>`).join('')}</div></div>`).join('')}
        <button class="btn primary big" id="ok" disabled>Continuer</button>
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
    render(`
      <section class="screen">
        ${bar(QUIZ.length + 1)}
        <h2>Où veux-tu être plus à l'aise ?</h2>
        <div class="choices grid2">${GOALS.map(g => `<button class="choice tile" data-g="${g.id}"><span class="em">${g.icon}</span><b>${g.t}</b><small>${g.d}</small></button>`).join('')}</div>
      </section>`);
    on('.choice', 'click', e => Setup(need, spin, e.currentTarget.dataset.g));
  }

  function Setup(need, spin, goal) {
    render(`
      <section class="screen">
        ${bar(QUIZ.length + 2)}
        <h2>Dernière chose</h2>
        <label class="field">Ton prénom <input id="name" maxlength="30" placeholder="Optionnel" autocomplete="given-name"></label>
        <p class="label">Combien de temps par jour ?</p>
        <div class="seg" id="mins">${[5, 9, 15].map(m => `<button data-m="${m}" class="${m === 9 ? 'on' : ''}">${m} min</button>`).join('')}</div>
        <p class="muted small">Des séances courtes et régulières font mieux retenir que de longues séances espacées (effet d'espacement).</p>
        <button class="btn primary big" id="ok">Voir mon plan</button>
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
        // Un trac élevé pèse sur l'assurance.
        if (spin >= 6) levels.assurance = clamp(levels.assurance - 8, 10, 80);
        state = fresh();
        state.profile = { name, goal, minutes, levels, start: Object.assign({}, levels), spin, createdAt: today() };
        state.profile.focus = weakest().slice(0, 3);
        state.missionLevel = spin >= 9 ? 1 : spin >= 5 ? 1 : 2;
        save();
        Plan(true);
      });
    });
  }

  function Analyzing(done) {
    render(`<section class="screen center"><div class="spinner"></div><h2>Construction de ton plan…</h2>
      <ul class="checks" id="chk"><li>Tes réflexes en conversation</li><li>Ton niveau de trac</li><li>Tes premiers défis</li></ul></section>`);
    $app.querySelectorAll('#chk li').forEach((li, i) => setTimeout(() => li.classList.add('ok'), 400 + i * 450));
    setTimeout(done, 1900);
  }

  function spinMessage(spin) {
    if (spin >= 6) return `<div class="card warnbox"><b>Ton score de trac est élevé (${spin}/12).</b>
      <p>Chez l'adulte, un score de 6 ou plus au Mini-SPIN peut signaler une anxiété sociale marquée. Ce n'est pas un diagnostic, et c'est très courant. Talking peut t'aider à t'entraîner. Mais si ce trac te fait éviter des choses importantes, un psychologue formé aux TCC (thérapies cognitives et comportementales) est le traitement de référence, et il marche bien.</p></div>`;
    if (spin >= 3) return `<div class="card"><b>Trac modéré (${spin}/12)</b><p class="muted">Normal : la plupart des gens ressentent un peu de trac social. Les défis progressifs sont faits pour ça.</p></div>`;
    return `<div class="card"><b>Trac faible (${spin}/12)</b><p class="muted">Tu peux te concentrer sur les techniques et viser des défis plus ambitieux.</p></div>`;
  }

  function Plan(first) {
    showTabs(first ? null : 'profile');
    const p = state.profile; const L = p.levels; const f = p.focus;
    const goal = GOALS.find(g => g.id === p.goal);
    const weeks = [
      { t: 'Débloquer', d: `Focus ${SKILLS[f[0]].name}. Défis de niveau ${state.missionLevel} : petites expositions quotidiennes.` },
      { t: 'Consolider', d: `Focus ${SKILLS[f[1]].name}. Les rappels espacés fixent les techniques de la semaine 1.` },
      { t: 'S\'affirmer', d: `Focus ${SKILLS[f[2]].name}. Défis plus ambitieux selon tes réussites.` },
      { t: 'Ancrer', d: 'Tout combiner en situation réelle et mesurer ton écart prédiction / réalité.' },
    ];
    render(`
      <section class="screen">
        <p class="step">${first ? 'Ton résultat' : 'Ton plan'}</p>
        <h2>${p.name ? esc(p.name) + ', voici' : 'Voici'} ton profil</h2>
        <div class="card score">
          <div class="ring" style="--v:${overall()}"><span>${overall()}</span></div>
          <div><b>Score de départ</b><p class="muted small">Objectif : ${goal.icon} ${goal.t.toLowerCase()} · ${p.minutes} min/jour</p></div>
        </div>
        <div class="card">${Object.entries(SKILLS).map(([k, s]) => `
          <div class="bar"><span>${s.icon} ${s.name}${f.includes(k) ? ' <em class="tag">priorité</em>' : ''}</span>
          <div class="track"><div style="width:${L[k]}%"></div></div><b>${L[k]}</b></div>`).join('')}
          <p class="muted small">Score indicatif tiré de tes réponses : il sert à choisir tes priorités, ce n'est pas une mesure scientifique.</p>
        </div>
        ${spinMessage(p.spin ?? 0)}
        <h3>Ton plan sur 4 semaines</h3>
        <ol class="weeks">${weeks.map((w, i) => `<li><b>Semaine ${i + 1} · ${w.t}</b><span>${esc(w.d)}</span></li>`).join('')}</ol>
        <div class="card"><b>Comment ça marche</b>
          <ul class="how"><li><b>Apprendre</b> une technique sourcée (2 min)</li><li><b>Pratiquer</b> sur des situations, à l'écrit et à l'oral (5 min)</li>
          <li><b>Se souvenir</b> : on te réinterroge à J+1, J+3, J+7…</li><li><b>Oser</b> : un petit défi réel, et tu compares ta prédiction à ce qui s'est vraiment passé</li></ul></div>
        <button class="btn primary big" id="start">${first ? 'Commencer ma 1ʳᵉ séance' : 'Retour'}</button>
      </section>`);
    on('#start', 'click', () => first ? Session() : Profile());
  }

  // ================= ACCUEIL =================
  function Home() {
    showTabs('home');
    const p = state.profile, pr = state.progress;
    const doneToday = (pr.days[today()] || 0) > 0;
    const week = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = dayKey(d);
      return { l: 'DLMMJVS'[d.getDay()], on: !!pr.days[k], t: k === today() };
    });
    const lesson = nextLesson();
    const pm = pendingMission();
    const dues = dueRecalls(9).length;
    render(`
      <section class="screen">
        <header class="top"><div><p class="muted small">${greeting()}</p><h2>${p.name ? esc(p.name) : 'Prêt·e à parler ?'}</h2></div>
          <div class="streak" title="Jours d'affilée">🔥 <b>${streakAlive()}</b></div></header>
        <div class="weekrow">${week.map(d => `<div class="${d.on ? 'on' : ''} ${d.t ? 'today' : ''}"><span>${d.l}</span><i>${d.on ? '✓' : ''}</i></div>`).join('')}</div>
        ${pm ? missionCard(pm) : ''}
        <div class="card session ${doneToday ? 'done' : ''}">
          <p class="step">${doneToday ? 'Séance du jour terminée ✓' : 'Séance du jour'} · ~${p.minutes} min</p>
          <h3>${SKILLS[lesson.skill].icon} ${esc(lesson.title)}</h3>
          <ul class="mini">${dues ? `<li>🔁 ${Math.min(dues, 2)} rappel${dues > 1 ? 's' : ''}</li>` : ''}<li>📘 Leçon</li><li>🎭 2 situations</li><li>✍️ Reformulation</li><li>🎙️ Parle 60 s</li><li>🌍 Défi terrain</li></ul>
          <button class="btn primary big" id="go">${doneToday ? 'Refaire une séance' : 'Commencer'}</button>
        </div>
        ${predictionCard()}
        <div class="stats">
          <div><b>${overall()}</b><span>Score</span></div>
          <div><b>${doneMissions().length}</b><span>Défis réussis</span></div>
          <div><b>${pr.lessonsDone.length}/${LESSONS.length}</b><span>Leçons</span></div>
        </div>
      </section>`);
    on('#go', 'click', () => Session());
    wireMissionCard();
  }
  function greeting() { const h = new Date().getHours(); return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'; }

  function missionCard(m) {
    const fresh = m.plannedOn === today();
    return `<div class="card mission">
      <p class="step">🌍 Ton défi en cours · niveau ${m.lvl}</p>
      <p class="mt">${esc(m.t)}</p>
      <p class="plan">« ${esc(m.plan)} »</p>
      ${fresh ? '<p class="muted small">Reviens ici une fois que tu l\'as fait.</p>' : ''}
      <div class="row2"><button class="btn primary" id="mdone">C'est fait !</button><button class="btn" id="mskip">Pas fait</button></div>
    </div>`;
  }
  function wireMissionCard() {
    on('#mdone', 'click', () => MissionReport(pendingMission()));
    on('#mskip', 'click', () => MissionSkip(pendingMission()));
  }

  function predictionCard() {
    const d = doneMissions().filter(m => m.ok != null && m.predOk != null);
    if (d.length < 1) return '';
    const gapOk = avg(d.map(m => m.ok - m.predOk));
    const gapAnx = avg(d.map(m => m.anx - m.predAnx));
    return `<div class="card insight"><p class="step">Prédiction vs réalité · ${d.length} défi${d.length > 1 ? 's' : ''}</p>
      <p>En moyenne, tes défis se sont passés <b>${gapOk >= 0 ? '+' : ''}${gapOk.toFixed(1)}</b> points ${gapOk >= 0 ? 'mieux' : 'moins bien'} que prévu,
      avec un stress <b>${gapAnx <= 0 ? '' : '+'}${gapAnx.toFixed(1)}</b> par rapport à ta prédiction (sur 10).</p>
      ${gapOk > 0 ? '<p class="muted small">C\'est exactement ce que montre la recherche : on prédit les interactions plus mal qu\'elles ne se passent. Tes propres données le confirment.</p>' : '<p class="muted small">Continue : c\'est en accumulant des expériences que les prédictions se recalibrent.</p>'}
    </div>`;
  }

  function nextLesson() {
    const done = state.progress.lessonsDone;
    const order = state.profile.focus.concat(weakest());
    for (const sk of order) { const l = LESSONS.find(x => x.skill === sk && !done.includes(x.id)); if (l) return l; }
    const any = LESSONS.find(x => !done.includes(x.id));
    return any || pick(LESSONS);
  }

  // ================= DÉFIS : bilan =================
  function MissionReport(m) {
    showTabs(null);
    let anx = null, ok = null;
    render(`
      <section class="screen">
        <p class="step">🌍 Bilan du défi</p>
        <h2>Bravo d'avoir osé !</h2>
        <p class="muted">${esc(m.t)}</p>
        <p class="label">Ton stress réel pendant le défi (0 = aucun, 10 = maximum)</p>${slider('anx')}
        <p class="label">Comment ça s'est passé en vrai ? (0 = très mal, 10 = très bien)</p>${slider('ok')}
        <label class="field">Une chose que tu as remarquée (optionnel)<textarea id="note" rows="2" placeholder="Ex : il m'a posé plein de questions en retour"></textarea></label>
        <button class="btn primary big" id="save" disabled>Comparer à ma prédiction</button>
      </section>`);
    wireSlider('anx', v => { anx = v; check(); }); wireSlider('ok', v => { ok = v; check(); });
    function check() { $('#save').disabled = anx === null || ok === null; }
    on('#save', 'click', () => {
      Object.assign(m, { status: 'done', anx, ok, note: $('#note').value.trim(), doneOn: today() });
      state.progress.xp += 40; bump('assurance', 3); bump('smalltalk', 1);
      adjustMissionLevel(); save();
      const dOk = ok - m.predOk, dAnx = anx - m.predAnx;
      render(`
        <section class="screen center">
          <div class="confetti">🌟</div><h2>Prédiction vs réalité</h2>
          <div class="cmp"><div><span>Prévu</span><b>${m.predOk}/10</b><small>stress ${m.predAnx}/10</small></div>
          <div class="arrow">→</div><div><span>Réel</span><b>${ok}/10</b><small>stress ${anx}/10</small></div></div>
          <p class="lead">${dOk > 0 ? `Ça s'est passé <b>mieux que prévu</b> (+${dOk}).` : dOk === 0 ? 'Exactement comme prévu.' : 'Moins bien que prévu cette fois. Ça arrive, et tu l\'as fait quand même.'}
          ${dAnx < 0 ? ` Et tu as eu <b>moins peur</b> que ce que tu imaginais.` : ''}</p>
          <p class="muted small">Ce bilan est au cœur des thérapies cognitives et comportementales : on teste ses prédictions dans la réalité au lieu de les croire sur parole.</p>
          <p class="muted small">Niveau de défi actuel : ${state.missionLevel}/4</p>
          <button class="btn primary big" id="h">Continuer</button>
        </section>`);
      on('#h', 'click', Home);
    });
  }
  function MissionSkip(m) {
    showTabs(null);
    render(`
      <section class="screen">
        <p class="step">🌍 Défi non réalisé</p>
        <h2>Pas grave. Qu'est-ce qui a bloqué ?</h2>
        <div class="choices">
          <button class="choice" data-r="occasion">Pas eu l'occasion</button>
          <button class="choice" data-r="peur">J'ai eu trop peur</button>
          <button class="choice" data-r="oubli">J'ai oublié</button>
        </div>
      </section>`);
    on('.choice', 'click', e => {
      const r = e.currentTarget.dataset.r;
      Object.assign(m, { status: 'skipped', reason: r, doneOn: today() });
      adjustMissionLevel(); save();
      const tip = {
        occasion: 'Choisis un défi qui colle à ta journée de demain, avec un moment précis dans le « Quand… ».',
        peur: 'C\'est une info utile, pas un échec. On choisit un défi un cran plus facile : l\'exposition marche quand elle est progressive.',
        oubli: 'Un plan « Quand [moment précis], je [action] » augmente nettement les chances de passer à l\'action. Rends ton « quand » plus concret.',
      }[r];
      if (r === 'peur' && state.missionLevel > 1) { state.missionLevel--; save(); }
      render(`<section class="screen center"><div class="confetti">🧭</div><h2>On ajuste</h2><p class="lead">${esc(tip)}</p>
        <p class="muted small">Prochain défi au niveau ${state.missionLevel}/4.</p>
        <button class="btn primary big" id="n">Choisir un nouveau défi</button><button class="btn ghost" id="h">Plus tard</button></section>`);
      on('#n', 'click', () => MissionPlan(null, Home));
      on('#h', 'click', Home);
    });
  }

  function slider(id) {
    return `<div class="scale11" id="${id}">${[...Array(11)].map((_, v) => `<button data-v="${v}">${v}</button>`).join('')}</div>`;
  }
  function wireSlider(id, cb) {
    on(`#${id} button`, 'click', e => {
      const b = e.currentTarget;
      $app.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('on', x === b));
      cb(+b.dataset.v);
    });
  }

  // ================= DÉFIS : planification =================
  function MissionPlan(S, after) {
    if (pendingMission()) { after(); return; }
    const lvl = state.missionLevel;
    const usedRecently = new Set(state.missions.slice(-6).map(m => m.t));
    let pool = MISSIONS.filter(m => m.lvl === lvl && !usedRecently.has(m.t));
    if (pool.length < 2) pool = MISSIONS.filter(m => m.lvl === lvl);
    const opts = shuffle(pool).slice(0, 2);
    let chosen = null, predAnx = null, predOk = null;
    const html = `
      <p class="step">🌍 Défi terrain · niveau ${lvl}/4</p>
      <h2>Choisis ton défi pour les prochaines 24 h</h2>
      <div class="choices" id="mopts">${opts.map((m, k) => `<button class="choice" data-k="${k}">${esc(m.t)}</button>`).join('')}</div>
      <div id="mform" hidden>
        <p class="label">Ton plan précis : <b>Quand…, je…</b></p>
        <textarea id="plan" rows="2"></textarea>
        <p class="muted small">Formuler « Quand [situation], je [action] » augmente fortement les chances de passer à l'action (Gollwitzer & Sheeran, 2006 : 94 études).</p>
        <p class="label">Ton stress prévu (0–10)</p>${slider('pa')}
        <p class="label">Comment tu penses que ça va se passer (0 = très mal, 10 = très bien)</p>${slider('po')}
        <p class="muted small">Note ta prédiction honnêtement : demain, tu la compareras à la réalité.</p>
        <button class="btn primary big" id="commit" disabled>Je m'engage</button>
      </div>
      ${S ? '' : '<button class="btn ghost" id="cancel">Annuler</button>'}`;
    if (S) { render(frame(S, html)); startClock(S); wireQuit(); } else { showTabs(null); render(`<section class="screen">${html}</section>`); }
    const check = () => { $('#commit').disabled = !chosen || predAnx === null || predOk === null || $('#plan').value.trim().length < 8; };
    on('#mopts .choice', 'click', e => {
      chosen = opts[+e.currentTarget.dataset.k];
      $app.querySelectorAll('#mopts .choice').forEach(b => b.classList.toggle('sel', b === e.currentTarget));
      $('#mform').hidden = false;
      $('#plan').value = `Quand je serai ${chosen.when}, je `;
      $('#plan').focus(); check();
    });
    on('#plan', 'input', check);
    wireSlider('pa', v => { predAnx = v; check(); }); wireSlider('po', v => { predOk = v; check(); });
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
    const pct = (S.i / S.steps.length) * 100;
    return `<section class="screen">
      <div class="sbar"><button class="x" id="quit" aria-label="Quitter">✕</button>
        <div class="progress"><div style="width:${pct}%"></div></div><span class="clock" id="clock">0:00</span></div>
      ${inner}</section>`;
  }
  let clockTimer;
  function startClock(S) {
    clearInterval(clockTimer);
    const tick = () => { const c = document.getElementById('clock'); if (c) c.textContent = fmt(Math.round((Date.now() - S.t0) / 1000)); };
    tick(); clockTimer = setInterval(tick, 1000);
  }
  function wireQuit() {
    on('#quit', 'click', () => { if (confirm('Quitter la séance ?')) { stopAudio(); clearInterval(clockTimer); save(); Home(); } });
  }
  function next(S) { S.i++; runStep(S); }
  function runStep(S) {
    if (S.i >= S.steps.length) return Finish(S);
    const st = S.steps[S.i];
    if (st.type === 'mission') return MissionPlan(S, () => next(S));
    ({ recall: StepRecall, lesson: StepLesson, scenario: StepScenario, rewrite: StepRewrite, speak: StepSpeak })[st.type](S, st);
    startClock(S); wireQuit();
  }

  function StepRecall(S, st) {
    const L = st.lesson, q = pick(L.recall);
    const order = shuffle(q.o.map((t, k) => ({ t, k })));
    render(frame(S, `
      <p class="step">🔁 Rappel · ${esc(L.title)}</p>
      <p class="muted small">Se tester est l'une des façons les plus efficaces de retenir (effet de test).</p>
      <h2>${esc(q.q)}</h2>
      <div class="choices">${order.map((o, i) => `<button class="choice" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
      <div id="fb"></div>`));
    on('.choice', 'click', e => {
      const i = +e.currentTarget.dataset.i, ok = order[i].k === q.a;
      $app.querySelectorAll('.choice').forEach((b, k) => { b.disabled = true; if (order[k].k === q.a) b.classList.add('good'); else if (k === i) b.classList.add('bad'); });
      srsAnswer(L.id, ok); S.total++; if (ok) { S.correct++; S.xp += 10; bump(L.skill, 1); }
      const next_ = state.srs[L.id].due;
      $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}"><b>${ok ? 'Bien retenu !' : 'Pas tout à fait.'}</b> ${esc(L.cards[1].p)}
        <br><span class="muted small">Prochain rappel dans ${daysBetween(today(), next_)} jour${daysBetween(today(), next_) > 1 ? 's' : ''}.</span></div>
        <button class="btn primary big" id="n">Continuer</button>`;
      on('#n', 'click', () => next(S));
    });
  }

  function lessonCardHtml(L, c) {
    const card = L.cards[c];
    return `
      <p class="step">📘 Leçon · ${SKILLS[L.skill].name}</p>
      <h2>${esc(L.title)}</h2>
      ${badge(L.level)}
      <div class="card lessoncard"><p class="dots">${L.cards.map((_, k) => `<i class="${k <= c ? 'on' : ''}"></i>`).join('')}</p>
        <h3>${esc(card.h)}</h3><p>${esc(card.p)}</p>${card.ex ? `<p class="ex">${nl(card.ex)}</p>` : ''}</div>
      ${c === L.cards.length - 1 ? `<details class="sources"><summary>📚 Sources</summary><ul>${L.src.map(s => `<li>${esc(s)}</li>`).join('')}</ul></details>` : ''}`;
  }
  function StepLesson(S, st, c = 0) {
    const L = st.lesson;
    render(frame(S, `${lessonCardHtml(L, c)}
      <div class="row2">${c > 0 ? '<button class="btn" id="p">←</button>' : ''}<button class="btn primary grow" id="n">${c < L.cards.length - 1 ? 'Suivant' : 'J\'ai compris'}</button></div>`));
    const redraw = k => { StepLesson(S, st, k); startClock(S); wireQuit(); };
    on('#p', 'click', () => redraw(c - 1));
    on('#n', 'click', () => {
      if (c < L.cards.length - 1) return redraw(c + 1);
      if (!state.progress.lessonsDone.includes(L.id)) { state.progress.lessonsDone.push(L.id); bump(L.skill, 2); }
      srsSchedule(L.id); S.xp += 10; next(S);
    });
  }

  function StepScenario(S, st) {
    const s = st.s; const opts = shuffle(s.options); const P = lessonById(s.principle);
    render(frame(S, `
      <p class="step">🎭 Situation · ${SKILLS[s.skill].name}</p>
      <p class="where">${esc(s.where)}</p>
      <div class="bubble them">${esc(s.them)}</div>
      <p class="label">Qu'est-ce que tu réponds ?</p>
      <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
      <div id="fb"></div>`));
    let answered = false;
    on('.choice', 'click', e => {
      if (answered) return; answered = true;
      const o = opts[+e.currentTarget.dataset.k];
      $app.querySelectorAll('.choice').forEach((b, k) => { b.disabled = true; if (opts[k].ok) b.classList.add('good'); else if (b === e.currentTarget) b.classList.add('bad'); });
      S.total++; if (o.ok) { S.correct++; S.xp += 15; bump(s.skill, 2); } else S.xp += 5;
      const best = opts.find(x => x.ok);
      $('#fb').innerHTML = `<div class="feedback ${o.ok ? 'ok' : 'ko'}">
        <b>${o.ok ? 'Bien joué !' : 'Pas tout à fait.'}</b> ${esc(o.fb)}${o.ok ? '' : `<br><span class="muted">La meilleure : ${esc(best.fb)}</span>`}
        ${P ? `<p class="principle">Principe : <b>${esc(P.title)}</b> ${EVIDENCE[P.level].icon}</p>` : ''}</div>
        <button class="btn primary big" id="n">Continuer</button>`;
      on('#n', 'click', () => next(S));
    });
  }

  function analyzeRewrite(txt, r) {
    const t = ' ' + txt.toLowerCase().replace(/[’]/g, "'") + ' ';
    const q = /\?/.test(txt);
    const self = /(^|[^\p{L}])(je|j'|moi|mon|ma|mes|m'|me)(?=[^\p{L}]|$)/u.test(t);
    const shift = /^\s*(moi aussi|moi je|moi,|le mien|la mienne|pareil|ça m'est arrivé)/.test(t);
    const meteo = /(météo|il fait (beau|chaud|froid)|la pluie|il pleut)/.test(t);
    if (r.support) return [
      { ok: !shift, t: 'Tu gardes le projecteur sur l\'autre (pas de « moi aussi » d\'entrée)' },
      { ok: q, t: 'Tu poses une question de relance' },
      { ok: /!|oh|waouh|génial|bravo|super|trop bien|incroyable|mince|aïe|dur|peur|content|félicit/.test(t), t: 'Tu réagis à l\'émotion (joie, inquiétude…)' },
    ];
    return [
      { ok: txt.length >= Math.max(25, r.flat.length * 2), t: 'Tu en dis plus qu\'une réponse minimale' },
      { ok: self, t: 'Tu partages quelque chose de vrai sur toi (réciprocité)' },
      { ok: q, t: 'Tu relances avec une question' },
      { ok: !meteo || /météo/.test(r.them.toLowerCase()) || /chaud/.test(r.them.toLowerCase()), t: 'Tu évites de te réfugier dans la météo' },
    ];
  }
  function StepRewrite(S, st) {
    const r = st.r;
    render(frame(S, `
      <p class="step">✍️ Reformulation · ${r.support ? 'Écoute' : 'Conversation'}</p>
      <div class="bubble them">${esc(r.them)}</div>
      <div class="bubble me flat">${esc(r.flat)}</div>
      <p class="label">${r.support
        ? 'Cette réponse ramène le sujet à toi ou l\'éteint. Réécris-la en <b>réponse de soutien</b> : réagis à son émotion et pose une question sur son histoire.'
        : 'Cette réponse tue la conversation. Réécris-la : <b>une info vraie sur toi + une question en retour</b>.'}</p>
      <textarea id="txt" rows="3" placeholder="Ta réponse…"></textarea>
      <button class="btn primary big" id="check">Vérifier</button>
      <div id="fb"></div>`));
    on('#check', 'click', () => {
      const v = $('#txt').value.trim(); if (!v) { $('#txt').focus(); return; }
      const ch = analyzeRewrite(v, r); const score = ch.filter(c => c.ok).length; const good = score >= ch.length - 1;
      S.xp += 5 * score; if (good) bump(r.support ? 'ecoute' : 'smalltalk', 2);
      $('#check').remove(); $('#txt').disabled = true;
      $('#fb').innerHTML = `
        <ul class="checklist">${ch.map(c => `<li class="${c.ok ? 'ok' : 'ko'}">${c.ok ? '✓' : '○'} ${c.t}</li>`).join('')}</ul>
        <div class="feedback ${good ? 'ok' : 'ko'}"><b>${good ? 'Excellente reformulation !' : 'Bonne base, tu peux aller plus loin.'}</b>
        <br><span class="muted">Exemple : « ${esc(r.sample)} »</span>
        <p class="muted small">Vérification automatique par mots-clés : fie-toi surtout à l'exemple et à ton jugement.</p></div>
        <button class="btn primary big" id="n">Continuer</button>`;
      on('#n', 'click', () => next(S));
    });
  }

  // ---- Parle 60 s : reconnaissance vocale + enregistrement pour réécoute ----
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

  function StepSpeak(S, st) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const canRec = !!(navigator.mediaDevices && window.MediaRecorder);
    render(frame(S, `
      <p class="step">🎙️ Parle 60 secondes</p>
      <h2>${esc(st.prompt.t)}</h2>
      <p class="tip">💡 ${esc(st.prompt.tip)}</p>
      <p class="muted small">Parle à voix haute sans t'arrêter. Quand tu cherches tes mots, fais une pause plutôt qu'un « euh ».</p>
      <div class="mic"><button id="mic" class="micbtn" aria-label="Démarrer">🎙️</button><div class="big-timer" id="t">1:00</div><p class="muted small" id="mhint">Appuie pour commencer</p></div>
      ${SR ? '' : '<p class="muted small center">La reconnaissance vocale n\'est pas disponible sur ce navigateur (essaie Chrome, Edge ou Safari) : tu compteras tes « euh » toi-même.</p>'}
      <div id="live" class="live"></div>
      <div id="fb"></div>
      <button class="btn ghost" id="skip">Passer cet exercice</button>`));
    let running = false, left = 60, transcript = '', interim = '', chunks = [], startedAt = 0;
    const $t = $('#t'), $live = $('#live');

    const finish = () => {
      if (!running) return; running = false;
      const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      clearInterval(speakTimer);
      if (rec) { try { rec.onend = null; rec.stop(); } catch { } rec = null; }
      $('#mic').classList.remove('rec'); $('#mic').disabled = true; $('#mhint').textContent = 'Terminé';
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
      running = true; startedAt = Date.now();
      $('#mic').classList.add('rec'); $('#mhint').textContent = 'Appuie pour arrêter';
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
          $live.textContent = (transcript + ' ' + interim).trim().split(/\s+/).slice(-25).join(' ');
        };
        rec.onerror = () => { };
        rec.onend = () => { if (running && rec) { try { rec.start(); } catch { } } };
        try { rec.start(); } catch { }
      }
      speakTimer = setInterval(() => { left--; $t.textContent = fmt(Math.max(0, left)); if (left <= 0) finish(); }, 1000);
    });
    on('#skip', 'click', () => { stopAudio(); next(S); });
  }

  // Réécoute avec « préparation cognitive » (Harvey, Clark, Ehlers & Rapee, 2000) :
  // prédire sa performance, puis s'écouter comme on écouterait quelqu'un d'autre.
  function playbackBlock(url) {
    if (!url) return '';
    return `<div class="card replay" id="replay">
      <b>🎧 Réécoute-toi</b>
      <p class="muted small">D'abord, note comment tu penses avoir sonné. Puis écoute comme si c'était un·e inconnu·e : on se juge en général plus sévèrement que les autres ne nous jugent.</p>
      <p class="label">Avant d'écouter : je pense avoir sonné…</p>${slider('pre')}
      <div id="player" hidden><audio controls src="${url}"></audio>
      <p class="label">Après écoute, honnêtement :</p>${slider('post')}<p id="rgap"></p></div>
    </div>`;
  }
  function wirePlayback() {
    let pre = null;
    wireSlider('pre', v => { pre = v; $('#player').hidden = false; });
    wireSlider('post', v => {
      const d = v - pre;
      $('#rgap').innerHTML = d > 0 ? `<span class="good-t">+${d} : tu sonnes mieux que tu ne le pensais.</span>` : d === 0 ? 'Ta perception était juste.' : 'Note un point précis à améliorer pour la prochaine fois.';
    });
  }

  function speakResult(S, text, secs, url) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const { n, found } = countFillers(text);
    if (secs < 20) {
      S.xp += 10;
      $('#fb').innerHTML = `
        <div class="stats"><div><b>${words}</b><span>mots</span></div><div><b>${n}</b><span>béquilles</span></div><div><b>${secs}s</b><span>durée</span></div></div>
        <div class="feedback ko">${Object.keys(found).length ? `Repérés : ${Object.entries(found).map(([k, v]) => `« ${esc(k)} » ×${v}`).join(', ')}<br>` : ''}
        <b>Prise trop courte pour mesurer ton débit.</b> Essaie de tenir au moins 20 secondes, idéalement les 60 : c'est en continuant malgré les blancs qu'on progresse.</div>
        ${playbackBlock(url)}
        <button class="btn primary big" id="n">Continuer</button>`;
      if (url) wirePlayback();
      on('#n', 'click', () => next(S));
      return;
    }
    const perMin = Math.round(n / secs * 60 * 10) / 10;
    const wpm = Math.round(words / secs * 60);
    const hist = state.progress.fillerHistory;
    const prev = hist.length ? avg(hist.slice(-5).map(h => h.perMin)) : null;
    if (words > 30) hist.push({ d: today(), perMin, wpm });
    const better = prev !== null && perMin < prev;
    S.xp += 20 + (better ? 10 : 0); bump('clarte', better ? 3 : 1); bump('assurance', 1);
    const pace = wpm > 200 ? 'Débit rapide : essaie des pauses en fin d\'idée.' : wpm < 100 ? 'Débit posé. Si tu as eu des blancs, c\'est normal : ils s\'entendent moins que tu ne crois.' : 'Débit confortable.';
    $('#fb').innerHTML = `
      <div class="stats"><div><b>${words}</b><span>mots</span></div><div><b>${perMin}</b><span>béquilles/min</span></div><div><b>${wpm}</b><span>mots/min</span></div></div>
      <div class="feedback ok">
        ${Object.keys(found).length ? `Repérés : ${Object.entries(found).map(([k, v]) => `« ${esc(k)} » ×${v}`).join(', ')}<br>` : 'Aucune béquille repérée. '}
        ${prev === null ? 'Ceci est ta première mesure : on comparera les prochaines à celle-ci.' : better ? `🏆 Mieux que ta moyenne récente (${prev.toFixed(1)}/min) !` : `Ta moyenne récente : ${prev.toFixed(1)}/min. L'objectif est de progresser par rapport à toi, pas d'atteindre zéro.`}
        <br><span class="muted small">${pace} Les chiffres sont indicatifs : la reconnaissance vocale rate parfois des « euh ».</span></div>
      ${playbackBlock(url)}
      <button class="btn primary big" id="n">Continuer</button>`;
    if (url) wirePlayback();
    on('#n', 'click', () => next(S));
  }
  function manualResult(S, url) {
    $('#fb').innerHTML = `${playbackBlock(url)}
      <p class="label">Combien de « euh / du coup / en fait » as-tu remarqué ?</p>
      <div class="seg" id="self">${['0–2', '3–5', '6–10', '10+'].map((l, k) => `<button data-k="${k}">${l}</button>`).join('')}</div>`;
    if (url) wirePlayback();
    on('#self button', 'click', e => {
      const k = +e.currentTarget.dataset.k; S.xp += 20; bump('clarte', 1); bump('assurance', 1);
      $('#self').insertAdjacentHTML('afterend', `<div class="feedback ok"><b>Bravo d'avoir parlé à voix haute !</b> Demain, vise une tranche de moins, en remplaçant des « euh » par des pauses.</div><button class="btn primary big" id="n">Continuer</button>`);
      $app.querySelectorAll('#self button').forEach(b => { b.disabled = true; b.classList.toggle('on', +b.dataset.k === k); });
      on('#n', 'click', () => next(S));
    });
  }

  function Finish(S) {
    clearInterval(clockTimer); stopAudio();
    const secs = Math.round((Date.now() - S.t0) / 1000);
    if (S.solo) {
      state.progress.xp += S.xp; save();
      render(`<section class="screen center"><div class="confetti">✅</div><h2>Bien joué !</h2>
        <p class="lead">+${S.xp} XP${S.total ? ` · ${S.correct}/${S.total} bonnes réponses` : ''}</p>
        <button class="btn primary big" id="b">Continuer</button></section>`);
      on('#b', 'click', Practice); return;
    }
    const before = streakAlive();
    markDay(Math.max(1, Math.round(secs / 60)));
    state.progress.xp += S.xp; save();
    const st = state.progress.streak, pm = pendingMission();
    render(`
      <section class="screen center">
        <div class="confetti">🎉</div>
        <h1>Séance terminée !</h1>
        <p class="lead">${S.correct}/${S.total} bonnes réponses · ${fmt(secs)}</p>
        <div class="stats"><div><b>+${S.xp}</b><span>XP</span></div><div><b>🔥 ${st}</b><span>jour${st > 1 ? 's' : ''} d'affilée</span></div><div><b>${overall()}</b><span>Score</span></div></div>
        ${st > before ? `<p class="feedback ok">Série prolongée ! La régularité compte plus que la durée.</p>` : ''}
        ${pm ? `<div class="card left mission"><p class="step">🌍 Ton défi</p><p class="plan">« ${esc(pm.plan)} »</p><p class="muted small">Reviens dans l'app après pour comparer avec ta prédiction.</p></div>` : ''}
        <button class="btn primary big" id="home">Retour à l'accueil</button>
      </section>`);
    on('#home', 'click', Home);
  }

  // ================= ENTRAÎNEMENT LIBRE =================
  function Practice() {
    showTabs('practice');
    const bySkill = Object.keys(SKILLS).map(k => ({ k, ls: LESSONS.filter(l => l.skill === k) }));
    render(`
      <section class="screen">
        <h2>Entraînement libre</h2>
        <div class="list">
          <button class="row" data-a="scen"><span class="em">🎭</span><div><b>Situations</b><small>${SCENARIOS.length} scènes : ascenseur, chef, rendez-vous…</small></div>›</button>
          <button class="row" data-a="rew"><span class="em">✍️</span><div><b>Reformulation</b><small>Transformer une réponse plate</small></div>›</button>
          <button class="row" data-a="speak"><span class="em">🎙️</span><div><b>Parle 60 secondes</b><small>Béquilles, débit, réécoute</small></div>›</button>
          <button class="row" data-a="recall"><span class="em">🔁</span><div><b>Réviser</b><small>Questions sur les leçons déjà vues</small></div>›</button>
          <button class="row" data-a="mission"><span class="em">🌍</span><div><b>Défi terrain</b><small>${pendingMission() ? 'Un défi est en cours' : 'Choisir un défi réel'}</small></div>›</button>
        </div>
        ${bySkill.map(g => `<h3>${SKILLS[g.k].icon} ${SKILLS[g.k].name}</h3><div class="list">${g.ls.map(l => `
          <button class="row" data-l="${l.id}"><span class="em">${EVIDENCE[l.level].icon}</span><div><b>${esc(l.title)}</b><small>${EVIDENCE[l.level].label}</small></div>${state.progress.lessonsDone.includes(l.id) ? '✓' : '›'}</button>`).join('')}</div>`).join('')}
      </section>`);
    const solo = steps => { showTabs(null); runStep({ steps, i: 0, t0: Date.now(), correct: 0, total: 0, xp: 0, solo: true }); };
    on('[data-a]', 'click', e => {
      const a = e.currentTarget.dataset.a;
      if (a === 'scen') solo(shuffle(SCENARIOS).slice(0, 5).map(s => ({ type: 'scenario', s })));
      if (a === 'rew') solo(shuffle(REWRITES).slice(0, 3).map(r => ({ type: 'rewrite', r })));
      if (a === 'speak') solo([{ type: 'speak', prompt: pick(PROMPTS) }]);
      if (a === 'recall') {
        const seen = state.progress.lessonsDone.map(lessonById).filter(Boolean);
        if (!seen.length) { alert('Fais d\'abord une leçon : les révisions portent sur ce que tu as déjà vu.'); return; }
        solo(shuffle(seen).slice(0, 5).map(l => ({ type: 'recall', lesson: l })));
      }
      if (a === 'mission') { const pm = pendingMission(); if (pm) Home(); else MissionPlan(null, Home); }
    });
    on('[data-l]', 'click', e => solo([{ type: 'lesson', lesson: lessonById(e.currentTarget.dataset.l) }]));
  }

  // ================= PROFIL =================
  function Profile() {
    showTabs('profile');
    const p = state.profile, pr = state.progress;
    const total = Object.values(pr.days).reduce((a, b) => a + b, 0);
    const journal = state.missions.filter(m => m.status !== 'planned').slice(-8).reverse();
    render(`
      <section class="screen">
        <h2>${p.name ? esc(p.name) : 'Mon profil'}</h2>
        <div class="stats"><div><b>🔥 ${streakAlive()}</b><span>Série</span></div><div><b>${total}</b><span>minutes</span></div><div><b>${doneMissions().length}</b><span>défis réussis</span></div></div>
        <div class="card"><b>Progression depuis le départ</b>${Object.entries(SKILLS).map(([k, s]) => {
          const d = p.levels[k] - (p.start?.[k] ?? p.levels[k]);
          return `<div class="bar"><span>${s.icon} ${s.name}</span><div class="track"><div style="width:${p.levels[k]}%"></div></div><b>${p.levels[k]}</b><small class="${d > 0 ? 'up' : ''}">${d > 0 ? '+' + d : ''}</small></div>`;
        }).join('')}</div>
        ${pr.fillerHistory.length ? `<div class="card"><b>Béquilles par minute</b>${sparkline(pr.fillerHistory.map(h => h.perMin))}<p class="muted small">Dernières mesures : ${pr.fillerHistory.slice(-6).map(h => h.perMin).join(' · ')}</p></div>` : ''}
        ${journal.length ? `<div class="card"><b>Journal des défis</b><ul class="journal">${journal.map(m => `<li><span>${m.status === 'done' ? '✅' : '⏭️'}</span><div>${esc(m.t)}${m.status === 'done' ? `<small>Prévu ${m.predOk}/10 → réel ${m.ok}/10 · stress ${m.predAnx} → ${m.anx}</small>` : '<small>Non réalisé</small>'}${m.note ? `<small><i>« ${esc(m.note)} »</i></small>` : ''}</div></li>`).join('')}</ul></div>` : ''}
        <div class="list">
          <button class="row" id="plan"><span class="em">🗺️</span><div><b>Mon plan</b><small>Profil et 4 semaines</small></div>›</button>
          <button class="row" id="src"><span class="em">📚</span><div><b>Sources et méthode</b><small>Toutes les études citées</small></div>›</button>
          <button class="row" id="retake"><span class="em">🔁</span><div><b>Refaire le test</b><small>Recalcule ton profil (efface la progression)</small></div>›</button>
          <button class="row danger" id="reset"><span class="em">🗑️</span><div><b>Tout effacer</b><small>Supprime tes données de cet appareil</small></div>›</button>
        </div>
        <p class="muted small disclaimer">${esc(DISCLAIMER)}</p>
      </section>`);
    on('#plan', 'click', () => Plan(false));
    on('#src', 'click', Sources);
    on('#retake', 'click', () => { if (confirm('Refaire le test ? Ta progression sera réinitialisée.')) Quiz(0, { __hist: [] }); });
    on('#reset', 'click', () => { if (confirm('Effacer toute ta progression ?')) { state = fresh(); save(); Welcome(); } });
  }
  function sparkline(vals) {
    const v = vals.slice(-20); if (v.length < 2) return '';
    const max = Math.max(...v, 1), w = 300, h = 60;
    const pts = v.map((x, i) => `${(i / (v.length - 1)) * w},${h - (x / max) * (h - 8) - 4}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" class="spark" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`;
  }

  function Sources() {
    showTabs('profile');
    render(`
      <section class="screen">
        <button class="btn ghost back" id="b">← Profil</button>
        <h2>Sources et méthode</h2>
        <div class="card"><b>La méthode</b>
          <ul class="how">
            <li><b>Pratique délibérée</b> : des exercices courts avec un retour immédiat et expliqué.</li>
            <li><b>Pratique de récupération et répétition espacée</b> : se tester à J+1, J+3, J+7… retient mieux que relire (Roediger & Karpicke, 2006 ; Cepeda et al., 2006).</li>
            <li><b>Exposition graduée et expériences comportementales</b> : le cœur des TCC du trac social (Clark & Wells, 1995). Tu fais une prédiction, tu testes, tu compares.</li>
            <li><b>Intentions de mise en œuvre</b> : « Quand…, je… » (Gollwitzer & Sheeran, 2006).</li>
            <li><b>Réécoute préparée</b> : prédire puis s'écouter « comme un autre » améliore l'image qu'on a de sa prestation (Harvey et al., 2000). Effet sur l'anxiété elle-même : non démontré.</li>
          </ul></div>
        <div class="card"><b>Niveaux de preuve</b><ul class="how">${Object.values(EVIDENCE).map(e => `<li>${e.icon} <b>${e.label}</b></li>`).join('')}</ul>
          <p class="muted small">On distingue ce qui est démontré, ce qui est prometteur, les techniques de formateurs, et les mythes. Les scores de l'app sont indicatifs.</p></div>
        ${LESSONS.map(l => `<div class="card"><b>${esc(l.title)}</b> ${badge(l.level)}<ul class="srclist">${l.src.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>`).join('')}
        <div class="card"><b>Test initial</b><ul class="srclist"><li>Connor, Kobak, Churchill, Katzelnick & Davidson (2001). Mini-SPIN: A brief screening assessment for generalized social anxiety disorder. Depression and Anxiety, 14(2).</li></ul></div>
        <p class="muted small disclaimer">${esc(DISCLAIMER)}</p>
      </section>`);
    on('#b', 'click', Profile);
  }

  // ---------- démarrage ----------
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  state.profile ? Home() : Welcome();
})();
