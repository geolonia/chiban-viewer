import React from 'react';

import Map from './Map'
import Uploader from './Uploader'
import Loading from './Loading'
import Log from './Log'

import './Home.scss';

interface XMLData {
  name: string;
  projection: string;
  count: number;
  geojson: GeoJSON.FeatureCollection;
  resolve: Function;
}

const Home = () => {
  const [ map, setMap ] = React.useState()
  const [ id, setId ] = React.useState<string>('')
  const [ data, setData ] = React.useState<XMLData>()
  const [ geoJSONs, setGeoJSONs ] = React.useState<XMLData[]>([])

  React.useEffect(() => {
    if (id && data) {
      setGeoJSONs(array => [data, ...array])
      data.resolve(data.geojson)
    }
  }, [id, data])

  return (
    <div className='main'>
      <Uploader className="uploader" map={map} dataCallback={setData} setid={setId}></Uploader>
      <Loading className='loading'></Loading>
      <Map className="map" setmap={setMap} />
      <Log className='log' geojsons={geoJSONs} map={map}></Log>
    </div>
  );
}

export default Home;
