import { describe, it, expect, beforeEach } from 'vitest'
import { useMapFocus } from '../../composables/useMapFocus'

describe('useMapFocus', () => {
  beforeEach(() => {
    useMapFocus().consommerFocus()
  })

  it(`n'a pas de demande de focus par défaut`, () => {
    expect(useMapFocus().consommerFocus()).toBeNull()
  })

  it(`enregistre puis consomme une demande de focus`, () => {
    useMapFocus().demanderFocus('lieu-mercado-central')
    expect(useMapFocus().consommerFocus()).toEqual({ lieuId: 'lieu-mercado-central' })
  })

  it(`la demande est effacée après consommation`, () => {
    useMapFocus().demanderFocus('lieu-malvarrosa')
    useMapFocus().consommerFocus()
    expect(useMapFocus().consommerFocus()).toBeNull()
  })
})
