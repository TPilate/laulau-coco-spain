import { describe, it, expect } from 'vitest'
import { groupLieuxParCategorie, groupPhrasesParTheme } from '../../utils/regroupement'
import type { Lieu, Phrase } from '../../data/content'

describe('groupLieuxParCategorie', () => {
  it('regroupe les lieux par catégorie', () => {
    const lieux: Lieu[] = [
      { id: '1', nom: 'A', categorie: 'a-voir', lat: 0, lng: 0 },
      { id: '2', nom: 'B', categorie: 'resto', lat: 0, lng: 0 },
      { id: '3', nom: 'C', categorie: 'a-voir', lat: 0, lng: 0 },
    ]
    const groupes = groupLieuxParCategorie(lieux)
    expect(groupes['a-voir']?.map((l) => l.id)).toEqual(['1', '3'])
    expect(groupes.resto?.map((l) => l.id)).toEqual(['2'])
  })
})

describe('groupPhrasesParTheme', () => {
  it('regroupe les phrases par thème', () => {
    const phrases: Phrase[] = [
      { theme: 'Salutations', fr: 'Bonjour', es: 'Hola', prononciation: 'o-la' },
      { theme: 'Transport', fr: 'Métro', es: 'Metro', prononciation: 'mé-tro' },
      { theme: 'Salutations', fr: 'Merci', es: 'Gracias', prononciation: 'gra-cias' },
    ]
    const groupes = groupPhrasesParTheme(phrases)
    expect(groupes.Salutations.map((p) => p.fr)).toEqual(['Bonjour', 'Merci'])
    expect(groupes.Transport.map((p) => p.fr)).toEqual(['Métro'])
  })
})
