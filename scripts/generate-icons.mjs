import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const racine = join(__dirname, '..')
const svgSource = join(racine, 'icons', 'icon.svg')
const dossierSortie = join(racine, 'public', 'icons')

const tailles = [
  { fichier: 'icon-192.png', taille: 192, fond: null },
  { fichier: 'icon-512.png', taille: 512, fond: null },
  { fichier: 'apple-touch-icon.png', taille: 180, fond: '#E2572B' },
]

await mkdir(dossierSortie, { recursive: true })

for (const { fichier, taille, fond } of tailles) {
  let image = sharp(svgSource).resize(taille, taille)
  if (fond) {
    image = image.flatten({ background: fond })
  }
  await image.png().toFile(join(dossierSortie, fichier))
  console.log(`Généré : ${fichier} (${taille}x${taille})`)
}
