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

Polices et sprites Protomaps. **Ne copier que les trois fontstacks réellement
référencés par le style** (`utils/mapStyle.ts` → `layers('protomaps',
namedFlavor('light'), { lang: 'fr' })` n'utilise que `Noto Sans Regular`,
`Noto Sans Medium` et `Noto Sans Italic`). Copier tout l'arbre `fonts/`
ajoutait ~7,2 Mo de glyphes jamais demandés (Devanagari, etc.) au precache
Workbox, qui est tout-ou-rien : une seule entrée en échec fait rater
l'installation du service worker.

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
