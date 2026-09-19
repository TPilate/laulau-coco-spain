import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMapCache } from '../../composables/useMapCache'

describe('useMapCache', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('passe à "prêt" sans télécharger si le fichier est déjà en cache', async () => {
    const match = vi.fn().mockResolvedValue(new Response('deja-la'))
    const put = vi.fn()
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match, put }) })
    const fetchEspion = vi.fn()
    vi.stubGlobal('fetch', fetchEspion)

    const { pret, telechargementEnCours, assurerCarteEnCache } = useMapCache()
    const tampon = await assurerCarteEnCache()

    expect(fetchEspion).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
    expect(pret.value).toBe(true)
    expect(telechargementEnCours.value).toBe(false)
    expect(tampon).toBeInstanceOf(ArrayBuffer)
  })

  it('télécharge le fichier si absent du cache, le met en cache puis retourne son contenu', async () => {
    const match = vi.fn().mockResolvedValue(undefined)
    const put = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match, put }) })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('contenu-carte')))

    const { pret, assurerCarteEnCache } = useMapCache()
    const tampon = await assurerCarteEnCache()

    expect(fetch).toHaveBeenCalledWith('/seville.pmtiles')
    expect(put).toHaveBeenCalledWith('/seville.pmtiles', expect.any(Response))
    expect(pret.value).toBe(true)
    expect(tampon).toBeInstanceOf(ArrayBuffer)
  })
})
