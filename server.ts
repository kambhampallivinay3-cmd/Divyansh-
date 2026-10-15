import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.js';
import {
  AUTHORIZED_OWNER_EMAILS,
  isAuthorizedOwnerEmail,
  normalizeEmail,
  verifyOwnerPassword,
  setupOrUpdateOwnerPassword,
  validateOwnerSession,
  invalidateOwnerSession,
  requestOwnerOtp,
  verifyOwnerOtp
} from './src/server/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Endpoints

// 1. Bootstrap: provides initial state for both storefront & owner lobby
app.get('/api/bootstrap', (req, res) => {
  const all = db.getAll();
  res.json({
    owners: all.owners.map(o => ({ id: o.id, name: o.name, email: o.email, role: o.role, avatar: o.avatar })),
    products: all.products,
    categories: all.categories,
    settings: all.settings,
    discounts: all.discounts.filter(d => d.isActive),
    counts: {
      incomingOrders: all.orders.filter(o => o.status === 'incoming').length,
      cancellationRequests: all.orders.filter(o => o.status === 'cancellation_requested').length,
      pendingNegotiations: all.negotiations.filter(n => n.status === 'pending' || n.status === 'countered').length,
      newRequests: all.customerRequests.filter(r => r.status === 'new').length,
      lowStockProducts: all.products.filter(p => p.stock <= 5).length
    }
  });
});

// 2. Dashboard Overview & Real Analytics
app.get('/api/stats', (req, res) => {
  const all = db.getAll();
  const acceptedOrders = all.orders.filter(o => o.status === 'accepted' || o.status === 'shipped' || o.status === 'delivered');
  const grossRevenue = acceptedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalUnitsSold = acceptedOrders.reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0);
  const incomingCount = all.orders.filter(o => o.status === 'incoming').length;
  const acceptedCount = acceptedOrders.length;
  const declinedCount = all.orders.filter(o => o.status === 'declined').length;
  const cancellationRequestsCount = all.orders.filter(o => o.status === 'cancellation_requested').length;
  const pendingNegotiationsCount = all.negotiations.filter(n => n.status === 'pending' || n.status === 'countered').length;
  const customerRequestsCount = all.customerRequests.length;
  const lowStockCount = all.products.filter(p => p.stock <= 5).length;

  res.json({
    grossRevenue,
    totalUnitsSold,
    orders: {
      incoming: incomingCount,
      accepted: acceptedCount,
      declined: declinedCount,
      cancellationRequests: cancellationRequestsCount,
      total: all.orders.length
    },
    negotiations: {
      pending: pendingNegotiationsCount,
      total: all.negotiations.length
    },
    customerRequests: {
      new: all.customerRequests.filter(r => r.status === 'new').length,
      total: customerRequestsCount
    },
    inventory: {
      totalProducts: all.products.length,
      lowStock: lowStockCount,
      totalUnits: all.products.reduce((acc, p) => acc + p.stock, 0)
    },
    recentOrders: all.orders.slice(0, 5),
    recentNegotiations: all.negotiations.slice(0, 4),
    recentRequests: all.customerRequests.slice(0, 4)
  });
});

// 3. Strict Owner Authentication (Password-based, strictly restricted to authorized owner allowlist)

// Helper: Owner authentication middleware for protected management APIs
const requireOwnerSession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-owner-token'] as string);
  const session = validateOwnerSession(token);
  if (!session || !isAuthorizedOwnerEmail(session.email)) {
    return res.status(401).json({ error: 'Unauthorized: Active owner session required.' });
  }
  (req as any).ownerSession = session;
  next();
};

