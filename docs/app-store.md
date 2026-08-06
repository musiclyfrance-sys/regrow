# Regrow — Kit App Store (prêt à coller dans App Store Connect)

Chaque texte respecte les limites Apple. Les compteurs sont indiqués.
Catégorie : **Lifestyle**. Langue : **Français (France)**.

---

## Titre — 28/30 caractères

```
Regrow : Détox après rupture
```

## Sous-titre — 25/30 caractères

```
Oublie ton ex en 90 jours
```

## Texte promotionnel — ~150/170 caractères
*(modifiable À TOUT MOMENT sans nouvelle version — l'endroit où tester des accroches)*

```
Comprends pourquoi c'est vraiment fini, puis tiens 90 jours sans lui écrire.
Autopsie de ta relation, rituels de 2 minutes, coffre à souvenirs.
```

## Champ mots-clés — ~95/100 caractères
*(virgules sans espaces, pas de pluriels, pas de doublons avec le titre)*

```
ex,chagrin,detox,no contact,coeur brise,separation,guerison,oublier,peine,amour,reconstruction
```

## Description — ~1 900/4 000 caractères

```
Tu veux comprendre pourquoi c'est vraiment fini ? Commence par l'autopsie.

47 questions, 8 minutes, aucune création de compte. À la fin : ton rapport
personnalisé — pourquoi cette histoire s'est terminée, son style d'attachement,
ton pattern à toi, la dynamique qui vous a tués, et les red flags que tu avais
vus sans vouloir les voir.

Puis le vrai travail commence : 90 jours pour le sortir de ta tête.
Pas de blabla interminable. Des rituels courts qui font le travail :

• LE CHECK-IN DU SOIR — 2 minutes à l'heure où tu flanches d'habitude.
  Ton humeur, une question honnête, et ton insight du jour, différent
  chaque soir.

• LA STREAK NO-CONTACT — chaque jour sans lui écrire se voit, se compte
  et se célèbre. J3, J7, J30… tes paliers deviennent des victoires.

• LE CRASH TEST — l'envie de lui écrire te reprend ? Envoie ton message
  ici d'abord. On te montre comment la conversation finirait vraiment,
  d'après ce que tu nous as dit de lui. Tu gardes ta streak, tu perds
  l'illusion.

• LE COFFRE-FORT — vos photos, sous clé jusqu'à J+90. Puis tu choisis :
  récupérer, ou brûler. Pour de vrai.

• LA CAPSULE — 60 secondes de ta voix, scellées, rendues 30 jours plus
  tard. La preuve du chemin parcouru.

• LE BOUTON D'URGENCE — pour les soirs où ça déborde : respiration guidée,
  crash test, ou juste souffler.

Regrow est anonyme jusqu'au paiement : pas de compte, pas d'email, rien.
Tes données restent chiffrées en Europe et se suppriment pour de bon si
tu le demandes.

Regrow est un programme de soutien, pas un suivi médical ou psychologique.
Si tu traverses une détresse grave, le 3114 est là, gratuit, 24h/24.
```

## Nouveautés (What's New) — v1.0

```
Première version de Regrow : l'autopsie de ta rupture en 47 questions,
ton rapport personnalisé, et le programme de 90 jours pour tourner la page.
```

---

## Screenshots — ordre et légendes
*(les 2-3 premiers décident : personne ne scrolle)*

1. **Écran hook** — légende : « Comprends pourquoi c'est vraiment fini »
2. **Rapport (verdict)** — « Ton autopsie personnalisée en 8 minutes »
3. **Accueil (streak + jauge)** — « Chaque jour sans lui écrire se voit »
4. **Crash test** — « Teste ton message ici, pas là-bas »
5. **Coffre-fort** — « Tes souvenirs sous clé jusqu'à J+90 »
6. **Carte milestone** — « Tes victoires se partagent »

Format : 6,7" (1290×2796) obligatoire. Fond nuit de l'app, une phrase par
écran, texte dans les 70-80 % centraux.

---

## Notes pour la review Apple
*(à coller dans « App Review Information » — anticipe leurs questions)*

```
Regrow is a French-language breakup recovery self-help program.

1. SAFETY: All free-text inputs are screened for distress signals (suicidal
   ideation, self-harm patterns in French). Any trigger immediately
   interrupts the feature and shows France's national prevention hotline
   (3114) with a direct call button. The AI simulator ("crash test") has a
   hard-coded exit: if distress is detected, it leaves the roleplay and
   shows the same resources screen.

2. AI FEATURES: All AI calls run server-side (Supabase Edge Functions).
   The "crash test" is clearly labeled as a prediction/simulation, is
   limited to 3 sessions per rolling week and 12 exchanges per session,
   never encourages re-contact, and always ends with a mandatory debrief.

3. PAYWALL: Hard paywall after a free 47-question assessment. The full
   verdict is given for free before any payment ask. Products: 90-day
   one-time purchase, weekly auto-renewing subscription, and an
   introductory offer (first week) configured in App Store Connect.
   Restore purchases is available on the paywall and in Settings.

4. PRIVACY: No account is required before purchase (anonymous session).
   Sign in with Apple is offered after purchase. All data is stored
   encrypted in the EU (Supabase). Full account + data deletion is
   available in Settings and cascades server-side.

5. NOT MEDICAL: The app explicitly states it is a support program, not
   medical or psychological care ("programme", never "thérapie"), in-app
   and in Settings, alongside the 3114 hotline number.

DEMO: Set EXPO_PUBLIC_MOCK_MODE=true to run the full funnel with simulated
purchases and AI (no real charge). Sandbox test account available on request.
```

---

## Rappels stratégie (issus du playbook ASO)

- Le **texte promo** (170 car.) se change sans review : tester une accroche
  différente toutes les 2 semaines.
- **L'icône** est l'élément n°1 à tester (lisible à 60×60 px) — prévoir 2-3
  variantes pour les A/B tests App Store Connect.
- Demander la **note** après un milestone de streak (jamais après un panic
  ou un check-in difficile).
- Répondre aux avis sous 24-48 h. Métriques quotidiennes les 2 premières
  semaines, updates fréquentes (signal de développement actif).
- **Licences polices** : vérifier Doyle et General Sans (usage commercial)
  avant soumission. Gooper (trial) ne doit PAS partir en production sans
  licence.
```
