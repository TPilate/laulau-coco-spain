import { describe, it, expect, vi } from 'vitest'
import { demanderStockagePersistant } from '../../composables/useStockagePersistant'

describe('demanderStockagePersistant', () => {
  it('appelle navigator.storage.persist et retourne son résultat', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('navigator', { storage: { persist } })

    const resultat = await demanderStockagePersistant()

    expect(persist).toHaveBeenCalled()
    expect(resultat).toBe(true)
    vi.unstubAllGlobals()
  })

  it("retourne false si l'API n'est pas disponible", async () => {
    vi.stubGlobal('navigator', {})
    const resultat = await demanderStockagePersistant()
    expect(resultat).toBe(false)
    vi.unstubAllGlobals()
  })
})
