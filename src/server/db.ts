import fs from 'fs';
import path from 'path';
import {
  Product,
  Category,
  Order,
  CustomerRequest,
  Negotiation,
  Customer,
  SiteSettings,
  Discount,
  InventoryLog,
  OwnerProfile
} from '../types/store.js';

export interface DatabaseSchema {
  owners: OwnerProfile[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  customerRequests: CustomerRequest[];
  negotiations: Negotiation[];
  customers: Customer[];
  settings: SiteSettings;
  discounts: Discount[];
  inventoryLogs: InventoryLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');

const INITIAL_OWNERS: OwnerProfile[] = [
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

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Outerwear', slug: 'outerwear', description: 'Technical jackets, trench coats and modular bombers', displayOrder: 1 },
  { id: 'cat-2', name: 'Hoodies & Knits', slug: 'hoodies', description: 'Heavyweight organic cottons and cyber-knit silhouettes', displayOrder: 2 },
  { id: 'cat-3', name: 'Bottoms', slug: 'bottoms', description: 'Architectural cargo trousers, raw denims and relaxed trackwear', displayOrder: 3 },
  { id: 'cat-4', name: 'Limited Drops', slug: 'drops', description: 'Numbered runway editions and bespoke technical apparel', displayOrder: 4 }
];

const INITIAL_PRODUCTS: Product[] = [
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
    images: ['/src/assets/images/product_hoodie_cyber_1791891335053.jpg'],
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
    images: ['/src/assets/images/product_cargo_tech_1791891336522.jpg'],
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
    images: ['/src/assets/images/product_jacket_bomber_1791891336245.jpg'],
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
    images: ['/src/assets/images/hero_velnix_campaign_1791891336301.jpg'],
    sizes: ['M', 'L'],
    tags: ['Runway Drop', 'Bonded Wool', 'Low Stock'],
    featured: true,
    status: 'active',
    createdAt: '2026-10-07T11:00:00Z'
  }
];

const INITIAL_SETTINGS: SiteSettings = {
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

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-1',
    code: 'LIGHTS15',
    discountType: 'percentage',
    value: 15,
    minSpend: 3000,
    maxUses: 200,
    usedCount: 42,
    isActive: true,
    expiresAt: '2026-11-15T23:59:59Z',
    description: '15% Festive Celebration Discount on orders over ₹3,000'
  },
  {
    id: 'disc-2',
    code: 'VELNIX20',
    discountType: 'percentage',
    value: 20,
    minSpend: 6000,
    maxUses: 100,
    usedCount: 18,
    isActive: true,
    expiresAt: '2026-12-31T23:59:59Z',
    description: 'VIP Founder Privilege: 20% off for high-value orders over ₹6,000'
  },
  {
    id: 'disc-3',
    code: 'FIRST500',
    discountType: 'fixed',
    value: 500,
    minSpend: 4000,
    maxUses: 50,
    usedCount: 31,
    isActive: true,
    expiresAt: '2026-11-30T23:59:59Z',
    description: '₹500 flat off on luxury drops'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1041',
    orderNumber: 'VNX-1041',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@studio.design',
    customerPhone: '+91 98201 23456',
    shippingAddress: '74 Hill Road, Bandra West',
    city: 'Mumbai',
    postalCode: '400050',
    items: [
      {
        productId: 'prod-1',
        title: 'Obsidian Heavyweight Cyber Hoodie',
        price: 3499,
        quantity: 1,
        size: 'L',
        image: '/src/assets/images/product_hoodie_cyber_1791891335053.jpg'
      }
    ],
    subtotal: 3499,
    discount: 0,
    total: 3499,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    status: 'incoming',
    notes: 'Please call before delivery',
    createdAt: '2026-10-13T09:40:00Z',
    handledBy: null
  },
  {
    id: 'ord-1042',
    orderNumber: 'VNX-1042',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@metaverse.io',
    customerPhone: '+91 98450 89122',
    shippingAddress: '100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    postalCode: '560038',
    items: [
      {
        productId: 'prod-3',
        title: 'Matte Obsidian Tactical Bomber Jacket',
        price: 7999,
        quantity: 1,
        size: 'M',
        image: '/src/assets/images/product_jacket_bomber_1791891336245.jpg'
      },
      {
        productId: 'prod-2',
        title: 'Architectural Modular Cargo Trousers',
        price: 4999,
        quantity: 1,
        size: 'M',
        image: '/src/assets/images/product_cargo_tech_1791891336522.jpg'
      }
    ],
    subtotal: 12998,
    discount: 1950,
    couponCode: 'LIGHTS15',
    total: 11048,
    paymentMethod: 'CARD',
    paymentStatus: 'paid',
    status: 'accepted',
    trackingNumber: 'DELHIVERY-VNX-994120',
    createdAt: '2026-10-12T15:20:00Z',
    handledBy: 'vinay',
    handledByName: 'Vinay Kambhampalli'
  },
  {
    id: 'ord-1039',
    orderNumber: 'VNX-1039',
    customerName: 'Damon Cole',
    customerEmail: 'damon.cole@apexcorp.com',
    customerPhone: '+91 99100 34567',
    shippingAddress: 'Block C, Connaught Place',
    city: 'Delhi',
    postalCode: '110001',
    items: [
      {
        productId: 'prod-4',
        title: 'VELNIX Monolith Cyber Trench Coat',
        price: 11999,
        quantity: 1,
        size: 'L',
        image: '/src/assets/images/hero_velnix_campaign_1791891336301.jpg'
      }
    ],
    subtotal: 11999,
    discount: 0,
    total: 11999,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    status: 'declined',
    declineReason: 'Suspected fraudulent telephone number and undeliverable shipping address.',
    createdAt: '2026-10-11T18:10:00Z',
    handledBy: 'ds-owner',
    handledByName: 'Divyansh'
  },
  {
    id: 'ord-1038',
    orderNumber: 'VNX-1038',
    customerName: 'Sophia Lin',
    customerEmail: 'sophia.lin@designworks.co',
    customerPhone: '+91 97000 78901',
    shippingAddress: 'Road No. 36, Jubilee Hills',
    city: 'Hyderabad',
    postalCode: '500033',
    items: [
      {
        productId: 'prod-2',
        title: 'Architectural Modular Cargo Trousers',
        price: 4999,
        quantity: 1,
        size: 'L',
        image: '/src/assets/images/product_cargo_tech_1791891336522.jpg'
      }
    ],
    subtotal: 4999,
    discount: 0,
    total: 4999,
    paymentMethod: 'CARD',
    paymentStatus: 'paid',
    status: 'cancellation_requested',
    cancellationReason: 'I accidentally ordered size Large instead of Medium. Need to cancel and place order for size Medium.',
    createdAt: '2026-10-12T11:05:00Z',
    handledBy: null
  }
];

