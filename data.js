// Contenu pédagogique de Talking — fondé sur la recherche.
// Chaque leçon indique ses sources et un niveau de preuve :
//   'solide'   : plusieurs expériences publiées, résultats cohérents
//   'limitee'  : résultats encourageants mais peu répliqués, auto-déclarés ou corrélationnels
//   'pratique' : technique de formateurs largement utilisée, non testée scientifiquement
//   'mythe'    : idée répandue que la recherche ne soutient pas

const SKILLS = {
  smalltalk: { name: 'Conversation', icon: '💬', desc: 'Lancer et faire vivre un échange.' },
  assurance: { name: 'Assurance', icon: '🦁', desc: 'Parler malgré le trac.' },
  clarte:    { name: 'Clarté', icon: '🎯', desc: 'Dire l\'essentiel, simplement.' },
  ecoute:    { name: 'Écoute', icon: '👂', desc: 'Faire sentir à l\'autre qu\'il est compris.' },
  recit:     { name: 'Récit', icon: '📖', desc: 'Raconter de façon vivante.' },
};

const EVIDENCE = {
  solide:   { label: 'Preuves solides', icon: '🔬' },
  limitee:  { label: 'Preuves limitées', icon: '🧪' },
  pratique: { label: 'Technique de praticien', icon: '🛠️' },
  mythe:    { label: 'Mythe démonté', icon: '🚫' },
};

// ---------------- Test initial ----------------
// Partie 1 : réflexes de conversation (points de « besoin » par compétence).
const QUIZ = [
  {
    q: 'Dans un ascenseur, un collègue te lance : « Grosse journée ? » Tu…',
    options: [
      { t: 'Réponds « Ouais… » et regardes ton téléphone', w: { smalltalk: 3, assurance: 2 } },
      { t: 'Embrayes sur la météo, faute de mieux', w: { smalltalk: 2 } },
      { t: 'Réponds vraiment, puis lui retournes une question', w: {} },
    ],
  },
  {
    q: 'Quand tu dois donner ton avis en réunion…',
    options: [
      { t: 'J\'attends le moment parfait… qui ne vient pas', w: { assurance: 3 } },
      { t: 'Je parle, mais je tourne autour du pot', w: { clarte: 3 } },
      { t: 'Je donne ma conclusion puis ma raison', w: {} },
    ],
  },
  {
    q: 'Pendant que l\'autre parle, tu es surtout en train de…',
    options: [
      { t: 'Préparer ce que je vais dire ensuite', w: { ecoute: 3 } },
      { t: 'Surveiller l\'impression que je donne', w: { assurance: 3 } },
      { t: 'Chercher ce que je pourrais lui demander', w: {} },
    ],
  },
  {
    q: 'Un ami te dit : « Mon chien s\'est échappé hier. » Ta réponse naturelle :',
    options: [
      { t: '« Le mien aussi une fois, il était parti trois heures ! »', w: { ecoute: 3 } },
      { t: '« Ah mince. »', w: { ecoute: 2, smalltalk: 1 } },
      { t: '« Oh non ! Tu l\'as retrouvé où ? »', w: {} },
    ],
  },
  {
    q: 'Quand tu racontes une anecdote, les gens…',
    options: [
      { t: 'Décrochent avant la fin', w: { recit: 3, clarte: 1 } },
      { t: 'Sourient poliment', w: { recit: 2 } },
      { t: 'Rient ou posent des questions', w: {} },
    ],
  },
  {
    q: 'Après une discussion avec quelqu\'un de nouveau, tu penses en général…',
    options: [
      { t: '« Je l\'ai sûrement ennuyé·e »', w: { assurance: 3 } },
      { t: '« Bof, c\'était moyen »', w: { assurance: 1, smalltalk: 1 } },
      { t: '« C\'était sympa »', w: {} },
    ],
  },
  {
    q: 'Tes « euh », « du coup », « en fait »…',
    options: [
      { t: 'Partout, et je m\'entends les dire', w: { clarte: 3 } },
      { t: 'Surtout quand je suis stressé·e', w: { clarte: 1, assurance: 1 } },
      { t: 'Rarement', w: {} },
    ],
  },
  {
    q: 'Pour te rassurer en soirée, tu as tendance à…',
    options: [
      { t: 'Rester collé·e à une personne que je connais / à mon téléphone', w: { assurance: 3, smalltalk: 1 } },
      { t: 'Préparer mentalement mes phrases', w: { assurance: 2, ecoute: 1 } },
      { t: 'Rien de particulier', w: {} },
    ],
  },
];

// Partie 2 : Mini-SPIN (Connor et al., 2001) — dépistage du trac social, 0 à 4 par item.
// Score total ≥ 6 : signe possible d'anxiété sociale marquée (dépistage, pas un diagnostic).
const MINISPIN = [
  'La peur d\'être gêné·e me fait éviter de faire certaines choses ou de parler aux gens.',
  'J\'évite les activités où je suis le centre de l\'attention.',
  'Être gêné·e ou avoir l\'air bête fait partie de mes pires peurs.',
];
const MINISPIN_SCALE = ['Pas du tout', 'Un peu', 'Moyennement', 'Beaucoup', 'Extrêmement'];

const GOALS = [
  { id: 'pro', icon: '💼', t: 'Au travail', d: 'Réunions, chef, entretiens, réseau' },
  { id: 'social', icon: '🎉', t: 'En société', d: 'Soirées, inconnus, nouveaux amis' },
  { id: 'love', icon: '❤️', t: 'En séduction', d: 'Oser parler à quelqu\'un qui te plaît' },
  { id: 'all', icon: '✨', t: 'Partout', d: 'Être à l\'aise avec tout le monde' },
];

