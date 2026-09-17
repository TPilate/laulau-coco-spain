<script setup lang="ts">
import { phrases } from '~/data/content'

const groupes = groupPhrasesParTheme(phrases)
</script>

<template>
  <div class="page">
    <h1>Phrases</h1>
    <section v-for="(phrasesDuTheme, theme) in groupes" :key="theme">
      <h2>{{ theme }}</h2>
      <ul>
        <li v-for="(phrase, index) in phrasesDuTheme" :key="`${theme}-${index}`">
          <p class="fr">{{ phrase.fr }}</p>
          <p class="es">{{ phrase.es }}</p>
          <p class="prononciation">{{ phrase.prononciation }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
