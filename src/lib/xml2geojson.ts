import { MojMapGML2GeoJSON } from "./MojMapGML2GeoJSON.js/MojMapGML2GeoJSON";

const geojson = {
  type: "FeatureCollection",
  features: [],
};

export function xml2geojson(xml: string) {

  const xmlDOM = new DOMParser().parseFromString(xml, "text/xml");
  const _geojson = MojMapGML2GeoJSON.convert(xmlDOM);

  if (geojson.features.length) {
    geojson.features = geojson.features.concat(_geojson.features)
  } else {
    geojson.features = _geojson.features
  }

  console.log(geojson)

  return geojson
}
