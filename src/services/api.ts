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
import { localStore } from './localStore';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export const api = {
  async getBootstrap() {
    const remote = await safeFetchJson<any>('/api/bootstrap');
    if (remote && remote.products) return remote;
    return localStore.getBootstrap();
  },

  async getStats() {
    const remote = await safeFetchJson<any>('/api/stats');
    if (remote && remote.totalRevenue !== undefined) return remote;
    return localStore.getStats();
  },

  // Owner OTP Authentication
  getOwnerToken(): string | null {
    return localStorage.getItem('velnix_owner_token');
  },

  setOwnerToken(token: string) {
    localStorage.setItem('velnix_owner_token', token);
  },

  clearOwnerToken() {
    localStorage.removeItem('velnix_owner_token');
  },

  // Owner Password Authentication (OTP disabled)
  async ownerLogin(email: string, password: string): Promise<{
    success: boolean;
    token: string;
    owner: OwnerProfile;
  }> {
    try {
      const res = await fetch('/api/auth/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        if (data.token) {
          this.setOwnerToken(data.token);
        }
        return data;
      }
    } catch (e: any) {
      if (e?.message && e.message.includes('Invalid') || e.message?.includes('Unauthorized')) {
        throw e;
      }
    }

    // Static / Offline fallback (e.g. GitHub Pages)
    const localResult = localStore.ownerLogin(email, password);
    this.setOwnerToken(localResult.token);
    return localResult;
  },

  async setupOwnerPassword(email: string, newPassword: string, currentPassword?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const res = await fetch('/api/auth/owner/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, currentPassword })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Password setup failed');
        return data;
      }
    } catch (e: any) {
      if (e?.message && (e.message.includes('match') || e.message.includes('length'))) {
        throw e;
      }
    }

    // Static fallback
    return localStore.setupOwnerPassword(email, newPassword);
  },

  async requestOwnerOtp(email: string): Promise<{
    success: boolean;
    message: string;
    resendCooldownSeconds: number;
    expiresInSeconds: number;
    previewUrl?: string;
  }> {
    return {
      success: false,
      message: 'OTP login has been replaced with password authentication.',
      resendCooldownSeconds: 0,
      expiresInSeconds: 0
    };
  },

  async verifyOwnerOtp(email: string, otp: string): Promise<{
    success: boolean;
    token: string;
    owner: OwnerProfile;
  }> {
    throw new Error('OTP login has been replaced with password authentication.');
  },

  async getOwnerSession(): Promise<{ authenticated: boolean; owner?: OwnerProfile }> {
    const token = this.getOwnerToken();
    if (!token) return { authenticated: false };

    try {
      const res = await fetch('/api/auth/owner/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {
      // ignore
    }

    // Static fallback
    if (token.startsWith('static-jwt-')) {
      try {
        const payload = JSON.parse(atob(token.replace('static-jwt-', '')));
        if (payload.exp > Date.now()) {
          const owner = payload.email.includes('ds694206968')
            ? localStore.ownerLogin('ds694206968@gmail.com', 'VelnixOwner@2026').owner
            : localStore.ownerLogin('kambhampallivinay1@gmail.com', 'VelnixOwner@2026').owner;
          return { authenticated: true, owner };
        }
      } catch {}
    }
    return { authenticated: false };
  },

  async logoutOwner(): Promise<boolean> {
    const token = this.getOwnerToken();
    this.clearOwnerToken();
    if (token) {
      await fetch('/api/auth/owner/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    return true;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const remote = await safeFetchJson<Product[]>('/api/products');
    if (remote && Array.isArray(remote)) return remote;
    return localStore.getProducts();
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getProducts();
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      title: product.title || 'Untitled Drop',
      slug: (product.title || 'drop').toLowerCase().replace(/\s+/g, '-'),
      price: product.price || 2999,
      categoryId: product.categoryId || 'cat-1',
      description: product.description || '',
      stock: product.stock || 10,
      sku: product.sku || 'VNX-' + Math.floor(1000 + Math.random() * 9000),
      images: product.images || [],
      sizes: product.sizes || ['M', 'L'],
      tags: product.tags || ['New Drop'],
      featured: product.featured ?? true,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    localStore.saveProducts([newProd, ...list]);
    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getProducts();
    const updated = list.map(p => p.id === id ? { ...p, ...updates } : p);
    localStore.saveProducts(updated);
    return updated.find(p => p.id === id)!;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    const list = localStore.getProducts();
    localStore.saveProducts(list.filter(p => p.id !== id));
    return true;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const remote = await safeFetchJson<Category[]>('/api/categories');
    if (remote && Array.isArray(remote)) return remote;
    return localStore.getCategories();
  },

  async addCategory(cat: { name: string; description?: string }): Promise<Category> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getCategories();
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      description: cat.description,
      displayOrder: list.length + 1
    };
    localStore.saveCategories([...list, newCat]);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getCategories();
    const updated = list.map(c => c.id === id ? { ...c, ...updates } : c);
    localStore.saveCategories(updated);
    return updated.find(c => c.id === id)!;
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}

    const list = localStore.getCategories();
    localStore.saveCategories(list.filter(c => c.id !== id));
    return true;
  },

  // Orders
  async getOrders(status?: string): Promise<Order[]> {
    const remote = await safeFetchJson<Order[]>(status ? `/api/orders?status=${status}` : '/api/orders');
    if (remote && Array.isArray(remote)) return remote;
    const orders = localStore.getOrders();
    return status ? orders.filter(o => o.status === status) : orders;
  },

  async createOrder(order: any): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getOrders();
    const newOrd: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: 'VNX-2026-' + Math.floor(1000 + Math.random() * 9000),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      city: order.city || 'Mumbai',
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount || 0,
      shippingFee: order.shippingFee || 0,
      total: order.total,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: order.paymentMethod || 'Card',
      trackingNumber: 'VNX-EXP-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString()
    };
    localStore.saveOrders([newOrd, ...list]);
    return newOrd;
  },

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    details?: { declineReason?: string; trackingNumber?: string; handledBy?: string; handledByName?: string }
  ): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...details })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getOrders();
    const updated = list.map(o => o.id === id ? { ...o, status, ...details } : o);
    localStore.saveOrders(updated);
    return updated.find(o => o.id === id)!;
  },

  async requestOrderCancellation(id: string, reason: string): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${id}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getOrders();
    const updated = list.map(o => o.id === id ? { ...o, status: 'cancelled' as const, cancellationReason: reason } : o);
    localStore.saveOrders(updated);
    return updated.find(o => o.id === id)!;
  },

  // Customer Requests
  async getCustomerRequests(): Promise<CustomerRequest[]> {
    const remote = await safeFetchJson<CustomerRequest[]>('/api/customer-requests');
    if (remote && Array.isArray(remote)) return remote;
    return localStore.getRequests();
  },

  async createCustomerRequest(req: Partial<CustomerRequest>): Promise<CustomerRequest> {
    try {
      const res = await fetch('/api/customer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getRequests();
    const newReq: CustomerRequest = {
      id: 'req-' + Date.now(),
      customerName: req.customerName || 'Anonymous',
      customerEmail: req.customerEmail || 'client@example.com',
      customerPhone: req.customerPhone,
      requestType: req.requestType || 'bespoke',
      message: req.message || '',
      status: 'pending',
      assignedTo: 'vinay',
      createdAt: new Date().toISOString()
    };
    localStore.saveRequests([newReq, ...list]);
    return newReq;
  },

  async updateCustomerRequest(id: string, updates: Partial<CustomerRequest>): Promise<CustomerRequest> {
    try {
      const res = await fetch(`/api/customer-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getRequests();
    const updated = list.map(r => r.id === id ? { ...r, ...updates } : r);
    localStore.saveRequests(updated);
    return updated.find(r => r.id === id)!;
  },

  // Negotiations
  async getNegotiations(): Promise<Negotiation[]> {
    const remote = await safeFetchJson<Negotiation[]>('/api/negotiations');
    if (remote && Array.isArray(remote)) return remote;
    return localStore.getNegotiations();
  },

  async startNegotiation(data: {
    productId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    offeredPrice: number;
    quantity: number;
    message: string;
  }): Promise<Negotiation> {
    try {
      const res = await fetch('/api/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getNegotiations();
    const prods = localStore.getProducts();
    const targetProd = prods.find(p => p.id === data.productId);
    const newNeg: Negotiation = {
      id: 'neg-' + Date.now(),
      productId: data.productId,
      productTitle: targetProd?.title || 'VELNIX Drop',
      productImage: targetProd?.images[0],
      originalPrice: targetProd?.price || data.offeredPrice,
      proposedPrice: data.offeredPrice,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      status: 'pending',
      handledBy: 'vinay',
      history: [
        {
          sender: 'customer',
          price: data.offeredPrice,
          note: data.message,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    localStore.saveNegotiations([newNeg, ...list]);
    return newNeg;
  },

  async replyNegotiation(
    id: string,
    data: {
      sender: 'owner' | 'customer';
      senderName: string;
      text: string;
      counterPrice?: number;
      action?: 'accept' | 'decline' | 'counter';
      handledBy?: string;
      customerEmail?: string;
    }
  ): Promise<Negotiation> {
    try {
      const res = await fetch(`/api/negotiations/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(data.customerEmail ? { 'x-customer-email': data.customerEmail } : {})
        },
        body: JSON.stringify(data)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getNegotiations();
    const updated = list.map(n => {
      if (n.id !== id) return n;
      const history = [
        ...n.history,
        {
          sender: data.sender,
          price: data.counterPrice,
          note: data.text,
          timestamp: new Date().toISOString()
        }
      ];
      let status = n.status;
      let agreedPrice = n.agreedPrice;
      if (data.action === 'accept') {
        status = 'accepted';
        agreedPrice = data.counterPrice || n.proposedPrice;
      } else if (data.action === 'decline') {
        status = 'declined';
      } else if (data.action === 'counter') {
        status = 'countered';
      }
      return {
        ...n,
        history,
        status,
        agreedPrice,
        handledBy: (data.handledBy as any) || n.handledBy
      };
    });
    localStore.saveNegotiations(updated);
    return updated.find(n => n.id === id)!;
  },

  async getCustomerNegotiations(email: string): Promise<Negotiation[]> {
    if (!email) return [];
    try {
      const res = await fetch(`/api/negotiations/customer/${encodeURIComponent(email.trim().toLowerCase())}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}
    const list = localStore.getNegotiations();
    return list.filter(n => n.customerEmail.toLowerCase() === email.trim().toLowerCase());
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const remote = await safeFetchJson<Customer[]>('/api/customers');
    if (remote && Array.isArray(remote)) return remote;
    return localStore.getCustomers();
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const remote = await safeFetchJson<SiteSettings>('/api/settings');
    if (remote && remote.branding) return remote;
    return localStore.getSettings();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const cur = localStore.getSettings();
    const merged: SiteSettings = {
      ...cur,
      ...settings,
      branding: { ...cur.branding, ...(settings.branding || {}) },
      theme: { ...cur.theme, ...(settings.theme || {}) },
      festival: { ...cur.festival, ...(settings.festival || {}) }
    };
    localStore.saveSettings(merged);
    return merged;
  },

  // Discounts
  async getDiscounts(): Promise<Discount[]> {
    const remote = await safeFetchJson<Discount[]>('/api/discounts');
    if (remote && Array.isArray(remote)) return remote;
    return localStore.getDiscounts();
  },

  async addDiscount(disc: Partial<Discount>): Promise<Discount> {
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disc)
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getDiscounts();
    const newDisc: Discount = {
      id: 'disc-' + Date.now(),
      code: (disc.code || 'SAVE').toUpperCase(),
      type: disc.type || 'percentage',
      value: disc.value || 10,
      minOrderAmount: disc.minOrderAmount || 0,
      usageCount: 0,
      active: true,
      description: disc.description || 'Special Promotion'
    };
    return newDisc;
  },

  async deleteDiscount(id: string): Promise<boolean> {
    return true;
  },

  async validateCoupon(code: string, cartSubtotal: number) {
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const discounts = localStore.getDiscounts();
    const disc = discounts.find(d => d.code.toUpperCase() === code.trim().toUpperCase() && d.active);
    if (!disc) {
      throw new Error('Invalid or expired discount code.');
    }
    if (cartSubtotal < disc.minOrderAmount) {
      throw new Error(`Minimum order of ₹${disc.minOrderAmount} required.`);
    }

    const discountAmount = disc.type === 'percentage'
      ? Math.round((cartSubtotal * disc.value) / 100)
      : Math.min(disc.value, cartSubtotal);

    return {
      valid: true,
      discount: disc,
      discountAmount,
      finalTotal: cartSubtotal - discountAmount
    };
  },

  // Inventory
  async getInventory(): Promise<{ products: any[]; logs: any[] }> {
    const remote = await safeFetchJson<any>('/api/inventory');
    if (remote && remote.products) return remote;
    return {
      products: localStore.getProducts(),
      logs: []
    };
  },

  async restock(productId: string, amount: number, reason: string, by: string) {
    try {
      const res = await fetch('/api/inventory/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, amount, reason, by })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return res.json();
      }
    } catch {}

    const list = localStore.getProducts();
    const updated = list.map(p => p.id === productId ? { ...p, stock: p.stock + amount } : p);
    localStore.saveProducts(updated);
    return { success: true };
  }
};
