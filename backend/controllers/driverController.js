import { drivers, orders } from '../models/store.js';

export function getDriverProfile(req, res) {
  const { id } = req.params;
  const driver = drivers.find((d) => d.id === id) || drivers[0];
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  res.json(driver);
}

export function getAllDrivers(req, res) {
  res.json(drivers);
}

export function toggleDriverStatus(req, res) {
  const { id } = req.params;
  const { isOnline } = req.body;

  const driver = drivers.find((d) => d.id === id);
  if (!driver) return res.status(404).json({ message: 'Driver not found' });

  driver.isOnline = isOnline;
  res.json(driver);
}

export function updateDriverLocation(req, res) {
  const { id } = req.params;
  const { lat, lng } = req.body;

  const driver = drivers.find((d) => d.id === id);
  if (!driver) return res.status(404).json({ message: 'Driver not found' });

  driver.currentLat = parseFloat(lat);
  driver.currentLng = parseFloat(lng);

  // If driver has an active order, update order deliveryPartner coordinates
  orders.forEach((ord) => {
    if (ord.deliveryPartnerId === id && ord.status !== 'DELIVERED') {
      ord.deliveryPartnerLat = driver.currentLat;
      ord.deliveryPartnerLng = driver.currentLng;

      const io = req.app.get('io');
      if (io) {
        io.to(`order:${ord.id}`).emit(`order_update:${ord.id}`, ord);
      }
    }
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('driver_location', {
      driverId: id,
      lat: driver.currentLat,
      lng: driver.currentLng,
    });
  }

  res.json(driver);
}

export function acceptOrder(req, res) {
  const { id } = req.params;
  const { orderId } = req.body;

  const driver = drivers.find((d) => d.id === id);
  const order = orders.find((o) => o.id === orderId);

  if (!driver || !order) return res.status(404).json({ message: 'Driver or Order not found' });

  order.deliveryPartnerId = driver.id;
  order.deliveryPartnerName = driver.name;
  order.deliveryPartnerPhone = driver.phone;
  order.deliveryPartnerLat = driver.currentLat;
  order.deliveryPartnerLng = driver.currentLng;
  order.status = 'DRIVER_ASSIGNED';

  const io = req.app.get('io');
  if (io) {
    io.to(`order:${orderId}`).emit(`order_update:${orderId}`, order);
    io.emit('order_updated', order);
  }

  res.json(order);
}

