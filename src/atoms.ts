import { atom } from 'jotai';

export type ParsedXMLData = {
  id: string;
  data?: {
    name: string,
    filename: string,
    projection: string,
    count: number,
    geojson: GeoJSON.FeatureCollection,
    color: string,
  };
  error?: string;
};

export const loadingAtom = atom(false);
export const mapAtom = atom<any>(null);
export const parsedXMLFilesAtom = atom<ParsedXMLData[]>([]);

export const addParsedXMLDataAtom = atom(null, (get, set, data: ParsedXMLData) => {
  set(parsedXMLFilesAtom, [data, ...get(parsedXMLFilesAtom)])
});
