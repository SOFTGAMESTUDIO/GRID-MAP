import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { NearKartMap } from '../../maps/NearKartMap';
import { 
  X, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Circle, 
  Truck, 
  Key,
  Compass,
  AlertCircle
} from 'lucide-react';
import { subscribeToOrderTracking } from '../../services/socket';

interface LiveTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Sent to store' },
  { key: 'SHOP_ACCEPTED', label: 'Shop Accepted', desc: 'Store acknowledged order' },
  { key: 'PREPARING', label: 'Preparing Items', desc: 'Packing fresh items' },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', desc: 'Partner on the way to shop' },
  { key: 'PICKED_UP', label: 'Order Picked Up', desc: 'Items collected from counter' },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'Heading towards your doorstep' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Completed successfully' },
];

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Subscribe to real-time socket events for this order
  useEffect(() => {
    if (!currentOrder?.id) return;

    const unsubscribe = subscribeToOrderTracking(currentOrder.id, (updatedOrder: Order) => {
      console.log('📡 Real-time order update received:', updatedOrder);
      setCurrentOrder(updatedOrder);
    });

    return () => {
      unsubscribe();
    };
  }, [currentOrder?.id]);

  if (!isOpen || !currentOrder) return null;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === currentOrder.status);

  // Mock drivers array for map marker
  const activeDrivers = currentOrder.deliveryPartnerLat && currentOrder.deliveryPartnerLng
    ? [
        {
          id: currentOrder.deliveryPartnerId || 'active-driver',
          name: currentOrder.deliveryPartnerName || 'Delivery Partner',
          phone: currentOrder.deliveryPartnerPhone || '+91 98888 77777',
          vehicleType: 'bike' as const,
          vehicleNumber: 'PB 10 EJ 4421',
          rating: 4.9,
          isOnline: true,
          currentLat: currentOrder.deliveryPartnerLat,
          currentLng: currentOrder.deliveryPartnerLng,
          totalDeliveries: 480,
          earningsToday: 950,
        },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200">
        
        {/* Left Side: Real-time Map Display (55%) */}
        <div className="relative w-full md:w-3/5 h-64 md:h-full bg-slate-100 flex flex-col">
          <div className="absolute top-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold font-mono">LIVE GPS RADAR</span>
          </div>

          <NearKartMap
            center={[currentOrder.shopLat, currentOrder.shopLng]}
            zoom={14}
            shops={[
              {
                id: currentOrder.shopId,
                name: currentOrder.shopName,
                category: 'grocery',
                categoryLabel: 'Retail Store',
                address: currentOrder.shopAddress,
                lat: currentOrder.shopLat,
                lng: currentOrder.shopLng,
                rating: 4.8,
                reviewCount: 120,
                isVerified: true,
                isGoogleDiscovered: false,
                openingHours: 'Open',
                isOpen: true,
                acceptsOrders: true,
                phone: '',
                imageUrl: '',
                gridId: 'GRID-LDH-001',
                deliveryTimeMin: currentOrder.estimatedDeliveryMinutes,
                deliveryCharge: currentOrder.deliveryFee,
                minOrder: 0,
              },
            ]}
            grids={[]}
            selectedShop={null}
            onSelectShop={() => {}}
            userLocation={[currentOrder.deliveryAddress.lat, currentOrder.deliveryAddress.lng]}
            activeOrder={currentOrder}
            drivers={activeDrivers}
            showGrids={false}
            travelMode="bike"
            height="100%"
            isInteractive={false}
          />
        </div>

        {/* Right Side: Order Timeline, Delivery Partner Card, OTP (45%) */}
        <div className="w-full md:w-2/5 flex-1 flex flex-col justify-between overflow-y-auto bg-white p-5 border-l border-slate-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-400 font-mono">ORDER #{currentOrder.orderNumber || currentOrder.id.slice(0, 8)}</div>
              <h2 className="text-lg font-black text-slate-900">{currentOrder.shopName}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery ETA & Secure OTP Banner */}
          <div className="my-3 space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Estimated Arrival
                </div>
                <div className="text-xl font-black text-emerald-950 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <span>{currentOrder.status === 'DELIVERED' ? 'Delivered' : `${currentOrder.estimatedDeliveryMinutes || 12} MINS`}</span>
                </div>
              </div>

              {/* Secure Delivery OTP */}
              <div className="text-right bg-white p-2 rounded-xl border border-emerald-300 shadow-sm">
                <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-end gap-1">
                  <Key className="w-2.5 h-2.5 text-amber-500" />
                  Delivery OTP
                </div>
                <div className="text-lg font-black font-mono tracking-widest text-emerald-700">
                  {currentOrder.otp || '5924'}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center bg-slate-50 py-1.5 rounded-xl border border-slate-200">
              💡 Share the OTP with your delivery partner only after receiving items.
            </div>
          </div>

          {/* Delivery Partner Details (if assigned) */}
          {currentOrder.deliveryPartnerName ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  🛵
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{currentOrder.deliveryPartnerName}</div>
                  <div className="text-[11px] text-slate-500">Honda Activa • ⭐ 4.9 (480 drops)</div>
                </div>
              </div>

              <a
                href={`tel:${currentOrder.deliveryPartnerPhone || '9888877777'}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2 text-xs text-blue-900 font-medium">
              <Truck className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Matching nearest delivery partner in your grid cell...</span>
            </div>
          )}

          {/* Order Progress Timeline */}
          <div className="my-4 py-2 border-y border-slate-100">
            <div className="text-xs font-bold text-slate-900 mb-3">Live Order Timeline</div>
            <div className="space-y-3.5">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 h-5 mt-1 ${isPassed ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isCurrent ? 'text-emerald-700 font-black' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label} {isCurrent && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded ml-1.5">In Progress</span>}
                      </div>
                      <div className="text-[11px] text-slate-400">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary & Delivery Address */}
          <div className="text-xs text-slate-600 space-y-1.5 pt-2">
            <div className="font-bold text-slate-900">Delivering To</div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentOrder.deliveryAddress.address}</span>
            </div>
            <div className="pt-2 text-slate-500 flex justify-between">
              <span>{currentOrder.items.length} items ordered</span>
              <span className="font-extrabold text-slate-900">Total ₹{currentOrder.total}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

