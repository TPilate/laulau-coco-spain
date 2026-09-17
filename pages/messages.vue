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
