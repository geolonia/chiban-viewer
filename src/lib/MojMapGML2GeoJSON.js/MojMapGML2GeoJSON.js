// Description
// 法務省　登記所備付地図オープンデータ（いまさらなGML...）のgeojsonコンバータ
//
// Copyright 2023 by Satoru Takagi @ KDDI All Rights Reserverd
//
// Programmed by Satoru Takagi
// License GPL v3 : See: https://www.gnu.org/licenses/gpl-3.0.html
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License version 3 as
//  published by the Free Software Foundation.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// History:
import { XY2BL } from "./XY2BL.js";

class MojMapGML2GeoJSON {
  /* eslint-disable no-useless-constructor */
	constructor() {}

	static convert(mojMapXmlDOM) {
		var refTable = {};
		var idTable = {};
		var obj = MojMapGML2GeoJSON.xml2js(mojMapXmlDOM, refTable, idTable);
		//console.log(obj);
		var geojs = MojMapGML2GeoJSON.moj2geojson(obj, refTable, idTable);
		return geojs;
	}

	static moj2geojson(moj, refTable, idTable) {

		var geojsRoot = {
			type: "FeatureCollection",
			features: [],
		};

		const properties = MojMapGML2GeoJSON.getRootProps(moj);

		var kei = properties["座標系"].match(/公共座標([0-9]+)系/);
		if (!kei) {
			kei = -1;
		} else {
			kei = Number(kei[1]);
		}

		// id参照データを実紐づけ
		if (refTable && idTable) {
			for (var refid in refTable) {
				var content = idTable[refid];
				var refs = refTable[refid];
				for (var ref of refs) {
					ref.content = content;
				}
			}
		}
		//
		var thema = moj["主題属性"];
		for (var themaName in thema) {
			var tds = thema[themaName];
			for (var td of tds) {
				var gm = MojMapGML2GeoJSON.getGeometry(td, kei);
        var props = MojMapGML2GeoJSON.getProperties(td);

		if ('Polygon' !== gm.type || props['地番'].match(/^道\-/) || props['地番'].match(/^水\-/)) {
          continue;
        }
		var ft = {
			geometry: gm,
			properties: props,
			type: "Feature",
		};
        ft.properties.title = `${props['大字名']}${props['地番']}`
				geojsRoot.features.push(ft);
			}
		}

    console.log(geojsRoot)
		return geojsRoot;
	}

	static excludeRootProps = [
		"xmlns",
		"xmlns:xsi",
		"xmlns:zmn",
		"主題属性",
		"図郭",
		"空間属性",
	];
	static getRootProps(mojs) {
		var ans = {};
		for (var key in mojs) {
			if (MojMapGML2GeoJSON.excludeRootProps.indexOf(key) < 0) {
				ans[key] = mojs[key];
			}
		}
		return ans;
	}

	static getProperties(ft) {
		var ans = {};
		for (var key in ft) {
			if (key !== "形状") {
				ans[key] = ft[key];
			}
		}
		return ans;
	}

	static GMtypes = {
		"zmn:GM_Point.position": "Point",
		"zmn:GM_Surface.patch": "Polygon",
		"zmn:GM_Curve.segment": "LineString",
	};

	static getGeometry(ft, kei) {
		var gtype, crds;
		var gmfeature = ft["形状"].content;
		for (var attn in gmfeature) {
			gtype = MojMapGML2GeoJSON.GMtypes[attn];
			if (gtype) {
				crds = MojMapGML2GeoJSON.getCoordinates(gmfeature, kei);
				break;
			}
		}

		crds = MojMapGML2GeoJSON.sumupEndStart(crds);

		if (gtype === "Point") {
			crds = crds[0];
		} else if (gtype === "Polygon") {
			crds = [crds];
		}

		return {
			type: gtype,
			coordinates: crds,
		};
	}

	static sumupEndStart(crds) {
		var ans = [];
		var prevp = null;
		for (var p of crds) {
			if (prevp && prevp[0] === p[0] && prevp[1] === p[1]) {
			} else {
				ans.push(p);
			}
			prevp = p;
		}
		return ans;
	}

	static coordinateKeys = ["zmn:X", "zmn:Y"];

	static getCoordinates(obj, kei, parentIds) {
		// いい加減だが・・このデータの場合、まぁこれで良いのでは・・
		var crds = [];
		if (!parentIds) {
			parentIds = {}; // 循環参照抑止データ
		}
		var pids = {};
		for (var parentId in parentIds) {
			// parentIdsのcopy
			pids[parentId] = true;
		}
		if (obj["id"]) {
			pids[obj["id"]] = true;
		}

		if (
			obj[MojMapGML2GeoJSON.coordinateKeys[0]] &&
			obj[MojMapGML2GeoJSON.coordinateKeys[1]]
		) {
			var x = Number(obj[MojMapGML2GeoJSON.coordinateKeys[0]]);
			var y = Number(obj[MojMapGML2GeoJSON.coordinateKeys[1]]);
			if (kei > 0) {
				var latlng = XY2BL.xyToBl(x, y, kei, "WGS84");
				x = latlng.longitude;
				y = latlng.latitude;
			}
			return [[x, y]];
		} else {
			for (var key in obj) {
				if (typeof obj[key] === "object") {
					if (key === "content" && obj["idref"] && pids[obj["idref"]]) {
						// 循環参照　Skip
					} else {
						var crd = MojMapGML2GeoJSON.getCoordinates(obj[key], kei, pids);
						crds = crds.concat(crd);
					}
				}
			}
			return crds;
		}
	}

	static xml2js(xml, refTable, idTable) {
		// XMLを適当なjsonデータ構造に変換・・
		var obj = MojMapGML2GeoJSON.domTraverse(
			xml.documentElement,
			refTable,
			idTable
		);
		return obj;
	}

	static domTraverse(elm, refTable, idTable) {
		var thisObj = {};
		var attrs = elm.attributes;
		if (attrs.length > 0) {
			for (var attr of attrs) {
				thisObj[attr.name] = attr.value;
				if (idTable && attr.name === "id") {
					idTable[attr.value] = thisObj;
				} else if (refTable && attr.name === "idref") {
					if (!refTable[attr.value]) {
						refTable[attr.value] = [];
					}
					refTable[attr.value].push(thisObj);
				}
			}
		}
		var children = elm.children;
		if (children.length > 0) {
			for (var ci = 0; ci < children.length; ci++) {
				var child = children[ci];
				var childObj = MojMapGML2GeoJSON.domTraverse(child, refTable, idTable);
				if (thisObj[child.tagName]) {
					if (!thisObj[child.tagName].length) {
						var tmp = thisObj[child.tagName];
						thisObj[child.tagName] = [];
						thisObj[child.tagName].push(tmp);
						thisObj[child.tagName].push(childObj);
					} else {
						thisObj[child.tagName].push(childObj);
					}
				} else {
					thisObj[child.tagName] = childObj;
				}
			}
		} else {
			// 子要素がない場合
			var textContent = elm.textContent;
			if (textContent !== "") {
				if (attrs.length === 0) {
					// 子要素も、属性もないので、textだけ
					thisObj = elm.textContent;
				} else {
					thisObj.textContent = elm.textContent;
				}
			}
		}
		return thisObj;
	}
}

export { MojMapGML2GeoJSON };
