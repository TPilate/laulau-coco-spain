import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMapCache } from '../../composables/useMapCache'

describe('useMapCache', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('passe à "prêt" sans télécharger si le fichier est déjà en cache', async () => {
    const match = vi.fn().mockResolvedValue(new Response('deja-la'))
    const add = vi.fn()
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match, add }) })

    const { pret, telechargementEnCours, assurerCarteEnCache } = useMapCache()
    await assurerCarteEnCache()

    expect(add).not.toHaveBeenCalled()
    expect(pret.value).toBe(true)
    expect(telechargementEnCours.value).toBe(false)
  })

  it('télécharge le fichier si absent du cache puis passe à "prêt"', async () => {
    const match = vi.fn().mockResolvedValue(undefined)
    const add = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match, add }) })

    const { pret, assurerCarteEnCache } = useMapCache()
    await assurerCarteEnCache()

    expect(add).toHaveBeenCalledWith('/valencia.pmtiles')
    expect(pret.value).toBe(true)
  })
})
