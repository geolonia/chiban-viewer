import React from 'react';

import Map from './Map'
import Uploader from './Uploader'
import Loading from './Loading'
import Log from './Log'

import './Home.scss';

interface XMLData {
  name: string;
  projection: string;
  geojson: GeoJSON.FeatureCollection;
}

const Home = () => {
  const [ map, setMap ] = React.useState()
  const [ data, setData ] = React.useState<XMLData>()
  const [ geoJSONs, setGeoJSONs ] = React.useState<XMLData[]>([])

  React.useEffect(() => {
    if (data && data.geojson.features && data.geojson.features.length) {
      setGeoJSONs(array => [data, ...array])
    }
  }, [data])

  return (
    <div>
      <Uploader className="uploader" map={map} dataCallback={setData}></Uploader>
      <Loading className='loading'></Loading>
      <Map className="map" setmap={setMap} />
      <Log className='log' geojsons={geoJSONs} map={map}></Log>
    </div>
  );
}

export default Home;
