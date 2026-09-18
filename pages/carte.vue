<script setup lang="ts">
import { lieux } from '~/data/content'
import type { Categorie } from '~/data/content'

const { demanderFocus } = useMapFocus()

const CAT_META: Record<Categorie, { label: string; tint: string; tag: string }> = {
  'a-voir': { label: 'À voir', tint: '#E6D3EC', tag: 'AVO' },
  barrio: { label: 'Quartiers', tint: '#C9D8F0', tag: 'QUA' },
  resto: { label: 'Restos', tint: '#FAD7C4', tag: 'RES' },
  cafe: { label: 'Cafés', tint: '#FBD8A5', tag: 'CAF' },
  autre: { label: 'Autres', tint: '#CFE3D8', tag: 'AUT' },
  plage: { label: 'Plages', tint: '#C9E4E7', tag: 'PLA' },
  aeroport: { label: 'Aéroport', tint: '#E1EBF3', tag: 'AER' },
}

function infosCategorie(categorie: Categorie) {
  return CAT_META[categorie]
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
      <MapaSeville @selection="selectionnerDepuisCarte" />

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

    <p class="page-eyebrow compteur">
      {{ spotsFiltres.length }} {{ spotsFiltres.length > 1 ? 'lieux' : 'lieu' }}
    </p>

    <ul class="liste-spots">
      <li
        v-for="spot in spotsFiltres"
        :key="spot.id"
        class="spot verre"
        :class="{ actif: selectionneeId === spot.id }"
        @click="selectionnerDepuisListe(spot.id)"
      >
        <div class="spot-tag" :style="{ background: spot.tint }">
          <span>{{ spot.tag }}</span>
        </div>
        <div class="spot-texte">
          <p class="spot-nom">{{ spot.nom }}</p>
          <p class="spot-categorie">{{ spot.categorieLabel }}</p>
        </div>
      </li>
    </ul>
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
  padding: 12px 15px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(140, 60, 40, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  font: 700 11px/1 var(--font-sans);
  letter-spacing: 0.08em;
  color: var(--accent);
}

.bouton-sos:hover {
  background: rgba(255, 255, 255, 0.78);
  color: var(--accent);
}

.boite-carte {
  position: relative;
  height: 262px;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 14px 40px -12px rgba(90, 58, 44, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  background: #e9efea;
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
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 24px rgba(90, 58, 44, 0.16), inset 0 1px 0 rgba(255, 255, 255, 1);
}

.barre-recherche-point {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(58, 43, 38, 0.45);
  flex: none;
}

.barre-recherche input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: 400 14px/1.2 var(--font-sans);
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
  margin: 8px 0 0;
  font: 400 23px/1.15 var(--font-serif);
  letter-spacing: normal;
  color: var(--ink);
  text-transform: none;
}

.bouton-fermer {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(58, 43, 38, 0.07);
  color: var(--text);
  font: 500 14px/1 var(--font-sans);
  padding: 0;
}

.carte-selection-mot {
  margin: 10px 0 0;
  font: 400 13.5px/1.5 var(--font-sans);
  color: var(--ink-soft);
  text-wrap: pretty;
}

.carte-selection-actions {
  display: flex;
  gap: 9px;
  margin-top: 16px;
}

.carte-selection-itineraire {
  flex: 1;
}

.carte-selection-coord {
  flex: none;
  padding: 13px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.9);
  font: 600 13px/1 var(--font-mono);
  color: var(--ink);
}

.compteur {
  margin: 22px 0 10px;
}

.liste-spots {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.spot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  border-radius: 26px;
  transition: background 0.2s ease;
}

.spot.actif {
  background: rgba(255, 255, 255, 0.82) !important;
}

.spot-tag {
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.spot-tag span {
  font: 500 9px/1 var(--font-mono);
  color: var(--ink-soft);
}

.spot-texte {
  flex: 1;
  min-width: 0;
}

.spot-nom {
  margin: 0;
  font: 600 15px/1.2 var(--font-sans);
  color: var(--ink);
}

.spot-categorie {
  margin: 4px 0 0;
  font: 400 12.5px/1.35 var(--font-sans);
  color: var(--text);
}
</style>
