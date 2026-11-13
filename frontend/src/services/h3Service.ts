import * as h3 from 'h3-js';

export function getH3Index(lat: number, lng: number, resolution = 8): string {
  try {
    return h3.latLngToCell(lat, lng, resolution);
  } catch (err) {
    console.error('H3 latLngToCell error:', err);
    return '';
  }
}

export function getHexagonBoundary(h3Index: string): [number, number][] {
  try {
    return h3.cellToBoundary(h3Index);
  } catch (err) {
    console.error('H3 cellToBoundary error:', err);
    return [];
  }
}

export function getHexagonCenter(h3Index: string): [number, number] {
  try {
    return h3.cellToLatLng(h3Index);
  } catch (err) {
    console.error('H3 cellToLatLng error:', err);
    return [0, 0];
  }
}

export function getSurroundingHexagons(h3Index: string, ring = 1): string[] {
  try {
    return h3.gridDisk(h3Index, ring);
  } catch (err) {
    console.error('H3 gridDisk error:', err);
    return [h3Index];
  }
}

