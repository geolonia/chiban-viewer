import React from 'react';

import geojsonExtent from '@mapbox/geojson-extent';
import { useAtomValue } from 'jotai';
import { mapAtom, parsedXMLFilesAtom } from './atoms';

interface Props {
  className?: string;
}

const Component = (props: Props) => {
  const geojsons = useAtomValue(parsedXMLFilesAtom);
  const map = useAtomValue(mapAtom);

  const mouseenter = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = '#333333'
  }

  const mouseleave = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.currentTarget.style.backgroundColor = 'transparent'
  }

  const click = React.useCallback((event: React.MouseEvent<HTMLTableRowElement>) => {
    const key = Number(event.currentTarget.sectionRowIndex)

    if ('任意座標系' === geojsons[key].data.projection) {
      return
    }

    const geojson = geojsons[key].data.geojson

    const options = {
      duration: 3000,
      padding: 30,
    };

    const bounds = geojsonExtent(geojson);

    if (bounds) {
      window.requestAnimationFrame(() => {
        map.fitBounds(bounds, options);
      });
    }
  }, [geojsons, map])

  return (
    <div className={props.className}>
      <table className="log-table">
        <thead><tr><th>地図名</th><th>ファイル名</th><th>筆数</th><th>座標系</th><th>GeoJSON</th></tr></thead>
        <tbody>
          {geojsons.map(function(item, i){
            let link = <></>
            let style = {color: '#999999'}

            if ('任意座標系' !== item.data.projection) {
              const json = JSON.stringify(item.data.geojson, null, '  ')
              const href = `data:application/csv;charset=UTF-8,${encodeURIComponent(json)}`
              const download = item.data.filename.replace(/\.xml$/, '.geojson')

              link = <a data-key={i} download={download} href={href}>ダウンロード</a>
              style = {color: '#FFFFFF'}
            }

            return (
              <tr
                key={item.id}
                onMouseEnter={mouseenter}
                onMouseLeave={mouseleave}
                onClick={click}
                style={style}
              >
                <td><span style={{ color: item.data.color || '#333333' }}>■</span> {item.data.name}</td>
                <td>{item.data.filename}</td>
                <td>{Number(item.data.count).toLocaleString('en-US')}</td>
                <td>{item.data.projection}</td>
                <td>{link}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Component;
