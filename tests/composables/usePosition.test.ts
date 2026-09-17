import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePosition } from '../../composables/usePosition'

function creerGeolocationSimulee() {
  let callbackSucces: PositionCallback | null = null
  const watchPosition = vi.fn((succes: PositionCallback) => {
    callbackSucces = succes
    return 1
  })
  const clearWatch = vi.fn()
  return {
    watchPosition,
    clearWatch,
    emettrePosition(lat: number, lng: number) {
      callbackSucces?.({ coords: { latitude: lat, longitude: lng } } as GeolocationPosition)
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
})
