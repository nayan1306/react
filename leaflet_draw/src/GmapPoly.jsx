import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, FeatureGroup } from "react-leaflet";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet-draw";

// PolygonDrawer component handles drawing and deleting polygons
function PolygonDrawer({ setPolygons }) {
  const map = useMap();
  const featureGroupRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true,
      },
    });

    map.addControl(drawControl);

    const handleCreated = (event) => {
      const layer = event.layer;
      const { _latlngs } = layer;
      console.log('Polygon created with coordinates:', _latlngs);
      setPolygons((prev) => [...prev, _latlngs]);
      featureGroupRef.current.addLayer(layer);
    };

    const handleDeleted = (event) => {
      const layers = event.layers;
      layers.eachLayer((layer) => {
        const { _latlngs } = layer;
        console.log('Polygon deleted with coordinates:', _latlngs);
      });
      setPolygons((prev) =>
        prev.filter((polygon) => !layers.getLayers().some((layer) => layer._latlngs === polygon))
      );
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
    };
  }, [map, setPolygons]);

  return <FeatureGroup ref={featureGroupRef} />;
}

PolygonDrawer.propTypes = {
  setPolygons: PropTypes.func.isRequired,
};

// GmapsPoly component renders the map and uses PolygonDrawer
function GmapsPoly() {
  const [polygons, setPolygons] = useState([]);

  const mapStyle = {
    height: "800px",
    width: "1800px",
  };

  const center = [23.040989, 72.456543]; 

  return (
    <>
      <h2>Leaflet Map with Polygon Drawing</h2>
      <MapContainer center={center} zoom={16} style={mapStyle}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PolygonDrawer setPolygons={setPolygons} />
        {/* Additional code to render polygons if needed */}
      </MapContainer>
    </>
  );
}

export default GmapsPoly;
