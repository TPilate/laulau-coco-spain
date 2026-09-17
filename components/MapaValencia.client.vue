<script setup lang="ts">
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { lieux } from '~/data/content'

// Portée module : le protocole pmtiles ne doit être enregistré qu'une seule fois.
// Le réenregistrer à chaque montage jetait le cache mémoire de répertoires de tuiles
// de l'instance précédente.
let protocoleEnregistre = false

function enregistrerProtocolePmtiles(): void {
  if (protocoleEnregistre) return
  const protocole = new Protocol()
  maplibregl.addProtocol('pmtiles', protocole.tile)
  protocoleEnregistre = true
}

const conteneurCarte = ref<HTMLDivElement | null>(null)
let carte: maplibregl.Map | null = null
let marqueurPosition: maplibregl.Marker | null = null
const marqueurs = new Map<string, maplibregl.Marker>()

const {
  mode,
  position,
  rechercheGpsEnCours,
  erreurGps,
  activerModeGps,
  definirPositionManuelle,
} = usePosition()
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
  enregistrerProtocolePmtiles()

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
    marqueurs.clear()
    for (const lieu of lieux) {
      const marqueur = new maplibregl.Marker({ color: '#e2572b' })
        .setLngLat([lieu.lng, lieu.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 24 }).setHTML(
            `<strong>${lieu.nom}</strong>${lieu.mot ? `<p>${lieu.mot}</p>` : ''}`,
          ),
        )
        .addTo(carte!)
      marqueurs.set(lieu.id, marqueur)
    }

    carte!.on('click', (evenementClic) => {
      if (!modeSelectionManuelle.value) return
      definirPositionManuelle({ lat: evenementClic.lngLat.lat, lng: evenementClic.lngLat.lng })
      modeSelectionManuelle.value = false
    })

    const demande = consommerFocus()
    if (demande) {
      const lieuVise = lieux.find((lieu) => lieu.id === demande.lieuId)
      if (lieuVise) {
        centrerSur(lieuVise.lat, lieuVise.lng)
        // « Voir sur la carte » doit aussi ouvrir la fiche du lieu, pas seulement centrer.
        marqueurs.get(demande.lieuId)?.togglePopup()
      }
    }
  })

  if (mode.value === 'gps') {
    activerModeGps()
  }
})

onUnmounted(() => {
  // Sans remove(), chaque visite de /carte abandonne un contexte WebGL vivant : les
  // navigateurs en plafonnent le nombre (~16) et la carte finit par ne plus s'afficher.
  marqueurPosition?.remove()
  marqueurPosition = null
  marqueurs.clear()
  carte?.remove()
  carte = null
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
        <p v-if="erreurGps" class="erreur-gps">GPS refusé — utilise « Je suis à… »</p>
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

.erreur-gps {
  margin: 0;
  color: #b23c14;
  font-weight: 600;
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
