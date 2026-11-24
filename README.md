# Talking — 9 minutes par jour pour mieux parler

Une app web (PWA, sans serveur) d'entraînement à la conversation : arrêter de parler de la météo, ne plus geler, savoir quoi répondre au boulot, à un inconnu ou à quelqu'un qui te plaît.

## Fonctionnement
1. **Test de 1 minute** : 8 questions + objectif (travail, société, séduction) → profil sur 5 compétences (Small talk, Assurance, Clarté, Écoute, Storytelling) et **plan personnalisé sur 4 semaines**.
2. **Séance quotidienne (~9 min)** :
   - 📘 Leçon express (3 cartes), choisie selon tes points faibles
   - 🎭 3 situations réelles : choisis la bonne réplique, avec explication
   - ✍️ Reformulation : transforme une réponse plate (« Ouais. ») avec la formule *réaction honnête + question*
   - 🎙️ Parle 60 s : reconnaissance vocale du navigateur (fr-FR) qui compte tes « euh / du coup / en fait » et mesure ton débit
3. **Motivation** : série de jours 🔥, XP, progression par compétence, mission du jour.
4. **Entraînement libre** : toutes les situations, reformulations, leçons.

Les données restent dans le `localStorage` de l'appareil.

## Lancer
```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```
Aucune dépendance. Déployable tel quel sur GitHub Pages, Netlify, Vercel… La reconnaissance vocale marche sur Chrome/Edge/Safari (en HTTPS) ; ailleurs, l'exercice passe en auto-évaluation.

## Structure
- `index.html` – coquille
- `data.js` – tout le contenu (test, leçons, situations, reformulations, sujets) : facile à enrichir
- `app.js` – logique (onboarding, séance, progression)
- `styles.css` – thème mobile
- `sw.js`, `manifest.json` – installation hors-ligne
