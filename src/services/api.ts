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

export const api = {
  async getBootstrap() {
    const res = await fetch('/api/bootstrap');
    if (!res.ok) throw new Error('Failed to fetch bootstrap data');
    return res.json();
  },

  async getStats() {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
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
    const res = await fetch('/api/auth/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    if (data.token) {
      this.setOwnerToken(data.token);
    }
    return data;
  },

  async setupOwnerPassword(email: string, newPassword: string, currentPassword?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await fetch('/api/auth/owner/setup-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword, currentPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password setup failed');
    return data;
  },

  async requestOwnerOtp(email: string): Promise<{
    success: boolean;
    message: string;
    resendCooldownSeconds: number;
    expiresInSeconds: number;
    previewUrl?: string;
  }> {
    const res = await fetch('/api/auth/owner/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch verification code');
    return data;
  },

  async verifyOwnerOtp(email: string, otp: string): Promise<{
    success: boolean;
    token: string;
    owner: OwnerProfile;
  }> {
    const res = await fetch('/api/auth/owner/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    if (data.token) {
      this.setOwnerToken(data.token);
    }
    return data;
  },

  async getOwnerSession(): Promise<{ authenticated: boolean; owner?: OwnerProfile }> {
    const token = this.getOwnerToken();
    if (!token) return { authenticated: false };

    try {
      const res = await fetch('/api/auth/owner/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return { authenticated: false };
      return res.json();
    } catch {
      return { authenticated: false };
    }
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
    const res = await fetch('/api/products');
    return res.json();
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add product');
    }
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    return res.json();
  },

  async addCategory(cat: { name: string; description?: string }): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Orders
  async getOrders(status?: string): Promise<Order[]> {
    const url = status ? `/api/orders?status=${status}` : '/api/orders';
    const res = await fetch(url);
    return res.json();
  },

  async createOrder(order: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout failed');
    }
    return res.json();
  },

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    details?: { declineReason?: string; trackingNumber?: string; handledBy?: string; handledByName?: string }
  ): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...details })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update order');
    }
    return res.json();
  },

  async requestOrderCancellation(id: string, reason: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/cancel-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request cancellation');
    }
    return res.json();
  },

  // Customer Requests
  async getCustomerRequests(): Promise<CustomerRequest[]> {
    const res = await fetch('/api/customer-requests');
    return res.json();
  },

  async createCustomerRequest(req: Partial<CustomerRequest>): Promise<CustomerRequest> {
    const res = await fetch('/api/customer-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submission failed');
    }
    return res.json();
  },

  async updateCustomerRequest(id: string, updates: Partial<CustomerRequest>): Promise<CustomerRequest> {
    const res = await fetch(`/api/customer-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Negotiations
  async getNegotiations(): Promise<Negotiation[]> {
    const res = await fetch('/api/negotiations');
    return res.json();
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
    const res = await fetch('/api/negotiations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Negotiation submission failed');
    }
    return res.json();
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
    const res = await fetch(`/api/negotiations/${id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.customerEmail ? { 'x-customer-email': data.customerEmail } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reply failed');
    }
    return res.json();
  },

  async getCustomerNegotiations(email: string): Promise<Negotiation[]> {
    if (!email) return [];
    const res = await fetch(`/api/negotiations/customer/${encodeURIComponent(email.trim().toLowerCase())}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Discounts
  async getDiscounts(): Promise<Discount[]> {
    const res = await fetch('/api/discounts');
    return res.json();
  },

  async addDiscount(disc: Partial<Discount>): Promise<Discount> {
    const res = await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disc)
    });
    return res.json();
  },

  async deleteDiscount(id: string): Promise<boolean> {
    const res = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async validateCoupon(code: string, cartSubtotal: number) {
    const res = await fetch('/api/discounts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartSubtotal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon');
    return data;
  },

  // Inventory
  async getInventory(): Promise<{ products: any[]; logs: any[] }> {
    const res = await fetch('/api/inventory');
    return res.json();
  },

  async restock(productId: string, amount: number, reason: string, by: string) {
    const res = await fetch('/api/inventory/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, amount, reason, by })
    });
    return res.json();
  }
};
