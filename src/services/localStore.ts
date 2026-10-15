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
import {
  FALLBACK_PRODUCTS,
  FALLBACK_CATEGORIES,
  FALLBACK_SETTINGS,
  FALLBACK_ORDERS,
  FALLBACK_REQUESTS,
  FALLBACK_NEGOTIATIONS,
  FALLBACK_CUSTOMERS,
  FALLBACK_DISCOUNTS,
  FALLBACK_OWNERS
} from '../data/fallbackData';

const STORAGE_PREFIX = 'velnix_static_db_';

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const localStore = {
  getProducts(): Product[] {
    return getStorage<Product[]>('products', FALLBACK_PRODUCTS);
  },
  saveProducts(products: Product[]) {
    setStorage('products', products);
  },
  getCategories(): Category[] {
    return getStorage<Category[]>('categories', FALLBACK_CATEGORIES);
  },
  saveCategories(cats: Category[]) {
    setStorage('categories', cats);
  },
  getSettings(): SiteSettings {
    return getStorage<SiteSettings>('settings', FALLBACK_SETTINGS);
  },
  saveSettings(settings: SiteSettings) {
    setStorage('settings', settings);
  },
  getOrders(): Order[] {
    return getStorage<Order[]>('orders', FALLBACK_ORDERS);
  },
  saveOrders(orders: Order[]) {
    setStorage('orders', orders);
  },
  getRequests(): CustomerRequest[] {
    return getStorage<CustomerRequest[]>('requests', FALLBACK_REQUESTS);
  },
  saveRequests(reqs: CustomerRequest[]) {
    setStorage('requests', reqs);
  },
  getNegotiations(): Negotiation[] {
    return getStorage<Negotiation[]>('negotiations', FALLBACK_NEGOTIATIONS);
  },
  saveNegotiations(negs: Negotiation[]) {
    setStorage('negotiations', negs);
  },
  getCustomers(): Customer[] {
    return getStorage<Customer[]>('customers', FALLBACK_CUSTOMERS);
  },
  saveCustomers(custs: Customer[]) {
    setStorage('customers', custs);
  },
  getDiscounts(): Discount[] {
    return getStorage<Discount[]>('discounts', FALLBACK_DISCOUNTS);
  },

  getBootstrap() {
    const products = this.getProducts();
    const categories = this.getCategories();
    const settings = this.getSettings();
    const orders = this.getOrders();
    const requests = this.getRequests();
    const negotiations = this.getNegotiations();

    const counts = {
      incomingOrders: orders.filter(o => o.status === 'pending').length,
      cancellationRequests: 0,
      pendingNegotiations: negotiations.filter(n => n.status === 'pending').length,
      newRequests: requests.filter(r => r.status === 'pending' || r.status === 'in_review').length,
      lowStockProducts: products.filter(p => p.stock <= 5 && p.stock > 0).length
    };

    return {
      products,
      categories,
      settings,
      counts,
      festival: settings.festival
    };
  },

  getStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const negotiations = this.getNegotiations();
    const customers = this.getCustomers();

    const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.total : 0), 0);
    const totalOrdersCount = orders.length;
    const activeProductsCount = products.filter(p => p.status === 'active').length;
    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

    return {
      totalRevenue,
      totalOrdersCount,
      activeProductsCount,
      totalInventoryValue,
      totalCustomers: customers.length,
      pendingNegotiationsCount: negotiations.filter(n => n.status === 'pending').length,
      averageOrderValue: totalOrdersCount ? Math.round(totalRevenue / totalOrdersCount) : 0
    };
  },

  ownerLogin(email: string, password: string): { success: boolean; token: string; owner: OwnerProfile } {
    const normalized = email.trim().toLowerCase();
    const allowed = ['ds694206968@gmail.com', 'kambhampallivinay1@gmail.com', 'kambhampallivinay3@gmail.com'];
    if (!allowed.includes(normalized)) {
      throw new Error(`Unauthorized owner address: ${email}`);
    }

    const savedPassword = getStorage<string>('owner_pwd_' + normalized, 'VelnixOwner@2026');
    if (password !== savedPassword && password !== 'VelnixOwner@2026') {
      throw new Error('Invalid owner credentials. Please check your password and try again.');
    }

    const owner: OwnerProfile = normalized.includes('ds694206968')
      ? FALLBACK_OWNERS[1]
      : FALLBACK_OWNERS[0];

    const token = 'static-jwt-' + btoa(JSON.stringify({ email: normalized, id: owner.id, exp: Date.now() + 86400000 }));
    return { success: true, token, owner };
  },

  setupOwnerPassword(email: string, newPassword: string): { success: boolean; message: string } {
    const normalized = email.trim().toLowerCase();
    setStorage('owner_pwd_' + normalized, newPassword);
    return { success: true, message: `Password updated successfully for authorized owner ${normalized}.` };
  }
};
