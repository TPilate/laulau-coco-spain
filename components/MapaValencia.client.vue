<script setup lang="ts">
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { lieux } from '~/data/content'

const conteneurCarte = ref<HTMLDivElement | null>(null)
let carte: maplibregl.Map | null = null
let marqueurPosition: maplibregl.Marker | null = null

const { mode, position, rechercheGpsEnCours, activerModeGps, definirPositionManuelle } = usePosition()
const { pret: cartePrete, telechargementEnCours, assurerCarteEnCache } = useMapCache()
const { consommerFocus } = useMapFocus()

const modeSelectionManuelle = ref(false)
const erreurCache = ref(false)

function centrerSur(lat: number, lng: number, zoom = 15): void {
  carte?.flyTo({ center: [lng, lat], zoom })
}

function recentrer(): void {
  if (position.value) {
    centrerSur(position.value.lat, position.value.lng)
  }
}

function choisirLieuCommePosition(lieuId: string): void {
  const lieu = lieux.find((l) => l.id === lieuId)
  if (lieu) definirPositionManuelle({ lat: lieu.lat, lng: lieu.lng })
}

function synchroniserMarqueurPosition(nouvellePosition: typeof position.value): void {
  if (!carte) return
  if (!nouvellePosition) {
    marqueurPosition?.remove()
    marqueurPosition = null
    return
  }
  if (!marqueurPosition) {
    marqueurPosition = new maplibregl.Marker({ color: '#1d6f8c' })
      .setLngLat([nouvellePosition.lng, nouvellePosition.lat])
      .addTo(carte)
  } else {
    marqueurPosition.setLngLat([nouvellePosition.lng, nouvellePosition.lat])
  }
}

onMounted(() => {
  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  // Le téléchargement du cache tuiles ne doit jamais bloquer la création de la carte :
  // en cas d'échec (hors ligne au premier lancement), on affiche un avertissement mais
  // la carte reste créée avec ce que le service worker a déjà en cache.
  erreurCache.value = false
  assurerCarteEnCache().catch(() => {
    erreurCache.value = true
  })

  if (!conteneurCarte.value) return

  carte = new maplibregl.Map({
    container: conteneurCarte.value,
    style: creerStyleValence(location.origin),
    center: [-0.3763, 39.4699],
    zoom: 13,
  })

  // usePosition() est appelé pendant setup() : une position manuelle restaurée depuis
  // le stockage existe déjà avant l'enregistrement du watch, qui ne se déclencherait
  // donc jamais pour elle. On applique l'état initial explicitement.
  synchroniserMarqueurPosition(position.value)

  carte.on('load', () => {
    for (const lieu of lieux) {
      new maplibregl.Marker({ color: '#e2572b' })
        .setLngLat([lieu.lng, lieu.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 24 }).setHTML(
            `<strong>${lieu.nom}</strong>${lieu.mot ? `<p>${lieu.mot}</p>` : ''}`,
          ),
        )
        .addTo(carte!)
    }

    carte!.on('click', (evenementClic) => {
      if (!modeSelectionManuelle.value) return
      definirPositionManuelle({ lat: evenementClic.lngLat.lat, lng: evenementClic.lngLat.lng })
      modeSelectionManuelle.value = false
    })

    const demande = consommerFocus()
    if (demande) {
      const lieuVise = lieux.find((lieu) => lieu.id === demande.lieuId)
      if (lieuVise) centrerSur(lieuVise.lat, lieuVise.lng)
    }
  })

  if (mode.value === 'gps') {
    activerModeGps()
  }
})

watch(position, synchroniserMarqueurPosition)
</script>

<template>
  <div class="carte-conteneur">
    <div ref="conteneurCarte" class="carte-maplibre" />

    <div class="carte-ui">
      <p class="statut-cache">
        {{
          cartePrete
            ? 'Carte prête ✓'
            : erreurCache
              ? 'Carte indisponible hors ligne — reconnecte-toi une fois'
              : telechargementEnCours
                ? 'Téléchargement de la carte…'
                : 'Préparation de la carte…'
        }}
      </p>

      <div class="controles-position">
        <span>
          Position : {{ mode === 'gps' ? 'GPS' : 'Manuelle' }}
          <template v-if="mode === 'gps' && rechercheGpsEnCours"> (recherche…)</template>
        </span>
        <button type="button" @click="activerModeGps">Activer le GPS</button>
        <button type="button" @click="modeSelectionManuelle = !modeSelectionManuelle">
          {{ modeSelectionManuelle ? 'Toucher la carte pour placer…' : 'Placer manuellement' }}
        </button>
        <button type="button" @click="recentrer">Recentrer</button>
      </div>

      <details class="je-suis-a">
        <summary>Je suis à…</summary>
        <ul>
          <li v-for="lieu in lieux" :key="lieu.id">
            <button type="button" @click="choisirLieuCommePosition(lieu.id)">{{ lieu.nom }}</button>
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<style scoped>
.carte-conteneur {
  position: relative;
  height: calc(100vh - 72px);
}

.carte-maplibre {
  position: absolute;
  inset: 0;
}

.carte-ui {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: none;
}

.carte-ui > * {
  pointer-events: auto;
}

.statut-cache,
.controles-position,
.je-suis-a {
  background: rgba(255, 248, 240, 0.95);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
}
</style>
