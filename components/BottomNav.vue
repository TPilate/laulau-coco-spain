<script setup lang="ts">
import { estOngletActif } from '~/utils/navigation'

const route = useRoute()

const onglets = [
  { chemin: '/carte', label: 'Carte', icone: '🗺️' },
  { chemin: '/a-venir', label: 'À venir', icone: '🕒' },
  { chemin: '/guide', label: 'Guide', icone: '📍' },
  { chemin: '/messages', label: 'Messages', icone: '💌' },
  { chemin: '/phrases', label: 'Phrases', icone: '💬' },
] as const
</script>

<template>
  <nav class="barre-onglets">
    <NuxtLink
      v-for="onglet in onglets"
      :key="onglet.chemin"
      :to="onglet.chemin"
      class="onglet"
      :class="{ actif: estOngletActif(route.path, onglet.chemin) }"
    >
      <span class="onglet-icone" aria-hidden="true">{{ onglet.icone }}</span>
      <span class="onglet-label">{{ onglet.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.barre-onglets {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: #fff8f0;
  border-top: 1px solid #e8d9c8;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 10;
}

.onglet {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  font-size: 0.7rem;
  color: #8a7b6c;
  text-decoration: none;
}

.onglet.actif {
  color: #e2572b;
  font-weight: 600;
}

.onglet-icone {
  font-size: 1.3rem;
}
</style>
