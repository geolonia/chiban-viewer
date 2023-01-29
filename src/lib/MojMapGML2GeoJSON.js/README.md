# MojMapGML2GeoJSON.js
[法務省登記所備付地図データ](https://www.moj.go.jp/MINJI/minji05_00494.html)のGeoJSONコンバータJavaScriptライブラリ

## サンプル
https://svgmap.github.io/MojMapGML2GeoJSON.js/MojMapGML2GeoJSONtest.html

## 使い方

ESModuleのライブラリになっています。

``` javascript
import { MojMapGML2GeoJSON } from "./MojMapGML2GeoJSON.js";
var geojs = MojMapGML2GeoJSON.convert(xmlDOM);
JSON.stringify(geojs);
```

zipファイルを直接ダウンロードして使う
```javascript
import { MojMapGML2GeoJSON } from "./MojMapGML2GeoJSON.js";
import { ZipDataDownloader } from "./ZipDataDownloader.js";

var uzd = await ZipDataDownloader.download(zipFilePath);
var r = uzd[0].content;
var xmlDOM = new DOMParser().parseFromString(r, "text/xml");
var geojs = MojMapGML2GeoJSON.convert(xmlDOM);
```

## ライセンス
GPL v3

## 出典

テスト用サンプルデータとして、以下のデータがtestdataに格納されています（2023年1月26日にダウンロード）[（当該ページのURL）](https://www.moj.go.jp/MINJI/minji05_00494.html)
* 「登記所備付地図データ中央区佃/勝どき」（法務省） : 13102-0100-28.zip
* 「登記所備付地図データ千代田区大手町１丁目」（法務省） : 13101-0100-28.xml
