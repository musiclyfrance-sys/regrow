# Regrow — guide projet pour Claude Code

App iOS consumer française d'accompagnement post-rupture. Expo (React Native) +
TypeScript strict, Expo Router, Supabase (anonyme, UE), Edge Functions IA
(claude-sonnet-4-6), RevenueCat (hard paywall), Reanimated 3, PostHog.

## Règles produit non négociables

- **Français, tutoiement, ton « grande sœur lucide »** : directe, chaleureuse,
  jamais clinique, jamais coach agressive. Le mot **programme** remplace
  toujours **thérapie**.
- **Règles d'écriture des textes de l'app** : jamais de tiret cadratin (—),
  jamais de jargon (pattern, milestone, insight → façon d'aimer, palier,
  conseil), jamais de fragments de 1 à 3 mots suivis d'un point, jamais de
  phrase longue qui n'apporte rien. Des phrases complètes, courtes, avec une
  virgule et un point. Dire uniquement ce qui compte.
- **Mode sombre unique** (usage nocturne, au lit). Tous les tokens viennent de
  `src/theme/theme.ts` — aucune couleur/espacement/durée codé en dur ailleurs.
- **Un seul choix ou une seule action par écran** pendant l'onboarding.
- **Anonyme jusqu'au paiement** : session Supabase anonyme, aucun compte ni
  demande de notification avant les moments spécifiés (compte après achat,
  notifs après le rapport).
- **Aucune clé IA côté client** — tout appel IA passe par
  `supabase/functions/` (secrets Supabase). Mode mock par défaut
  (`EXPO_PUBLIC_MOCK_MODE=true`) : tout le funnel tourne sans clé.
- **Analytics sans PII** : événements et métadonnées uniquement, jamais de
  réponses/messages/vocaux (`src/lib/analytics.ts`).
- **Sécurité détresse** : tout input libre passe par `src/lib/distress.ts` ;
  tout flag (local, `flag_detresse`, `SAFETY_EXIT`) interrompt la
  fonctionnalité et affiche `/ressources` (3114). Log sans contenu.
- **Toute animation a une fonction** ; toutes se coupent si « Réduire les
  animations » iOS est actif (`useReduceMotion`). Cible 60 fps iPhone 12.
- **Prix jamais codés en dur** — toujours via `src/lib/purchases.ts`
  (RevenueCat ou mock).

## Architecture

- `app/` : routes Expo Router (funnel : hook → quiz/[step] → analysis → teaser
  → paywall → post-purchase → report ; tabs : home/journey/vault ; modales :
  panic/checkin/simulator/capsule/ressources).
- `src/config/quiz.ts` : les 47 questions + interludes — **le moteur de quiz ne
  contient aucun contenu**, tout est piloté par cette config typée.
- `src/state/` : stores Zustand persistés (reprise exacte du quiz obligatoire).
- `src/lib/` : env, storage, haptics, analytics, supabase, ai, purchases,
  distress.
- `.claude/skills/` : les 5 skills de référence (react-native-patterns,
  react-native-architecture, app-builder, design, app-store-optimization) —
  les consulter avant toute décision d'architecture, d'UI ou de store.

## Commandes

```bash
npm install          # première fois
npm run ios          # démarrage simulateur iOS
npm run typecheck    # tsc --noEmit (à faire avant chaque commit)
npm run lint
```

## Git

- Branche de travail : `claude/gallant-archimedes-nahbi6` → PR vers `main`.
- Commits en français, messages descriptifs par lot fonctionnel.

## Playbook — règles issues des skills de référence

Distillé de la lecture intégrale des 5 skills de `.claude/skills/`
(react-native-patterns · react-native-architecture · app-builder · design ·
app-store-optimization). Consulter les skills pour le détail.

### Architecture React Native / Expo

- Fichiers de route **minces** : `app/` ne fait que lire/valider les params et
  déléguer ; la logique vit dans `src/` (composants, stores, libs).
- **Valider toute entrée externe** (params de route/deep links, réponses des
  Edge Functions, payloads de notification) avec un schéma (Zod) avant usage —
  les deep links livrent des chaînes non fiables ; en cas d'échec :
  `router.replace` vers un écran sûr.
- Séparation des états : état serveur → cache serveur (TanStack Query si
  adopté) ; état UI → Zustand ; navigation → params Expo Router ; secrets →
  `expo-secure-store` (Keychain), **jamais** AsyncStorage pour un token ;
  persistance non sensible → AsyncStorage. Commencer par `useState` local.
- Ne **jamais dupliquer** les données serveur dans un store client (deux
  sources de vérité = données périmées).
- APIs natives (notifications, photos, micro) : encapsulées dans des hooks
  `use*` avec statut discriminé `loading | denied | granted` + cleanup
  (flag `active`) — message actionnable en français si permission refusée.
- Hard paywall : ne jamais faire confiance au client pour l'autorisation —
  l'entitlement doit être vérifiable côté serveur (webhooks RevenueCat).
