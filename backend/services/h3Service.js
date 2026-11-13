import * as h3 from 'h3-js';

export function latLngToH3(lat, lng, resolution = 8) {
  try {
    return h3.latLngToCell(lat, lng, resolution);
  } catch (err) {
    console.error('H3 latLngToCell error:', err);
    return null;
  }
}

export function h3ToPolygon(h3Index) {
  try {
    return h3.cellToBoundary(h3Index);
  } catch (err) {
    console.error('H3 cellToBoundary error:', err);
    return [];
  }
}

export function h3ToCenter(h3Index) {
  try {
    return h3.cellToLatLng(h3Index);
  } catch (err) {
    console.error('H3 cellToLatLng error:', err);
    return [0, 0];
  }
}

export function getKDisk(h3Index, ringSize = 1) {
  try {
    return h3.gridDisk(h3Index, ringSize);
  } catch (err) {
    console.error('H3 gridDisk error:', err);
    return [h3Index];
  }
}

