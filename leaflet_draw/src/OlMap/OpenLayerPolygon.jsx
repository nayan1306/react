import { useEffect, useRef } from "react";
import "./ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
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
import styles from './openlayerpolygon.module.css';

// Function to generate random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function OpenLayerMap() {
  const mapRef = useRef(null); // Ref for the map container
  const vectorSourceRef = useRef(new VectorSource());
  const mapInstance = useRef(null); // Ref for the map instance
  const drawInteraction = useRef(null);
  const modifyInteraction = useRef(null);
  const selectInteraction = useRef(null);
  const deleteModeRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current) {
      console.error("Map container not found");
      return;
    }

    if (mapInstance.current) return; // Avoid re-initializing if map is already created

    // Initialize the view
    const initialView = new View({
      projection: "EPSG:4326",
      center: [78.9629, 20.5937], // Centered on India
      zoom: 5,
    });

    // Initialize the map
    const map = new Map({
      controls: defaultControls().extend([
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: "EPSG:4326",
          target: document.getElementById("mouse-position"),
        }),
      ]),
      target: mapRef.current,
      view: initialView,
    });

    // Add OpenStreetMap layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0,
    });

    // Add WMS layer
    const wmsLayer = new TileLayer({
      source: new TileWMS({
        projection: "EPSG:4326",
        url: "https://vedas.sac.gov.in/ridam_server3/wms",
        params: {
          name: "RDSGrdient",
          layers: "T0S0M0",
          PROJECTION: "EPSG:4326",
          ARGS: "merge_method:max;dataset_id:T3S1P1;from_time:20240705;to_time:20240725;indexes:1",
          styles:
            "[0:FFFFFF00:1:f0ebecFF:25:d8c4b6FF:50:ab8a75FF:75:917732FF:100:70ab06FF:125:459200FF:150:267b01FF:175:0a6701FF:200:004800FF:251:001901FF;nodata:FFFFFF00]",
          LEGEND_OPTIONS: "columnHeight:400;height:100",
        },
      }),
      opacity: 1,
      zIndex: 1,
    });

    // Add vector layer for polygons
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: (feature) => {
        const color = feature.get('color') || '#FF0000'; // Default to red if no color is set
        return new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0)', // Fully transparent fill
          }),
          stroke: new Stroke({
            color: color, // Border color
            width: 4, // Border width
          }),
        });
      },
      zIndex: 2,
    });

    map.addLayer(osmLayer);
    map.addLayer(wmsLayer);
    map.addLayer(vectorLayer);

    // Initialize interactions
    drawInteraction.current = new Draw({
      source: vectorSourceRef.current,
      type: 'Polygon',
    });

    modifyInteraction.current = new Modify({
      source: vectorSourceRef.current,
    });

    selectInteraction.current = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    // Add interactions to the map
    map.addInteraction(drawInteraction.current);
    map.addInteraction(modifyInteraction.current);
    map.addInteraction(selectInteraction.current);

    // Handle feature deletion on click
    const handleDeleteFeature = (e) => {
      if (deleteModeRef.current) {
        const features = map.getFeaturesAtPixel(e.pixel);
        if (features.length > 0) {
          const feature = features[0];
          vectorSourceRef.current.removeFeature(feature);
        }
      }
    };

    map.on('click', handleDeleteFeature);

    // Update draw interaction to set color for new polygons
    drawInteraction.current.on('drawend', (event) => {
      const feature = event.feature;
      feature.set('color', getRandomColor()); // Assign random color
    });

    mapInstance.current = map;

    // Add the blur effect to the map
    const overlay = document.createElement('div');
    overlay.id = 'map-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';

    // Apply a blur effect to the overlay
    overlay.style.background = 'url(https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=5&size=600x800&key=YOUR_API_KEY)'; // This is a placeholder URL, replace with your map URL or base64 encoded image
    overlay.style.backgroundSize = 'cover';
    overlay.style.filter = 'blur(10px)'; // Adjust blur strength as needed

    // Append the overlay to the map container
    const mapContainer = document.getElementById('map');
    mapContainer.appendChild(overlay);

    // Draw polygons on a separate canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'polygon-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // Ensure canvas doesn't capture mouse events

    mapContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      const mapSize = map.getSize();
      canvas.width = mapSize[0];
      canvas.height = mapSize[1];
    };

    // Update canvas size on map resize
    map.on('resize', updateCanvasSize);
    updateCanvasSize();

    // Draw polygons on the canvas
    const drawPolygonsOnCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      vectorSourceRef.current.forEachFeature((feature) => {
        const geometry = feature.getGeometry();
        const coordinates = geometry.getCoordinates();
        const color = feature.get('color') || '#FF0000';

        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();

        coordinates[0].forEach(([x, y], index) => {
          const [px, py] = map.getPixelFromCoordinate([x, y]);
          if (index === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.closePath();
        ctx.stroke();
      });
    };

    drawPolygonsOnCanvas();
    map.on('moveend', drawPolygonsOnCanvas);

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.removeInteraction(drawInteraction.current);
        mapInstance.current.removeInteraction(modifyInteraction.current);
        mapInstance.current.removeInteraction(selectInteraction.current);
        mapInstance.current.un('click', handleDeleteFeature);
        mapInstance.current.setTarget(null); // Properly remove map target on unmount
        mapInstance.current = null; // Clear map instance reference
      }
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  // Function to enable drawing
  const enableDrawing = () => {
    if (mapInstance.current) {
      mapInstance.current.removeInteraction(modifyInteraction.current);
      mapInstance.current.removeInteraction(selectInteraction.current);
      mapInstance.current.addInteraction(drawInteraction.current);
      deleteModeRef.current = false; // Ensure delete mode is off
    }
  };

  // Function to enable modifying
  const enableModifying = () => {
    if (mapInstance.current) {
      mapInstance.current.removeInteraction(drawInteraction.current);
      mapInstance.current.removeInteraction(selectInteraction.current);
      mapInstance.current.addInteraction(modifyInteraction.current);
      deleteModeRef.current = false; // Ensure delete mode is off
    }
  };

  // Function to enable deleting
  const enableDeleting = () => {
    if (mapInstance.current) {
      mapInstance.current.removeInteraction(drawInteraction.current);
      mapInstance.current.removeInteraction(modifyInteraction.current);
      mapInstance.current.addInteraction(selectInteraction.current);
      deleteModeRef.current = true; // Enable delete mode
    }
  };

  return (
    <>
      <h2>Open Layer Map</h2>
      <div id="map" ref={mapRef} style={{ position: 'relative', width: "100%", height: "800px" }}>
        <div id="toolbar" className={styles.toolbar}>
          <button className={styles.button} onClick={enableDrawing}>Draw Polygon</button>
          <button className={styles.button} onClick={enableModifying}>Edit Polygon</button>
          <button className={styles.button} onClick={enableDeleting}>Delete Polygon</button>
        </div>
      </div>
      <div id="mouse-position"></div>
    </>
  );
}

export default OpenLayerMap;
