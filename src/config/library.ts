/**
 * Bibliothèque — tout le contenu doux de l'app.
 * Le moteur des écrans ne contient aucun texte : tout vit ici, typé.
 * Règles d'écriture : tutoiement, phrases complètes et courtes, jamais de
 * tiret cadratin, jamais de jargon.
 */

// ─── Respiration ─────────────────────────────────────────────────────────────

export interface BreathPhase {
  /** Libellé affiché pendant la phase. */
  label: string;
  /** Durée en secondes. */
  seconds: number;
  /** Mouvement du cercle pendant la phase. */
  motion: 'grow' | 'hold' | 'shrink';
}

export interface BreathPattern {
  id: string;
  name: string;
  purpose: string;
  phases: BreathPhase[];
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'calme',
    name: 'Retrouver le calme',
    purpose: 'Quand la tête tourne et que tu veux redescendre.',
    phases: [
      { label: 'Inspire', seconds: 4, motion: 'grow' },
      { label: 'Souffle', seconds: 6, motion: 'shrink' },
    ],
  },
  {
    id: 'sommeil',
    name: 'Glisser vers le sommeil',
    purpose: 'Le rythme 4-7-8, parfait au fond du lit.',
    phases: [
      { label: 'Inspire', seconds: 4, motion: 'grow' },
      { label: 'Retiens', seconds: 7, motion: 'hold' },
      { label: 'Souffle', seconds: 8, motion: 'shrink' },
    ],
  },
  {
    id: 'urgence',
    name: 'Reprendre pied',
    purpose: 'Quand l’envie de lui écrire devient trop forte.',
    phases: [
      { label: 'Inspire', seconds: 4, motion: 'grow' },
      { label: 'Retiens', seconds: 4, motion: 'hold' },
      { label: 'Souffle', seconds: 4, motion: 'shrink' },
      { label: 'Reste vide', seconds: 4, motion: 'hold' },
    ],
  },
];

export const BREATH_DURATIONS_MIN = [1, 3, 5] as const;

// ─── Méditations guidées ─────────────────────────────────────────────────────

export interface MeditationStep {
  text: string;
  seconds: number;
}

export interface Meditation {
  id: string;
  name: string;
  purpose: string;
  minutes: number;
  steps: MeditationStep[];
}

export const MEDITATIONS: Meditation[] = [
  {
    id: 'calme',
    name: 'Revenir ici',
    purpose: 'Trois minutes pour sortir du film que ta tête se fait.',
    minutes: 3,
    steps: [
      { text: 'Installe-toi, pose ton téléphone sur ton ventre ou devant toi.', seconds: 12 },
      { text: 'Ferme les yeux à moitié, laisse ton regard se poser.', seconds: 12 },
      { text: 'Prends une grande inspiration, puis souffle lentement.', seconds: 15 },
      { text: 'Repère trois sons autour de toi, sans les juger.', seconds: 25 },
      { text: 'Repère deux choses que ton corps touche, le lit, le tissu.', seconds: 25 },
      { text: 'Ta tête va repartir vers lui, c’est normal. Ramène-la doucement ici.', seconds: 25 },
      { text: 'Encore trois respirations lentes, à ton rythme.', seconds: 30 },
      { text: 'Tu es là, maintenant. C’est exactement ce qu’il fallait faire.', seconds: 16 },
    ],
  },
  {
    id: 'dormir',
    name: 'Avant de dormir',
    purpose: 'Déposer la journée pour ne pas la ruminer toute la nuit.',
    minutes: 5,
    steps: [
      { text: 'Allonge-toi, écarte légèrement les bras du corps.', seconds: 15 },
      { text: 'Souffle tout l’air de tes poumons, puis laisse l’inspiration venir seule.', seconds: 20 },
      { text: 'Passe en revue ta journée comme si tu la regardais de loin.', seconds: 30 },
      { text: 'Ce qui a été dur aujourd’hui, tu n’as plus à le porter cette nuit.', seconds: 25 },
      { text: 'Détends ton front, ta mâchoire, tes épaules, dans cet ordre.', seconds: 35 },
      { text: 'Sens ton corps devenir plus lourd à chaque expiration.', seconds: 40 },
      { text: 'Si une pensée de lui arrive, laisse-la passer comme une voiture dans la rue.', seconds: 40 },
      { text: 'Tu n’as plus rien à faire. Juste respirer.', seconds: 45 },
      { text: 'Laisse-toi glisser. Bonne nuit.', seconds: 30 },
    ],
  },
  {
    id: 'pensee',
    name: 'Quand tu penses à lui',
    purpose: 'Accueillir la vague sans te laisser emporter.',
    minutes: 3,
    steps: [
      { text: 'Tu penses à lui, là. Ne te dispute pas pour ça.', seconds: 14 },
      { text: 'Mets une main sur ta poitrine, sens-la se soulever.', seconds: 18 },
      { text: 'Dis-toi intérieurement : c’est une vague, elle va passer.', seconds: 20 },
      { text: 'Observe où ça se loge dans ton corps, la gorge, le ventre.', seconds: 25 },
      { text: 'Respire vers cet endroit, comme pour lui faire de la place.', seconds: 30 },
      { text: 'La vague monte, elle stagne, puis elle redescend. Toujours.', seconds: 30 },
      { text: 'Tu n’as pas besoin de lui écrire pour que ça passe. La preuve, ça passe déjà.', seconds: 25 },
      { text: 'Reviens à la pièce autour de toi. C’est fini pour cette fois.', seconds: 18 },
    ],
  },
  {
    id: 'corps',
    name: 'Retrouver ton corps',
    purpose: 'Quatre minutes pour te réhabiter des pieds à la tête.',
    minutes: 4,
    steps: [
      { text: 'Assieds-toi ou allonge-toi, comme tu veux.', seconds: 12 },
      { text: 'Porte ton attention sur tes pieds. Juste tes pieds.', seconds: 25 },
      { text: 'Remonte vers tes jambes, sens leur poids sur le matelas.', seconds: 25 },
      { text: 'Ton ventre se gonfle et se dégonfle, sans effort.', seconds: 30 },
      { text: 'Tes mains. Réchauffe-les l’une contre l’autre si tu veux.', seconds: 25 },
      { text: 'Tes épaules descendent un peu plus à chaque souffle.', seconds: 30 },
      { text: 'Ton visage se détend, même derrière les yeux.', seconds: 30 },
      { text: 'Ce corps, c’est chez toi. Personne ne peut te le prendre.', seconds: 25 },
      { text: 'Reste encore un instant, puis ouvre les yeux doucement.', seconds: 18 },
    ],
  },
];

