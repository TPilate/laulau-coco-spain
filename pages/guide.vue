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
