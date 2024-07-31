
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { dummyNdviData } from './dumydata';


function NdviChart() {
  

  // Function to format the date as "Jan 1"
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <>
      <h2>NDVI Index Over Time</h2>
      <LineChart width={1300} height={350} data={dummyNdviData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatXAxis} padding={{ left: 50, right: 20 }}>
        </XAxis>
        <YAxis domain={[0, 1]}>
          <Label value="NDVI Index" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip />
        <Legend />
        <hr />
        <Line type="monotone" dataKey="ndvi" stroke="#82ca9d" />
      </LineChart>
    </>
  );
}

export default NdviChart;
