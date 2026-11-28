import subprocess, wave, numpy as np, sys, os, random
out = sys.argv[1]; SR = 16000
random.seed(4); np.random.seed(4)
def espeak(text, pitch=50, speed=165, voice='fr'):
    p = os.path.join(out, '_tmp.wav')
    subprocess.run(['espeak-ng', '-v', voice, '-p', str(pitch), '-s', str(speed), '-w', p, text], check=True)
    with wave.open(p) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    # rééchantillonnage simple vers SR
    t = np.linspace(0, len(x) / sr, int(len(x) * SR / sr), endpoint=False)
    return np.interp(t, np.arange(len(x)) / sr, x)
def euh(dur, f0=118, fall=6):
    # Pause remplie synthétique : train d'impulsions glottiques (jitter, shimmer) filtré par les formants de [ø]/[ə].
    n = int(dur * SR); y = np.zeros(n); t = 0.0
    while t < dur:
        f = f0 - fall * t / dur; f *= 1 + np.random.randn() * 0.012
        i = int(t * SR)
        if i < n: y[i] = 1 + np.random.randn() * 0.06
        t += 1 / f
    for F, B in [(430, 80), (1450, 110), (2450, 160), (3300, 220)]:
        r = np.exp(-np.pi * B / SR); th = 2 * np.pi * F / SR
        a1, a2 = -2 * r * np.cos(th), r * r; z = np.zeros(n); z1 = z2 = 0.0
        for k in range(n):
            v = y[k] - a1 * z1 - a2 * z2; z[k] = v; z2, z1 = z1, v
        y = z
    env = np.minimum(1, np.minimum(np.arange(n) / (0.04 * SR), (n - np.arange(n)) / (0.06 * SR)))
    y = y * env; return y / (np.abs(y).max() + 1e-9) * 0.35
def sil(d): return np.zeros(int(d * SR))
def save(name, x, snr=None):
    if snr is not None:
        p = np.mean(x[np.abs(x) > 0.01] ** 2); x = x + np.random.randn(len(x)) * np.sqrt(p / 10 ** (snr / 10))
    x = np.clip(x, -1, 1)
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
phr = ["Je pense que la semaine de quatre jours est une bonne idée.", "Dans mon équipe, on l'a testé pendant trois mois.",
       "Les gens étaient plus reposés et plus efficaces.", "Par contre, il faut bien organiser les réunions.",
       "Du coup, je proposerais de commencer par un essai.", "Et ensuite, on fera le point avec tout le monde.",
       "Franchement, ce qui m'a le plus surpris, c'est la bonne humeur.", "Alors voilà, c'est pour ça que je suis pour."]
segs = [espeak(p, pitch=random.choice([35, 45, 55, 65]), speed=random.choice([150, 170, 185])) for p in phr]
clean = np.concatenate(sum([[s, sil(0.35)] for s in segs], []))
save('propre.wav', clean); save('propre_bruit.wav', clean, snr=18)
durs = [0.32, 0.45, 0.6, 0.38, 0.7, 0.5]; parts = []
for k, s in enumerate(segs):
    parts += [s, sil(0.15)]
    if k < len(durs): parts += [euh(durs[k], f0=random.choice([105, 118, 130])), sil(0.15)]
withe = np.concatenate(parts)
save('avec_6_euh.wav', withe); save('avec_6_euh_bruit.wav', withe, snr=18)
# euh très courts (difficiles) : 3 de 0,2 s
parts = []
for k, s in enumerate(segs[:4]):
    parts += [s, sil(0.1)]
    if k < 3: parts += [euh(0.2), sil(0.1)]
save('euh_courts.wav', np.concatenate(parts))
# « euh » prononcé par la synthèse vocale elle-même, étiré
save('espeak_euh.wav', np.concatenate([segs[0], sil(0.2), espeak('euuuuuh', speed=80), sil(0.2), segs[1]]))
print('ok')
