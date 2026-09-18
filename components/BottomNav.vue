<script setup lang="ts">
import { estOngletActif } from '~/utils/navigation'

const route = useRoute()

const onglets = [
  { chemin: '/carte', label: 'Carte' },
  { chemin: '/a-venir', label: 'À venir' },
  { chemin: '/guide', label: 'Guide' },
  { chemin: '/phrases', label: 'Phrases' },
  { chemin: '/checklist', label: 'Liste' },
] as const
</script>

<template>
  <div class="barre-conteneur">
    <nav class="barre-onglets">
      <NuxtLink v-for="onglet in onglets" :key="onglet.chemin" :to="onglet.chemin" class="onglet"
        :class="{ actif: estOngletActif(route.path, onglet.chemin) }">
        {{ onglet.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.barre-conteneur {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #fff;
  border-top: 1px solid rgba(40, 35, 60, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

.barre-onglets {
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 480px;
  margin: 0 auto;
  padding: 22px 10px;
}

.onglet {
  font: 500 11px/1 var(--font-display);
  color: var(--text);
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

.onglet.actif {
  font-weight: 700;
  color: #fff;
  background: var(--ink);
}
</style>
