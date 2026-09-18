<script setup lang="ts">
import { estOngletActif } from '~/utils/navigation'

const route = useRoute()

const onglets = [
  { chemin: '/carte', label: 'Carte', icone: 'carte' },
  { chemin: '/a-venir', label: 'À venir', icone: 'venir' },
  { chemin: '/guide', label: 'Guide', icone: 'guide' },
  { chemin: '/phrases', label: 'Phrases', icone: 'phrases' },
  { chemin: '/checklist', label: 'Liste', icone: 'liste' },
] as const
</script>

<template>
  <div class="barre-conteneur">
    <nav class="barre-onglets">
      <NuxtLink
        v-for="onglet in onglets"
        :key="onglet.chemin"
        :to="onglet.chemin"
        class="onglet"
        :class="{ actif: estOngletActif(route.path, onglet.chemin) }"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <template v-if="onglet.icone === 'carte'">
            <rect x="4" y="4" width="12" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.7" />
            <circle cx="10" cy="10" r="2.2" fill="currentColor" />
          </template>
          <template v-else-if="onglet.icone === 'venir'">
            <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7" />
            <rect x="9.2" y="5.6" width="1.6" height="5" rx="0.8" fill="currentColor" />
            <rect x="9.2" y="9.4" width="4.4" height="1.6" rx="0.8" fill="currentColor" />
          </template>
          <template v-else-if="onglet.icone === 'guide'">
            <circle cx="10" cy="8.4" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7" />
            <circle cx="10" cy="8.4" r="1.6" fill="currentColor" />
            <rect x="9.2" y="12.4" width="1.6" height="4" rx="0.8" fill="currentColor" />
          </template>
          <template v-else-if="onglet.icone === 'phrases'">
            <circle cx="8" cy="9" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7" />
            <circle cx="12.6" cy="11.6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7" />
          </template>
          <template v-else>
            <rect x="4" y="4" width="12" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7" />
            <rect x="7" y="9.2" width="6" height="1.8" rx="0.9" fill="currentColor" />
          </template>
        </svg>
        <span class="onglet-label">{{ onglet.label }}</span>
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
  padding: 0 14px calc(12px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
}

.barre-onglets {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  width: 100%;
  max-width: 440px;
  padding: 9px 10px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.56);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.88);
  box-shadow: 0 -2px 30px rgba(90, 58, 44, 0.14), 0 14px 34px -14px rgba(90, 58, 44, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.onglet {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 4px;
  border-radius: 22px;
  color: var(--text-mono);
  text-decoration: none;
  transition: background 0.3s ease, color 0.3s ease;
}

.onglet.actif {
  background: rgba(255, 255, 255, 0.75);
  color: var(--ink);
}

.onglet-label {
  font: 600 9.5px/1 var(--font-sans);
}
</style>
