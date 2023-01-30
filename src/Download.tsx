import React from 'react';

interface Props {
  className?: string;
  data: GeoJSON.FeatureCollection;
  map: any;
}

const Component = (props: Props) => {
  return (
    <div className="main">
      <div className="container">
        <h1>ダウンロード</h1>
      </div>
      <pre style={{color: '#ffffff'}}><code>{JSON.stringify(props.data, null, '  ')}</code></pre>
    </div>
  );
}

export default Component;
