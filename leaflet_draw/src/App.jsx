
import './App.css'
import NdviChart from './LineChart/NdviChart'

function App() {
  
  return (
    <>
      <h2>Polygon Drawing map</h2>
      <iframe
        src="/draw/index.html"
        width="100%"
        height="800px"
        style={{ border: "none" }}
        title="Draw"
      ></iframe>
      <hr />
      <NdviChart/>

    </>
  )
}

export default App
