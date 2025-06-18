import { BASE_PATH } from "./const";

const getTilesetUrl = filename => {
  const url = `${BASE_PATH}/${window.__LUCIAD_ROOT__}/meshes/${filename}/tileset.json`
    .replace(/\/\//g, '/'); // Ensure no double slashes
  return url;
}

export const Layers = {
  BINGMAPS: {
    "type": "BING_MAP_LAYER",
    "uri": "https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=AugjqbGwtwHP0n0fUtpZqptdgkixBt5NXpfSzxb7q-6ATmbk-Vs4QnqiW6fhaV-i&include=ImageryProviders",
    "layerOptions": {
      "id": "BINGMAP_WMS_LAYER",
      "label": "BingMap"
    },
    "parentId": "WMS_LAYER_GROUP"
  },
  WATER_BOTTOM: {
    "type": "OGC_3D_TILES_LAYER",
    "url": getTilesetUrl("area_g"),
    "layerOptions": {
      "label": "area_g",
      "transparency": false,
      "loadingStrategy": 1,
      "offsetTerrain": false,
      "offsetTransformation": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    },
    "autoZoom": false,
    "parentId": "ASSETS_LAYER_GROUP"
  },
  MOUNTAINS: {
    "type": "OGC_3D_TILES_LAYER",
    "url": getTilesetUrl("elevation"),
    "layerOptions": {
      "label": "elevation",
      "transparency": false,
      "loadingStrategy": 1,
      "offsetTerrain": false,
      "offsetTransformation": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    },
    "autoZoom": false,
    "parentId": "ASSETS_LAYER_GROUP"
  },
  GROUND: {
    "type": "OGC_3D_TILES_LAYER",
    "url": getTilesetUrl("ground"),
    "layerOptions": {
      "label": "ground",
      "transparency": false,
      "loadingStrategy": 1,
      "offsetTerrain": false,
      "offsetTransformation": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    },
    "autoZoom": false,
  },
  POINTCLOUD: {
    "id": "3019",
    "type": "OGC_3D_TILES_LAYER",
    "url": getTilesetUrl("Area_G"),
    "layerOptions": {
      "label": "Area_G",
      "transparency": false,
      "loadingStrategy": 1,
      "offsetTerrain": false,
      "offsetTransformation": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    },
    "autoZoom": false,
  }
}
