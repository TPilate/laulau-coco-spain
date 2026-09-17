# App de voyage « Laulau & Coco » — Séville

- Statut : validé, prêt pour le plan d'implémentation
- Date : 2026-09-17

## 1. Contexte et objectif

Application web installable (PWA) offerte en cadeau pour un voyage de 5 jours à Séville
(Espagne). Elle doit fonctionner **entièrement hors ligne** après une première ouverture
avec internet, avant le départ. Cible principale : smartphone (iPhone ou Android), en
mode portrait.

## 2. Contraintes

- Aucune dépendance réseau à l'usage : tout le contenu, le code et la carte sont mis en
  cache à la première visite.
- Contenu statique, écrit à la main dans un seul fichier de données (`content.ts`).
- Pas de backend, pas de compte, pas d'API externe.
- HTTPS obligatoire (nécessaire pour le service worker et la géolocalisation).
- Même fuseau horaire que la France (Europe/Madrid) : les dates sont stockées en ISO
  avec leur décalage (ex. `2026-10-03T19:30:00+02:00`).
- Application-cadeau pour un usage privé, pas un produit à maintenir : on optimise pour
  la simplicité et la fiabilité hors ligne, pas pour l'extensibilité future.

## 3. Stack technique

- **Nuxt 3** en mode SPA (`ssr: false`), build statique via `nuxt generate`.
- **TypeScript**.
- **@vite-pwa/nuxt** pour le manifest et le service worker (Workbox).
- **maplibre-gl** + **pmtiles** pour la carte hors ligne ; style généré avec
  **@protomaps/basemaps**.
- Stockage local : `localStorage` pour les petites préférences (dernière position
  manuelle, mode de position, messages déjà lus), via des composables Vue.
- Pas de gestionnaire d'état global (pas de Pinia) : l'app est trop petite pour le
  justifier, des composables avec des refs suffisent.
- Package manager : npm.
- Déploiement : **Vercel**, build statique (`nuxt generate` → `.output/public`).

## 4. Structure du projet

```
/
├── nuxt.config.ts
├── app.vue
├── data/
│   └── content.ts          # unique fichier de contenu, voir §6
├── composables/
│   ├── usePersistedRef.ts  # ref synchronisée avec localStorage
│   ├── usePosition.ts      # position GPS / manuelle
│   ├── useMessages.ts      # verrouillage / lecture des messages
│   └── useMapCache.ts      # état du téléchargement du .pmtiles
├── components/
│   ├── BottomNav.vue
│   ├── MapaSeville.client.vue
│   ├── OfflineBanner.vue
│   └── ...
├── layouts/
│   └── default.vue         # layout avec BottomNav + OfflineBanner
├── pages/
│   ├── index.vue           # redirige vers /carte
│   ├── carte.vue
│   ├── a-venir.vue
│   ├── guide.vue
│   ├── messages.vue
│   └── phrases.vue
├── public/
│   ├── seville.pmtiles
│   ├── style/
│   │   ├── style.json      # style Protomaps généré, pointant en local
│   │   ├── sprites/
│   │   └── fonts/          # glyphes PBF
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── apple-touch-icon.png
└── scripts/
    └── build-map-data.md   # doc + commandes utilisées pour générer les assets carte
```

## 5. Navigation et onglets

5 pages, barre d'onglets fixe en bas (`BottomNav.vue`), route par défaut `/carte`.
Chaque page est un fichier Nuxt sous `pages/`, ce qui produit une page HTML statique
prérendue par `nuxt generate` (compatible avec le précaching du service worker et la
navigation hors ligne dans l'app installée).

### 5.1 Carte (`/carte`)

- Carte de Séville hors ligne (fichier `.pmtiles`) affichée avec MapLibre GL.
- Marqueurs pour tous les lieux (`Lieu`) et événements (`Evenement`, via leur `lieuId`) ;
  au toucher, une fiche (nom + petit mot / description).
- **Position de l'utilisatrice**, gérée par `usePosition()` :
  - **GPS** via `navigator.geolocation.watchPosition`
    (`enableHighAccuracy: true, timeout: 60000`). Le premier point peut prendre 30 s à
    1 min sans réseau ; l'UI doit indiquer un état « recherche en cours » pendant ce
    délai plutôt que de paraître figée.
  - **Manuel** : toucher la carte pour placer sa position, ou bouton « Je suis à… » qui
    liste les lieux du guide. Passer en manuel arrête le `watchPosition` actif.
  - La source actuelle (GPS / manuel) et un bouton « recentrer » sont affichés en
    permanence.
  - Le mode et la dernière position manuelle sont persistés via `usePersistedRef` ; au
    prochain lancement, l'app rouvre dans le dernier mode choisi (mais relance
    `watchPosition` si le mode est GPS, sans réutiliser une position GPS périmée comme
    point de départ affiché tant qu'un nouveau point n'est pas reçu).
