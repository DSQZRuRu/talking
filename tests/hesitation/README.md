# Tests du détecteur de « euh » (`hesitation.js`)

Génère des enregistrements français (synthèse espeak-ng + « euh » synthétiques par formants), puis vérifie
les détections attendues : aucune fausse alerte sur la parole normale, « euh » ≥ 0,3 s repérés.

```bash
sudo apt-get install -y espeak-ng      # + python3-numpy
mkdir -p /tmp/audio
python3 tests/hesitation/make_audio.py /tmp/audio
python3 tests/hesitation/make_audio_voix_aigue.py /tmp/audio
node tests/hesitation/run.js "$PWD/hesitation.js" /tmp/audio
```
