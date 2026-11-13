import React, { useState } from 'react';
import { CartItem, Order, Shop } from '../../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  ShoppingBag,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  shops: Shop[];
  onAddToCart: (product: any, shop: any) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
  userLocation: [number, number];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  shops,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOrderPlaced,
  userLocation,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<'home' | 'work' | 'other'>('home');
  const [customAddress, setCustomAddress] = useState('Flat 402, Green Avenue, Model Town, Ludhiana');
  const [instructions, setInstructions] = useState('Please leave near door, ring bell.');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Group by shopId
  const shopId = cart.length > 0 ? cart[0].shopId : '';
  const currentShop = shops.find((s) => s.id === shopId);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = currentShop ? currentShop.deliveryCharge : 25;
  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + deliveryFee + taxes;

  const handleCheckout = async () => {
    if (cart.length === 0 || !currentShop) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerName: 'Amanpreet Singh',
        customerPhone: '+91 98140 12345',
        deliveryAddress: {
          label: selectedAddress.toUpperCase(),
          address: customAddress,
          lat: userLocation[0],
          lng: userLocation[1],
        },
        shopId: currentShop.id,
        shopName: currentShop.name,
        shopAddress: currentShop.address,
        shopLat: currentShop.lat,
        shopLng: currentShop.lng,
        items: cart.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          unit: i.product.unit,
        })),
        subtotal,
        deliveryFee,
        taxes,
        total: grandTotal,
        deliveryInstructions: instructions,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error('Order creation failed');
      const data = await res.json();

      onClearCart();
      onClose();
      onOrderPlaced(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-black text-slate-900">Your Basket</h2>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1">Discover shops on the map and add fresh essentials.</p>
              </div>
            ) : (
              <>
                {/* Shop Source Notice */}
                {currentShop && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Ordering From
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">{currentShop.name}</div>
                      <div className="text-[11px] text-slate-500">{currentShop.address}</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                      ⚡ {currentShop.deliveryTimeMin} mins
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1 border"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs text-slate-800 line-clamp-1">{item.product.name}</div>
                        <div className="text-[11px] text-slate-400">{item.product.unit} • ₹{item.product.price}</div>
                      </div>

                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <button
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="text-slate-600 hover:text-emerald-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onAddToCart(item.product, currentShop)}
                          className="text-slate-600 hover:text-emerald-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-bold text-xs text-slate-900 min-w-[45px] text-right">
                        ₹{item.product.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Section */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Delivery Address
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                      {(['home', 'work', 'other'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedAddress(type)}
                          className={`px-2 py-0.5 rounded capitalize ${
                            selectedAddress === type ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Enter complete delivery address..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Delivery instructions (e.g. Ring bell, do not call)..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-600"
                  />
                </div>

                {/* Payment Option */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Payment Method
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / GPay' },
                      { id: 'card', label: 'Card / Net' },
                      { id: 'cod', label: 'Cash on Del.' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`text-xs py-2 px-2 rounded-xl font-bold border text-center transition-all ${
                          paymentMethod === m.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Hyperlocal Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Govt. Taxes (GST)</span>
                    <span>₹{taxes}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-100">
                    <span>To Pay</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider text-emerald-200">Total ₹{grandTotal}</div>
                  <div className="text-sm font-black">Place Hyperlocal Order</div>
                </div>
                <div className="flex items-center gap-1">
                  <span>{isSubmitting ? 'Confirming...' : 'Proceed'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