const INITIAL_REQUESTS: CustomerRequest[] = [
  {
    id: 'req-201',
    customerName: 'Julian Croft',
    customerEmail: 'julian.croft@soundlab.fm',
    customerPhone: '+91 98200 90211',
    requestType: 'bespoke_design',
    subject: 'Custom stage outerwear for European live tour',
    message: 'Hello Vinay and Divyansh! We love the Monolith Cyber Trench silhouette. Can you produce 4 customized pieces with reflective silver stage embroidery and hidden mic transmitter pouches for our band?',
    budget: '₹60,000 - ₹90,000',
    status: 'new',
    createdAt: '2026-10-13T06:15:00Z'
  },
  {
    id: 'req-202',
    customerName: 'Aria Chen',
    customerEmail: 'aria.chen@zenithpr.com',
    customerPhone: '+91 98450 44198',
    requestType: 'bulk_order',
    subject: 'Corporate VIP gifting drop (30 Obsidian Hoodies)',
    message: 'Looking to order 30 Obsidian Heavyweight Hoodies for our executive retreat with tonal debossed leather brand patches. What would the lead time be?',
    budget: '₹95,000',
    status: 'in_review',
    responseNotes: 'Under review by Divyansh. Can fulfill from incoming batch in 2 weeks.',
    handledBy: 'ds-owner',
    handledByName: 'Divyansh',
    createdAt: '2026-10-12T16:00:00Z'
  }
];

