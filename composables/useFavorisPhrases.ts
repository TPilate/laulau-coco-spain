import { usePersistedRef } from './usePersistedRef'

export function useFavorisPhrases() {
  const favoris = usePersistedRef<string[]>('phrases:favoris', [])

  function estFavori(es: string): boolean {
    return favoris.value.includes(es)
  }

  function basculerFavori(es: string): void {
    favoris.value = estFavori(es) ? favoris.value.filter((item) => item !== es) : [...favoris.value, es]
  }

  return { favoris, estFavori, basculerFavori }
}
