<script setup lang="ts">
import { lieux } from '~/data/content'
import type { Categorie } from '~/data/content'
import { CATEGORIES } from '~/data/categories'

const { demanderFocus } = useMapFocus()
const { pret: cartePrete, telechargementEnCours, assurerCarteEnCache } = useMapCache()
const erreurCache = ref(false)

onMounted(() => {
  assurerCarteEnCache().catch(() => {
    erreurCache.value = true
  })
})

const groupes = groupLieuxParCategorie(lieux)

async function voirSurCarte(lieuId: string): Promise<void> {
  demanderFocus(lieuId)
  await navigateTo('/carte')
}
</script>

<template>
  <div class="page">
    <p class="page-eyebrow">{{ lieux.length }} lieux repérés</p>
    <h1>Guide</h1>

    <section class="bloc-hors-ligne">
      <h2 class="bloc-hors-ligne-eyebrow">Mode hors ligne</h2>
      <p class="hors-ligne-statut">
        {{
          cartePrete
            ? 'Carte téléchargée ✓ — prête pour le mode avion.'
            : erreurCache
              ? 'Hors ligne — reconnecte-toi une fois pour finir le téléchargement.'
              : telechargementEnCours
                ? 'Téléchargement de la carte en cours…'
                : 'Préparation de la carte…'
        }}
      </p>
      <ol class="hors-ligne-etapes">
        <li>
          Ouvre l'app une première fois en wifi ou en données, et attends que l'onglet
          <NuxtLink to="/carte">Carte</NuxtLink> affiche « Carte prête ✓ ».
        </li>
        <li>
          Ajoute l'app à l'écran d'accueil : sur iPhone (Safari), icône Partager puis
          « Sur l'écran d'accueil » ; sur Android (Chrome), menu ⋮ puis « Installer l'application ».
        </li>
        <li>Ouvre toujours l'app depuis son icône plutôt que depuis le navigateur.</li>
        <li>
          Avant de partir, teste en mode avion : carte, position, guide, phrases et checklist
          doivent tous s'afficher.
        </li>
      </ol>
    </section>

    <section v-for="(lieuxDeLaCategorie, categorie) in groupes" :key="categorie">
      <h2>{{ CATEGORIES[categorie as Categorie].label }}</h2>
      <ul>
        <li v-for="lieu in lieuxDeLaCategorie" :key="lieu.id" class="carte-lieu verre">
          <div class="carte-lieu-tete">
            <strong>{{ lieu.nom }}</strong>
            <span
              class="carte-lieu-tag"
              :style="{
                background: CATEGORIES[categorie as Categorie].tint,
                color: CATEGORIES[categorie as Categorie].teinte,
              }"
            >{{ CATEGORIES[categorie as Categorie].tag }}</span>
          </div>
          <p v-if="lieu.mot">{{ lieu.mot }}</p>
          <button type="button" class="bouton-verre" @click="voirSurCarte(lieu.id)">
            Voir sur la carte
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.bloc-hors-ligne {
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 22px;
  background: var(--ink);
  color: #fff;
}

.bloc-hors-ligne-eyebrow {
  margin: 0 0 10px;
  color: #b9b5cc;
}

.hors-ligne-statut {
  margin: 0 0 14px;
  font: 700 17px/1.3 var(--font-display);
  color: #fff;
}

.hors-ligne-etapes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  counter-reset: etape;
}

.hors-ligne-etapes li {
  display: flex;
  gap: 11px;
  font: 400 13px/1.45 var(--font-sans);
  color: #e7e5ef;
  text-wrap: pretty;
}

.hors-ligne-etapes li::before {
  counter-increment: etape;
  content: counter(etape);
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--lilac-chip);
  color: var(--lilac-deep);
  font: 700 11px/22px var(--font-display);
  text-align: center;
}

.hors-ligne-etapes a {
  color: #fff;
  font-weight: 600;
  text-decoration: underline;
}

.carte-lieu {
  padding: 16px;
}

.carte-lieu-tete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.carte-lieu strong {
  display: block;
  font: 700 16px/1.2 var(--font-display);
  color: var(--ink);
}

.carte-lieu-tag {
  flex: none;
  font: 700 9.5px/1 var(--font-display);
  letter-spacing: 0.08em;
  padding: 7px 9px;
  border-radius: 7px;
}

.carte-lieu p {
  margin: 7px 0 0;
  font: 400 13px/1.45 var(--font-sans);
  color: var(--text-body);
  text-wrap: pretty;
}

.carte-lieu .bouton-verre {
  margin-top: 13px;
}
</style>
