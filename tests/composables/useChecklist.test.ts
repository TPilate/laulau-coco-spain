import { describe, it, expect, beforeEach } from 'vitest'
import { useChecklist } from '../../composables/useChecklist'

describe('useChecklist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('démarre sans aucun item', () => {
    const { items } = useChecklist()
    expect(items.value).toEqual([])
  })

  it('ajoute un item non coché', () => {
    const { items, ajouterItem } = useChecklist()
    ajouterItem('Passeport')
    expect(items.value).toHaveLength(1)
    expect(items.value[0]).toMatchObject({ texte: 'Passeport', coche: false })
  })

  it('ignore un texte vide ou uniquement des espaces', () => {
    const { items, ajouterItem } = useChecklist()
    ajouterItem('   ')
    expect(items.value).toEqual([])
  })

  it('coche puis décoche un item', () => {
    const { items, ajouterItem, basculerItem } = useChecklist()
    ajouterItem('Chargeur')
    const id = items.value[0].id

    basculerItem(id)
    expect(items.value[0].coche).toBe(true)

    basculerItem(id)
    expect(items.value[0].coche).toBe(false)
  })

  it('supprime un item', () => {
    const { items, ajouterItem, supprimerItem } = useChecklist()
    ajouterItem('Lunettes de soleil')
    const id = items.value[0].id

    supprimerItem(id)
    expect(items.value).toEqual([])
  })

  it('persiste les items dans localStorage', () => {
    const { ajouterItem } = useChecklist()
    ajouterItem('Crème solaire')

    const { items: itemsNouvelleInstance } = useChecklist()
    expect(itemsNouvelleInstance.value).toHaveLength(1)
    expect(itemsNouvelleInstance.value[0].texte).toBe('Crème solaire')
  })
})
