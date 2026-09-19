<script setup lang="ts">
// registerType est en 'prompt' (pas 'autoUpdate') : sans ce bandeau, une nouvelle version
// resterait téléchargée en arrière-plan sans jamais être appliquée, l'app restant bloquée
// sur l'ancien Service Worker jusqu'à une réinstallation manuelle.
const pwa = usePWA()

function appliquerMiseAJour(): void {
  pwa?.updateServiceWorker(true)
}
</script>

<template>
  <p v-if="pwa?.needRefresh" class="bandeau-maj">
    Nouvelle version disponible —
    <button type="button" class="bandeau-maj-bouton" @click="appliquerMiseAJour">Mettre à jour</button>
  </p>
</template>

<style scoped>
.bandeau-maj {
  position: relative;
  z-index: 2;
  margin: 0 auto;
  max-width: 480px;
  padding: 10px 20px;
  background: var(--ink);
  color: #fff;
  font: 500 11px/1.4 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
}

.bandeau-maj-bouton {
  border: none;
  background: none;
  padding: 0;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>
