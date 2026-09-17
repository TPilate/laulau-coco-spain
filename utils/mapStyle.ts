import { layers, namedFlavor } from '@protomaps/basemaps'
import type { StyleSpecification } from 'maplibre-gl'

export function creerStyleSeville(origin: string): StyleSpecification {
  return {
    version: 8,
    glyphs: `${origin}/style/fonts/{fontstack}/{range}.pbf`,
    sprite: `${origin}/style/sprites/light`,
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${origin}/seville.pmtiles`,
        attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers('protomaps', namedFlavor('light'), { lang: 'fr' }),
  }
}
