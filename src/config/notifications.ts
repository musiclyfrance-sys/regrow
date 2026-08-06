/**
 * Banque de notifications — ton grande sœur lucide, jamais culpabilisant.
 * Le token {ex} est remplacé par le prénom, {hour} par l'heure faible.
 * Une seule notification par jour maximum (hors capsules).
 */

/** Les 30 messages du rendez-vous quotidien, en rotation. */
export const DAILY_MESSAGES: { title: string; body: string }[] = [
  { title: 'On y est', body: '{hour}. C’est l’heure où tu flanches d’habitude. Pas ce soir.' },
  { title: 'Deux minutes', body: 'Ton check-in t’attend. Deux minutes pour toi, et ton insight du jour.' },
  { title: 'Tiens bon', body: 'L’envie d’écrire passe toujours. Elle met 12 minutes en moyenne. Respire.' },
  { title: 'Un jour de plus.', body: 'Chaque soir sans message, c’est un fil de moins qui te retient.' },
  { title: 'Il ne verra rien.', body: 'Ce que tu fais là, personne ne le voit. Mais dans 30 jours, tout le monde le verra.' },
  { title: 'Ton compteur grandit', body: 'Elle dort peut-être. Toi, tu te reconstruis. Ce n’est pas la même nuit.' },
  { title: 'On souffle', body: 'Si c’est lourd ce soir, le bouton rouge est là. C’est exactement pour ça qu’il existe.' },
  { title: 'Pas de stalking', body: 'Ses réseaux n’ont rien de nouveau à t’apprendre. Ton avenir, si.' },
  { title: 'Le silence travaille', body: 'Ton silence dit plus que n’importe quel message. Laisse-le parler.' },
  { title: 'Petit rappel', body: 'Tu n’as pas perdu ton temps. Tu as appris ce que tu ne veux plus jamais.' },
  { title: 'Ce soir, toi', body: 'Le check-in, une tisane, et ton lit. Le programme parfait existe.' },
  { title: 'Rappelle-toi', body: 'Tu n’attends plus de réponse. C’est ça, la liberté qui s’installe.' },
  { title: 'L’envie de relire ?', body: 'Les vieilles conversations sont un musée. On n’y vit pas.' },
  { title: 'Ton cerveau te ment.', body: 'Il te repasse le meilleur en boucle. Toi, tu connais la version complète.' },
  { title: 'Encore là', body: 'Tu t’es levée, tu as tenu ta journée. C’est déjà une victoire, même si elle est discrète.' },
  { title: 'Zéro message', body: 'Le message que tu n’enverras pas ce soir, c’est celui que tu ne regretteras pas demain.' },
  { title: 'La courbe descend', body: 'La place qu’il occupe dans ta tête rétrécit chaque jour. Même quand tu ne le sens pas.' },
  { title: 'Fais le test', body: 'Envie de lui écrire ? Le crash test est là pour ça, et ton compteur reste intact.' },
  { title: 'Ton insight t’attend', body: 'Celui de ce soir est différent d’hier. Viens le chercher.' },
  { title: 'Pas d’insomnie inutile', body: 'Si tu tournes en boucle, ouvre l’app au lieu d’ouvrir ses photos.' },
  { title: 'Un geste pour toi.', body: 'Le défi du jour prend 20 minutes. C’est 20 minutes où il n’existe pas.' },
  { title: 'Tu avances', body: 'Relis ton verdict si tu doutes. Rien n’a changé depuis : c’était la bonne décision.' },
  { title: 'Les amies', body: 'Celle qui t’a toujours soutenue mérite un message. Lui, non.' },
  { title: 'Question du soir', body: 'Combien de fois aujourd’hui ? Sois honnête au check-in. C’est entre nous.' },
  { title: 'Le coffre veille', body: 'Tes souvenirs sont à l’abri. Toi aussi, tu peux te reposer.' },
  { title: 'C’est mécanique', body: 'Chaque soir tenu assèche l’habitude. C’est de la chimie, pas de la magie.' },
  { title: 'Version future', body: 'La toi de dans 3 mois te dit merci pour ce que tu fais ce soir.' },
  { title: 'Rechute évitée', body: 'Chaque envie surmontée rend la suivante plus faible. Tu es en train de gagner.' },
  { title: 'Pas ce soir', body: 'Demain peut-être ? Non plus. Mais commence par pas ce soir.' },
  { title: 'On y est presque.', body: 'Le plus dur est derrière toi, même si ça ne se sent pas encore. Les chiffres le prouvent.' },
];

/** Milestones de streak (jours) avec leur message — carte partageable à la clé. */
export const MILESTONES: { day: number; title: string; body: string }[] = [
  { day: 3, title: '3 jours. 🌱', body: 'Les 72 premières heures sont les plus dures. Tu viens de les passer.' },
  { day: 7, title: 'Une semaine', body: 'Tu as tenu 7 jours sans contact, et ta carte est prête dans l’app.' },
  { day: 14, title: '2 semaines', body: 'L’habitude est cassée. Maintenant on construit la suite.' },
  { day: 21, title: '21 jours', body: 'Trois semaines. Le cerveau commence à te rendre la place qu’il occupait.' },
  { day: 30, title: 'Un mois. 🎉', body: '30 jours sans lui écrire. Ta capsule du premier jour arrive bientôt.' },
  { day: 45, title: 'Mi-parcours', body: '45 jours. Tu es officiellement plus proche de la fin que du début.' },
  { day: 60, title: '2 mois', body: '60 jours. Relis ton verdict du premier jour : tu ne le liras plus pareil.' },
  { day: 75, title: '75 jours', body: 'Encore 15. Le coffre s’ouvre bientôt, et tu choisiras, toi.' },
  { day: 90, title: '90 jours. 🏆', body: 'Tu l’as fait. Ton certificat de guérison t’attend dans l’app.' },
];

/** Message d'un retour de capsule (hors quota quotidien). */
export const CAPSULE_MESSAGE = {
  title: 'Quelqu’un veut te parler.',
  body: 'C’est toi, il y a 30 jours. Elle a des choses à te dire.',
};

/** Message de préparation d'une date sensible (armé 24 h avant). */
export const SENSITIVE_DATE_MESSAGE = (label: string) => ({
  title: 'Demain, ça va secouer un peu.',
  body: `${label}. On a un plan pour la journée, viens le voir ce soir.`,
});

/** Heure faible du quiz → heure de programmation (24 h). */
export const WEAK_HOUR_TO_HOUR: Record<string, number> = {
  '7': 7,
  '13': 13,
  '19': 19,
  '23': 23,
  '2': 22, // « milieu de la nuit » : on prévient à 22 h, pas à 2 h du matin
};
