/* Détection acoustique des hésitations (« euh », « heu », « hum », syllabes étirées).
 *
 * Les moteurs de reconnaissance vocale suppriment volontairement les « euh » de leurs transcriptions :
 * on les repère donc dans le son lui-même. Un « euh » (pause remplie) a une signature acoustique bien
 * décrite en phonétique : une voyelle tenue, voisée, de 250 ms ou plus, avec une hauteur (F0) presque
 * plate et un timbre (spectre) qui ne bouge pas. En parole normale, la hauteur et les voyelles changent
 * toutes les ~100 ms.
 *
 * Fonctionnement : le signal est ramené à ~12 kHz, découpé en fenêtres de 40 ms toutes les 20 ms.
 * Pour chaque fenêtre : énergie, voisement et F0 (autocorrélation normalisée), et 20 bandes d'énergie
 * spectrale (FFT). Une hésitation = une suite de fenêtres voisées dont la F0 et le spectre restent stables
 * pendant au moins MIN_MS.
 *
 * Utilisable dans le navigateur (window.TalkingHesitation) et dans Node (module.exports) pour les tests.
 */
(function (root) {
  'use strict';

  const TARGET_SR = 12000;
  const WIN = 512;          // ~43 ms à 12 kHz
  const HOP = 240;          // 20 ms
  const F0_MIN = 70, F0_MAX = 400;
  const BANDS = 20, BAND_LO = 150, BAND_HI = 4000;

  const DEFAULTS = {
    minMs: 280,             // durée minimale d'une voyelle tenue pour compter comme hésitation
    voicedDb: 14,           // énergie au-dessus du bruit de fond pour être considéré comme de la voix
    periodicity: 0.5,       // autocorrélation normalisée minimale (voisement)
    stepSemitones: 0.9,     // variation max de F0 entre deux fenêtres
    residSemitones: 0.55,   // écart max de la F0 autour d'une droite (hauteur régulière)
    slopeSemitonesPerSec: 9, // pente max de cette droite (glissement doux, pas une intonation de phrase)
    fluxDb: 3.2,            // variation spectrale moyenne max entre deux fenêtres (timbre stable)
    gapMs: 250,             // écart minimal entre deux hésitations comptées
  };

  // FFT radix-2 en place (réel → magnitudes).
  function fftMag(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
        }
      }
    }
    const mag = new Float32Array(n / 2);
    for (let k = 0; k < n / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
    return mag;
  }

  const HANN = new Float32Array(WIN).map((_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (WIN - 1)));
  // Bandes réparties sur une échelle logarithmique (proche de la perception).
  const BAND_EDGES = Array.from({ length: BANDS + 1 }, (_, b) => {
    const f = BAND_LO * Math.pow(BAND_HI / BAND_LO, b / BANDS);
    return Math.round(f / TARGET_SR * WIN);
  });

  // Écart (en demi-tons) entre la F0 et une courbe douce (parabole) ajustée aux moindres carrés :
  // petit pour une voix tenue qui glisse régulièrement, grand quand la hauteur fait des à-coups.
  function smoothResidual(y) {
    const n = y.length; let S0 = n, S1 = 0, S2 = 0, S3 = 0, S4 = 0, T0 = 0, T1 = 0, T2 = 0;
    for (let i = 0; i < n; i++) { const t = i / n, t2 = t * t; S1 += t; S2 += t2; S3 += t2 * t; S4 += t2 * t2; T0 += y[i]; T1 += y[i] * t; T2 += y[i] * t2; }
    const M = [[S0, S1, S2, T0], [S1, S2, S3, T1], [S2, S3, S4, T2]];
    for (let c = 0; c < 3; c++) {           // élimination de Gauss
      let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]]; if (Math.abs(M[c][c]) < 1e-12) return 0;
      for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
    }
    const a = M[0][3] / M[0][0], b = M[1][3] / M[1][1], c = M[2][3] / M[2][2];
    let res = 0; for (let i = 0; i < n; i++) { const t = i / n, d = y[i] - (a + b * t + c * t * t); res += d * d; }
    return Math.sqrt(res / n);
  }

  class HesitationDetector {
    constructor(sampleRate, opts = {}) {
      this.o = Object.assign({}, DEFAULTS, opts);
      this.ratio = sampleRate / TARGET_SR;  // décimation simple après filtre passe-bas
      this.lp = 0; this.acc = 0; this.phase = 0;
      this.buf = new Float32Array(WIN); this.fill = 0; this.sinceHop = 0;
      this.frame = 0;
      this.floorHist = []; this.floor = -70;
      this.run = null; this.prevBands = null; this.prevF0 = 0;
      this.events = []; this.lastEventEnd = -1e9;
      this.maxAbs = 0; this.voicedFrames = 0;
    }
    get count() { return this.events.length; }
    get msPerFrame() { return HOP / TARGET_SR * 1000; }

    // Reçoit des échantillons bruts (Float32, -1..1) à la fréquence d'origine.
    push(samples) {
      const a = Math.exp(-2 * Math.PI * 5000 / (TARGET_SR * this.ratio)); // passe-bas ~5 kHz
      for (let i = 0; i < samples.length; i++) {
        const x = samples[i];
        const ax = x < 0 ? -x : x; if (ax > this.maxAbs) this.maxAbs = ax;
        this.lp = a * this.lp + (1 - a) * x;
        this.acc += this.lp; this.phase += 1;
        if (this.phase >= this.ratio) {
          const y = this.acc / this.phase; this.acc = 0; this.phase -= this.ratio;
          if (this.fill < WIN) this.buf[this.fill++] = y;
          else { this.buf.copyWithin(0, 1); this.buf[WIN - 1] = y; }
          if (this.fill === WIN && ++this.sinceHop >= HOP) { this.sinceHop = 0; this.analyze(); }
        }
      }
    }

    analyze() {
      const o = this.o, x = this.buf;
      this.frame++;
      // Énergie
      let e = 0; for (let i = 0; i < WIN; i++) e += x[i] * x[i];
      const db = 10 * Math.log10(e / WIN + 1e-12);
      // Bruit de fond : 10e percentile des 3 dernières secondes
      this.floorHist.push(db); if (this.floorHist.length > 150) this.floorHist.shift();
      if (this.frame % 10 === 0) { const s = this.floorHist.slice().sort((p, q) => p - q); this.floor = s[Math.floor(s.length * 0.1)]; }
      // F0 par autocorrélation normalisée
      let f0 = 0, best = 0;
      if (db > this.floor + o.voicedDb) {
        const lmin = Math.floor(TARGET_SR / F0_MAX), lmax = Math.ceil(TARGET_SR / F0_MIN);
        let mean = 0; for (let i = 0; i < WIN; i++) mean += x[i]; mean /= WIN;
        const c = new Float32Array(WIN); for (let i = 0; i < WIN; i++) c[i] = x[i] - mean;
        const rs = new Float32Array(lmax + 2);
        for (let lag = lmin; lag <= lmax + 1; lag++) {
          let num = 0, d1 = 0, d2 = 0;
          for (let i = 0; i + lag < WIN; i++) { const p = c[i], q = c[i + lag]; num += p * q; d1 += p * p; d2 += q * q; }
          rs[lag] = num / Math.sqrt(d1 * d2 + 1e-12);
          if (lag <= lmax && rs[lag] > best) best = rs[lag];
        }
        // Contre les erreurs d'octave : on prend le premier pic (la hauteur la plus aiguë)
        // dont la corrélation est presque aussi bonne que le meilleur.
        let bestLag = 0;
        for (let lag = lmin + 1; lag <= lmax; lag++) {
          if (rs[lag] >= rs[lag - 1] && rs[lag] >= rs[lag + 1] && rs[lag] >= 0.88 * best) { bestLag = lag; break; }
        }
        if (best >= o.periodicity && bestLag) f0 = TARGET_SR / bestLag;
      }
      // Bandes spectrales (dB)
      const re = new Float32Array(WIN), im = new Float32Array(WIN);
      for (let i = 0; i < WIN; i++) re[i] = x[i] * HANN[i];
      const mag = fftMag(re, im);
      const bands = new Float32Array(BANDS);
      for (let b = 0; b < BANDS; b++) {
        let s = 0; const lo = BAND_EDGES[b], hi = Math.max(BAND_EDGES[b + 1], lo + 1);
        for (let k = lo; k < hi; k++) s += mag[k] * mag[k];
        bands[b] = 10 * Math.log10(s / (hi - lo) + 1e-12);
      }
      let flux = Infinity;
      if (this.prevBands) { flux = 0; for (let b = 0; b < BANDS; b++) flux += Math.abs(bands[b] - this.prevBands[b]); flux /= BANDS; }
      this.prevBands = bands;

      const st = f => 12 * Math.log2(f / 100);
      const voiced = f0 > 0;
      if (voiced) this.voicedFrames++;
      const stable = voiced && this.prevF0 > 0 && Math.abs(st(f0) - st(this.prevF0)) < o.stepSemitones && flux < o.fluxDb * 1.6;
      if (stable) {
        if (!this.run) this.run = { start: this.frame - 1, f0s: [this.prevF0], flux: [] };
        this.run.f0s.push(f0); this.run.flux.push(flux);
      } else this.closeRun();
      this.prevF0 = f0;
    }

    closeRun() {
      const r = this.run; this.run = null;
      if (!r) return;
      const ms = r.f0s.length * this.msPerFrame;
      if (ms < this.o.minMs) return;
      // La hauteur d'un « euh » est plate ou glisse doucement (souvent vers le bas) : on ajuste une droite
      // et on regarde l'écart à cette droite et la pente. La parole, elle, monte et descend à chaque syllabe.
      const sts = r.f0s.map(f => 12 * Math.log2(f / 100));
      const n = sts.length, tm = (n - 1) / 2, ym = sts.reduce((p, q) => p + q, 0) / n;
      let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (i - tm) * (sts[i] - ym); sxx += (i - tm) * (i - tm); }
      const slope = sxx ? sxy / sxx : 0;                       // demi-tons par fenêtre
      const resid = smoothResidual(sts);
      const slopePerSec = Math.abs(slope) * 1000 / this.msPerFrame;
      const meanFlux = r.flux.reduce((p, q) => p + q, 0) / r.flux.length;
      const startMs = r.start * this.msPerFrame;
      if (resid <= this.o.residSemitones && slopePerSec <= this.o.slopeSemitonesPerSec && meanFlux <= this.o.fluxDb && startMs - this.lastEventEnd >= this.o.gapMs) {
        this.events.push({ atMs: Math.round(startMs), durMs: Math.round(ms) });
        this.lastEventEnd = startMs + ms;
        if (this.onEvent) this.onEvent(this.events.length);
      }
    }
    finish() { this.closeRun(); return this.events; }
  }

  const api = { HesitationDetector, DEFAULTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TalkingHesitation = api;
})(typeof window !== 'undefined' ? window : this);
