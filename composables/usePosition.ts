import { ref, computed, onScopeDispose } from 'vue'
import { usePersistedRef } from './usePersistedRef'

export type ModePosition = 'gps' | 'manuel'

export interface Coordonnees {
  lat: number
  lng: number
}

export interface PositionActuelle extends Coordonnees {
  source: ModePosition
}

export function usePosition() {
  const mode = usePersistedRef<ModePosition>('position:mode', 'gps')
  const positionManuelle = usePersistedRef<Coordonnees | null>('position:manuelle', null)
  const positionGps = ref<Coordonnees | null>(null)
  const rechercheGpsEnCours = ref(false)
  const erreurGps = ref<GeolocationPositionError | null>(null)
  let idSuivi: number | null = null

  const position = computed<PositionActuelle | null>(() => {
    if (mode.value === 'manuel') {
      return positionManuelle.value ? { ...positionManuelle.value, source: 'manuel' } : null
    }
    return positionGps.value ? { ...positionGps.value, source: 'gps' } : null
  })

  function demarrerSuiviGps(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    arreterSuiviGps()
    rechercheGpsEnCours.value = true
    idSuivi = navigator.geolocation.watchPosition(
      (resultat) => {
        positionGps.value = { lat: resultat.coords.latitude, lng: resultat.coords.longitude }
        rechercheGpsEnCours.value = false
        erreurGps.value = null
      },
      (erreur) => {
        rechercheGpsEnCours.value = false
        erreurGps.value = erreur
      },
      { enableHighAccuracy: true, timeout: 60000 },
    )
  }

  function arreterSuiviGps(): void {
    if (idSuivi !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(idSuivi)
      idSuivi = null
    }
    rechercheGpsEnCours.value = false
  }

  function activerModeGps(): void {
    mode.value = 'gps'
    positionGps.value = null
    // Une nouvelle tentative repart d'une ardoise propre : pas d'erreur périmée affichée.
    erreurGps.value = null
    demarrerSuiviGps()
  }

  function definirPositionManuelle(coordonnees: Coordonnees): void {
    arreterSuiviGps()
    mode.value = 'manuel'
    positionManuelle.value = coordonnees
  }

  onScopeDispose(() => {
    arreterSuiviGps()
  })

  return {
    mode,
    position,
    rechercheGpsEnCours,
    erreurGps,
    activerModeGps,
    definirPositionManuelle,
    arreterSuiviGps,
  }
}
