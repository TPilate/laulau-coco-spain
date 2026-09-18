<script setup lang="ts">
import { lieux } from '~/data/content'
import type { Categorie } from '~/data/content'
import { CATEGORIES } from '~/data/categories'

const { demanderFocus } = useMapFocus()

function infosCategorie(categorie: Categorie) {
  return CATEGORIES[categorie]
}

const categories = [...new Set(lieux.map((l) => l.categorie))].map((cat) => ({
  cle: cat,
  label: infosCategorie(cat).label,
}))

const recherche = ref('')
const catActive = ref('Tout')
const selectionneeId = ref<string | null>(null)

const spotsFiltres = computed(() => {
  const q = recherche.value.trim().toLowerCase()
  return lieux
    .filter(
      (l) =>
        (catActive.value === 'Tout' || infosCategorie(l.categorie).label === catActive.value) &&
        (!q || l.nom.toLowerCase().includes(q) || (l.mot ?? '').toLowerCase().includes(q)),
    )
    .map((l) => ({
      id: l.id,
      nom: l.nom,
      categorieLabel: infosCategorie(l.categorie).label,
      tint: infosCategorie(l.categorie).tint,
      teinte: infosCategorie(l.categorie).teinte,
      tag: infosCategorie(l.categorie).tag,
    }))
})

const selection = computed(() => {
  const l = lieux.find((lieu) => lieu.id === selectionneeId.value)
  if (!l) return null
  return {
    nom: l.nom,
    mot: l.mot ?? '',
    categorieLabel: infosCategorie(l.categorie).label,
    coord: `${l.lat.toFixed(4)}, ${l.lng.toFixed(4)}`,
    itineraireHref: `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`,
  }
})

// Depuis la liste ou les puces : on demande à la carte de recentrer sur le lieu.
// La carte confirmera via l'événement `selection` (voir plus bas), donc on ne
// duplique pas l'affectation ici pour éviter un aller-retour infini.
function selectionnerDepuisListe(id: string): void {
  demanderFocus(id)
}

// Depuis un clic direct sur un marqueur de la carte, ou en confirmation d'un
// `demanderFocus` : on ne fait que refléter la sélection, sans redemander de focus.
function selectionnerDepuisCarte(id: string): void {
  selectionneeId.value = id
}

function effacerSelection(): void {
  selectionneeId.value = null
}
</script>

