import { settings, auditLogs, shops, grids, drivers, orders, submissions } from '../models/store.js';

export function getSettings(req, res) {
  res.json(settings);
}

export function updateSettings(req, res) {
  const updates = req.body;
  Object.assign(settings, updates);
  res.json(settings);
}

export function getAnalytics(req, res) {
  const verifiedCount = shops.filter((s) => s.isVerified).length;
  const googleCount = shops.filter((s) => s.isGoogleDiscovered).length;
  const activeGridsCount = grids.filter((g) => g.status === 'active').length;
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  res.json({
    totalShops: shops.length,
    verifiedShops: verifiedCount,
    googleDiscovered: googleCount,
    pendingApprovals: submissions.length,
    activeGrids: activeGridsCount,
    activeDrivers: drivers.filter((d) => d.isOnline).length,
    totalOrders: orders.length,
    completedOrders,
    totalRevenue,
  });
}

export function getAuditLogs(req, res) {
  res.json(auditLogs);
}

