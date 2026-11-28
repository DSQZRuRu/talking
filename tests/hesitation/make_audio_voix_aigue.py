import sys, os, random, numpy as np
sys.argv = [sys.argv[0], sys.argv[1]]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mkaudio.py')).read().split("phr = [")[0])
phr = ["J'ai commencé un nouveau travail le mois dernier.", "L'équipe est vraiment sympa et très accueillante.", "Le plus dur, c'est de retenir tous les prénoms.", "Mais je pense que ça va venir assez vite."]
segs = [espeak(p, pitch=random.choice([70, 80, 90]), speed=170, voice='fr+f3') for p in phr]
save('voix_aigue_propre.wav', np.concatenate(sum([[s, sil(0.3)] for s in segs], [])))
parts = []
for k, s in enumerate(segs):
    parts += [s, sil(0.15)]
    if k < 3: parts += [euh([0.4, 0.55, 0.35][k], f0=random.choice([200, 215, 230]), fall=12), sil(0.15)]
save('voix_aigue_3_euh.wav', np.concatenate(parts), snr=22)
print('ok')
