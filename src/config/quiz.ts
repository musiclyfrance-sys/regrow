import { PHASE_LABELS, QuizStep } from './quizTypes';

/**
 * L'Autopsie — 47 questions en 4 phases, plus les interludes (micro-verdicts et
 * social proof) qui prouvent la qualité de l'analyse AVANT de la vendre.
 *
 * Ton : grande sœur lucide — directe, chaleureuse, jamais clinique. Tutoiement
 * systématique. Le token {ex} est remplacé par le prénom saisi (Q5) dès qu'il
 * existe : c'est le levier de personnalisation le plus fort du funnel.
 */

export { PHASE_LABELS };

export const QUIZ: QuizStep[] = [
  // ═══════════════ PHASE 1 · LES FAITS (étapes 1 → 10) ═══════════════
  {
    kind: 'question',
    id: 'relationDuration',
    step: 1,
    phase: 1,
    type: 'single',
    prompt: 'Vous êtes restés ensemble combien de temps ?',
    capture: 'relationDuration',
    options: [
      { value: 'lt3m', label: 'Moins de 3 mois' },
      { value: '3to12m', label: 'Entre 3 mois et 1 an' },
      { value: '1to3y', label: 'Entre 1 et 3 ans' },
      { value: '3to6y', label: 'Entre 3 et 6 ans' },
      { value: 'gt6y', label: 'Plus de 6 ans' },
    ],
  },
  {
    kind: 'question',
    id: 'livedTogether',
    step: 2,
    phase: 1,
    type: 'single',
    prompt: 'Vous viviez ensemble ?',
    options: [
      { value: 'yes', label: 'Oui, on partageait tout' },
      { value: 'sometimes', label: 'À moitié, on dormait souvent ensemble' },
      { value: 'no', label: 'Non, chacun chez soi' },
    ],
  },
  {
    kind: 'question',
    id: 'whoLeft',
    step: 3,
    phase: 1,
    type: 'single',
    prompt: "Qui a mis fin à l'histoire ?",
    capture: 'breakupMode',
    options: [
      { value: 'them', label: "C'est l'autre qui est parti" },
      { value: 'me', label: "C'est moi qui suis partie" },
      { value: 'mutual', label: "D'un commun accord (soi-disant)" },
      { value: 'ghost', label: 'Personne. Ça s’est juste éteint / ghosté' },
    ],
  },
  {
    kind: 'question',
    id: 'breakupChannel',
    step: 4,
    phase: 1,
    type: 'single',
    prompt: "Comment la rupture s'est passée ?",
    options: [
      { value: 'inperson', label: 'En face à face' },
      { value: 'call', label: 'Au téléphone' },
      { value: 'text', label: 'Par message' },
      { value: 'silence', label: 'Sans un mot, par le silence' },
    ],
  },
  {
    kind: 'question',
    id: 'exName',
    step: 5,
    phase: 1,
    type: 'text',
    prompt: 'Son prénom, ou le surnom que tu veux utiliser ici.',
    helper: "Ça reste entre nous. Aucun compte, aucune identité demandée.",
    placeholder: 'Ex : Karim',
    maxLength: 20,
    capture: 'exName',
  },
  {
    kind: 'question',
    id: 'timeSince',
    step: 6,
    phase: 1,
    type: 'single',
    prompt: "Ça fait combien de temps que c'est fini avec {ex} ?",
    capture: 'timeSince',
    options: [
      { value: 'days', label: 'Quelques jours' },
      { value: 'weeks', label: 'Quelques semaines' },
      { value: '1to3m', label: 'Entre 1 et 3 mois' },
      { value: 'gt3m', label: 'Plus de 3 mois' },
    ],
  },
  {
    kind: 'question',
    id: 'contactStatus',
    step: 7,
    phase: 1,
    type: 'single',
    prompt: 'Où vous en êtes niveau contact avec {ex} ?',
    capture: 'contactStatus',
    options: [
      { value: 'none', label: 'Zéro contact' },
      { value: 'rare', label: 'On s’écrit de temps en temps' },
      { value: 'often', label: 'On se parle encore souvent' },
      { value: 'seeing', label: 'On se voit encore / on couche ensemble' },
    ],
  },
  {
    kind: 'question',
    id: 'longestRelationship',
    step: 8,
    phase: 1,
    type: 'single',
    prompt: "C'était ta plus longue histoire ?",
    options: [
      { value: 'yes', label: 'Oui, de loin' },
      { value: 'similar', label: "Une des plus longues" },
      { value: 'no', label: 'Non, j’ai connu plus long' },
    ],
  },
  {
    kind: 'question',
    id: 'closureTalk',
    step: 9,
    phase: 1,
    type: 'single',
    prompt: 'Il y a eu une vraie explication à la fin ?',
    options: [
      { value: 'yes', label: 'Oui, on a mis des mots dessus' },
      { value: 'half', label: 'À moitié, rien de clair' },
      { value: 'no', label: 'Non, aucune. Ça me hante' },
    ],
  },
  {
    kind: 'question',
    id: 'firstBreakup',
    step: 10,
    phase: 1,
    type: 'single',
    prompt: 'C’est la première fois que vous rompez, {ex} et toi ?',
    options: [
      { value: 'yes', label: 'Oui, la première' },
      { value: 'again', label: 'Non, on a déjà rompu avant' },
      { value: 'cycle', label: 'On n’arrête pas de se quitter et revenir' },
    ],
  },

  // ── Micro-verdict n°1 (après l'étape 10) ──
  {
    kind: 'interlude',
    id: 'verdict1',
    phase: 1,
    variant: 'micro_verdict',
    title: 'Un premier fil se dessine.',
    body: "D'après tes premières réponses, cette rupture ressemble à un schéma précis. On continue, il me faut encore quelques éléments pour le confirmer.",
  },

  // ═══════════════ PHASE 2 · LA RELATION (étapes 11 → 24) ═══════════════
  {
    kind: 'question',
    id: 'coupleDynamic',
    step: 11,
    phase: 2,
    type: 'single',
    prompt: 'Votre couple, c’était plutôt...',
    options: [
      { value: 'passion', label: 'Passionnel, intense, montagnes russes' },
      { value: 'fusion', label: 'Fusionnel, collés en permanence' },
      { value: 'calm', label: 'Calme, posé, presque trop' },
      { value: 'distant', label: 'Distant, chacun dans son monde' },
    ],
  },
  {
    kind: 'question',
    id: 'whoInvested',
    step: 12,
    phase: 2,
    type: 'single',
    prompt: 'Au début, qui courait après qui ?',
    options: [
      { value: 'me', label: 'Moi, je donnais plus' },
      { value: 'them', label: '{ex}, c’est {ex} qui insistait' },
      { value: 'balanced', label: 'C’était équilibré' },
    ],
  },
  {
    kind: 'question',
    id: 'conflictStyle',
    step: 13,
    phase: 2,
    type: 'single',
    prompt: 'Quand il y avait un conflit, ça donnait quoi ?',
    options: [
      { value: 'talk', label: 'On en parlait, tant bien que mal' },
      { value: 'explode', label: 'Ça explosait, cris ou larmes' },
      { value: 'silence', label: 'Silence radio pendant des jours' },
      { value: 'avoid', label: 'On évitait, on faisait comme si de rien' },
    ],
  },
  {
    kind: 'question',
    id: 'exAfterFight',
    step: 14,
    phase: 2,
    type: 'single',
    prompt: 'Après une dispute, {ex} faisait quoi, en général ?',
    helper: 'Cette réponse en dit long sur sa façon de s’attacher.',
    options: [
      { value: 'withdraw', label: 'Il/elle se fermait, disparaissait' },
      { value: 'blame', label: 'Retournait la faute sur moi' },
      { value: 'repair', label: 'Revenait pour réparer' },
      { value: 'pretend', label: 'Faisait comme si rien ne s’était passé' },
    ],
  },
  {
    kind: 'question',
    id: 'exPatterns',
    step: 15,
    phase: 2,
    type: 'multiple',
    prompt: 'Est-ce que {ex} faisait souvent ça ? (coche tout ce qui colle)',
    options: [
      { value: 'hotcold', label: 'Chaud puis froid sans prévenir' },
      { value: 'jealousy', label: 'Jaloux·se ou contrôlant·e' },
      { value: 'minimize', label: 'Minimisait tes émotions' },
      { value: 'promises', label: 'Promettait des choses jamais tenues' },
      { value: 'others', label: 'Gardait des options ouvertes (ex, autres)' },
      { value: 'lies', label: 'Mentait, même sur des détails' },
      { value: 'guilt', label: 'Te faisait culpabiliser pour tout' },
    ],
  },
  {
    kind: 'question',
    id: 'madeYouDoubt',
    step: 16,
    phase: 2,
    type: 'scale',
    prompt: 'À quel point {ex} te faisait douter de toi ?',
    scaleLabels: ['Jamais', 'Tout le temps'],
  },
  {
    kind: 'question',
    id: 'hotAndCold',
    step: 17,
    phase: 2,
    type: 'scale',
    prompt: 'Le fameux chaud-froid, tu l’as vécu à quel point avec {ex} ?',
    scaleLabels: ['Pas du tout', 'En permanence'],
  },
  {
    kind: 'question',
    id: 'keptPromises',
    step: 18,
    phase: 2,
    type: 'single',
    prompt: '{ex} tenait ses promesses ?',
    options: [
      { value: 'yes', label: 'Oui, on pouvait compter dessus' },
      { value: 'sometimes', label: 'Une fois sur deux' },
      { value: 'rarely', label: 'Rarement, beaucoup de paroles' },
    ],
  },

  // ── Social proof n°1 (à l'étape 18) ──
  {
    kind: 'interlude',
    id: 'social1',
    phase: 2,
    variant: 'social_proof',
    body: "« Je pensais être la seule à avoir vécu ce chaud-froid. L'autopsie a mis des mots exacts sur ce que je ressentais depuis des mois. »",
    author: 'Léa, 27 ans',
    autoAdvanceMs: 2500,
  },

  {
    kind: 'question',
    id: 'ignoredSignals',
    step: 19,
    phase: 2,
    type: 'multiple',
    prompt: 'Quels signaux tu as choisi d’ignorer, avec le recul ?',
    options: [
      { value: 'friends', label: 'Mes amies me mettaient en garde' },
      { value: 'gut', label: 'Mon instinct me disait de fuir' },
      { value: 'ex', label: 'Sa façon de parler de ses ex' },
      { value: 'effort', label: 'Le déséquilibre d’efforts' },
      { value: 'future', label: 'Il/elle évitait de parler d’avenir' },
      { value: 'none', label: 'Honnêtement, aucun, ça m’a surprise' },
    ],
  },
  {
    kind: 'question',
    id: 'aloneInRelationship',
    step: 20,
    phase: 2,
    type: 'scale',
    prompt: 'Tu te sentais seule, parfois, DANS la relation ?',
    scaleLabels: ['Jamais', 'Souvent'],
  },
  {
    kind: 'question',
    id: 'whenYouKnew',
    step: 21,
    phase: 2,
    type: 'single',
    prompt: 'À quel moment tu as senti que ça allait finir ?',
    options: [
      { value: 'early', label: 'Très tôt, au fond de moi' },
      { value: 'event', label: 'Après un événement précis' },
      { value: 'slow', label: 'Ça s’est éteint doucement' },
      { value: 'never', label: 'Je ne l’ai jamais vu venir' },
    ],
  },
  {
    kind: 'question',
    id: 'entourageOpinion',
    step: 22,
    phase: 2,
    type: 'single',
    prompt: 'Ton entourage l’aimait bien, {ex} ?',
    options: [
      { value: 'loved', label: 'Oui, tout le monde l’adorait' },
      { value: 'mixed', label: 'Mitigé' },
      { value: 'no', label: 'Non, ils se méfiaient' },
      { value: 'hidden', label: 'Je le/la cachais un peu' },
    ],
  },
  {
    kind: 'question',
    id: 'talkedFuture',
    step: 23,
    phase: 2,
    type: 'single',
    prompt: '{ex} te parlait d’avenir, de projets à deux ?',
    options: [
      { value: 'yes', label: 'Oui, on avait des plans' },
      { value: 'vague', label: 'Vaguement, sans jamais concrétiser' },
      { value: 'no', label: 'Non, jamais vraiment' },
    ],
  },
  {
    kind: 'question',
    id: 'relationshipFelt',
    step: 24,
    phase: 2,
    type: 'single',
    prompt: 'Avec le recul, cette relation te rendait surtout...',
    options: [
      { value: 'alive', label: 'Vivante, mais épuisée' },
      { value: 'anxious', label: 'Anxieuse, sur le qui-vive' },
      { value: 'small', label: 'Petite, pas à ma place' },
      { value: 'safe', label: 'En sécurité, jusqu’à la fin' },
    ],
  },

  // ── Micro-verdict n°2 (après l'étape 24) — verdict partiel RÉEL par règles ──
  {
    kind: 'interlude',
    id: 'verdict2',
    phase: 2,
    variant: 'micro_verdict',
    title: 'Premier verdict partiel.',
    body: '',
    compute: (a, ex) => {
      const afterFight = a['exAfterFight'];
      const hotcold = Number(a['hotAndCold'] ?? 0);
      const patterns = (a['exPatterns'] as string[] | undefined) ?? [];
      const avoidant =
        afterFight === 'withdraw' ||
        afterFight === 'pretend' ||
        patterns.includes('others');
      const anxiousChaotic = hotcold >= 4 || patterns.includes('hotcold');
      let style: string;
      if (avoidant && anxiousChaotic) {
        style = 'un profil évitant qui souffle le chaud et le froid';
      } else if (avoidant) {
        style = "un style d'attachement qui penche vers l'évitant";
      } else if (anxiousChaotic) {
        style = 'un fonctionnement instable, chaud puis froid';
      } else {
        style = 'un attachement plus ambivalent qu’il n’y paraît';
      }
      return `Le style d'attachement de ${ex} penche vers ${style}. L'analyse complète le confirmera ou non — et surtout, elle te dira ce que ça a déclenché chez toi.`;
    },
  },

  // ═══════════════ PHASE 3 · TOI MAINTENANT (étapes 25 → 38) ═══════════════
  {
    kind: 'question',
    id: 'currentState',
    step: 25,
    phase: 3,
    type: 'single',
    prompt: 'Aujourd’hui, quand tu penses à {ex}, c’est surtout...',
    options: [
      { value: 'pain', label: 'Une douleur physique, au ventre' },
      { value: 'anger', label: 'De la colère' },
      { value: 'longing', label: 'Du manque, l’envie qu’il/elle revienne' },
      { value: 'numb', label: 'Le vide, plus rien' },
      { value: 'relief', label: 'Un début de soulagement' },
    ],
  },
  {
    kind: 'question',
    id: 'thoughtFrequency',
    step: 26,
    phase: 3,
    type: 'single',
    prompt: 'Tu penses à {ex} à quelle fréquence ?',
    options: [
      { value: 'constant', label: 'Quasiment sans arrêt' },
      { value: 'hourly', label: 'Plusieurs fois par heure' },
      { value: 'daily', label: 'Quelques fois par jour' },
      { value: 'fading', label: 'Ça commence à s’espacer' },
    ],
  },
  {
    kind: 'question',
    id: 'stalking',
    step: 27,
    phase: 3,
    type: 'single',
    prompt: 'Tu vas voir ses réseaux (ou ceux de son entourage) ?',
    helper: 'Sois honnête, c’est entre nous.',
    options: [
      { value: 'many', label: 'Plusieurs fois par jour' },
      { value: 'daily', label: 'Une fois par jour environ' },
      { value: 'sometimes', label: 'De temps en temps' },
      { value: 'blocked', label: 'J’ai bloqué / supprimé pour tenir' },
    ],
  },
  {
    kind: 'question',
    id: 'rereading',
    step: 28,
    phase: 3,
    type: 'single',
    prompt: 'Tu relis vos anciennes conversations ?',
    options: [
      { value: 'often', label: 'Souvent, je les connais par cœur' },
      { value: 'sometimes', label: 'Parfois, dans les coups durs' },
      { value: 'deleted', label: 'Je les ai supprimées' },
      { value: 'never', label: 'Non, jamais' },
    ],
  },
  {
    kind: 'question',
    id: 'urgeToWrite',
    step: 29,
    phase: 3,
    type: 'scale',
    prompt: 'L’envie de lui écrire, là, maintenant, elle est à combien ?',
    scaleLabels: ['Inexistante', 'Irrésistible'],
  },
  {
    kind: 'question',
    id: 'sleep',
    step: 30,
    phase: 3,
    type: 'single',
    prompt: 'Et le sommeil, ça donne quoi ?',
    options: [
      { value: 'bad', label: 'Catastrophique, je tourne en boucle' },
      { value: 'hard', label: 'Dur de m’endormir' },
      { value: 'wake', label: 'Je me réveille la nuit' },
      { value: 'ok', label: 'Ça va à peu près' },
    ],
  },
  {
    kind: 'question',
    id: 'confidant',
    step: 31,
    phase: 3,
    type: 'single',
    prompt: 'Tu en parles à qui, de tout ça ?',
    options: [
      { value: 'friends', label: 'Mes amies, beaucoup' },
      { value: 'family', label: 'Ma famille' },
      { value: 'onlyone', label: 'Une seule personne de confiance' },
      { value: 'noone', label: 'Personne, je garde tout' },
    ],
  },
  {
    kind: 'question',
    id: 'criedThisWeek',
    step: 32,
    phase: 3,
    type: 'single',
    prompt: 'Tu as pleuré cette semaine ?',
    options: [
      { value: 'daily', label: 'Presque tous les jours' },
      { value: 'few', label: 'Deux-trois fois' },
      { value: 'once', label: 'Une fois' },
      { value: 'no', label: 'Non, les larmes ne viennent pas' },
    ],
  },

  // ── Social proof n°2 (à l'étape 32) ──
  {
    kind: 'interlude',
    id: 'social2',
    phase: 3,
    variant: 'social_proof',
    body: "« Le check-in de chaque soir m'a évité au moins dix messages que j'aurais regrettés. Un mois après, je ne reconnais plus la fille du premier jour. »",
    author: 'Inès, 31 ans',
    autoAdvanceMs: 2500,
  },

  {
    kind: 'question',
    id: 'selfcare',
    step: 33,
    phase: 3,
    type: 'single',
    prompt: 'Tu arrives à prendre soin de toi (manger, bouger) ?',
    options: [
      { value: 'no', label: 'Non, tout me demande un effort énorme' },
      { value: 'trying', label: 'J’essaie, par à-coups' },
      { value: 'routine', label: 'Je tiens ma routine' },
    ],
  },
  {
    kind: 'question',
    id: 'worstMoment',
    step: 34,
    phase: 3,
    type: 'single',
    prompt: 'Le pire moment de ta journée, c’est...',
    options: [
      { value: 'wake', label: 'Le réveil, le retour à la réalité' },
      { value: 'commute', label: 'Les trajets, les temps morts' },
      { value: 'evening', label: 'Le soir, quand tout se calme' },
      { value: 'night', label: 'La nuit, quand je ne dors pas' },
    ],
  },
  {
    kind: 'question',
    id: 'weakHour',
    step: 35,
    phase: 3,
    type: 'single',
    prompt: 'À quelle heure c’est le plus dur, honnêtement ?',
    helper: 'Je m’en servirai pour être là au bon moment.',
    capture: 'weakHour',
    options: [
      { value: '7', label: 'Le matin, autour de 7h' },
      { value: '13', label: 'Le midi' },
      { value: '19', label: 'En début de soirée, vers 19h' },
      { value: '23', label: 'Tard, vers 23h' },
      { value: '2', label: 'Au milieu de la nuit' },
    ],
  },
  {
    kind: 'question',
    id: 'keptPhotos',
    step: 36,
    phase: 3,
    type: 'single',
    prompt: 'Ses photos, vos souvenirs, tu en as fait quoi ?',
    options: [
      { value: 'kept', label: 'Tout gardé, je n’y arrive pas' },
      { value: 'hidden', label: 'Rangés dans un dossier caché' },
      { value: 'some', label: 'Supprimé une partie' },
      { value: 'all', label: 'Tout supprimé' },
    ],
  },
  {
    kind: 'question',
    id: 'hopeReturn',
    step: 37,
    phase: 3,
    type: 'scale',
    prompt: 'Au fond, tu espères encore que {ex} revienne ?',
    scaleLabels: ['Plus du tout', 'De tout mon cœur'],
  },
  {
    kind: 'question',
    id: 'sinceBreakupFeel',
    step: 38,
    phase: 3,
    type: 'single',
    prompt: 'Depuis la rupture, la version de toi que tu vois, c’est...',
    options: [
      { value: 'lost', label: 'Une inconnue, je me suis perdue' },
      { value: 'fragile', label: 'Fragile, à fleur de peau' },
      { value: 'angry', label: 'En colère, mais debout' },
      { value: 'rebuilding', label: 'Quelqu’un qui commence à se relever' },
    ],
  },

  // ── Micro-verdict n°3 (après l'étape 38) — statistique sociale ──
  {
    kind: 'interlude',
    id: 'verdict3',
    phase: 3,
    variant: 'stat',
    title: '73 %.',
    body: "73 % des personnes qui répondent comme toi sous-estiment le temps qu'elles ont déjà perdu à attendre {ex}. On va arrêter cette hémorragie. Il me reste quelques questions.",
  },

  // ═══════════════ PHASE 4 · L'ENGAGEMENT (étapes 39 → 47) ═══════════════
  {
    kind: 'question',
    id: 'goal',
    step: 39,
    phase: 4,
    type: 'single',
    prompt: 'Ce que tu veux vraiment, là, tout de suite ?',
    capture: 'goal',
    options: [
      { value: 'understand', label: 'Comprendre ce qui s’est passé' },
      { value: 'moveon', label: 'Tourner la page, arrêter d’avoir mal' },
      { value: 'rebuild', label: 'Me reconstruire, redevenir moi' },
      { value: 'noconctact', label: 'Tenir le no-contact coûte que coûte' },
    ],
  },
  {
    kind: 'question',
    id: 'dailyTime',
    step: 40,
    phase: 4,
    type: 'single',
    prompt: 'Tu peux m’accorder combien de temps par jour ?',
    options: [
      { value: '2min', label: '2 minutes, pas plus' },
      { value: '5min', label: '5 minutes' },
      { value: '10min', label: '10 minutes ou plus' },
    ],
  },
  {
    kind: 'question',
    id: 'deadline',
    step: 41,
    phase: 4,
    type: 'date',
    prompt: 'Tu t’es fixé une date où tu veux aller mieux ?',
    helper: 'Une date symbolique, même approximative. On la vise ensemble.',
    optional: true,
    capture: 'deadline',
  },
  {
    kind: 'question',
    id: 'sensitiveDates',
    step: 42,
    phase: 4,
    type: 'multiple',
    prompt: 'Des dates sensibles arrivent bientôt ?',
    helper: 'Je préparerai un plan pour t’aider à les traverser.',
    optional: true,
    options: [
      { value: 'anniversary', label: 'Votre anniversaire de couple' },
      { value: 'exbirthday', label: 'L’anniversaire de {ex}' },
      { value: 'holidays', label: 'Fêtes / vacances à deux d’habitude' },
      { value: 'event', label: 'Un événement où il/elle sera' },
      { value: 'none', label: 'Rien de prévu pour l’instant' },
    ],
  },
  {
    kind: 'question',
    id: 'betterMeans',
    step: 43,
    phase: 4,
    type: 'single',
    prompt: 'Tu sauras que tu vas mieux le jour où...',
    options: [
      { value: 'noname', label: 'Son prénom ne me fera plus rien' },
      { value: 'sleep', label: 'Je dormirai une nuit entière' },
      { value: 'laugh', label: 'Je rirai à nouveau sans forcer' },
      { value: 'newlove', label: 'Je serai prête à aimer ailleurs' },
    ],
  },
  {
    kind: 'question',
    id: 'pastBreakups',
    step: 44,
    phase: 4,
    type: 'single',
    prompt: 'Tu as déjà surmonté une rupture avant celle-là ?',
    options: [
      { value: 'yes', label: 'Oui, et j’en suis sortie plus forte' },
      { value: 'hard', label: 'Oui, mais ça a été très long' },
      { value: 'first', label: 'C’est ma première vraie rupture' },
    ],
  },
  {
    kind: 'question',
    id: 'expectations',
    step: 45,
    phase: 4,
    type: 'multiple',
    prompt: 'Qu’est-ce que tu attends de moi, concrètement ?',
    options: [
      { value: 'clarity', label: 'De la clarté sur ce qui s’est passé' },
      { value: 'support', label: 'Un soutien aux heures difficiles' },
      { value: 'nocontact', label: 'M’empêcher de le/la recontacter' },
      { value: 'glowup', label: 'Un vrai plan pour me relever' },
      { value: 'notalone', label: 'Ne plus me sentir seule là-dedans' },
    ],
  },
  {
    kind: 'question',
    id: 'commit90',
    step: 46,
    phase: 4,
    type: 'single',
    prompt: 'Tu es prête à t’y tenir 90 jours ?',
    options: [
      { value: 'yes', label: 'Oui. J’en peux plus de cet état.' },
      { value: 'scared', label: 'J’ai peur, mais oui' },
      { value: 'try', label: 'Je vais essayer' },
    ],
  },
  {
    kind: 'question',
    id: 'moveOnScore',
    step: 47,
    phase: 4,
    type: 'scale',
    prompt: 'Sur 10, à quel point tu veux vraiment passer à autre chose ?',
    scaleLabels: ['1', '10'],
    scaleMax: 10,
    capture: 'moveOnScore',
  },
];

/** Nombre de vraies questions (hors interludes) — doit valoir 47. */
export const TOTAL_QUESTIONS = QUIZ.filter((s) => s.kind === 'question').length;
