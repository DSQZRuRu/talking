// Fait passer chaque fichier WAV dans le détecteur, par blocs de 1024 échantillons comme le micro.
const fs = require('fs'), path = require('path');
const { HesitationDetector } = require(process.argv[2]);
const dir = process.argv[3]; const opts = process.argv[4] ? JSON.parse(process.argv[4]) : {};
const expected = { 'propre.wav': 0, 'propre_bruit.wav': 0, 'avec_6_euh.wav': 6, 'avec_6_euh_bruit.wav': 6, 'euh_courts.wav': 3, 'espeak_euh.wav': 1, 'voix_aigue_propre.wav': 0, 'voix_aigue_3_euh.wav': 3 };
function readWav(f) {
  const b = fs.readFileSync(f); const sr = b.readUInt32LE(24); let o = 12;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'data') { o += 8; const n = sz / 2, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = b.readInt16LE(o + 2 * i) / 32768; return { sr, x }; } o += 8 + sz; }
}
for (const name of Object.keys(expected)) {
  const { sr, x } = readWav(path.join(dir, name));
  // le micro du téléphone tourne en général à 48 kHz : on suréchantillonne pour être réaliste
  const up = 3, y = new Float32Array(x.length * up); for (let i = 0; i < y.length; i++) { const p = i / up, k = Math.floor(p), f = p - k; y[i] = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f; }
  const d = new HesitationDetector(sr * up, opts);
  const t0 = Date.now(); for (let i = 0; i < y.length; i += 1024) d.push(y.subarray(i, i + 1024)); d.finish();
  const secs = y.length / (sr * up);
  console.log(`${name.padEnd(22)} attendu ${expected[name]}  détecté ${d.count}  ${d.events.map(e => (e.atMs / 1000).toFixed(1) + 's/' + e.durMs + 'ms').join(' ')}  [${((Date.now() - t0) / secs).toFixed(1)} ms de calcul par seconde d'audio]`);
}
