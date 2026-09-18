<script setup lang="ts">
import { evenements } from '~/data/content'

const { items, ajouterItem, basculerItem, supprimerItem } = useChecklist()
const nouvelItem = ref('')

function ajouter(): void {
  ajouterItem(nouvelItem.value)
  nouvelItem.value = ''
}

const doneCount = computed(() => items.value.filter((item) => item.coche).length)

const premierEvenement = [...evenements].sort(
  (a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime(),
)[0]

const joursAvantDepart = computed(() => {
  if (!premierEvenement) return null
  const diff = new Date(premierEvenement.debut).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
})
</script>

<template>
  <div class="page">
    <p class="page-eyebrow">Enregistrée sur l’appareil</p>
    <h1>Checklist</h1>

    <form class="formulaire-checklist" @submit.prevent="ajouter">
      <div class="champ-verre">
        <input v-model="nouvelItem" type="text" placeholder="Ajouter un élément…" aria-label="Nouvel élément">
      </div>
      <button type="submit" class="bouton-plein">Ajouter</button>
    </form>

    <template v-if="items.length > 0">
      <div class="stats-checklist">
        <div class="stat-tuile stat-tuile--sombre">
          <p class="stat-valeur">{{ doneCount }} / {{ items.length }}</p>
          <p class="stat-label">coché avant le départ</p>
        </div>
        <div v-if="joursAvantDepart !== null" class="stat-tuile stat-tuile--claire">
          <p class="stat-valeur">{{ joursAvantDepart }} j</p>
          <p class="stat-label">avant le début du séjour</p>
        </div>
      </div>

      <ul class="liste-checklist">
        <li v-for="item in items" :key="item.id" class="item-checklist" :class="{ coche: item.coche }">
          <span class="case" :class="{ cochee: item.coche }" @click="basculerItem(item.id)">
            <span class="case-point" />
          </span>
          <p class="item-texte" :class="{ coche: item.coche }" @click="basculerItem(item.id)">{{ item.texte }}</p>
          <button type="button" class="supprimer" aria-label="Supprimer" @click="supprimerItem(item.id)">✕</button>
        </li>
      </ul>
    </template>

    <div v-else class="etat-vide">
      <p>Rien pour l’instant. Ajoute ta liste ci-dessus, elle reste disponible hors connexion.</p>
    </div>
  </div>
</template>

<style scoped>
.formulaire-checklist {
  display: flex;
  gap: 9px;
  margin-bottom: 18px;
}

.champ-verre {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 14px;
  background: #fff;
  box-shadow: var(--card-shadow);
}

.champ-verre input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: 400 13.5px/1 var(--font-sans);
  color: var(--ink);
}

.stats-checklist {
  display: flex;
  gap: 10px;
}

.stat-tuile {
  flex: 1;
  padding: 16px;
  border-radius: 20px;
}

.stat-tuile--sombre {
  background: var(--ink);
  color: #fff;
}

.stat-tuile--claire {
  background: var(--lilac-chip);
  color: var(--lilac-deep);
}

.stat-valeur {
  margin: 0;
  font: 700 28px/1 var(--font-display);
}

.stat-label {
  margin: 7px 0 0;
  font: 400 11.5px/1.3 var(--font-sans);
}

.stat-tuile--sombre .stat-label {
  color: #c3bfd2;
}

.stat-tuile--claire .stat-label {
  color: var(--lilac-deep);
}

.liste-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.item-checklist {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--card-shadow);
}

.item-checklist.coche {
  box-shadow: none;
  background: rgba(255, 255, 255, 0.6);
}

.case {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: none;
  border: 2px solid rgba(27, 27, 31, 0.25);
  box-sizing: border-box;
}

.case.cochee {
  background: var(--ink);
  border-color: var(--ink);
}

.case-point {
  display: none;
}

.item-texte {
  flex: 1;
  margin: 0;
  cursor: pointer;
  font: 500 14px/1.25 var(--font-display);
  color: var(--ink);
}

.item-texte.coche {
  color: #8f8ba0;
  text-decoration: line-through;
}

.supprimer {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text);
  font: 500 12px/1 var(--font-sans);
  padding: 0;
}

.etat-vide {
  padding: 26px 20px;
  border-radius: 22px;
  text-align: center;
  background: #fff;
  box-shadow: var(--card-shadow);
}

.etat-vide p {
  margin: 0;
  font: 400 14px/1.5 var(--font-sans);
  color: var(--text);
  text-wrap: pretty;
}
</style>
