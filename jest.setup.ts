import "@testing-library/jest-dom";

declare global {
  interface Window {
    geolonia: any;
  }
}

jest.mock('@zip.js/zip.js', () => ({
  BlobReader: jest.fn(),
  TextWriter: jest.fn(),
  ZipReader: jest.fn().mockImplementation(() => ({
    getEntries: jest.fn().mockResolvedValue([]),
    close: jest.fn(),
  })),
}));

window.geolonia = {
  Map: jest.fn().mockImplementation(() => ({
    // Map.tsx 内で呼んでいるメソッドだけ最低限用意する
    on: jest.fn(),
    addControl: jest.fn(),
    flyTo: jest.fn(),
    getSource: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
  })),
}