// ---------------- Leçons ----------------
// cards : 3 cartes. recall : questions de rappel espacé (pratique de récupération).
const LESSONS = [
  // ===== CONVERSATION =====
  {
    id: 'st-questions', skill: 'smalltalk', level: 'solide', title: 'La question de relance',
    cards: [
      { h: 'Ce que dit la recherche', p: 'À Harvard, des chercheurs ont analysé des centaines de conversations entre inconnus, y compris en speed dating. Les personnes qui posaient plus de questions étaient plus appréciées, et obtenaient plus de seconds rendez-vous.' },
      { h: 'Pas n\'importe quelles questions', p: 'L\'effet vient surtout des questions de relance : celles qui rebondissent sur ce que l\'autre vient de dire. Elles montrent que tu écoutes.', ex: '« J\'ai couru un semi ce week-end. » → « Ton premier ? Qu\'est-ce qui t\'a donné envie ? »' },
      { h: 'Le piège à éviter', p: 'Les gens sous-estiment cet effet : on croit qu\'il faut être intéressant, alors qu\'il suffit d\'être intéressé. Attention quand même à l\'interrogatoire : alterne avec ce que toi tu partages.' },
    ],
    src: ['Huang, Yeomans, Brooks, Minson & Gino (2017). It doesn\'t hurt to ask: Question-asking increases liking. Journal of Personality and Social Psychology, 113(3).'],
    recall: [
      { q: 'Quel type de question augmente le plus la sympathie qu\'on t\'accorde ?', o: ['Une question originale préparée à l\'avance', 'Une question de relance sur ce que l\'autre vient de dire', 'Une question sur l\'actualité'], a: 1 },
    ],
  },
  {
    id: 'st-reciprocite', skill: 'smalltalk', level: 'solide', title: 'Donner autant que demander',
    cards: [
      { h: 'Le ping-pong', p: 'Dans les expériences de rencontre entre inconnus, les paires qui se confient à tour de rôle s\'apprécient davantage que celles où une personne parle longtemps puis l\'autre.' },
      { h: 'La formule', p: 'Une réaction vraie sur toi + une question en retour. C\'est l\'antidote aux réponses en un mot.', ex: '« Grosse journée ? » → « Trois réunions et zéro café, je survis. Et toi, ta journée ? »' },
      { h: 'Monte par paliers', p: 'Les confidences fonctionnent quand elles montent progressivement et de façon réciproque : du léger (goûts, journée) vers le plus personnel (projets, valeurs). Ne saute pas d\'étapes.' },
    ],
    src: ['Sprecher, Treger, Wondra, Hilaire & Wallpe (2013). Taking turns: Reciprocal self-disclosure promotes liking in initial interactions. J. of Experimental Social Psychology, 49.', 'Collins & Miller (1994). Self-disclosure and liking: A meta-analytic review. Psychological Bulletin, 116(3).', 'Aron et al. (1997). The experimental generation of interpersonal closeness. Personality and Social Psychology Bulletin, 23(4).'],
    recall: [
      { q: 'Qu\'est-ce qui crée le plus de lien entre deux inconnus ?', o: ['Que l\'un parle beaucoup et l\'autre écoute', 'Se confier à tour de rôle', 'Éviter tout sujet personnel'], a: 1 },
    ],
  },
  {
    id: 'st-profond', skill: 'smalltalk', level: 'solide', title: 'Ose plus profond que la météo',
    cards: [
      { h: 'On se trompe', p: 'Dans une douzaine d\'expériences, des inconnus ont dû discuter soit de sujets légers, soit de sujets profonds. Les conversations profondes étaient bien moins gênantes et plus agréables que prévu.' },
      { h: 'Pourquoi on n\'ose pas', p: 'On sous-estime à quel point l\'autre a envie d\'en savoir plus sur nous. Le blocage vient de nos prédictions, pas de la réalité.' },
      { h: 'Des questions qui ouvrent', p: 'Passe du « quoi » au « pourquoi » et au « qu\'est-ce que ça t\'a fait ».', ex: '« Tu fais quoi dans la vie ? » → « Qu\'est-ce qui t\'a amené à ce métier ? » / « C\'est quoi la partie que tu préfères ? »' },
    ],
    src: ['Kardas, Kumar & Epley (2022). Overly shallow?: Miscalibrated expectations create a barrier to deeper conversation. Journal of Personality and Social Psychology, 122(3).'],
    recall: [
      { q: 'Avant une conversation profonde avec un inconnu, les gens…', o: ['Prédisent bien comment elle va se passer', 'Surestiment à quel point elle sera gênante', 'Sous-estiment à quel point elle sera gênante'], a: 1 },
    ],
  },
  {
    id: 'st-fils', skill: 'smalltalk', level: 'pratique', title: 'Les fils de conversation',
    cards: [
      { h: 'Chaque phrase contient des fils', p: 'Quand quelqu\'un parle, il te donne en général plusieurs sujets possibles. Tu n\'as pas à inventer : tu choisis un fil et tu tires dessus.' },
      { h: 'Exemple', p: '« Je suis crevé, j\'ai déménagé à Lyon ce week-end. »', ex: 'Fils : la fatigue · le déménagement · Lyon · pourquoi Lyon ? · seul ou à plusieurs ?' },
      { h: 'Exercice', p: 'Aujourd\'hui, à chaque phrase que tu entends, repère mentalement 2 fils. Garde-en un de côté pour relancer en cas de blanc.' },
    ],
    src: ['Technique enseignée en formation à la communication (« conversational threading »). Cohérente avec les résultats sur les questions de relance (Huang et al., 2017), mais non testée en tant que telle.'],
    recall: [
      { q: 'En cas de blanc, la technique des « fils » consiste à…', o: ['Changer complètement de sujet', 'Revenir sur un détail que l\'autre a mentionné plus tôt', 'Parler de la météo'], a: 1 },
    ],
  },
  {
    id: 'st-compliment', skill: 'smalltalk', level: 'solide', title: 'Les compliments font plus plaisir que tu ne crois',
    cards: [
      { h: 'Ce qu\'on imagine', p: 'On hésite à complimenter : peur que ce soit gênant, maladroit, mal pris.' },
      { h: 'Ce qui se passe', p: 'Dans cinq expériences, ceux qui faisaient un compliment sincère sous-estimaient l\'effet positif sur l\'autre et surestimaient la gêne.' },
      { h: 'Comment bien le faire', p: 'Sois précis et sincère, et porte sur un choix de la personne plutôt que sur son physique.', ex: '« Ta façon de recadrer la réunion tout à l\'heure, c\'était hyper efficace. »' },
    ],
    src: ['Boothby & Bohns (2021). Why a simple act of kindness is not as simple as it seems: Underestimating the positive impact of our compliments on others. Personality and Social Psychology Bulletin, 47(5).', 'Zhao & Epley (2021). Insufficiently complimentary?: Underestimating the positive impact of compliments creates a barrier to expressing them. JPSP, 121(2).'],
    recall: [
      { q: 'Quand on fait un compliment sincère, on a tendance à…', o: ['Surestimer le plaisir qu\'il fait', 'Sous-estimer le plaisir qu\'il fait', 'Bien prédire sa réception'], a: 1 },
    ],
  },
  {
    id: 'st-sortie', skill: 'smalltalk', level: 'limitee', title: 'Savoir finir une conversation',
    cards: [
      { h: 'Un constat surprenant', p: 'Une étude sur des centaines de conversations montre qu\'elles ne se terminent presque jamais au moment où les deux personnes le souhaitent. Et on devine mal quand l\'autre veut arrêter.' },
      { h: 'Conséquence', p: 'Finir n\'est pas impoli : c\'est normal. Mieux vaut partir sur une bonne note que laisser l\'échange s\'éteindre.' },
      { h: 'La sortie en 3 temps', p: 'Signale, résume, ouvre.', ex: '« Je vais devoir filer. J\'ai adoré ton histoire de rando, il faut que tu m\'envoies le nom du sentier ! »' },
    ],
    src: ['Mastroianni, Gilbert, Cooney & Wilson (2021). Do conversations end when people want them to? PNAS, 118(10). (La formule de sortie est une technique de praticien.)'],
    recall: [
      { q: 'D\'après la recherche, les conversations se terminent…', o: ['Presque toujours quand les deux le veulent', 'Rarement au moment souhaité par les deux', 'Toujours trop tôt'], a: 1 },
    ],
  },

  // ===== ASSURANCE =====
  {
    id: 'as-likinggap', skill: 'assurance', level: 'solide', title: 'Ils t\'apprécient plus que tu ne crois',
    cards: [
      { h: 'Le « liking gap »', p: 'Après une conversation avec un inconnu, on pense systématiquement que l\'autre nous a moins apprécié qu\'en réalité. L\'écart a été retrouvé après des conversations courtes ou longues, et même entre colocataires sur une année.' },
      { h: 'D\'où ça vient', p: 'De nos pensées autocritiques : plus on rumine ses « ratés », plus l\'écart est grand. Et l\'autre est trop occupé à se soucier de sa propre image pour noter les tiens.' },
      { h: 'Avec des inconnus aussi', p: 'Dans des expériences dans les transports, les gens prédisaient que parler à leur voisin serait désagréable. Ceux qui l\'ont fait ont passé un meilleur trajet, introvertis compris.' },
    ],
    src: ['Boothby, Cooney, Sandstrom & Clark (2018). The liking gap in conversations: Do people like us more than we think? Psychological Science, 29(11).', 'Epley & Schroeder (2014). Mistakenly seeking solitude. Journal of Experimental Psychology: General, 143(5).'],
    recall: [
      { q: 'Après une conversation avec quelqu\'un de nouveau, la plupart des gens…', o: ['Surestiment combien l\'autre les a appréciés', 'Sous-estiment combien l\'autre les a appréciés', 'Évaluent correctement'], a: 1 },
    ],
  },
  {
    id: 'as-transparence', skill: 'assurance', level: 'solide', title: 'Ton stress se voit moins que tu ne crois',
    cards: [
      { h: 'L\'illusion de transparence', p: 'On a l\'impression que notre nervosité est écrite sur notre visage. Les expériences montrent que les spectateurs la perçoivent beaucoup moins que l\'orateur ne le croit.' },
      { h: 'Le simple fait de le savoir aide', p: 'Dans une étude, des personnes à qui l\'on avait expliqué cette illusion avant un discours se sont senties moins stressées et ont été jugées meilleures.' },
      { h: 'À te répéter', p: '« Je le sens beaucoup plus qu\'ils ne le voient. » Tu viens de faire exactement l\'intervention testée.' },
    ],
    src: ['Savitsky & Gilovich (2003). The illusion of transparency and the alleviation of speech anxiety. Journal of Experimental Social Psychology, 39(6).', 'Gilovich, Medvec & Savitsky (2000). The spotlight effect in social judgment. JPSP, 78(2).'],
    recall: [
      { q: 'Qu\'est-ce qui a aidé les orateurs dans l\'étude sur l\'illusion de transparence ?', o: ['Imaginer le public en sous-vêtements', 'Savoir que leur nervosité se voit moins qu\'ils ne le pensent', 'Boire un café'], a: 1 },
    ],
  },
  {
    id: 'as-securite', skill: 'assurance', level: 'solide', title: 'Lâche tes béquilles de sécurité',
    cards: [
      { h: 'Les comportements de sécurité', p: 'Pour se protéger, on évite le regard, on reste sur son téléphone, on prépare ses phrases dans sa tête, on parle peu de soi. Ça semble rassurant…' },
      { h: '… mais ça se retourne contre toi', p: 'Dans les expériences, les personnes qui utilisaient ces comportements étaient jugées moins sympathiques et moins authentiques par leurs interlocuteurs. Quand elles les abandonnaient, les conversations se passaient mieux.' },
      { h: 'Le vrai moteur', p: 'L\'attention portée sur soi entretient le trac. Remplace-la par de la curiosité pour l\'autre. Ton anxiété peut monter un peu au début, puis elle baisse avec la répétition.' },
    ],
    src: ['Clark & Wells (1995). A cognitive model of social phobia. (Modèle de référence des thérapies cognitives et comportementales.)', 'McManus, Sacadura & Clark (2008). Why social anxiety persists: An experimental investigation of the role of safety behaviours. J. of Behavior Therapy and Experimental Psychiatry, 39(2).', 'Plasencia, Alden & Taylor (2011). Differential effects of safety behaviour subtypes in social anxiety disorder. Behaviour Research and Therapy, 49(10).'],
    recall: [
      { q: 'Rester sur son téléphone en soirée pour se rassurer…', o: ['Réduit l\'anxiété à long terme', 'Fait paraître moins sympathique et entretient le trac', 'N\'a aucun effet'], a: 1 },
    ],
  },
  {
    id: 'as-excitation', skill: 'assurance', level: 'limitee', title: '« Je suis excité·e » plutôt que « calme-toi »',
    cards: [
      { h: 'Se calmer, c\'est dur', p: 'Juste avant de parler, le cœur bat vite. Passer de l\'agitation au calme est difficile. Passer de l\'anxiété à l\'excitation est plus facile : c\'est la même activation physique.' },
      { h: 'L\'expérience', p: 'Avant un discours, des participants disaient à voix haute « Je suis excité·e » ou « Je suis calme ». Les premiers se sentaient plus enthousiastes et ont été jugés plus convaincants.' },
      { h: 'Honnêtement', p: 'Une réplication de 2025 retrouve l\'effet sur le ressenti, mais pas d\'amélioration mesurable de la performance. Ça ne coûte rien d\'essayer, mais ce n\'est pas magique.' },
    ],
    src: ['Brooks (2014). Get excited: Reappraising pre-performance anxiety as excitement. Journal of Experimental Psychology: General, 143(3).', 'Réplication (2025), « Getting excited about public speaking: A replication » — effet sur le ressenti, pas sur la performance observée.'],
    recall: [
      { q: 'Juste avant de parler en public, quelle phrase s\'est montrée la plus utile sur le ressenti ?', o: ['« Calme-toi »', '« Je suis excité·e »', '« Ne rate pas »'], a: 1 },
    ],
  },
  {
    id: 'as-soupir', skill: 'assurance', level: 'limitee', title: 'Le soupir physiologique',
    cards: [
      { h: 'La technique', p: 'Inspire par le nez, puis prends une 2ᵉ petite inspiration par-dessus pour remplir à fond. Expire lentement et longuement par la bouche. Répète quelques fois.' },
      { h: 'Ce qu\'on sait', p: 'Dans un essai randomisé de 2023, 5 min par jour de ce « soupir cyclique » amélioraient l\'humeur et ralentissaient la respiration un peu plus que la méditation. Tous les groupes, méditation comprise, voyaient leur anxiété baisser.' },
      { h: 'Usage', p: 'Une ou deux respirations de ce type avant d\'entrer dans une réunion ou d\'aborder quelqu\'un. C\'est un outil, pas un traitement.' },
    ],
    src: ['Balban, Neri, Kogon, Weed, Nouriani, Jo, Holl, Zeitzer, Spiegel & Huberman (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine, 4(1).'],
    recall: [
      { q: 'Le soupir physiologique, c\'est…', o: ['Retenir sa respiration 10 secondes', 'Double inspiration par le nez, longue expiration par la bouche', 'Respirer très vite'], a: 1 },
    ],
  },
  {
    id: 'as-conseil', skill: 'assurance', level: 'solide', title: 'Demander conseil te rend plus crédible',
    cards: [
      { h: 'La peur', p: 'On évite de demander conseil de peur de paraître incompétent·e.' },
      { h: 'Le résultat', p: 'Dans cinq expériences, les personnes qui demandaient conseil étaient jugées plus compétentes, surtout sur une tâche difficile et quand on s\'adressait directement à la personne.' },
      { h: 'Le bon usage', p: 'Demande à quelqu\'un qui s\'y connaît vraiment, sur un vrai problème. C\'est aussi une excellente façon d\'engager la conversation.', ex: '« Tu as l\'air de bien connaître le quartier : tu me conseillerais quoi pour un bon resto ? »' },
    ],
    src: ['Brooks, Gino & Schweitzer (2015). Smart people ask for (my) advice: Seeking advice boosts perceptions of competence. Management Science, 61(6).'],
    recall: [
      { q: 'Demander conseil sur une tâche difficile à un expert…', o: ['Fait paraître moins compétent', 'Fait paraître plus compétent', 'N\'a pas d\'effet'], a: 1 },
    ],
  },
  {
    id: 'as-mythe-posture', skill: 'assurance', level: 'mythe', title: 'Mythe : la « posture de puissance »',
    cards: [
      { h: 'L\'idée célèbre', p: 'Une conférence TED très vue affirmait que tenir une posture de « superhéros » 2 minutes changeait les hormones et la prise de risque.' },
      { h: 'Ce qui s\'est passé', p: 'Une réplication sur 200 personnes n\'a trouvé aucun effet sur les hormones ni sur le comportement. La co-autrice principale de l\'étude d\'origine a publiquement déclaré en 2016 ne plus croire à ces effets.' },
      { h: 'Ce qui reste', p: 'Un petit effet sur le sentiment de puissance déclaré. Ne compte pas dessus : la répétition et l\'exposition réelle font beaucoup plus.' },
    ],
    src: ['Ranehill et al. (2015). Assessing the robustness of power posing. Psychological Science, 26(5).', 'Déclaration de Dana Carney (2016), co-autrice de l\'étude d\'origine.'],
    recall: [
      { q: 'La « posture de puissance » change-t-elle les hormones ?', o: ['Oui, c\'est démontré', 'Non, cela ne s\'est pas répliqué', 'Seulement le matin'], a: 1 },
    ],
  },

  // ===== CLARTÉ =====
  {
    id: 'cl-conclusion', skill: 'clarte', level: 'pratique', title: 'Commence par la conclusion',
    cards: [
      { h: 'Le réflexe naturel', p: 'On raconte dans l\'ordre où on a réfléchi : contexte, détails… et la conclusion arrive à la fin, quand l\'attention est déjà partie.' },
      { h: 'Le principe de la pyramide', p: 'Mets la conclusion d\'abord, puis les arguments qui la soutiennent. C\'est la règle utilisée dans le conseil et l\'armée (« BLUF : bottom line up front »).', ex: '« Il faut décaler le lancement au 15. Deux raisons : les tests ne sont pas finis, et le client est en congé le 8. »' },
      { h: 'Test', p: 'Si on ne t\'écoutait que 10 secondes, aurait-on compris l\'essentiel ?' },
    ],
    src: ['Minto, B. (1987). The Pyramid Principle. — Méthode de rédaction et de prise de parole standard en conseil, non testée expérimentalement en tant que telle.'],
    recall: [
      { q: 'Selon le principe de la pyramide, tu commences par…', o: ['Le contexte', 'La conclusion', 'Une anecdote'], a: 1 },
    ],
  },
  {
    id: 'cl-prep', skill: 'clarte', level: 'pratique', title: 'Improviser avec PREP',
    cards: [
      { h: 'Quand on te prend au dépourvu', p: 'Une question surprise en réunion, en entretien… Avoir une structure toute prête évite de partir dans tous les sens.' },
      { h: 'P-R-E-P', p: 'Point (ta position) → Raison (pourquoi) → Exemple (un cas concret) → Point (tu reformules ta position).', ex: '« Je suis pour le télétravail 2 jours. Ça réduit les trajets. L\'équipe de Marc l\'a testé : +15 % de tickets traités. Donc 2 jours me semble le bon équilibre. »' },
      { h: 'Entraîne-toi', p: 'L\'exercice « Parle 60 s » te propose régulièrement des sujets à traiter en PREP.' },
    ],
    src: ['Structure classique des formations à l\'improvisation orale (ex. Toastmasters). Technique de praticien, non testée expérimentalement.'],
    recall: [
      { q: 'Que veut dire PREP ?', o: ['Prépare, Répète, Essaie, Parle', 'Point, Raison, Exemple, Point', 'Pause, Respire, Écoute, Parle'], a: 1 },
    ],
  },
  {
    id: 'cl-euh', skill: 'clarte', level: 'limitee', title: 'Les « euh » : moins, mais pas zéro',
    cards: [
      { h: 'Ils servent à quelque chose', p: 'Les linguistes ont montré que « euh » signale à l\'auditeur qu\'un délai arrive. Certains travaux montrent même qu\'ils aident à reconnaître le mot qui suit. Viser zéro est inutile et stressant.' },
      { h: 'Mais en excès, ils coûtent', p: 'Plusieurs études trouvent qu\'un discours très chargé en « euh » et mots-béquilles (« du coup », « en fait ») paraît moins sûr et moins crédible.' },
      { h: 'Le remède', p: 'Remplace une partie de tes béquilles par une courte pause silencieuse. L\'exercice « Parle 60 s » les compte : compare-toi à toi-même, jour après jour.' },
    ],
    src: ['Clark & Fox Tree (2002). Using uh and um in spontaneous speaking. Cognition, 84(1).', 'Fox Tree (2001). Listeners\' uses of um and uh in speech comprehension. Memory & Cognition, 29(2).', 'Études sur la perception de crédibilité liée aux mots de remplissage : résultats variables selon les contextes.'],
    recall: [
      { q: 'Quel est le bon objectif pour les « euh » ?', o: ['Zéro absolu', 'En réduire l\'excès en les remplaçant par des pauses', 'Les ignorer complètement'], a: 1 },
    ],
  },
  {
    id: 'cl-pause', skill: 'clarte', level: 'pratique', title: 'La pause plutôt que la vitesse',
    cards: [
      { h: 'Le stress accélère', p: 'Sous pression, on parle plus vite et on enchaîne sans respirer, ce qui fait apparaître les béquilles.' },
      { h: 'La pause stratégique', p: 'Une pause juste avant ou après une idée importante lui donne du poids. Elle te laisse aussi le temps de trouver le mot suivant… sans « euh ».' },
      { h: 'Exercice', p: 'Pendant « Parle 60 s », fais une pause volontaire à la fin de chaque idée. Réécoute-toi : ce qui te paraît long ne l\'est presque jamais pour l\'auditeur.' },
    ],
    src: ['Technique centrale des formations à la prise de parole. Le lien entre pauses et réduction des mots de remplissage est cohérent avec Clark & Fox Tree (2002).'],
    recall: [
      { q: 'Plutôt que de dire « euh » pendant que tu cherches ton mot, tu peux…', o: ['Accélérer', 'Faire une courte pause silencieuse', 'Répéter le dernier mot'], a: 1 },
    ],
  },
  {
    id: 'cl-mythe-7-38-55', skill: 'clarte', level: 'mythe', title: 'Mythe : « 93 % de la communication est non verbale »',
    cards: [
      { h: 'La règle qu\'on cite partout', p: '7 % les mots, 38 % le ton, 55 % le visage. On l\'entend dans presque toutes les formations.' },
      { h: 'D\'où ça vient vraiment', p: 'De deux petites études de 1967 où des personnes entendaient des mots isolés exprimant un sentiment (aimer / ne pas aimer), avec un ton contradictoire. Aucune vraie conversation.' },
      { h: 'Ce qu\'il faut retenir', p: 'Le ton et le visage comptent surtout quand ils contredisent les mots. Pour transmettre une idée, ce que tu dis compte énormément : soigne le fond ET la forme.' },
    ],
    src: ['Mehrabian & Wiener (1967) ; Mehrabian & Ferris (1967). Mehrabian lui-même précise que ces chiffres ne s\'appliquent qu\'à la communication de sentiments et d\'attitudes.'],
    recall: [
      { q: 'La règle des 7-38-55 % s\'applique…', o: ['À toute communication', 'Seulement à des sentiments exprimés de façon contradictoire', 'Aux discours publics'], a: 1 },
    ],
  },

  // ===== ÉCOUTE =====
  {
    id: 'ec-soutien', skill: 'ecoute', level: 'pratique', title: 'Réponse de soutien, pas de détournement',
    cards: [
      { h: 'Deux façons de répondre', p: 'Le sociologue Charles Derber distingue la réponse de « détournement », qui ramène le sujet vers soi, et la réponse de « soutien », qui garde le projecteur sur l\'autre.' },
      { h: 'Exemple', p: '« Mon chien s\'est échappé hier. »', ex: 'Détournement : « Le mien aussi, une fois ! »\nSoutien : « Oh non ! Tu l\'as retrouvé où ? »' },
      { h: 'La règle', p: 'Avant de parler de toi, pose au moins une question de soutien. Ensuite seulement, partage ton expérience si elle apporte quelque chose.' },
    ],
    src: ['Derber, C. (1979, réédité en 2000). The Pursuit of Attention: Power and Ego in Everyday Life. — Observation sociologique ; cohérente avec Huang et al. (2017) sur les questions de relance.'],
    recall: [
      { q: '« J\'ai raté mon train ce matin. » Quelle est la réponse de soutien ?', o: ['« Moi aussi la semaine dernière ! »', '« Oh non, tu as pu arriver à l\'heure ? »', '« Les trains, c\'est toujours en retard. »'], a: 1 },
    ],
  },
  {
    id: 'ec-reformuler', skill: 'ecoute', level: 'solide', title: 'Reformuler pour prouver que tu as compris',
    cards: [
      { h: 'L\'écoute active', p: 'Reformuler avec tes mots ce que l\'autre veut dire, puis vérifier. Dans des expériences, les interlocuteurs qui recevaient ce type d\'écoute se sentaient mieux compris et appréciaient davantage la conversation.' },
      { h: 'La formule', p: '« Si je comprends bien, … ? »  ou  « Donc ce qui t\'agace, c\'est surtout … ? »', ex: '« Mon chef me demande des rapports que personne ne lit. » → « Donc ce qui te pèse, c\'est de faire un travail qui ne sert à rien ? »' },
      { h: 'Le bon dosage', p: 'Reformule les points importants, surtout les émotions, pas chaque phrase. Sinon, ça sonne mécanique.' },
    ],
    src: ['Weger, Castle & Emmett (2010). Active listening in peer interviews. International Journal of Listening, 24(1).', 'Weger, Castle Bell, Minei & Robinson (2014). The relative effectiveness of active listening in initial interactions. International Journal of Listening, 28(1).'],
    recall: [
      { q: 'Reformuler ce que dit l\'autre sert surtout à…', o: ['Gagner du temps', 'Lui montrer qu\'il est compris', 'Le corriger'], a: 1 },
    ],
  },
  {
    id: 'ec-acr', skill: 'ecoute', level: 'limitee', title: 'Réagir à une bonne nouvelle',
    cards: [
      { h: 'Quatre façons de réagir', p: 'Actif-constructif (enthousiaste, curieux), passif-constructif (« cool »), actif-destructif (« ça va te faire du boulot en plus »), passif-destructif (changer de sujet).' },
      { h: 'Ce qu\'on observe', p: 'Les personnes qui perçoivent chez leurs proches des réactions actives-constructives rapportent des relations plus satisfaisantes. (Études corrélationnelles : le lien de cause à effet reste à confirmer.)' },
      { h: 'En pratique', p: 'Montre ta joie et fais revivre le moment.', ex: '« J\'ai eu le poste ! » → « Génial !! Raconte, comment ils te l\'ont annoncé ? »' },
    ],
    src: ['Gable, Reis, Impett & Asher (2004). What do you do when things go right? Journal of Personality and Social Psychology, 87(2).'],
    recall: [
      { q: '« J\'ai eu mon permis ! » La réponse active-constructive est…', o: ['« Cool. »', '« Bravo !! Raconte, comment ça s\'est passé ? »', '« Attention, l\'assurance va coûter cher. »'], a: 1 },
    ],
  },
  {
    id: 'ec-regard', skill: 'ecoute', level: 'limitee', title: 'Le regard : environ 3 secondes',
    cards: [
      { h: 'Ni fuir, ni fixer', p: 'Éviter le regard est un comportement de sécurité classique. Mais fixer sans fin met mal à l\'aise.' },
      { h: 'Les données', p: 'Dans une étude menée auprès de près de 500 visiteurs d\'un musée, la durée de regard mutuel préférée était en moyenne d\'environ 3 secondes, entre 2 et 5 secondes pour la plupart.' },
      { h: 'En pratique', p: 'Regarde l\'autre quand il parle, et détourne brièvement les yeux de temps en temps, surtout quand tu réfléchis. C\'est un repère, pas une règle à chronométrer.' },
    ],
    src: ['Binetti, Harrison, Coutrot, Johnston & Mareschal (2016). Pupil dilation as an index of preferred mutual gaze duration. Royal Society Open Science, 3(7).'],
    recall: [
      { q: 'Combien de temps dure, en moyenne, le regard mutuel jugé confortable ?', o: ['Moins d\'une seconde', 'Environ 3 secondes', 'Plus de 10 secondes'], a: 1 },
    ],
  },

  // ===== RÉCIT =====
  {
    id: 'rc-abt', skill: 'recit', level: 'pratique', title: 'Et… Mais… Donc…',
    cards: [
      { h: 'Le récit plat : « Et, et, et »', p: '« Je suis allé à la plage, et il faisait beau, et on a mangé… » Aucune tension, donc aucune attention.' },
      { h: 'La structure ABT', p: 'Contexte (ET) → problème (MAIS) → conséquence (DONC). Le « mais » crée la tension qui fait écouter.', ex: '« Je devais présenter au directeur ET j\'avais tout préparé. MAIS l\'ordi plante devant 40 personnes. DONC j\'ai fait la présentation au tableau blanc… et c\'est la meilleure que j\'aie jamais faite. »' },
      { h: 'Exercice', p: 'Prends ta dernière anecdote et trouve son « mais ». S\'il n\'y en a pas, ce n\'est peut-être pas une histoire.' },
    ],
    src: ['Olson, R. (2015). Houston, We Have a Narrative. University of Chicago Press. — Structure issue de l\'écriture de scénario, enseignée aux scientifiques ; technique de praticien.'],
    recall: [
      { q: 'Dans la structure ABT, quel mot crée la tension ?', o: ['Et', 'Mais', 'Donc'], a: 1 },
    ],
  },
  {
    id: 'rc-concret', skill: 'recit', level: 'solide', title: 'Le concret se retient, l\'abstrait s\'oublie',
    cards: [
      { h: 'Ce que montre la mémoire', p: 'Les mots et idées concrets (qu\'on peut se représenter en image) sont mieux mémorisés que les abstraits : c\'est l\'un des effets les plus solides de la psychologie cognitive.' },
      { h: 'Appliqué au récit', p: 'Remplace le général par un détail sensoriel, un chiffre, un nom.', ex: '« C\'était super bon » → « Des ramens à 2 h du matin, debout dans un bar de 6 places. »' },
      { h: 'Et ton ressenti', p: 'Dis aussi ce que tu as ressenti à ce moment-là : c\'est ce qui permet à l\'autre de vivre l\'histoire avec toi.' },
    ],
    src: ['Paivio (1971/1991). Théorie du double codage — effet de concrétude en mémoire, largement répliqué.', 'Heath & Heath (2007). Made to Stick. (Application à la communication.)'],
    recall: [
      { q: 'Qu\'est-ce qui rend une histoire plus mémorable ?', o: ['Des adjectifs forts (« incroyable »)', 'Des détails concrets et précis', 'La raconter plus longtemps'], a: 1 },
    ],
  },
  {
    id: 'rc-humblebrag', skill: 'recit', level: 'solide', title: 'Le « faux modeste » se retourne contre toi',
    cards: [
      { h: 'Le humblebrag', p: 'Se vanter en se plaignant : « Trop fatigant d\'être invité à parler dans trois conférences ce mois-ci… »' },
      { h: 'Ce que montre la recherche', p: 'Dans plusieurs études, le faux modeste était moins apprécié et jugé moins sincère qu\'une simple vantardise assumée ou qu\'une simple plainte.' },
      { h: 'Que faire', p: 'Si tu es fier·e de quelque chose, dis-le franchement et avec enthousiasme, sans fausse plainte.', ex: '« Je suis super content : on m\'a invité à parler dans une conférence ! »' },
    ],
    src: ['Sezer, Gino & Norton (2018). Humblebragging: A distinct — and ineffective — self-presentation strategy. Journal of Personality and Social Psychology, 114(1).'],
    recall: [
      { q: 'Qu\'est-ce qui est jugé le moins sincère ?', o: ['Se vanter franchement', 'Se plaindre franchement', 'Se vanter en se plaignant'], a: 2 },
    ],
  },
];