// 1. Password-Based Owner Sign-In
app.post('/api/auth/owner/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const normalized = normalizeEmail(email);

    if (!normalized || !password) {
      return res.status(400).json({ error: 'Authorized owner email and password are required.' });
    }

    // Backend Allowlist: Strictly deny every other email address
    if (!isAuthorizedOwnerEmail(normalized)) {
      return res.status(403).json({
        error: 'Access Denied: Owner access is strictly restricted to pre-approved VELNIX.WEAR owner email addresses.'
      });
    }

    // Secure backend password verification (PBKDF2 with salt)
    const verification = verifyOwnerPassword(normalized, password);

    const owners = db.getOwners();
    const owner = owners.find(o => o.email.toLowerCase() === normalized) || {
      id: normalized === 'kambhampallivinay1@gmail.com' ? 'vinay' : 'ds-owner',
      name: normalized === 'kambhampallivinay1@gmail.com' ? 'Vinay Kambhampalli' : 'Co-Owner (ds694206968)',
      email: normalized,
      role: 'Co-Owner & Executive Lead',
      avatar: normalized === 'kambhampallivinay1@gmail.com'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    };

    res.json({
      success: true,
      token: verification.token,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
        avatar: owner.avatar
      }
    });
  } catch (err: any) {
    const status = err.message && err.message.includes('Access Denied') ? 403 : 401;
    res.status(status).json({ error: err.message || 'Owner authentication failed.' });
  }
});

// 2. Setup or Update Owner Password
app.post('/api/auth/owner/setup-password', (req, res) => {
  try {
    const { email, newPassword, currentPassword } = req.body;
    const normalized = normalizeEmail(email);

    if (!normalized || !newPassword) {
      return res.status(400).json({ error: 'Owner email and new password are required.' });
    }

    // Backend Allowlist Validation
    if (!isAuthorizedOwnerEmail(normalized)) {
      return res.status(403).json({
        error: 'Access Denied: Owner access is strictly restricted to pre-approved VELNIX.WEAR owner email addresses.'
      });
    }

    const result = setupOrUpdateOwnerPassword(normalized, newPassword, currentPassword);
    res.json(result);
  } catch (err: any) {
    const status = err.message && err.message.includes('Access Denied') ? 403 : 400;
    res.status(status).json({ error: err.message || 'Password update failed.' });
  }
});

