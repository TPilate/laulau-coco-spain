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
  margin: 12px auto 0;
  max-width: 440px;
  padding: 9px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 20px -10px rgba(90, 58, 44, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  color: var(--accent);
  font: 500 11.5px/1.4 var(--font-sans);
  text-align: center;
}
</style>
