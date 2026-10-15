import React, { useState } from 'react';
import { Product, Category, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { formatINR } from '../../../utils/currency';
import { STATIC_IMAGES, resolveImageUrl } from '../../../utils/imageHelper';
import { Plus, Edit2, Trash2, Eye, Sparkles, Check, X, Search, Image as ImageIcon } from 'lucide-react';

interface ProductsManagerViewProps {
  products: Product[];
  categories: Category[];
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const ProductsManagerView: React.FC<ProductsManagerViewProps> = ({
  products,
  categories,
  currentOwner,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(3499);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'cat-1');
  const [stock, setStock] = useState<number>(20);
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(STATIC_IMAGES.hoodie);
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setTargetProduct(null);
    setTitle('');
    setPrice(180);
    setOriginalPrice(220);
    setCostPrice(65);
    setCategoryId(categories[0]?.id || 'cat-1');
    setStock(25);
    setSku(`VNX-${Date.now().toString().slice(-4)}`);
    setDescription('');
    setImageUrl(STATIC_IMAGES.hoodie);
    setSizes(['S', 'M', 'L', 'XL']);
    setFeatured(false);
    setModalMode('add');
  };

  const openEditModal = (p: Product) => {
    setTargetProduct(p);
    setTitle(p.title);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || '');
    setCostPrice(p.costPrice || '');
    setCategoryId(p.categoryId);
    setStock(p.stock);
    setSku(p.sku);
    setDescription(p.description);
    setImageUrl(p.images[0] || '');
    setSizes(p.sizes);
    setFeatured(p.featured);
    setModalMode('edit');
  };

  const openDeleteModal = (p: Product) => {
    setTargetProduct(p);
    setModalMode('delete');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || price <= 0) return;

    try {
      setSubmitting(true);
      if (modalMode === 'add') {
        await api.addProduct({
          title,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          categoryId,
          stock: Number(stock),
          sku: sku || `VNX-${Date.now().toString().slice(-4)}`,
          description,
          images: [imageUrl],
          sizes,
          tags: ['Runway', 'Autumn Archive'],
          featured
        });
      } else if (modalMode === 'edit' && targetProduct) {
        await api.updateProduct(targetProduct.id, {
          title,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          categoryId,
          stock: Number(stock),
          sku,
          description,
          images: [imageUrl],
          sizes,
          featured
        });
      }
      setModalMode(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!targetProduct) return;
    try {
      setSubmitting(true);
      await api.deleteProduct(targetProduct.id);
      setModalMode(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const availableImages = [
    { label: 'Obsidian Hoodie', url: STATIC_IMAGES.hoodie },
    { label: 'Tactical Cargo', url: STATIC_IMAGES.cargo },
    { label: 'Obsidian Bomber', url: STATIC_IMAGES.bomber },
    { label: 'Campaign Trench', url: STATIC_IMAGES.trench }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Store Catalog Management
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Products — Add, Edit, Delete ({products.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Catalog Table */}
      <div className="border border-neutral-800 rounded-2xl bg-neutral-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 border-b border-neutral-800 text-[11px] font-mono uppercase text-neutral-400">
              <tr>
                <th className="p-4">Piece</th>
                <th className="p-4">SKU / Category</th>
                <th className="p-4">Retail Price</th>
                <th className="p-4">Cost / Margin</th>
                <th className="p-4">Stock Units</th>
                <th className="p-4">Sizes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filtered.map(p => {
                const category = categories.find(c => c.id === p.categoryId)?.name || 'General';
                const margin = p.costPrice ? Math.round(((p.price - p.costPrice) / p.price) * 100) : null;
                return (
                  <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={resolveImageUrl(p.images[0])} alt={p.title} className="w-12 h-12 object-cover rounded-lg bg-neutral-900" />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{p.title}</div>
                          {p.featured && (
                            <span className="text-[9px] font-mono uppercase text-amber-400">★ Runway Featured</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="text-white font-semibold">{p.sku}</div>
                      <div className="text-neutral-400 text-[11px]">{category}</div>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="text-sm font-bold text-white tabular-nums">{formatINR(p.price)}</div>
                      {p.originalPrice && (
                        <div className="text-[10px] text-neutral-500 line-through tabular-nums">{formatINR(p.originalPrice)}</div>
                      )}
                    </td>

                    <td className="p-4 font-mono">
                      {p.costPrice ? (
                        <>
                          <div className="text-neutral-300 tabular-nums">{formatINR(p.costPrice)}</div>
                          <div className="text-[10px] text-emerald-400">{margin}% margin</div>
                        </>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>

                    <td className="p-4 font-mono">
                      <span className={`font-bold tabular-nums ${p.stock <= 5 ? 'text-amber-400' : 'text-neutral-200'}`}>
                        {p.stock}
                      </span>
                      {p.stock <= 5 && (
                        <span className="text-[10px] text-amber-500 block uppercase">Low</span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-neutral-400">
                      {p.sizes.join(' · ')}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white uppercase font-outfit">
                {modalMode === 'add' ? 'Add New Product Drop' : `Edit Product: ${targetProduct?.title}`}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-neutral-400 hover:text-white text-xs cursor-pointer">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Obsidian Heavyweight Cyber Hoodie"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Retail Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Original Price (₹ INR)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Production Cost (₹ INR)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={e => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">SKU Reference</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Image selector */}
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Product Visual Image</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {availableImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setImageUrl(img.url)}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        imageUrl === img.url ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-14 object-cover" />
                      <div className="p-1 text-[9px] truncate text-center bg-neutral-950 text-neutral-400 font-mono">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="Or enter custom image URL..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-white font-mono text-[11px]"
                />
              </div>

              {/* Sizes and Featured */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800">
                <div>
                  <span className="block font-medium text-neutral-300 mb-1">Available Sizes</span>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSizes(sizes.includes(sz) ? sizes.filter(s => s !== sz) : [...sizes, sz]);
                        }}
                        className={`w-7 h-7 text-xs font-mono font-bold rounded border cursor-pointer ${
                          sizes.includes(sz)
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span className="text-white font-medium">Feature on Homepage Runway</span>
                </label>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Description & Material Specs</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Fabric composition, hardware details, fit guidance..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Product Drop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalMode === 'delete' && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">
              Delete Product Drop?
            </h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to permanently delete <strong>{targetProduct.title}</strong> ({targetProduct.sku})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