// ---------------- Situations ----------------
// principle : id de la leçon qui explique la bonne réponse
const SCENARIOS = [
  { skill: 'smalltalk', ctx: 'pro', principle: 'st-reciprocite', where: '🛗 Ascenseur, 8 h 52',
    them: 'Grosse journée, ou tu vas juste épouser ton téléphone ?',
    options: [
      { t: 'Ah, haha. Oui, je vérifiais un truc. Drôle de temps, hein ?', ok: false, fb: 'Elle t\'a tendu une perche, tu l\'as lâchée pour un sujet neutre qui ne dit rien de toi.' },
      { t: 'Démasqué ! Je relis une présentation qui me stresse. Et toi, ta journée s\'annonce comment ?', ok: true, fb: 'Une info vraie sur toi + une question en retour : la réciprocité qui crée le lien.' },
      { t: 'Non, non.', ok: false, fb: 'Réponse fermée : elle n\'a plus rien sur quoi rebondir.' },
    ] },
  { skill: 'ecoute', ctx: 'social', principle: 'st-questions', where: '🎉 Soirée chez un ami',
    them: 'Je reviens tout juste de trois semaines au Japon.',
    options: [
      { t: 'Ah sympa. Moi je suis allé en Espagne cet été.', ok: false, fb: 'Réponse de détournement : tu ramènes le sujet à toi.' },
      { t: 'Trois semaines ! C\'est quoi le moment où tu t\'es dit « ok, je suis vraiment loin » ?', ok: true, fb: 'Question de relance ouverte et précise : elle va raconter une vraie histoire.' },
      { t: 'Cool. C\'était bien ?', ok: false, fb: 'Question fermée : réponse probable « oui, trop bien », puis blanc.' },
    ] },
  { skill: 'clarte', ctx: 'pro', principle: 'cl-conclusion', where: '💼 Réunion d\'équipe',
    them: 'Tu en penses quoi, toi, de la nouvelle organisation ?',
    options: [
      { t: 'Euh, bah, en fait, y a des trucs bien, mais bon, ça dépend, je sais pas trop…', ok: false, fb: 'Pas de conclusion et beaucoup de béquilles : on ne retient rien.' },
      { t: 'Bonne idée sur le fond. Mon doute, ce sont les délais. Je propose un point dans un mois pour ajuster.', ok: true, fb: 'Conclusion d\'abord, raison, proposition. Clair et pro.' },
      { t: 'Je préfère ne pas me prononcer.', ok: false, fb: 'Comportement d\'évitement : tu disparais. Donne au moins une position.' },
    ] },
  { skill: 'assurance', ctx: 'love', principle: 'st-reciprocite', where: '☕ File d\'attente au café',
    them: '(Elle regarde ton livre) Il est bien, celui-là ?',
    options: [
      { t: 'Oui. (silence)', ok: false, fb: 'Elle a ouvert la porte, tu l\'as refermée.' },
      { t: 'Je suis à la moitié et je déteste le héros… donc oui, apparemment ! Tu l\'as lu ?', ok: true, fb: 'Un avis vrai, un peu d\'humour, et tu lui rends la parole.' },
      { t: 'Ah euh, je sais pas, c\'est un cadeau, enfin, voilà.', ok: false, fb: 'Le trac a parlé à ta place. Rappelle-toi : elle remarque bien moins ta gêne que tu ne le crois.' },
    ] },
  { skill: 'ecoute', ctx: 'social', principle: 'ec-soutien', where: '📱 Message d\'un ami',
    them: 'Mon chien s\'est échappé hier soir, j\'ai paniqué.',
    options: [
      { t: 'Le mien aussi une fois ! Il était parti trois heures.', ok: false, fb: 'Réponse de détournement : le projecteur passe sur toi.' },
      { t: 'Oh non ! Tu l\'as retrouvé ? Il est où maintenant ?', ok: true, fb: 'Réponse de soutien : tu restes sur son histoire et son émotion.' },
      { t: 'Faut mettre une clôture.', ok: false, fb: 'Un conseil non demandé, avant même d\'avoir écouté.' },
    ] },
  { skill: 'ecoute', ctx: 'pro', principle: 'ec-reformuler', where: '💼 Pause déjeuner',
    them: 'Je passe mes soirées sur des rapports que personne ne lit.',
    options: [
      { t: 'Donc ce qui te pèse, c\'est de bosser tard sur un truc qui ne sert à rien ?', ok: true, fb: 'Reformulation de l\'émotion : il se sent compris, et il va développer.' },
      { t: 'Bienvenue dans le monde du travail !', ok: false, fb: 'Ça minimise ce qu\'il ressent.' },
      { t: 'Moi c\'est pareil avec les tableaux Excel.', ok: false, fb: 'Détournement vers toi.' },
    ] },
  { skill: 'ecoute', ctx: 'pro', principle: 'ec-acr', where: '🎉 Un collègue arrive tout sourire',
    them: 'J\'ai eu la promotion !',
    options: [
      { t: 'Cool.', ok: false, fb: 'Passif-constructif : gentil mais plat, la joie retombe.' },
      { t: 'Génial !! Raconte, comment ils te l\'ont annoncé ?', ok: true, fb: 'Actif-constructif : tu partages sa joie et tu lui fais revivre le moment.' },
      { t: 'Ah, ça va te faire encore plus de boulot.', ok: false, fb: 'Actif-destructif : tu casses le moment.' },
    ] },
  { skill: 'assurance', ctx: 'pro', principle: 'cl-conclusion', where: '🧑‍💼 Ton chef, dans le couloir',
    them: 'Alors, ça avance, ton projet ?',
    options: [
      { t: 'On est à 70 %. Seul point bloquant : la validation juridique, je relance demain.', ok: true, fb: 'Conclusion, point de vigilance, action. Tu montres que tu maîtrises.' },
      { t: 'Euh, oui, enfin, je pense, on fait au mieux, hein…', ok: false, fb: 'Ça sonne incertain même si le projet va bien.' },
      { t: 'Désolé, je suis un peu en retard, je sais…', ok: false, fb: 'Tu t\'excuses avant qu\'on te reproche quoi que ce soit.' },
    ] },
  { skill: 'recit', ctx: 'social', principle: 'rc-abt', where: '🍷 Dîner entre amis',
    them: 'Et toi, ton week-end ?',
    options: [
      { t: 'Bien, tranquille.', ok: false, fb: 'Rien à quoi s\'accrocher.' },
      { t: 'Je voulais faire une rando « facile », MAIS l\'appli s\'est trompée de sentier. DONC trois heures, deux ampoules et un troupeau de chèvres plus tard…', ok: true, fb: 'Et / Mais / Donc + détails concrets : une vraie histoire en 10 secondes.' },
      { t: 'Samedi je me suis levé, j\'ai fait les courses, puis j\'ai rangé, puis…', ok: false, fb: '« Et, et, et » : la liste chronologique endort.' },
    ] },
  { skill: 'smalltalk', ctx: 'social', principle: 'st-profond', where: '🏃 Club de sport',
    them: 'Je fais de l\'escalade depuis deux ans.',
    options: [
      { t: 'Ah ok.', ok: false, fb: 'Fermé.' },
      { t: 'Deux ans ! Qu\'est-ce qui t\'a accroché·e au début ?', ok: true, fb: 'Tu passes du « quoi » au « pourquoi » : plus profond, et plus agréable que prévu pour vous deux.' },
      { t: 'C\'est dangereux, non ?', ok: false, fb: 'Pas méchant, mais ça la met sur la défensive.' },
    ] },
  { skill: 'clarte', ctx: 'pro', principle: 'cl-prep', where: '🎤 Entretien d\'embauche',
    them: 'Pourquoi devrions-nous vous choisir ?',
    options: [
      { t: 'Alors, je suis né à Nantes, j\'ai fait un bac S, ensuite…', ok: false, fb: 'Chronologique et long : on décroche avant l\'essentiel.' },
      { t: 'Parce que je lance des projets vite. Au dernier poste, on a livré en 3 mois au lieu de 6. C\'est exactement ce dont votre équipe a besoin.', ok: true, fb: 'PREP : point, raison, exemple chiffré, point. Imparable.' },
      { t: 'Euh, je suis motivé et dynamique.', ok: false, fb: 'Abstrait, et dit par tout le monde. Il manque un exemple concret.' },
    ] },
  { skill: 'ecoute', ctx: 'love', principle: 'st-questions', where: '🍸 Premier rendez-vous',
    them: 'Je suis infirmière, en ce moment je fais beaucoup de nuits.',
    options: [
      { t: 'Ah, moi je ne pourrais jamais.', ok: false, fb: 'Ça parle de toi et ferme le sujet.' },
      { t: 'Les nuits, ça doit être un autre monde. Il se passe quoi à 3 h du matin qu\'on n\'imagine pas ?', ok: true, fb: 'Relance curieuse et précise. Rappel : en speed dating, ceux qui posaient plus de questions obtenaient plus de seconds rendez-vous.' },
      { t: 'Ça paye bien ?', ok: false, fb: 'Maladroit et fermé.' },
    ] },
  { skill: 'assurance', ctx: 'social', principle: 'as-securite', where: '👥 Groupe que tu ne connais pas',
    them: '(Tout le monde rit d\'une blague que tu n\'as pas comprise)',
    options: [
      { t: 'Tu ris aussi en faisant semblant.', ok: false, fb: 'Tu restes à l\'extérieur du groupe.' },
      { t: 'J\'arrive et je sens que j\'ai raté un épisode culte. Racontez !', ok: true, fb: 'Assumer et poser une question : la façon la plus rapide d\'entrer dans le groupe.' },
      { t: 'Tu sors ton téléphone.', ok: false, fb: 'Comportement de sécurité : il rassure sur le moment mais te rend moins accessible.' },
    ] },
  { skill: 'assurance', ctx: 'social', principle: 'as-conseil', where: '🏘️ Nouveau voisin dans l\'escalier',
    them: '(Il te sourit en passant)',
    options: [
      { t: 'Bonjour. (et tu continues)', ok: false, fb: 'Poli, mais aucune ouverture.' },
      { t: 'Bonjour ! Vous êtes là depuis longtemps ? Je cherche une bonne boulangerie, vous en conseillez une ?', ok: true, fb: 'Demander conseil : une ouverture naturelle, qui valorise l\'autre.' },
      { t: 'Tu fais semblant de chercher tes clés.', ok: false, fb: 'Évitement : il ne saura jamais que tu étais sympa.' },
    ] },
  { skill: 'recit', ctx: 'pro', principle: 'rc-humblebrag', where: '☕ Machine à café',
    them: 'Quoi de neuf pour toi ?',
    options: [
      { t: 'Oh là là, épuisant, on m\'a encore demandé de présenter au comité de direction…', ok: false, fb: 'Faux modeste : jugé moins sincère qu\'une fierté assumée.' },
      { t: 'Je suis content : je présente au comité de direction jeudi ! Un peu stressé aussi. Tu l\'as déjà fait ?', ok: true, fb: 'Fierté assumée, émotion honnête, et une demande de conseil en prime.' },
      { t: 'Rien de spécial.', ok: false, fb: 'Tu caches une vraie actualité et tu fermes l\'échange.' },
    ] },
  { skill: 'smalltalk', ctx: 'social', principle: 'st-sortie', where: '🎉 Fin de soirée',
    them: '(La conversation s\'essouffle depuis un moment)',
    options: [
      { t: 'Tu attends qu\'il trouve une excuse pour partir.', ok: false, fb: 'On devine très mal quand l\'autre veut arrêter : ne laisse pas l\'échange s\'éteindre.' },
      { t: 'Je vais aller dire bonjour à Léa. J\'ai adoré ton histoire de rando : envoie-moi le nom du sentier !', ok: true, fb: 'Signaler, résumer, ouvrir : tu finis sur une note positive.' },
      { t: 'Tu pars sans rien dire.', ok: false, fb: 'Ça laisse une impression froide.' },
    ] },
];

