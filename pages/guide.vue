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
