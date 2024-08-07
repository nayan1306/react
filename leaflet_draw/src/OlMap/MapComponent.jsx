import { useEffect, useState } from "react";
import "./ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import MousePosition from "ol/control/MousePosition";
import { defaults as defaultControls } from "ol/control";
import { createStringXY } from "ol/coordinate";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Fill, Stroke, Style } from "ol/style";
import { click } from "ol/events/condition";
import styles from "./mapcomponent.module.css";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function MapComponent() {
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [modifyInteraction, setModifyInteraction] = useState(null);
  const [selectInteraction, setSelectInteraction] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [polygons, setPolygons] = useState([]);
  const [polygonFeatures, setPolygonFeatures] = useState([]);
  const [activeLayer, setActiveLayer] = useState("ndvi");
  const [ndviLayer, setNdviLayer] = useState(null);
  const [sentinel2Layer, setSentinel2Layer] = useState(null);

  useEffect(() => {
    const initialView = new View({
      projection: "EPSG:4326",
      center: [78.9629, 20.5937],
      zoom: 6,
    });

    const newMap = new Map({
      controls: defaultControls().extend([
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: "EPSG:4326",
          target: document.getElementById("mouse-position"),
        }),
      ]),
      target: "map",
      view: initialView,
    });

    const bhuvanLayer = new TileLayer({
      source: new TileWMS({
        url: "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms",
        params: {
          LAYERS: "basemap:admin_group",
          VERSION: "1.1.1",
          FORMAT: "image/png",
        },
      }),
      zIndex: 100,
    });

    const newNdviLayer = new TileLayer({
      source: new TileWMS({
        url: "https://vedas.sac.gov.in/ridam_server3/wms",
        params: {
          name: "RDSGrdient",
          layers: "T0S0M0",
          PROJECTION: "EPSG:4326",
          ARGS: "merge_method:max;dataset_id:T3S1P1;from_time:20240701;to_time:20240807;indexes:1",
          styles: "[0:FFFFFF00:1:f0ebecFF:25:d8c4b6FF:50:ab8a75FF:75:917732FF:100:70ab06FF:125:459200FF:150:267b01FF:175:0a6701FF:200:004800FF:251:001901FF;nodata:FFFFFF00]",
          LEGEND_OPTIONS: "columnHeight:400;height:100",
        },
      }),
      opacity: 1,
      zIndex: 1,
    });

    const newSentinel2Layer = new TileLayer({
      source: new TileWMS({
        url: "https://vedas.sac.gov.in/ridam_server2/wms",
        params: {
          name: "RDSGrdient",
          layers: "T0S0M3",
          PROJECTION: "EPSG:4326",
          ARGS: "dataset_id:T0S1P0;from_time:20240605;to_time:20240725;n_index:11;d_index:8;operation:max",
          styles: "[0:FFFFFF00:0:FFFFFF00:25:99d4f7FF:50:0079c1FF:75:003f6cFF:100:003f6cFF;nodata:FFFFFF00]",
          LEGEND_OPTIONS: "columnHeight:400;height:100",
        },
      }),
      opacity: 1,
      zIndex: 1,
    });
    

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const color = feature.get("color") || "#FF0000";
        return new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0)", // Transparent fill
          }),
          stroke: new Stroke({
            color: color,
            width: 4,
          }),
        });
      },
      zIndex: 99,
    });

    newMap.addLayer(bhuvanLayer);
    newMap.addLayer(newNdviLayer);
    newMap.addLayer(newSentinel2Layer);
    newMap.addLayer(vectorLayer);

    setNdviLayer(newNdviLayer);
    setSentinel2Layer(newSentinel2Layer);

    const newDrawInteraction = new Draw({
      source: vectorSource,
      type: "Polygon",
    });

    const newModifyInteraction = new Modify({
      source: vectorSource,
    });

    const newSelectInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    const handleDeleteFeature = (e) => {
      if (deleteMode) {
        const features = newMap.getFeaturesAtPixel(e.pixel);
        if (features.length > 0) {
          const feature = features[0];
          vectorSource.removeFeature(feature);
          updatePolygonFeatures();
        }
      }
    };

    const updatePolygonFeatures = () => {
      const features = [];
      vectorSource.forEachFeature((feature) => {
        features.push(feature);
      });
      setPolygonFeatures(features);
    };

    newMap.addInteraction(newDrawInteraction);
    newMap.addInteraction(newModifyInteraction);
    newMap.addInteraction(newSelectInteraction);

    newDrawInteraction.on("drawstart", () => {
      console.log("Polygon drawing started");
    });

    newDrawInteraction.on("drawend", (event) => {
      const feature = event.feature;
      feature.set("color", getRandomColor());
      const coordinates = feature.getGeometry().getCoordinates();
      setPolygons((polygons) => [...polygons, coordinates]);
      updatePolygonFeatures();
    });

    newMap.on("click", handleDeleteFeature);

    setMap(newMap);
    setDrawInteraction(newDrawInteraction);
    setModifyInteraction(newModifyInteraction);
    setSelectInteraction(newSelectInteraction);

    return () => {
      newMap.removeInteraction(newDrawInteraction);
      newMap.removeInteraction(newModifyInteraction);
      newMap.removeInteraction(newSelectInteraction);
      newMap.un("click", handleDeleteFeature);
      newMap.setTarget(null);
    };
  }, []); // Ensure dependency array is empty to run only once

  useEffect(() => {
    if (map && ndviLayer && sentinel2Layer) {
      if (activeLayer === "ndvi") {
        ndviLayer.setVisible(true);
        sentinel2Layer.setVisible(false);
      } else {
        ndviLayer.setVisible(false);
        sentinel2Layer.setVisible(true);
      }
    }
  }, [activeLayer, map, ndviLayer, sentinel2Layer]);

  const enableDrawing = () => {
    if (map) {
      map.removeInteraction(modifyInteraction);
      map.removeInteraction(selectInteraction);
      map.addInteraction(drawInteraction);
      setDeleteMode(false);
    }
  };

  const enableModifying = () => {
    if (map) {
      map.removeInteraction(drawInteraction);
      map.removeInteraction(selectInteraction);
      map.addInteraction(modifyInteraction);
      setDeleteMode(false);
    }
  };

  const enableDeleting = () => {
    if (map) {
      map.removeInteraction(drawInteraction);
      map.removeInteraction(modifyInteraction);
      map.addInteraction(selectInteraction);
      setDeleteMode(true);
    }
  };

  const handleLayerChange = (event) => {
    setActiveLayer(event.target.value);
  };

  return (
    <>
      <div
        id="map"
        style={{ position: "relative", width: "100%", height: "800px" }}
      >
        <div id="toolbar" className={styles.toolbar}>
          <button className={styles.button} onClick={enableDrawing}>
            Draw Polygon
          </button>
          <button className={styles.button} onClick={enableModifying}>
            Edit Polygon
          </button>
          <button className={styles.button} onClick={enableDeleting}>
            Delete Polygon
          </button>
          <div>
            <input
              type="radio"
              id="ndvi"
              name="layer"
              value="ndvi"
              checked={activeLayer === "ndvi"}
              onChange={handleLayerChange}
            />
            <label htmlFor="ndvi">NDVI Layer</label>
            <input
              type="radio"
              id="sentinel2"
              name="layer"
              value="sentinel2"
              checked={activeLayer === "sentinel2"}
              onChange={handleLayerChange}
            />
            <label htmlFor="sentinel2">Sentinel-2 Layer</label>
          </div>

        </div>
        <div
          id="mouse-position"
          style={{ position: "absolute", top: "1em", right: "1em" }}
        />
      </div>
      <div>
        {polygons.map((polygon, index) => (
          <div key={index}>
            Polygon {index + 1}: {JSON.stringify(polygon)}
          </div>
        ))}
      </div>
    </>
  );
}

export default MapComponent;
