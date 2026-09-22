import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { lettre } from '../../data/pour-toi'

const toutesLesPhotos = [...lettre.photos, lettre.sommet]

describe('data/pour-toi.ts', () => {
  it('a un titre, une ouverture, une fin et une signature', () => {
    expect(lettre.titre.trim()).not.toBe('')
    expect(lettre.ouverture.trim()).not.toBe('')
    expect(lettre.fin.length).toBeGreaterThan(0)
    expect(lettre.signature).toBe('Tom')
  })

  it('chaque photo a une source, un fichier, une date, un alt et un texte', () => {
    for (const photo of toutesLesPhotos) {
      expect(photo.source.trim()).not.toBe('')
      expect(photo.fichier).toMatch(/^\d{2}\.webp$/)
      expect(photo.date.trim()).not.toBe('')
      expect(photo.alt.trim()).not.toBe('')
      expect(photo.texte.trim()).not.toBe('')
    }
  })

  it('les fichiers et les sources sont uniques', () => {
    expect(new Set(toutesLesPhotos.map((p) => p.fichier)).size).toBe(toutesLesPhotos.length)
    expect(new Set(toutesLesPhotos.map((p) => p.source)).size).toBe(toutesLesPhotos.length)
  })

  it.each(toutesLesPhotos.map((p) => p.fichier))('public/laura/%s existe', (fichier) => {
    expect(existsSync(join(process.cwd(), 'public', 'laura', fichier))).toBe(true)
  })
})
