import React, { useState } from 'react';
import { ShoppingBag, CircleDollarSign, Check, Eye } from 'lucide-react';
import { Product } from '../../types/store';
import { formatINR } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
  onNegotiate: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onNegotiate,
  onViewDetails
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isLowStock = product.stock <= 5 && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-neutral-700 hover:shadow-xl">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={resolveImageUrl(product.images[0])}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Status badges - clean unboxed or minimal tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.featured && (
            <span className="text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/10">
              Runway Edition
            </span>
          )}
          {isLowStock && (
            <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-950/80 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-mono uppercase tracking-wider bg-red-950/80 backdrop-blur-md text-red-300 px-2 py-0.5 rounded border border-red-500/20">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="absolute bottom-3 right-3 p-2 bg-black/80 hover:bg-black text-neutral-300 hover:text-white rounded-lg backdrop-blur-md border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Quick View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details & Actions */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 font-mono mb-1">
            <span>{product.sku}</span>
            <span>{product.stock} units</span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="text-base font-bold text-white tracking-tight cursor-pointer hover:text-neutral-300 transition-colors line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Sizes */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white font-mono tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-500 line-through font-mono tabular-nums">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="flex items-center gap-1">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-colors cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-white text-black font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Negotiate Price */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNegotiate(product)}
              className="py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer group/btn"
              title="Propose a custom price to store owners"
            >
              <CircleDollarSign className="w-3.5 h-3.5 text-amber-400 group-hover/btn:scale-110 transition-transform" />
              <span>Make Offer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
