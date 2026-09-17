import { ref } from 'vue'

const NOM_CACHE = 'map'
const CHEMIN_PMTILES = '/seville.pmtiles'

export function useMapCache() {
  const pret = ref(false)
  const telechargementEnCours = ref(false)

  async function assurerCarteEnCache(): Promise<void> {
    if (typeof caches === 'undefined') {
      return
    }
    try {
      const cache = await caches.open(NOM_CACHE)
      const existant = await cache.match(CHEMIN_PMTILES)
      if (!existant) {
        telechargementEnCours.value = true
        try {
          await cache.add(CHEMIN_PMTILES)
        } finally {
          telechargementEnCours.value = false
        }
      }
      pret.value = true
    } catch (erreur) {
      telechargementEnCours.value = false
      throw erreur
    }
  }

  return { pret, telechargementEnCours, assurerCarteEnCache }
}