- **Indicateur « Carte prête ✓ »** : reflète `useMapCache()`, vrai quand le `.pmtiles`
  complet est présent dans le cache `map` (voir §7.3).

### 5.2 À venir (`/a-venir`)

- Liste des événements (`content.ts.evenements`), triés par `debut`.
- Statut calculé en comparant `Date.now()` à `debut`/`fin` :
  - `now < debut` : « Dans Xh » / « Dans Xj » (formatage simple, pas de librairie de
    date supplémentaire — `Intl.RelativeTimeFormat` suffit).
  - `debut <= now <= (fin ?? debut)` : « Maintenant ».
  - `now > (fin ?? debut)` : « Passé ».
- Recalcul du statut à l'affichage et toutes les 60 s (`setInterval`) tant que la page
  est active.
- Bouton « Voir sur la carte » : navigue vers `/carte` avec le lieu correspondant centré
  et sa fiche ouverte (via une query param ou un state partagé simple, ex. un composable
  `useMapFocus()`).

### 5.3 Guide (`/guide`)

- Lieux (`content.ts.lieux`) groupés par `categorie`.
- Pour chaque lieu : nom, catégorie, `mot` (petit mot personnel) ou description, bouton
  « Voir sur la carte » (même mécanisme que §5.2).

### 5.4 Messages (`/messages`)

- Messages (`content.ts.messages`), triés par `unlockAt`.
- Avant `unlockAt` : carte verrouillée avec compte à rebours (jours/heures/minutes,
  recalculé chaque minute).
- Après `unlockAt` : titre + texte affichés ; le message est marqué comme lu dans
  `localStorage` via `useMessages()` dès qu'il est ouvert/affiché.
