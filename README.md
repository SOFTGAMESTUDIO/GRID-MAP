# NearKart – Smart Hyperlocal Retail, Store Discovery & Delivery Platform

**NearKart** combines the best concepts of **Google Maps**, **Blinkit**, **Zepto**, and **Rapido** into a unified, grid-based hyperlocal commerce platform.

---

## 🌟 Key Highlights

- **🗺️ Interactive Map & H3 Spatial Grid Engine**: Discover stores within hexagonal H3 grid cells with live shop density and active driver coverage.
- **📍 Real-Time Route & Travel Comparisons**: Instant road distance and travel time estimates across **Two-wheeler (Bike)**, **Car**, and **Walking**.
- **🧠 5-Dimension Smart Recommendation Engine**:
  - `Nearest Shop`
  - `Fastest Delivery` (10-15 min rapid dispatch)
  - `Best Rated Shop`
  - `Lowest Delivery Cost`
  - `Best Overall Option`
- **🏪 Google Places API (New) Business Discovery**: Find nearby kiranas, supermarkets, pharmacies, and bakeries. Verified stores are clearly distinguished from Google-discovered unverified stores.
- **➕ Community Missing Shop Submissions**: Users can pin unlisted local shops on the map, provide photos, and submit them to the admin verification queue.
- **🛵 Mobile-First Delivery Partner Panel**: Online/Offline toggle, trip requests, navigation guidance, live GPS broadcasting, and customer OTP delivery completion.
- **📡 Real-Time Order Radar & 3-Point Tracking**: Live interactive map showing **Store**, **Customer Doorstep**, and **Delivery Driver** simultaneously with animated status timeline.
- **🛡️ Full-Featured Admin Control Center**: Manage H3 grid resolutions, enable/disable individual grid cells, configure delivery fees, approve community submissions, and monitor orders.

---

## 🚀 Quick Start

### 1. Installation
In the project root directory, install dependencies:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Run the Platform
You can run backend and frontend concurrently from the root directory:

```bash
# From the project root
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1 - Backend Server (Runs on port 50000 with Socket.IO)
npm run dev:backend

# Terminal 2 - Frontend Client (Runs on port 5173 with Vite)
npm run dev:frontend
```

Now open **http://localhost:5173** in your browser!

---

## 🧭 Role-Based Interfaces

Switch between interfaces seamlessly from the top navigation bar:

| Role | Purpose | Features |
|---|---|---|
| **Customer Panel** | Local discovery & shopping | Interactive Map, Grid Hexagons, Search & Category Filters, Smart Recommendations, Cart, Address Picker, Live Radar Tracking |
| **Admin Panel** | Spatial control & platform ops | H3 Grid Map Manager, Shop Verification & Manual Add, Pending Submissions Queue, Google Places Discovery Import, Order Dispatch Monitor, Audit Logs |
| **Delivery Partner** | Mobile rider workflow | Online/Offline toggle, Accept/Reject trip, Navigate to store, Confirm pickup, Live GPS movement simulator, 4-Digit OTP verification |

---

## 🗺️ Google Maps Platform Configuration

NearKart supports a **zero-cost high-performance vector map engine out of the box** (using Retina OSM tiles and vector geometries) and also supports native **Google Maps Platform** APIs:

To enable native Google Maps JavaScript API, Places API (New), and Routes API:
1. Open the **Admin Panel** -> **Settings & API Keys** tab.
2. Enter your Google Maps API Key (`AIzaSy...`).
3. Click **Save Platform Configuration**.

Or set it in `backend/.env`:
```env
PORT=50000
GOOGLE_MAPS_API_KEY=AIzaSyYourKeyHere
```

---

## 🗄️ Database Architecture

NearKart includes a production-ready PostgreSQL + PostGIS schema:
- **`database/schema.sql`**: Production DDL containing tables for `users`, `user_addresses`, `geographical_grids`, `service_areas`, `shops`, `google_places`, `shop_submissions`, `products`, `delivery_partners`, `orders`, `order_items`, and `audit_logs`.
- **`database/seed.sql`**: Initial seed data for Ludhiana, Punjab operating zones.

---

## 📱 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Leaflet, Google Maps Loader, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Uber H3 Spatial Grid (`h3-js`), UUID.
- **Database**: In-memory active engine + PostgreSQL PostGIS production schema.

