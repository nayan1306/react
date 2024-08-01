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

function OpenLayerMap() {
  const mapRef = useRef(null); // Ref for the map container
  const vectorSourceRef = useRef(new VectorSource());
  const mapRefCurrent = useRef(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [modifyInteraction, setModifyInteraction] = useState(null);
  const [selectInteraction, setSelectInteraction] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    if (!mapRef.current) {
      console.error("Map container not found");
      return;
    }

    const projection = "EPSG:4326";

    // Initialize the map
    const map = new Map({
      controls: defaultControls().extend([
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: projection,
          target: document.getElementById("mouse-position"),
        }),
      ]),
      target: mapRef.current, // Use ref for the map container
      view: new View({
        projection: projection,
        center: [78.9629, 20.5937], // Centered on India
        zoom: 5, // Zoom level to show India
      }),
    });

    // Add OpenStreetMap layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0, // Ensure this is below vector layer
    });

    // Add WMS layer
    const wmsLayer = new TileLayer({
      source: new TileWMS({
        projection: projection,
        url: "https://vedas.sac.gov.in/ridam_server3/wms",
        params: {
          name: "RDSGrdient",
          layers: "T0S0M0",
          PROJECTION: projection,
          ARGS: "merge_method:max;dataset_id:T3S1P1;from_time:20240705;to_time:20240725;indexes:1",
          styles:
            "[0:FFFFFF00:1:f0ebecFF:25:d8c4b6FF:50:ab8a75FF:75:917732FF:100:70ab06FF:125:459200FF:150:267b01FF:175:0a6701FF:200:004800FF:251:001901FF;nodata:FFFFFF00]",
          LEGEND_OPTIONS: "columnHeight:400;height:100",
        },
      }),
      opacity: 1,
      zIndex: 1, // Ensure this is below vector layer
    });

    // Add vector layer for polygons
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2,
        }),
      }),
      zIndex: 2, // Ensure this is on top of other layers
    });

    // Add layers to the map
    map.addLayer(osmLayer);
    map.addLayer(wmsLayer);
    map.addLayer(vectorLayer);

    // Initialize the draw interaction
    const draw = new Draw({
      source: vectorSourceRef.current,
      type: 'Polygon',
    });

    // Initialize the modify interaction
    const modify = new Modify({
      source: vectorSourceRef.current,
    });

    // Initialize the select interaction
    const select = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    // Add interactions to the map
    map.addInteraction(draw);
    map.addInteraction(modify);
    map.addInteraction(select);

    // Handle feature deletion on click
    map.on('click', (e) => {
      if (deleteMode) {
        const feature = map.getFeaturesAtPixel(e.pixel)[0];
        if (feature) {
          vectorSourceRef.current.removeFeature(feature);
        }
      }
    });

    // Save references to interactions for later use
    setDrawInteraction(draw);
    setModifyInteraction(modify);
    setSelectInteraction(select);
    mapRefCurrent.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRefCurrent.current) {
        mapRefCurrent.current.setTarget(null); // Properly remove map target on unmount
      }
    };
  }, [deleteMode]);

  // Function to enable drawing
  const enableDrawing = () => {
    if (mapRefCurrent.current) {
      mapRefCurrent.current.removeInteraction(drawInteraction);
      mapRefCurrent.current.addInteraction(drawInteraction);
      if (modifyInteraction) {
        mapRefCurrent.current.removeInteraction(modifyInteraction);
      }
      if (selectInteraction) {
        mapRefCurrent.current.removeInteraction(selectInteraction);
      }
      setDeleteMode(false); // Ensure delete mode is off
    }
  };

  // Function to enable modifying
  const enableModifying = () => {
    if (mapRefCurrent.current) {
      mapRefCurrent.current.removeInteraction(drawInteraction);
      mapRefCurrent.current.addInteraction(modifyInteraction);
      if (selectInteraction) {
        mapRefCurrent.current.removeInteraction(selectInteraction);
      }
      setDeleteMode(false); // Ensure delete mode is off
    }
  };

  // Function to enable deleting
  const enableDeleting = () => {
    if (mapRefCurrent.current) {
      mapRefCurrent.current.removeInteraction(drawInteraction);
      mapRefCurrent.current.removeInteraction(modifyInteraction);
      if (selectInteraction) {
        mapRefCurrent.current.addInteraction(selectInteraction);
      }
      setDeleteMode(true); // Enable delete mode
    }
  };

  return (
    <>
      <h2>Open Layer Map</h2>
      <div id="toolbar">
        <button onClick={enableDrawing}>Draw Polygon</button>
        <button onClick={enableModifying}>Edit Polygon</button>
        <button onClick={enableDeleting}>Delete Polygon</button>
      </div>
      <div id="map" ref={mapRef} style={{ width: "100%", height: "800px" }}></div>
      <div id="mouse-position"></div>
    </>
  );
}

export default OpenLayerMap;
