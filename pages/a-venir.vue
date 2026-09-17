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
