import { searchNearbyPlaces } from '../services/placesService.js';
import { shops, settings, auditLogs } from '../models/store.js';
import { v4 as uuidv4 } from 'uuid';

export async function discoverPlaces(req, res) {
  const { lat, lng, query } = req.query;
  const latitude = lat ? parseFloat(lat) : 30.9010;
  const longitude = lng ? parseFloat(lng) : 75.8573;

  const places = await searchNearbyPlaces(latitude, longitude, query, settings.googleMapsApiKey);
  res.json(places);
}

export function importPlace(req, res) {
  const { placeId } = req.body;
  if (!placeId) return res.status(400).json({ message: 'placeId is required' });

  // Prevent duplicate Google Place IDs
  const existing = shops.find((s) => s.googlePlaceId === placeId);
  if (existing) {
    return res.status(400).json({ message: 'Store already imported from Google Places' });
  }

  const newShop = {
    id: `shop-gimp-${Date.now()}`,
    name: 'Singla Departmental Store',
    category: 'grocery',
    categoryLabel: 'Grocery Store',
    address: 'Main Market, Sarabha Nagar, Ludhiana',
    lat: 30.8985,
    lng: 75.8320,
    rating: 4.6,
    reviewCount: 340,
    isVerified: true,
    isGoogleDiscovered: false, // Now verified!
    googlePlaceId: placeId,
    openingHours: '8:00 AM - 10:00 PM',
    isOpen: true,
    acceptsOrders: true,
    phone: '+91 161 2456789',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    gridId: 'GRID-LDH-002',
    deliveryTimeMin: 14,
    deliveryCharge: 25,
    minOrder: 100,
    featuredProducts: [],
  };

  shops.push(newShop);

  auditLogs.push({
    id: uuidv4(),
    action: 'GOOGLE_PLACE_IMPORTED',
    details: `Imported Google Place: ${newShop.name} (${placeId})`,
    performedBy: 'admin',
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({ message: 'Imported to verified platform partners', shop: newShop });
}

