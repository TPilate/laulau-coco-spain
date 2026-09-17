<script setup lang="ts">
const { enLigne } = useEnLigne()
</script>

<template>
  <p v-if="!enLigne" class="bandeau-hors-ligne">Hors ligne — tout reste utilisable depuis le cache.</p>
</template>

<style scoped>
.bandeau-hors-ligne {
  margin: 0;
  padding: 6px 12px;
  background: #1d6f8c;
  color: #fff8f0;
  font-size: 0.8rem;
  text-align: center;
}
</style>