- Le verrouillage est uniquement côté client (comparaison avec l'heure du téléphone) —
  suffisant pour une surprise, pas une garantie de sécurité.

### 5.5 Phrases (`/phrases`)

- Phrases (`content.ts.phrases`) groupées par `theme`.
- Pour chaque phrase : français, espagnol, prononciation approximative. Pas
  d'interaction au-delà de l'affichage (pas de recherche, pas d'audio — hors scope).

## 6. Modèle de données (`data/content.ts`)

```ts
export type Categorie = 'a-voir' | 'resto' | 'cafe' | 'plage' | 'autre'

export interface Lieu {
  id: string
  nom: string
  categorie: Categorie
  lat: number
  lng: number
  mot?: string
}

export interface Evenement {
  id: string
  debut: string   // ISO avec décalage, ex. '2026-10-03T19:30:00+02:00'
  fin?: string
  lieuId: string
  titre: string
  details?: string
}

export interface Message {
  id: string
  unlockAt: string  // ISO avec décalage
  titre: string
  texte: string
}

export interface Phrase {
  theme: string
  fr: string
  es: string
  prononciation: string
}

export const lieux: Lieu[] = [ /* ~6-8 exemples réalistes à Séville */ ]
export const evenements: Evenement[] = [ /* ~4-5 exemples répartis sur 5 jours */ ]
export const messages: Message[] = [ /* ~3 exemples, unlockAt répartis sur le séjour */ ]
export const phrases: Phrase[] = [ /* ~15-20 exemples, 4 thèmes : salutations, resto, transport, urgences */ ]
```

Ce fichier est rempli avec des exemples réalistes et vérifiables (vrais lieux de
Séville : ex. Plaza de España, Mercado de Triana, María Luisa, Barrio del
Carmen) pour que la structure et le rendu soient testables immédiatement. L'utilisateur
remplace ensuite le contenu par les vraies dates, vrais lieux, vrais événements et vrais
messages — **hors scope de l'implémentation**, listé en §10.

## 7. Carte hors ligne

### 7.1 Génération des données (réalisée pendant l'implémentation, pas laissée en TODO)

1. Installer l'outil `pmtiles` (CLI).
2. Récupérer l'URL d'un build Protomaps récent depuis `maps.protomaps.com/builds`.
3. Extraire une bbox couvrant le centre historique, Triana et le parc de María Luisa,
  jusqu'au zoom 15 :
   ```bash
   pmtiles extract https://build.protomaps.com/<AAAAMMJJ>.pmtiles public/seville.pmtiles \
     --bbox=-6.05,37.30,-5.85,37.45 --maxzoom=15
   ```
4. Générer le style avec `@protomaps/basemaps`, en le faisant pointer vers les sources
   locales (`pmtiles://` et les glyphes/sprites servis depuis `public/style/`).
5. Copier les glyphes (fonts PBF) et sprites nécessaires dans `public/style/` — aucune
   ressource de style ne doit pointer vers un domaine externe.
6. Ne pas télécharger en masse les tuiles d'openstreetmap.org (politique d'utilisation
   qui l'interdit) — seul le build Protomaps est utilisé comme source.

### 7.2 Intégration MapLibre

```ts
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)
// source : url: `pmtiles://${location.origin}/seville.pmtiles`
```

Le composant carte (`MapaSeville.client.vue`) est client-only : le protocole `pmtiles`
et l'instanciation de `maplibregl.Map` ne doivent jamais s'exécuter côté génération
statique.

### 7.3 Mise en cache du `.pmtiles`

PMTiles lit le fichier par *range requests* ; une réponse `206` ne se met pas en cache
Workbox telle quelle. Double mécanisme :

1. **Règle Workbox** dans la config `@vite-pwa/nuxt` :
   ```ts
   runtimeCaching: [{
     urlPattern: /\/seville\.pmtiles$/,
     handler: 'CacheFirst',
     options: {
       cacheName: 'map',
       rangeRequests: true,
       cacheableResponse: { statuses: [200] },
     },
   }]
   ```
2. **Téléchargement complet explicite** au premier lancement, dans le même cache
   (`useMapCache()` composable) :
   ```ts
   const cache = await caches.open('map')
   if (!(await cache.match('/seville.pmtiles'))) {
     await cache.add('/seville.pmtiles')
   }
   // puis exposer un état `pret: true` → affiche « Carte prête ✓ »
   ```

## 8. PWA et fiabilité hors ligne

- Précacher toute l'app (HTML, JS, CSS, polices, images, sprites, `style.json`) via les
  `globPatterns` de `@vite-pwa/nuxt` (le `.pmtiles` reste géré séparément par la règle de
  runtime caching + le téléchargement explicite du §7.3, car sa taille et son mode
  d'accès par range requests ne correspondent pas au précaching standard).
- Manifest :
  - `name: 'Laulau & Coco'`
  - `short_name: 'L&C'`
  - Icônes générées (§9) : 192px, 512px, `apple-touch-icon` (180px).
  - `display: 'standalone'`
  - `theme_color` / `background_color` alignés sur la palette de l'icône (orange chaud +
    accent bleu azulejos).
- `navigator.storage.persist()` appelé au premier lancement pour limiter le risque
  d'éviction du cache par le système.
- `registerType: 'autoUpdate'` : les nouvelles versions sont récupérées quand le réseau
  revient ; sinon la dernière version en cache reste utilisée.
- `OfflineBanner.vue` : bandeau discret affiché quand `navigator.onLine` est faux, à
  titre informatif seulement (n'empêche aucune fonctionnalité).

## 9. Icônes

- SVG source unique, palette Séville (orange/rouge chaud type paella, accent bleu
  azulejos), motif simple (ex. monogramme ou fleur d'oranger stylisée).
- Script Node (`scripts/generate-icons.mjs`, utilisant `sharp`) qui rasterise le SVG en
  `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180px, fond
  opaque — iOS n'applique pas la transparence).
- Fichiers PNG committés dans le repo (pas régénérés à chaque build) ; le SVG source est
  conservé pour permettre un remplacement facile plus tard.

## 10. Déploiement (Vercel)

1. `nuxt generate` → `.output/public`.
2. Déploiement Vercel en mode statique (détection automatique du dossier de sortie, ou
   configuration explicite si nécessaire).
3. Vérifier après déploiement que `seville.pmtiles` est servi avec le support des range
   requests (`Accept-Ranges: bytes`, réponses `206` correctes) — condition nécessaire au
   bon fonctionnement de PMTiles. Si Vercel ne le fait pas nativement pour les fichiers
   statiques, ajouter la configuration nécessaire (`vercel.json`) pour le forcer.

## 11. Vérification / QA

- Vérifications automatiques : `nuxt typecheck`, lint.
- Pas de suite e2e/Playwright (hors scope pour une app-cadeau à usage unique) : la
  fiabilité hors ligne est validée manuellement via la checklist ci-dessous, à exécuter
  avant le départ.

### Checklist avant le départ

1. Ouvrir le lien en wifi et attendre « Carte prête ✓ ».
2. Ajouter l'app à l'écran d'accueil ; sur iPhone, toujours l'ouvrir depuis l'icône
   plutôt que depuis Safari.
3. Accepter la géolocalisation.
4. **Tester en mode avion** : carte, position, guide, événements, messages et phrases
   doivent tous s'afficher.

## 12. Critères d'acceptation

- En mode avion, après une première visite en ligne, tous les onglets fonctionnent.
- La carte s'affiche avec les noms de rues, jusqu'au zoom 15, sur la zone couverte par
  l'extraction (§7.1).
- La position GPS apparaît en extérieur sans réseau ; la position manuelle fonctionne
  partout.
- Les statuts des événements et le verrouillage des messages suivent l'heure du
  téléphone.
- L'app s'installe et se lance en plein écran sur iPhone et Android.

## 13. Hors scope de cette implémentation (à compléter par l'utilisateur)

- Dates exactes du voyage.
- Liste définitive des lieux, avec les petits mots personnels.
- Événements définitifs (heure et lieu).
- Textes définitifs des messages surprise et leurs dates de déverrouillage.

Ces éléments sont remplacés dans `data/content.ts`, qui reste volontairement le seul
fichier à éditer pour personnaliser le contenu.
