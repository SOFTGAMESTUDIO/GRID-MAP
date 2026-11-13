# NearKart Architecture & Technical Specification

NearKart is a full-stack hyperlocal commerce and store discovery platform that unifies concepts from **Google Maps**, **Blinkit**, **Zepto**, and **Rapido** into an H3 spatial grid engine.

---

## 1. System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    NEARKART CLIENT                     │
                               │               (React 18 + TS + Tailwind)               │
                               ├────────────────────┬───────────────────┬───────────────┤
                               │   Customer Panel   │    Admin Panel    │ Driver Panel  │
                               └─────────┬──────────┴─────────┬─────────┴───────┬───────┘
                                         │                    │                 │
                                         ▼                    ▼                 ▼
┌────────────────────────┐     ┌────────────────────────────────────────────────────────┐
│  Google Maps Platform  │◄────┤                 NearKart REST Engine                   │
│  - Maps JavaScript API │     │                 (Node.js + Express)                    │
│  - Places API (New)    │     ├────────────────────────────────────────────────────────┤
│  - Routes API          │     │  • H3 Hexagonal Spatial Indexer (Uber H3 Res 8)        │
│  - Geocoding API       │     │  • Smart Shop Recommendation Engine (Road Detour 1.35x)│
└────────────────────────┘     │  • Live WebSocket Order Radar (Socket.IO)              │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                                                          ▼
                               ┌────────────────────────────────────────────────────────┐
                               │             PostgreSQL 16 + PostGIS Layer              │
                               │  - GEOMETRY(Point, 4326) / GIST Indexes                │
                               │  - GEOMETRY(Polygon, 4326) H3 Boundaries               │
                               └────────────────────────────────────────────────────────┘
```

---

## 2. Core Modules

### A. Smart H3 Geographical Grid Engine
- Uses Uber's H3 discrete global grid system (`h3-js`).
- Default resolution: **Resolution 8** (~0.737 km² hexagon area, edge length ~461m), ideal for 10-15 minute grocery and kirana delivery radii.
- Real-time shop-to-grid aggregation: computes active shop density and delivery partner coverage.
- Configurable per-grid delivery surcharge and operational radius directly from the Admin Panel.

### B. Smart Shop Recommendation Engine
Unlike traditional distance-based platforms that compute straight-line distance, NearKart computes:
1. **Urban Road Detour Factor**: Applies a 1.35x detour factor over Haversine geodesic distance to model actual street routes.
2. **Multi-Mode Travel Calculations**:
   - Two-wheeler (Bike/Scooter): ~25 km/h average traffic speed
   - Four-wheeler (Car): ~18 km/h average traffic speed
   - Walking: ~4.5 km/h average speed
3. **Five Recommendation Dimensions**:
   - `Nearest Shop`: Minimizes actual road distance.
   - `Fastest Delivery`: Minimizes store prep + rider road transit.
   - `Best Rated`: Ranks by customer review score & review count.
   - `Lowest Delivery Cost`: Ranks by lowest hyperlocal delivery fee.
   - `Best Overall Option`: Composite score factoring verification, proximity, rating, and fee.

### C. Google Places API (New) Discovery vs Platform Partners
- **Verified Platform Partners**: Registered stores with live inventory that accept in-app orders and automated rider dispatch.
- **Google Discovered Businesses**: Scanned dynamically via Google Places API (New). They are clearly marked as unverified listings so customers can view opening hours, contact details, and directions without misleading them that orders are active.
- **1-Click Admin Import**: Admins can approve and onboard discovered Google Places or community-submitted missing shops.

### D. Real-Time Rider GPS & 3-Point Tracking
- Socket.IO manages order tracking rooms (`order:<orderId>`).
- Live tracking displays 3 simultaneous nodes on the map:
  1. Selected Store pin (Emerald marker)
  2. Customer doorstep (Blue radar pulse)
  3. Delivery partner live GPS position (Animated scooter icon with heading angle)
- 4-Digit Delivery OTP verification ensures that drivers cannot complete orders prematurely.

