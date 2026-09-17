import { describe, it, expect } from 'vitest'
import { creerStyleSeville } from '../../utils/mapStyle'

describe('creerStyleSeville', () => {
  it('pointe vers les ressources locales uniquement', () => {
    const style = creerStyleSeville('https://exemple-app.test')
    expect(style.glyphs).toBe('https://exemple-app.test/style/fonts/{fontstack}/{range}.pbf')
    expect(style.sprite).toBe('https://exemple-app.test/style/sprites/light')
    expect((style.sources.protomaps as { url: string }).url).toBe('pmtiles://https://exemple-app.test/seville.pmtiles')
  })

  it('définit au moins une couche de rendu', () => {
    const style = creerStyleSeville('https://exemple-app.test')
    expect(style.layers.length).toBeGreaterThan(0)
  })
})
