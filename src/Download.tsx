import React from 'react';

interface Props {
  className?: string;
  data: GeoJSON.FeatureCollection;
  map: any;
}

const style = {
  color: "#FFFFFF",
  height: "calc(100% - 70px)",
  overflow: 'scroll',
  boxSizing: 'border-box',
  padding: '8px'
} as React.CSSProperties

const Component = (props: Props) => {
  return (
    <div className="main">
      <div className="container">
        <h1>ダウンロード</h1>
      </div>
      <pre style={style}><code>{JSON.stringify(props.data, null, '  ')}</code></pre>
    </div>
  );
}

export default Component;
