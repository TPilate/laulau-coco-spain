<script setup lang="ts">
import { lieux } from '~/data/content'
import type { Categorie } from '~/data/content'

const { demanderFocus } = useMapFocus()
const { pret: cartePrete, telechargementEnCours, assurerCarteEnCache } = useMapCache()
const erreurCache = ref(false)

onMounted(() => {
  assurerCarteEnCache().catch(() => {
    erreurCache.value = true
  })
})

const groupes = groupLieuxParCategorie(lieux)

const libellesCategories: Record<Categorie, string> = {
  'a-voir': 'À voir',
  resto: 'Restos',
  cafe: 'Cafés',
  plage: 'Plages',
  autre: 'Autres',
  barrio: 'Quartiers',
  aeroport: 'Aéroport',
}

const teintesCategories: Record<Categorie, string> = {
  'a-voir': '#E6D3EC',
  barrio: '#C9D8F0',
  resto: '#FAD7C4',
  cafe: '#FBD8A5',
  autre: '#CFE3D8',
  plage: '#C9E4E7',
  aeroport: '#E1EBF3',
}

async function voirSurCarte(lieuId: string): Promise<void> {
  demanderFocus(lieuId)
  await navigateTo('/carte')
}
</script>

<template>
  <div class="page">
    <p class="page-eyebrow">{{ lieux.length }} lieux repérés</p>
    <h1>Guide</h1>

    <section class="bloc-hors-ligne verre-forte">
      <h2>Mode hors ligne</h2>
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
      <h2>
        <span class="pastille" :style="{ background: teintesCategories[categorie as Categorie] }" />
        {{ libellesCategories[categorie as Categorie] }}
      </h2>
      <ul>
        <li v-for="lieu in lieuxDeLaCategorie" :key="lieu.id" class="carte-lieu verre">
          <strong>{{ lieu.nom }}</strong>
          <p v-if="lieu.mot">{{ lieu.mot }}</p>
          <button
            type="button"
            class="bouton-verre"
            :style="{ background: teintesCategories[categorie as Categorie] }"
            @click="voirSurCarte(lieu.id)"
          >
            Voir sur la carte
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.bloc-hors-ligne {
  padding: 18px;
  margin-bottom: 24px;
}

.hors-ligne-statut {
  margin: 0 0 13px;
  font: 600 12.5px/1.4 var(--font-sans);
  color: var(--ink);
}

.hors-ligne-etapes {
  margin: 0;
  padding-left: 19px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font: 400 13px/1.5 var(--font-sans);
  color: var(--ink-soft);
}

.hors-ligne-etapes li {
  text-wrap: pretty;
}

.hors-ligne-etapes a {
  color: var(--accent);
  font-weight: 600;
}

.pastille {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  display: inline-block;
}

.carte-lieu {
  padding: 17px;
}

.carte-lieu strong {
  display: block;
  font: 600 15.5px/1.25 var(--font-sans);
  color: var(--ink);
}

.carte-lieu p {
  margin: 7px 0 0;
  font: 400 13px/1.5 var(--font-sans);
  color: var(--ink-soft);
  text-wrap: pretty;
}

.carte-lieu .bouton-verre {
  margin-top: 13px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: none;
}
</style>
