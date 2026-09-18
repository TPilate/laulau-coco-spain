<script setup lang="ts">
const { items, ajouterItem, basculerItem, supprimerItem } = useChecklist()
const nouvelItem = ref('')

function ajouter(): void {
  ajouterItem(nouvelItem.value)
  nouvelItem.value = ''
}

const doneCount = computed(() => items.value.filter((item) => item.coche).length)
const pourcentage = computed(() =>
  items.value.length ? Math.round((doneCount.value / items.value.length) * 100) : 0,
)
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
      <div class="carte-progres verre-forte">
        <div class="progres-tete">
          <p class="progres-pct">{{ pourcentage }}%</p>
          <p class="progres-label">{{ doneCount }} sur {{ items.length }} cochés</p>
        </div>
        <div class="progres-barre">
          <div class="progres-remplissage" :style="{ width: pourcentage + '%' }" />
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
  padding: 14px 17px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 6px 20px -10px rgba(90, 58, 44, 0.2);
}

.champ-verre input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: 400 14.5px/1.2 var(--font-sans);
  color: var(--ink);
}

.carte-progres {
  padding: 20px;
}

.progres-tete {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.progres-pct {
  margin: 0;
  font: 400 30px/1 var(--font-serif);
  color: var(--ink);
}

.progres-label {
  margin: 0;
  font: 400 12.5px/1 var(--font-sans);
  color: var(--text);
}

.progres-barre {
  margin-top: 13px;
  height: 10px;
  border-radius: 6px;
  background: rgba(58, 43, 38, 0.08);
  overflow: hidden;
}

.progres-remplissage {
  height: 100%;
  border-radius: 6px;
  transition: width 0.45s cubic-bezier(0.22, 1, 0.3, 1);
  background: linear-gradient(90deg, var(--lilac), var(--green));
}

.liste-checklist {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 16px;
}

.item-checklist {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(20px) saturate(175%);
  -webkit-backdrop-filter: blur(20px) saturate(175%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 6px 20px -10px rgba(90, 58, 44, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.item-checklist.coche {
  background: rgba(255, 255, 255, 0.34);
}

.case {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.72);
  border: 1.5px solid rgba(58, 43, 38, 0.2);
}

.case.cochee {
  background: rgba(58, 43, 38, 0.88);
  border-color: rgba(58, 43, 38, 0.88);
}

.case-point {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: transparent;
}

.case.cochee .case-point {
  background: #fdf6f1;
}

.item-texte {
  flex: 1;
  margin: 0;
  cursor: pointer;
  font: 500 14.5px/1.35 var(--font-sans);
  color: var(--ink);
}

.item-texte.coche {
  color: #7a6a62;
  text-decoration: line-through;
}

.supprimer {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(58, 43, 38, 0.06);
  color: var(--text);
  font: 500 13px/1 var(--font-sans);
  padding: 0;
}

.etat-vide {
  padding: 26px 20px;
  border-radius: 28px;
  text-align: center;
  background: rgba(255, 255, 255, 0.45);
  border: 1px dashed rgba(58, 43, 38, 0.18);
}

.etat-vide p {
  margin: 0;
  font: 400 14px/1.5 var(--font-sans);
  color: var(--text);
  text-wrap: pretty;
}
</style>
