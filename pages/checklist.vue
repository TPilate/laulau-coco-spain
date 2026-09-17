<script setup lang="ts">
const { items, ajouterItem, basculerItem, supprimerItem } = useChecklist()
const nouvelItem = ref('')

function ajouter(): void {
  ajouterItem(nouvelItem.value)
  nouvelItem.value = ''
}
</script>

<template>
  <div class="page">
    <h1>Checklist</h1>

    <form class="formulaire-checklist" @submit.prevent="ajouter">
      <input v-model="nouvelItem" type="text" placeholder="Ajouter un élément…" aria-label="Nouvel élément">
      <button type="submit">Ajouter</button>
    </form>

    <p v-if="items.length === 0" class="statut">Rien pour l'instant — ajoute ta liste ci-dessus.</p>
    <ul v-else>
      <li v-for="item in items" :key="item.id" class="item-checklist">
        <label>
          <input type="checkbox" :checked="item.coche" @change="basculerItem(item.id)">
          <span :class="{ coche: item.coche }">{{ item.texte }}</span>
        </label>
        <button type="button" class="supprimer" aria-label="Supprimer" @click="supprimerItem(item.id)">✕</button>
      </li>
    </ul>
  </div>
</template>
