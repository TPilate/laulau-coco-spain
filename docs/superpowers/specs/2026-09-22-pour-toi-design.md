# Page « Pour toi » — lettre d'amour en photos pour Laura

## Objectif

Laura n'aime pas se voir en photo. Cette page lui montre ses photos à travers les yeux
de Coco : chaque photo est accompagnée d'une phrase sur ce qu'il voit en elle. Elle
se termine sur la photo de sa story du jour (Plaza de España) et une lettre de fin.

Les légendes ne commentent jamais son corps ou sa silhouette : elles parlent de sa
lumière, son rire, sa force, et de ce que Coco ressent.

## Expérience

Page cachée `/pour-toi` dans l'app, absente de la navigation. Coco envoie le lien.

1. **Enveloppe** — écran plein : « Pour toi, Laura » + bouton « Ouvrir ». Au toucher,
   fondu vers la lettre.
2. **Ouverture** — texte d'introduction.
3. **Photos** — 14 photos en ordre chronologique, chacune apparaît en fondu au
   défilement (IntersectionObserver), coins arrondis, ombre douce, repère de date
   discret + légende en serif italique.
4. **Sommet** — photo de la story en pleine largeur + son texte.
5. **Lettre de fin** + signature « Coco ».

Pas de musique. Petits cœurs flottants discrets en fond (CSS). Toutes les animations
sont désactivées avec `prefers-reduced-motion: reduce`.

## Direction visuelle

Univers distinct du reste de l'app (pas de lavande, pas de BottomNav) :

- fond crème `#fbf6f1`, rose poudré `#f4dcd8`, texte bordeaux `#5a2a31`, accent or
  doux `#b8865b`
- titres et légendes : Cormorant Garamond italique (`@fontsource/cormorant-garamond`,
  latin + latin-ext, 400 et 400-italic), corps : DM Sans existant
- colonne centrée, largeur max ~560 px, gouttière 20 px sur mobile

## Architecture

| Fichier | Rôle |
|---|---|
| `scripts/preparer-photos-laura.mjs` | Convertit les originaux de `assets/laura/` → `public/laura/<nn>.webp` |
| `data/pour-toi.ts` | Tout le contenu : ouverture, photos (fichier, date, texte), sommet, fin, signature |
| `layouts/lettre.vue` | Layout minimal sans BottomNav ni OfflineBanner |
| `pages/pour-toi.vue` | La page : enveloppe, ouverture, photos, sommet, fin |
| `tests/pour-toi.test.ts` | Chaque photo référencée existe dans `public/laura/` ; textes non vides |

**Préparation des photos.** Le sharp pré-compilé lit les métadonnées HEIC mais ne
décode pas HEVC. Le script passe donc par `sips` (macOS) : HEIC/JPG → JPEG temporaire,
puis sharp `.rotate()` (orientation EXIF) → redimensionne à 1400 px sur le grand côté
→ WebP qualité 80. Sharp ne recopie pas les métadonnées : EXIF/GPS supprimés. Script
lancé à la main (`npm run photos-laura`), sorties commitées.

**Git.** `assets/laura/` ajouté au `.gitignore` : les originaux ne sont jamais
commités. Seuls les WebP allégés dans `public/laura/` le sont. (Repo public : choix
assumé par Coco, qui retirera les photos plus tard.)

**Hors ligne.** Ajouter `webp` aux `globPatterns` workbox dans `nuxt.config.ts`.

## Contenu (brouillon — à réécrire par Coco)

**Ouverture**
> Laura, tu m'as dit que tu n'aimais pas te voir en photo. Alors j'ai rassemblé
> celles que je préfère. Pas pour te dire que tu as tort, juste pour te montrer ce
> que moi je vois quand je te regarde.

**Photos**

| # | Source | Date | Légende |
|---|---|---|---|
| 01 | IMG_3590.HEIC | juin 2026 | Un cocktail, un biceps et ce petit air de défi. Tu es comme ça : jamais là où on t'attend. Et moi je craque à chaque fois. |
| 02 | 05A1561F-….JPG | juin 2026 | Nous deux dans un miroir. Regarde comme tu souris. C'est ce sourire-là que je vois quand je ferme les yeux. |
| 03 | IMG_3860.HEIC | août 2026 | Juste un café. Et pourtant ce regard par-dessus la tasse me fait encore quelque chose. |
| 04 | IMG_3869.HEIC | août 2026 | Tu es forte, Laura. Pas seulement là, sur cette machine. Partout. |
| 05 | IMG_3884.HEIC | août 2026 | Tu lis le menu avec un sérieux absolu. Je pourrais te regarder choisir ton plat pendant des heures. |
| 06 | IMG_3900.HEIC | août 2026 | Un vieux miroir d'hôtel, et moi qui essaie d'avoir l'air cool à côté de toi. Perdu d'avance. |
| 07 | IMG_3957.HEIC | août 2026 | Des milliers de poissons derrière toi, et c'est toi que tout le monde aurait dû regarder. |
| 08 | IMG_4039.HEIC | août 2026 | Cette lumière bleue, ce rouge à lèvres, ce sourire en coin. Tu n'as aucune idée de l'effet que tu fais. |
| 09 | IMG_4070.HEIC | août 2026 | Ma photo préférée de nous deux. Ton rire est la plus belle chose que je connaisse. |
| 10 | IMG_4073.HEIC | août 2026 | Et celle-là aussi, parce que tu es la seule personne avec qui je suis aussi bête et aussi heureux. |
| 11 | 9CC28D5F-….JPG | août 2026 | Des fleurs dans les bras et les yeux qui brillent. Tu mérites des bouquets tous les jours. |
| 12 | IMG_4163.HEIC | septembre 2026 | Le soleil, le ciel bleu, et toi qui brilles encore plus fort. |
| 13 | IMG_4286.HEIC | septembre 2026 | Un verre de vin, une lumière douce, ton profil. Je ne me lasse pas de ton visage. |
| 14 | IMG_4407.HEIC | septembre 2026 | Tu caches ton rire derrière ta main, mais tes yeux te trahissent. C'est ça que j'aime : quand tu es toi, sans filtre. |

**Sommet** — `lauraajd.jpg`, repère « aujourd'hui »
> Et puis aujourd'hui, j'ai vu ta story. Toi, face à Séville, les cheveux dans le
> soleil. À 1300 km, j'ai eu le souffle coupé. Séville a bien de la chance de t'avoir.

**Lettre de fin**
> Tu vois ce que je vois, maintenant ? Une fille drôle, forte, lumineuse, qui rit trop
> fort et qui fait des grimaces dans mes selfies. Une fille que je trouve belle sur
> chaque photo, même celles que tu voudrais effacer. Surtout celles-là, parce que
> c'est toi, pour de vrai.
>
> Il y a 1300 km entre nous ce soir, mais pas une minute où je ne pense pas à toi.
>
> Je t'aime.

**Signature** — Coco

## Vérifications

`npm run typecheck`, `npm run lint`, `npm test`, `npm run generate`, puis contrôle
visuel de `/pour-toi` en largeur mobile (375 px) : enveloppe, apparition des photos,
orientation correcte de chaque photo, aucun défilement horizontal.
