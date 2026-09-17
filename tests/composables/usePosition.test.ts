import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePosition } from '../../composables/usePosition'

function creerGeolocationSimulee() {
  let callbackSucces: PositionCallback | null = null
  let callbackErreur: PositionErrorCallback | null = null
  const watchPosition = vi.fn((succes: PositionCallback, erreur?: PositionErrorCallback | null) => {
    callbackSucces = succes
    callbackErreur = erreur ?? null
    return 1
  })
  const clearWatch = vi.fn()
  return {
    watchPosition,
    clearWatch,
    emettrePosition(lat: number, lng: number) {
      callbackSucces?.({ coords: { latitude: lat, longitude: lng } } as GeolocationPosition)
    },
    emettreErreur(code = 1, message = 'User denied Geolocation') {
      callbackErreur?.({
        code,
        message,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError)
    },
  }
}

describe('usePosition', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it("démarre en mode gps par défaut sans position tant que le GPS n'a pas répondu", () => {
    const { mode, position } = usePosition()
    expect(mode.value).toBe('gps')
    expect(position.value).toBeNull()
  })

  it('expose la position GPS reçue via watchPosition', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { position, activerModeGps } = usePosition()
    activerModeGps()
    geoloc.emettrePosition(39.47, -0.38)

    expect(position.value).toEqual({ lat: 39.47, lng: -0.38, source: 'gps' })
  })

  it('passe en mode manuel et arrête le suivi GPS', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { mode, position, activerModeGps, definirPositionManuelle } = usePosition()
    activerModeGps()
    definirPositionManuelle({ lat: 39.46, lng: -0.37 })

    expect(mode.value).toBe('manuel')
    expect(position.value).toEqual({ lat: 39.46, lng: -0.37, source: 'manuel' })
    expect(geoloc.clearWatch).toHaveBeenCalledWith(1)
  })

  it('expose une erreur quand la géolocalisation est refusée ou expire', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { erreurGps, rechercheGpsEnCours, activerModeGps } = usePosition()
    activerModeGps()
    expect(erreurGps.value).toBeNull()

    geoloc.emettreErreur(1, 'User denied Geolocation')

    expect(erreurGps.value).toBeTruthy()
    expect(erreurGps.value?.code).toBe(1)
    expect(rechercheGpsEnCours.value).toBe(false)
  })

  it('efface l’erreur GPS dès qu’une position arrive', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { erreurGps, position, activerModeGps } = usePosition()
    activerModeGps()
    geoloc.emettreErreur(3, 'Timeout expired')
    expect(erreurGps.value).toBeTruthy()

    geoloc.emettrePosition(39.47, -0.38)

    expect(erreurGps.value).toBeNull()
    expect(position.value).toEqual({ lat: 39.47, lng: -0.38, source: 'gps' })
  })

  it('efface l’erreur GPS à chaque nouvelle tentative via activerModeGps()', () => {
    const geoloc = creerGeolocationSimulee()
    vi.stubGlobal('navigator', { geolocation: geoloc })

    const { erreurGps, activerModeGps } = usePosition()
    activerModeGps()
    geoloc.emettreErreur()
    expect(erreurGps.value).toBeTruthy()

    activerModeGps()

    expect(erreurGps.value).toBeNull()
  })
})
