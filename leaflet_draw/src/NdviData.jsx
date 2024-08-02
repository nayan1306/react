import  { useEffect, useRef, useState } from 'react';
import OLMap from 'ol/Map';
import OLLayerTile from 'ol/layer/Tile';
import OLSourceTileWMS from 'ol/source/TileWMS';
import OLView from 'ol/View';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

const NdviMap = () => {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateOptions, setDateOptions] = useState([]);
  const dummyCoordinate = [78.9629, 20.5937]; // Longitude, Latitude for India

  useEffect(() => {
    const fetchURL10day = "https://vedas.sac.gov.in/vone/list_data_ids?dataset_ids=NDVI_5D_S2_IND";

    async function fetchData() {
      try {
        const response = await fetch(fetchURL10day);
        const data = await response.json();
        const dataset_ids = data["NDVI_5D_S2_IND"];

        let options = dataset_ids.map(obj => {
          const splitdata = obj.split("_");
          const sdataf = splitdata[0];
          const sdatafinal = sdataf.substring(0, 8);
          const year = sdatafinal.substring(0, 4);
          const month = sdatafinal.substring(4, 6);
          const date1 = sdatafinal.substring(6, 8);

          return {
            value: year + month + date1,
            label: `${date1}-${month}-${year}`,
          };
        });

        options = options.sort((a, b) => parseInt(a.value) - parseInt(b.value));
        setDateOptions(options);
        setIsLoading(false);
        
        // Adding WMS Layer
        const map = new OLMap({
          target: mapRef.current,
          layers: [
            new OLLayerTile({
              source: new OLSourceTileWMS({
                url: 'https://vedas.sac.gov.in/vone/vone_wms',
                params: {
                  'LAYERS': 'NDVI_5D_S2_IND',
                  'FORMAT': 'image/png',
                  'VERSION': '1.1.1',
                  'CROSSORIGIN': 'anonymous',
                  'display_mode': 'single',
                  'expr': `{NDVI_5D_S2_IND$agg_range$_0$0$7$${options[0].value}$${options[0].value}$max}`,
                  'val_arr': '0,25,50,75,100,125,150,175,200,225,250',
                  'nodata_val': '0',
                  'color_arr': '0xF0EBEC00,0xDDC9BCFF,0xB19883FF,0x965945FF,0x86B30BFF,0x55A000FF,0x398700FF,0x1D7501FF,0x046301FF,0x004500FF,0x001901FF'
                }
              })
            })
          ],
          view: new OLView({
            center: fromLonLat(dummyCoordinate),
            zoom: 6
          })
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2>NDVI Data Map</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
      )}
    </div>
  );
};

export default NdviMap;
