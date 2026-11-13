import React, { useState, useEffect } from 'react';
import { Order, DeliveryPartner } from '../../types';
import { NearKartMap } from '../../maps/NearKartMap';
import { 
  Truck, 
  Power, 
  Navigation, 
  CheckCircle, 
  Key, 
  MapPin, 
  Phone, 
  DollarSign, 
  Clock, 
  Award, 
  Bike,
  Play,
  RotateCcw
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const [driver, setDriver] = useState<DeliveryPartner>({
    id: 'driver-1',
    name: 'Rajesh Kumar',
    phone: '+91 98888 77777',
    vehicleType: 'bike',
    vehicleNumber: 'PB 10 EJ 4421',
    rating: 4.9,
    isOnline: true,
    currentLat: 30.8980,
    currentLng: 75.8420,
    totalDeliveries: 482,
    earningsToday: 840,
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pendingRequest, setPendingRequest] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSimulatingTrip, setIsSimulatingTrip] = useState(false);

  // Fetch driver active orders and pending requests
  const loadDriverState = async () => {
    try {
      const [drvRes, ordRes] = await Promise.all([
        fetch('/api/drivers/driver-1'),
        fetch('/api/orders'),
      ]);

      if (drvRes.ok) {
        const d = await drvRes.json();
        setDriver(d);
      }

      if (ordRes.ok) {
        const allOrders: Order[] = await ordRes.json();
        const ongoing = allOrders.find(
          (o) => (o.deliveryPartnerId === 'driver-1' || !o.deliveryPartnerId) && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
        );

        if (ongoing) {
          if (ongoing.deliveryPartnerId === 'driver-1') {
            setActiveOrder(ongoing);
            setPendingRequest(null);
          } else {
            setPendingRequest(ongoing);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDriverState();
  }, []);

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    const nextStatus = !driver.isOnline;
    try {
      const res = await fetch(`/api/drivers/${driver.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextStatus }),
      });
      if (res.ok) {
        setDriver({ ...driver, isOnline: nextStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Accept Order
  const handleAcceptOrder = async () => {
    if (!pendingRequest) return;
    try {
      const res = await fetch(`/api/drivers/${driver.id}/accept-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pendingRequest.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveOrder(updated);
        setPendingRequest(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm Product Pickup
  const handleConfirmPickup = async () => {
    if (!activeOrder) return;
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PICKED_UP' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveOrder(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Delivering
  const handleStartDelivering = async () => {
    if (!activeOrder) return;
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ON_THE_WAY' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveOrder(updated);
        startLiveMovementSimulation();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Live Trip Simulation (moves GPS step-by-step from shop towards customer)
  const startLiveMovementSimulation = () => {
    if (!activeOrder || isSimulatingTrip) return;
    setIsSimulatingTrip(true);

    const startLat = activeOrder.shopLat;
    const startLng = activeOrder.shopLng;
    const endLat = activeOrder.deliveryAddress.lat;
    const endLng = activeOrder.deliveryAddress.lng;

    let step = 0;
    const totalSteps = 10;

    const interval = setInterval(async () => {
      step++;
      const currentProgress = step / totalSteps;
      const nextLat = startLat + (endLat - startLat) * currentProgress;
      const nextLng = startLng + (endLng - startLng) * currentProgress;

      setDriver((prev) => ({ ...prev, currentLat: nextLat, currentLng: nextLng }));

      // Broadcast to backend
      fetch(`/api/drivers/${driver.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: nextLat, lng: nextLng }),
      }).catch(() => {});

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsSimulatingTrip(false);
      }
    }, 1500);
  };

  // Complete with Customer OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setOtpError('');

    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Incorrect OTP');
      }

      const d = await res.json();
      setActiveOrder(null);
      setOtpInput('');
      setDriver((prev) => ({
        ...prev,
        totalDeliveries: prev.totalDeliveries + 1,
        earningsToday: prev.earningsToday + 45,
      }));
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      
      {/* Mobile-First Header Card */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center font-bold text-xl shadow-md">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base">{driver.name}</h2>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                ⭐ {driver.rating}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{driver.vehicleNumber} • Rapido Partner</div>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            driver.isOnline
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{driver.isOnline ? 'Online' : 'Offline'}</span>
        </button>
      </div>

      {/* Driver Daily Earnings Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Earnings</div>
          <div className="text-xl font-black text-emerald-600 mt-0.5">₹{driver.earningsToday}</div>
          <div className="text-[10px] text-slate-400">Paid out daily to UPI</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Trips</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{driver.totalDeliveries}</div>
          <div className="text-[10px] text-slate-400">100% on-time record</div>
        </div>
      </div>

      {/* Pending Incoming Delivery Request Modal/Banner */}
      {pendingRequest && !activeOrder && (
        <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-3xl shadow-lg space-y-4 animate-bounce duration-1000">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              NEW DELIVERY REQUEST
            </span>
            <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
              Earn ₹45
            </span>
          </div>

          <div>
            <div className="font-extrabold text-sm text-slate-900">{pendingRequest.shopName}</div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Pickup: {pendingRequest.shopAddress}</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-600" />
              <span>Drop: {pendingRequest.deliveryAddress.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setPendingRequest(null)}
              className="flex-1 py-2.5 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptOrder}
              className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
            >
              Accept Trip
            </button>
          </div>
        </div>
      )}

      {/* Active Trip Workflow */}
      {activeOrder ? (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                Active Delivery Trip
              </span>
              <h3 className="font-black text-base text-slate-900 mt-1">{activeOrder.shopName}</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              #{activeOrder.orderNumber || activeOrder.id.slice(0, 8)}
            </span>
          </div>

          {/* Mini Interactive Route Map */}
          <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200">
            <NearKartMap
              center={[activeOrder.shopLat, activeOrder.shopLng]}
              zoom={14}
              shops={[]}
              grids={[]}
              selectedShop={null}
              onSelectShop={() => {}}
              userLocation={[activeOrder.deliveryAddress.lat, activeOrder.deliveryAddress.lng]}
              activeOrder={activeOrder}
              drivers={[driver]}
              showGrids={false}
              travelMode="bike"
              height="100%"
              isInteractive={false}
            />
          </div>

          {/* Step 1: Head to Store & Confirm Pickup */}
          {(activeOrder.status === 'ORDER_PLACED' || activeOrder.status === 'SHOP_ACCEPTED' || activeOrder.status === 'PREPARING' || activeOrder.status === 'DRIVER_ASSIGNED') && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-xs text-blue-900">
                📍 <strong>Step 1:</strong> Navigate to store <strong>{activeOrder.shopName}</strong> ({activeOrder.shopAddress})
              </div>
              <button
                onClick={handleConfirmPickup}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Items Picked Up from Counter</span>
              </button>
            </div>
          )}

          {/* Step 2: Head to Customer Doorstep */}
          {activeOrder.status === 'PICKED_UP' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
                🛵 <strong>Step 2:</strong> Deliver items to customer at <strong>{activeOrder.deliveryAddress.address}</strong>
              </div>
              <button
                onClick={handleStartDelivering}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Driving to Customer</span>
              </button>
            </div>
          )}

          {/* Step 3: Complete Trip with Customer OTP */}
          {activeOrder.status === 'ON_THE_WAY' && (
            <form onSubmit={handleVerifyOtp} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  Enter Customer 4-Digit OTP
                </span>
                {isSimulatingTrip && (
                  <span className="text-[10px] text-amber-600 font-bold animate-pulse">
                    🛵 Live GPS Active...
                  </span>
                )}
              </div>

              <input
                type="text"
                required
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="4-digit OTP from customer"
                className="w-full text-center tracking-widest text-lg font-mono font-black p-2.5 rounded-xl border border-slate-300 bg-white"
              />

              {otpError && (
                <div className="text-[11px] text-red-600 font-bold text-center">
                  ⚠️ {otpError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md transition-all"
              >
                Verify OTP & Complete Delivery
              </button>
            </form>
          )}

          {/* Simulation Helper */}
          <div className="pt-2 border-t flex items-center justify-between text-xs text-slate-400">
            <span>Customer: {activeOrder.customerName}</span>
            <a href={`tel:${activeOrder.customerPhone}`} className="text-emerald-700 font-bold flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-800">You are ready for orders</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Stay in your high-density grid cell to receive rapid 10-minute dispatch requests.
          </p>
        </div>
      )}

    </div>
  );
};

