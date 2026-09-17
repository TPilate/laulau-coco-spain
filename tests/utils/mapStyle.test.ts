import { describe, it, expect } from 'vitest'
import { creerStyleValence } from '../../utils/mapStyle'

describe('creerStyleValence', () => {
  it('pointe vers les ressources locales uniquement', () => {
    const style = creerStyleValence('https://exemple-app.test')
    expect(style.glyphs).toBe('https://exemple-app.test/style/fonts/{fontstack}/{range}.pbf')
    expect(style.sprite).toBe('https://exemple-app.test/style/sprites/light')
    expect((style.sources.protomaps as { url: string }).url).toBe(
      'pmtiles://https://exemple-app.test/valencia.pmtiles',
    )
  })

  it('définit au moins une couche de rendu', () => {
    const style = creerStyleValence('https://exemple-app.test')
    expect(style.layers.length).toBeGreaterThan(0)
  })
})
