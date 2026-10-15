import React, { useState } from 'react';
import { Category, Product, OwnerProfile } from '../../../types/store';
import { api } from '../../../services/api';
import { Plus, Edit2, Trash2, Layers, Check, X } from 'lucide-react';

interface CategoriesManagerViewProps {
  categories: Category[];
  products: Product[];
  currentOwner: OwnerProfile;
  onRefresh: () => void;
}

export const CategoriesManagerView: React.FC<CategoriesManagerViewProps> = ({
  categories,
  products,
  currentOwner,
  onRefresh
}) => {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [targetCat, setTargetCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => {
    setTargetCat(null);
    setName('');
    setDescription('');
    setDisplayOrder(categories.length + 1);
    setModalMode('add');
  };

  const openEdit = (cat: Category) => {
    setTargetCat(cat);
    setName(cat.name);
    setDescription(cat.description);
    setDisplayOrder(cat.displayOrder);
    setModalMode('edit');
  };

  const openDelete = (cat: Category) => {
    setTargetCat(cat);
    setModalMode('delete');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      if (modalMode === 'add') {
        await api.addCategory({ name, description });
      } else if (modalMode === 'edit' && targetCat) {
        await api.updateCategory(targetCat.id, { name, description, displayOrder: Number(displayOrder) });
      }
      setModalMode(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!targetCat) return;
    try {
      setSubmitting(true);
      await api.deleteCategory(targetCat.id);
      setModalMode(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Catalog Taxonomy
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-outfit mt-0.5">
            Categories Management ({categories.length})
          </h2>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Order #{cat.displayOrder}</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">{count} Drops</span>
                </div>
                <h3 className="text-base font-bold text-white uppercase mt-1">{cat.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800/80">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDelete(cat)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">
              {modalMode === 'add' ? 'Create Category' : `Edit: ${targetCat?.name}`}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Footwear & Accessories"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Display Order</label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief summary of pieces in this collection..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold uppercase rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {modalMode === 'delete' && targetCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-outfit">Delete Category?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to delete <strong>{targetCat.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-lg cursor-pointer disabled:opacity-50"
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