// ─── Citations ───────────────────────────────────────────────────────────────
// Textes originaux Regrow, jamais de fausses attributions.

export const QUOTES: string[] = [
  'Tu ne lui manques pas moins parce que tu tiens bon. Tu te manques moins à toi-même.',
  'Le silence que tu gardes aujourd’hui, c’est la paix que tu t’offres demain.',
  'Tu n’as pas perdu ton temps avec lui. Tu as appris où était ta limite.',
  'Ce n’est pas lui qui te manque ce soir. C’est l’habitude d’avoir quelqu’un.',
  'Guérir, ce n’est pas ne plus y penser. C’est y penser sans te noyer.',
  'Tu n’es pas trop sensible. Tu as aimé pour de vrai, c’est tout.',
  'Chaque soir sans message est une brique de la vie d’après.',
  'Il ne reviendra pas différent. Toi, par contre, tu deviens différente.',
  'Ton envie de lui écrire parle de ta douleur, pas de vos chances.',
  'Tu peux regretter la relation et savoir qu’elle devait finir. Les deux sont vrais.',
  'La personne qui doit te choisir tous les matins, désormais, c’est toi.',
  'Ce que tu ressens est immense. Ce que tu traverses est passager.',
  'Tu ne recommences pas de zéro. Tu recommences avec tout ce que tu as compris.',
  'Un jour tu raconteras cette histoire sans que ta voix tremble. Ce jour approche.',
  'Le manque ment beaucoup. Il ne te montre que les meilleurs souvenirs.',
  'Tu n’as pas à être forte tout le temps. Juste à ne pas lui écrire ce soir.',
  'Ton lit est plus grand sans lui. Ta vie aussi, bientôt.',
  'Il occupait tes pensées. Ça ne veut pas dire qu’il les mérite.',
  'Pleurer ce soir ne t’empêchera pas d’aller mieux demain. C’est même le chemin.',
  'Tu crois que tu l’attends. En vrai, tu te retrouves.',
  'La meilleure réponse à son silence, c’est ta vie qui continue.',
];

// ─── Articles ────────────────────────────────────────────────────────────────

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
}

export interface Article {
  id: string;
  title: string;
  teaser: string;
  minutes: number;
  sections: ArticleSection[];
}

