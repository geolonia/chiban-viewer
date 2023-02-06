import React from 'react'

import {useDropzone} from 'react-dropzone'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";

import { xml2geojson } from "./lib/xml2geojson"

const maxFiles = 10

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

    if (0 === acceptedFiles.length) {
      return
    }

    const uploader = document.querySelector('.uploader') as HTMLElement
    uploader.style.display = "none"

    const loading = document.querySelector('.loading') as HTMLElement
    loading.style.display = "block"

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]

      const id = file.name.replace(/\..+?$/, '')
      const reader = new FileReader()

      reader.onabort = () => () => {}
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = async () => {

        let data = ''

        if ('application/zip' === file.type) {
          const entry = (await (new ZipReader(new BlobReader(file))).getEntries({ filenameEncoding: 'utf-8' })).shift();
          if (entry) {
            data = await entry.getData(new TextWriter())
          }
        } else {
          data = reader.result as string
        }

        try {
          geojson.features = JSON.parse(data).features
        } catch(e) {
          const _geojson = xml2geojson(data)
          geojson.features = _geojson.features
        }

        props.dataCallback(geojson)

        if (! props.map.getSource(id)) {
          if (i + 1 === acceptedFiles.length) {
            const simpleStyle = new window.geolonia.simpleStyle(geojson, {id: id}).addTo(props.map).fitBounds()
            simpleStyle.updateData(geojson).fitBounds()
            loading.style.display = "none"
          } else {
            const simpleStyle = new window.geolonia.simpleStyle(geojson, {id: id}).addTo(props.map)
            simpleStyle.updateData(geojson)
          }
        }
      }

      reader.readAsText(file)
    }

  }, [props])

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({ accept: {
    'application/zip': ['.zip'],
    'text/plain': ['.xml', '.json', '.geojson'],
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
