<script setup lang="ts">
import { emergencyInformations } from '~/data/content'

</script>

<template>
  <div class="page">
    <h1>Urgences</h1>
    <section v-for="urgence in emergencyInformations" :key="urgence.id">
      <h2>{{ urgence.service }}</h2>
      <ul>
        <li>
          <p class="service">{{ urgence.service }}</p>
          <a class="numero" :href="'tel:' + urgence.numero">Cliquez pour appeler le {{ urgence.numero }}</a>
          <p class="usage">{{ urgence.usage }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
