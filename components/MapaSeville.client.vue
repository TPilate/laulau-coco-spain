<script lang="ts">
// Bloc <script> classique : son contenu vit en portée module (le corps de
// <script setup> est, lui, réexécuté à chaque instance). Le protocole pmtiles ne doit
// être enregistré qu'une fois : le réenregistrer à chaque montage jetait le cache
// mémoire de répertoires de tuiles de l'instance précédente.
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import { lieux } from '~/data/content'
import type { TypePointPersonnalise, PointPersonnalise } from '~/composables/usePointsPersonnalises'

let protocoleEnregistre = false

function enregistrerProtocolePmtiles(): void {
  if (protocoleEnregistre) return
  const protocole = new Protocol()
  maplibregl.addProtocol('pmtiles', protocole.tile)

  // maplibre-gl calcule l'URL de son worker via `import.meta.url` du module lui-même
  // au lieu du motif `new Worker(new URL(...), import.meta.url)` reconnu par Vite : le
  // fichier n'est donc jamais copié dans le bundle et 404 par défaut, ce qui empêche
  // tout décodage de tuile (la carte reste vide, sans erreur visible). On sert notre
  // propre copie statique (voir scripts/build-map-data.md) et on pointe dessus.
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')

  protocoleEnregistre = true
}
</script>

<script setup lang="ts">
const conteneurCarte = ref<HTMLDivElement | null>(null)
let carte: maplibregl.Map | null = null
let marqueurPosition: maplibregl.Marker | null = null
const marqueurs = new Map<string, maplibregl.Marker>()
const marqueursPersonnalises = new Map<string, maplibregl.Marker>()

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
const {
  points: pointsPersonnalises,
  ajouterPoint,
  modifierPoint,
  supprimerPoint,
} = usePointsPersonnalises()

const modeSelectionManuelle = ref(false)
const modeAjoutPoint = ref(false)
const coordonneesNouveauPoint = ref<{ lat: number; lng: number } | null>(null)
const typeNouveauPoint = ref<TypePointPersonnalise>('maison')
const labelNouveauPoint = ref('')
const pointEnEditionId = ref<string | null>(null)
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

function creerElementMarqueurPersonnalise(type: TypePointPersonnalise): HTMLDivElement {
  const element = document.createElement('div')
  element.className = 'marqueur-personnalise'
  element.textContent = type === 'maison' ? '🏠' : '📌'
  return element
}

function creerPopupPointPersonnalise(point: PointPersonnalise): maplibregl.Popup {
  // Le popup doit pouvoir se fermer lui-même quand on clique « Éditer » : on le crée
  // d'abord pour que les boutons puissent le capturer par fermeture lexicale.
  const popup = new maplibregl.Popup({ offset: 24 })
  const conteneur = document.createElement('div')
  const titre = document.createElement('strong')
  titre.textContent = point.label
  const boutonEditer = document.createElement('button')
  boutonEditer.type = 'button'
  boutonEditer.textContent = 'Éditer'
  boutonEditer.addEventListener('click', () => {
    popup.remove()
    commencerEditionPoint(point)
  })
  const boutonSupprimer = document.createElement('button')
  boutonSupprimer.type = 'button'
  boutonSupprimer.textContent = 'Supprimer'
  boutonSupprimer.addEventListener('click', () => supprimerPoint(point.id))
  conteneur.append(titre, document.createElement('br'), boutonEditer, boutonSupprimer)
  return popup.setDOMContent(conteneur)
}

function synchroniserPointsPersonnalises(): void {
  if (!carte) return
  const idsActuels = new Set(pointsPersonnalises.value.map((point) => point.id))
  for (const [id, marqueur] of marqueursPersonnalises) {
    if (!idsActuels.has(id)) {
      marqueur.remove()
      marqueursPersonnalises.delete(id)
    }
  }
  for (const point of pointsPersonnalises.value) {
    if (marqueursPersonnalises.has(point.id)) continue
    const marqueur = new maplibregl.Marker({
      element: creerElementMarqueurPersonnalise(point.type),
      anchor: 'bottom',
    })
      .setLngLat([point.lng, point.lat])
      .setPopup(creerPopupPointPersonnalise(point))
      .addTo(carte)
    marqueursPersonnalises.set(point.id, marqueur)
  }
}

function basculerModeSelectionManuelle(): void {
  annulerAjoutPoint()
  modeSelectionManuelle.value = !modeSelectionManuelle.value
  if (modeSelectionManuelle.value) modeAjoutPoint.value = false
}

function basculerModeAjoutPoint(): void {
  annulerAjoutPoint()
  modeAjoutPoint.value = !modeAjoutPoint.value
  if (modeAjoutPoint.value) modeSelectionManuelle.value = false
}