// ---------------- Reformulations ----------------
const REWRITES = [
  { them: 'Grosse journée aujourd\'hui ?', flat: 'Ouais.', sample: 'Honnêtement oui, trois réunions d\'affilée. Et toi, tu tiens le coup ?' },
  { them: 'Tu fais quoi dans la vie ?', flat: 'Je suis comptable.', sample: 'Comptable ! Ce que j\'aime vraiment, c\'est démêler les situations compliquées. Et toi, qu\'est-ce qui t\'occupe ?' },
  { them: 'Tu as passé un bon week-end ?', flat: 'Oui, merci.', sample: 'Oui ! J\'ai enfin testé le resto coréen d\'à côté, je suis accro. Tu connais ?' },
  { them: 'Il fait chaud, hein ?', flat: 'Oui, très.', sample: 'Oui, je rêve d\'une glace depuis ce matin. C\'est quoi ton parfum sans hésiter ?' },
  { them: 'Tu viens d\'où ?', flat: 'De Lille.', sample: 'De Lille ! J\'y ai gardé l\'amour des frites et de la braderie. Tu y es déjà allé ?' },
  { them: 'Comment tu connais Julie ?', flat: 'Par le boulot.', sample: 'On a survécu ensemble à un déménagement de bureau catastrophique, ça crée des liens ! Et toi ?' },
  { them: 'Ça va, le nouveau poste ?', flat: 'Ça va.', sample: 'Plutôt bien ! Le plus dur, c\'est de retenir 40 prénoms en une semaine. Tu as des astuces ?' },
  { them: 'Mon chien s\'est échappé hier.', flat: 'Le mien aussi une fois.', sample: 'Oh non ! Tu l\'as retrouvé ? Tu as dû avoir une sacrée peur.', support: true },
  { them: 'J\'ai eu mon permis !', flat: 'Cool.', sample: 'Bravo !! Raconte, ça s\'est passé comment ? Tu étais stressé·e ?', support: true },
  { them: 'Je pars m\'installer au Canada le mois prochain.', flat: 'Ah ok, bonne chance.', sample: 'Waouh, gros changement ! Qu\'est-ce qui t\'a décidé ?', support: true },
];