// Legacy login route alias for backwards-compatibility
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const normalized = normalizeEmail(email);
  if (!isAuthorizedOwnerEmail(normalized)) {
    return res.status(403).json({
      error: 'Access Denied: Owner access is strictly restricted to pre-approved VELNIX.WEAR owner email addresses.'
    });
  }
  try {
    const verification = verifyOwnerPassword(normalized, password);
    const owners = db.getOwners();
    const owner = owners.find(o => o.email.toLowerCase() === normalized) || {
      id: normalized === 'kambhampallivinay1@gmail.com' ? 'vinay' : 'ds-owner',
      name: normalized === 'kambhampallivinay1@gmail.com' ? 'Vinay Kambhampalli' : 'Co-Owner (ds694206968)',
      email: normalized,
      role: 'Co-Owner & Executive Lead',
      avatar: normalized === 'kambhampallivinay1@gmail.com'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    };
    res.json({
      success: true,
      token: verification.token,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
        avatar: owner.avatar
      }
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

// Request OTP endpoint (deprecated - informs user that password login is active)
app.post('/api/auth/owner/request-otp', async (req, res) => {
  const { email } = req.body;
  const normalized = normalizeEmail(email);
  if (!isAuthorizedOwnerEmail(normalized)) {
    return res.status(403).json({
      error: 'Access Denied: Owner access is strictly restricted to pre-approved VELNIX.WEAR owner email addresses.'
    });
  }
  res.json({
    success: false,
    message: 'OTP login has been replaced with password-based login. Please sign in with your email and password.',
    resendCooldownSeconds: 0,
    expiresInSeconds: 0
  });
});

// Verify OTP endpoint (deprecated)
app.post('/api/auth/owner/verify-otp', (req, res) => {
  res.status(400).json({
    error: 'OTP verification is no longer required. Please sign in with your email and password.'
  });
});

// Validate Current Owner Session
app.get('/api/auth/owner/session', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-owner-token'] as string);
  const session = validateOwnerSession(token);
  if (!session) {
    return res.json({ authenticated: false });
  }

  const owners = db.getOwners();
  const owner = owners.find(o => o.email.toLowerCase() === session.email);
  res.json({
    authenticated: true,
    owner: owner || {
      id: session.ownerId,
      name: session.ownerName,
      email: session.email,
      role: 'Co-Owner & Executive Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  });
});

// Logout Owner Session
app.post('/api/auth/owner/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-owner-token'] as string);
  if (token) {
    invalidateOwnerSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. Products Management (CRUD)
app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

app.post('/api/products', (req, res) => {
  const { title, price, originalPrice, costPrice, categoryId, description, stock, sku, images, sizes, tags, featured } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ error: 'Product title and price are required.' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const product = db.addProduct({
    title,
    slug: slug || `product-${Date.now()}`,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    costPrice: costPrice ? Number(costPrice) : undefined,
    categoryId: categoryId || 'cat-1',
    description: description || '',
    stock: Number(stock) || 0,
    sku: sku || `VNX-${Date.now().toString().slice(-4)}`,
    images: Array.isArray(images) && images.length ? images : ['/src/assets/images/hero_velnix_campaign_1791891336301.jpg'],
    sizes: Array.isArray(sizes) && sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
    tags: Array.isArray(tags) ? tags : [],
    featured: Boolean(featured),
    status: 'active'
  });

  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found.' });
  res.json(updated);
});

app.delete('/api/products/:id', (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found.' });
  res.json({ success: true, message: 'Product deleted.' });
});

// 5. Categories Management (CRUD)
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

app.post('/api/categories', (req, res) => {
  const { name, description, displayOrder } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required.' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = db.addCategory({
    name,
    slug,
    description: description || '',
    displayOrder: Number(displayOrder) || db.getCategories().length + 1
  });
  res.status(201).json(cat);
});

app.put('/api/categories/:id', (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found.' });
  res.json(updated);
});

app.delete('/api/categories/:id', (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found.' });
  res.json({ success: true });
});

// 6. Orders Management (Incoming, Accepted, Declined, Cancellation Requests)
app.get('/api/orders', (req, res) => {
  const { status } = req.query;
  const orders = db.getOrders();
  if (status) {
    return res.json(orders.filter(o => o.status === status));
  }
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, city, postalCode, items, couponCode, paymentMethod, notes } = req.body;
  if (!customerName || !customerEmail || !items || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'Missing mandatory order fields.' });
  }

  // Backend Security: Validate all prices, prevent unauthorized price changes, verify negotiations
  const allProducts = db.getProducts();
  const allNegotiations = db.getNegotiations();
  const validatedItems = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const product = allProducts.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.productId}` });
    }
    const qty = Math.max(1, Number(item.quantity) || 1);
    let authorizedPrice = product.price;

    if (item.negotiationId) {
      const neg = allNegotiations.find(n => n.id === item.negotiationId);
      if (!neg) {
        return res.status(400).json({ error: 'Negotiation thread does not exist.' });
      }
      if (neg.status !== 'accepted' || !neg.agreedPrice) {
        return res.status(400).json({ error: 'Negotiation has not been approved and accepted by both parties.' });
      }
      if (neg.productId !== product.id) {
        return res.status(400).json({ error: 'Negotiation does not match the product in bag.' });
      }
      if (neg.customerEmail.trim().toLowerCase() !== customerEmail.trim().toLowerCase()) {
        return res.status(403).json({ error: 'Security violation: This negotiated price was approved for a different customer email.' });
      }
      // Legitimate accepted negotiation price
      authorizedPrice = neg.agreedPrice;
    } else {
      // Standard product: strictly verify customer has not altered the price in the payload
      if (Number(item.price) !== product.price) {
        return res.status(400).json({
          error: `Price validation error: Item "${product.title}" price manipulated. Authorized price is ₹${product.price.toLocaleString('en-IN')}.`
        });
      }
      authorizedPrice = product.price;
    }

    calculatedSubtotal += authorizedPrice * qty;
    validatedItems.push({
      productId: product.id,
      title: product.title,
      price: authorizedPrice,
      originalPrice: product.price,
      quantity: qty,
      size: item.size || 'M',
      image: item.image || product.images[0],
      negotiationId: item.negotiationId || undefined
    });
  }

  // Validate coupon discount if supplied
  let calculatedDiscount = 0;
  if (couponCode) {
    const disc = db.getDiscounts().find(d => d.code.toUpperCase() === couponCode.trim().toUpperCase() && d.isActive);
    if (disc) {
      if (disc.discountType === 'percentage') {
        calculatedDiscount = Math.round((calculatedSubtotal * disc.value) / 100);
      } else {
        calculatedDiscount = Math.min(calculatedSubtotal, disc.value);
      }
    }
  }

  const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

  const order = db.createOrder({
    customerName,
    customerEmail,
    customerPhone: customerPhone || '',
    shippingAddress: shippingAddress || '',
    city: city || 'Bengaluru',
    postalCode: postalCode || '560001',
    items: validatedItems,
    subtotal: calculatedSubtotal,
    discount: calculatedDiscount,
    couponCode: couponCode || undefined,
    total: calculatedTotal,
    paymentMethod: paymentMethod || 'COD',
    paymentStatus: paymentMethod === 'CARD' ? 'paid' : 'pending',
    status: 'incoming',
    notes: notes || undefined
  });

  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status, declineReason, trackingNumber, handledBy, handledByName } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const updated = db.updateOrderStatus(req.params.id, status, {
    declineReason,
    trackingNumber,
    handledBy,
    handledByName
  });

  if (!updated) return res.status(404).json({ error: 'Order not found.' });
  res.json(updated);
});

app.post('/api/orders/:id/cancel-request', (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Cancellation reason is required.' });
  const updated = db.requestOrderCancellation(req.params.id, reason);
  if (!updated) return res.status(404).json({ error: 'Order not found.' });
  res.json(updated);
});

// 7. Customer Requests (Bespoke styling, bulk orders)
app.get('/api/customer-requests', (req, res) => {
  res.json(db.getCustomerRequests());
});

app.post('/api/customer-requests', (req, res) => {
  const { customerName, customerEmail, customerPhone, requestType, subject, message, budget } = req.body;
  if (!customerName || !customerEmail || !message) {
    return res.status(400).json({ error: 'Customer name, email and message are required.' });
  }

  const newReq = db.addCustomerRequest({
    customerName,
    customerEmail,
    customerPhone: customerPhone || '',
    requestType: requestType || 'bespoke_design',
    subject: subject || 'Custom Bespoke Request',
    message,
    budget: budget || undefined
  });

  res.status(201).json(newReq);
});

app.patch('/api/customer-requests/:id', (req, res) => {
  const updated = db.updateCustomerRequest(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Request not found.' });
  res.json(updated);
});

// 8. Negotiate With Customers (Offers, Counteroffers & Agreement)
app.get('/api/negotiations', (req, res) => {
  res.json(db.getNegotiations());
});

// Customer-specific lookup (Security: customer can only fetch their own negotiations by email)
app.get('/api/negotiations/customer/:email', (req, res) => {
  const email = (req.params.email || '').trim().toLowerCase();
  const all = db.getNegotiations();
  const filtered = all.filter(n => n.customerEmail.toLowerCase() === email);
  res.json(filtered);
});

app.post('/api/negotiations', (req, res) => {
  const { productId, customerName, customerEmail, customerPhone, offeredPrice, quantity, message } = req.body;
  const product = db.getProducts().find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  
  const price = Number(offeredPrice);
  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Valid offer price in ₹ (INR) is required.' });
  }
  if (!customerEmail || !customerEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid customer email is required.' });
  }

  const neg = db.createNegotiation({
    productId: product.id,
    productTitle: product.title,
    productPrice: product.price,
    productImage: product.images[0],
    customerName: (customerName || 'Valued Customer').trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    customerPhone: customerPhone || '',
    initialOffer: price,
    currentOffer: price,
    quantity: Math.max(1, Number(quantity) || 1)
  }, message);

  res.status(201).json(neg);
});

app.post('/api/negotiations/:id/reply', (req, res) => {
  const { sender, senderName, text, counterPrice, action, handledBy, customerEmail } = req.body;
  if (!text && !action) return res.status(400).json({ error: 'Message text or action is required.' });

  const neg = db.getNegotiations().find(n => n.id === req.params.id);
  if (!neg) return res.status(404).json({ error: 'Negotiation thread not found.' });

  // Security checks:
  if (sender === 'customer') {
    const email = (customerEmail || req.headers['x-customer-email'] || '').toString().trim().toLowerCase();
    if (!email || email !== neg.customerEmail.toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden: Customers cannot access or modify another customer\'s negotiation.' });
    }

    if (action === 'counter') {
      const cp = Number(counterPrice);
      if (!cp || isNaN(cp) || cp <= 0) {
        return res.status(400).json({ error: 'Please enter a valid counter offer price.' });
      }
    }

    if (action === 'accept') {
      // Customer can accept only if an owner counter-offer has been made
      if (!neg.latestOwnerCounter && neg.status !== 'countered') {
        return res.status(400).json({ error: 'Waiting for an owner counter-offer to accept.' });
      }
    }
  } else if (sender === 'owner') {
    if (action === 'counter') {
      const cp = Number(counterPrice);
      if (!cp || isNaN(cp) || cp <= 0) {
        return res.status(400).json({ error: 'Please enter a valid owner counter price.' });
      }
    }
  }

  const updated = db.replyToNegotiation(req.params.id, {
    sender: sender || 'owner',
    senderName: senderName || (sender === 'owner' ? 'VELNIX Executive' : neg.customerName),
    text: text || (action === 'accept' ? 'Offer accepted! Deal finalized.' : action === 'counter' ? `Counter-offer of ₹${Number(counterPrice).toLocaleString('en-IN')}` : 'Offer declined.'),
    counterPrice: counterPrice ? Number(counterPrice) : undefined,
    action,
    handledBy
  });

  if (!updated) return res.status(404).json({ error: 'Failed to update negotiation.' });
  res.json(updated);
});

// 9. Customers Directory
app.get('/api/customers', (req, res) => {
  res.json(db.getCustomers());
});

// 10. Website Theme, Background, Branding & Festival Themes
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// 11. Offers, Coupons, and Discounts
app.get('/api/discounts', (req, res) => {
  res.json(db.getDiscounts());
});

app.post('/api/discounts', (req, res) => {
  const { code, discountType, value, minSpend, maxUses, description, expiresAt } = req.body;
  if (!code || value === undefined) {
    return res.status(400).json({ error: 'Discount code and value are required.' });
  }

  const disc = db.addDiscount({
    code: code.trim().toUpperCase(),
    discountType: discountType || 'percentage',
    value: Number(value),
    minSpend: Number(minSpend) || 0,
    maxUses: Number(maxUses) || 100,
    isActive: true,
    expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    description: description || 'Promotional coupon'
  });

  res.status(201).json(disc);
});

app.delete('/api/discounts/:id', (req, res) => {
  const success = db.deleteDiscount(req.params.id);
  if (!success) return res.status(404).json({ error: 'Discount not found.' });
  res.json({ success: true });
});

app.post('/api/discounts/validate', (req, res) => {
  const { code, cartSubtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required.' });

  const disc = db.getDiscounts().find(d => d.code.toUpperCase() === code.trim().toUpperCase() && d.isActive);
  if (!disc) {
    return res.status(404).json({ error: 'Invalid or expired coupon code.' });
  }

  if (cartSubtotal < disc.minSpend) {
    return res.status(400).json({ error: `Minimum order amount of ₹${disc.minSpend.toLocaleString('en-IN')} required for this coupon.` });
  }

  let discountAmount = 0;
  if (disc.discountType === 'percentage') {
    discountAmount = Math.round((cartSubtotal * disc.value) / 100);
  } else {
    discountAmount = Math.min(disc.value, cartSubtotal);
  }

  res.json({
    valid: true,
    discountAmount,
    code: disc.code,
    description: disc.description
  });
});

// 12. Inventory
app.get('/api/inventory', (req, res) => {
  res.json({
    products: db.getProducts().map(p => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      stock: p.stock,
      price: p.price,
      costPrice: p.costPrice || Math.round(p.price * 0.4),
      category: db.getCategories().find(c => c.id === p.categoryId)?.name || 'General',
      isLowStock: p.stock <= 5
    })),
    logs: db.getInventoryLogs()
  });
});

app.post('/api/inventory/restock', (req, res) => {
  const { productId, amount, reason, by } = req.body;
  if (!productId || !amount) {
    return res.status(400).json({ error: 'Product ID and restock amount are required.' });
  }

  const updated = db.restockInventory(productId, Number(amount), reason || 'Standard inventory restock', by || 'Owner');
  if (!updated) return res.status(404).json({ error: 'Product not found.' });
  res.json({ success: true, product: updated });
});

// Setup Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VELNIX.WEAR server running on port ${PORT}`);
  });
}

startServer();
