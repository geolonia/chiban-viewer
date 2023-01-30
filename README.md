# 地番ビューワー

本プロジェクトは、全国の登記所備付地図の電子データ用の XML ビューワーです。

XML ファイルを地図上にドラッグ&ドロップすると、XML の内容が地図上に表示されます。

![](https://www.evernote.com/l/ABWVzpjqNGFEDa2viF1DoX1q-aqMwozVxG8B/image.png)

## 主な機能

* XML ファイルを地図上にドラッグ&ドロップすると、そのデータを地図上に表示します。
* 任意座標系のデータの表示はできません。
* 以下のポリゴンは表示していません。
  * 地番が `筆界未定地-` で始まるデータ
  * 地番が `別図-` で始まるデータ
  * 地番が `地区外-` で始まるデータ
  * 地番が `道-` で始まるデータ
  * 地番が `水-` で始まるデータ
  * 地番が `河川-` で始まるデータ

## 既知の問題点

* 複数の XML ファイルをまとめてアップロードできますが、多すぎるとエラーになります。

## 謝辞

XML から GeoJSON への変換については、以下のプロジェクトの成果物をベースに一部改修して利用しています。

https://github.com/svgmap/MojMapGML2GeoJSON.js

## ライセンス

* GPL
