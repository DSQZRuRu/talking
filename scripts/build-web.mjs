// Copie l'app web dans www/ (dossier embarqué dans l'APK) et y écrit la version.
// APP_VERSION et APP_REPO viennent de la CI ; valeurs par défaut en local.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const version = process.env.APP_VERSION || '0.0.0-dev';
const repo = process.env.APP_REPO || 'DSQZRuRu/talking';
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const f of ['index.html', 'config.js', 'styles.css', 'app.js', 'data.js', 'hesitation.js', 'manifest.json', 'sw.js', 'assets', 'vendor', 'fonts']) {
  cpSync(f, `www/${f}`, { recursive: true });
}
const info = `window.TALKING_BUILD = ${JSON.stringify({ version, repo })};\n`;
writeFileSync('www/version.js', info);
writeFileSync('version.js', info);
console.log(`www/ prêt — version ${version}`);
