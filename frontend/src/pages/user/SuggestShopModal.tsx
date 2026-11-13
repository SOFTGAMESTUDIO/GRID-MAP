import React, { useState } from 'react';
import { ShopCategory } from '../../types';
import { 
  X, 
  PlusCircle, 
  MapPin, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Store, 
  Phone
} from 'lucide-react';

interface SuggestShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: [number, number];
  onSubmissionSuccess: () => void;
}

export const SuggestShopModal: React.FC<SuggestShopModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSubmissionSuccess,
}) => {
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState<ShopCategory>('kirana');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState(userLocation[0]);
  const [lng, setLng] = useState(userLocation[1]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !address.trim()) {
      setError('Please provide shop name and physical address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/shops/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          category,
          address,
          phone,
          lat: Number(lat),
          lng: Number(lng),
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
          notes,
          suggestedBy: 'Amanpreet Singh (Customer)',
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Submission failed');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSubmissionSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error submitting missing shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Suggest a Missing Shop</h3>
              <p className="text-[11px] text-slate-500">Add local Kiranas & stores to your neighbourhood grid</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Submitted for Verification!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you! Our local admin team will verify the shop's physical location and add it to the active NearKart grid.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop / Business Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Verma General & Kirana Store"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShopCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                >
                  <option value="kirana">Kirana / Daily Store</option>
                  <option value="grocery">Grocery Superette</option>
                  <option value="pharmacy">Medical / Pharmacy</option>
                  <option value="fresh_produce">Fruits & Vegetables</option>
                  <option value="bakery">Bakery / Confectionery</option>
                  <option value="electronics">Electronics / Mobile</option>
                  <option value="restaurant">Restaurant / Eatery</option>
                  <option value="hardware">Hardware & Sanitary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full text-xs pl-8 pr-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address / Landmark *</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shop 4, Near Shastri Market, Model Town, Ludhiana"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Map Pin Coordinates */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Shop GPS Location
                </span>
                <span className="text-[10px] text-slate-400">Pinned from your current map center</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  placeholder="Latitude"
                  className="text-xs p-2 rounded-lg border bg-white"
                />
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  placeholder="Longitude"
                  className="text-xs p-2 rounded-lg border bg-white"
                />
              </div>
            </div>

            {/* Shop Photo URL or Image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Photo URL (Optional)</label>
              <div className="relative">
                <Upload className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/shop-photo.jpg"
                  className="w-full text-xs pl-8 pr-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sells fresh organic milk every morning"
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
              🛡️ <strong>Quality Assurance:</strong> Submitted shops undergo admin verification to avoid duplicates and protect community reliability.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Admin Approval'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

