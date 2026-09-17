import { ref, watch, type Ref } from 'vue'

export function usePersistedRef<T>(cle: string, valeurParDefaut: T): Ref<T> {
  let valeurInitiale = valeurParDefaut

  if (typeof localStorage !== 'undefined') {
    const stockee = localStorage.getItem(cle)
    if (stockee !== null) {
      try {
        valeurInitiale = JSON.parse(stockee) as T
      } catch {
        valeurInitiale = valeurParDefaut
      }
    }
  }

  const donnee = ref(valeurInitiale) as Ref<T>

  watch(
    donnee,
    (nouvelleValeur) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cle, JSON.stringify(nouvelleValeur))
      }
    },
    { deep: true },
  )

  return donnee
}
