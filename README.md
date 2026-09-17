# Laulau & Coco — guide de voyage à Valence

App PWA hors ligne pour notre séjour à Valence. Tout le contenu (lieux, événements,
messages, phrases) vit dans `data/content.ts`.

## Développement

```bash
npm install
npm run dev
```

## Personnaliser le contenu du voyage

Éditer `data/content.ts` :

- `lieux` : lieux du guide (nom, catégorie, coordonnées, petit mot).
- `evenements` : programme du séjour (dates ISO avec décalage, ex. `2026-10-03T19:30:00+02:00`).
- `messages` : messages surprise et leur date de déverrouillage (`unlockAt`).
- `phrases` : phrases utiles en espagnol, par thème.

Les dates, lieux, événements et messages actuels sont des exemples réalistes à
remplacer avant le départ.

## Build et déploiement (Vercel)

```bash
npm run generate
```

Produit un site statique dans `.output/public`. Pour déployer sur Vercel :

1. Installer la CLI Vercel : `npm install -g vercel`.
2. Depuis la racine du projet : `vercel login`, puis `vercel --prod`.
3. Une fois déployé, vérifier que `valencia.pmtiles` supporte les requêtes par plage :
   `curl -I -H "Range: bytes=0-1023" https://<votre-domaine>/valencia.pmtiles`
   doit répondre `206 Partial Content` avec un en-tête `Content-Range`.

## Checklist avant le départ

1. Ouvrir le lien en wifi et attendre « Carte prête ✓ » sur l'onglet Carte.
2. Ajouter l'app à l'écran d'accueil ; sur iPhone, toujours l'ouvrir depuis l'icône
   plutôt que depuis Safari.
3. Accepter la géolocalisation.
4. **Tester en mode avion** : carte, position, guide, événements, messages et phrases
   doivent tous s'afficher.

## Tests et vérifications

```bash
npm run typecheck
npm run lint
npm test
npm run generate
```