// ---------------- Parle 60 secondes ----------------
const PROMPTS = [
  { t: 'Raconte le meilleur repas de ta vie.', tip: 'Détails concrets : le lieu, l\'odeur, avec qui.' },
  { t: 'Explique ton métier à un enfant de 8 ans.', tip: 'Commence par la conclusion : « Mon travail, c\'est de… »' },
  { t: 'Pour ou contre la semaine de 4 jours ?', tip: 'Structure PREP : Point, Raison, Exemple, Point.' },
  { t: 'Raconte un moment où un plan ne s\'est pas passé comme prévu.', tip: 'Et… Mais… Donc…' },
  { t: 'Présente-toi en 60 secondes à un futur collègue.', tip: 'Qui tu es, un fait concret, ce que tu cherches.' },
  { t: 'Faut-il interdire les téléphones à table ?', tip: 'Structure PREP. Une pause à la fin de chaque idée.' },
  { t: 'Convaincs-moi d\'essayer ton loisir préféré.', tip: 'Un exemple vécu vaut mieux que dix adjectifs.' },
  { t: 'Raconte ta pire galère de transport.', tip: 'Et… Mais… Donc… et ce que tu as ressenti.' },
  { t: 'Quelle est la meilleure décision que tu aies prise ?', tip: 'Conclusion d\'abord, puis l\'histoire.' },
  { t: 'Le télétravail : bonne ou mauvaise idée ?', tip: 'Structure PREP.' },
  { t: 'Décris ta ville à quelqu\'un qui n\'y est jamais allé.', tip: 'Trois images concrètes plutôt que des généralités.' },
  { t: 'Raconte une rencontre qui a changé quelque chose pour toi.', tip: 'Le « mais » : qu\'est-ce qui a basculé ?' },
];

