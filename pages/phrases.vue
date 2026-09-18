<script setup lang="ts">
import { phrases } from '~/data/content'

const { estFavori, basculerFavori } = useFavorisPhrases()

const themes: string[] = []
phrases.forEach((p) => {
  if (!themes.includes(p.theme)) themes.push(p.theme)
})

const themeActif = ref(themes[0])

const phrasesDuTheme = computed(() => phrases.filter((p) => p.theme === themeActif.value))
</script>

<template>
  <div class="page">
    <p class="page-eyebrow">Français → Espagnol</p>
    <h1>Phrases</h1>

    <div class="puces-scroll">
      <button
        v-for="theme in themes"
        :key="theme"
        type="button"
        class="puce"
        :class="{ actif: theme === themeActif }"
        @click="themeActif = theme"
      >
        {{ theme }}
      </button>
    </div>

    <ul>
      <li v-for="phrase in phrasesDuTheme" :key="`${phrase.theme}-${phrase.es}`" class="carte-phrase verre">
        <div class="carte-phrase-tete">
          <p class="fr">{{ phrase.fr }}</p>
          <button
            type="button"
            class="favori"
            :class="{ actif: estFavori(phrase.es) }"
            :aria-label="estFavori(phrase.es) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            @click="basculerFavori(phrase.es)"
          >
            <span class="favori-losange" />
          </button>
        </div>
        <p class="es">{{ phrase.es }}</p>
        <p class="prononciation">{{ phrase.prononciation }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.carte-phrase {
  padding: 18px;
}

.carte-phrase-tete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.fr {
  margin: 0;
  font: 400 12.5px/1.4 var(--font-sans);
  color: var(--text);
}

.es {
  margin: 9px 0 0;
  font: 400 22px/1.22 var(--font-serif);
  color: var(--ink);
}

.prononciation {
  margin: 12px 0 0;
  font: 400 11.5px/1.2 var(--font-mono);
}

.favori {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.85);
  padding: 0;
}

.favori.actif {
  background: var(--lilac);
}

.favori-losange {
  width: 9px;
  height: 9px;
  transform: rotate(45deg);
  border-radius: 2px;
  background: rgba(58, 43, 38, 0.28);
}

.favori.actif .favori-losange {
  background: var(--lilac-deep);
}
</style>
