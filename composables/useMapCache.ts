import { ref } from 'vue'

const NOM_CACHE = 'map'
const CHEMIN_PMTILES = '/seville.pmtiles'

export function useMapCache() {
  const pret = ref(false)
  const telechargementEnCours = ref(false)

  // Retourne le fichier de tuiles complet en mémoire (voir SourcePmtilesMemoire) : on lit
  // directement la réponse mise en cache plutôt que d'utiliser cache.add(), pour pouvoir
  // récupérer son contenu (arrayBuffer) sans refaire un second téléchargement réseau.
  async function assurerCarteEnCache(): Promise<ArrayBuffer> {
    if (typeof caches === 'undefined') {
      throw new Error('Cache Storage indisponible')
    }
    try {
      const cache = await caches.open(NOM_CACHE)
      let reponse = await cache.match(CHEMIN_PMTILES)
      if (!reponse) {
        telechargementEnCours.value = true
        try {
          const reponseReseau = await fetch(CHEMIN_PMTILES)
          await cache.put(CHEMIN_PMTILES, reponseReseau.clone())
          reponse = reponseReseau
        } finally {
          telechargementEnCours.value = false
        }
      }
      const tampon = await reponse.arrayBuffer()
      pret.value = true
      return tampon
    } catch (erreur) {
      telechargementEnCours.value = false
      throw erreur
    }
  }

  return { pret, telechargementEnCours, assurerCarteEnCache }
}
