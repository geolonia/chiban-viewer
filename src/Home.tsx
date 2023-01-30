import React from 'react';

import Download from './Download';
import Settings from './Settings';

import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import Map from './Map'
import Uploader from './Uploader'
import Menu from './Menu'

import './Home.scss';

const geojson = {
  "type": "FeatureCollection",
  "features": []
} as GeoJSON.FeatureCollection

const Home = () => {
  const [ map, setMap ] = React.useState()
  const [ data, setData ] = React.useState<GeoJSON.FeatureCollection>(geojson)

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<></>} />
        <Route path="/download" element={<Download data={data} map={map} />} />
        <Route path="/settings" element={<Settings data={data} />} />
      </Routes>
      <Uploader className="uploader" map={map} dataCallback={setData}></Uploader>
      <Menu className='menu'></Menu>
      <Map className="map" setmap={setMap} />
    </HashRouter>
  );
}

export default Home;
