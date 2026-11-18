import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  Package, 
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ShopkeeperProducts({ onNavigate }) {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Groceries & Staples');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [unit, setUnit] = useState('item');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        authFetch('/api/shopkeeper/products'),
        fetch('/api/products/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (catData.success) setCategories(catData.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryName(categories[0]?.name || 'Groceries & Staples');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setStock('25');
    setLowStockThreshold('5');
    setUnit('item');
    setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800');
    setTags('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryName(p.category_name);
    setDescription(p.description || '');
    setPrice(p.price.toString());
    setOriginalPrice(p.original_price ? p.original_price.toString() : '');
    setStock(p.stock.toString());
    setLowStockThreshold(p.low_stock_threshold?.toString() || '5');
    setUnit(p.unit || 'item');
    setImageUrl(p.thumbnail || p.images?.[0] || '');
    setTags(p.tags || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || stock === '') {
      showToast('Name, price and stock are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        category_name: categoryName,
        description: description.trim(),
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock),
        low_stock_threshold: Number(lowStockThreshold),
        unit: unit.trim(),
        thumbnail: imageUrl.trim(),
        images: [imageUrl.trim()],
        tags: tags.trim()
      };

      let res;
      if (editingProduct) {
        res = await authFetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editingProduct ? 'Product updated successfully' : 'Product added to store catalog', 'success');
        setIsModalOpen(false);
        await fetchProducts();
      } else {
        showToast(data.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Error saving product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}"?`)) return;

    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product removed from catalog', 'info');
        await fetchProducts();
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Error deleting product', 'error');
    }
  };

  const handleQuickStockUpdate = async (id, newStock) => {
    try {
      const res = await authFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: Math.max(0, newStock) })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock), is_low_stock: Math.max(0, newStock) <= p.low_stock_threshold } : p));
        showToast('Stock quantity updated', 'success');
      }
    } catch (e) {
      showToast('Failed to update stock', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <button
            onClick={() => onNavigate('shopkeeper-dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Store Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {products.length} products listed under your store
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter inventory by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock In Store</th>
                <th className="p-4">Sales</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Product Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail || p.images?.[0]}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-slate-400">Unit: {p.unit || 'Item'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {p.category_name}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 text-sm">₹{p.price}</div>
                    {p.original_price && p.original_price > p.price && (
                      <div className="text-[10px] text-slate-400 line-through">₹{p.original_price}</div>
                    )}
                  </td>

                  {/* Stock with quick updater */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                        p.stock <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : p.is_low_stock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock} in stock
                      </span>
                      {p.is_low_stock && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" title="Low stock alert" />
                      )}
                    </div>
                    {/* Quick increment/decrement buttons */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                      <button
                        onClick={() => handleQuickStockUpdate(p.id, p.stock - 1)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleQuickStockUpdate(p.id, p.stock + 5)}
                        className="px-1.5 py-0.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </td>

                  {/* Sales */}
                  <td className="p-4 font-bold text-slate-900">
                    {p.sales_count || 0} sold
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farm Fresh Organic Avocados"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Unit / Pack Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 1 pack, 1L, piece"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 199"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Original Price (₹) (For discount badge)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 249"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Current Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed product specifications, organic certification, origin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