export const ARTICLES: Article[] = [
  {
    id: 'envie-ecrire',
    title: 'Pourquoi tu veux lui écrire à 23 h',
    teaser: 'Ce n’est pas de la faiblesse, c’est de la chimie. Et ça se déjoue.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'Il est tard, tu es fatiguée, et ton téléphone pèse trois tonnes dans ta main. L’envie de lui envoyer un message monte comme une marée. Tu n’es pas folle, et tu n’es pas faible. Il se passe quelque chose de très concret dans ton cerveau.',
        ],
      },
      {
        heading: 'Ton cerveau est en manque, au sens propre',
        paragraphs: [
          'Une relation, c’est une source régulière de réconfort. Ton cerveau s’y est habitué comme à un rendez-vous. Quand la source disparaît, il réclame sa dose, surtout le soir, quand plus rien ne le distrait.',
          'Ce que tu ressens à 23 h n’est pas un signe que vous devez vous reparler. C’est un signe que ton cerveau réclame une habitude perdue. La nuance change tout.',
        ],
      },
      {
        heading: 'Pourquoi la nuit frappe plus fort',
        paragraphs: [
          'La journée, ton attention est occupée. Le soir, les défenses tombent, la fatigue amplifie les émotions, et la solitude paraît plus grande qu’elle ne l’est.',
          'Un message envoyé à 23 h est presque toujours un message que tu regrettes à 9 h. Pas parce qu’il était sincère, mais parce qu’il était dicté par le manque, pas par toi.',
        ],
      },
      {
        heading: 'Quoi faire à la place',
        paragraphs: [
          'Donne à ton cerveau une autre sortie. Écris le message dans ton journal ici, mot pour mot, sans l’envoyer. L’envie descend souvent de moitié juste en l’écrivant.',
          'Ensuite, deux minutes de respiration ou un son de pluie, et tu laisses la marée redescendre. Elle redescend toujours. Chaque soir où tu tiens, le rendez-vous de 23 h perd un peu de sa force.',
        ],
      },
    ],
  },
  {
    id: 'no-contact',
    title: 'Le sans contact, comment ça marche vraiment',
    teaser: 'Ce n’est pas une punition pour lui. C’est un pansement pour toi.',
    minutes: 4,
    sections: [
      {
        paragraphs: [
          'On te l’a sûrement déjà dit : arrête de lui parler, coupe tout. Facile à dire. Mais il faut comprendre pourquoi ça marche, sinon tu tiendras trois jours et tu craqueras en te sentant nulle.',
        ],
      },
      {
        heading: 'Chaque contact remet le compteur à zéro',
        paragraphs: [
          'Ton attachement à lui fonctionne comme une blessure qui cicatrise. Chaque message, chaque story regardée, chaque « juste pour savoir comment tu vas » rouvre la plaie. Pas en entier, mais assez pour que tout recommence.',
          'Le sans contact ne sert pas à le punir ni à le faire revenir. Il sert à laisser ta cicatrisation avancer sans interruption. C’est le seul but.',
        ],
      },
      {
        heading: 'Ce qui va se passer, semaine par semaine',
        paragraphs: [
          'Les premiers jours sont les pires, c’est physique, presque comme un sevrage. Ton corps réclame. C’est là que le compteur de l’app compte le plus.',
          'Vers deux semaines, les journées deviennent plus légères que les soirées. C’est bon signe, la journée guérit avant la nuit.',
          'Vers un mois, tu auras des heures entières sans penser à lui. Puis des jours. Ce n’est pas que tu l’oublies, c’est que ta vie reprend la place.',
        ],
      },
      {
        heading: 'Et si tu craques',
        paragraphs: [
          'Un craquage ne détruit pas tout ce que tu as construit. Ici, ton compteur garde une grande partie de tes points, parce que dix jours de tenue restent dix jours de tenue.',
          'Tu notes ce qui a déclenché l’envie, tu apprends, tu repars. Les rechutes font partie du chemin de presque tout le monde. La honte, elle, n’est pas obligatoire.',
        ],
      },
    ],
  },
  {
    id: 'attachement',
    title: 'Ta façon d’aimer ne tombe pas du ciel',
    teaser: 'Comprendre comment tu t’attaches, c’est comprendre la moitié de ta douleur.',
    minutes: 4,
    sections: [
      {
        paragraphs: [
          'Pourquoi certaines personnes tournent la page en un mois et toi, tu as l’impression de porter un deuil ? Une grande partie de la réponse tient dans ta façon de t’attacher. Elle s’est construite bien avant lui.',
        ],
      },
      {
        heading: 'Les trois grandes façons de s’attacher',
        paragraphs: [
          'Certaines personnes s’attachent avec confiance. La relation est un port, pas une mer agitée. Quand ça se termine, elles souffrent, mais sans se perdre.',
          'D’autres s’attachent avec inquiétude. Elles guettent les signes, relisent les messages, ont besoin d’être rassurées souvent. Quand ça se termine, le manque est violent, presque physique.',
          'D’autres encore gardent toujours une porte de sortie. Elles aiment, mais de loin, par peur d’être envahies. Souvent, elles souffrent après coup, avec du retard.',
        ],
      },
      {
        heading: 'Pourquoi ça éclaire ta rupture',
        paragraphs: [
          'Si tu t’attaches avec inquiétude et que lui gardait ses distances, votre couple était une poursuite. Toi qui avances, lui qui recule. Ce jeu épuisant crée une dépendance très forte, et une rupture très douloureuse.',
          'Ce n’est pas une fatalité. C’est un point de départ. Ce qui a été appris peut se réapprendre autrement, et ton rapport en dit long là-dessus.',
        ],
      },
      {
        heading: 'Ce que tu peux en faire dès maintenant',
        paragraphs: [
          'Repère ton réflexe dominant quand tu vas mal : chercher le contact à tout prix, ou tout couper et faire comme si de rien n’était. Le simple fait de le voir venir te redonne le choix.',
          'Et rappelle-toi une chose : ta façon d’aimer intensément n’est pas un défaut. Mal dirigée, elle fait mal. Bien dirigée, c’est une force que beaucoup t’envient.',
        ],
      },
    ],
  },
  {
    id: 'rechute',
    title: 'Tu as craqué, et maintenant ?',
    teaser: 'Ce qui compte n’est pas la chute, c’est la suite. Mode d’emploi sans honte.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'Tu lui as écrit. Ou répondu. Ou tu as passé une heure sur son profil. Et maintenant tu t’en veux, ce qui fait deux douleurs au lieu d’une. Respire, on va faire le tri.',
        ],
      },
      {
        heading: 'Ce que la rechute veut dire, et ne veut pas dire',
        paragraphs: [
          'Une rechute veut dire que tu souffres encore et que le lien était fort. C’est tout. Elle ne veut pas dire que tu es faible, ni que tout est à refaire, ni que vous devez vous remettre ensemble.',
          'Regarde ce qui s’est passé juste avant. La fatigue, l’alcool, une chanson, une photo. Ta rechute a un déclencheur, et un déclencheur repéré est un déclencheur à moitié désarmé.',
        ],
      },
      {
        heading: 'Les trois gestes qui suivent',
        paragraphs: [
          'Un, arrête l’hémorragie sans drame. Pas de deuxième message pour expliquer le premier. On coupe là, gentiment.',
          'Deux, note dans ton journal ce que tu espérais obtenir, et ce que tu as obtenu en vrai. La différence entre les deux, c’est ta meilleure leçon.',
          'Trois, reprends ton programme dès ce soir, pas lundi. Ton compteur garde la mémoire de tout ce que tu as tenu. Rien n’est perdu.',
        ],
      },
    ],
  },
  {
    id: 'dormir',
    title: 'Dormir quand la tête tourne',
    teaser: 'Cinq gestes concrets pour les nuits où tout remonte.',
    minutes: 3,
    sections: [
      {
        paragraphs: [
          'La nuit après une rupture, le lit devient un ring. Tu rejoues les conversations, tu imagines des retrouvailles, tu refais l’histoire. Voici ce qui aide vraiment, testé par des milliers de personnes passées par là.',
        ],
      },
      {
        heading: 'Avant de te coucher',
        paragraphs: [
          'Vide ta tête sur du papier ou dans ton journal ici. Dix minutes, tout ce qui tourne, sans faire de belles phrases. Une pensée écrite tourne beaucoup moins fort qu’une pensée gardée.',
          'Mets ton téléphone en mode nuit et éloigne les réseaux. Son profil à minuit, c’est la pire berceuse du monde.',
        ],
      },
      {
        heading: 'Une fois dans le lit',
        paragraphs: [
          'Lance un son d’ambiance, la pluie marche très bien. Ton cerveau accroche au son au lieu d’accrocher aux pensées.',
          'Essaie la respiration 4-7-8 : inspire sur 4, retiens sur 7, souffle sur 8. Trois ou quatre cycles suffisent souvent à faire décrocher le corps.',
          'Si au bout de vingt minutes ça mouline encore, ne reste pas à te battre. Lève-toi, bois un verre d’eau, reviens. Le lit doit rester un endroit où on dort, pas où on rumine.',
        ],
      },
    ],
  },
];

// ─── Sons relaxants ──────────────────────────────────────────────────────────

export type SoundId = 'pluie' | 'ocean' | 'feu' | 'nuit';

export interface AmbientSound {
  id: SoundId;
  name: string;
  hint: string;
}

export const SOUNDS: AmbientSound[] = [
  { id: 'pluie', name: 'Pluie', hint: 'Une averse régulière contre la vitre.' },
  { id: 'ocean', name: 'Océan', hint: 'Des vagues lentes qui vont et viennent.' },
  { id: 'feu', name: 'Feu', hint: 'Un feu de cheminée qui crépite.' },
  { id: 'nuit', name: 'Nuit', hint: 'Une nuit d’été, quelques grillons au loin.' },
];

/** Minuteries de sommeil disponibles (minutes). 0 = en continu. */
export const SLEEP_TIMERS_MIN = [15, 30, 60, 0] as const;
