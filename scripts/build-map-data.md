# Régénérer les données de carte hors ligne

## `public/valencia.pmtiles`

1. Installer la CLI `pmtiles` : `brew install pmtiles`.
2. Relever l'URL du build Protomaps le plus récent sur
   https://maps.protomaps.com/builds (page JS, pas d'API brute — l'ouvrir dans un
   navigateur).
3. Extraire la bbox de Valence (centre historique, Ciutat de les Arts i les Ciències,
   plage de la Malvarrosa) :

   ```bash
   pmtiles extract <URL_DU_BUILD> public/valencia.pmtiles \
     --bbox=-0.42,39.43,-0.32,39.51 --maxzoom=15
   ```

4. Vérifier : `pmtiles verify public/valencia.pmtiles`.

## `public/style/fonts` et `public/style/sprites`

Polices et sprites Protomaps. **Ne copier que les trois fontstacks que l'extrait
actuel peut effectivement solliciter** (`utils/mapStyle.ts` → `layers('protomaps',
namedFlavor('light'), { lang: 'fr' })` référence conditionnellement d'autres
fontstacks selon le script des libellés — ex. `Noto Sans Devanagari Regular v1` pour
du texte en devanagari — mais `public/valencia.pmtiles` ne contient aucune donnée de ce
type sur la bbox de Valence, donc seuls `Noto Sans Regular`, `Noto Sans Medium` et
`Noto Sans Italic` sont jamais réellement demandés). Copier tout l'arbre `fonts/`
ajoutait ~7,2 Mo de glyphes jamais utilisés par cet extrait au precache Workbox, qui
est tout-ou-rien : une seule entrée en échec fait rater l'installation du service
worker. **Si un jour la bbox est étendue à une zone avec un script non-latin**, il
faudra réévaluer quels fontstacks ajouter.

```bash
curl -sSL -o /tmp/basemaps-assets.zip https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip
rm -rf /tmp/basemaps-assets
unzip -q /tmp/basemaps-assets.zip -d /tmp/basemaps-assets
mkdir -p public/style/fonts public/style/sprites
for fontstack in "Noto Sans Regular" "Noto Sans Medium" "Noto Sans Italic"; do
  cp -R "/tmp/basemaps-assets/basemaps-assets-main/fonts/$fontstack" public/style/fonts/
done
cp /tmp/basemaps-assets/basemaps-assets-main/fonts/OFL.txt public/style/fonts/
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light*.{json,png} public/style/sprites/
```

Si un jour un nouveau fontstack est ajouté au style, l'ajouter à cette liste —
et seulement celui-là.

Ces assets changent rarement ; à régénérer seulement si Protomaps publie une nouvelle
version majeure du style (`@protomaps/basemaps` en `package.json`).

## `public/maplibre-gl-worker.mjs` et `public/maplibre-gl-shared.mjs`

MapLibre GL calcule l'URL de son worker via `import.meta.url` du module lui-même,
un motif que Vite ne reconnaît pas (contrairement à `new Worker(new URL(...),
import.meta.url)`) : le fichier n'est donc jamais copié dans le bundle et 404 par
défaut, ce qui empêche tout décodage de tuile vectorielle — la carte reste alors vide,
sans aucune erreur dans la console. `maplibregl.setWorkerUrl(...)` (appelé dans
`components/MapaValencia.client.vue`) pointe vers notre propre copie statique.

À régénérer si `maplibre-gl` est mis à jour dans `package.json` :

```bash
cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs public/maplibre-gl-worker.mjs
cp node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs public/maplibre-gl-shared.mjs
```

`maplibre-gl-shared.mjs` est un chunk que `maplibre-gl-worker.mjs` importe par un
chemin relatif littéral (`./maplibre-gl-shared.mjs`) compilé en dur dans le fichier :
il doit impérativement garder ce nom exact et rester à la racine de `public/`, au même
niveau que le worker.
