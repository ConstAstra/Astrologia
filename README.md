# Astrologium

Application d'astrologie occidentale : thème natal, synastrie, thème composite
et cartographie astrologique — calculée avec des éphémérides précises,
expliquée en français, et commercialisable (abonnement Stripe côté web, achats
intégrés Apple côté iOS, système de crédits à l'unité).

## Fonctionnalités

- **Thème astral** : positions planétaires géocentriques apparentes
  (Astronomy Engine), 4 systèmes de maisons (Placidus, signes entiers,
  maisons égales, Porphyre), aspects majeurs/mineurs, roue SVG, interprétations
  en français. Gratuit et illimité.
- **Synastrie** : aspects croisés entre deux thèmes, superposition des
  maisons, cadrage selon la nature de la relation (couple, amitié, famille,
  professionnel).
- **Thème composite** : méthode des points médians (Robert Hand), même
  cadrage relationnel.
- **Cartographie astrologique** : lignes MC/IC/AC/DC de chaque planète
  projetées sur une carte du monde interactive (d3-geo + topojson).
- **Comptes & profils** : avatars pixel-art déterministes façon rétro, jusqu'à
  6 profils gratuits.
- **Monétisation** : abonnement Premium (Stripe, mensuel/annuel, essai
  gratuit) + crédits à l'unité pour débloquer une synastrie/composite/carto
  ponctuellement. Support Apple In-App Purchase pour une déclinaison iOS
  (voir plus bas).
- **Méthodologie transparente** : page `/methode` qui documente chaque choix
  (zodiaque, éphémérides, orbes, limites assumées).
- **Horoscope quotidien par e-mail** : rappel court chaque jour (phase
  lunaire + transit du jour le plus signifiant, relié au Big 3 et à la
  dominante élémentaire du thème natal), plus une section par synastrie
  déverrouillée (transits du jour sur le thème composite du couple).
  Opt-in par défaut, désabonnement en un clic. Voir « Horoscope quotidien »
  ci-dessous pour la configuration du scheduler.
- **Transit du jour par notification** : variante Web Push (opt-in explicite,
  indépendante de l'e-mail) du même rappel — une notification système sur
  l'appareil de l'utilisateur, sans dépendance à un service tiers (Firebase,
  APNs). Voir « Transit du jour par notification » ci-dessous.
- **Carte de partage** : image PNG générée à la volée (`/api/share/theme-natal/[id]`)
  pour partager son thème (avatar + Big 3) sur les réseaux.

## Stack technique

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 7
(PostgreSQL, en local comme en production) · astronomy-engine · Stripe ·
`@apple/app-store-server-library` · Capacitor (coque iOS) · d3-geo/topojson.

## Démarrage

Nécessite un serveur PostgreSQL local (même en développement — voir « Base
de données » ci-dessous pour pourquoi). Le plus simple :

```bash
# Via Docker (recommandé) :
docker run -d --name astrologium-db -e POSTGRES_PASSWORD=astrologium_dev -p 5432:5432 postgres:16

# Ou en installation native (Debian/Ubuntu) :
sudo apt-get install postgresql && sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'astrologium_dev';"
```

Puis, dans les deux cas :

```bash
createdb -h localhost -U postgres astrologium       # (mot de passe : astrologium_dev)
createdb -h localhost -U postgres astrologium_test  # base dédiée aux tests

npm install
cp .env.example .env      # DATABASE_URL par défaut pointe déjà vers astrologium en local
npx prisma migrate dev    # applique le schéma
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Le thème natal
fonctionne immédiatement ; Stripe et Apple demandent la config ci-dessous.

### Vérifier le moteur astrologique

```bash
npm run smoke:astro
```

Script de cohérence (équinoxes/solstices, points cardinaux des maisons,
repli Placidus en zone polaire, aspects, synastrie, composite,
cartographie) — utile après toute modification de `src/lib/astro/`.

## Configuration

Toutes les variables sont documentées dans `.env.example`. Résumé :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion base de données (SQLite par défaut) |
| `AUTH_SECRET` | Signature des sessions (JWT) — **obligatoire en production** |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (redirections Stripe) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Paiements web |
| `APPLE_*` | Achats intégrés iOS (voir section dédiée) |
| `CAPACITOR_SERVER_URL` | URL chargée par l'app iOS |
| `RESEND_API_KEY` / `EMAIL_FROM` | Envoi d'e-mails (mot de passe oublié, horoscope quotidien) — vide en dev, logge dans la console |
| `CRON_SECRET` | Autorise les appels à `/api/cron/daily-horoscope` et `/api/cron/daily-transit-push` (voir « Horoscope quotidien » et « Transit du jour par notification ») |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Notification push "transit du jour" (voir « Transit du jour par notification ») — vide en dev, logge dans la console |

### Stripe (web)

1. Créez une clé secrète sur le [tableau de bord Stripe](https://dashboard.stripe.com/apikeys).
2. En local, utilisez `stripe listen --forward-to localhost:3000/api/billing/webhook`
   pour obtenir un `STRIPE_WEBHOOK_SECRET` de test.
3. Les prix sont envoyés dynamiquement (`price_data`) — aucun produit à créer
   dans le tableau de bord. Ajustez les montants dans
   `src/lib/billing/plans.ts`.

### Apple (app iOS)

Le dossier `ios/` contient un projet Capacitor déjà généré, plus un plugin
StoreKit 2 natif (`ios/App/App/StoreKitPlugin.swift`) et l'intégration
serveur (`src/lib/billing/apple.ts`, routes `/api/apple/*`).

**Important** : ce code n'a pas pu être compilé ni testé dans l'environnement
de développement utilisé pour l'écrire (pas d'accès à macOS/Xcode). Avant de
publier, il faudra, depuis un Mac :

1. `npx cap sync ios` puis ouvrir `ios/App/App.xcworkspace` dans Xcode.
2. Ajouter `StoreKitPlugin.swift` à la cible « App » (clic droit sur le
   groupe App → Add Files), activer la capability *In-App Purchase*.
3. Créer les produits dans App Store Connect avec les identifiants définis
   dans `src/lib/billing/plans.ts` (`APPLE_PRODUCT_MAP`).
4. Télécharger les certificats racine Apple
   ([apple.com/certificateauthority](https://www.apple.com/certificateauthority/))
   dans le dossier pointé par `APPLE_ROOT_CERTS_DIR`.
5. Générer une clé App Store Server API (App Store Connect → Utilisateurs et
   accès → Intégrations) pour `APPLE_KEY_ID` / `APPLE_ISSUER_ID` / `APPLE_PRIVATE_KEY`.
6. Configurer l'URL de notifications serveur (`/api/apple/notifications`)
   dans App Store Connect, en sandbox puis en production.
7. Tester intégralement en sandbox avant toute soumission.

Le site web, lui, est testable et fonctionnel tel quel.

#### Widget iOS (écran d'accueil)

`ios/App/AstrologiumWidget/AstrologiumWidget.swift` est un fichier de
référence (WidgetKit + SwiftUI) — même mise en garde que ci-dessus, non
compilé/testé ici. Il consomme `/api/widget/theme-natal/[id]?token=...`
(endpoint JSON déjà fonctionnel et testable, contrairement au widget
lui-même) — l'URL complète, avec son jeton, est copiable depuis la page
"Thème natal" du site. Le fichier Swift documente en commentaire les
étapes manuelles Xcode nécessaires (créer le target Widget Extension,
partager l'URL via un App Group). `Profile.widgetToken` est un jeton
opaque dédié à cet usage : WidgetKit ne partage pas les cookies de session
du navigateur.

### Géocodage

Le lieu de naissance est géocodé via Nominatim (OpenStreetMap), sans clé
requise. Sa politique d'usage limite à 1 requête/seconde et interdit un usage
commercial intensif sans instance auto-hébergée — au-delà d'un certain
volume, prévoir un fournisseur payant (voir commentaire dans
`src/app/api/geocode/route.ts`).

### Horoscope quotidien

`/api/cron/daily-horoscope` (GET ou POST) parcourt les utilisateurs
opt-in (`dailyHoroscopeOptIn`), envoie à chacun un e-mail personnalisé
(phase lunaire, transit du jour, Big 3, dominante élémentaire) plus une
section par synastrie déverrouillée. Elle doit être déclenchée une fois par
jour par un scheduler externe — Next.js ne planifie rien tout seul.

Authentification : en-tête `Authorization: Bearer $CRON_SECRET`.

- **Vercel Cron** : ajoutez dans `vercel.json`
  ```json
  { "crons": [{ "path": "/api/cron/daily-horoscope", "schedule": "0 7 * * *" }] }
  ```
  Vercel ajoute automatiquement l'en-tête `Authorization` avec la valeur de
  `CRON_SECRET` définie dans les variables d'environnement du projet.
- **Cron OS / autre hébergeur** :
  ```bash
  curl -X POST https://votre-domaine.example/api/cron/daily-horoscope \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
- **En local** : `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-horoscope`.

### Transit du jour par notification

`/api/cron/daily-transit-push` (GET ou POST) parcourt les utilisateurs
opt-in (`dailyTransitPushOptIn`) ayant au moins un abonnement Web Push
enregistré, et envoie à chacun de leurs appareils une notification courte
(même contenu de fond que l'horoscope quotidien : phase lunaire, transit du
jour le plus signifiant). Préférence indépendante de l'e-mail — un
utilisateur peut activer l'une, l'autre, les deux ou aucune.

Contrairement à l'e-mail, ce n'est **pas** activé par défaut : l'opt-in
nécessite la permission navigateur de l'utilisateur (bouton "Transit du jour
par notification" dans `/dashboard/abonnement`), qui enregistre alors un
abonnement `PushSubscription` via l'API standard `PushManager` du navigateur
— aucun service tiers requis (pas de Firebase, pas d'APNs). Si un
abonnement est expiré côté navigateur (l'utilisateur a désinstallé/révoqué
la permission), l'envoi renvoie une 404/410 : la route le détecte et
supprime automatiquement la ligne correspondante plutôt que de retenter.

Prérequis : générez une paire de clés VAPID une seule fois par projet avec
`npx web-push generate-vapid-keys`, et renseignez
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` (voir
`.env.example`). Sans ces clés, l'envoi se contente de logguer dans la
console (comportement dev, comme `sendEmail()`).

Authentification et configuration du scheduler : identiques à
« Horoscope quotidien » ci-dessus (même `CRON_SECRET`), sur le chemin
`/api/cron/daily-transit-push`. Les deux routes sont indépendantes et
peuvent être planifiées séparément ou à la même heure.

**Limite connue (iOS)** : Safari sur iOS ne délivre les notifications push
que si le site a été ajouté à l'écran d'accueil (PWA installée) — un
`manifest.json` et un service worker (`public/sw.js`) sont déjà en place
pour ça, mais tant que l'app n'est pas encore publiée sur l'App Store, les
utilisateurs iOS devront passer par "Ajouter à l'écran d'accueil" depuis
Safari pour recevoir ces notifications. Sans ce prérequis Apple, la
fonctionnalité reste pleinement opérationnelle sur desktop et Android.

## Passer en production

- **Base de données** : déjà PostgreSQL en local comme en production (voir
  « Démarrage ») — dev/prod parity volontaire, SQLite ne survivrait pas à un
  déploiement serverless (filesystem éphémère). Pour la prod, provisionnez
  une base managée (Vercel Postgres, Neon, Supabase, Railway...) et pointez
  `DATABASE_URL` dessus, puis `npx prisma migrate deploy`.
- **Webhooks Stripe** : configurez l'URL de production dans le tableau de
  bord Stripe.
- **Mentions légales** : `/mentions-legales`, `/confidentialite`,
  `/conditions-generales` contiennent des `[À COMPLÉTER]` — à remplir (et
  idéalement faire relire par un professionnel du droit) avant mise en ligne
  commerciale.

## Structure du projet

```
src/lib/astro/            moteur astrologique (éphémérides, maisons, aspects,
                           synastrie, composite, cartographie)
src/lib/astro/interpretations/  contenu interprétatif en français
src/lib/billing/          Stripe, Apple, crédits/abonnement
src/lib/auth/             sessions JWT, mots de passe
src/components/chart/     roue astrologique SVG
src/components/map/       carte du monde (cartographie astrologique)
src/components/avatar/    avatars pixel-art déterministes
src/app/                  pages (App Router) et routes API
ios/                       coque Capacitor + plugin StoreKit (voir plus haut)
```
