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

Polices et sprites Protomaps (toutes langues, pour ne manquer aucun glyphe) :

```bash
curl -sSL -o /tmp/basemaps-assets.zip https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip
rm -rf /tmp/basemaps-assets
unzip -q /tmp/basemaps-assets.zip -d /tmp/basemaps-assets
mkdir -p public/style/fonts public/style/sprites
cp -R /tmp/basemaps-assets/basemaps-assets-main/fonts/. public/style/fonts/
cp /tmp/basemaps-assets/basemaps-assets-main/sprites/v4/light*.{json,png} public/style/sprites/
```

Ces assets changent rarement ; à régénérer seulement si Protomaps publie une nouvelle
version majeure du style (`@protomaps/basemaps` en `package.json`).
