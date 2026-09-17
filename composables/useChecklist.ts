import { usePersistedRef } from './usePersistedRef'

export interface ItemChecklist {
  id: string
  texte: string
  coche: boolean
}

export function useChecklist() {
  const items = usePersistedRef<ItemChecklist[]>('checklist:items', [])

  function ajouterItem(texte: string): void {
    const texteNettoye = texte.trim()
    if (!texteNettoye) return
    items.value = [...items.value, { id: crypto.randomUUID(), texte: texteNettoye, coche: false }]
  }

  function basculerItem(id: string): void {
    items.value = items.value.map((item) =>
      item.id === id ? { ...item, coche: !item.coche } : item,
    )
  }

  function supprimerItem(id: string): void {
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, ajouterItem, basculerItem, supprimerItem }
}
