import { orders, drivers, auditLogs } from '../models/store.js';
import { v4 as uuidv4 } from 'uuid';

export function createOrder(req, res) {
  const {
    customerName,
    customerPhone,
    deliveryAddress,
    shopId,
    shopName,
    shopAddress,
    shopLat,
    shopLng,
    items,
    subtotal,
    deliveryFee,
    taxes,
    total,
    deliveryInstructions,
  } = req.body;

  // Find an available online driver
  const availableDriver = drivers.find((d) => d.isOnline);

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const orderId = `ord-${Date.now()}`;
  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    orderNumber,
    customerName: customerName || 'Customer',
    customerPhone: customerPhone || '+91 98000 00000',
    deliveryAddress: deliveryAddress || {
      label: 'HOME',
      address: 'Model Town, Ludhiana',
      lat: 30.8900,
      lng: 75.8470,
    },
    shopId,
    shopName,
    shopAddress,
    shopLat: parseFloat(shopLat) || 30.8935,
    shopLng: parseFloat(shopLng) || 75.8465,
    items: items || [],
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    taxes: Number(taxes),
    total: Number(total),
    status: 'ORDER_PLACED',
    deliveryPartnerId: availableDriver ? availableDriver.id : undefined,
    deliveryPartnerName: availableDriver ? availableDriver.name : undefined,
    deliveryPartnerPhone: availableDriver ? availableDriver.phone : undefined,
    deliveryPartnerLat: availableDriver ? availableDriver.currentLat : undefined,
    deliveryPartnerLng: availableDriver ? availableDriver.currentLng : undefined,
    otp,
    createdAt: new Date().toISOString(),
    estimatedDeliveryMinutes: 12,
    deliveryInstructions: deliveryInstructions || '',
  };

  orders.unshift(newOrder);

  auditLogs.push({
    id: uuidv4(),
    action: 'ORDER_CREATED',
    details: `Order #${orderNumber} created for ${shopName} (₹${total})`,
    performedBy: customerName || 'customer',
    timestamp: new Date().toISOString(),
  });

  // Emit event if io is bound
  const io = req.app.get('io');
  if (io) {
    io.emit('new_order', newOrder);
    io.to(`order:${orderId}`).emit(`order_update:${orderId}`, newOrder);
  }

  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
}

export function getAllOrders(req, res) {
  res.json(orders);
}

export function getOrderById(req, res) {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}

export function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;

  const io = req.app.get('io');
  if (io) {
    io.to(`order:${id}`).emit(`order_update:${id}`, order);
    io.emit('order_updated', order);
  }

  res.json(order);
}

export function verifyOtpAndComplete(req, res) {
  const { id } = req.params;
  const { otp } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid OTP. Please ask customer for correct 4-digit delivery OTP.' });
  }

  order.status = 'DELIVERED';

  // Credit driver
  if (order.deliveryPartnerId) {
    const driver = drivers.find((d) => d.id === order.deliveryPartnerId);
    if (driver) {
      driver.totalDeliveries++;
      driver.earningsToday += 45;
    }
  }

  auditLogs.push({
    id: uuidv4(),
    action: 'ORDER_DELIVERED',
    details: `Order #${order.orderNumber} delivered via OTP verification`,
    performedBy: 'driver',
    timestamp: new Date().toISOString(),
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`order:${id}`).emit(`order_update:${id}`, order);
    io.emit('order_updated', order);
  }

  res.json({ success: true, message: 'Order delivered successfully!', order });
}

