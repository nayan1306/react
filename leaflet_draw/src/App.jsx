
import './App.css'
// import NdviChart from './LineChart/NdviChart'
// import GmapsPoly from './GmapPoly'
// import OpenLayerMap from './OpenlayerMap'
import MapComponent from './OlMap/MapComponent'
// import Ndvidata from './NdviData'

function App() {
  
  return (
    <>
      {/* <OpenLayerMap/> */}
      <hr />
      <MapComponent/>
      <hr />
      {/* <Ndvidata/> */}
      {/* <h2>Polygon Drawing map</h2>
      <iframe
        src="/draw/index.html"
        width="100%"
        height="800px"
        style={{ border: "none" }}
        title="Draw"
      ></iframe>
      <hr /> */}
      {/* <NdviChart/>
      <hr />
      <GmapsPoly/> */}

    </>
  )
}

export default App
