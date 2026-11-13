import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
// Import Leaflet CSS directly from node_modules - 100% guaranteed to bundle with Vite
import 'leaflet/dist/leaflet.css';

import { Shop, GridCell, DeliveryPartner, Order } from '../types';
import { getH3Index, getHexagonBoundary, getHexagonCenter, getSurroundingHexagons } from '../services/h3Service';
import { Navigation, Layers, Eye, Bike, Car, Footprints } from 'lucide-react';

interface NearKartMapProps {
  center: [number, number];
  zoom?: number;
  shops: Shop[];
  grids: GridCell[];
  selectedShop: Shop | null;
  onSelectShop: (shop: Shop) => void;
  userLocation: [number, number];
  setUserLocation?: (loc: [number, number]) => void;
  activeOrder?: Order | null;
  drivers?: DeliveryPartner[];
  showGrids?: boolean;
  travelMode?: 'bike' | 'car' | 'walking';
  onTravelModeChange?: (mode: 'bike' | 'car' | 'walking') => void;
  height?: string;
  isInteractive?: boolean;
}

export const NearKartMap: React.FC<NearKartMapProps> = ({
  center,
  zoom = 14,
  shops,
  grids,
  selectedShop,
  onSelectShop,
  userLocation,
  setUserLocation,
  activeOrder,
  drivers = [],
  showGrids = true,
  travelMode = 'bike',
  onTravelModeChange,
  height = '620px',
  isInteractive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gridsLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [showGridOverlay, setShowGridOverlay] = useState(showGrids);
  const [activeUserGridId, setActiveUserGridId] = useState<string>('GRID-LDH-001');

  useEffect(() => {
    setShowGridOverlay(showGrids);
  }, [showGrids]);

  // 1. Initialize Leaflet Map (Safe against React 18 StrictMode duplicate mounting)
  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container if it was already used by a previous Leaflet instance
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    // Clean up any existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create fresh Leaflet map instance
    const map = L.map(containerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // 100% Free OpenStreetMap tile server
    const tileUrl = mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    gridsLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    if (setUserLocation && isInteractive) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      });
    }

    mapRef.current = map;

    // Force size invalidation so tiles and canvas render smoothly after mounting
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Map Style Switcher (Streets vs Satellite)
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const tileUrl = mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapRef.current);
  }, [mapStyle]);

  // 3. Pan to Center
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.panTo(center, { animate: true });
    }
  }, [center]);

  // 4. Render Highlighted H3 Hexagonal Grid (19 Cells)
  useEffect(() => {
    if (!gridsLayerRef.current || !mapRef.current) return;
    gridsLayerRef.current.clearLayers();

    if (!showGridOverlay) return;

    const targetLoc = userLocation && userLocation[0] ? userLocation : center;
    const userH3Index = getH3Index(targetLoc[0], targetLoc[1], 8);
    const hexIndices = userH3Index ? getSurroundingHexagons(userH3Index, 2) : [];

    const cells: {
      id: string;
      h3Index: string;
      areaName: string;
      boundary: [number, number][];
      center: [number, number];
      shopCount: number;
      activeDrivers: number;
      deliveryCharge: number;
      isUserActive: boolean;
    }[] = [];

    if (hexIndices.length > 0) {
      hexIndices.forEach((hex, idx) => {
        const boundary = getHexagonBoundary(hex);
        const hexCenter = getHexagonCenter(hex);
        const isUserActive = hex === userH3Index;
        const matched = grids.find((g) => g.h3Index === hex || g.id === `GRID-LDH-00${idx + 1}`);

        const id = matched?.id || `GRID-LDH-00${(idx % 8) + 1}`;
        const areaName = matched?.areaName || (isUserActive ? 'Model Town Central' : `Hyperlocal Sector ${idx + 1}`);
        const shopCount = matched?.shopCount ?? Math.max(2, (idx * 3) % 9 + 2);
        const activeDrivers = matched?.activeDrivers ?? Math.max(1, (idx * 2) % 4 + 2);
        const deliveryCharge = matched?.deliveryCharge ?? 20;

        if (isUserActive) {
          setActiveUserGridId(id);
        }

        cells.push({
          id,
          h3Index: hex,
          areaName,
          boundary,
          center: hexCenter,
          shopCount,
          activeDrivers,
          deliveryCharge,
          isUserActive,
        });
      });
    } else {
      grids.forEach((grid, idx) => {
        cells.push({
          id: grid.id,
          h3Index: grid.h3Index,
          areaName: grid.areaName,
          boundary: grid.boundary,
          center: grid.center,
          shopCount: grid.shopCount || 4,
          activeDrivers: grid.activeDrivers || 3,
          deliveryCharge: grid.deliveryCharge || 20,
          isUserActive: idx === 0,
        });
      });
    }

    // Render Polygons and Center Badges
    cells.forEach((cell) => {
      if (!cell.boundary || cell.boundary.length === 0) return;

      const isUserActive = cell.isUserActive;
      const strokeColor = isUserActive ? '#059669' : '#0284c7';
      const fillColor = isUserActive ? '#10b981' : '#38bdf8';

      const polygon = L.polygon(cell.boundary as L.LatLngExpression[], {
        color: strokeColor,
        weight: isUserActive ? 4 : 2,
        dashArray: isUserActive ? undefined : '3, 4',
        fillColor: fillColor,
        fillOpacity: isUserActive ? 0.35 : 0.12,
      });

      // Rich tooltip on hover
      polygon.bindTooltip(
        `<div class="p-1 font-sans text-xs min-w-[160px]">
          <div class="font-black text-slate-900 text-sm">${cell.areaName}</div>
          <div class="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">${cell.id} ${isUserActive ? '• 📍 YOUR ACTIVE GRID' : ''}</div>
          <div class="mt-1.5 flex items-center justify-between text-slate-600 font-medium">
            <span>🏪 <b>${cell.shopCount}</b> Stores</span>
            <span>🛵 <b>${cell.activeDrivers}</b> Riders</span>
          </div>
          <div class="mt-1 font-bold text-[11px] text-emerald-800 bg-emerald-50 p-1 rounded-md text-center">
            ⚡ 10-Min Fast Delivery • ₹${cell.deliveryCharge} Delivery
          </div>
        </div>`,
        { permanent: false, direction: 'center', className: 'rounded-2xl shadow-xl border border-slate-200' }
      );

      gridsLayerRef.current?.addLayer(polygon);

      // Centered Grid ID Badge
      const badgeIcon = L.divIcon({
        className: 'grid-badge',
        html: `
          <div class="px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md border whitespace-nowrap cursor-pointer transition-transform hover:scale-110 ${
            isUserActive
              ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-300'
              : 'bg-white/95 text-sky-800 border-sky-400'
          }">
            ${isUserActive ? `📍 ACTIVE: ${cell.id}` : cell.id}
          </div>
        `,
        iconSize: [85, 22],
        iconAnchor: [42, 11],
      });

      const badgeMarker = L.marker(cell.center, { icon: badgeIcon });
      gridsLayerRef.current?.addLayer(badgeMarker);
    });
  }, [grids, showGridOverlay, userLocation, center]);

  // 5. Render Shop Markers and User Location
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // User Location Pin
    if (userLocation && userLocation[0]) {
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute w-8 h-8 bg-blue-500 rounded-full animate-radar"></span>
            <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 });
      userMarker.bindTooltip('<div class="text-xs font-bold text-blue-700 px-1">📍 You Are Here</div>');
      markersLayerRef.current.addLayer(userMarker);
    }

    // Shop Markers
    shops.forEach((shop) => {
      const isSelected = selectedShop?.id === shop.id;
      const isGoogle = shop.isGoogleDiscovered;

      const bgClass = isGoogle
        ? (isSelected ? 'bg-indigo-600 ring-4 ring-indigo-200' : 'bg-indigo-500')
        : (isSelected ? 'bg-emerald-600 ring-4 ring-emerald-200' : 'bg-emerald-600');

      const shopIcon = L.divIcon({
        className: 'shop-marker',
        html: `
          <div class="flex items-center gap-1.5 px-2.5 py-1 ${bgClass} text-white text-xs font-bold rounded-full shadow-lg border border-white whitespace-nowrap cursor-pointer hover:scale-105 transition-transform">
            <span>${isGoogle ? 'G' : '🏪'}</span>
            <span class="max-w-[110px] truncate text-[11px]">${shop.name}</span>
            ${shop.rating ? `<span class="bg-black/20 px-1 py-0.2 rounded text-[10px]">★ ${shop.rating.toFixed(1)}</span>` : ''}
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 32],
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon });
      marker.on('click', () => onSelectShop(shop));
      markersLayerRef.current?.addLayer(marker);
    });

    // Drivers
    drivers.forEach((driver) => {
      if (!driver.isOnline && !activeOrder) return;

      const driverIcon = L.divIcon({
        className: 'driver-marker',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 animate-bounce duration-1000">
            <div class="w-8 h-8 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white font-bold text-sm">
              🛵
            </div>
            <div class="absolute -bottom-4 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow font-semibold whitespace-nowrap">
              ${driver.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([driver.currentLat, driver.currentLng], { icon: driverIcon, zIndexOffset: 2000 });
      markersLayerRef.current?.addLayer(marker);
    });
  }, [shops, selectedShop, userLocation, drivers, activeOrder]);

  // 6. Render Road Route Line
  useEffect(() => {
    if (!routesLayerRef.current) return;
    routesLayerRef.current.clearLayers();

    const origin = activeOrder
      ? [activeOrder.deliveryAddress.lat, activeOrder.deliveryAddress.lng]
      : userLocation;

    const destination = activeOrder
      ? [activeOrder.shopLat, activeOrder.shopLng]
      : selectedShop
      ? [selectedShop.lat, selectedShop.lng]
      : null;

    if (origin && destination) {
      const midLat = (origin[0] + destination[0]) / 2 + 0.0012;
      const midLng = (origin[1] + destination[1]) / 2 + 0.0012;

      const routeColor = travelMode === 'walking' ? '#f59e0b' : travelMode === 'bike' ? '#16a34a' : '#2563eb';

      const polyline = L.polyline([origin as [number, number], [midLat, midLng], destination as [number, number]], {
        color: routeColor,
        weight: 5,
        opacity: 0.9,
        dashArray: travelMode === 'walking' ? '6, 8' : undefined,
      });

      routesLayerRef.current.addLayer(polyline);

      if (mapRef.current && (selectedShop || activeOrder)) {
        mapRef.current.fitBounds(
          L.latLngBounds(origin as [number, number], destination as [number, number]),
          {
            padding: [50, 50],
            maxZoom: 16,
          }
        );
      }
    }
  }, [selectedShop, activeOrder, userLocation, travelMode]);

  const handleLocateMe = () => {
    if (navigator.geolocation && setUserLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          mapRef.current?.flyTo(loc, 15);
        },
        () => {
          setUserLocation(center);
          mapRef.current?.flyTo(center, 15);
        }
      );
    }
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 flex flex-col"
      style={{ height, minHeight: '520px' }}
    >
      {/* Map DOM Container - Guaranteed Non-Zero Dimensions */}
      <div ref={containerRef} className="w-full h-full flex-1" style={{ minHeight: '520px', width: '100%', height: '100%' }} />

      {/* Floating Control: Travel Mode Selector */}
      {selectedShop && onTravelModeChange && (
        <div className="absolute top-4 left-4 z-[500] flex items-center bg-white/95 backdrop-blur-md px-1 py-1 rounded-xl shadow-lg border border-slate-200">
          <button
            onClick={() => onTravelModeChange('bike')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              travelMode === 'bike' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Bike {selectedShop.travelTimes?.bike ? `(${selectedShop.travelTimes.bike}m)` : ''}</span>
          </button>
          <button
            onClick={() => onTravelModeChange('car')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              travelMode === 'car' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Car {selectedShop.travelTimes?.car ? `(${selectedShop.travelTimes.car}m)` : ''}</span>
          </button>
          <button
            onClick={() => onTravelModeChange('walking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              travelMode === 'walking' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walk {selectedShop.travelTimes?.walking ? `(${selectedShop.travelTimes.walking}m)` : ''}</span>
          </button>
        </div>
      )}

      {/* Top Banner: Prominent Active Grid Status Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-white/20 text-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-extrabold tracking-wide text-emerald-300">ACTIVE GRID: {activeUserGridId}</span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-200 text-[11px] font-semibold">10-Min Fast Delivery Active</span>
      </div>

      {/* Top Right Controls: Grid Toggle, Map Style, Locate */}
      <div className="absolute top-4 right-4 z-[500] flex items-center gap-2">
        {/* Grid Toggle */}
        <button
          onClick={() => setShowGridOverlay(!showGridOverlay)}
          title="Toggle H3 Geographical Grids"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-lg border transition-all ${
            showGridOverlay
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30 ring-2 ring-emerald-300'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-200" />
          <span>{showGridOverlay ? 'Grid: ON' : 'Grid: OFF'}</span>
        </button>

        {/* Satellite Toggle */}
        <button
          onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
          title="Toggle Satellite/Streets View"
          className="flex items-center gap-1 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl text-xs font-semibold text-slate-700 shadow-lg border border-slate-200 hover:bg-slate-50"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span className="capitalize">{mapStyle === 'streets' ? 'Satellite' : 'Streets'}</span>
        </button>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          title="Recenter to My Location"
          className="p-2 bg-white/95 backdrop-blur-md rounded-xl text-slate-700 shadow-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Navigation className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-200 text-[11px] flex flex-wrap items-center gap-3 text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border-2 border-emerald-600"></span>
          <span className="font-extrabold text-emerald-800">Your Active Grid (10-Min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-sky-500/20 border-2 border-sky-500"></span>
          <span>Neighbor Grids</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Verified Shop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span>Google Discovered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🛵</span>
          <span>Live Rider</span>
        </div>
      </div>
    </div>
  );
};
