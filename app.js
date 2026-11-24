/* Talking — app d'entraînement à la conversation, 9 minutes par jour. */
(() => {
  'use strict';

  const KEY = 'talking.state.v1';
  const $app = document.getElementById('app');
  const $tabs = document.getElementById('tabs');

  // ---------- état ----------
  const fresh = () => ({
    profile: null, // { name, goal, minutes, levels:{skill:0-100}, focus:[skills], createdAt }
    progress: { xp: 0, streak: 0, lastDay: null, days: {}, lessonsDone: [], sessions: 0, bestFillerRate: null },
  });
  let state = load();
  function load() {
    try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return fresh(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ } }

  // ---------- utilitaires ----------
  const today = () => new Date().toISOString().slice(0, 10);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const render = html => { $app.innerHTML = html; window.scrollTo(0, 0); };
  const on = (sel, ev, fn) => $app.querySelectorAll(sel).forEach(el => el.addEventListener(ev, fn));
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function bump(skill, n) {
    const L = state.profile.levels;
    L[skill] = clamp((L[skill] || 0) + n, 0, 100);
  }
  function addXp(n) { state.progress.xp += n; }
  function overall() {
    const L = state.profile.levels; const ks = Object.keys(SKILLS);
    return Math.round(ks.reduce((s, k) => s + (L[k] || 0), 0) / ks.length);
  }
  function weakest() {
    const L = state.profile.levels;
    return Object.keys(SKILLS).sort((a, b) => L[a] - L[b]);
  }
  function streakAlive() {
    const p = state.progress; if (!p.lastDay) return 0;
    const diff = (new Date(today()) - new Date(p.lastDay)) / 864e5;
    return diff <= 1 ? p.streak : 0;
  }
  function markDay(minutes) {
    const p = state.progress, t = today();
    if (p.lastDay !== t) {
      const diff = p.lastDay ? (new Date(t) - new Date(p.lastDay)) / 864e5 : 99;
      p.streak = diff === 1 ? p.streak + 1 : 1;
      p.lastDay = t;
    }
    p.days[t] = (p.days[t] || 0) + minutes;
    p.sessions++;
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
        <p class="lead">Tu n'es pas mauvais avec les gens. Tu gèles, c'est tout.<br>
        Entraîne-toi <b>9 minutes par jour</b> à savoir quoi dire — au boulot, avec un inconnu, ou avec quelqu'un qui te plaît.</p>
        <div class="quotes">${TESTIMONIALS.map(t => `<blockquote>${esc(t.t)}<cite>${esc(t.who)}</cite></blockquote>`).join('')}</div>
        <button class="btn primary big" id="go">Faire le test (1 min)</button>
        <p class="muted small">Gratuit · Sans compte · Tes données restent sur ton appareil</p>
      </section>`);
    on('#go', 'click', () => Quiz(0, {}));
  }

  function Quiz(i, need) {
    showTabs(null);
    if (i >= QUIZ.length) return Goal(need);
    const q = QUIZ[i];
    render(`
      <section class="screen">
        <div class="progress"><div style="width:${(i / (QUIZ.length + 2)) * 100}%"></div></div>
        <p class="step">Question ${i + 1} / ${QUIZ.length}</p>
        <h2>${esc(q.q)}</h2>
        <div class="choices">${q.options.map((o, k) => `<button class="choice" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
        ${i > 0 ? '<button class="btn ghost" id="back">← Retour</button>' : ''}
      </section>`);
    on('.choice', 'click', e => {
      const o = q.options[+e.currentTarget.dataset.k];
      const n = Object.assign({}, need);
      for (const [k, v] of Object.entries(o.w)) n[k] = (n[k] || 0) + v;
      n.__hist = (need.__hist || []).concat([o.w]);
      Quiz(i + 1, n);
    });
    on('#back', 'click', () => {
      const hist = (need.__hist || []).slice(); const last = hist.pop() || {};
      const n = Object.assign({}, need, { __hist: hist });
      for (const [k, v] of Object.entries(last)) n[k] -= v;
      Quiz(i - 1, n);
    });
  }

  function Goal(need) {
    render(`
      <section class="screen">
        <div class="progress"><div style="width:${(QUIZ.length / (QUIZ.length + 2)) * 100}%"></div></div>
        <h2>Où veux-tu être plus à l'aise ?</h2>
        <div class="choices grid2">${GOALS.map(g => `<button class="choice tile" data-g="${g.id}"><span class="em">${g.icon}</span><b>${g.t}</b><small>${g.d}</small></button>`).join('')}</div>
      </section>`);
    on('.choice', 'click', e => Setup(need, e.currentTarget.dataset.g));
  }

  function Setup(need, goal) {
    render(`
      <section class="screen">
        <div class="progress"><div style="width:${((QUIZ.length + 1) / (QUIZ.length + 2)) * 100}%"></div></div>
        <h2>Dernière chose</h2>
        <label class="field">Ton prénom <input id="name" maxlength="30" placeholder="Optionnel" autocomplete="given-name"></label>
        <p class="label">Combien de temps par jour ?</p>
        <div class="seg" id="mins">${[5, 9, 15].map(m => `<button data-m="${m}" class="${m === 9 ? 'on' : ''}">${m} min${m === 9 ? ' ⭐' : ''}</button>`).join('')}</div>
        <button class="btn primary big" id="ok">Voir mon plan</button>
      </section>`);
    let minutes = 9;
    on('#mins button', 'click', e => {
      minutes = +e.currentTarget.dataset.m;
      $app.querySelectorAll('#mins button').forEach(b => b.classList.toggle('on', b === e.currentTarget));
    });
    on('#ok', 'click', () => {
      const name = $app.querySelector('#name').value.trim();
      Analyzing(() => {
        const levels = {};
        for (const k of Object.keys(SKILLS)) levels[k] = clamp(72 - (need[k] || 0) * 8, 15, 80);
        state.profile = { name, goal, minutes, levels, start: Object.assign({}, levels), createdAt: today() };
        state.profile.focus = weakest().slice(0, 3);
        save();
        Plan(true);
      });
    });
  }

  function Analyzing(done) {
    render(`<section class="screen center"><div class="spinner"></div><h2>Analyse de ton profil…</h2>
      <ul class="checks" id="chk"><li>Tes réflexes en conversation</li><li>Tes points de blocage</li><li>Ton plan sur 4 semaines</li></ul></section>`);
    const lis = $app.querySelectorAll('#chk li');
    lis.forEach((li, i) => setTimeout(() => li.classList.add('ok'), 500 + i * 500));
    setTimeout(done, 2100);
  }

  function Plan(first) {
    showTabs(first ? null : 'profile');
    const p = state.profile; const L = p.levels; const f = p.focus;
    const goal = GOALS.find(g => g.id === p.goal);
    const weeks = [
      { t: 'Débloquer', d: `Focus ${SKILLS[f[0]].name} : plus de blancs, des réflexes prêts.` },
      { t: 'Consolider', d: `Focus ${SKILLS[f[1]].name} : rebondir naturellement.` },
      { t: 'S\'affirmer', d: `Focus ${SKILLS[f[2]].name} : parler avec aplomb.` },
      { t: 'Briller', d: 'Tout combiner dans des situations réelles.' },
    ];
    render(`
      <section class="screen">
        <p class="step">${first ? 'Ton résultat' : 'Ton plan'}</p>
        <h2>${p.name ? esc(p.name) + ', voici' : 'Voici'} ton profil de communication</h2>
        <div class="card score">
          <div class="ring" style="--v:${overall()}"><span>${overall()}</span></div>
          <div><b>Score global</b><p class="muted small">Objectif : ${goal.icon} ${goal.t.toLowerCase()} · ${p.minutes} min/jour</p></div>
        </div>
        <div class="card">${Object.entries(SKILLS).map(([k, s]) => `
          <div class="bar"><span>${s.icon} ${s.name}${f.includes(k) ? ' <em class="tag">à travailler</em>' : ''}</span>
          <div class="track"><div style="width:${L[k]}%"></div></div><b>${L[k]}</b></div>`).join('')}
        </div>
        <h3>Ton plan sur 4 semaines</h3>
        <ol class="weeks">${weeks.map((w, i) => `<li><b>Semaine ${i + 1} · ${w.t}</b><span>${esc(w.d)}</span></li>`).join('')}</ol>
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
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const k = d.toISOString().slice(0, 10);
      return { l: 'DLMMJVS'[d.getDay()], on: !!pr.days[k], t: k === today() };
    });
    const lesson = nextLesson();
    render(`
      <section class="screen">
        <header class="top"><div><p class="muted small">${greeting()}</p><h2>${p.name ? esc(p.name) : 'Prêt·e à parler ?'}</h2></div>
          <div class="streak">🔥 <b>${streakAlive()}</b></div></header>
        <div class="weekrow">${week.map(d => `<div class="${d.on ? 'on' : ''} ${d.t ? 'today' : ''}"><span>${d.l}</span><i>${d.on ? '✓' : ''}</i></div>`).join('')}</div>
        <div class="card session ${doneToday ? 'done' : ''}">
          <p class="step">${doneToday ? 'Séance du jour terminée ✓' : 'Séance du jour'} · ${p.minutes} min</p>
          <h3>${SKILLS[lesson.skill].icon} ${esc(lesson.title)}</h3>
          <ul class="mini"><li>📘 Leçon express</li><li>🎭 3 situations réelles</li><li>✍️ Reformulation</li><li>🎙️ Parle 60 secondes</li></ul>
          <button class="btn primary big" id="go">${doneToday ? 'Refaire une séance' : 'Commencer'}</button>
        </div>
        <div class="stats">
          <div><b>${overall()}</b><span>Score</span></div>
          <div><b>${pr.xp}</b><span>XP</span></div>
          <div><b>${pr.sessions}</b><span>Séances</span></div>
        </div>
        <div class="card">${Object.entries(SKILLS).map(([k, s]) => `
          <div class="bar"><span>${s.icon} ${s.name}</span><div class="track"><div style="width:${p.levels[k]}%"></div></div><b>${p.levels[k]}</b></div>`).join('')}</div>
      </section>`);
    on('#go', 'click', () => Session());
  }
  function greeting() { const h = new Date().getHours(); return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'; }

  function nextLesson() {
    const done = state.progress.lessonsDone;
    const order = state.profile.focus.concat(weakest());
    for (const sk of order) {
      const l = LESSONS.find(x => x.skill === sk && !done.includes(x.id));
      if (l) return l;
    }
    return LESSONS.find(x => x.skill === weakest()[0]) || LESSONS[0];
  }

  // ================= SÉANCE =================
  function Session() {
    showTabs(null);
    const lesson = nextLesson();
    const focus = state.profile.focus;
    const pool = SCENARIOS.filter(s => s.skill === lesson.skill || focus.includes(s.skill));
    const goal = state.profile.goal;
    const ranked = shuffle(pool).sort((a, b) => ((b.ctx === goal) - (a.ctx === goal)));
    const scen = ranked.slice(0, 3);
    while (scen.length < 3) { const s = pick(SCENARIOS); if (!scen.includes(s)) scen.push(s); }
    const steps = [
      { type: 'lesson', lesson },
      ...scen.map(s => ({ type: 'scenario', s })),
      { type: 'rewrite', r: pick(REWRITES) },
      { type: 'speak', prompt: pick(PROMPTS) },
    ];
    const S = { steps, i: 0, t0: Date.now(), correct: 0, xp: 0 };
    runStep(S);
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
    on('#quit', 'click', () => { if (confirm('Quitter la séance ? Ta progression de cette séance sera perdue.')) { stopSpeech(); clearInterval(clockTimer); Home(); } });
  }
  function next(S) { S.i++; runStep(S); }

  function runStep(S) {
    if (S.i >= S.steps.length) return Finish(S);
    const st = S.steps[S.i];
    ({ lesson: StepLesson, scenario: StepScenario, rewrite: StepRewrite, speak: StepSpeak })[st.type](S, st);
    startClock(S); wireQuit();
  }

  function StepLesson(S, st, c = 0) {
    const L = st.lesson, card = L.cards[c];
    render(frame(S, `
      <p class="step">📘 Leçon · ${SKILLS[L.skill].name}</p>
      <h2>${esc(L.title)}</h2>
      <div class="card lessoncard"><p class="dots">${L.cards.map((_, k) => `<i class="${k <= c ? 'on' : ''}"></i>`).join('')}</p>
        <h3>${esc(card.h)}</h3><p>${esc(card.p)}</p>${card.ex ? `<p class="ex">${esc(card.ex)}</p>` : ''}</div>
      <button class="btn primary big" id="n">${c < L.cards.length - 1 ? 'Suivant' : 'J\'ai compris'}</button>`));
    on('#n', 'click', () => {
      if (c < L.cards.length - 1) { StepLesson(S, st, c + 1); startClock(S); wireQuit(); return; }
      if (!state.progress.lessonsDone.includes(L.id)) state.progress.lessonsDone.push(L.id);
      bump(L.skill, 2); S.xp += 10; next(S);
    });
  }

  function StepScenario(S, st) {
    const s = st.s; const opts = shuffle(s.options);
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
      $app.querySelectorAll('.choice').forEach((b, k) => {
        b.disabled = true;
        if (opts[k].ok) b.classList.add('good'); else if (b === e.currentTarget) b.classList.add('bad');
      });
      if (o.ok) { S.correct++; S.xp += 15; bump(s.skill, 2); } else { S.xp += 5; }
      const best = opts.find(x => x.ok);
      $app.querySelector('#fb').innerHTML = `<div class="feedback ${o.ok ? 'ok' : 'ko'}">
        <b>${o.ok ? 'Bien joué !' : 'Pas tout à fait.'}</b> ${esc(o.fb)}${o.ok ? '' : `<br><span class="muted">Mieux : ${esc(best.fb)}</span>`}</div>
        <button class="btn primary big" id="n">Continuer</button>`;
      on('#n', 'click', () => next(S));
    });
  }

  function analyzeRewrite(txt, flat) {
    const t = txt.toLowerCase();
    const checks = [
      { ok: txt.length >= Math.max(25, flat.length * 2), t: 'Tu en donnes plus qu\'une réponse minimale' },
      { ok: /\b(je|j'|j’|moi|mon|ma|mes)\b/.test(t) || /\bj['’]/.test(t), t: 'Tu partages quelque chose de toi' },
      { ok: /\?/.test(txt), t: 'Tu relances avec une question' },
      { ok: !/(météo|temps qu'il fait|il fait (beau|chaud|froid))/.test(t), t: 'Tu évites la météo' },
    ];
    return checks;
  }

  function StepRewrite(S, st) {
    const r = st.r;
    render(frame(S, `
      <p class="step">✍️ Reformulation · Small talk</p>
      <div class="bubble them">${esc(r.them)}</div>
      <div class="bubble me flat">${esc(r.flat)}</div>
      <p class="label">Cette réponse tue la conversation. Réécris-la : <b>une réaction honnête + une question</b>.</p>
      <textarea id="txt" rows="4" placeholder="Ta réponse…"></textarea>
      <button class="btn primary big" id="check">Vérifier</button>
      <div id="fb"></div>`));
    on('#check', 'click', () => {
      const v = $app.querySelector('#txt').value.trim();
      if (!v) { $app.querySelector('#txt').focus(); return; }
      const ch = analyzeRewrite(v, r.flat); const score = ch.filter(c => c.ok).length;
      S.xp += 5 * score; if (score >= 3) bump('smalltalk', 2);
      $app.querySelector('#check').remove();
      $app.querySelector('#txt').disabled = true;
      $app.querySelector('#fb').innerHTML = `
        <ul class="checklist">${ch.map(c => `<li class="${c.ok ? 'ok' : 'ko'}">${c.ok ? '✓' : '○'} ${c.t}</li>`).join('')}</ul>
        <div class="feedback ${score >= 3 ? 'ok' : 'ko'}"><b>${score >= 3 ? 'Excellente reformulation !' : 'Bonne base, tu peux aller plus loin.'}</b>
        <br><span class="muted">Exemple : « ${esc(r.sample)} »</span></div>
        <button class="btn primary big" id="n">Continuer</button>`;
      on('#n', 'click', () => next(S));
    });
  }

  // ---- Parle 60 s (reconnaissance vocale si dispo) ----
  let rec = null, speakTimer = null;
  function stopSpeech() { clearInterval(speakTimer); if (rec) { try { rec.onend = null; rec.stop(); } catch { } rec = null; } }
  function countFillers(text) {
    const t = ' ' + text.toLowerCase().replace(/[.,!?;:]/g, ' ') + ' ';
    let n = 0; const found = {};
    for (const f of FILLERS) {
      const m = t.match(new RegExp(`\\s${f.replace(/ /g, '\\s+')}(?=\\s)`, 'g'));
      if (m) { n += m.length; found[f] = m.length; }
    }
    return { n, found };
  }

  function StepSpeak(S, st) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    render(frame(S, `
      <p class="step">🎙️ Parle 60 secondes · Clarté & assurance</p>
      <h2>${esc(st.prompt)}</h2>
      <p class="muted">Parle à voix haute, sans t'arrêter. Remplace les « euh » par de courtes pauses.</p>
      <div class="mic"><button id="mic" class="micbtn" aria-label="Démarrer">🎙️</button><div class="big-timer" id="t">1:00</div></div>
      ${SR ? '<p class="muted small center">Ta voix est analysée par ton navigateur pour compter tes mots-béquilles.</p>'
           : '<p class="muted small center">Reconnaissance vocale indisponible sur ce navigateur : parle quand même, tu noteras toi-même tes « euh ».</p>'}
      <div id="live" class="live"></div>
      <div id="fb"></div>
      <button class="btn ghost" id="skip">Passer cet exercice</button>`));
    let running = false, left = 60, transcript = '', interim = '';
    const $t = $app.querySelector('#t'), $live = $app.querySelector('#live');

    const finish = () => {
      if (!running) return; running = false; stopSpeech();
      $app.querySelector('#mic').classList.remove('rec');
      $app.querySelector('#mic').disabled = true;
      $app.querySelector('#skip')?.remove();
      const spoken = (transcript + ' ' + interim).trim();
      if (SR && spoken) return speakResult(S, spoken, 60 - left);
      // mode manuel
      $app.querySelector('#fb').innerHTML = `<p class="label">Combien de « euh / du coup / en fait » as-tu remarqué ?</p>
        <div class="seg" id="self">${['0–2', '3–5', '6–10', '10+'].map((l, k) => `<button data-k="${k}">${l}</button>`).join('')}</div>`;
      on('#self button', 'click', e => {
        const k = +e.currentTarget.dataset.k; S.xp += [25, 20, 15, 10][k]; bump('clarte', [3, 2, 1, 1][k]); bump('assurance', 1);
        $app.querySelector('#fb').innerHTML = `<div class="feedback ok"><b>Bravo d'avoir parlé 60 s !</b> Demain, vise une tranche de moins.</div><button class="btn primary big" id="n">Terminer</button>`;
        on('#n', 'click', () => next(S));
      });
    };

    on('#mic', 'click', () => {
      if (running) { finish(); return; }
      running = true;
      $app.querySelector('#mic').classList.add('rec');
      if (SR) {
        rec = new SR(); rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = true;
        rec.onresult = ev => {
          interim = '';
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const r = ev.results[i];
            if (r.isFinal) transcript += ' ' + r[0].transcript; else interim += r[0].transcript;
          }
          $live.textContent = (transcript + ' ' + interim).trim().split(/\s+/).slice(-25).join(' ');
        };
        rec.onerror = () => { };
        rec.onend = () => { if (running && rec) { try { rec.start(); } catch { } } };
        try { rec.start(); } catch { }
      }
      speakTimer = setInterval(() => { left--; $t.textContent = fmt(left); if (left <= 0) finish(); }, 1000);
    });
    on('#skip', 'click', () => { stopSpeech(); next(S); });
  }

  function speakResult(S, text, secs) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const { n, found } = countFillers(text);
    const rate = words ? Math.round((n / words) * 1000) / 10 : 0; // %
    const wpm = secs ? Math.round(words / secs * 60) : 0;
    const pr = state.progress;
    const record = pr.bestFillerRate === null || rate < pr.bestFillerRate;
    if (words > 30 && record) pr.bestFillerRate = rate;
    const grade = rate < 2 ? 3 : rate < 5 ? 2 : 1;
    S.xp += 10 + grade * 5; bump('clarte', grade); bump('assurance', 1);
    const pace = wpm > 190 ? 'Un peu rapide : ralentis de 10 %.' : wpm < 100 ? 'Débit lent : ose enchaîner.' : 'Bon débit, posé.';
    $app.querySelector('#fb').innerHTML = `
      <div class="stats"><div><b>${words}</b><span>mots</span></div><div><b>${n}</b><span>béquilles</span></div><div><b>${wpm}</b><span>mots/min</span></div></div>
      <div class="feedback ${grade >= 2 ? 'ok' : 'ko'}"><b>${grade === 3 ? 'Très fluide !' : grade === 2 ? 'Pas mal du tout.' : 'Beaucoup de béquilles, c\'est normal au début.'}</b>
      ${Object.keys(found).length ? `<br>Repérés : ${Object.entries(found).map(([k, v]) => `« ${esc(k)} » ×${v}`).join(', ')}` : ''}
      <br><span class="muted">${pace}${record && words > 30 ? ' 🏆 Nouveau record !' : ''}</span></div>
      <button class="btn primary big" id="n">Terminer</button>`;
    on('#n', 'click', () => next(S));
  }

  function Finish(S) {
    clearInterval(clockTimer); stopSpeech();
    const secs = Math.round((Date.now() - S.t0) / 1000);
    const before = streakAlive();
    markDay(Math.max(1, Math.round(secs / 60)));
    addXp(S.xp); save();
    const st = state.progress.streak;
    render(`
      <section class="screen center">
        <div class="confetti">🎉</div>
        <h1>Séance terminée !</h1>
        <p class="lead">${S.correct}/3 bonnes répliques · ${fmt(secs)} d'entraînement</p>
        <div class="stats"><div><b>+${S.xp}</b><span>XP</span></div><div><b>🔥 ${st}</b><span>jour${st > 1 ? 's' : ''} de suite</span></div><div><b>${overall()}</b><span>Score</span></div></div>
        ${st > before ? `<p class="feedback ok">Série prolongée ! Reviens demain pour passer à ${st + 1}.</p>` : ''}
        <div class="card left"><b>Mission du jour 🎯</b><p>${esc(pick(MISSIONS))}</p></div>
        <button class="btn primary big" id="home">Retour à l'accueil</button>
      </section>`);
    on('#home', 'click', Home);
    maybeNotify();
  }

  const MISSIONS = [
    'Pose une question ouverte à quelqu\'un que tu croises rarement (collègue, voisin, commerçant).',
    'À ta prochaine discussion, rebondis sur un mot précis que l\'autre a utilisé.',
    'Raconte une anecdote en moins de 45 secondes aujourd\'hui.',
    'Interdiction de parler de la météo jusqu\'à ce soir.',
    'En réunion, donne ton avis en 3 phrases : point, raison, proposition.',
    'Fais une pause d\'une respiration avant de répondre à une question importante.',
  ];

  // ================= ENTRAÎNEMENT LIBRE =================
  function Practice() {
    showTabs('practice');
    render(`
      <section class="screen">
        <h2>Entraînement libre</h2>
        <div class="list">
          <button class="row" data-a="scen"><span class="em">🎭</span><div><b>Situations</b><small>${SCENARIOS.length} scènes : ascenseur, chef, rendez-vous…</small></div>›</button>
          <button class="row" data-a="rew"><span class="em">✍️</span><div><b>Reformulation</b><small>Transforme une réponse plate en vraie conversation</small></div>›</button>
          <button class="row" data-a="speak"><span class="em">🎙️</span><div><b>Parle 60 secondes</b><small>Compte tes « euh » et mesure ton débit</small></div>›</button>
        </div>
        <h3>Toutes les leçons</h3>
        <div class="list">${LESSONS.map(l => `
          <button class="row" data-l="${l.id}"><span class="em">${SKILLS[l.skill].icon}</span><div><b>${esc(l.title)}</b><small>${SKILLS[l.skill].name}</small></div>${state.progress.lessonsDone.includes(l.id) ? '✓' : '›'}</button>`).join('')}</div>
      </section>`);
    const solo = steps => {
      showTabs(null);
      const S = { steps, i: 0, t0: Date.now(), correct: 0, xp: 0, solo: true };
      runStep(S);
    };
    on('[data-a]', 'click', e => {
      const a = e.currentTarget.dataset.a;
      if (a === 'scen') solo(shuffle(SCENARIOS).slice(0, 5).map(s => ({ type: 'scenario', s })));
      if (a === 'rew') solo(shuffle(REWRITES).slice(0, 3).map(r => ({ type: 'rewrite', r })));
      if (a === 'speak') solo([{ type: 'speak', prompt: pick(PROMPTS) }]);
    });
    on('[data-l]', 'click', e => solo([{ type: 'lesson', lesson: LESSONS.find(l => l.id === e.currentTarget.dataset.l) }]));
  }

  // les séances libres terminent sur un écran plus léger
  const _finish = Finish;
  Finish = function (S) {
    if (!S.solo) return _finish(S);
    clearInterval(clockTimer); stopSpeech();
    addXp(S.xp); save();
    render(`<section class="screen center"><div class="confetti">✅</div><h2>Bien joué !</h2>
      <p class="lead">+${S.xp} XP${S.steps[0].type === 'scenario' ? ` · ${S.correct}/${S.steps.length} bonnes répliques` : ''}</p>
      <button class="btn primary big" id="b">Continuer</button></section>`);
    on('#b', 'click', Practice);
  };

  // ================= PROFIL =================
  function Profile() {
    showTabs('profile');
    const p = state.profile, pr = state.progress;
    const total = Object.values(pr.days).reduce((a, b) => a + b, 0);
    render(`
      <section class="screen">
        <h2>${p.name ? esc(p.name) : 'Mon profil'}</h2>
        <div class="stats"><div><b>🔥 ${streakAlive()}</b><span>Série</span></div><div><b>${total}</b><span>minutes</span></div><div><b>${pr.lessonsDone.length}/${LESSONS.length}</b><span>leçons</span></div></div>
        <div class="card"><b>Progression depuis le départ</b>${Object.entries(SKILLS).map(([k, s]) => {
          const d = p.levels[k] - (p.start?.[k] ?? p.levels[k]);
          return `<div class="bar"><span>${s.icon} ${s.name}</span><div class="track"><div style="width:${p.levels[k]}%"></div></div><b>${p.levels[k]}</b><small class="${d > 0 ? 'up' : ''}">${d > 0 ? '+' + d : ''}</small></div>`;
        }).join('')}</div>
        ${pr.bestFillerRate !== null ? `<div class="card"><b>Record mots-béquilles</b><p>${pr.bestFillerRate} % des mots</p></div>` : ''}
        <div class="list">
          <button class="row" id="plan"><span class="em">🗺️</span><div><b>Voir mon plan</b><small>4 semaines personnalisées</small></div>›</button>
          <button class="row" id="notif"><span class="em">🔔</span><div><b>Rappel quotidien</b><small>${'Notification' in window && Notification.permission === 'granted' ? 'Activé' : 'Recevoir une notification pour ne pas casser ta série'}</small></div>›</button>
          <button class="row" id="retake"><span class="em">🔁</span><div><b>Refaire le test</b><small>Recalcule ton profil</small></div>›</button>
          <button class="row danger" id="reset"><span class="em">🗑️</span><div><b>Tout effacer</b><small>Supprime tes données de cet appareil</small></div>›</button>
        </div>
      </section>`);
    on('#plan', 'click', () => Plan(false));
    on('#notif', 'click', async () => { if ('Notification' in window) { await Notification.requestPermission(); Profile(); } else alert('Notifications non disponibles sur ce navigateur.'); });
    on('#retake', 'click', () => Quiz(0, {}));
    on('#reset', 'click', () => { if (confirm('Effacer toute ta progression ?')) { state = fresh(); save(); Welcome(); } });
  }

  function maybeNotify() {
    try {
      if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker?.controller) {
        // rappel simple : notification de félicitations ; un vrai rappel planifié nécessiterait un serveur push
        navigator.serviceWorker.ready.then(r => r.showNotification('Talking', { body: 'Séance validée ! À demain pour garder ta série 🔥', icon: 'assets/icon.svg' }));
      }
    } catch { }
  }

  // ---------- démarrage ----------
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  state.profile ? Home() : Welcome();
})();
