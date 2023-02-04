# 登記所備付地図データ用 XML Viewer

全国の登記所備付地図の電子データ用の XML をドラッグ＆ドロップだけで地図上に表示することができます。

以下の URL でご利用ください。

https://geolonia.github.io/chiban-viewer/

XML ファイルを地図上にドラッグ&ドロップすると、XML の内容が地図上に表示されます。

![](https://www.evernote.com/l/ABU2QFHWaFlKiq7eugxMHQrA9m_AhsZx8mAB/image.png)

XML ファイルは G 空間情報センターからダウンロードしてください。（G 空間情報センターへのログインが必要です。）

https://front.geospatial.jp/houmu-chiseki/

## 主な機能

* XML ファイルを地図上にドラッグ&ドロップすると、そのデータを地図上に表示します。
* 任意座標系のデータは無視します。
* 以下のポリゴンは表示していません。
  * 地番が `別図-` で始まるデータ
  * 地番が `地区外-` で始まるデータ
* XML ごとに色分け表示されます。

## 既知の問題点

* 複数の XML ファイルをまとめてアップロードできますが、多すぎるとエラーになります。

## ライセンス

* GPL
