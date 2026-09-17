import { describe, it, expect } from 'vitest'
import { lieux, evenements, messages, phrases } from '../../data/content'

describe('data/content.ts', () => {
  it('a au moins un lieu, un événement, un message et une phrase', () => {
    expect(lieux.length).toBeGreaterThan(0)
    expect(evenements.length).toBeGreaterThan(0)
    expect(messages.length).toBeGreaterThan(0)
    expect(phrases.length).toBeGreaterThan(0)
  })

  it('chaque événement référence un lieu existant', () => {
    const idsLieux = new Set(lieux.map((lieu) => lieu.id))
    for (const evenement of evenements) {
      expect(idsLieux.has(evenement.lieuId)).toBe(true)
    }
  })

  it('les identifiants de lieux, événements et messages sont uniques', () => {
    expect(new Set(lieux.map((l) => l.id)).size).toBe(lieux.length)
    expect(new Set(evenements.map((e) => e.id)).size).toBe(evenements.length)
    expect(new Set(messages.map((m) => m.id)).size).toBe(messages.length)
  })
})