const INITIAL_NEGOTIATIONS: Negotiation[] = [
  {
    id: 'neg-301',
    productId: 'prod-3',
    productTitle: 'Matte Obsidian Tactical Bomber Jacket',
    productPrice: 7999,
    productImage: '/src/assets/images/product_jacket_bomber_1791891336245.jpg',
    customerName: 'Devon Kross',
    customerEmail: 'devon.kross@urbancreative.com',
    customerPhone: '+91 98111 67899',
    initialOffer: 6500,
    currentOffer: 7000,
    quantity: 1,
    status: 'pending',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Devon Kross',
        text: 'Hey team VELNIX! Absolutely love this tactical bomber. Would you consider ₹6,500 for a quick purchase today?',
        offerPrice: 6500,
        timestamp: '2026-10-12T19:30:00Z'
      },
      {
        id: 'msg-2',
        sender: 'owner',
        senderName: 'Vinay Kambhampalli',
        text: 'Hey Devon, thanks for the love! Given the Japanese high-density nylon and Primaloft fill, our manufacturing cost is premium. The best we can counter-offer for a single unit is ₹7,200.',
        offerPrice: 7200,
        timestamp: '2026-10-12T20:10:00Z'
      },
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'Devon Kross',
        text: 'Could we meet at ₹7,000 and I confirm right now?',
        offerPrice: 7000,
        timestamp: '2026-10-13T08:00:00Z'
      }
    ],
    handledBy: 'vinay',
    handledByName: 'Vinay Kambhampalli',
    createdAt: '2026-10-12T19:30:00Z',
    updatedAt: '2026-10-13T08:00:00Z'
  },
  {
    id: 'neg-302',
    productId: 'prod-1',
    productTitle: 'Obsidian Heavyweight Cyber Hoodie',
    productPrice: 3499,
    productImage: '/src/assets/images/product_hoodie_cyber_1791891335053.jpg',
    customerName: 'Tariq Malik',
    customerEmail: 'tariq.malik@soundwave.net',
    customerPhone: '+91 99000 32144',
    initialOffer: 2800,
    currentOffer: 3000,
    quantity: 2,
    status: 'accepted',
    agreedPrice: 3000,
    discountCodeIssued: 'NEGOT-TM-3000',
    messages: [
      {
        id: 'msg-10',
        sender: 'customer',
        senderName: 'Tariq Malik',
        text: 'I want to buy 2 hoodies (Size M and XL) if you can offer ₹2,800 each.',
        offerPrice: 2800,
        timestamp: '2026-10-11T14:00:00Z'
      },
      {
        id: 'msg-11',
        sender: 'owner',
        senderName: 'Divyansh',
        text: 'Since you are ordering 2 units, we can do ₹3,000 each. Deal accepted!',
        offerPrice: 3000,
        timestamp: '2026-10-11T14:45:00Z'
      }
    ],
    handledBy: 'ds-owner',
    handledByName: 'Divyansh',
    createdAt: '2026-10-11T14:00:00Z',
    updatedAt: '2026-10-11T14:45:00Z'
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@metaverse.io',
    phone: '+91 98450 89122',
    city: 'Bengaluru',
    totalSpent: 35490,
    ordersCount: 3,
    tier: 'VIP',
    lastOrderDate: '2026-10-12T15:20:00Z',
    createdAt: '2026-08-14T09:00:00Z'
  },
  {
    id: 'cust-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@studio.design',
    phone: '+91 98201 23456',
    city: 'Mumbai',
    totalSpent: 3499,
    ordersCount: 1,
    tier: 'New',
    lastOrderDate: '2026-10-13T09:40:00Z',
    createdAt: '2026-10-13T09:30:00Z'
  },
  {
    id: 'cust-3',
    name: 'Devon Kross',
    email: 'devon.kross@urbancreative.com',
    phone: '+91 98111 67899',
    city: 'Delhi',
    totalSpent: 12999,
    ordersCount: 2,
    tier: 'Regular',
    lastOrderDate: '2026-09-28T14:00:00Z',
    createdAt: '2026-07-19T10:15:00Z'
  }
];