function commencerEditionPoint(point: PointPersonnalise): void {
  modeSelectionManuelle.value = false
  modeAjoutPoint.value = false
  pointEnEditionId.value = point.id
  typeNouveauPoint.value = point.type
  labelNouveauPoint.value = point.label
  coordonneesNouveauPoint.value = { lat: point.lat, lng: point.lng }
}

function annulerAjoutPoint(): void {
  coordonneesNouveauPoint.value = null
  labelNouveauPoint.value = ''
  typeNouveauPoint.value = 'maison'
  pointEnEditionId.value = null
}

function validerAjoutPoint(): void {
  if (!coordonneesNouveauPoint.value) return
  if (!labelNouveauPoint.value.trim()) return
  if (pointEnEditionId.value) {
    modifierPoint(pointEnEditionId.value, typeNouveauPoint.value, labelNouveauPoint.value)
  } else {
    ajouterPoint(
      typeNouveauPoint.value,
      labelNouveauPoint.value,
      coordonneesNouveauPoint.value.lat,
      coordonneesNouveauPoint.value.lng,
    )
  }
  annulerAjoutPoint()
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
})

// Nuxt enveloppe les composants .client.vue façon <ClientOnly> : au tout premier rendu
// (nuxtApp.isHydrating vaut true même avec ssr:false), il affiche un <div> statique de
// substitution et ne rend le vrai template qu'au tick suivant. Notre propre onMounted se
// déclenche donc AVANT que <div ref="conteneurCarte"> n'existe réellement dans le DOM :
// s'appuyer sur onMounted pour créer la carte échoue silencieusement (conteneurCarte.value
// reste null pour toujours, aucune erreur). On observe plutôt la ref elle-même : elle finit
// par recevoir le vrai élément dès que Nuxt rend le contenu réel, quel que soit le tick.
watch(
  conteneurCarte,
  (el: typeof conteneurCarte.value) => {
    if (!el || carte) return

    carte = new maplibregl.Map({
      container: el,
      style: creerStyleSeville(location.origin),
      center: [-5.9845, 37.3891],
      zoom: 13,
    })

    // usePosition() est appelé pendant setup() : une position manuelle restaurée depuis
    // le stockage existe déjà avant l'enregistrement du watch de position, qui ne se
    // déclencherait donc jamais pour elle. On applique l'état initial explicitement.
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

      synchroniserPointsPersonnalises()

      carte!.on('click', (evenementClic) => {
        const { lat, lng } = evenementClic.lngLat
        if (modeSelectionManuelle.value) {
          definirPositionManuelle({ lat, lng })
          modeSelectionManuelle.value = false
          return
        }
        if (modeAjoutPoint.value) {
          coordonneesNouveauPoint.value = { lat, lng }
          modeAjoutPoint.value = false
        }
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
  },
  { immediate: true },
)

onUnmounted(() => {
  // Sans remove(), chaque visite de /carte abandonne un contexte WebGL vivant : les
  // navigateurs en plafonnent le nombre (~16) et la carte finit par ne plus s'afficher.
  marqueurPosition?.remove()
  marqueurPosition = null
  marqueurs.clear()
  marqueursPersonnalises.clear()
  carte?.remove()
  carte = null
})

watch(position, synchroniserMarqueurPosition)
watch(pointsPersonnalises, synchroniserPointsPersonnalises, { deep: true })
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
        <button type="button" @click="basculerModeSelectionManuelle">
          {{ modeSelectionManuelle ? 'Toucher la carte pour placer…' : 'Placer manuellement' }}
        </button>
        <button type="button" @click="recentrer">Recentrer</button>
      </div>

      <div class="controles-points">
        <button type="button" @click="basculerModeAjoutPoint">
          {{ modeAjoutPoint ? 'Toucher la carte pour ajouter…' : 'Ajouter un point' }}
        </button>

        <div v-if="coordonneesNouveauPoint" class="formulaire-point">
          <strong>{{ pointEnEditionId ? 'Éditer le point' : 'Nouveau point' }}</strong>
          <label>
            Type
            <select v-model="typeNouveauPoint">
              <option value="maison">🏠 Maison</option>
              <option value="autre">📌 Autre</option>
            </select>
          </label>
          <label>
            Nom
            <input v-model="labelNouveauPoint" type="text" placeholder="Ex. Notre maison">
          </label>
          <div class="formulaire-actions">
            <button type="button" @click="validerAjoutPoint">{{ pointEnEditionId ? 'Enregistrer' : 'Ajouter' }}</button>
            <button type="button" @click="annulerAjoutPoint">Annuler</button>
          </div>
        </div>
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
.controles-points,
.je-suis-a {
  background: rgba(255, 248, 240, 0.95);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.formulaire-point {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.formulaire-actions {
  display: flex;
  gap: 6px;
}
</style>

<style>
/* Non scopé : cet élément est créé via document.createElement pour maplibre-gl,
   pas par le rendu Vue, donc l'attribut data-v-* du scope ne lui est jamais appliqué. */
.marqueur-personnalise {
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}
</style>
