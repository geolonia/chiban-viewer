import React from 'react';

import Map from './Map'
import Uploader from './Uploader'
import Loading from './Loading'
import Log from './Log'

import './Home.scss';

interface XMLData {
  id: string;
  data: any;
  resolve: Function;
}

const Home = () => {
  const [ map, setMap ] = React.useState()
  const [ data, setData ] = React.useState<XMLData>()
  const [ geoJSONs, setGeoJSONs ] = React.useState<XMLData[]>([])

  React.useEffect(() => {
    if (data && data.data) {
      setGeoJSONs(array => [data.data, ...array])
      data.resolve(data.data.geojson)
    }
  }, [data])

  return (
    <div className='main'>
      <Uploader className="uploader" map={map} dataCallback={setData}></Uploader>
      <Loading className='loading'></Loading>
      <Map className="map" setmap={setMap} />
      <Log className='log' geojsons={geoJSONs} map={map}></Log>
    </div>
  );
}

export default Home;
