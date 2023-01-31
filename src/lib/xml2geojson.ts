import proj, {JP_ZONE_TO_EPSG_MAP} from "./proj"

export const xml2geojson = (xml: string) => {
  const r = Math.floor(Math.random()*(256));
  const g = Math.floor(Math.random()*(256));
  const b = Math.floor(Math.random()*(256));

  const geojson = {
    "type": "FeatureCollection",
    "features": []
  } as GeoJSON.FeatureCollection

  const dom = new DOMParser().parseFromString(xml, "text/xml")
  const 座標系 = dom.getElementsByTagName('座標系')[0].textContent

  if ('任意座標' === 座標系) {
    return geojson
  }

  const 筆s = dom.getElementsByTagName('筆')

  for (let i = 0; i < 筆s.length; i++) {
    const feature = {
      type: "Feature",
      geometry: {},
      properties: {},
    } as GeoJSON.Feature

    const props = 筆s[i].childNodes

    for (let j= 0; j < props.length; j++) {
      const node = props[j] as Element
      if (node.nodeName && '#text' !== node.nodeName) {
        if (node.attributes && node.attributes.getNamedItem('idref')) {
          // @ts-ignore
          feature.properties[node.nodeName] = node.attributes.getNamedItem('idref').value

          if ('形状' === node.nodeName) {
            // @ts-ignore
            const type = getGeometryType(dom, node.attributes.getNamedItem('idref').value)
            feature.geometry.type = type
            // @ts-ignore
            const cooordinates = getCoordinates(dom, node.attributes.getNamedItem('idref').value)

            // @ts-ignore
            feature.geometry.coordinates = cooordinates
          }
        } else {
          // @ts-ignore
          feature.properties[node.nodeName] = node.textContent
        }
      }
    }

    if (feature.properties && feature.properties['地番'].match(/^(別図|地区外)-/)) {
      continue;
    }

    if (feature.properties) {
      feature.properties.title = `${feature.properties['大字名']}${feature.properties['地番']}`
      feature.properties.fill = `rgba(${r}, ${g}, ${b}, 0.7)`
      feature.properties.stroke = '#FFFFFF'
    }

    geojson.features.push(feature)
  }

  return geojson
}


const getGeometryType = (dom: XMLDocument, id: string) => {
  const ref = dom.getElementById(id)
  if (ref) {
    const interiors = ref.getElementsByTagName('zmn:GM_SurfaceBoundary.interior')
    if (interiors.length) {
      return 'MultiPolygon'
    }
  }

  return 'Polygon'
}


const resolveTopology = (dom: XMLDocument, node: Element) => {
  const refs = node.getElementsByTagName('zmn:GM_CompositeCurve.generator')

  const exCoordinates = []

  for (let i = 0; i < refs.length; i++) {
    // @ts-ignore
    if (refs[i].attributes.getNamedItem('idref')) {
      // @ts-ignore
      const idref = refs[i].attributes.getNamedItem('idref').value

      if (idref) {
        const ref = dom.getElementById(idref)

        if (ref) {
          const points = ref.getElementsByTagName('zmn:GM_PointRef.point')
          const xy = pointsToXY(dom, points)
          exCoordinates.push(xy)
        }
      }
    }
  }

  return exCoordinates
}


const pointsToXY = (dom: XMLDocument, nodes: HTMLCollectionOf<Element>) => {
  // @ts-ignore
  const 座標系 = JP_ZONE_TO_EPSG_MAP[dom.getElementsByTagName('座標系')[0].textContent] || 'EPSG:4326'

  if (nodes && 座標系) {
    let coordinate

    for (let j = 0; j < nodes.length; j++) {
      // @ts-ignore
      const node = dom.getElementById(nodes[j].attributes.getNamedItem('idref').value)
      if (node) {
        const x = node.getElementsByTagName('zmn:X')[0].textContent
        const y = node.getElementsByTagName('zmn:Y')[0].textContent
        if (座標系) {
          coordinate = proj(座標系, 'EPSG:4326', [Number(y), Number(x)]);
        }
      }
    }

    return coordinate
  }
}


const getCoordinates = (dom: XMLDocument, id: string) => {
  const coordinates = []

  const ref = dom.getElementById(id)

  if (ref) {
    const interiors = ref.getElementsByTagName('zmn:GM_SurfaceBoundary.interior')
    const exterior = ref.getElementsByTagName('zmn:GM_SurfaceBoundary.exterior')[0]

    if (0 < interiors.length) { // MultiPolygon
      coordinates.push(resolveTopology(dom, exterior))

      for (let i = 0; i < interiors.length; i++) {
        const interior = interiors[i]
        coordinates.push(resolveTopology(dom, interior))
      }

      return [coordinates]
    } else { // Polygon
      coordinates.push(resolveTopology(dom, exterior))

      return coordinates
    }
  }
}
