import { useEffect, useState } from 'react';
import './App.css';
import { CRSEnum } from 'enum/CRS.enum';
import { getReference } from '@luciad/ria/reference/ReferenceProvider';
import { WebGLMap } from '@luciad/ria/view/WebGLMap';
import { BINGMAPS_AERIAL } from 'utils/CreateLayerCommands';
import { CreateNewLayer } from 'utils/CreateNewLayer';
import { getXYZ } from 'utils/xyz';
import { createPoint } from '@luciad/ria/shape/ShapeFactory';
import { useLocalStorage } from 'services/localStorage/localStorage.hook';
import { LayerGroup } from '@luciad/ria/view/LayerGroup';
import { FeatureLayer } from '@luciad/ria/view/feature/FeatureLayer';
import { FeatureModel } from '@luciad/ria/model/feature/FeatureModel';
import { MemoryStore } from '@luciad/ria/model/store/MemoryStore';
import { Feature } from '@luciad/ria/model/feature/Feature';
import { PointPainter } from 'utils/FeaturePainter';
import Stats from 'stats-js';

let map;
let layerGroup;

const featureRenderArea = {
  topLeft: [0, 0],
  bottomRight: [180, 180],
}

const stats = new Stats();
let statsStarted = false;
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.className = 'stats';
document.body.appendChild(stats.dom);

export const App = () => {
  const { setItem, getItem } = useLocalStorage();
  const [featuresData, setFeaturesData] = useState({ features: 300000, layers: 1 });
  const [isLayersVisible, setIsLayersVisible] = useState(true);

  const toggleLayers = () => {
    setIsLayersVisible(!isLayersVisible);
    map.layerTree.visible = !isLayersVisible;
  }

  const addLayerToMap = async () => {
    const layer = await CreateNewLayer(BINGMAPS_AERIAL.parameters);

    map.layerTree.addChild(layer);
  }

  const getRandomFeature = () => {
    const ref = getReference(CRSEnum.CRS_84);
    const lonMin = featureRenderArea.topLeft[0];
    const lonMax = featureRenderArea.bottomRight[0];
    const latMin = featureRenderArea.topLeft[1];
    const latMax = featureRenderArea.bottomRight[1];

    const randomLon = lonMin + Math.random() * (lonMax - lonMin);
    const randomLat = latMin + Math.random() * (latMax - latMin);

    return new Feature(
      createPoint(ref, [randomLon, randomLat]),
    );
  }

  const clear = () => {
    if (layerGroup) {
      map.layerTree.removeChild(layerGroup);
    }
  }

  const createTestLayers = () => {
    clear();

    const { layers, features } = featuresData;
    const store = new MemoryStore();
    const model = new FeatureModel(store);
    const layer = new FeatureLayer(model, { painter: new PointPainter() });
    layerGroup = new LayerGroup({ id: 'testLayerGroup' });

    map.layerTree.addChild(layerGroup);

    for (let i = 0; i < layers; i++) {
      for (let i = 0; i < features; i++) {
        store.add(getRandomFeature());
      }

      layerGroup.addChild(layer);
    }

    console.log('Created layers:', layers, 'with', features, 'items each');
  }

  const saveCameraPosition = () => {
    const currentLookFrom = map.camera.asLookFrom();

    const savedCameraPosition = {
      eye: getXYZ(currentLookFrom.eye),
      yaw: currentLookFrom.yaw,
      pitch: currentLookFrom.pitch,
      roll: currentLookFrom.roll
    };

    setItem('camera', savedCameraPosition);
  }

  const loadCameraPositionFromUrl = () => {
    const cameraPosition = getItem('camera');

    if (cameraPosition) {
      const { eye, yaw, pitch, roll } = cameraPosition;

      map.camera = map.camera.lookFrom({
        eye: createPoint(map.reference, eye.split(',').map(Number)),
        yaw,
        pitch,
        roll
      });
    }
  }

  const initMapListeners = () => {
    window.addEventListener('beforeunload', () => {
      saveCameraPosition()
    });
  }

  // Create the map
  useEffect(() => {
    const element = document.querySelector('.Map') as HTMLElement;
    const map3D = CRSEnum.EPSG_4978;
    const reference = getReference(map3D);
    map = new WebGLMap(element, { reference });

    loadCameraPositionFromUrl();

    addLayerToMap();
    initMapListeners();
  }, []);

  // Init Stats
  useEffect(() => {
    const triggerStatsTick = () => {
      stats.begin();
      stats.end();
      requestAnimationFrame(triggerStatsTick);
    }

    if (!statsStarted) {
      statsStarted = true;
      triggerStatsTick();
    }
  }, []);

  return (
    <div className="App">
      <div className="App__topLeftButtons">
        <select
          onChange={(e) => {
            const count = parseInt(e.target.value);
            setFeaturesData({ ...featuresData, features: count });
          }}
          value={featuresData.features}
          className="pointsDropdown">
          <option value="">Select number of points</option>
          <option value="1000">1,000 points</option>
          <option value="30000">30,000 points</option>
          <option value="100000">100,000 points</option>
          <option value="300000">300,000 points</option>
        </select>

        <select
          onChange={(e) => {
            const count = parseInt(e.target.value);
            setFeaturesData({ ...featuresData, layers: count });
          }}
          value={featuresData.layers}
          className="layersDropdown">
          <option value="">Select number of layers</option>
          <option value="1">1 layer</option>
          <option value="100">100 layers</option>
          <option value="1000">1,000 layers</option>
          <option value="3000">3,000 layers</option>
        </select>

        <button onClick={createTestLayers}>
          Render
        </button>

        <button onClick={clear}>
          Clear
        </button>

        <button onClick={toggleLayers}>
          {isLayersVisible ? 'Hide' : 'Show'} layers
        </button>
      </div>

      <div className="Map"></div>
    </div>
  );
}

export default App;
