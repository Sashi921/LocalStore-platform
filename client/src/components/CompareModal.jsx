import React from 'react';
import { X, Layers, Star, ShoppingBag, Trash2, Check } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

export default function CompareModal({ onNavigate }) {
  const { comparedProducts, removeFromCompare, clearCompare, isOpen, setIsOpen } = useCompare();
  const { addToCart } = useCart();

  if (!isOpen || comparedProducts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Compare Local Products</h3>
              <p className="text-xs text-slate-500">Side-by-side comparison of {comparedProducts.length} items</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto overflow-y-auto mt-4 flex-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-3 text-slate-400 font-semibold uppercase tracking-wider w-36 shrink-0">Product</th>
                {comparedProducts.map((p) => (
                  <th key={p.id} className="p-3 min-w-[200px] align-top">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute -top-1 -right-1 p-1 bg-white shadow rounded-full text-slate-400 hover:text-rose-600 border border-slate-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <img
                        src={p.thumbnail || p.images?.[0]}
                        alt={p.name}
                        className="w-full h-28 object-cover rounded-xl bg-slate-50 border border-slate-100"
                      />
                      <div className="font-bold text-slate-900 text-sm mt-2 line-clamp-2">{p.name}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              
              {/* Price */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Price</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className="text-base font-extrabold text-slate-900">₹{p.price}</span>
                    {p.original_price && p.original_price > p.price && (
                      <span className="text-xs text-slate-400 line-through ml-2">₹{p.original_price}</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Customer Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3">
                    <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md w-max font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.rating > 0 ? p.rating.toFixed(1) : 'New'}</span>
                      <span className="text-slate-400 font-normal">({p.rating_count || 0})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Shop & Locality */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Sold By</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3 text-brand-700 font-bold">
                    {p.shop_name || 'Local Neighborhood Store'}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Category</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3 text-slate-600">
                    {p.category_name || 'General'}
                  </td>
                ))}
              </tr>

              {/* Unit / Packaging */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Pack Size</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3 text-slate-600">
                    {p.unit || 'Standard'}
                  </td>
                ))}
              </tr>

              {/* Stock Availability */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Availability</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3">
                    {p.stock > 0 ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        In Stock ({p.stock} available)
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-3 text-slate-400 font-semibold">Action</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-3">
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        setIsOpen(false);
                      }}
                      disabled={p.stock <= 0}
                      className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
