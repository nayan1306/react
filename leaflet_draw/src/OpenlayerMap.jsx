import { useEffect } from "react";
import "./ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM"; // Import OpenStreetMap source
import MousePosition from "ol/control/MousePosition";
import { defaults as defaultControls } from "ol/control";
import { createStringXY } from "ol/coordinate";

function OpenLayerMap() {
  useEffect(() => {
    const projection = "EPSG:4326";

    const map = new Map({
      controls: defaultControls().extend([
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: projection,
          target: document.getElementById("mouse-position"),
        }),
      ]),
      target: "map",
      layers: [],
      view: new View({
        projection: projection,
        center: [78.9629, 20.5937], // Centered on India
        zoom: 5, // Zoom level to show India
      }),
    });

    // Add a normal OSM layer as the base layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0,
    });

    // Creating the TileWMS layer with your configuration
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
      zIndex: 1,
    });

    // Add both layers to the map
    map.addLayer(osmLayer);
    map.addLayer(wmsLayer);

    // Cleanup on unmount
    return () => {
      map.setTarget(null);
    };
  }, []);

  return (
    <>
      <h2>Open Layer Map</h2>
      <div id="map" style={{ width: "100%", height: "800px" }}></div>
      <div id="mouse-position"></div>
    </>
  );
}

export default OpenLayerMap;
