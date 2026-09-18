<script setup lang="ts">
const { enLigne } = useEnLigne()
</script>

<template>
  <p v-if="!enLigne" class="bandeau-hors-ligne">Hors ligne — tout reste utilisable depuis le cache.</p>
</template>

<style scoped>
.bandeau-hors-ligne {
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
</style>