- Guard de navigation : ne jamais rediriger pendant `isLoading` (splash
  d'abord), sinon flash d'écran au démarrage.
- Offline-first : persister le cache (le rapport d'autopsie doit survivre à un
  kill d'app en pleine nuit) ; mutations optimistes avec snapshot + rollback.
- Error boundaries autour du funnel, surtout l'écran d'analyse (appel IA) —
  un crash au milieu du funnel = conversion perdue.
- Vérifier la compatibilité **New Architecture** de chaque dépendance native
  avant release (obligatoire dès Expo SDK 55+).

### Performance & animations (cible 60 fps iPhone 12)

- Toute animation via **Reanimated sur le thread UI** ; aucun travail lourd
  sur le thread JS pendant une animation.
- Boutons : `withSpring`/`withTiming` scale ~0.95–0.97 au pressIn + haptique
  légère — pattern de référence déjà dans `PillOption`/`PrimaryButton`.
- **Jamais** d'objets de style inline sur les chemins chauds (47 écrans de
  quiz) — `StyleSheet.create` au niveau module.
- Listes longues : FlatList/FlashList (`estimatedItemSize` ~100,
  `maxToRenderPerBatch` 10, `windowSize` 5), `renderItem` mémoïsé,
  `keyExtractor` stable — jamais `items.map()` dans un ScrollView.
- Mémoïser les composants d'étape du quiz (`memo` + `useCallback`).
- Haptiques : 5 niveaux (light/medium/heavy/success/error) — déjà dans
  `src/lib/haptics.ts` ; garde `Platform.OS !== 'web'` si Expo Web sert au dev.
- Tester le funnel sur un **vrai iPhone 12**, pas seulement le simulateur.

### UI / UX & design

- Pas d'emoji comme icônes UI → vectoriel (SVG/icônes fines).
- Contraste texte ≥ 4,5:1 ; transitions 150–300 ms ; états de feedback sur
  tout élément tappable ; focus/accessibilité (`accessibilityRole`, `Label`,
  `alert` sur les erreurs) ; safe areas + Dynamic Type partout.
- Max 2 polices (Fraunces + Inter — verrouillé), corps ≥ 15, titres ≥ 26.
- États réseau **explicites** : loading / erreur / vide — jamais un spinner
  seul sans fallback (critique la nuit sur réseau mobile).
- Cartes partageables (1080×1920 = format story Instagram) : contenu critique
  dans les 70–80 % centraux, 1 seul CTA, filigrane discret.

### Process de build

- Avant tout chantier : 3 questions de clarification si la demande est
  ambiguë ; ne jamais inventer une info produit manquante (copy française,
  règle de branchement du quiz) — demander.
- Ordre des dépendances : schéma/Edge Functions d'abord, puis écrans ; le
  front peut démarrer dès que les contrats de types sont posés.
- Chaque feature : ventiler en Database (tables/RLS) / Backend (Edge
  Functions) / Frontend (écrans) / Config (.env, clés) avant de coder.
- `eas update` (OTA) pour itérer vite sur les textes du funnel sans review
  App Store (dans les limites Apple). Profils EAS : development (simulateur) /
  preview (interne) / production (`autoIncrement`).
- Erreurs : tenter le fix auto → rapporter → alternative → rollback.

### App Store / ASO (préparer dès maintenant)

- Limites Apple : **titre 30** car. · **sous-titre 30** · **texte promo 170**
  (modifiable sans update !) · **description 4 000** · **champ mots-clés 100**
  (virgules sans espaces, pas de pluriels ni doublons) · What's New 4 000.
- Mots-clés en tête de titre/description ; écrire pour les humaines d'abord ;
  bénéfices avant features ; utiliser chaque caractère.
- Icône lisible à 60×60 px — l'élément visuel n°1 à A/B tester.
- Screenshots : les 2-3 premiers décident (personne ne scrolle) ; légendes qui
  racontent la valeur (« Comprends pourquoi c'est vraiment fini »).
- Demander la note **après une expérience positive** (ex. milestone de streak,
  jamais après un panic ou un check-in difficile).
- Répondre aux avis sous 24-48 h ; catégorie Lifestyle ; notes de review
  App Store documentant les garde-fous (simulateur, hard paywall, données).
- Premières 2 semaines post-lancement : métriques quotidiennes, updates
  fréquentes (signal de développement actif).

### Checklist avant chaque livraison

- [ ] `npm run typecheck` sans erreur (TS strict).
- [ ] Parcours complet hook → rapport en mock, y compris réseau coupé au
      milieu du quiz (reprise exacte).
- [ ] Aucune demande compte/notif avant les moments spécifiés.
- [ ] Tous les états réseau rendus (loading/erreur/vide), en français tutoyé.
- [ ] Animations 60 fps + « Réduire les animations » respecté.
- [ ] Aucune PII dans les événements analytics ; aucun secret dans le bundle.
- [ ] Textes relus : français sans faute, ton grande sœur, « programme »
      jamais « thérapie ».
