import express from 'express';
import { 
  getShops, 
  getShopById, 
  getRecommendations, 
  submitShop, 
  adminCreateShop, 
  adminReviewSubmission, 
  getSubmissions 
} from '../controllers/shopController.js';
import { 
  getGrids, 
  updateGridStatus, 
  updateGridConfig, 
  getServiceAreas 
} from '../controllers/gridController.js';
import { 
  discoverPlaces, 
  importPlace 
} from '../controllers/placesController.js';
import { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  verifyOtpAndComplete 
} from '../controllers/orderController.js';
import { 
  getDriverProfile, 
  getAllDrivers, 
  toggleDriverStatus, 
  updateDriverLocation, 
  acceptOrder 
} from '../controllers/driverController.js';
import { 
  getSettings, 
  updateSettings, 
  getAnalytics, 
  getAuditLogs 
} from '../controllers/settingsController.js';

const router = express.Router();

// Shops & Recommendations
router.get('/shops', getShops);
router.get('/shops/recommendations', getRecommendations);
router.get('/shops/:id', getShopById);
router.post('/shops/suggest', submitShop);

// Grids & Spatial Map
router.get('/grids', getGrids);
router.patch('/grids/:id/status', updateGridStatus);
router.put('/grids/:id', updateGridConfig);
router.get('/grids/service-areas', getServiceAreas);

// Google Places Discovery
router.get('/places/discover', discoverPlaces);
router.post('/places/import', importPlace);

// Orders
router.get('/orders', getAllOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/verify-otp', verifyOtpAndComplete);

// Drivers
router.get('/drivers', getAllDrivers);
router.get('/drivers/:id', getDriverProfile);
router.patch('/drivers/:id/status', toggleDriverStatus);
router.post('/drivers/:id/location', updateDriverLocation);
router.post('/drivers/:id/accept-order', acceptOrder);

// Admin Control
router.get('/admin/analytics', getAnalytics);
router.get('/admin/submissions', getSubmissions);
router.post('/admin/submissions/:id', adminReviewSubmission);
router.post('/admin/shops', adminCreateShop);
router.get('/admin/settings', getSettings);
router.put('/admin/settings', updateSettings);
router.get('/admin/audit-logs', getAuditLogs);

export default router;

