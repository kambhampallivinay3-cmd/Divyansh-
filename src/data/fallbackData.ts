import {
  Product,
  Category,
  Order,
  CustomerRequest,
  Negotiation,
  Customer,
  SiteSettings,
  Discount,
  OwnerProfile
} from '../types/store';
import { STATIC_IMAGES } from '../utils/imageHelper';

export const FALLBACK_OWNERS: OwnerProfile[] = [
  {
    id: 'vinay',
    name: 'Vinay Kambhampalli',
    email: 'kambhampallivinay1@gmail.com',
    role: 'Co-Owner & Executive Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'ds-owner',
    name: 'Divyansh',
    email: 'ds694206968@gmail.com',
    role: 'Co-Owner & Executive Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Outerwear', slug: 'outerwear', description: 'Technical jackets, trench coats and modular bombers', displayOrder: 1 },
  { id: 'cat-2', name: 'Hoodies & Knits', slug: 'hoodies', description: 'Heavyweight organic cottons and cyber-knit silhouettes', displayOrder: 2 },
  { id: 'cat-3', name: 'Bottoms', slug: 'bottoms', description: 'Architectural cargo trousers, raw denims and relaxed trackwear', displayOrder: 3 },
  { id: 'cat-4', name: 'Limited Drops', slug: 'drops', description: 'Numbered runway editions and bespoke technical apparel', displayOrder: 4 }
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Obsidian Heavyweight Cyber Hoodie',
    slug: 'obsidian-heavyweight-cyber-hoodie',
    price: 3499,
    originalPrice: 4299,
    costPrice: 1200,
    categoryId: 'cat-2',
    description: 'Constructed from 520 GSM custom-milled French terry cotton. Features reinforced double-needle seams, custom brushed titanium eyelets, and modular internal utility stash.',
    stock: 24,
    sku: 'VNX-HD-001',
    images: [STATIC_IMAGES.hoodie],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['Heavyweight', 'Best Seller', 'French Terry'],
    featured: true,
    status: 'active',
    createdAt: '2026-10-10T12:00:00Z'
  },
  {
    id: 'prod-2',
    title: 'Architectural Modular Cargo Trousers',
    slug: 'architectural-modular-cargo-trousers',
    price: 4999,
    originalPrice: 5999,
    costPrice: 1800,
    categoryId: 'cat-3',
    description: 'Ergonomically engineered ripstop technical cargo trousers featuring 6 magnetic snap utility pockets, articulated knee gussets, and quick-release FIDLOCK waist adjusters.',
    stock: 12,
    sku: 'VNX-CG-002',
    images: [STATIC_IMAGES.cargo],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['Water Repellent', 'FIDLOCK', 'Articulated'],
    featured: true,
    status: 'active',
    createdAt: '2026-10-09T14:30:00Z'
  },
  {
    id: 'prod-3',
    title: 'Matte Obsidian Tactical Bomber Jacket',
    slug: 'matte-obsidian-tactical-bomber-jacket',
    price: 7999,
    originalPrice: 9499,
    costPrice: 2800,
    categoryId: 'cat-1',
    description: 'Constructed with Japanese high-density matte nylon twill, Primaloft thermal insulation, and dual heavy-gauge two-way YKK excella zippers. Designed for extreme urban weather.',
    stock: 7,
    sku: 'VNX-BM-003',
    images: [STATIC_IMAGES.bomber],
    sizes: ['M', 'L', 'XL'],
    tags: ['Primaloft', 'Waterproof', 'Limited Run'],
    featured: true,
    status: 'active',
    createdAt: '2026-10-08T09:15:00Z'
  },
  {
    id: 'prod-4',
    title: 'VELNIX Monolith Cyber Trench Coat',
    slug: 'velnix-monolith-cyber-trench-coat',
    price: 11999,
    originalPrice: 13999,
    costPrice: 4200,
    categoryId: 'cat-1',
    description: 'Floor-skimming architectural silhouette in water-resistant bonded wool composite with storm flap closure, magnetic collar stay, and taped internal seams.',
    stock: 4,
    sku: 'VNX-TC-004',
    images: [STATIC_IMAGES.trench],
    sizes: ['M', 'L'],
    tags: ['Runway Drop', 'Bonded Wool', 'Low Stock'],
    featured: true,
    status: 'active',
    createdAt: '2026-10-07T11:00:00Z'
  }
];

export const FALLBACK_SETTINGS: SiteSettings = {
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
};

export const FALLBACK_DISCOUNTS: Discount[] = [
  {
    id: 'disc-1',
    code: 'LIGHTS15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 2000,
    usageCount: 42,
    active: true,
    description: 'Diwali Festival Exclusive'
  },
  {
    id: 'disc-2',
    code: 'FIRSTDROP',
    type: 'fixed',
    value: 500,
    minOrderAmount: 3000,
    usageCount: 18,
    active: true,
    description: 'New Collector Incentive'
  }
];

export const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'VNX-2026-8941',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    customerPhone: '+91 98201 12345',
    shippingAddress: '74 Hill Road, Bandra West',
    city: 'Mumbai',
    items: [
      {
        productId: 'prod-1',
        title: 'Obsidian Heavyweight Cyber Hoodie',
        price: 3499,
        quantity: 1,
        size: 'L',
        image: STATIC_IMAGES.hoodie
      }
    ],
    subtotal: 3499,
    discountAmount: 524,
    shippingFee: 0,
    total: 2975,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'UPI / Razorpay',
    trackingNumber: 'DELHIVERY-VNX-88291',
    notes: 'Dispatched via premium express courier with signature required.',
    createdAt: '2026-10-12T10:14:00Z'
  }
];

export const FALLBACK_REQUESTS: CustomerRequest[] = [
  {
    id: 'req-201',
    customerName: 'Rohan Mehta',
    customerEmail: 'rohan.m@studio-arch.in',
    customerPhone: '+91 98112 44332',
    requestType: 'custom_sizing',
    message: 'Looking for a bespoke oversized fit for the Monolith Cyber Trench with customized titanium buckle attachments.',
    status: 'in_review',
    assignedTo: 'vinay',
    createdAt: '2026-10-13T09:20:00Z',
    notes: 'Vinay reviewed design specifications and initiated atelier drafting.'
  }
];

export const FALLBACK_NEGOTIATIONS: Negotiation[] = [
  {
    id: 'neg-301',
    productId: 'prod-3',
    productTitle: 'Matte Obsidian Tactical Bomber Jacket',
    productImage: STATIC_IMAGES.bomber,
    originalPrice: 7999,
    proposedPrice: 7200,
    customerName: 'Kabir Sen',
    customerEmail: 'kabir.sen@gmail.com',
    status: 'accepted',
    agreedPrice: 7400,
    handledBy: 'ds-owner',
    history: [
      { sender: 'customer', price: 7200, note: 'Longtime collector looking to complete the capsule.', timestamp: '2026-10-12T16:00:00Z' },
      { sender: 'owner', price: 7400, note: 'We can do 7400 as a runway VIP courtesy.', timestamp: '2026-10-12T16:45:00Z' }
    ],
    createdAt: '2026-10-12T16:00:00Z'
  }
];

export const FALLBACK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98201 12345',
    totalOrders: 3,
    totalSpent: 18497,
    vipTier: 'Gold',
    createdAt: '2026-08-15T10:00:00Z'
  }
];