// Mots-béquilles comptés. Motifs sans \b (incompatible avec les accents) :
// l'app les entoure de limites de mots Unicode. « genre » n'est pas compté dans
// « ce genre », « un genre », « le genre de »… où c'est un vrai nom.
const FILLERS = [
  { label: 'euh', pat: 'euh+|heu+|hum+|bah|ben' },
  { label: 'du coup', pat: 'du coup' },
  { label: 'en fait', pat: 'en fait' },
  { label: 'genre', pat: '(?<!(?:ce|un|le|quel|quelle|mon|ton|son|du|de|en|bon|même|autre) )genre(?! d)' },
  { label: 'voilà', pat: 'voilà' },
  { label: 'tu vois', pat: 'tu vois' },
  { label: 'enfin bref', pat: 'enfin bref' },
  { label: 'je veux dire', pat: "je veux dire|j'veux dire" },
];

// ---------------- Défis terrain (exposition graduée) ----------------
// Pratique centrale des thérapies cognitives et comportementales du trac social :
// s'exposer progressivement à des situations réelles en comparant prédiction et réalité.
const MISSIONS = [
  // Niveau 1 : très accessible
  { lvl: 1, t: 'Dis bonjour et une phrase de plus à un commerçant (« Il a l\'air bon, ce pain-là ! »).', when: 'à la boulangerie / au supermarché' },
  { lvl: 1, t: 'Fais un compliment sincère et précis à un collègue ou un proche.', when: 'quand je croise un collègue ce matin' },
  { lvl: 1, t: 'Demande une recommandation à un vendeur ou un serveur.', when: 'au prochain commerce où j\'entre' },
  { lvl: 1, t: 'Garde ton téléphone dans ta poche pendant toute une pause café avec quelqu\'un.', when: 'à ma prochaine pause' },
  // Niveau 2
  { lvl: 2, t: 'Dans une conversation, pose au moins 2 questions de relance sur ce que l\'autre vient de dire.', when: 'à ma prochaine conversation' },
  { lvl: 2, t: 'À « Ça va ? », réponds par quelque chose de vrai sur ta journée, puis retourne la question.', when: 'la prochaine fois qu\'on me demande « ça va ? »' },
  { lvl: 2, t: 'Fais une remarque à un inconnu sur quelque chose que vous partagez (file d\'attente, météo extrême, retard du train).', when: 'dans la prochaine file d\'attente' },
  { lvl: 2, t: 'Reformule une fois ce que dit quelqu\'un : « Si je comprends bien, … ? »', when: 'à ma prochaine réunion ou discussion' },
  // Niveau 3
  { lvl: 3, t: 'Pose une question « pourquoi » à quelqu\'un : « Qu\'est-ce qui t\'a amené à … ? »', when: 'quand quelqu\'un me parle de son travail ou d\'un loisir' },
  { lvl: 3, t: 'En réunion, donne ton avis au moins une fois en structure PREP.', when: 'à ma prochaine réunion' },
  { lvl: 3, t: 'Demande conseil à quelqu\'un de plus expérimenté sur un vrai problème.', when: 'cette semaine au travail' },
  { lvl: 3, t: 'Engage une conversation de plus de 2 minutes avec un inconnu.', when: 'à la prochaine occasion (transport, salle d\'attente, soirée)' },
  // Niveau 4
  { lvl: 4, t: 'Raconte une anecdote en groupe avec la structure Et / Mais / Donc.', when: 'au prochain repas ou apéro' },
  { lvl: 4, t: 'Rejoins un groupe qui discute déjà en soirée ou à un événement.', when: 'au prochain événement' },
  { lvl: 4, t: 'Prends la parole en premier sur un sujet en réunion.', when: 'à ma prochaine réunion' },
  { lvl: 4, t: 'Invite quelqu\'un que tu connais peu à prendre un café.', when: 'cette semaine' },
];

const DISCLAIMER = 'Talking est un outil d\'entraînement, pas un traitement. Si le trac social t\'empêche de vivre normalement (éviter des situations importantes, souffrance importante), parles-en à ton médecin ou à un psychologue : les thérapies cognitives et comportementales (TCC) sont le traitement de référence et sont efficaces.';
