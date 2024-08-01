import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function NdviChart() {
  const dummyNdviData = [
    { "date": "2024-01-01", "ndvi": 0.52 },
    { "date": "2024-01-06", "ndvi": 0.53 },
    { "date": "2024-01-11", "ndvi": 0.58 },
    { "date": "2024-01-16", "ndvi": 0.57 },
    { "date": "2024-01-21", "ndvi": 0.61 },
    { "date": "2024-01-26", "ndvi": 0.62 },
    { "date": "2024-01-31", "ndvi": 0.66 },
    { "date": "2024-02-05", "ndvi": 0.67 },
    { "date": "2024-02-10", "ndvi": 0.68 },
    { "date": "2024-02-15", "ndvi": 0.72 },
    { "date": "2024-02-20", "ndvi": 0.72 },
    { "date": "2024-02-25", "ndvi": 0.76 },
    { "date": "2024-03-01", "ndvi": 0.79 },
    { "date": "2024-03-06", "ndvi": 0.75 },
    { "date": "2024-03-11", "ndvi": 0.78 },
    { "date": "2024-03-16", "ndvi": 0.81 },
    { "date": "2024-03-21", "ndvi": 0.82 },
    { "date": "2024-03-26", "ndvi": 0.80 },
    { "date": "2024-03-31", "ndvi": 0.82 },
    { "date": "2024-04-05", "ndvi": 0.77 },
    { "date": "2024-04-10", "ndvi": 0.86 },
    { "date": "2024-04-15", "ndvi": 0.79 },
    { "date": "2024-04-20", "ndvi": 0.80 },
    { "date": "2024-04-25", "ndvi": 0.76 },
    { "date": "2024-04-30", "ndvi": 0.79 },
    { "date": "2024-05-05", "ndvi": 0.79 },
    { "date": "2024-05-10", "ndvi": 0.73 },
    { "date": "2024-05-15", "ndvi": 0.73 },
    { "date": "2024-05-20", "ndvi": 0.68 },
    { "date": "2024-05-25", "ndvi": 0.70 },
    { "date": "2024-05-30", "ndvi": 0.66 },
    { "date": "2024-06-04", "ndvi": 0.64 },
    { "date": "2024-06-09", "ndvi": 0.61 },
    { "date": "2024-06-14", "ndvi": 0.55 },
    { "date": "2024-06-19", "ndvi": 0.57 },
    { "date": "2024-06-24", "ndvi": 0.51 },
    { "date": "2024-06-29", "ndvi": 0.52 },
    { "date": "2024-07-04", "ndvi": 0.51 },
    { "date": "2024-07-09", "ndvi": 0.47 },
    { "date": "2024-07-14", "ndvi": 0.44 },
    { "date": "2024-07-19", "ndvi": 0.46 },
    { "date": "2024-07-24", "ndvi": 0.38 },
    { "date": "2024-07-29", "ndvi": 0.38 },
    { "date": "2024-08-03", "ndvi": 0.33 },
    { "date": "2024-08-08", "ndvi": 0.33 },
    { "date": "2024-08-13", "ndvi": 0.32 },
    { "date": "2024-08-18", "ndvi": 0.29 },
    { "date": "2024-08-23", "ndvi": 0.25 },
    { "date": "2024-08-28", "ndvi": 0.23 },
    { "date": "2024-09-02", "ndvi": 0.23 },
    { "date": "2024-09-07", "ndvi": 0.25 },
    { "date": "2024-09-12", "ndvi": 0.24 },
    { "date": "2024-09-17", "ndvi": 0.20 },
    { "date": "2024-09-22", "ndvi": 0.20 },
    { "date": "2024-09-27", "ndvi": 0.19 },
    { "date": "2024-10-02", "ndvi": 0.20 },
    { "date": "2024-10-07", "ndvi": 0.22 },
    { "date": "2024-10-12", "ndvi": 0.25 },
    { "date": "2024-10-17", "ndvi": 0.22 },
    { "date": "2024-10-22", "ndvi": 0.25 },
    { "date": "2024-10-27", "ndvi": 0.24 },
    { "date": "2024-11-01", "ndvi": 0.25 },
    { "date": "2024-11-06", "ndvi": 0.24 },
    { "date": "2024-11-11", "ndvi": 0.28 },
    { "date": "2024-11-16", "ndvi": 0.30 },
    { "date": "2024-11-21", "ndvi": 0.29 },
    { "date": "2024-11-26", "ndvi": 0.30 },
    { "date": "2024-12-01", "ndvi": 0.35 },
    { "date": "2024-12-06", "ndvi": 0.40 },
    { "date": "2024-12-11", "ndvi": 0.41 },
    { "date": "2024-12-16", "ndvi": 0.40 },
    { "date": "2024-12-21", "ndvi": 0.45 },
    { "date": "2024-12-26", "ndvi": 0.47 }
  ];
  
  const [startDate, setStartDate] = useState(new Date('2024-01-01'));
  const [endDate, setEndDate] = useState(new Date('2024-12-31'));

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const filteredData = dummyNdviData.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  return (
    <>
      <h2>NDVI Index Over Time</h2>

      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            <hr />
            <label style={{ marginRight: '10px' }}>Start Date: </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
            />
            <hr />
          </div>
          <div>
            <hr />
            <label style={{ marginRight: '10px' }}>End Date: </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
            />
            <hr />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} padding={{ left: 50, right: 20 }} />
              <YAxis domain={[0, 1]}>
                <Label value="NDVI Index" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ndvi" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default NdviChart;
