# App de voyage « Laulau & Coco » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer une PWA Nuxt 3 installable, 100% fonctionnelle hors ligne après une première visite en ligne, qui présente à l'utilisatrice une carte de Séville, un programme d'événements, un guide de lieux, des messages surprise verrouillés dans le temps, et des phrases utiles en espagnol.

**Architecture:** SPA Nuxt 3 (`ssr: false`) avec 5 pages sous une barre d'onglets fixe. L'état applicatif tient dans des composables Vue légers (pas de store global) persistés via `localStorage`. Le contenu du voyage vit dans un unique fichier `data/content.ts`. La carte hors ligne combine un extrait `.pmtiles` de Séville (protocole `pmtiles` + MapLibre GL) avec un style généré localement via `@protomaps/basemaps`, dont toutes les ressources (police, sprites) sont hébergées dans `public/`. Le service worker (`@vite-pwa/nuxt`) précache l'app shell ; le `.pmtiles` est mis en cache séparément via une règle Workbox à range requests plus un téléchargement explicite au démarrage.

**Tech Stack:** Nuxt 3.21.x (SPA), TypeScript, Vitest + happy-dom (composables et fonctions pures uniquement), ESLint via `@nuxt/eslint`, MapLibre GL 6.x, `pmtiles` (client JS) + `pmtiles` CLI (Homebrew), `@protomaps/basemaps`, `@vite-pwa/nuxt`, `sharp` (génération d'icônes), npm, déploiement Vercel.

**Spec:** `docs/superpowers/specs/2026-09-17-app-voyage-seville-design.md`

## Global Constraints

- `ssr: false` dans `nuxt.config.ts` ; build de production exclusivement via `nuxt generate`.
- Aucun appel réseau à l'exécution en dehors du premier chargement (pas de backend, pas d'API externe).
- Tout le contenu du voyage vit dans `data/content.ts`, aucun autre fichier de contenu.
- Fuseau horaire Europe/Madrid : toutes les dates du contenu sont des chaînes ISO avec décalage explicite (`+02:00` / `+01:00`).
- Package manager : npm (pas de yarn/pnpm).
- Nuxt reste sur la branche 3.x (`^3.21.0`) — ne pas migrer vers Nuxt 4.
- Pas de gestionnaire d'état global (pas de Pinia) : composables + `usePersistedRef` uniquement.
- Palette de couleurs de l'app : orange `#E2572B`, bleu azulejos `#1D6F8C`, fond crème `#FFF8F0`.
- Nom de l'app : `Laulau & Coco` (manifest `name`), `short_name` : `L&C`.
- Déploiement cible : Vercel, en sortie statique (`.output/public`).
- Tests automatisés : Vitest sur les fonctions pures et composables uniquement (pas de framework e2e/Playwright). La fiabilité de l'UI/carte/PWA se vérifie manuellement via la checklist du Task 27.

---

## Task 1: Bootstrap du projet Nuxt 3

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `app.vue`
- Create: `pages/index.vue`
- Create: `.gitignore`

**Interfaces:**
- Produces: script npm `dev`, `build`, `generate`, `preview`, `typecheck` ; fichier `nuxt.config.ts` exportant `defineNuxtConfig({...})` que les tâches suivantes modifieront (ajout de `modules`, `pwa`, `app.head`).

- [ ] **Step 1: Créer `.gitignore`**

```
node_modules
.nuxt
.output
.env
*.log
.DS_Store
```

- [ ] **Step 2: Créer `package.json`**

```json
{
  "name": "laulau-et-coco",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "typecheck": "nuxt typecheck"
  }
}
```

- [ ] **Step 3: Installer Nuxt 3 et les outils TypeScript**

Run: `npm install nuxt@^3.21.0`
Run: `npm install -D typescript vue-tsc`

- [ ] **Step 4: Créer `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  compatibilityDate: '2026-09-17',
})
```

- [ ] **Step 5: Créer `app.vue`**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 6: Créer `pages/index.vue` (placeholder, remplacé au Task 13)**

```vue
<template>
  <div>
    <h1>Laulau &amp; Coco</h1>
    <p>App en construction.</p>
  </div>
</template>
```

- [ ] **Step 7: Vérifier que le build statique fonctionne**

Run: `npm run generate`
Expected: la commande se termine sans erreur.

Run: `grep -rq "Laulau" .output/public/ && echo OK`
Expected: `OK`

Note : avec `ssr: false`, `nuxt generate` produit une coquille SPA identique pour chaque route (le contenu Vue n'est pas rendu en HTML statique, seulement compilé dans les bundles JS sous `.output/public/_nuxt/`). Le grep doit donc porter sur tout `.output/public/` (récursif), jamais sur le seul fichier `index.html` d'une route.

- [ ] **Step 8: Vérifier le typecheck**

Run: `npm run typecheck`
Expected: se termine sans erreur TypeScript.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts app.vue pages/index.vue .gitignore
git commit -m "chore: bootstrap Nuxt 3 SPA project"
```

---

## Task 2: Harnais de tests Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/sanity.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: script npm `test` ; convention de test `tests/**/*.test.ts` sous environnement `happy-dom` (fournit `localStorage`, `window`, `navigator.onLine`, etc. pour toutes les tâches suivantes).

- [ ] **Step 1: Installer Vitest et happy-dom**

Run: `npm install -D vitest@^5 happy-dom@^20`

- [ ] **Step 2: Créer `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Ajouter le script `test` dans `package.json`**

Modifier le bloc `scripts` de `package.json` :

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "typecheck": "nuxt typecheck",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Écrire un test trivial**

```ts
// tests/sanity.test.ts
import { describe, it, expect } from 'vitest'

describe('harnais de test', () => {
  it('fonctionne', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Lancer les tests**

Run: `npm test`
Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/sanity.test.ts package.json
git commit -m "test: add Vitest + happy-dom harness"
```

---

## Task 3: ESLint

**Files:**
- Create: `eslint.config.mjs`
- Modify: `nuxt.config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `nuxt.config.ts` de Task 1 (ajoute `modules: ['@nuxt/eslint']`).
- Produces: script npm `lint`.

- [ ] **Step 1: Installer `@nuxt/eslint`**

Run: `npm install -D @nuxt/eslint eslint`

- [ ] **Step 2: Ajouter le module dans `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  compatibilityDate: '2026-09-17',
  modules: ['@nuxt/eslint'],
})
```

- [ ] **Step 3: Générer la config ESLint de Nuxt**

Run: `npx nuxt prepare`
Expected: crée `.nuxt/eslint.config.mjs` (entre autres).

- [ ] **Step 4: Créer `eslint.config.mjs`**

```js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```

- [ ] **Step 5: Ajouter le script `lint` dans `package.json`**

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

(à fusionner avec les scripts existants du `package.json`)

- [ ] **Step 6: Lancer le lint**

Run: `npm run lint`
Expected: se termine sans erreur (0 problème).

- [ ] **Step 7: Commit**

```bash
git add eslint.config.mjs nuxt.config.ts package.json
git commit -m "chore: add ESLint via @nuxt/eslint"
```

---

## Task 4: Modèle de données `data/content.ts`

**Files:**
- Create: `data/content.ts`
- Test: `tests/data/content.test.ts`

**Interfaces:**
- Produces: types `Categorie`, `Lieu`, `Evenement`, `Message`, `Phrase` et les tableaux `lieux`, `evenements`, `messages`, `phrases`, consommés par toutes les tâches de composables/pages suivantes.

- [ ] **Step 1: Écrire le test d'intégrité (échoue, le fichier n'existe pas)**

```ts
// tests/data/content.test.ts
import { describe, it, expect } from 'vitest'
import { lieux, evenements, messages, phrases } from '../../data/content'

