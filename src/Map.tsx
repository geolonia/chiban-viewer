import { useSetAtom } from 'jotai';
import React from 'react';
import { mapAtom } from './atoms';

declare global {
  interface Window {
    geolonia: any;
  }
}

interface Props {
    className: string;
}

const Component = (props: Props) => {
  const setMap = useSetAtom(mapAtom);
  const mapContainer = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      style: "geolonia/gsi",
      hash: true,
    })

    map.on("load", () => {
      setMap(map);
    })
  }, [mapContainer, setMap])

  return (
    <>
      <div className={props.className} ref={mapContainer} data-navigation-control="on" data-gesture-handling="off"></div>
    </>
  );
}

export default Component;