<template>
  <div class="page">
    <div class="tete-carte">
      <div>
        <p class="page-eyebrow">Séville · hors ligne prêt</p>
        <h1>Carte</h1>
      </div>
      <NuxtLink to="/urgence" class="bouton-sos">SOS</NuxtLink>
    </div>

    <div class="boite-carte">
      <MapaSeville :lieu-actif-id="selectionneeId" @selection="selectionnerDepuisCarte" />

      <div class="barre-recherche">
        <span class="barre-recherche-point" />
        <input
          v-model="recherche"
          type="text"
          placeholder="Chercher un lieu…"
          aria-label="Chercher un lieu"
        >
      </div>
    </div>

    <div v-if="selection" class="carte-selection verre">
      <div class="carte-selection-tete">
        <div class="carte-selection-info">
          <p class="page-eyebrow">{{ selection.categorieLabel }}</p>
          <h2 class="carte-selection-nom">{{ selection.nom }}</h2>
        </div>
        <button type="button" class="bouton-fermer" aria-label="Fermer" @click="effacerSelection">✕</button>
      </div>
      <p v-if="selection.mot" class="carte-selection-mot">{{ selection.mot }}</p>
      <div class="carte-selection-actions">
        <a
          class="bouton-plein carte-selection-itineraire"
          :href="selection.itineraireHref"
          target="_blank"
          rel="noopener"
        >
          Itinéraire
        </a>
        <span class="carte-selection-coord">{{ selection.coord }}</span>
      </div>
    </div>

    <div class="feuille-lieux">
      <p class="page-eyebrow compteur">
        {{ spotsFiltres.length }} {{ spotsFiltres.length > 1 ? 'lieux repérés' : 'lieu repéré' }}
      </p>

      <div class="puces-scroll">
        <button
          type="button"
          class="puce"
          :class="{ actif: catActive === 'Tout' }"
          @click="catActive = 'Tout'"
        >
          Tout
        </button>
        <button
          v-for="cat in categories"
          :key="cat.cle"
          type="button"
          class="puce"
          :class="{ actif: catActive === cat.label }"
          @click="catActive = cat.label"
        >
          {{ cat.label }}
        </button>
      </div>

      <ul class="liste-spots">
        <li
          v-for="spot in spotsFiltres"
          :key="spot.id"
          class="spot"
          :class="{ actif: selectionneeId === spot.id }"
          @click="selectionnerDepuisListe(spot.id)"
        >
          <div class="spot-tag" :style="{ background: spot.tint, color: spot.teinte }">
            <span>{{ spot.tag }}</span>
          </div>
          <div class="spot-texte">
            <p class="spot-nom">{{ spot.nom }}</p>
            <p class="spot-categorie">{{ spot.categorieLabel }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tete-carte {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.bouton-sos {
  flex: none;
  padding: 11px 12px;
  border-radius: 10px;
  background: var(--ink);
  box-shadow: none;
  border: none;
  font: 700 10.5px/1 var(--font-display);
  letter-spacing: 0.08em;
  color: #fff;
}

.bouton-sos:hover {
  background: #000;
  color: #fff;
}

.boite-carte {
  position: relative;
  height: 260px;
  border-radius: 22px;
  overflow: hidden;
  background: #e7ebe4;
}

.barre-recherche {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 14px rgba(40, 35, 60, 0.16);
}

.barre-recherche-point {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(27, 27, 31, 0.4);
  flex: none;
}

.barre-recherche input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: 400 13.5px/1 var(--font-sans);
  color: var(--ink);
}

.carte-selection {
  margin-top: 14px;
  padding: 18px;
}

.carte-selection-tete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.carte-selection-info {
  min-width: 0;
}

.carte-selection-nom {
  display: block;
  margin: 9px 0 0;
  font: 700 21px/1.2 var(--font-display);
  letter-spacing: -0.01em;
  text-transform: none;
  color: var(--ink);
}

.bouton-fermer {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text);
  font: 500 14px/1 var(--font-sans);
  padding: 0;
}

.carte-selection-mot {
  margin: 10px 0 0;
  font: 400 13px/1.45 var(--font-sans);
  color: var(--text-body);
  text-wrap: pretty;
}

.carte-selection-actions {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 14px;
}

.carte-selection-itineraire {
  flex: 1;
}

.carte-selection-coord {
  flex: none;
  padding: 13px 15px;
  border-radius: 11px;
  background: var(--bg);
  font: 500 12px/1 var(--font-mono);
  color: var(--ink);
}

.feuille-lieux {
  margin-top: 18px;
  background: #fff;
  border-radius: 22px;
  padding: 18px 18px 6px;
  box-shadow: var(--card-shadow);
}

.compteur {
  margin: 0 0 14px;
}

.liste-spots {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 12px;
}

.spot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
  border-radius: 16px;
  transition: box-shadow 0.2s ease;
}

.spot.actif {
  box-shadow: 0 0 0 2px var(--ink);
}

.spot-tag {
  flex: none;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spot-tag span {
  font: 700 11px/1 var(--font-display);
}

.spot-texte {
  flex: 1;
  min-width: 0;
}

.spot-nom {
  margin: 0;
  font: 700 15px/1.2 var(--font-display);
  color: var(--ink);
}

.spot-categorie {
  margin: 3px 0 0;
  font: 400 12px/1.35 var(--font-sans);
  color: var(--text);
}
</style>
