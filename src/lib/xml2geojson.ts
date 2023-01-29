import { MojMapGML2GeoJSON } from "./MojMapGML2GeoJSON.js/MojMapGML2GeoJSON";

export function xml2geojson(xml: string) {

  const xmlDOM = new DOMParser().parseFromString(xml, "text/xml");
  const geojson = MojMapGML2GeoJSON.convert(xmlDOM);

  return geojson
}
