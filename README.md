# Regrow

Application iOS (Expo / React Native) d'accompagnement post-rupture. Français,
tutoiement, mode sombre uniquement. MVP en cours de construction.

> **Priorité du projet : la qualité d'exécution du funnel d'onboarding**
> (hook → quiz d'autopsie → analyse → teaser → paywall), avant toute autre
> fonctionnalité.

## Stack

- **Expo (React Native) + TypeScript strict**, cible iOS
- **Expo Router** (routes typées) pour la navigation
- **Supabase** — auth anonyme, Postgres, storage chiffré (région UE)
- **Edge Functions Supabase** pour tous les appels IA (aucune clé côté client)
- **API Anthropic** (`claude-sonnet-4-6`) — autopsie, simulateur, insights
- **RevenueCat** (`react-native-purchases`) — abonnements + offre d'intro
- **Reanimated 3** + **expo-haptics** — animations et retours haptiques
- **expo-av** — capsules vocales · **expo-notifications** — rappels
- **PostHog** — analytics produit (aucune donnée personnelle)
- **Zustand** — état persisté (reprise exacte du quiz)

## Mode mock (développer sans aucune clé)

`EXPO_PUBLIC_MOCK_MODE=true` (défaut) fait tourner **tout le funnel sans
backend** : IA (autopsie mockée), achats RevenueCat (sandbox simulé, prix de la
spec), analytics (console). Passe à `false` une fois les services configurés.

```bash
cp .env.example .env      # laisse MOCK_MODE=true pour commencer
npm install
npm run ios
```

## Structure

```
app/                         # routes Expo Router
  _layout.tsx                # thème sombre, polices, session anon, analytics
  index.tsx                  # routage selon l'avancement (reprise incluse)
  onboarding/
    hook.tsx                 # 6.1 — la première seconde
    quiz/[step].tsx          # 6.2 — moteur piloté par config (47 étapes)
    resume.tsx               # reprise exacte
    analysis.tsx             # 6.4 — labor illusion (~9 s)
    teaser.tsx               # 6.5 — révélation partielle (vrai texte flouté)
  paywall.tsx                # 6.6 — hard paywall + offre d'intro
  post-purchase/account.tsx  # 6.7 — Sign in with Apple (jamais bloquant)
  report.tsx                 # 6.7 — rapport éditorial + plan 90 jours
  (tabs)/home|journey|vault  # 6.8 — home réel, reste en placeholder honnête
  panic.tsx                  # 6.10 — panic + respiration guidée
  ressources.tsx             # 8 — écran détresse (3114)
  checkin|simulator|capsule|settings.tsx
src/
  theme/                     # design system (tokens uniques)
  config/quiz.ts             # 47 questions + interludes (micro-verdicts, proof)
  state/                     # stores Zustand persistés (quiz, app)
  lib/                       # env, storage, haptics, analytics, supabase, ai,
                             # purchases, distress (classifieur de sécurité)
  components/                # UI partagée (pilules, progression, jauge…)
supabase/functions/          # Edge Functions IA (prompts système exacts, §7)
  autopsy | simulator | insight
```

## Sécurité & conformité

- **Aucune clé IA côté client** — tout passe par les Edge Functions.
- **Classifieur de détresse** (`src/lib/distress.ts`) + flags IA → écran
  ressources (3114). L'événement est loggé **sans** le contenu du message.
- **Anonyme jusqu'au paiement** : session Supabase anonyme, aucun compte ni
  notification demandés avant les moments spécifiés.
- **Analytics sans PII** : jamais de réponses, messages ou vocaux.
- Le mot **programme** remplace toujours **thérapie**.

## État de construction (ordre de build de la spec)

| # | Lot | État |
|---|-----|------|
| 1 | Design system, thème, navigation, squelette écrans | ✅ |
| 2 | Funnel hook → quiz → analyse → teaser (mock + persistance) | ✅ |
| 3 | Paywall RevenueCat sandbox (hebdo, programme, intro) | ✅ (mock) |
| 4 | Edge Function autopsie + rapport + post-achat | ✅ scaffold / mock |
| 5–10 | Home/rétention, panic/simulateur, coffre, notifs, cartes, QA | 🔜 |

Les écrans des lots 5→10 existent en **placeholder honnête** (aucun écran mort)
et seront branchés ensuite. `panic`, `ressources` et `settings` (3114) sont déjà
fonctionnels pour la sécurité.

## Notes

- Les dépendances ne sont pas committées ; lance `npm install` avant le premier
  démarrage. Le typecheck (`npm run typecheck`) nécessite les modules installés.
- Secrets (`.env`, clés Anthropic) : jamais committés. Les prompts système IA
  vivent exclusivement dans `supabase/functions/`.
