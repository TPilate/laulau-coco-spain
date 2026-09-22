import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { lettre } from '../data/pour-toi.ts'

const executer = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))
const racine = join(__dirname, '..')
const dossierSource = join(racine, 'assets', 'laura')
const dossierSortie = join(racine, 'public', 'laura')

await mkdir(dossierSortie, { recursive: true })
const dossierTemp = await mkdtemp(join(tmpdir(), 'laura-'))

try {
  for (const { source, fichier } of [...lettre.photos, lettre.sommet]) {
    // Le sharp pré-compilé lit les métadonnées HEIC mais ne décode pas HEVC :
    // sips (macOS) convertit d'abord en JPEG, en gardant l'orientation EXIF.
    const jpeg = join(dossierTemp, `${fichier}.jpg`)
    await executer('sips', ['-s', 'format', 'jpeg', join(dossierSource, source), '--out', jpeg])
    // rotate() applique l'orientation EXIF ; sharp ne recopie pas les métadonnées
    // (EXIF, GPS) dans le WebP de sortie.
    await sharp(jpeg)
      .rotate()
      .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(dossierSortie, fichier))
    console.log(`Généré : ${fichier} ← ${source}`)
  }
} finally {
  await rm(dossierTemp, { recursive: true, force: true })
}
