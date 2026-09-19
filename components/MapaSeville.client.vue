<script lang="ts">
// Bloc <script> classique : son contenu vit en portée module (le corps de
// <script setup> est, lui, réexécuté à chaque instance). Le protocole pmtiles ne doit
// être enregistré qu'une fois : le réenregistrer à chaque montage jetait le cache
// mémoire de répertoires de tuiles de l'instance précédente.
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { PMTiles, Protocol } from 'pmtiles'
import { lieux } from '~/data/content'
import type { Categorie } from '~/data/content'
import { CATEGORIES } from '~/data/categories'
import type { TypePointPersonnalise, PointPersonnalise } from '~/composables/usePointsPersonnalises'
import type { DemandeFocus } from '~/composables/useMapFocus'
import { SourcePmtilesMemoire } from '~/utils/pmtilesSourceMemoire'
import { cleSourceSeville } from '~/utils/mapStyle'

let protocolePmtiles: Protocol | null = null

function enregistrerProtocolePmtiles(): Protocol {
  if (protocolePmtiles) return protocolePmtiles
  protocolePmtiles = new Protocol()
  maplibregl.addProtocol('pmtiles', protocolePmtiles.tile)

  // maplibre-gl calcule l'URL de son worker via `import.meta.url` du module lui-même
  // au lieu du motif `new Worker(new URL(...), import.meta.url)` reconnu par Vite : le
  // fichier n'est donc jamais copié dans le bundle et 404 par défaut, ce qui empêche
  // tout décodage de tuile (la carte reste vide, sans erreur visible). On sert notre
  // propre copie statique (voir scripts/build-map-data.md) et on pointe dessus.
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')

  return protocolePmtiles
}
</script>

<script setup lang="ts">
const props = defineProps<{ lieuActifId?: string | null }>()
const emit = defineEmits<{ selection: [lieuId: string] }>()

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
const { demandeFocus, consommerFocus } = useMapFocus()
const {
  points: pointsPersonnalises,
  ajouterPoint,
  modifierPoint,
  supprimerPoint,
} = usePointsPersonnalises()

const optionsOuvertes = ref(false)
const carteAgrandie = ref(false)
let observateurTaille: ResizeObserver | null = null
const modeSelectionManuelle = ref(false)
const modeAjoutPoint = ref(false)
const coordonneesNouveauPoint = ref<{ lat: number; lng: number } | null>(null)
const typeNouveauPoint = ref<TypePointPersonnalise>('maison')
const labelNouveauPoint = ref('')
const pointEnEditionId = ref<string | null>(null)
const erreurCache = ref(false)

function basculerOptions(): void {
  optionsOuvertes.value = !optionsOuvertes.value
}

function basculerAgrandissement(): void {
  carteAgrandie.value = !carteAgrandie.value
}

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

