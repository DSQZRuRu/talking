// Contenu pédagogique de Talking.
// Compétences : smalltalk, assurance, clarte, ecoute, recit

const SKILLS = {
  smalltalk: { name: 'Small talk', icon: '💬', desc: 'Lancer et faire vivre une conversation sans blanc.' },
  assurance: { name: 'Assurance', icon: '🦁', desc: 'Parler sans geler, même sous pression.' },
  clarte:    { name: 'Clarté', icon: '🎯', desc: 'Dire les choses simplement, sans « euh » ni détours.' },
  ecoute:    { name: 'Écoute', icon: '👂', desc: 'Rebondir sur ce que l\'autre te donne.' },
  recit:     { name: 'Storytelling', icon: '📖', desc: 'Rendre tes histoires vivantes et mémorables.' },
};

// Test initial : chaque option donne des points de « besoin » (plus = plus faible)
const QUIZ = [
  {
    q: 'Dans un ascenseur, quelqu\'un te lance : « Grosse journée aujourd\'hui ? » Tu…',
    options: [
      { t: 'Réponds « Ouais… » et regardes ton téléphone', w: { smalltalk: 3, assurance: 2 } },
      { t: 'Parles de la météo, faute de mieux', w: { smalltalk: 2, ecoute: 1 } },
      { t: 'Réponds honnêtement et lui retournes une question', w: {} },
    ],
  },
  {
    q: 'Quand tu dois prendre la parole en réunion…',
    options: [
      { t: 'Je prépare tellement que je finis par ne rien dire', w: { assurance: 3 } },
      { t: 'Je parle, mais je m\'éparpille', w: { clarte: 3 } },
      { t: 'Je donne mon point en 2–3 phrases', w: {} },
    ],
  },
  {
    q: 'Pendant que l\'autre parle, tu es surtout en train de…',
    options: [
      { t: 'Préparer ce que je vais dire ensuite', w: { ecoute: 3 } },
      { t: 'Avoir peur du blanc qui va suivre', w: { assurance: 2, smalltalk: 1 } },
      { t: 'Repérer un détail sur lequel rebondir', w: {} },
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
    q: 'Tu croises une personne qui te plaît. Ce qui te bloque le plus :',
    options: [
      { t: 'Je ne sais pas quoi dire pour commencer', w: { smalltalk: 3 } },
      { t: 'J\'ai peur d\'avoir l\'air bizarre', w: { assurance: 3 } },
      { t: 'Rien de spécial, je me lance', w: {} },
    ],
  },
  {
    q: 'Tes « euh », « du coup », « en fait »…',
    options: [
      { t: 'Partout. Je m\'entends et ça me stresse', w: { clarte: 3, assurance: 1 } },
      { t: 'Quelques-uns, surtout quand je suis nerveux·se', w: { clarte: 1 } },
      { t: 'Rarement', w: {} },
    ],
  },
  {
    q: 'Quelqu\'un te dit : « Je reviens de trois semaines au Japon. » Tu réponds :',
    options: [
      { t: '« Ah cool. »', w: { ecoute: 3, smalltalk: 2 } },
      { t: '« Moi aussi j\'aimerais trop y aller ! »', w: { ecoute: 2 } },
      { t: '« Trois semaines ! Qu\'est-ce qui t\'a le plus surpris ? »', w: {} },
    ],
  },
  {
    q: 'Après une conversation ratée, tu…',
    options: [
      { t: 'La rejoues en boucle pendant des heures', w: { assurance: 3 } },
      { t: 'Trouves la bonne réplique… trop tard', w: { smalltalk: 1, assurance: 1, recit: 1 } },
      { t: 'Passes à autre chose', w: {} },
    ],
  },
];

const GOALS = [
  { id: 'pro', icon: '💼', t: 'Au travail', d: 'Réunions, chef, entretiens, réseau' },
  { id: 'social', icon: '🎉', t: 'En société', d: 'Soirées, inconnus, nouveaux amis' },
  { id: 'love', icon: '❤️', t: 'En séduction', d: 'Oser parler à quelqu\'un qui te plaît' },
  { id: 'all', icon: '✨', t: 'Partout', d: 'Devenir à l\'aise avec tout le monde' },
];

// Leçons : 3 cartes courtes chacune
const LESSONS = [
  {
    id: 'st1', skill: 'smalltalk', title: 'La formule anti-météo',
    cards: [
      { h: 'Le piège', p: 'Quand on panique, on attrape le sujet le plus neutre possible : la météo. Le problème n\'est pas la météo, c\'est qu\'elle ne dit rien de toi.' },
      { h: 'La formule', p: 'Une réaction honnête + une question qui n\'est pas sur la météo.', ex: '« Grosse journée ? » → « Honnêtement, j\'ai trois réunions et zéro café. Et toi, tu fuis quoi aujourd\'hui ? »' },
      { h: 'Pourquoi ça marche', p: 'L\'autre t\'a tendu une perche. Tu la rends avec quelque chose de réel. Pas besoin d\'être brillant·e, juste vrai·e.' },
    ],
  },
  {
    id: 'st2', skill: 'smalltalk', title: 'Les fils de conversation',
    cards: [
      { h: 'Chaque phrase contient des fils', p: 'Quand quelqu\'un parle, il te donne plusieurs sujets à tirer. Ton job : en choisir un.' },
      { h: 'Exemple', p: '« Je suis crevé, j\'ai déménagé ce week-end à Lyon. »', ex: 'Fils : la fatigue · le déménagement · Lyon · pourquoi Lyon ? · avec qui ?' },
      { h: 'Exercice mental', p: 'Aujourd\'hui, à chaque phrase entendue, repère 2 fils. Tu n\'auras plus jamais de blanc.' },
    ],
  },
  {
    id: 'st3', skill: 'smalltalk', title: 'Sortir du questionnaire',
    cards: [
      { h: 'Le mode interrogatoire', p: 'Question, réponse, question, réponse… On dirait un entretien d\'embauche.' },
      { h: 'Alterne', p: 'Après une réponse, partage quelque chose de toi avant de reposer une question.', ex: '« Tu fais du vélo ? Moi j\'ai repris l\'an dernier, j\'ai cru mourir dans la première côte. Tu roules où ? »' },
      { h: 'La règle 50/50', p: 'Vise un équilibre : tu donnes autant que tu demandes.' },
    ],
  },
  {
    id: 'as1', skill: 'assurance', title: 'Parler avant la panique',
    cards: [
      { h: 'La fenêtre de 3 secondes', p: 'Plus tu attends la réplique parfaite, plus le stress monte. Le cerveau gèle.' },
      { h: 'Automatise', p: 'Avoir 2–3 réflexes prêts (réaction honnête, question ouverte) permet de parler avant que la peur arrive.' },
      { h: 'Bon > brillant', p: 'Une réponse simple dite tout de suite vaut mieux qu\'une réponse géniale dite jamais.' },
    ],
  },
  {
    id: 'as2', skill: 'assurance', title: 'Le silence est ton allié',
    cards: [
      { h: 'Le blanc fait peur', p: 'Un silence de 2 secondes paraît durer 10 pour toi… et 1 pour l\'autre.' },
      { h: 'Utilise-le', p: 'Une pause avant de répondre te fait paraître réfléchi·e et posé·e, pas perdu·e.' },
      { h: 'Exercice', p: 'Aujourd\'hui, avant chaque réponse importante, respire une fois. Juste une.' },
    ],
  },
  {
    id: 'as3', skill: 'assurance', title: 'La voix posée',
    cards: [
      { h: 'Les phrases qui montent', p: 'Finir une affirmation comme une question (« je pense que… ? ») fait paraître incertain.' },
      { h: 'Descends à la fin', p: 'Termine tes phrases en baissant légèrement le ton. Ça sonne sûr.' },
      { h: 'Ralentis 10 %', p: 'Le stress accélère le débit. Ralentir un peu suffit à paraître serein·e.' },
    ],
  },
  {
    id: 'cl1', skill: 'clarte', title: 'La règle des 3 phrases',
    cards: [
      { h: 'Le problème', p: 'On s\'éparpille parce qu\'on réfléchit en parlant.' },
      { h: 'La structure', p: '1. Mon point. 2. Pourquoi. 3. Ce que je propose.', ex: '« On devrait décaler le lancement. Les tests ne sont pas finis. Je propose le 15 au lieu du 8. »' },
      { h: 'Commence par la fin', p: 'Donne la conclusion d\'abord. Les détails seulement si on te les demande.' },
    ],
  },
  {
    id: 'cl2', skill: 'clarte', title: 'Remplacer les « euh »',
    cards: [
      { h: 'Les mots-béquilles', p: '« Euh », « du coup », « en fait », « genre », « voilà »… Ils comblent le vide pendant que tu cherches tes mots.' },
      { h: 'Le remède', p: 'Remplace-les par… rien. Une micro-pause silencieuse est bien plus élégante.' },
      { h: 'Entraîne-toi', p: 'L\'exercice « Parle 60 s » compte tes mots-béquilles. Essaie de faire baisser ton score chaque jour.' },
    ],
  },
  {
    id: 'ec1', skill: 'ecoute', title: 'Le rebond',
    cards: [
      { h: 'Écouter pour répondre ≠ écouter pour comprendre', p: 'Si tu prépares ta prochaine phrase, tu rates ce que l\'autre te donne.' },
      { h: 'Le rebond', p: 'Reprends un mot précis de l\'autre et creuse.', ex: '« J\'ai enfin fini ce projet. » → « Enfin ? Il t\'a fait souffrir à ce point ? »' },
      { h: 'L\'effet', p: 'L\'autre se sent écouté. C\'est ce qui fait dire « on a super bien discuté ».' },
    ],
  },
  {
    id: 'ec2', skill: 'ecoute', title: 'Questions ouvertes',
    cards: [
      { h: 'Fermées = fin de conversation', p: '« Tu as aimé ? » → « Oui. » Et après ?' },
      { h: 'Ouvertes = histoire', p: 'Commence par « Qu\'est-ce qui… », « Comment… », « Raconte… ».', ex: '« Qu\'est-ce qui t\'a le plus marqué ? »' },
      { h: 'Le mot magique', p: '« Comment ça ? » relance n\'importe quelle conversation.' },
    ],
  },
  {
    id: 'rc1', skill: 'recit', title: 'L\'histoire en 4 temps',
    cards: [
      { h: 'Contexte', p: 'Où, quand, qui. Une phrase max.' },
      { h: 'Problème → Tournant → Chute', p: 'Ce qui a coincé, ce qui a tout changé, comment ça a fini.', ex: '« Premier jour de boulot, j\'arrive en avance… dans le mauvais bâtiment. Le vigile me fait visiter. Il est devenu mon meilleur pote au bureau. »' },
      { h: 'Coupe', p: 'Enlève tout ce qui ne sert pas la chute. Une bonne anecdote dure moins de 45 s.' },
    ],
  },
  {
    id: 'rc2', skill: 'recit', title: 'Les détails qui donnent vie',
    cards: [
      { h: 'Le générique endort', p: '« C\'était super bien. » ne fait rien ressentir.' },
      { h: 'Le précis réveille', p: 'Un détail sensoriel ou un chiffre rend l\'histoire réelle.', ex: '« On a mangé des ramens à 2 h du matin, debout, dans un bar de 6 places. »' },
      { h: 'Ton émotion', p: 'Dis ce que tu as ressenti. Les gens se souviennent des émotions, pas des faits.' },
    ],
  },
];

// Scénarios : choisis la meilleure réplique
const SCENARIOS = [
  {
    skill: 'smalltalk', ctx: 'pro', where: '🛗 Ascenseur, 8 h 52',
    them: 'Grosse journée, ou tu vas juste épouser ton téléphone ?',
    options: [
      { t: 'Ah, haha. Oui, je vérifiais un truc. Drôle de temps, hein ?', ok: false, fb: 'Elle t\'a tendu une perche drôle, tu l\'as lâchée pour la météo.' },
      { t: 'Haha, démasqué. Je relisais une présentation qui me terrorise. Et toi, tu fais quoi de beau ?', ok: true, fb: 'Réaction honnête + vraie question. Exactement ça.' },
      { t: 'Non, non.', ok: false, fb: 'Fermé. Elle n\'a rien sur quoi rebondir.' },
    ],
  },
  {
    skill: 'ecoute', ctx: 'social', where: '🎉 Soirée chez un ami',
    them: 'Je reviens tout juste de trois semaines au Japon.',
    options: [
      { t: 'Ah sympa. Moi je suis allé en Espagne cet été.', ok: false, fb: 'Tu ramènes la conversation à toi trop vite.' },
      { t: 'Trois semaines ! C\'est quoi le moment où tu t\'es dit « ok, je suis vraiment loin » ?', ok: true, fb: 'Question ouverte et précise : elle va raconter une histoire.' },
      { t: 'Cool. C\'était bien ?', ok: false, fb: 'Question fermée, réponse probable : « Oui, trop bien. » Fin.' },
    ],
  },
  {
    skill: 'clarte', ctx: 'pro', where: '💼 Réunion d\'équipe',
    them: 'Tu en penses quoi, toi, de la nouvelle organisation ?',
    options: [
      { t: 'Euh, bah, en fait, je sais pas trop, y a des trucs bien, mais bon, ça dépend…', ok: false, fb: 'Flou et plein de béquilles. On ne retient rien.' },
      { t: 'Bonne idée sur le fond. Mon seul doute : les délais. Je propose un point dans un mois pour ajuster.', ok: true, fb: 'Point, raison, proposition. Clair et pro.' },
      { t: 'Je préfère ne pas me prononcer.', ok: false, fb: 'Prudent, mais tu disparais. Donne au moins une opinion.' },
    ],
  },
  {
    skill: 'assurance', ctx: 'love', where: '☕ File d\'attente au café',
    them: '(Elle regarde ton livre) Il est bien, celui-là ?',
    options: [
      { t: 'Oui. (silence)', ok: false, fb: 'Elle a ouvert la porte, tu l\'as refermée.' },
      { t: 'Je suis à la moitié et je déteste le héros, donc… oui, apparemment ! Tu l\'as lu ?', ok: true, fb: 'Honnête, un peu d\'humour, et tu relances. Parfait.' },
      { t: 'Ah euh, je sais pas, c\'est un cadeau, enfin, voilà.', ok: false, fb: 'La panique a parlé avant toi. Respire, et donne un avis.' },
    ],
  },
  {
    skill: 'smalltalk', ctx: 'pro', where: '☕ Machine à café du bureau',
    them: 'Vivement vendredi…',
    options: [
      { t: 'Grave.', ok: false, fb: 'Accord, mais aucun fil à tirer.' },
      { t: 'À qui le dis-tu. Tu as un truc de prévu ce week-end, ou c\'est canapé intégral ?', ok: true, fb: 'Tu valides puis tu ouvres un sujet perso, léger.' },
      { t: 'Il paraît qu\'il va pleuvoir ce week-end.', ok: false, fb: 'La météo, encore elle…' },
    ],
  },
  {
    skill: 'ecoute', ctx: 'pro', where: '💼 Pause déjeuner',
    them: 'J\'ai enfin fini ce dossier, je n\'en pouvais plus.',
    options: [
      { t: '« Enfin » ? Il t\'a fait vivre quoi, ce dossier ?', ok: true, fb: 'Le rebond sur un mot précis. Il se sent écouté.' },
      { t: 'Bravo. Moi j\'en ai encore trois à faire.', ok: false, fb: 'Tu reprends la parole pour toi.' },
      { t: 'Ok.', ok: false, fb: 'Il voulait en parler, tu n\'as rien demandé.' },
    ],
  },
  {
    skill: 'assurance', ctx: 'pro', where: '🧑‍💼 Ton chef, dans le couloir',
    them: 'Alors, ça avance, ton projet ?',
    options: [
      { t: 'Oui, on est à 70 %. Le seul point bloquant, c\'est la validation juridique : je relance demain.', ok: true, fb: 'Précis, posé, tu montres que tu maîtrises.' },
      { t: 'Euh, oui, enfin, je pense, on fait au mieux, hein…', ok: false, fb: 'Ça sonne incertain, même si le projet va bien.' },
      { t: 'Désolé, je suis un peu en retard, je sais…', ok: false, fb: 'Tu t\'excuses avant même qu\'on te reproche quoi que ce soit.' },
    ],
  },
  {
    skill: 'recit', ctx: 'social', where: '🍷 Dîner entre amis',
    them: 'Et toi, ton week-end ?',
    options: [
      { t: 'Bien, tranquille.', ok: false, fb: 'Rien à quoi s\'accrocher.' },
      { t: 'J\'ai voulu faire une rando « facile ». Trois heures, deux ampoules et un troupeau de chèvres plus tard, j\'ai compris que l\'appli avait menti.', ok: true, fb: 'Contexte, problème, détail drôle. Une vraie histoire courte.' },
      { t: 'Alors samedi je me suis levé, j\'ai fait des courses, puis j\'ai rangé, puis…', ok: false, fb: 'La liste chronologique endort. Va direct au moment intéressant.' },
    ],
  },
  {
    skill: 'smalltalk', ctx: 'social', where: '🏃 Salle de sport',
    them: 'Tu viens souvent à cette heure-là ?',
    options: [
      { t: 'Ça dépend.', ok: false, fb: 'Réponse fermée, conversation morte.' },
      { t: 'C\'est mon créneau « avant que ma motivation se réveille ». Et toi, plutôt du matin ?', ok: true, fb: 'Une touche d\'humour sur toi + question retour.' },
      { t: 'Oui. Il fait chaud ici, non ?', ok: false, fb: 'La météo version intérieure. Toujours pas toi.' },
    ],
  },
  {
    skill: 'clarte', ctx: 'pro', where: '🎤 Entretien d\'embauche',
    them: 'Parlez-moi de vous.',
    options: [
      { t: 'Alors, je suis né à Nantes, j\'ai fait un bac S, ensuite…', ok: false, fb: 'Trop long, trop chronologique. On décroche.' },
      { t: 'Je suis chef de projet depuis 5 ans, spécialisé dans les lancements rapides. Le dernier : livré en 3 mois au lieu de 6. Je cherche maintenant une équipe plus grande.', ok: true, fb: 'Qui, preuve, objectif. En 3 phrases.' },
      { t: 'Euh, qu\'est-ce que vous voulez savoir exactement ?', ok: false, fb: 'Tu renvoies la balle par peur. Prends la parole.' },
    ],
  },
  {
    skill: 'ecoute', ctx: 'love', where: '🍸 Premier rendez-vous',
    them: 'Je suis infirmière, en ce moment je fais beaucoup de nuits.',
    options: [
      { t: 'Ah moi je ne pourrais jamais.', ok: false, fb: 'Ça parle de toi, et ça ferme le sujet.' },
      { t: 'Les nuits, ça doit être un autre monde. C\'est quoi qui se passe à 3 h du matin qu\'on n\'imagine pas ?', ok: true, fb: 'Curiosité sincère, question ouverte et précise.' },
      { t: 'Ça paye bien ?', ok: false, fb: 'Maladroit, et fermé.' },
    ],
  },
  {
    skill: 'assurance', ctx: 'social', where: '👥 Groupe que tu ne connais pas',
    them: '(Tout le monde rit d\'une blague que tu n\'as pas comprise)',
    options: [
      { t: 'Tu ris aussi en faisant semblant.', ok: false, fb: 'Tu restes à l\'extérieur du groupe.' },
      { t: 'Ok, je viens d\'arriver et je sens que j\'ai raté un épisode culte. Racontez !', ok: true, fb: 'Assumer, c\'est la façon la plus rapide d\'entrer dans le groupe.' },
      { t: 'Tu sors ton téléphone.', ok: false, fb: 'Le bouclier classique. Ça te rend invisible.' },
    ],
  },
];

// Reformulations : transforme une réponse plate
const REWRITES = [
  { them: 'Grosse journée aujourd\'hui ?', flat: 'Ouais.', sample: 'Honnêtement oui, trois réunions d\'affilée. Et toi, tu tiens le coup ?' },
  { them: 'Tu fais quoi dans la vie ?', flat: 'Je suis comptable.', sample: 'Je suis comptable — oui, je sais, ça fait rêver ! Ce que j\'aime vraiment, c\'est démêler les situations compliquées. Et toi ?' },
  { them: 'Tu as passé un bon week-end ?', flat: 'Oui, merci.', sample: 'Oui ! J\'ai enfin testé le resto coréen d\'à côté, je suis accro. Tu connais ?' },
  { them: 'Il fait chaud, hein ?', flat: 'Oui, très.', sample: 'Oui, je rêve d\'une glace depuis ce matin. C\'est quoi ton parfum sans hésiter ?' },
  { them: 'Tu viens d\'où ?', flat: 'De Lille.', sample: 'De Lille ! Le seul endroit où il pleut et où les gens restent souriants. Tu y es déjà allé ?' },
  { them: 'Comment tu connais Julie ?', flat: 'Par le boulot.', sample: 'On a survécu ensemble à un déménagement de bureau catastrophique. Ça crée des liens ! Et toi ?' },
  { them: 'Tu as vu le match hier ?', flat: 'Non.', sample: 'Non, je l\'ai raté ! Raconte, ça valait le coup ou je n\'ai rien manqué ?' },
  { them: 'Ça va, le nouveau poste ?', flat: 'Ça va.', sample: 'Plutôt bien ! Le plus dur c\'est de retenir 40 prénoms en une semaine. Tu as des astuces ?' },
];

// Sujets pour l'exercice « Parle 60 s »
const PROMPTS = [
  'Raconte le meilleur repas de ta vie.',
  'Explique ton métier à un enfant de 8 ans.',
  'Défends ton film préféré comme si tu devais le vendre.',
  'Raconte un moment où tu t\'es perdu·e.',
  'Présente-toi en 60 secondes à un futur collègue.',
  'Qu\'est-ce que tu ferais avec une année sabbatique ?',
  'Convaincs-moi d\'essayer ton loisir préféré.',
  'Raconte ta pire galère de transport.',
  'Quelle est la meilleure décision que tu aies prise ?',
  'Décris ta ville à quelqu\'un qui n\'y est jamais allé.',
  'Raconte une rencontre qui a changé quelque chose pour toi.',
  'Explique pourquoi les lundis devraient être supprimés.',
];

const FILLERS = ['euh', 'heu', 'bah', 'ben', 'du coup', 'en fait', 'genre', 'voilà', 'tu vois', 'quoi', 'enfin bref', 'style'];

// Témoignages affichés sur l'écran d'accueil (exemples fictifs)
const TESTIMONIALS = [
  { who: 'Exemple · 47 ans', t: '« 9 minutes par jour pendant 4 mois. Mon chef dit maintenant que je suis le plus clair de l\'équipe. »' },
  { who: 'Exemple · 29 ans', t: '« Je ne parle plus de la météo dans l\'ascenseur. Et j\'ai eu un rendez-vous. »' },
];
