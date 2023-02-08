import React from 'react';

import geojsonExtent from '@mapbox/geojson-extent';

interface Props {
  className?: string;
  geojsons: any[];
  map: any;
}

const Component = (props: Props) => {
  const mouseenter = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = '#333333'
  }

  const mouseleave = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = 'transparent'
  }

  const click = React.useCallback((event: React.MouseEvent<HTMLTableRowElement>) => {
    const key = Number(event.currentTarget.sectionRowIndex)

    if ('任意座標系' === props.geojsons[key].projection) {
      return
    }

    const geojson = props.geojsons[key].geojson

    const options = {
      duration: 3000,
      padding: 30,
    };

    const bounds = geojsonExtent(geojson);

    if (bounds) {
      window.requestAnimationFrame(() => {
        props.map.fitBounds(bounds, options);
      });
    }
  }, [props.geojsons, props.map])

  return (
    <div className={props.className}>
      <table className="log-table">
        <thead><tr><th>地図名</th><th>ファイル名</th><th>筆数</th><th>座標系</th><th>GeoJSON</th></tr></thead>
        <tbody>
          {props.geojsons.map(function(item, i){
            let link = <></>
            let style = {color: '#999999'}

            if ('任意座標系' !== item.projection) {
              const json = JSON.stringify(item.geojson, null, '  ')
              const href = `data:application/csv;charset=UTF-8,${encodeURIComponent(json)}`
              const download = item.filename.replace(/\.xml$/, '.geojson')

              link = <a data-key={i} download={download} href={href}>ダウンロード</a>
              style = {color: '#FFFFFF'}
            }

            return <tr key={i} onMouseEnter={mouseenter} onMouseLeave={mouseleave} onClick={click} style={style}>
                <td><span style={{ color: item.color || '#333333' }}>■</span> {item.name}</td>
                <td>{item.filename}</td>
                <td>{item.count}</td>
                <td>{item.projection}</td>
                <td>{link}</td>
              </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Component;
