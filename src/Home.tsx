import React from 'react';

import Map from './Map'
import Uploader from './Uploader'
import Loading from './Loading'
import Log from './Log'

import './Home.scss';

const Home = () => {
  return (
    <div className='main'>
      <Uploader className="uploader" />
      <Loading />
      <Map className="map" />
      <Log className='log' />
    </div>
  );
}

export default Home;
