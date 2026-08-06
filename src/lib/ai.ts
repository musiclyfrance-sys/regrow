import { env } from './env';
import { supabase } from './supabase';

/**
 * Passerelle vers les Edge Functions IA (autopsie, simulateur, insight).
 *
 * RÈGLE ABSOLUE : aucune clé Anthropic côté client. Tous les appels passent par
 * une Edge Function Supabase. Ici on ne fait qu'invoquer la fonction, ou — en
 * mode mock — générer une réponse locale crédible pour développer sans backend.
 */

export interface AutopsyReport {
  verdict_global: string;
  attachement_ex: string;
  pattern_utilisatrice: string;
  dynamique: string;
  parts: string;
  red_flags: string[];
  plan_90_jours: {
    phase: string;
    objectif: string;
    actions: string[];
  }[];
  flag_detresse?: boolean;
}

interface AutopsyInput {
  answers: Record<string, unknown>;
  exName: string;
}

/** Simule un délai réseau réaliste (l'écran d'analyse a sa propre théâtralisation). */
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mockReport(exName: string): AutopsyReport {
  const ex = exName || 'ton ex';
  return {
    verdict_global: `Cette histoire ne s'est pas terminée par manque d'amour, mais parce que ${ex} n'a jamais appris à rester quand ça devenait vrai.`,
    attachement_ex: `À partir de ce que tu décris, ${ex} montre les signes d'un attachement plutôt évitant. Ce n'est pas un diagnostic, c'est une hypothèse de comportement. Quelqu'un d'évitant se sent vite envahi dès que l'intimité devient réelle : il se rapproche quand la distance est confortable, puis se retire dès que tu demandes de la constance. Le chaud-froid que tu as vécu n'était probablement pas une stratégie consciente pour te faire souffrir, mais une façon de réguler sa propre peur d'être englouti. Comprendre ça ne l'excuse pas : ça t'enlève juste l'idée fausse que tu aurais pu «mieux faire» pour le retenir.`,
    pattern_utilisatrice: `Ton fil rouge, c'est d'avoir cru que plus tu donnais, plus tu deviendrais indispensable. Face à quelqu'un qui se retirait, tu as compensé, en patience, en compréhension, en efforts. C'est une qualité, mais retournée contre toi : tu as fini par mesurer ta valeur à ta capacité à supporter l'inconstance. La bonne nouvelle, et c'est le seul terrain que tu contrôles, c'est que ce réflexe s'apprend et se désapprend. Les 90 prochains jours servent à ça : réorienter cette énergie de soin vers la seule personne qui te la rendra vraiment, toi.`,
    dynamique: `Votre couple fonctionnait comme un thermostat déréglé. Dès que tu te rapprochais, ${ex} baissait la température ; dès que tu reculais, blessée, il/elle remontait juste assez pour te garder. Ce cycle a créé une intermittence — la même mécanique qui rend les machines à sous addictives : la récompense imprévisible accroche plus fort que la récompense constante. Ce n'est pas de la faiblesse de ta part d'être restée accrochée, c'est de la neurologie. Le problème, c'est que ce système ne pouvait pas produire de sécurité : il produisait de l'espoir, en boucle, et l'espoir n'est pas de l'amour partagé.`,
    parts: `La part de ${ex} : avoir laissé l'ambiguïté faire le travail à sa place, ne jamais avoir posé de mots clairs, avoir pris sans nommer ce qu'il/elle offrait en retour. Ta part, sans culpabilité : avoir traduit les signaux flous en promesses, avoir accepté des miettes en les appelant un repas. Faire le tri des parts, ce n'est pas distribuer des torts, c'est reprendre la seule moitié sur laquelle tu peux agir : la tienne.`,
    red_flags: [
      `Les allers-retours "chaud puis froid" que tu as fini par trouver normaux.`,
      `Les promesses d'avenir qui ne se concrétisaient jamais.`,
      `Ton instinct qui te soufflait de fuir, et que tu as appris à faire taire.`,
      `Le déséquilibre d'efforts que tu justifiais par "il/elle est comme ça".`,
      `Le fait de te sentir seule alors même que vous étiez ensemble.`,
    ],
    plan_90_jours: [
      {
        phase: 'Jours 1 à 30 : couper l\'hémorragie',
        objectif: 'Stopper le contact et les rechutes de stalking pour laisser ton système nerveux redescendre.',
        actions: [
          'No-contact strict : streak visible dès le premier soir.',
          'Coffre-fort : y ranger photos et conversations, hors de portée.',
          'Check-in chaque soir à ton heure faible pour désamorcer les pics.',
        ],
      },
      {
        phase: 'Jours 31 à 60 : reprendre du terrain',
        objectif: 'Réinvestir l\'énergie de soin vers toi et ton monde.',
        actions: [
          'Un défi Glow-Up par jour, concret et court.',
          'Réactiver une amitié mise de côté pendant la relation.',
          'La lettre jamais envoyée : l\'écrire, ne pas l\'envoyer.',
        ],
      },
      {
        phase: 'Jours 61 à 90 : refermer',
        objectif: 'Transformer la rupture en socle plutôt qu\'en cicatrice.',
        actions: [
          'Cérémonie du coffre : récupérer ou brûler, ton choix.',
          'Écouter ta capsule J+0 et mesurer le chemin.',
          'Certificat de guérison : ce que tu ne veux plus jamais accepter.',
        ],
      },
    ],
  };
}

/**
 * Génère l'autopsie. En mock : réponse locale après un court délai.
 * En réel : invoque l'Edge Function `autopsy` (qui appelle claude-sonnet-4-6).
 */
export async function generateAutopsy(input: AutopsyInput): Promise<AutopsyReport> {
  if (env.mockMode || !supabase) {
    await delay(1200);
    return mockReport(input.exName);
  }
  const { data, error } = await supabase.functions.invoke<AutopsyReport>('autopsy', {
    body: input,
  });
  if (error || !data) {
    // Repli : ne jamais laisser l'utilisatrice sur un écran mort.
    return mockReport(input.exName);
  }
  return data;
}