function creerElementMarqueurLieu(categorie: Categorie): HTMLDivElement {
  const element = document.createElement('div')
  element.className = 'marqueur-lieu'
  element.style.background = CATEGORIES[categorie].teinte
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
  const protocole = enregistrerProtocolePmtiles()

  // Le chargement du cache tuiles ne doit jamais bloquer la création de la carte : en
  // cas d'échec (hors ligne au premier lancement), on affiche un avertissement mais la
  // carte reste créée. Elle utilisera alors la source distante par défaut de pmtiles
  // (pmtiles://…), moins fiable hors ligne mais un repli acceptable pour ce cas rare.
  erreurCache.value = false
  assurerCarteEnCache()
    .then((tampon) => {
      const cle = cleSourceSeville(location.origin)
      protocole.add(new PMTiles(new SourcePmtilesMemoire(cle, tampon)))
    })
    .catch(() => {
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

    // Le bouton d'agrandissement change les dimensions du conteneur via CSS (pas
    // maplibre lui-même) : sans resize(), le canvas WebGL garde sa taille d'origine
    // et la carte reste minuscule dans un coin de l'écran une fois agrandie.
    observateurTaille = new ResizeObserver(() => carte?.resize())
    observateurTaille.observe(el)

    // usePosition() est appelé pendant setup() : une position manuelle restaurée depuis
    // le stockage existe déjà avant l'enregistrement du watch de position, qui ne se
    // déclencherait donc jamais pour elle. On applique l'état initial explicitement.
    synchroniserMarqueurPosition(position.value)

    carte.on('load', () => {
      marqueurs.clear()
      for (const lieu of lieux) {
        const marqueur = new maplibregl.Marker({ element: creerElementMarqueurLieu(lieu.categorie) })
          .setLngLat([lieu.lng, lieu.lat])
          .addTo(carte!)
        marqueur.getElement().addEventListener('click', () => emit('selection', lieu.id))
        marqueur.getElement().classList.toggle('actif', lieu.id === props.lieuActifId)
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
          emit('selection', demande.lieuId)
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
  observateurTaille?.disconnect()
  observateurTaille = null
  marqueurPosition?.remove()
  marqueurPosition = null
  marqueurs.clear()
  marqueursPersonnalises.clear()
  carte?.remove()
  carte = null
})

watch(position, synchroniserMarqueurPosition)
watch(pointsPersonnalises, synchroniserPointsPersonnalises, { deep: true })

watch(
  () => props.lieuActifId,
  (id: string | null | undefined) => {
    for (const [lieuId, marqueur] of marqueurs) {
      marqueur.getElement().classList.toggle('actif', lieuId === id)
    }
  },
)

// Sélection d'un lieu depuis la page (liste, recherche) alors que la carte est déjà montée :
// le déclenchement au chargement (ci-dessus) ne couvre que l'arrivée depuis une autre page.
watch(demandeFocus, (demande: DemandeFocus | null) => {
  if (!demande || !carte) return
  const lieuVise = lieux.find((lieu) => lieu.id === demande.lieuId)
  if (lieuVise) {
    centrerSur(lieuVise.lat, lieuVise.lng)
    emit('selection', demande.lieuId)
  }
  consommerFocus()
})
</script>

<template>
  <div class="carte-conteneur" :class="{ 'carte-conteneur--agrandie': carteAgrandie }">
    <div ref="conteneurCarte" class="carte-maplibre" />

    <p class="statut-cache">
      {{
        cartePrete
          ? 'Carte prête ✓'
          : erreurCache
            ? 'Hors ligne — reconnecte-toi une fois'
            : telechargementEnCours
              ? 'Téléchargement…'
              : 'Préparation…'
      }}
    </p>

    <button
      type="button"
      class="bouton-agrandir"
      :aria-label="carteAgrandie ? 'Réduire la carte' : 'Agrandir la carte'"
      @click="basculerAgrandissement"
    >
      <svg v-if="!carteAgrandie" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M1 4.5h4v-4M13 4.5H9v-4M13 9.5H9v4M1 9.5h4v4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <button
      type="button"
      class="bouton-options"
      :class="{ actif: optionsOuvertes }"
      aria-label="Options de position et points personnalisés"
      @click="basculerOptions"
    >
      ⚙
    </button>

    <div v-if="optionsOuvertes" class="panneau-options">
      <div class="bloc-options">
        <span class="bloc-options-titre">
          Position : {{ mode === 'gps' ? 'GPS' : 'Manuelle' }}
          <template v-if="mode === 'gps' && rechercheGpsEnCours"> (recherche…)</template>
        </span>
        <p v-if="erreurGps" class="erreur-gps">GPS refusé — utilise « Je suis à… »</p>
        <div class="bloc-options-actions">
          <button type="button" class="puce" @click="activerModeGps">Activer le GPS</button>
          <button type="button" class="puce" @click="basculerModeSelectionManuelle">
            {{ modeSelectionManuelle ? 'Toucher la carte pour placer…' : 'Placer manuellement' }}
          </button>
          <button type="button" class="puce" @click="recentrer">Recentrer</button>
        </div>
      </div>

      <div class="bloc-options">
        <button type="button" class="puce" @click="basculerModeAjoutPoint">
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
            <button type="button" class="puce" @click="validerAjoutPoint">{{ pointEnEditionId ? 'Enregistrer' : 'Ajouter' }}</button>
            <button type="button" class="puce" @click="annulerAjoutPoint">Annuler</button>
          </div>
        </div>
      </div>

      <details class="je-suis-a">
        <summary>Je suis à…</summary>
        <ul>
          <li v-for="lieu in lieux" :key="lieu.id">
            <button type="button" class="puce" @click="choisirLieuCommePosition(lieu.id)">{{ lieu.nom }}</button>
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<style scoped>
.carte-conteneur {
  position: absolute;
  inset: 0;
}

.carte-maplibre {
  position: absolute;
  inset: 0;
}

.carte-conteneur--agrandie {
  position: fixed;
  z-index: 60;
}

.bouton-agrandir {
  position: absolute;
  right: 52px;
  bottom: 12px;
  z-index: 3;
  width: 30px;
  height: 30px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: var(--card-shadow);
  border: none;
  color: var(--ink);
  padding: 0;
}

.carte-conteneur--agrandie .bouton-agrandir {
  bottom: calc(12px + env(safe-area-inset-bottom));
}

.carte-conteneur--agrandie .bouton-options {
  bottom: calc(12px + env(safe-area-inset-bottom));
}

.carte-conteneur--agrandie .statut-cache {
  bottom: calc(12px + env(safe-area-inset-bottom));
}

.statut-cache {
  position: absolute;
  left: 14px;
  bottom: 12px;
  z-index: 3;
  margin: 0;
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(27, 27, 31, 0.9);
  padding: 7px 10px;
  border-radius: 9px;
}

.bouton-options {
  position: absolute;
  right: 14px;
  bottom: 12px;
  z-index: 3;
  width: 30px;
  height: 30px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: var(--card-shadow);
  border: none;
  color: var(--ink);
  font-size: 14px;
  padding: 0;
}

.bouton-options.actif {
  background: var(--ink);
  color: #fff;
}

.panneau-options {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 50px;
  z-index: 4;
  max-height: calc(100% - 60px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--card-shadow-strong);
  font-size: 0.85rem;
}

.bloc-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bloc-options-titre {
  font-weight: 600;
  color: var(--ink);
}

.bloc-options-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.erreur-gps {
  margin: 0;
  color: #b23c14;
  font-weight: 600;
}

.je-suis-a ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
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
/* Non scopé : ces éléments sont créés via document.createElement pour maplibre-gl,
   pas par le rendu Vue, donc l'attribut data-v-* du scope ne leur est jamais appliqué. */
.marqueur-personnalise {
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.marqueur-lieu {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(20, 20, 30, 0.3);
  box-sizing: border-box;
  cursor: pointer;
  transition: width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease;
}

.marqueur-lieu.actif {
  width: 30px;
  height: 30px;
  border-width: 4px;
  box-shadow: 0 4px 12px rgba(20, 20, 30, 0.4);
}
</style>
