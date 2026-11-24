# Talking — 9 minutes par jour pour mieux parler

Une app web (PWA, sans serveur) d'entraînement à la conversation : arrêter de parler de la météo, ne plus geler, savoir quoi répondre au boulot, à un inconnu ou à quelqu'un qui te plaît.

## Fonctionnement
1. **Test (2 min)** : 8 questions sur tes réflexes + le **Mini-SPIN** (questionnaire validé de dépistage du trac social, Connor et al. 2001) + ton objectif → profil sur 5 compétences et plan sur 4 semaines. Si le score de trac est élevé, l'app oriente aussi vers un professionnel (les TCC sont le traitement de référence).
2. **Séance quotidienne (~9 min)** :
   - 🔁 **Rappels espacés** des leçons déjà vues (J+1, J+3, J+7, J+16, J+35) : pratique de récupération
   - 📘 **Leçon sourcée** (3 cartes) avec **niveau de preuve** et références
   - 🎭 **2 situations** avec feedback expliqué et principe associé
   - ✍️ **Reformulation** (réciprocité, ou réponse de soutien)
   - 🎙️ **Parle 60 s** : reconnaissance vocale fr-FR, béquilles/min et débit comparés à ta propre moyenne, **réécoute** avec préparation cognitive (Harvey et al. 2000)
   - 🌍 **Défi terrain** gradué (4 niveaux) : plan « Quand…, je… » (intentions de mise en œuvre) + prédiction du stress et du résultat
3. **Bilan du défi** : stress et résultat réels comparés à la prédiction (expérience comportementale des TCC). L'app calcule ton écart moyen prédiction/réalité et ajuste le niveau des défis.
4. **Entraînement libre**, **journal des défis**, **page Sources et méthode**.

## Contenu
25 leçons, chacune classée : 🔬 preuves solides · 🧪 preuves limitées · 🛠️ technique de praticien · 🚫 mythe démonté. Exemples : questions de relance (Huang et al. 2017), réciprocité des confidences (Sprecher et al. 2013), conversations profondes (Kardas et al. 2022), « liking gap » (Boothby et al. 2018), illusion de transparence (Savitsky & Gilovich 2003), comportements de sécurité (McManus et al. 2008), réécriture « je suis excité·e » avec sa réplication de 2025, soupir cyclique (Balban et al. 2023), réponse active-constructive (Gable et al. 2004), mythes de la posture de puissance et du 7-38-55 %.

Les résultats sont présentés avec leurs limites (corrélationnel, ressenti seulement, non répliqué…). Les scores de l'app sont indicatifs.

> Talking est un outil d'entraînement, pas un traitement.

## Lancer
```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```
Aucune dépendance. Déployable tel quel sur GitHub Pages, Netlify, Vercel… La reconnaissance vocale marche sur Chrome/Edge/Safari (en HTTPS) ; ailleurs, l'exercice passe en auto-évaluation.

## Structure
- `index.html` – coquille
- `data.js` – tout le contenu sourcé (test, Mini-SPIN, leçons + références, situations, reformulations, sujets, défis)
- `app.js` – logique (onboarding, séance, progression)
- `styles.css` – thème mobile
- `sw.js`, `manifest.json` – installation hors-ligne