describe('data/content.ts', () => {
  it('a au moins un lieu, un événement, un message et une phrase', () => {
    expect(lieux.length).toBeGreaterThan(0)
    expect(evenements.length).toBeGreaterThan(0)
    expect(messages.length).toBeGreaterThan(0)
    expect(phrases.length).toBeGreaterThan(0)
  })

  it('chaque événement référence un lieu existant', () => {
    const idsLieux = new Set(lieux.map((lieu) => lieu.id))
    for (const evenement of evenements) {
      expect(idsLieux.has(evenement.lieuId)).toBe(true)
    }
  })

  it('les identifiants de lieux, événements et messages sont uniques', () => {
    expect(new Set(lieux.map((l) => l.id)).size).toBe(lieux.length)
    expect(new Set(evenements.map((e) => e.id)).size).toBe(evenements.length)
    expect(new Set(messages.map((m) => m.id)).size).toBe(messages.length)
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/data/content.test.ts`
Expected: FAIL — `Cannot find module '../../data/content'`

- [ ] **Step 3: Créer `data/content.ts`**

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
  debut: string // ISO avec décalage, ex. '2026-10-03T19:30:00+02:00'
  fin?: string
  lieuId: string
  titre: string
  details?: string
}

export interface Message {
  id: string
  unlockAt: string // ISO avec décalage
  titre: string
  texte: string
}

export interface Phrase {
  theme: string
  fr: string
  es: string
  prononciation: string
}

export const lieux: Lieu[] = [
  {
    id: 'plaza-espana',
    nom: 'Plaza de España',
    categorie: 'a-voir',
    lat: 39.4539,
    lng: -0.3483,
    mot: 'Le complexe futuriste de Calatrava, magnifique au coucher du soleil.',
  },
  {
    id: 'real-alcazar',
    nom: 'Real Alcázar de Sevilla',
    categorie: 'a-voir',
    lat: 39.4744,
    lng: -0.3814,
    mot: "L'ancienne bourse de soie, classée à l'UNESCO. Ne rate pas la salle des colonnes torsadées.",
  },
  {
    id: 'catedral-sevilla',
    nom: 'Cathédrale de Séville',
    categorie: 'a-voir',
    lat: 39.4807,
    lng: -0.3774,
    mot: 'On monte tout en haut pour la vue sur la vieille ville, promis ça vaut le coup.',
  },
  {
    id: 'mercado-triana',
    nom: 'Mercado de Triana',
    categorie: 'autre',
    lat: 39.4746,
    lng: -0.3798,
    mot: 'Marché couvert Art nouveau. Parfait pour goûter des fruits et du jambon local.',
  },
  {
    id: 'la-brunilda',
    nom: 'La Brunilda',
    categorie: 'resto',
    lat: 39.4656,
    lng: -0.326,
    mot: 'Bodega historique du Cabanyal, tapas et bon vin. On réserve si on veut une table.',
  },
  {
    id: 'parque-maria-luisa',
    nom: 'Parque de María Luisa',
    categorie: 'cafe',
    lat: 39.4759,
    lng: -0.3757,
    mot: 'La meilleure horchata du centre, avec les fartons pour tremper dedans.',
  },
  {
    id: 'parque-maria-luisa',
    nom: 'Parque de María Luisa',
    categorie: 'plage',
    lat: 39.4756,
    lng: -0.3277,
    mot: 'Grande plage de sable, parfaite pour un bain en fin de journée.',
  },
]

export const evenements: Evenement[] = [
  {
    id: 'arrivee-hotel',
    debut: '2026-10-03T16:00:00+02:00',
    lieuId: 'mercado-triana',
    titre: "Arrivée et installation à l'hôtel",
    details: 'Dépose des valises, on part ensuite explorer le centre à pied.',
  },
  {
    id: 'diner-la-brunilda',
    debut: '2026-10-03T20:30:00+02:00',
    fin: '2026-10-03T22:30:00+02:00',
    lieuId: 'la-brunilda',
    titre: 'Dîner tapas à La Brunilda',
  },
  {
    id: 'visite-plaza-espana',
    debut: '2026-10-04T10:00:00+02:00',
    fin: '2026-10-04T13:00:00+02:00',
    lieuId: 'plaza-espana',
    titre: 'Visite de la Plaza de España',
  },
  {
    id: 'apres-midi-plage',
    debut: '2026-10-05T15:00:00+02:00',
    fin: '2026-10-05T18:30:00+02:00',
    lieuId: 'parque-maria-luisa',
    titre: 'Après-midi à la María Luisa',
    details: 'Serviettes et crème solaire !',
  },
  {
    id: 'visite-alcazar',
    debut: '2026-10-06T11:00:00+02:00',
    fin: '2026-10-06T12:30:00+02:00',
    lieuId: 'real-alcazar',
    titre: 'Visite du Real Alcázar de Sevilla',
  },
]

export const messages: Message[] = [
  {
    id: 'message-1',
    unlockAt: '2026-10-03T08:00:00+02:00',
    titre: 'Bon voyage !',
    texte: "On y est enfin. J'ai hâte de découvrir Séville avec toi. Bisous depuis avant le départ.",
  },
  {
    id: 'message-2',
    unlockAt: '2026-10-05T09:00:00+02:00',
    titre: 'Mi-séjour',
    texte: "Déjà la moitié du voyage ! Profite bien de la plage cet après-midi, je pense fort à toi.",
  },
  {
    id: 'message-3',
    unlockAt: '2026-10-07T07:00:00+02:00',
    titre: 'Dernier jour',
    texte: 'Dernier jour à Séville. Merci pour ce super voyage, on en refait un vite.',
  },
]

export const phrases: Phrase[] = [
  { theme: 'Salutations', fr: 'Bonjour', es: 'Buenos días', prononciation: 'bou-é-nos di-as' },
  { theme: 'Salutations', fr: 'Bonsoir', es: 'Buenas tardes', prononciation: 'bou-é-nas tar-dès' },
  { theme: 'Salutations', fr: 'Merci beaucoup', es: 'Muchas gracias', prononciation: 'mou-tchas gra-cias' },
  { theme: 'Salutations', fr: "S'il vous plaît", es: 'Por favor', prononciation: 'por fa-vor' },
  {
    theme: 'Restaurant',
    fr: 'Une table pour deux, s’il vous plaît',
    es: 'Una mesa para dos, por favor',
    prononciation: 'ou-na mé-sa pa-ra dos, por fa-vor',
  },
  {
    theme: 'Restaurant',
    fr: "L'addition, s'il vous plaît",
    es: 'La cuenta, por favor',
    prononciation: 'la couenn-ta, por fa-vor',
  },
  { theme: 'Restaurant', fr: 'Sans gluten', es: 'Sin gluten', prononciation: 'sinn glou-tenn' },
  {
    theme: 'Restaurant',
    fr: "Qu'est-ce que vous recommandez ?",
    es: '¿Qué nos recomienda?',
    prononciation: 'ké nos ré-co-mien-da',
  },
  {
    theme: 'Transport',
    fr: 'Où est la station de métro ?',
    es: '¿Dónde está el metro?',
    prononciation: 'donn-dé es-ta el mé-tro',
  },
  {
    theme: 'Transport',
    fr: 'Un billet pour le centre-ville',
    es: 'Un billete para el centro',
    prononciation: 'oun bi-yé-té pa-ra el cenn-tro',
  },
  {
    theme: 'Transport',
    fr: "C'est loin d'ici ?",
    es: '¿Está lejos de aquí?',
    prononciation: 'es-ta lé-Ros dé a-ki',
  },
  {
    theme: 'Transport',
    fr: 'À quelle heure part le bus ?',
    es: '¿A qué hora sale el autobús?',
    prononciation: 'a ké o-ra sa-lé el aou-to-bous',
  },
  { theme: 'Urgences', fr: "À l'aide !", es: '¡Ayuda!', prononciation: 'a-you-da' },
  {
    theme: 'Urgences',
    fr: "J'ai besoin d'un médecin",
    es: 'Necesito un médico',
    prononciation: 'né-cé-si-to oun mé-di-co',
  },
  {
    theme: 'Urgences',
    fr: 'Où est la pharmacie la plus proche ?',
    es: '¿Dónde está la farmacia más cercana?',
    prononciation: 'donn-dé es-ta la far-ma-cia mas cer-ca-na',
  },
  {
    theme: 'Urgences',
    fr: "J'ai perdu mon passeport",
    es: 'He perdido mi pasaporte',
    prononciation: 'é pèr-di-do mi pa-sa-por-té',
  },
]
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/data/content.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Vérifier le typecheck**

Run: `npm run typecheck`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add data/content.ts tests/data/content.test.ts
git commit -m "feat: add trip content data model with placeholder Seville content"
```

---

## Task 5: Composable `usePersistedRef`

**Files:**
- Create: `composables/usePersistedRef.ts`
- Test: `tests/composables/usePersistedRef.test.ts`

**Interfaces:**
- Produces: `usePersistedRef<T>(cle: string, valeurParDefaut: T): Ref<T>` — utilisé par les Tasks 7, 8.

- [ ] **Step 1: Écrire le test (échoue, le composable n'existe pas)**

```ts
// tests/composables/usePersistedRef.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { usePersistedRef } from '../../composables/usePersistedRef'

describe('usePersistedRef', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('utilise la valeur par défaut si rien n’est stocké', () => {
    const valeur = usePersistedRef('test:cle', 'defaut')
    expect(valeur.value).toBe('defaut')
  })

  it('relit la valeur précédemment stockée', () => {
    localStorage.setItem('test:cle', JSON.stringify('valeur-stockee'))
    const valeur = usePersistedRef('test:cle', 'defaut')
    expect(valeur.value).toBe('valeur-stockee')
  })

  it('persiste les changements dans localStorage', async () => {
    const valeur = usePersistedRef('test:cle', 'defaut')
    valeur.value = 'nouvelle-valeur'
    await nextTick()
    expect(localStorage.getItem('test:cle')).toBe(JSON.stringify('nouvelle-valeur'))
  })

  it('persiste les objets', async () => {
    const valeur = usePersistedRef('test:objet', { mode: 'gps' as const })
    valeur.value = { mode: 'manuel' as const }
    await nextTick()
    expect(JSON.parse(localStorage.getItem('test:objet')!)).toEqual({ mode: 'manuel' })
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/usePersistedRef.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/usePersistedRef.ts`**

```ts
import { ref, watch, type Ref } from 'vue'

export function usePersistedRef<T>(cle: string, valeurParDefaut: T): Ref<T> {
  let valeurInitiale = valeurParDefaut

  if (typeof localStorage !== 'undefined') {
    const stockee = localStorage.getItem(cle)
    if (stockee !== null) {
      try {
        valeurInitiale = JSON.parse(stockee) as T
      } catch {
        valeurInitiale = valeurParDefaut
      }
    }
  }

  const donnee = ref(valeurInitiale) as Ref<T>

  watch(
    donnee,
    (nouvelleValeur) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cle, JSON.stringify(nouvelleValeur))
      }
    },
    { deep: true },
  )

  return donnee
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/usePersistedRef.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add composables/usePersistedRef.ts tests/composables/usePersistedRef.test.ts
git commit -m "feat: add usePersistedRef composable"
```

---

## Task 6: Statut des événements (`utils/evenements.ts`)

**Files:**
- Create: `utils/evenements.ts`
- Test: `tests/utils/evenements.test.ts`

**Interfaces:**
- Produces: `decrireStatutEvenement(evenement: { debut: string; fin?: string }, maintenant: Date): string` — retourne `"Dans X heure(s)/minute(s)/jour(s)"`, `"Maintenant"` ou `"Passé"`. Consommé par Task 16 (page À venir).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/utils/evenements.test.ts
import { describe, it, expect } from 'vitest'
import { decrireStatutEvenement } from '../../utils/evenements'

describe('decrireStatutEvenement', () => {
  it('indique le délai avant un événement futur, en heures', () => {
    const maintenant = new Date('2026-10-03T17:30:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Dans 2 heures')
  })

  it('indique "Maintenant" pendant la fenêtre debut-fin', () => {
    const maintenant = new Date('2026-10-03T20:00:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00', fin: '2026-10-03T21:00:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Maintenant')
  })

  it('indique "Maintenant" à l’instant du début sans fin définie', () => {
    const maintenant = new Date('2026-10-03T19:30:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Maintenant')
  })

  it('indique "Passé" après la fin', () => {
    const maintenant = new Date('2026-10-03T22:00:00+02:00')
    const evenement = { debut: '2026-10-03T19:30:00+02:00', fin: '2026-10-03T21:00:00+02:00' }
    expect(decrireStatutEvenement(evenement, maintenant)).toBe('Passé')
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/utils/evenements.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `utils/evenements.ts`**

```ts
export function decrireStatutEvenement(
  evenement: { debut: string; fin?: string },
  maintenant: Date,
): string {
  const debut = new Date(evenement.debut)
  const fin = evenement.fin ? new Date(evenement.fin) : debut

  if (maintenant < debut) {
    return formatDelaiAvant(debut, maintenant)
  }
  if (maintenant >= debut && maintenant <= fin) {
    return 'Maintenant'
  }
  return 'Passé'
}

function formatDelaiAvant(debut: Date, maintenant: Date): string {
  const diffMinutes = Math.round((debut.getTime() - maintenant.getTime()) / 60000)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

  if (diffMinutes < 60) {
    return capitaliser(rtf.format(diffMinutes, 'minute'))
  }
  const diffHeures = Math.round(diffMinutes / 60)
  if (diffHeures < 24) {
    return capitaliser(rtf.format(diffHeures, 'hour'))
  }
  const diffJours = Math.round(diffHeures / 24)
  return capitaliser(rtf.format(diffJours, 'day'))
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/utils/evenements.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add utils/evenements.ts tests/utils/evenements.test.ts
git commit -m "feat: add event status description utility"
```

---

## Task 7: Composable `useMessages`

**Files:**
- Create: `composables/useMessages.ts`
- Test: `tests/composables/useMessages.test.ts`

**Interfaces:**
- Consumes: `usePersistedRef` (Task 5).
- Produces: `estDeverrouille(message: { unlockAt: string }, maintenant: Date): boolean`, `formatCompteARebours(unlockAt: string, maintenant: Date): string`, `useMessages(): { idsLus: Ref<string[]>, estLu(id: string): boolean, marquerCommeLu(id: string): void }`. Consommé par Task 17 (page Messages).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/composables/useMessages.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { estDeverrouille, formatCompteARebours, useMessages } from '../../composables/useMessages'

describe('estDeverrouille', () => {
  it('est verrouillé avant unlockAt', () => {
    const verrouille = estDeverrouille(
      { unlockAt: '2026-10-05T09:00:00+02:00' },
      new Date('2026-10-05T08:59:00+02:00'),
    )
    expect(verrouille).toBe(false)
  })

  it('est déverrouillé à partir de unlockAt', () => {
    const deverrouille = estDeverrouille(
      { unlockAt: '2026-10-05T09:00:00+02:00' },
      new Date('2026-10-05T09:00:00+02:00'),
    )
    expect(deverrouille).toBe(true)
  })
})

describe('formatCompteARebours', () => {
  it('formate jours, heures et minutes restantes', () => {
    const maintenant = new Date('2026-10-03T10:00:00+02:00')
    expect(formatCompteARebours('2026-10-05T14:30:00+02:00', maintenant)).toBe('2j 4h 30min')
  })

  it('retourne zéro une fois la cible atteinte', () => {
    const maintenant = new Date('2026-10-05T14:30:00+02:00')
    expect(formatCompteARebours('2026-10-05T14:30:00+02:00', maintenant)).toBe('0j 0h 0min')
  })
})

describe('useMessages', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("n'est pas lu par défaut", () => {
    const { estLu } = useMessages()
    expect(estLu('msg-1')).toBe(false)
  })

  it('marque un message comme lu et le persiste', () => {
    const { estLu, marquerCommeLu } = useMessages()
    marquerCommeLu('msg-1')
    expect(estLu('msg-1')).toBe(true)

    const { estLu: estLuNouvelleInstance } = useMessages()
    expect(estLuNouvelleInstance('msg-1')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/useMessages.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/useMessages.ts`**

```ts
import { usePersistedRef } from './usePersistedRef'

export function estDeverrouille(message: { unlockAt: string }, maintenant: Date): boolean {
  return maintenant.getTime() >= new Date(message.unlockAt).getTime()
}

export function formatCompteARebours(unlockAt: string, maintenant: Date): string {
  const diffMs = new Date(unlockAt).getTime() - maintenant.getTime()
  if (diffMs <= 0) return '0j 0h 0min'

  const totalMinutes = Math.floor(diffMs / 60000)
  const jours = Math.floor(totalMinutes / (60 * 24))
  const heures = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  return `${jours}j ${heures}h ${minutes}min`
}

export function useMessages() {
  const idsLus = usePersistedRef<string[]>('messages:lus', [])

  function estLu(id: string): boolean {
    return idsLus.value.includes(id)
  }

  function marquerCommeLu(id: string): void {
    if (!idsLus.value.includes(id)) {
      idsLus.value = [...idsLus.value, id]
    }
  }

  return { idsLus, estLu, marquerCommeLu }
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/useMessages.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add composables/useMessages.ts tests/composables/useMessages.test.ts
git commit -m "feat: add useMessages composable with lock/read logic"
```

---

## Task 8: Composable `usePosition`

**Files:**
- Create: `composables/usePosition.ts`
- Test: `tests/composables/usePosition.test.ts`

**Interfaces:**
- Consumes: `usePersistedRef` (Task 5).
- Produces: `usePosition(): { mode: Ref<'gps'|'manuel'>, position: ComputedRef<{lat:number,lng:number,source:'gps'|'manuel'}|null>, rechercheGpsEnCours: Ref<boolean>, activerModeGps(): void, definirPositionManuelle(c: {lat:number,lng:number}): void, arreterSuiviGps(): void }`. Consommé par Task 21 (composant carte).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/composables/usePosition.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePosition } from '../../composables/usePosition'

function creerGeolocationSimulee() {
  let callbackSucces: PositionCallback | null = null
  const watchPosition = vi.fn((succes: PositionCallback) => {
    callbackSucces = succes
    return 1
  })
  const clearWatch = vi.fn()
  return {
    watchPosition,
    clearWatch,
    emettrePosition(lat: number, lng: number) {
      callbackSucces?.({ coords: { latitude: lat, longitude: lng } } as GeolocationPosition)
    },
  }
}

describe('usePosition', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('démarre en mode gps par défaut sans position tant que le GPS n’a pas répondu', () => {
    const { mode, position } = usePosition()
    expect(mode.value).toBe('gps')
    expect(position.value).toBeNull()
  })

  it('expose la position GPS reçue via watchPosition', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { position, activerModeGps } = usePosition()
    activerModeGps()
    geoloc.emettrePosition(39.47, -0.38)

    expect(position.value).toEqual({ lat: 39.47, lng: -0.38, source: 'gps' })
  })

  it('passe en mode manuel et arrête le suivi GPS', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { mode, position, activerModeGps, definirPositionManuelle } = usePosition()
    activerModeGps()
    definirPositionManuelle({ lat: 39.46, lng: -0.37 })

    expect(mode.value).toBe('manuel')
    expect(position.value).toEqual({ lat: 39.46, lng: -0.37, source: 'manuel' })
    expect(geoloc.clearWatch).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/usePosition.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/usePosition.ts`**

```ts
import { ref, computed, onScopeDispose } from 'vue'
import { usePersistedRef } from './usePersistedRef'

export type ModePosition = 'gps' | 'manuel'

export interface Coordonnees {
  lat: number
  lng: number
}

export interface PositionActuelle extends Coordonnees {
  source: ModePosition
}

export function usePosition() {
  const mode = usePersistedRef<ModePosition>('position:mode', 'gps')
  const positionManuelle = usePersistedRef<Coordonnees | null>('position:manuelle', null)
  const positionGps = ref<Coordonnees | null>(null)
  const rechercheGpsEnCours = ref(false)
  let idSuivi: number | null = null

  const position = computed<PositionActuelle | null>(() => {
    if (mode.value === 'manuel') {
      return positionManuelle.value ? { ...positionManuelle.value, source: 'manuel' } : null
    }
    return positionGps.value ? { ...positionGps.value, source: 'gps' } : null
  })

  function demarrerSuiviGps(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    arreterSuiviGps()
    rechercheGpsEnCours.value = true
    idSuivi = navigator.geolocation.watchPosition(
      (resultat) => {
        positionGps.value = { lat: resultat.coords.latitude, lng: resultat.coords.longitude }
        rechercheGpsEnCours.value = false
      },
      () => {
        rechercheGpsEnCours.value = false
      },
      { enableHighAccuracy: true, timeout: 60000 },
    )
  }

  function arreterSuiviGps(): void {
    if (idSuivi !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(idSuivi)
      idSuivi = null
    }
    rechercheGpsEnCours.value = false
  }

  function activerModeGps(): void {
    mode.value = 'gps'
    positionGps.value = null
    demarrerSuiviGps()
  }

  function definirPositionManuelle(coordonnees: Coordonnees): void {
    arreterSuiviGps()
    mode.value = 'manuel'
    positionManuelle.value = coordonnees
  }

  onScopeDispose(() => {
    arreterSuiviGps()
  })

  return {
    mode,
    position,
    rechercheGpsEnCours,
    activerModeGps,
    definirPositionManuelle,
    arreterSuiviGps,
  }
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/usePosition.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add composables/usePosition.ts tests/composables/usePosition.test.ts
git commit -m "feat: add usePosition composable (GPS / manual)"
```

---

## Task 9: Composable `useMapFocus`

**Files:**
- Create: `composables/useMapFocus.ts`
- Test: `tests/composables/useMapFocus.test.ts`

**Interfaces:**
- Produces: `useMapFocus(): { demandeFocus: Ref<{lieuId:string}|null>, demanderFocus(lieuId: string): void, consommerFocus(): {lieuId:string}|null }` — état module-level partagé entre toutes les pages. Consommé par Task 15 (Guide), Task 16 (À venir), Task 21 (composant carte).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/composables/useMapFocus.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMapFocus } from '../../composables/useMapFocus'

describe('useMapFocus', () => {
  beforeEach(() => {
    useMapFocus().consommerFocus()
  })

  it('n’a pas de demande de focus par défaut', () => {
    expect(useMapFocus().consommerFocus()).toBeNull()
  })

  it('enregistre puis consomme une demande de focus', () => {
    useMapFocus().demanderFocus('lieu-mercado-triana')
    expect(useMapFocus().consommerFocus()).toEqual({ lieuId: 'lieu-mercado-triana' })
  })

  it('la demande est effacée après consommation', () => {
    useMapFocus().demanderFocus('lieu-parque-maria-luisa')
    useMapFocus().consommerFocus()
    expect(useMapFocus().consommerFocus()).toBeNull()
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/useMapFocus.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/useMapFocus.ts`**

```ts
import { ref } from 'vue'

export interface DemandeFocus {
  lieuId: string
}

const demandeFocus = ref<DemandeFocus | null>(null)

export function useMapFocus() {
  function demanderFocus(lieuId: string): void {
    demandeFocus.value = { lieuId }
  }

  function consommerFocus(): DemandeFocus | null {
    const valeur = demandeFocus.value
    demandeFocus.value = null
    return valeur
  }

  return { demandeFocus, demanderFocus, consommerFocus }
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/useMapFocus.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add composables/useMapFocus.ts tests/composables/useMapFocus.test.ts
git commit -m "feat: add useMapFocus composable for cross-page map centring"
```

---

## Task 10: Composable `useMapCache`

**Files:**
- Create: `composables/useMapCache.ts`
- Test: `tests/composables/useMapCache.test.ts`

**Interfaces:**
- Produces: `useMapCache(): { pret: Ref<boolean>, telechargementEnCours: Ref<boolean>, assurerCarteEnCache(): Promise<void> }`. Consommé par Task 21 (composant carte).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/composables/useMapCache.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMapCache } from '../../composables/useMapCache'

describe('useMapCache', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('passe à "prêt" sans télécharger si le fichier est déjà en cache', async () => {
    const match = vi.fn().mockResolvedValue(new Response('deja-la'))
    const add = vi.fn()
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match, add }) })

    const { pret, telechargementEnCours, assurerCarteEnCache } = useMapCache()
    await assurerCarteEnCache()

    expect(add).not.toHaveBeenCalled()
    expect(pret.value).toBe(true)
    expect(telechargementEnCours.value).toBe(false)
  })

  it('télécharge le fichier si absent du cache puis passe à "prêt"', async () => {
    const match = vi.fn().mockResolvedValue(undefined)
    const add = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match, add }) })

    const { pret, assurerCarteEnCache } = useMapCache()
    await assurerCarteEnCache()

    expect(add).toHaveBeenCalledWith('/seville.pmtiles')
    expect(pret.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/useMapCache.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/useMapCache.ts`**

```ts
import { ref } from 'vue'

const NOM_CACHE = 'map'
const CHEMIN_PMTILES = '/seville.pmtiles'

export function useMapCache() {
  const pret = ref(false)
  const telechargementEnCours = ref(false)

  async function assurerCarteEnCache(): Promise<void> {
    if (typeof caches === 'undefined') {
      return
    }
    const cache = await caches.open(NOM_CACHE)
    const existant = await cache.match(CHEMIN_PMTILES)
    if (!existant) {
      telechargementEnCours.value = true
      try {
        await cache.add(CHEMIN_PMTILES)
      } finally {
        telechargementEnCours.value = false
      }
    }
    pret.value = true
  }

  return { pret, telechargementEnCours, assurerCarteEnCache }
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/useMapCache.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add composables/useMapCache.ts tests/composables/useMapCache.test.ts
git commit -m "feat: add useMapCache composable"
```

---

## Task 11: Composable `useEnLigne`

**Files:**
- Create: `composables/useEnLigne.ts`
- Test: `tests/composables/useEnLigne.test.ts`

**Interfaces:**
- Produces: `useEnLigne(): { enLigne: Ref<boolean> }`. Consommé par Task 14 (`OfflineBanner.vue`).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/composables/useEnLigne.test.ts
import { describe, it, expect } from 'vitest'
import { effectScope } from 'vue'
import { useEnLigne } from '../../composables/useEnLigne'

describe('useEnLigne', () => {
  it('reflète navigator.onLine au départ', () => {
    const { enLigne } = useEnLigne()
    expect(enLigne.value).toBe(navigator.onLine)
  })

  it('passe à false sur l’événement offline puis à true sur online', () => {
    const { enLigne } = useEnLigne()
    window.dispatchEvent(new Event('offline'))
    expect(enLigne.value).toBe(false)
    window.dispatchEvent(new Event('online'))
    expect(enLigne.value).toBe(true)
  })

  it('n’écoute plus après la destruction du scope', () => {
    const portee = effectScope()
    const { enLigne } = portee.run(() => useEnLigne())!
    portee.stop()
    window.dispatchEvent(new Event('offline'))
    expect(enLigne.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/useEnLigne.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/useEnLigne.ts`**

```ts
import { ref, onScopeDispose } from 'vue'

export function useEnLigne() {
  const enLigne = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  function gererEnLigne(): void {
    enLigne.value = true
  }
  function gererHorsLigne(): void {
    enLigne.value = false
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', gererEnLigne)
    window.addEventListener('offline', gererHorsLigne)
    onScopeDispose(() => {
      window.removeEventListener('online', gererEnLigne)
      window.removeEventListener('offline', gererHorsLigne)
    })
  }

  return { enLigne }
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/useEnLigne.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add composables/useEnLigne.ts tests/composables/useEnLigne.test.ts
git commit -m "feat: add useEnLigne composable"
```

---

## Task 12: Utilitaires de regroupement (`utils/regroupement.ts`)

**Files:**
- Create: `utils/regroupement.ts`
- Test: `tests/utils/regroupement.test.ts`

**Interfaces:**
- Consumes: types `Lieu`, `Phrase`, `Categorie` (Task 4).
- Produces: `groupLieuxParCategorie(lieux: Lieu[]): Partial<Record<Categorie, Lieu[]>>`, `groupPhrasesParTheme(phrases: Phrase[]): Record<string, Phrase[]>`. Consommé par Task 15 (Guide) et Task 18 (Phrases).

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/utils/regroupement.test.ts
import { describe, it, expect } from 'vitest'
import { groupLieuxParCategorie, groupPhrasesParTheme } from '../../utils/regroupement'
import type { Lieu, Phrase } from '../../data/content'

describe('groupLieuxParCategorie', () => {
  it('regroupe les lieux par catégorie', () => {
    const lieux: Lieu[] = [
      { id: '1', nom: 'A', categorie: 'a-voir', lat: 0, lng: 0 },
      { id: '2', nom: 'B', categorie: 'resto', lat: 0, lng: 0 },
      { id: '3', nom: 'C', categorie: 'a-voir', lat: 0, lng: 0 },
    ]
    const groupes = groupLieuxParCategorie(lieux)
    expect(groupes['a-voir']?.map((l) => l.id)).toEqual(['1', '3'])
    expect(groupes.resto?.map((l) => l.id)).toEqual(['2'])
  })
})

describe('groupPhrasesParTheme', () => {
  it('regroupe les phrases par thème', () => {
    const phrases: Phrase[] = [
      { theme: 'Salutations', fr: 'Bonjour', es: 'Hola', prononciation: 'o-la' },
      { theme: 'Transport', fr: 'Métro', es: 'Metro', prononciation: 'mé-tro' },
      { theme: 'Salutations', fr: 'Merci', es: 'Gracias', prononciation: 'gra-cias' },
    ]
    const groupes = groupPhrasesParTheme(phrases)
    expect(groupes.Salutations.map((p) => p.fr)).toEqual(['Bonjour', 'Merci'])
    expect(groupes.Transport.map((p) => p.fr)).toEqual(['Métro'])
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/utils/regroupement.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `utils/regroupement.ts`**

```ts
import type { Categorie, Lieu, Phrase } from '../data/content'

export function groupLieuxParCategorie(lieux: Lieu[]): Partial<Record<Categorie, Lieu[]>> {
  const groupes: Partial<Record<Categorie, Lieu[]>> = {}
  for (const lieu of lieux) {
    const liste = groupes[lieu.categorie] ?? []
    liste.push(lieu)
    groupes[lieu.categorie] = liste
  }
  return groupes
}

export function groupPhrasesParTheme(phrases: Phrase[]): Record<string, Phrase[]> {
  const groupes: Record<string, Phrase[]> = {}
  for (const phrase of phrases) {
    const liste = groupes[phrase.theme] ?? []
    liste.push(phrase)
    groupes[phrase.theme] = liste
  }
  return groupes
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/utils/regroupement.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add utils/regroupement.ts tests/utils/regroupement.test.ts
git commit -m "feat: add lieux/phrases grouping utilities"
```

---

## Task 13: Navigation — `BottomNav.vue`, layout, pages

**Files:**
- Create: `utils/navigation.ts`
- Test: `tests/utils/navigation.test.ts`
- Create: `components/BottomNav.vue`
- Create: `layouts/default.vue`
- Modify: `pages/index.vue`
- Create: `pages/carte.vue`
- Create: `pages/a-venir.vue`
- Create: `pages/guide.vue`
- Create: `pages/messages.vue`
- Create: `pages/phrases.vue`

**Interfaces:**
- Produces: `estOngletActif(cheminActuel: string, cheminOnglet: string): boolean` ; composant `<BottomNav>` et layout `default` auto-enregistrés par Nuxt ; 5 routes `/carte`, `/a-venir`, `/guide`, `/messages`, `/phrases`.

- [ ] **Step 1: Écrire le test de `estOngletActif` (échoue, le fichier n'existe pas)**

```ts
// tests/utils/navigation.test.ts
import { describe, it, expect } from 'vitest'
import { estOngletActif } from '../../utils/navigation'

describe('estOngletActif', () => {
  it('est actif sur une correspondance exacte', () => {
    expect(estOngletActif('/carte', '/carte')).toBe(true)
  })

  it('est actif sur un sous-chemin', () => {
    expect(estOngletActif('/carte/detail', '/carte')).toBe(true)
  })

  it("n'est pas actif sur un autre onglet", () => {
    expect(estOngletActif('/guide', '/carte')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/utils/navigation.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `utils/navigation.ts`**

```ts
export function estOngletActif(cheminActuel: string, cheminOnglet: string): boolean {
  return cheminActuel === cheminOnglet || cheminActuel.startsWith(`${cheminOnglet}/`)
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/utils/navigation.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Créer `components/BottomNav.vue`**

```vue
<script setup lang="ts">
const route = useRoute()

const onglets = [
  { chemin: '/carte', label: 'Carte', icone: '🗺️' },
  { chemin: '/a-venir', label: 'À venir', icone: '🕒' },
  { chemin: '/guide', label: 'Guide', icone: '📍' },
  { chemin: '/messages', label: 'Messages', icone: '💌' },
  { chemin: '/phrases', label: 'Phrases', icone: '💬' },
] as const
</script>

<template>
  <nav class="barre-onglets">
    <NuxtLink
      v-for="onglet in onglets"
      :key="onglet.chemin"
      :to="onglet.chemin"
      class="onglet"
      :class="{ actif: estOngletActif(route.path, onglet.chemin) }"
    >
      <span class="onglet-icone" aria-hidden="true">{{ onglet.icone }}</span>
      <span class="onglet-label">{{ onglet.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.barre-onglets {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: #fff8f0;
  border-top: 1px solid #e8d9c8;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 10;
}

.onglet {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  font-size: 0.7rem;
  color: #8a7b6c;
  text-decoration: none;
}

.onglet.actif {
  color: #e2572b;
  font-weight: 600;
}

.onglet-icone {
  font-size: 1.3rem;
}
</style>
```

- [ ] **Step 6: Créer `layouts/default.vue`**

```vue
<template>
  <div class="app-shell">
    <main class="app-contenu">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-contenu {
  flex: 1;
  padding-bottom: 72px;
}
</style>
```

- [ ] **Step 7: Remplacer `pages/index.vue` par une redirection**

```vue
<script setup lang="ts">
await navigateTo('/carte')
</script>

<template>
  <div />
</template>
```

- [ ] **Step 8: Créer les 5 pages placeholder**

```vue
<!-- pages/carte.vue -->
<template>
  <div class="page">
    <h1>Carte</h1>
  </div>
</template>
```

```vue
<!-- pages/a-venir.vue -->
<template>
  <div class="page">
    <h1>À venir</h1>
  </div>
</template>
```

```vue
<!-- pages/guide.vue -->
<template>
  <div class="page">
    <h1>Guide</h1>
  </div>
</template>
```

```vue
<!-- pages/messages.vue -->
<template>
  <div class="page">
    <h1>Messages</h1>
  </div>
</template>
```

```vue
<!-- pages/phrases.vue -->
<template>
  <div class="page">
    <h1>Phrases</h1>
  </div>
</template>
```

- [ ] **Step 9: Vérifier le build statique et la navigation**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `grep -rq "Guide" .output/public/ && grep -rq "barre-onglets" .output/public/ && echo OK`
Expected: `OK`

(Grep récursif sur tout `.output/public/`, pas sur un seul `index.html` — voir la note du Task 1 sur le rendu SPA.)

- [ ] **Step 10: Commit**

```bash
git add utils/navigation.ts tests/utils/navigation.test.ts components/BottomNav.vue layouts/default.vue pages/
git commit -m "feat: add bottom tab navigation and page scaffolding"
```

---

## Task 14: `OfflineBanner.vue`

**Files:**
- Create: `components/OfflineBanner.vue`
- Modify: `layouts/default.vue`

**Interfaces:**
- Consumes: `useEnLigne` (Task 11).

- [ ] **Step 1: Créer `components/OfflineBanner.vue`**

```vue
<script setup lang="ts">
const { enLigne } = useEnLigne()
</script>

<template>
  <p v-if="!enLigne" class="bandeau-hors-ligne">Hors ligne — tout reste utilisable depuis le cache.</p>
</template>

<style scoped>
.bandeau-hors-ligne {
  margin: 0;
  padding: 6px 12px;
  background: #1d6f8c;
  color: #fff8f0;
  font-size: 0.8rem;
  text-align: center;
}
</style>
```

- [ ] **Step 2: Intégrer le bandeau dans `layouts/default.vue`**

```vue
<template>
  <div class="app-shell">
    <OfflineBanner />
    <main class="app-contenu">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-contenu {
  flex: 1;
  padding-bottom: 72px;
}
</style>
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur (le bandeau est masqué par défaut car `navigator.onLine` est `true` lors du prerendering).

- [ ] **Step 4: Commit**

```bash
git add components/OfflineBanner.vue layouts/default.vue
git commit -m "feat: add offline banner"
```

---

## Task 15: Page Guide

**Files:**
- Modify: `pages/guide.vue`

**Interfaces:**
- Consumes: `lieux` (Task 4, import explicite depuis `~/data/content`), `groupLieuxParCategorie` (Task 12, auto-importé), `useMapFocus` (Task 9, auto-importé).

- [ ] **Step 1: Implémenter `pages/guide.vue`**

```vue
<script setup lang="ts">
import { lieux } from '~/data/content'
import type { Categorie } from '~/data/content'

const { demanderFocus } = useMapFocus()

const groupes = groupLieuxParCategorie(lieux)

const libellesCategories: Record<Categorie, string> = {
  'a-voir': 'À voir',
  resto: 'Restos',
  cafe: 'Cafés',
  plage: 'Plages',
  autre: 'Autres',
}

async function voirSurCarte(lieuId: string): Promise<void> {
  demanderFocus(lieuId)
  await navigateTo('/carte')
}
</script>

<template>
  <div class="page">
    <h1>Guide</h1>
    <section v-for="(lieuxDeLaCategorie, categorie) in groupes" :key="categorie">
      <h2>{{ libellesCategories[categorie as Categorie] }}</h2>
      <ul>
        <li v-for="lieu in lieuxDeLaCategorie" :key="lieu.id">
          <strong>{{ lieu.nom }}</strong>
          <p v-if="lieu.mot">{{ lieu.mot }}</p>
          <button type="button" @click="voirSurCarte(lieu.id)">Voir sur la carte</button>
        </li>
      </ul>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `grep -rq "La Brunilda" .output/public/ && echo OK`
Expected: `OK`

(Grep récursif sur tout `.output/public/` — voir la note du Task 1 sur le rendu SPA.)

- [ ] **Step 3: Commit**

```bash
git add pages/guide.vue
git commit -m "feat: implement Guide page"
```

---

## Task 16: Page À venir

**Files:**
- Modify: `pages/a-venir.vue`

**Interfaces:**
- Consumes: `evenements`, `lieux` (Task 4), `decrireStatutEvenement` (Task 6, auto-importé), `useMapFocus` (Task 9, auto-importé).

- [ ] **Step 1: Implémenter `pages/a-venir.vue`**

```vue
<script setup lang="ts">
import { evenements, lieux } from '~/data/content'

const { demanderFocus } = useMapFocus()

const evenementsTries = [...evenements].sort(
  (a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime(),
)

const maintenant = ref(new Date())
let intervalle: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalle = setInterval(() => {
    maintenant.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  if (intervalle) clearInterval(intervalle)
})

function nomLieu(lieuId: string): string {
  return lieux.find((lieu) => lieu.id === lieuId)?.nom ?? lieuId
}

async function voirSurCarte(lieuId: string): Promise<void> {
  demanderFocus(lieuId)
  await navigateTo('/carte')
}
</script>

<template>
  <div class="page">
    <h1>À venir</h1>
    <ul>
      <li v-for="evenement in evenementsTries" :key="evenement.id">
        <p class="statut">{{ decrireStatutEvenement(evenement, maintenant) }}</p>
        <strong>{{ evenement.titre }}</strong>
        <p>{{ nomLieu(evenement.lieuId) }}</p>
        <p v-if="evenement.details">{{ evenement.details }}</p>
        <button type="button" @click="voirSurCarte(evenement.lieuId)">Voir sur la carte</button>
      </li>
    </ul>
  </div>
</template>
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `grep -rq "Dîner tapas" .output/public/ && echo OK`
Expected: `OK`

(Grep récursif sur tout `.output/public/` — voir la note du Task 1 sur le rendu SPA.)

- [ ] **Step 3: Commit**

```bash
git add pages/a-venir.vue
git commit -m "feat: implement A venir page"
```

---

## Task 17: Page Messages

**Files:**
- Modify: `pages/messages.vue`

**Interfaces:**
- Consumes: `messages` (Task 4), `estDeverrouille`, `formatCompteARebours`, `useMessages` (Task 7, auto-importés).

- [ ] **Step 1: Implémenter `pages/messages.vue`**

```vue
<script setup lang="ts">
import { messages } from '~/data/content'

const { estLu, marquerCommeLu } = useMessages()

const maintenant = ref(new Date())
let intervalle: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalle = setInterval(() => {
    maintenant.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  if (intervalle) clearInterval(intervalle)
})

const messagesTries = [...messages].sort(
  (a, b) => new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime(),
)

function ouvrir(id: string): void {
  marquerCommeLu(id)
}
</script>

<template>
  <div class="page">
    <h1>Messages</h1>
    <ul>
      <li v-for="message in messagesTries" :key="message.id">
        <template v-if="estDeverrouille(message, maintenant)">
          <strong>{{ message.titre }}</strong>
          <p>{{ message.texte }}</p>
          <p v-if="!estLu(message.id)">
            <button type="button" @click="ouvrir(message.id)">Marquer comme lu</button>
          </p>
          <p v-else class="lu">Lu ✓</p>
        </template>
        <template v-else>
          <strong>🔒 Message verrouillé</strong>
          <p>Déverrouillage dans {{ formatCompteARebours(message.unlockAt, maintenant) }}</p>
        </template>
      </li>
    </ul>
  </div>
</template>
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `grep -rq "🔒 Message verrouillé\|Marquer comme lu" .output/public/ && echo OK`
Expected: `OK`

(Grep récursif sur tout `.output/public/` — voir la note du Task 1 sur le rendu SPA. On cherche un texte propre à cette page plutôt que "Messages", qui apparaît aussi dans le libellé de `BottomNav`.)

- [ ] **Step 3: Commit**

```bash
git add pages/messages.vue
git commit -m "feat: implement Messages page"
```

---

## Task 18: Page Phrases

**Files:**
- Modify: `pages/phrases.vue`

**Interfaces:**
- Consumes: `phrases` (Task 4), `groupPhrasesParTheme` (Task 12, auto-importé).

- [ ] **Step 1: Implémenter `pages/phrases.vue`**

```vue
<script setup lang="ts">
import { phrases } from '~/data/content'

const groupes = groupPhrasesParTheme(phrases)
</script>

<template>
  <div class="page">
    <h1>Phrases</h1>
    <section v-for="(phrasesDuTheme, theme) in groupes" :key="theme">
      <h2>{{ theme }}</h2>
      <ul>
        <li v-for="(phrase, index) in phrasesDuTheme" :key="`${theme}-${index}`">
          <p class="fr">{{ phrase.fr }}</p>
          <p class="es">{{ phrase.es }}</p>
          <p class="prononciation">{{ phrase.prononciation }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `grep -rq "Buenos días" .output/public/ && echo OK`
Expected: `OK`

(Grep récursif sur tout `.output/public/` — voir la note du Task 1 sur le rendu SPA.)

- [ ] **Step 3: Commit**

```bash
git add pages/phrases.vue
git commit -m "feat: implement Phrases page"
```

---

## Task 19: Génération des données de carte hors ligne

**Files:**
- Create: `public/seville.pmtiles` (binaire)
- Create: `public/style/fonts/**` (binaires)
- Create: `public/style/sprites/light.json`, `light.png`, `light@2x.json`, `light@2x.png`
- Create: `scripts/build-map-data.md`

**Interfaces:**
- Produces: fichiers statiques consommés par Task 20 (`utils/mapStyle.ts`) et Task 21 (composant carte). Le sprite local est exposé sous la base `/style/sprites/light` (MapLibre complète automatiquement en `.json`/`.png`/`@2x.json`/`@2x.png`). Les glyphes sont exposés sous `/style/fonts/{fontstack}/{range}.pbf`.

- [ ] **Step 1: Installer l'outil `pmtiles` (CLI Go, via Homebrew)**

Run: `brew install pmtiles`
Expected: `pmtiles --help` affiche l'aide de la CLI (commandes `extract`, `verify`, etc.).

- [ ] **Step 2: Déterminer l'URL du build Protomaps le plus récent**

Ouvrir `https://maps.protomaps.com/builds` (avec l'outil browser disponible dans l'environnement d'implémentation, ou tout navigateur) et relever l'URL du build le plus récent, au format `https://build.protomaps.com/<horodatage>.pmtiles`. Cette page liste les builds via une application JS ; une requête `curl` brute sur `build.protomaps.com` ne fonctionne pas. Si aucun outil de navigation n'est disponible dans l'environnement d'implémentation, demander cette URL à l'utilisateur plutôt que de deviner un nom de fichier.

- [ ] **Step 3: Extraire la bbox de Séville**

Run (remplacer `<URL_DU_BUILD>` par l'URL relevée à l'étape précédente) :

```bash
pmtiles extract <URL_DU_BUILD> public/seville.pmtiles \
  --bbox=-6.05,37.30,-5.85,37.45 --maxzoom=15
```

Cette bbox couvre le centre historique, Triana et le parc de María Luisa.

- [ ] **Step 4: Vérifier l'archive extraite**

Run: `pmtiles verify public/seville.pmtiles`
Expected: aucune erreur signalée.

Run: `ls -lh public/seville.pmtiles`
Expected: fichier non vide (quelques Mo, pas plusieurs Go — sinon la bbox ou le maxzoom sont incorrects).

- [ ] **Step 5: Télécharger les polices et sprites Protomaps (assets basemaps-assets)**

```bash
curl -sSL -o /tmp/basemaps-assets.zip https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip
rm -rf /tmp/basemaps-assets
unzip -q /tmp/basemaps-assets.zip -d /tmp/basemaps-assets
mkdir -p public/style/fonts public/style/sprites
cp -R /tmp/basemaps-assets/basemaps-assets-main/fonts/. public/style/fonts/
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light.json public/style/sprites/light.json
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light.png public/style/sprites/light.png
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light@2x.json public/style/sprites/light@2x.json
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light@2x.png public/style/sprites/light@2x.png
```

Toutes les langues/polices sont copiées (pas de sous-ensemble) pour garantir qu'aucun libellé de carte ne manque de glyphe, quel que soit le flavor/langue utilisé.

- [ ] **Step 6: Vérifier la présence des assets**

Run: `find public/style/fonts -name '*.pbf' | wc -l`
Expected: un nombre > 0 (plusieurs centaines de fichiers).

Run: `ls public/style/sprites`
Expected: `light.json light.png light@2x.json light@2x.png`

- [ ] **Step 7: Documenter la procédure pour une régénération future**

```markdown
<!-- scripts/build-map-data.md -->
# Régénérer les données de carte hors ligne

## `public/seville.pmtiles`

1. Installer la CLI `pmtiles` : `brew install pmtiles`.
2. Relever l'URL du build Protomaps le plus récent sur
   https://maps.protomaps.com/builds (page JS, pas d'API brute — l'ouvrir dans un
   navigateur).
3. Extraire la bbox de Séville (centre historique, Plaza de España,
   plage de la María Luisa) :

   ```bash
   pmtiles extract <URL_DU_BUILD> public/seville.pmtiles \
     --bbox=-6.05,37.30,-5.85,37.45 --maxzoom=15
   ```

4. Vérifier : `pmtiles verify public/seville.pmtiles`.

## `public/style/fonts` et `public/style/sprites`

Polices et sprites Protomaps (toutes langues, pour ne manquer aucun glyphe) :

```bash
curl -sSL -o /tmp/basemaps-assets.zip https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip
rm -rf /tmp/basemaps-assets
unzip -q /tmp/basemaps-assets.zip -d /tmp/basemaps-assets
mkdir -p public/style/fonts public/style/sprites
cp -R /tmp/basemaps-assets/basemaps-assets-main/fonts/. public/style/fonts/
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light*.{json,png} public/style/sprites/
```

Ces assets changent rarement ; à régénérer seulement si Protomaps publie une nouvelle
version majeure du style (`@protomaps/basemaps` en `package.json`).
```

- [ ] **Step 8: Commit**

```bash
git add public/seville.pmtiles public/style scripts/build-map-data.md
git commit -m "feat: add offline Seville map tiles, fonts and sprites"
```

---

## Task 20: Style de carte (`utils/mapStyle.ts`)

**Files:**
- Create: `utils/mapStyle.ts`
- Test: `tests/utils/mapStyle.test.ts`

**Interfaces:**
- Produces: `creerStyleSéville(origin: string): StyleSpecification`. Consommé par Task 21 (composant carte).

- [ ] **Step 1: Installer les dépendances de carte**

Run: `npm install maplibre-gl@^6 pmtiles@^4 @protomaps/basemaps@^5`

- [ ] **Step 2: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/utils/mapStyle.test.ts
import { describe, it, expect } from 'vitest'
import { creerStyleSéville } from '../../utils/mapStyle'

describe('creerStyleSéville', () => {
  it('pointe vers les ressources locales uniquement', () => {
    const style = creerStyleSéville('https://exemple-app.test')
    expect(style.glyphs).toBe('https://exemple-app.test/style/fonts/{fontstack}/{range}.pbf')
    expect(style.sprite).toBe('https://exemple-app.test/style/sprites/light')
    expect((style.sources.protomaps as { url: string }).url).toBe(
      'pmtiles://https://exemple-app.test/seville.pmtiles',
    )
  })

  it('définit au moins une couche de rendu', () => {
    const style = creerStyleSéville('https://exemple-app.test')
    expect(style.layers.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 3: Run test, vérifier l'échec**

Run: `npx vitest run tests/utils/mapStyle.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 4: Implémenter `utils/mapStyle.ts`**

```ts
import { layers, namedFlavor } from '@protomaps/basemaps'
import type { StyleSpecification } from 'maplibre-gl'

export function creerStyleSéville(origin: string): StyleSpecification {
  return {
    version: 8,
    glyphs: `${origin}/style/fonts/{fontstack}/{range}.pbf`,
    sprite: `${origin}/style/sprites/light`,
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${origin}/seville.pmtiles`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers('protomaps', namedFlavor('light'), { lang: 'fr' }),
  }
}
```

- [ ] **Step 5: Run test, vérifier le succès**

Run: `npx vitest run tests/utils/mapStyle.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json utils/mapStyle.ts tests/utils/mapStyle.test.ts
git commit -m "feat: add offline MapLibre style builder"
```

---

## Task 21: Composant `MapaSeville.client.vue`

**Files:**
- Create: `components/MapaSeville.client.vue`

**Interfaces:**
- Consumes: `lieux` (Task 4), `creerStyleSéville` (Task 20, auto-importé), `usePosition` (Task 8, auto-importé), `useMapCache` (Task 10, auto-importé), `useMapFocus` (Task 9, auto-importé).
- Produces: composant `<MapaSeville>` auto-enregistré par Nuxt (suffixe `.client.vue` : rendu navigateur uniquement, jamais lors du prerendering).

- [ ] **Step 1: Implémenter `components/MapaSeville.client.vue`**

```vue
<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { lieux } from '~/data/content'

const conteneurCarte = ref<HTMLDivElement | null>(null)
let carte: maplibregl.Map | null = null
let marqueurPosition: maplibregl.Marker | null = null

const { mode, position, rechercheGpsEnCours, activerModeGps, definirPositionManuelle } = usePosition()
const { pret: cartePrete, telechargementEnCours, assurerCarteEnCache } = useMapCache()
const { consommerFocus } = useMapFocus()

const modeSelectionManuelle = ref(false)

function centrerSur(lat: number, lng: number, zoom = 15): void {
  carte?.flyTo({ center: [lng, lat], zoom })
}

function recentrer(): void {
  if (position.value) {
    centrerSur(position.value.lat, position.value.lng)
  }
}

function choisirLieuCommePosition(lieuId: string): void {
  const lieu = lieux.find((l) => l.id === lieuId)
  if (lieu) definirPositionManuelle({ lat: lieu.lat, lng: lieu.lng })
}

onMounted(async () => {
  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  await assurerCarteEnCache()

  if (!conteneurCarte.value) return

  carte = new maplibregl.Map({
    container: conteneurCarte.value,
    style: creerStyleSéville(location.origin),
    center: [-0.3763, 39.4699],
    zoom: 13,
  })

  carte.on('load', () => {
    for (const lieu of lieux) {
      const marqueur = new maplibregl.Marker({ color: '#e2572b' })
        .setLngLat([lieu.lng, lieu.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 24 }).setHTML(
            `<strong>${lieu.nom}</strong>${lieu.mot ? `<p>${lieu.mot}</p>` : ''}`,
          ),
        )
        .addTo(carte!)
    }

    carte!.on('click', (evenementClic) => {
      if (!modeSelectionManuelle.value) return
      definirPositionManuelle({ lat: evenementClic.lngLat.lat, lng: evenementClic.lngLat.lng })
      modeSelectionManuelle.value = false
    })

    const demande = consommerFocus()
    if (demande) {
      const lieuVise = lieux.find((lieu) => lieu.id === demande.lieuId)
      if (lieuVise) centrerSur(lieuVise.lat, lieuVise.lng)
    }
  })

  if (mode.value === 'gps') {
    activerModeGps()
  }
})

watch(position, (nouvellePosition) => {
  if (!carte) return
  if (!nouvellePosition) {
    marqueurPosition?.remove()
    marqueurPosition = null
    return
  }
  if (!marqueurPosition) {
    marqueurPosition = new maplibregl.Marker({ color: '#1d6f8c' })
      .setLngLat([nouvellePosition.lng, nouvellePosition.lat])
      .addTo(carte)
  } else {
    marqueurPosition.setLngLat([nouvellePosition.lng, nouvellePosition.lat])
  }
})
</script>

<template>
  <div class="carte-conteneur">
    <div ref="conteneurCarte" class="carte-maplibre" />

    <div class="carte-ui">
      <p class="statut-cache">
        {{
          cartePrete
            ? 'Carte prête ✓'
            : telechargementEnCours
              ? 'Téléchargement de la carte…'
              : 'Préparation de la carte…'
        }}
      </p>

      <div class="controles-position">
        <span>
          Position : {{ mode === 'gps' ? 'GPS' : 'Manuelle' }}
          <template v-if="mode === 'gps' && rechercheGpsEnCours"> (recherche…)</template>
        </span>
        <button type="button" @click="activerModeGps">Activer le GPS</button>
        <button type="button" @click="modeSelectionManuelle = !modeSelectionManuelle">
          {{ modeSelectionManuelle ? 'Toucher la carte pour placer…' : 'Placer manuellement' }}
        </button>
        <button type="button" @click="recentrer">Recentrer</button>
      </div>

      <details class="je-suis-a">
        <summary>Je suis à…</summary>
        <ul>
          <li v-for="lieu in lieux" :key="lieu.id">
            <button type="button" @click="choisirLieuCommePosition(lieu.id)">{{ lieu.nom }}</button>
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<style scoped>
.carte-conteneur {
  position: relative;
  height: calc(100vh - 72px);
}

.carte-maplibre {
  position: absolute;
  inset: 0;
}

.carte-ui {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: none;
}

.carte-ui > * {
  pointer-events: auto;
}

.statut-cache,
.controles-position,
.je-suis-a {
  background: rgba(255, 248, 240, 0.95);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
}
</style>
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `npm run typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/MapaSeville.client.vue
git commit -m "feat: implement offline map component"
```

---

## Task 22: Page Carte

**Files:**
- Modify: `pages/carte.vue`

**Interfaces:**
- Consumes: `<MapaSeville>` (Task 21, auto-enregistré).

- [ ] **Step 1: Implémenter `pages/carte.vue`**

```vue
<template>
  <MapaSeville />
</template>
```

- [ ] **Step 2: Vérifier le build statique**

Run: `npm run generate`
Expected: se termine sans erreur ; `.output/public/carte/index.html` existe (le composant carte, `.client.vue`, ne s'exécute pas pendant le prerendering — c'est le comportement attendu).

Run: `test -s .output/public/carte/index.html && echo OK`
Expected: `OK`

- [ ] **Step 3: Vérification manuelle recommandée**

Si un navigateur est disponible dans l'environnement d'implémentation : lancer `npm run dev`, ouvrir `/carte`, vérifier que la carte s'affiche avec les marqueurs et le bouton « Activer le GPS », puis arrêter le serveur de dev. Cette vérification visuelle complète la checklist manuelle du Task 27 ; ce n'est pas un test automatisé.

- [ ] **Step 4: Commit**

```bash
git add pages/carte.vue
git commit -m "feat: wire map component into Carte page"
```

---

## Task 23: Icônes de l'application

**Files:**
- Create: `icons/icon.svg`
- Create: `scripts/generate-icons.mjs`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png` (binaires)
- Modify: `package.json`

**Interfaces:**
- Produces: fichiers PNG consommés par Task 24 (manifest PWA).

- [ ] **Step 1: Installer `sharp`**

Run: `npm install -D sharp@^0.35`

- [ ] **Step 2: Créer `icons/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="256" fill="#E2572B" />
  <g fill="#1D6F8C">
    <circle cx="256" cy="176" r="54" />
    <circle cx="256" cy="336" r="54" />
    <circle cx="176" cy="256" r="54" />
    <circle cx="336" cy="256" r="54" />
    <circle cx="199" cy="199" r="54" />
    <circle cx="313" cy="199" r="54" />
    <circle cx="199" cy="313" r="54" />
    <circle cx="313" cy="313" r="54" />
  </g>
  <circle cx="256" cy="256" r="46" fill="#FFF8F0" />
</svg>
```

- [ ] **Step 3: Créer `scripts/generate-icons.mjs`**

```js
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const racine = join(__dirname, '..')
const svgSource = join(racine, 'icons', 'icon.svg')
const dossierSortie = join(racine, 'public', 'icons')

const tailles = [
  { fichier: 'icon-192.png', taille: 192, fond: null },
  { fichier: 'icon-512.png', taille: 512, fond: null },
  { fichier: 'apple-touch-icon.png', taille: 180, fond: '#E2572B' },
]

await mkdir(dossierSortie, { recursive: true })

for (const { fichier, taille, fond } of tailles) {
  let image = sharp(svgSource).resize(taille, taille)
  if (fond) {
    image = image.flatten({ background: fond })
  }
  await image.png().toFile(join(dossierSortie, fichier))
  console.log(`Généré : ${fichier} (${taille}x${taille})`)
}
```

- [ ] **Step 4: Ajouter le script `icons` dans `package.json`**

```json
{
  "scripts": {
    "icons": "node scripts/generate-icons.mjs"
  }
}
```

- [ ] **Step 5: Générer les icônes**

Run: `npm run icons`
Expected: 3 fichiers générés, listés dans la sortie.

- [ ] **Step 6: Vérifier les dimensions**

```bash
node -e "
import('sharp').then(async ({ default: sharp }) => {
  const attendues = [['public/icons/icon-192.png',192],['public/icons/icon-512.png',512],['public/icons/apple-touch-icon.png',180]]
  for (const [fichier, taille] of attendues) {
    const meta = await sharp(fichier).metadata()
    if (meta.width !== taille || meta.height !== taille) {
      throw new Error('Taille incorrecte pour ' + fichier + ': ' + meta.width + 'x' + meta.height)
    }
    console.log(fichier, meta.width + 'x' + meta.height, 'OK')
  }
})
"
```

Expected: les 3 lignes se terminent par `OK`.

- [ ] **Step 7: Commit**

```bash
git add icons/icon.svg scripts/generate-icons.mjs public/icons package.json package-lock.json
git commit -m "feat: add app icons and generation script"
```

---

## Task 24: Configuration PWA (`@vite-pwa/nuxt`)

**Files:**
- Modify: `nuxt.config.ts`

**Interfaces:**
- Consumes: icônes de Task 23, `.pmtiles` de Task 19.
- Produces: `manifest.webmanifest` et service worker générés à `nuxt generate`.

- [ ] **Step 1: Installer `@vite-pwa/nuxt`**

Run: `npm install -D @vite-pwa/nuxt@^1`

- [ ] **Step 2: Mettre à jour `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  compatibilityDate: '2026-09-17',
  modules: ['@nuxt/eslint', '@vite-pwa/nuxt'],
  app: {
    head: {
      link: [{ rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' }],
      meta: [{ name: 'theme-color', content: '#E2572B' }],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Laulau & Coco',
      short_name: 'L&C',
      description: 'Guide de voyage hors ligne pour notre séjour à Séville.',
      display: 'standalone',
      theme_color: '#E2572B',
      background_color: '#FFF8F0',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,pbf}'],
      runtimeCaching: [
        {
          urlPattern: /\/seville\.pmtiles$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'map',
            rangeRequests: true,
            cacheableResponse: { statuses: [200] },
          },
        },
      ],
    },
  },
})
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `grep -q "Laulau & Coco" .output/public/manifest.webmanifest && echo OK`
Expected: `OK`

Run: `test -f .output/public/sw.js && grep -c "seville" .output/public/sw.js`
Expected: un nombre >= 1.

Run: `grep -q "apple-touch-icon" .output/public/index.html && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add nuxt.config.ts package.json package-lock.json
git commit -m "feat: configure PWA manifest and offline caching"
```

---

## Task 25: Stockage persistant au démarrage

**Files:**
- Create: `composables/useStockagePersistant.ts`
- Test: `tests/composables/useStockagePersistant.test.ts`
- Create: `plugins/stockage-persistant.client.ts`

**Interfaces:**
- Produces: `demanderStockagePersistant(): Promise<boolean>`, appelée automatiquement au démarrage de l'app via un plugin Nuxt côté client.

- [ ] **Step 1: Écrire le test (échoue, le fichier n'existe pas)**

```ts
// tests/composables/useStockagePersistant.test.ts
import { describe, it, expect, vi } from 'vitest'
import { demanderStockagePersistant } from '../../composables/useStockagePersistant'

describe('demanderStockagePersistant', () => {
  it('appelle navigator.storage.persist et retourne son résultat', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('navigator', { storage: { persist } })

    const resultat = await demanderStockagePersistant()

    expect(persist).toHaveBeenCalled()
    expect(resultat).toBe(true)
    vi.unstubAllGlobals()
  })

  it("retourne false si l'API n'est pas disponible", async () => {
    vi.stubGlobal('navigator', {})
    const resultat = await demanderStockagePersistant()
    expect(resultat).toBe(false)
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 2: Run test, vérifier l'échec**

Run: `npx vitest run tests/composables/useStockagePersistant.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter `composables/useStockagePersistant.ts`**

```ts
export async function demanderStockagePersistant(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false
  }
  return navigator.storage.persist()
}
```

- [ ] **Step 4: Run test, vérifier le succès**

Run: `npx vitest run tests/composables/useStockagePersistant.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Créer `plugins/stockage-persistant.client.ts`**

```ts
export default defineNuxtPlugin(() => {
  demanderStockagePersistant()
})
```

- [ ] **Step 6: Vérifier le build**

Run: `npm run generate`
Expected: se termine sans erreur.

- [ ] **Step 7: Commit**

```bash
git add composables/useStockagePersistant.ts tests/composables/useStockagePersistant.test.ts plugins/stockage-persistant.client.ts
git commit -m "feat: request persistent storage on startup"
```

---

## Task 26: Configuration de déploiement Vercel

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Aucune interface de code — configuration de build/déploiement uniquement.

- [ ] **Step 1: Créer `vercel.json`**

```json
{
  "buildCommand": "nuxt generate",
  "outputDirectory": ".output/public",
  "headers": [
    {
      "source": "/seville.pmtiles",
      "headers": [{ "key": "Accept-Ranges", "value": "bytes" }]
    }
  ]
}
```

- [ ] **Step 2: Vérifier que le build statique complet est cohérent avec cette configuration**

Run: `npm run generate`
Expected: se termine sans erreur.

Run: `test -f .output/public/seville.pmtiles && test -f .output/public/manifest.webmanifest && test -f .output/public/sw.js && echo OK`
Expected: `OK`

Note : le déploiement effectif sur Vercel (connexion du compte/dépôt, `vercel --prod`) est une action que l'utilisateur effectue lui-même — voir le README (Task 27) pour la marche à suivre. Elle n'est pas exécutée dans le cadre de ce plan.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel static deployment configuration"
```

---

## Task 27: README, checklist de départ et vérification finale

**Files:**
- Create: `README.md`

**Interfaces:**
- Aucune — documentation uniquement.

- [ ] **Step 1: Créer `README.md`**

```markdown
# Laulau & Coco — guide de voyage à Séville

App PWA hors ligne pour notre séjour à Séville. Tout le contenu (lieux, événements,
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
3. Une fois déployé, vérifier que `seville.pmtiles` supporte les requêtes par plage :
   `curl -I -H "Range: bytes=0-1023" https://<votre-domaine>/seville.pmtiles`
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
```

- [ ] **Step 2: Vérification finale complète**

Run: `npm run typecheck`
Expected: aucune erreur.

Run: `npm run lint`
Expected: aucune erreur.

Run: `npm test`
Expected: tous les tests passent.

Run: `npm run generate`
Expected: se termine sans erreur ; `.output/public` contient `index.html`, `carte/index.html`, `a-venir/index.html`, `guide/index.html`, `messages/index.html`, `phrases/index.html`, `seville.pmtiles`, `manifest.webmanifest`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png`, `style/fonts/`, `style/sprites/`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with customization guide and pre-departure checklist"
```
