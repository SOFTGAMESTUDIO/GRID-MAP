import { shops, grids, submissions, auditLogs } from '../models/store.js';
import { rankShops } from '../services/recommendationEngine.js';
import { v4 as uuidv4 } from 'uuid';

export function getShops(req, res) {
  const { lat, lng, category, search, gridId } = req.query;
  const customerLat = lat ? parseFloat(lat) : 30.9010;
  const customerLng = lng ? parseFloat(lng) : 75.8573;

  let currentShops = [...shops];

  if (gridId) {
    currentShops = currentShops.filter((s) => s.gridId === gridId);
  }

  if (search) {
    const q = search.toLowerCase();
    currentShops = currentShops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.featuredProducts && s.featuredProducts.some((p) => p.name.toLowerCase().includes(q)))
    );
  }

  const { rankedShops } = rankShops(currentShops, customerLat, customerLng, category);

  res.json({
    shops: rankedShops,
    count: rankedShops.length,
  });
}

export function getShopById(req, res) {
  const { id } = req.params;
  const shop = shops.find((s) => s.id === id);
  if (!shop) return res.status(404).json({ message: 'Shop not found' });
  res.json(shop);
}

export function getRecommendations(req, res) {
  const { lat, lng, category } = req.query;
  const customerLat = lat ? parseFloat(lat) : 30.9010;
  const customerLng = lng ? parseFloat(lng) : 75.8573;

  const { recommendations } = rankShops(shops, customerLat, customerLng, category);
  res.json(recommendations);
}

export function submitShop(req, res) {
  const { shopName, category, address, phone, lat, lng, photoUrl, notes, suggestedBy } = req.body;

  if (!shopName || !address) {
    return res.status(400).json({ message: 'Shop name and address are required' });
  }

  // Prevent duplicate submissions by name & vicinity
  const duplicate = submissions.find(
    (s) => s.shopName.toLowerCase() === shopName.toLowerCase() && Math.abs(s.lat - lat) < 0.001
  );
  if (duplicate) {
    return res.status(400).json({ message: 'A shop submission with this name already exists in review queue.' });
  }

  const newSubmission = {
    id: uuidv4(),
    shopName,
    category: category || 'kirana',
    address,
    phone: phone || '',
    lat: lat || 30.9010,
    lng: lng || 75.8573,
    photoUrl: photoUrl || '',
    suggestedBy: suggestedBy || 'Customer',
    notes: notes || '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  submissions.push(newSubmission);

  auditLogs.push({
    id: uuidv4(),
    action: 'SHOP_SUBMITTED',
    details: `Customer submitted missing shop: ${shopName}`,
    performedBy: suggestedBy || 'Customer',
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    message: 'Shop submitted successfully for admin approval',
    submission: newSubmission,
  });
}

export function adminCreateShop(req, res) {
  const shopData = req.body;
  const newShop = {
    id: `shop-${Date.now()}`,
    name: shopData.name,
    category: shopData.category || 'kirana',
    categoryLabel: shopData.categoryLabel || 'Retail Store',
    address: shopData.address,
    lat: parseFloat(shopData.lat) || 30.9010,
    lng: parseFloat(shopData.lng) || 75.8573,
    rating: 4.8,
    reviewCount: 1,
    isVerified: true,
    isGoogleDiscovered: false,
    openingHours: shopData.openingHours || '8:00 AM - 10:00 PM',
    isOpen: true,
    acceptsOrders: true,
    phone: shopData.phone || '+91 98000 00000',
    imageUrl: shopData.imageUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    gridId: shopData.gridId || 'GRID-LDH-001',
    deliveryTimeMin: shopData.deliveryTimeMin || 15,
    deliveryCharge: shopData.deliveryCharge || 20,
    minOrder: shopData.minOrder || 100,
    featuredProducts: [],
  };

  shops.push(newShop);

  // Update grid shop count
  const targetGrid = grids.find((g) => g.id === newShop.gridId);
  if (targetGrid) targetGrid.shopCount++;

  auditLogs.push({
    id: uuidv4(),
    action: 'SHOP_CREATED_ADMIN',
    details: `Admin added verified store: ${newShop.name}`,
    performedBy: 'admin',
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(newShop);
}

export function adminReviewSubmission(req, res) {
  const { id } = req.params;
  const { action } = req.body; // 'approve' | 'reject'

  const subIndex = submissions.findIndex((s) => s.id === id);
  if (subIndex === -1) return res.status(404).json({ message: 'Submission not found' });

  const sub = submissions[subIndex];

  if (action === 'approve') {
    sub.status = 'APPROVED';
    const newShop = {
      id: `shop-appr-${Date.now()}`,
      name: sub.shopName,
      category: sub.category,
      categoryLabel: 'Retail Store',
      address: sub.address,
      lat: sub.lat,
      lng: sub.lng,
      rating: 4.7,
      reviewCount: 1,
      isVerified: true,
      isGoogleDiscovered: false,
      openingHours: '8:00 AM - 10:00 PM',
      isOpen: true,
      acceptsOrders: true,
      phone: sub.phone,
      imageUrl: sub.photoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      gridId: 'GRID-LDH-001',
      deliveryTimeMin: 15,
      deliveryCharge: 20,
      minOrder: 80,
      featuredProducts: [],
    };
    shops.push(newShop);
    submissions.splice(subIndex, 1);

    auditLogs.push({
      id: uuidv4(),
      action: 'SUBMISSION_APPROVED',
      details: `Approved missing shop: ${sub.shopName}`,
      performedBy: 'admin',
      timestamp: new Date().toISOString(),
    });

    return res.json({ message: 'Approved and added to active NearKart grid', shop: newShop });
  } else {
    sub.status = 'REJECTED';
    submissions.splice(subIndex, 1);

    auditLogs.push({
      id: uuidv4(),
      action: 'SUBMISSION_REJECTED',
      details: `Rejected submission: ${sub.shopName}`,
      performedBy: 'admin',
      timestamp: new Date().toISOString(),
    });

    return res.json({ message: 'Submission rejected' });
  }
}

export function getSubmissions(req, res) {
  res.json(submissions);
}

