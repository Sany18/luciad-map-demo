import { useEffect, useState } from 'react';
import './App.css';
import { CRSEnum } from 'enum/CRS.enum';
import { getReference } from '@luciad/ria/reference/ReferenceProvider';
import { WebGLMap } from '@luciad/ria/view/WebGLMap';
import { getXYZ } from 'utils/xyz';
import { createPoint } from '@luciad/ria/shape/ShapeFactory';
import { LayerGroup } from '@luciad/ria/view/LayerGroup';
import { FeatureLayer } from '@luciad/ria/view/feature/FeatureLayer';
import { FeatureModel } from '@luciad/ria/model/feature/FeatureModel';
import { MemoryStore } from '@luciad/ria/model/store/MemoryStore';
import { Feature } from '@luciad/ria/model/feature/Feature';
import { PointPainter } from 'utils/FeaturePainter';
import Stats from 'stats-js';
import { useLocalStorage } from 'services/local-storage/localStorage.hook';
import { runScenario } from 'components/scenarios/run-scenario';
import { parformanceMesurementScenario } from 'components/scenarios/parformance-mesurement';
import { PerformanceMeasurementService } from 'services/performance-mesurement/performance-mesurement.service';
import { LayerFactory } from 'services/LayerFactory';
import { PerformanceSettingsService } from 'services/performance-settings.service';
import { Layers } from 'consts/Layers';
import { DEFAULT_MAP_GLOBE_COLOR } from 'consts/const';
import { getLayers } from 'services/layers-service';

let map;
let layerGroup;
let stats;
let performanceSettingsService: PerformanceSettingsService = new PerformanceSettingsService();
const ms = new PerformanceMeasurementService();

const featureRenderArea = {
  topLeft: [0, 0],
  bottomRight: [180, 180],
}

export const App = () => {
  const { setItem, getItem } = useLocalStorage();
  const [featuresData, setFeaturesData] = useState({ features: 300000, layers: 1 });
  const [isLayersVisible, setIsLayersVisible] = useState(true);
  const [isGlobeVisible, setIsGlobeVisible] = useState(true);

  const toggleLayers = () => {
    setIsLayersVisible(!isLayersVisible);
    map.layerTree.visible = !isLayersVisible;
  }

  const toggleGlobe = () => {
    setIsGlobeVisible(!isGlobeVisible);
    map.globeColor = isGlobeVisible ? DEFAULT_MAP_GLOBE_COLOR : null;
    map.invalidate();
  }

  const createLayer = async (command) => {
    const layer = await LayerFactory.createLayer(command, performanceSettingsService);

    if (!layer || !map) return null;

    // Avoid duplications
    const layerById = map.layerTree.findLayerTreeNodeById(layer.id);
    if (layerById) return null;

    map.layerTree.addChild(layer);

    return layer;
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

  const initStats = (element) => {
    // Add stats
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.className = 'stats';
    element.appendChild(stats.dom);

    const triggerStatsTick = () => {
      stats.begin();
      stats.end();
      requestAnimationFrame(triggerStatsTick);
    };

    triggerStatsTick();
  }

  const runBenchmark = async () => {
    ms.start();
    await runScenario(parformanceMesurementScenario(map));
    ms.end();
  };

  // Create the map
  useEffect(() => {
    const element = document.querySelector('.Map') as HTMLElement;
    map = new WebGLMap(element, {
      reference: getReference(CRSEnum.EPSG_4978),
      autoAdjustDisplayScale: true
    });

    document.map = map;

    initStats(element);

    loadCameraPositionFromUrl();
    initMapListeners();
    getLayers().forEach((layer) => createLayer(layer));
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

        <button onClick={toggleGlobe}>
          {isGlobeVisible ? 'Hide' : 'Show'} globe
        </button>

        <button onClick={runBenchmark}>
          Run performance benchmark
        </button>
      </div>

      <div className="Map"></div>
    </div>
  );
}

export default App;
