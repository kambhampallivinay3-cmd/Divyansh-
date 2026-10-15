import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  CustomerRequest,
  Negotiation,
  Customer,
  SiteSettings,
  Discount,
  OwnerProfile,
  OrderItem
} from './types/store';
import { api } from './services/api';
import { formatINR } from './utils/currency';
import { StoreNavbar } from './components/store/StoreNavbar';
import { FestivalBanner } from './components/store/FestivalBanner';
import { HeroBanner } from './components/store/HeroBanner';
import { ProductGrid } from './components/store/ProductGrid';
import { ProductDetailModal } from './components/store/ProductDetailModal';
import { NegotiateModal } from './components/store/NegotiateModal';
import { CustomerRequestModal } from './components/store/CustomerRequestModal';
import { CartDrawer } from './components/store/CartDrawer';
import { TrackOrderModal } from './components/store/TrackOrderModal';
import { StoreFooter } from './components/store/StoreFooter';
import { OwnerLobby } from './components/owner/OwnerLobby';
import { OwnerAuthModal } from './components/owner/OwnerAuthModal';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import {
  FALLBACK_PRODUCTS,
  FALLBACK_CATEGORIES,
  FALLBACK_SETTINGS,
  FALLBACK_ORDERS,
  FALLBACK_REQUESTS,
  FALLBACK_NEGOTIATIONS,
  FALLBACK_CUSTOMERS,
  FALLBACK_DISCOUNTS
} from './data/fallbackData';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'storefront' | 'owner_lobby'>('storefront');

  // Authenticated Owner state
  // Default to Vinay (User from metadata: kambhampallivinay3@gmail.com) so the owner lobby is immediately functional!
  const [currentOwner, setCurrentOwner] = useState<OwnerProfile | null>({
    id: 'vinay',
    name: 'Vinay Kambhampalli',
    email: 'kambhampallivinay3@gmail.com',
    role: 'Co-Founder & Lead Executive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    pin: '1234'
  });

  // Data states (seeded with luxury fallback data so static hosts like GitHub Pages render immediately)
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>(FALLBACK_REQUESTS);
  const [negotiations, setNegotiations] = useState<Negotiation[]>(FALLBACK_NEGOTIATIONS);
  const [customers, setCustomers] = useState<Customer[]>(FALLBACK_CUSTOMERS);
  const [discounts, setDiscounts] = useState<Discount[]>(FALLBACK_DISCOUNTS);
  const [stats, setStats] = useState<any>(null);
  const [counts, setCounts] = useState({
    incomingOrders: 0,
    cancellationRequests: 0,
    pendingNegotiations: 0,
    newRequests: 0,
    lowStockProducts: 0
  });

  const [settings, setSettings] = useState<SiteSettings>({
    branding: {
      brandName: 'VELNIX.WEAR',
      tagline: 'Haute Streetwear & Technical Aesthetics',
      monogram: 'VNX',
      watermarkText: 'VELNIX ARCHIVE 2026',
      contactEmail: 'ds694206968@gmail.com',
      instagramHandle: '@velnix.wear'
    },
    theme: {
      preset: 'obsidian',
      backgroundStyle: 'solid',
      accentColor: '#38bdf8',
      cardTone: 'slate'
    },
    festival: {
      active: true,
      type: 'diwali',
      title: 'Diwali Luxe Celebration Drop',
      bannerMessage: 'FESTIVAL OF LIGHTS EXCLUSIVE: 15% OFF ALL TECHNICAL OUTERWEAR WITH CODE LIGHTS15',
      promoCode: 'LIGHTS15',
      discountBadge: '15% OFF',
      showFloatingEffects: true
    }
  });

  // Storefront navigation & interaction states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [negotiateProduct, setNegotiateProduct] = useState<Product | null>(null);
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [ownerAuthOpen, setOwnerAuthOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Load live data from the database
  const refreshAllData = async () => {
    try {
      const [bootstrapData, statsData, allOrders, allReqs, allNegs, allCusts, allDiscs] = await Promise.all([
        api.getBootstrap(),
        api.getStats(),
        api.getOrders(),
        api.getCustomerRequests(),
        api.getNegotiations(),
        api.getCustomers(),
        api.getDiscounts()
      ]);

      if (bootstrapData?.products?.length) setProducts(bootstrapData.products);
      if (bootstrapData?.categories?.length) setCategories(bootstrapData.categories);
      if (bootstrapData?.settings) setSettings(bootstrapData.settings);
      if (bootstrapData?.counts) setCounts(bootstrapData.counts);
      if (statsData) setStats(statsData);
      if (allOrders) setOrders(allOrders);
      if (allReqs) setCustomerRequests(allReqs);
      if (allNegs) setNegotiations(allNegs);
      if (allCusts) setCustomers(allCusts);
      if (allDiscs) setDiscounts(allDiscs);
    } catch (e) {
      console.error('Error fetching database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, size: string) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && item.size === size && !item.negotiationId);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          size,
          image: product.images[0]
        }
      ];
    });
  };

  // Add item with verified agreed negotiation price
  const handleAddToCartWithAgreedPrice = (
    product: Product,
    agreedPrice: number,
    negotiationId: string,
    size: string = 'M'
  ) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.negotiationId === negotiationId && item.size === size
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: agreedPrice,
          originalPrice: product.price,
          quantity: 1,
          size,
          image: product.images[0],
          negotiationId
        }
      ];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, size: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.productId === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveCartItem = (productId: string, size: string) => {
    setCartItems(prev => prev.filter(item => !(item.productId === productId && item.size === size)));
  };

  // Dual-Owner switcher (Vinay Kambhampalli vs Co-Owner Divyansh)
  const handleSwitchOwner = (targetId: 'vinay' | 'divyansh') => {
    if (targetId === 'vinay') {
      setCurrentOwner({
        id: 'vinay',
        name: 'Vinay Kambhampalli',
        email: 'kambhampallivinay1@gmail.com',
        role: 'Co-Owner & Executive Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
    } else {
      setCurrentOwner({
        id: 'ds-owner',
        name: 'Divyansh',
        email: 'ds694206968@gmail.com',
        role: 'Co-Owner & Executive Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      });
    }
  };

  const handleToggleOwnerLobby = () => {
    if (viewMode === 'owner_lobby') {
      setViewMode('storefront');
    } else {
      if (currentOwner) {
        setViewMode('owner_lobby');
      } else {
        setOwnerAuthOpen(true);
      }
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Background styling simulation
  const getBackgroundClasses = () => {
    switch (settings.theme.preset) {
      case 'cyber_neon': return 'bg-[#06080d] text-white';
      case 'brutalist_raw': return 'bg-[#0d0e12] text-neutral-100';
      case 'minimal_chalk': return 'bg-[#0b0c10] text-slate-100';
      case 'obsidian':
      default:
        return 'bg-[#08090d] text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
        <span className="font-outfit uppercase tracking-widest text-xs text-neutral-400">
          Initializing VELNIX.WEAR Architecture...
        </span>
      </div>
    );
  }

  // If in Owner Lobby Mode, render Owner Lobby workspace!
  if (viewMode === 'owner_lobby' && currentOwner) {
    return (
      <>
        <OwnerLobby
        currentOwner={currentOwner}
        settings={settings}
        products={products}
        categories={categories}
        orders={orders}
        customerRequests={customerRequests}
        negotiations={negotiations}
        customers={customers}
        discounts={discounts}
        stats={stats}
        counts={counts}
        onSwitchOwner={handleSwitchOwner}
        onBackToStore={() => setViewMode('storefront')}
        onRefreshData={refreshAllData}
      />
      {/* Floating View Switcher pill */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/95 border border-neutral-700/90 rounded-full p-1.5 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
        <button
          onClick={() => setViewMode('storefront')}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 hover:bg-neutral-800"
          title="Return to Customer Place (Live Storefront)"
        >
          <span>🛍️ Customer Place (Customer Store)</span>
        </button>
        <button
          onClick={() => setViewMode('owner_lobby')}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <span>🛡️ Owner Lobby (Active HQ)</span>
        </button>
      </div>
    </>
    );
  }

  // Otherwise, render Luxury Storefront view
  return (
    <div className={`min-h-screen flex flex-col relative transition-colors ${getBackgroundClasses()}`}>
      {/* Background visual styling */}
      {settings.theme.backgroundStyle === 'mesh' && (
        <div
          className="fixed inset-0 opacity-20 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${settings.theme.accentColor} 0%, transparent 60%)`
          }}
        />
      )}
      {settings.theme.backgroundStyle === 'grid' && (
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800f_1px,transparent_1px),linear-gradient(to_bottom,#8080800f_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      )}

      {/* Top Festival Announcement Banner */}
      <FestivalBanner festival={settings.festival} />

      {/* Top Navbar */}
      <StoreNavbar
        settings={settings}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenRequests={() => setRequestsModalOpen(true)}
        onOpenTrackOrder={() => setTrackOrderOpen(true)}
        onOpenNegotiate={() => setNegotiateModalOpen(true)}
        currentOwner={currentOwner}
        onToggleOwnerLobby={handleToggleOwnerLobby}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Main Storefront Body */}
      <main className="flex-1 relative z-10">
        {/* Campaign Hero Banner */}
        <HeroBanner
          settings={settings}
          onExploreClick={() => {
            const el = document.getElementById('collection-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onBespokeClick={() => setRequestsModalOpen(true)}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddToCart={handleAddToCart}
          onNegotiate={p => setNegotiateProduct(p)}
          onViewDetails={p => setDetailProduct(p)}
        />
      </main>

      {/* Store Footer */}
      <StoreFooter
        settings={settings}
        onOpenRequests={() => setRequestsModalOpen(true)}
        onOpenTrackOrder={() => setTrackOrderOpen(true)}
        onOpenOwnerAuth={() => setOwnerAuthOpen(true)}
      />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderSuccess={ord => {
          setOrderSuccess(ord);
          refreshAllData();
        }}
      />

      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onNegotiate={p => {
          setDetailProduct(null);
          setNegotiateProduct(p);
        }}
      />

      <NegotiateModal
        product={negotiateProduct}
        isOpen={Boolean(negotiateProduct || negotiateModalOpen)}
        onClose={() => {
          setNegotiateProduct(null);
          setNegotiateModalOpen(false);
        }}
        onNegotiationCreated={refreshAllData}
        onAddToCartWithAgreedPrice={handleAddToCartWithAgreedPrice}
        availableProducts={products}
      />

      <CustomerRequestModal
        isOpen={requestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
        onRequestSubmitted={refreshAllData}
      />

      <TrackOrderModal
        isOpen={trackOrderOpen}
        onClose={() => setTrackOrderOpen(false)}
        orders={orders}
        onOrderUpdated={refreshAllData}
      />

      <OwnerAuthModal
        isOpen={ownerAuthOpen}
        onClose={() => setOwnerAuthOpen(false)}
        onAuthenticated={owner => {
          setCurrentOwner(owner);
          setViewMode('owner_lobby');
        }}
        currentOwner={currentOwner}
      />

      {/* Order Placed Toast Confirmation */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-5 bg-neutral-900 border border-emerald-500/40 rounded-2xl shadow-2xl max-w-sm animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-mono font-bold text-emerald-300 uppercase block">
                Order #{orderSuccess.orderNumber} Placed
              </span>
              <p className="text-neutral-300 mt-1 leading-relaxed">
                Thank you {orderSuccess.customerName}! Your order of {formatINR(orderSuccess.total)} was logged and sent to owners Vinay & Divyansh for fulfillment.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setTrackOrderOpen(true);
                  }}
                  className="text-white font-bold underline cursor-pointer"
                >
                  Track Order
                </button>
                <button
                  onClick={() => setOrderSuccess(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating View Switcher pill - Prominent and clear indicator of Customer Place vs Owner Lobby */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/95 border border-neutral-700/90 rounded-full p-1.5 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
        <button
          onClick={() => setViewMode('storefront')}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          title="Customer shopping experience: Browse drops, negotiate, add to bag, checkout"
        >
          <span>🛍️ Customer Place (Active Store)</span>
        </button>
        <button
          onClick={() => {
            if (currentOwner) setViewMode('owner_lobby');
            else setOwnerAuthOpen(true);
          }}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 hover:bg-neutral-800"
          title="Owner command center: Orders, negotiations, products, branding, theme"
        >
          <span>🛡️ Owner Lobby (HQ)</span>
        </button>
      </div>
    </div>
  );
}