const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'log-1',
    productId: 'prod-1',
    productTitle: 'Obsidian Heavyweight Cyber Hoodie',
    action: 'restock',
    delta: 30,
    newStock: 25,
    reason: 'Autumn batch delivery from Portugal facility',
    by: 'Divyansh',
    timestamp: '2026-10-10T10:00:00Z'
  },
  {
    id: 'log-2',
    productId: 'prod-4',
    productTitle: 'VELNIX Monolith Cyber Trench Coat',
    action: 'sale',
    delta: -1,
    newStock: 4,
    reason: 'VIP Runway order fulfillment',
    by: 'Vinay Kambhampalli',
    timestamp: '2026-10-11T12:00:00Z'
  }
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure owners always match the strictly authorized allowlist:
        parsed.owners = INITIAL_OWNERS;
        return parsed;
      }
    } catch (e) {
      console.error('Error loading DB file, re-initializing default schema:', e);
    }

    const defaultData: DatabaseSchema = {
      owners: INITIAL_OWNERS,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      customerRequests: INITIAL_REQUESTS,
      negotiations: INITIAL_NEGOTIATIONS,
      customers: INITIAL_CUSTOMERS,
      settings: INITIAL_SETTINGS,
      discounts: INITIAL_DISCOUNTS,
      inventoryLogs: INITIAL_INVENTORY_LOGS
    };

    this.save(defaultData);
    return defaultData;
  }

  public resetToDefault(): DatabaseSchema {
    const defaultData: DatabaseSchema = {
      owners: INITIAL_OWNERS,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      customerRequests: INITIAL_REQUESTS,
      negotiations: INITIAL_NEGOTIATIONS,
      customers: INITIAL_CUSTOMERS,
      settings: INITIAL_SETTINGS,
      discounts: INITIAL_DISCOUNTS,
      inventoryLogs: INITIAL_INVENTORY_LOGS
    };
    this.save(defaultData);
    return defaultData;
  }

  public save(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Failed saving database:', err);
    }
  }

  // Accessors
  public getAll(): DatabaseSchema {
    return this.data;
  }

  public getOwners() { return this.data.owners; }
  public getProducts() { return this.data.products; }
  public getCategories() { return this.data.categories; }
  public getOrders() { return this.data.orders; }
  public getCustomerRequests() { return this.data.customerRequests; }
  public getNegotiations() { return this.data.negotiations; }
  public getCustomers() { return this.data.customers; }
  public getSettings() { return this.data.settings; }
  public getDiscounts() { return this.data.discounts; }
  public getInventoryLogs() { return this.data.inventoryLogs; }

  // Mutations
  public updateSettings(settings: Partial<SiteSettings>) {
    this.data.settings = {
      ...this.data.settings,
      ...settings,
      branding: { ...this.data.settings.branding, ...(settings.branding || {}) },
      theme: { ...this.data.settings.theme, ...(settings.theme || {}) },
      festival: { ...this.data.settings.festival, ...(settings.festival || {}) }
    };
    this.save();
    return this.data.settings;
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.data.inventoryLogs.unshift({
      id: `log-${Date.now()}`,
      productId: newProduct.id,
      productTitle: newProduct.title,
      action: 'restock',
      delta: newProduct.stock,
      newStock: newProduct.stock,
      reason: 'Product created and initial stock allocated',
      by: 'Owner',
      timestamp: new Date().toISOString()
    });
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const oldStock = this.data.products[idx].stock;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    
    if (updates.stock !== undefined && updates.stock !== oldStock) {
      const delta = updates.stock - oldStock;
      this.data.inventoryLogs.unshift({
        id: `log-${Date.now()}`,
        productId: id,
        productTitle: this.data.products[idx].title,
        action: delta > 0 ? 'restock' : 'adjustment',
        delta,
        newStock: updates.stock,
        reason: 'Manual stock adjustment in products manager',
        by: 'Owner',
        timestamp: new Date().toISOString()
      });
    }

    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const orderNumber = `VNX-${1000 + this.data.orders.length + 1}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);

    // Deduct inventory
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        this.data.inventoryLogs.unshift({
          id: `log-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productTitle: prod.title,
          action: 'sale',
          delta: -item.quantity,
          newStock: prod.stock,
          reason: `Customer order ${orderNumber}`,
          by: 'System Checkout',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Upsert customer
    const existingCust = this.data.customers.find(c => c.email.toLowerCase() === newOrder.customerEmail.toLowerCase());
    if (existingCust) {
      existingCust.totalSpent += newOrder.total;
      existingCust.ordersCount += 1;
      existingCust.lastOrderDate = newOrder.createdAt;
      if (existingCust.totalSpent > 20000) existingCust.tier = 'VIP';
    } else {
      this.data.customers.unshift({
        id: `cust-${Date.now()}`,
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        phone: newOrder.customerPhone,
        city: newOrder.city,
        totalSpent: newOrder.total,
        ordersCount: 1,
        tier: newOrder.total > 20000 ? 'VIP' : 'New',
        lastOrderDate: newOrder.createdAt,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return newOrder;
  }

  public updateOrderStatus(
    id: string,
    status: Order['status'],
    details?: { declineReason?: string; trackingNumber?: string; handledBy?: OwnerProfile['id']; handledByName?: string }
  ): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = status;
    if (details?.declineReason) order.declineReason = details.declineReason;
    if (details?.trackingNumber) order.trackingNumber = details.trackingNumber;
    if (details?.handledBy) {
      order.handledBy = details.handledBy;
      order.handledByName = details.handledByName;
    }

    // If order is declined or cancelled, restock products
    if ((status === 'declined' || status === 'cancelled') && oldStatus !== 'declined' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        const prod = this.data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
          this.data.inventoryLogs.unshift({
            id: `log-${Date.now()}-${item.productId}`,
            productId: prod.id,
            productTitle: prod.title,
            action: 'return',
            delta: item.quantity,
            newStock: prod.stock,
            reason: `Order ${order.orderNumber} ${status === 'declined' ? 'declined by owner' : 'cancellation accepted'}`,
            by: details?.handledByName || 'Owner',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    this.save();
    return order;
  }

  public requestOrderCancellation(id: string, reason: string): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = 'cancellation_requested';
    order.cancellationReason = reason;
    this.save();
    return order;
  }

  public addCustomerRequest(req: Omit<CustomerRequest, 'id' | 'status' | 'createdAt'>): CustomerRequest {
    const newReq: CustomerRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    this.data.customerRequests.unshift(newReq);
    this.save();
    return newReq;
  }

  public updateCustomerRequest(id: string, updates: Partial<CustomerRequest>): CustomerRequest | null {
    const req = this.data.customerRequests.find(r => r.id === id);
    if (!req) return null;
    Object.assign(req, updates);
    this.save();
    return req;
  }

  public createNegotiation(neg: Omit<Negotiation, 'id' | 'status' | 'messages' | 'createdAt' | 'updatedAt'>, initialMessageText?: string): Negotiation {
    const initialMsg = initialMessageText || `Customer made an offer of ₹${neg.initialOffer.toLocaleString('en-IN')} (Qty: ${neg.quantity}).`;
    const newNeg: Negotiation = {
      ...neg,
      latestCustomerOffer: neg.initialOffer,
      latestOwnerCounter: undefined,
      id: `neg-${Date.now()}`,
      status: 'pending',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: neg.customerName,
          text: initialMsg,
          offerPrice: neg.initialOffer,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.negotiations.unshift(newNeg);
    this.save();
    return newNeg;
  }

  public replyToNegotiation(
    id: string,
    reply: {
      sender: 'owner' | 'customer';
      senderName: string;
      text: string;
      counterPrice?: number;
      action?: 'accept' | 'decline' | 'counter';
      handledBy?: OwnerProfile['id'];
    }
  ): Negotiation | null {
    const neg = this.data.negotiations.find(n => n.id === id);
    if (!neg) return null;

    if (reply.action === 'accept') {
      neg.status = 'accepted';
      // Final agreed price is locked only when the other party accepts it
      if (reply.sender === 'owner') {
        neg.agreedPrice = reply.counterPrice || neg.latestCustomerOffer || neg.currentOffer;
      } else {
        neg.agreedPrice = reply.counterPrice || neg.latestOwnerCounter || neg.currentOffer;
      }
      neg.discountCodeIssued = `OFFER-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      // Automatically register a coupon for this customer!
      this.data.discounts.push({
        id: `disc-${Date.now()}`,
        code: neg.discountCodeIssued,
        discountType: 'fixed',
        value: Math.max(0, (neg.productPrice - neg.agreedPrice) * neg.quantity),
        minSpend: neg.agreedPrice * neg.quantity,
        maxUses: 1,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        description: `Agreed negotiation price on ${neg.productTitle} for ${neg.customerName}`
      });
    } else if (reply.action === 'decline') {
      neg.status = 'declined';
    } else if (reply.action === 'counter') {
      neg.status = 'countered';
      if (reply.counterPrice && Number(reply.counterPrice) > 0) {
        neg.currentOffer = Number(reply.counterPrice);
        if (reply.sender === 'owner') {
          neg.latestOwnerCounter = Number(reply.counterPrice);
        } else {
          neg.latestCustomerOffer = Number(reply.counterPrice);
        }
      }
    }

    if (reply.handledBy) {
      neg.handledBy = reply.handledBy;
      neg.handledByName = reply.senderName;
    }

    neg.messages.push({
      id: `msg-${Date.now()}`,
      sender: reply.sender,
      senderName: reply.senderName,
      text: reply.text,
      offerPrice: reply.counterPrice,
      timestamp: new Date().toISOString()
    });

    neg.updatedAt = new Date().toISOString();
    this.save();
    return neg;
  }

  public addDiscount(disc: Omit<Discount, 'id' | 'usedCount'>): Discount {
    const newDisc: Discount = {
      ...disc,
      id: `disc-${Date.now()}`,
      usedCount: 0
    };
    this.data.discounts.unshift(newDisc);
    this.save();
    return newDisc;
  }

  public deleteDiscount(id: string): boolean {
    const len = this.data.discounts.length;
    this.data.discounts = this.data.discounts.filter(d => d.id !== id);
    if (this.data.discounts.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  public restockInventory(productId: string, amount: number, reason: string, by: string): Product | null {
    const prod = this.data.products.find(p => p.id === productId);
    if (!prod) return null;
    prod.stock += amount;
    this.data.inventoryLogs.unshift({
      id: `log-${Date.now()}`,
      productId: prod.id,
      productTitle: prod.title,
      action: 'restock',
      delta: amount,
      newStock: prod.stock,
      reason,
      by,
      timestamp: new Date().toISOString()
    });
    this.save();
    return prod;
  }
}

export const db = new Database();
