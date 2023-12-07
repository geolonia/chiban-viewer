import React from 'react'

import {useDropzone} from 'react-dropzone'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import geojsonExtent from '@mapbox/geojson-extent';

import { xml2geojson } from "./lib/xml2geojson"

const maxFiles = 100

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '##FFFFFF',
  borderStyle: 'dashed',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#FFFFFF',
  outline: 'none',
  transition: 'border .24s ease-in-out',
}

const focusedStyle = {
  borderColor: '#FFFFFF'
}

const acceptStyle = {
  borderColor: '#FFFFFF'
}

const rejectStyle = {
  borderColor: '#FF0000',
}

let lastTarget: any = null; // cache the last target here

const showUploader = (event: DragEvent) => {
  lastTarget = event.target; // cache the last target here
  const el = document.querySelector('.uploader') as HTMLDivElement
  el.style.display = "block"
}

const hideUploader = (event: DragEvent) => {
  if(event.target === lastTarget || event.target === document) {
    const el = document.querySelector('.uploader') as HTMLElement
    el.style.display = "none"
  }
}

interface Props {
  className: string;
  map: any;
  dataCallback: Function;
}

const Component = (props: Props) => {

  React.useEffect(() => {
    window.addEventListener('dragenter', showUploader)
    window.addEventListener('dragleave', hideUploader)
  })

  const onDrop = React.useCallback((acceptedFiles : any) => {
    if (! props.map) {
      return
    }

    if (0 === acceptedFiles.length) {
      return
    }

    const uploader = document.querySelector('.uploader') as HTMLElement
    uploader.style.display = "none"

    const loading = document.querySelector('.loading') as HTMLElement
    loading.style.display = "block"

    const promises = []

    for (let i = 0; i < acceptedFiles.length; i++) {
      /* eslint-disable no-loop-func */
      const promise = new Promise((resolve, reject) => {
        const file = acceptedFiles[i]

        const id = file.name.replace(/\..+?$/, '')

        if (props.map.getSource(id)) { // 重複のためスキップ
          resolve({
            "type": "FeatureCollection",
            "features": []
          })

          return
        }

        const reader = new FileReader()
        reader.readAsText(file)

        reader.onabort = () => () => {}
        reader.onerror = () => console.log('file reading has failed')

        reader.onload = async () => {
          let data = ''
          let filename = ''
          if (
            'application/zip' === file.type ||
            'application/x-zip-compressed' === file.type
          ) {
            const entry = (await (new ZipReader(new BlobReader(file))).getEntries({})).shift();
            if (entry) {
              data = await entry.getData(new TextWriter())
              filename = entry.filename
            }
          } else {
            data = reader.result as string
            filename = file.name
          }

          const geojson = {
            "type": "FeatureCollection",
            "features": []
          } as GeoJSON.FeatureCollection

          const _geojson = xml2geojson(data)
          if (_geojson.geojson) {
            geojson.features = _geojson.geojson.features
          }

          const projection = _geojson.projection || ''
          const name = _geojson.name || ''
          const count =  _geojson.count || 0
          const color = _geojson.color || ''

          await props.dataCallback(() => {
            return {
              id: id,
              data: {
                name: name,
                filename: filename,
                projection: projection,
                count: count,
                geojson: geojson,
                color: color,
              },
              resolve: resolve,
            }
          })

          if ('任意座標系' !== projection) {
            if (! props.map.getSource(id)) {
              const simpleStyle = new window.geolonia.simpleStyle(geojson, {id: id}).addTo(props.map)
              simpleStyle.updateData(geojson)
            }
          }
        }
      }) // end Promise()

      promises.push(promise)
    }

    Promise.all(promises).then((res) => {
      const data = res.reverse()
      let merged = {
        "type": "FeatureCollection",
        "features": []
      } as GeoJSON.FeatureCollection
      let features = [] as any

      for (let i = 0; i < data.length; i++) {
        const geojson = data[i] as GeoJSON.FeatureCollection
        if (! geojson.features.length) {
          continue;
        }

        features = features.concat(geojson.features)
      }

      merged.features = features

      const options = {
        duration: 3000,
        padding: 30,
      };

      const bounds = geojsonExtent(merged);

      if (bounds) {
        window.requestAnimationFrame(() => {
          props.map.fitBounds(bounds, options);
        });
      }

      loading.style.display = "none"
    }).catch(() => {
      // nothing todo
    })

  }, [props])

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({ accept: {
    'application/zip': ['.zip'],
    'application/xml': ['.xml'],
    'text/xml': ['.xml'],
  }, onDrop, maxFiles: maxFiles, });

  const style = React.useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);

  return (
    <div className={props.className}>
      <div {...getRootProps({className: 'dropzone', style})}>
        <input {...getInputProps()} />
        <div>
          <p style={{ fontSize: '144px', margin: 0, lineHeight: '144px' }}><FontAwesomeIcon icon={ faCloudArrowUp } /></p>
          <p>地図 XML ファイル（または .zip ファイル）をここにドラッグ＆ドロップしてください。<br />最大で{ maxFiles }個のファイルをアップロードすることができます。</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
