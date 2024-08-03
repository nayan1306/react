import { useEffect, useRef, useState } from "react";
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
  const [polygonFeatures, setPolygonFeatures] = useState([]);

  useEffect(() => {
    if (!mapRef.current) {
      console.error("Map container not found");
      return;
    }

    if (mapInstance.current) return; // Avoid re-initializing if map is already created

    const initialView = new View({
      projection: "EPSG:4326",
      center: [78.9629, 20.5937], // Centered on India
      zoom: 5,
    });

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
          styles: "[0:FFFFFF00:1:f0ebecFF:25:d8c4b6FF:50:ab8a75FF:75:917732FF:100:70ab06FF:125:459200FF:150:267b01FF:175:0a6701FF:200:004800FF:251:001901FF;nodata:FFFFFF00]",
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
          updatePolygonFeatures(); // Update the features after deletion
        }
      }
    };

    map.on('click', handleDeleteFeature);

    // Update draw interaction to set color for new polygons
    drawInteraction.current.on('drawend', (event) => {
      const feature = event.feature;
      feature.set('color', getRandomColor()); // Assign random color
      updatePolygonFeatures(); // Update the features after drawing
    });

    // Update the polygon features for masking
    const updatePolygonFeatures = () => {
      const features = [];
      vectorSourceRef.current.forEachFeature((feature) => {
        features.push(feature);
      });
      setPolygonFeatures(features);
    };

    mapInstance.current = map;

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
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || polygonFeatures.length === 0) return;
  
    // Create a canvas element for masking
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    
    mapRef.current.appendChild(canvas);
  
    const resizeCanvas = () => {
      canvas.width = mapRef.current.clientWidth;
      canvas.height = mapRef.current.clientHeight;
      drawMask(); // Redraw the mask on resize
    };
  
    // Function to draw the mask on the canvas
    const drawMask = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      // Fill the entire canvas with a semi-transparent color
      context.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Black mask with 50% opacity
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      // Set the composite operation to "destination-out" to make the inside of polygons transparent
      context.globalCompositeOperation = 'destination-out';
  
      polygonFeatures.forEach((feature) => {
        const coordinates = feature.getGeometry().getCoordinates()[0];
        context.beginPath();
        coordinates.forEach(([x, y], index) => {
          const [px, py] = mapInstance.current.getPixelFromCoordinate([x, y]);
          index === 0 ? context.moveTo(px, py) : context.lineTo(px, py);
        });
        context.closePath();
        context.fill(); // Make the inside of the polygon transparent
      });
  
      // Reset the composite operation to the default
      context.globalCompositeOperation = 'source-over';
    };
  
    // Redraw the mask when the map is moved or zoomed
    mapInstance.current.on('moveend', drawMask);
  
    // Initial draw
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  
    // Cleanup on unmount
    return () => {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      window.removeEventListener('resize', resizeCanvas);
      mapInstance.current.un('moveend', drawMask);
    };
  }, [polygonFeatures]);

  

  const enableDrawing = () => {
    if (mapInstance.current) {
      mapInstance.current.removeInteraction(modifyInteraction.current);
      mapInstance.current.removeInteraction(selectInteraction.current);
      mapInstance.current.addInteraction(drawInteraction.current);
      deleteModeRef.current = false; // Ensure delete mode is off
    }
  };

  const enableModifying = () => {
    if (mapInstance.current) {
      mapInstance.current.removeInteraction(drawInteraction.current);
      mapInstance.current.removeInteraction(selectInteraction.current);
      mapInstance.current.addInteraction(modifyInteraction.current);
      deleteModeRef.current = false; // Ensure delete mode is off
    }
  };

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