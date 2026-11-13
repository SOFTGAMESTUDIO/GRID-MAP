import React, { useState } from 'react';
import { UserRole, CartItem, Product, Shop, Order } from './types';
import { Navbar } from './layouts/Navbar';
import { UserDashboard } from './pages/user/UserDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DriverDashboard } from './pages/driver/DriverDashboard';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  
  // Default Customer location in Ludhiana (Model Town / Central)
  const [userLocation, setUserLocation] = useState<[number, number]>([30.9010, 75.8573]);
  const [activeCity] = useState('Ludhiana, Punjab');

  // Shared Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuggestShopOpen, setIsSuggestShopOpen] = useState(false);
  
  // Active Order for Live Tracking
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const handleAddToCart = (product: Product, shop: Shop) => {
    setCart((prevCart) => {
      // If adding from a different shop, prompt or switch shop orders
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            shopId: shop.id,
            shopName: shop.name,
          },
        ];
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === productId);
      if (!existingItem) return prevCart;
      if (existingItem.quantity === 1) {
        return prevCart.filter((item) => item.product.id !== productId);
      } else {
        return prevCart.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSuggestShop={() => setIsSuggestShopOpen(true)}
          activeCity={activeCity}
        />

        <main className="pb-16">
          {currentRole === 'customer' && (
            <UserDashboard
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              activeCity={activeCity}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              isCartOpen={isCartOpen}
              onCloseCart={() => setIsCartOpen(false)}
              isSuggestShopOpen={isSuggestShopOpen}
              onCloseSuggestShop={() => setIsSuggestShopOpen(false)}
              activeOrder={activeOrder}
              setActiveOrder={setActiveOrder}
            />
          )}

          {currentRole === 'admin' && <AdminDashboard />}

          {currentRole === 'driver' && <DriverDashboard />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>NearKart Hyperlocal Engine</span>
            <span>•</span>
            <span className="text-emerald-600">Google Maps + H3 Smart Grid Architecture</span>
          </div>
          <div>
            Fastest 10-Minute Store Discovery & Direct Delivery
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

