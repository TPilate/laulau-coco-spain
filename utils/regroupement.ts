import type { Categorie, Lieu, Phrase } from '../data/content'

export function groupLieuxParCategorie(lieux: Lieu[]): Partial<Record<Categorie, Lieu[]>> {
  const groupes: Partial<Record<Categorie, Lieu[]>> = {}
  for (const lieu of lieux) {
    const liste = groupes[lieu.categorie] ?? []
    liste.push(lieu)
    groupes[lieu.categorie] = liste
  }
  return groupes
}

export function groupPhrasesParTheme(phrases: Phrase[]): Record<string, Phrase[]> {
  const groupes: Record<string, Phrase[]> = {}
  for (const phrase of phrases) {
    const liste = groupes[phrase.theme] ?? []
    liste.push(phrase)
    groupes[phrase.theme] = liste
  }
  return groupes
}
