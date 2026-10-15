import React, { useState } from 'react';
import { X, ShoppingBag, CircleDollarSign, Check, ShieldCheck, Ruler, ArrowRight } from 'lucide-react';
import { Product } from '../../types/store';
import { formatINR } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onNegotiate: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onNegotiate
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-in fade-in zoom-in-95 duration-200">
        {/* Left: Product Image */}
        <div className="relative aspect-square md:aspect-auto bg-neutral-950 flex items-center justify-center overflow-hidden">
          <img
            src={resolveImageUrl(product.images[0])}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-black/80 text-white px-2.5 py-1 rounded border border-white/10">
              {product.sku}
            </span>
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[85vh]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                VELNIX ARCHIVE
              </span>
              <button
                onClick={onClose}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight mt-1 font-outfit">
              {product.title}
            </h2>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-neutral-500 line-through font-mono tabular-nums">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              <span className="text-xs text-neutral-400 ml-auto font-mono">
                {product.stock} in stock
              </span>
            </div>

            <div className="pt-4 border-t border-neutral-800/80 mt-4 space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 bg-neutral-950 text-neutral-400 border border-neutral-800 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Size Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-300">Select Size:</span>
                  <span className="text-neutral-500 font-mono text-[11px]">True to Oversized Fit</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['S', 'M', 'L', 'XL'].map(sz => {
                    const isAvailable = product.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          !isAvailable
                            ? 'opacity-30 border-neutral-800 text-neutral-600 cursor-not-allowed'
                            : selectedSize === sz
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs: Add to Cart and Make an Offer */}
          <div className="space-y-2.5 pt-4 border-t border-neutral-800">
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-3 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : `Add to Bag · ${formatINR(product.price)}`}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onNegotiate(product);
              }}
              className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CircleDollarSign className="w-4 h-4 text-amber-400" />
              <span>Make an Offer / Negotiate Price</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
