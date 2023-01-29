import React from 'react'

import {useDropzone} from 'react-dropzone'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"

import { xml2geojson } from "./lib/xml2geojson"

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
  // borderColor: '#FF0000'
}

const acceptStyle = {
  // borderColor: '#FF0000'
}

const rejectStyle = {
  // borderColor: '#FF0000',
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

const geojson = {
  "type": "FeatureCollection",
  "features": []
} as GeoJSON.FeatureCollection

const Component = (props: Props) => {

  React.useEffect(() => {
    window.addEventListener('dragenter', showUploader)
    window.addEventListener('dragleave', hideUploader)
  })

  const onDrop = React.useCallback((acceptedFiles : any) => {
    if (! props.map) {
      return
    }

    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader()

      reader.onabort = () => () => {}
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const data = reader.result as string

        try {
          geojson.features = JSON.parse(data).features
        } catch(e) {
          const _geojson = xml2geojson(data)
          geojson.features = _geojson.features
        }

        const el = document.querySelector('.uploader') as HTMLElement
        el.style.display = "none"

        props.dataCallback(geojson)

        const simpleStyle = new window.geolonia.simpleStyle(geojson, {id: file.name}).addTo(props.map).fitBounds()
        simpleStyle.updateData(geojson).fitBounds()
      }

      reader.readAsText(file)
    })

  }, [props])

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({ accept: {
    'application/octet-stream': ['.zip'],
    'text/plain': ['.xml'],
  }, onDrop, maxFiles: 100, });

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
          <p>CSV または GeoJSON フォーマットの位置情報データをドラッグ＆ドロップしてください。</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
