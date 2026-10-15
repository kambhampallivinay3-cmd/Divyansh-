export type OwnerId = 'vinay' | 'ds-owner' | 'divyansh';

export interface OwnerProfile {
  id: OwnerId;
  name: string;
  email: string;
  role: string;
  avatar: string;
  pin?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  categoryId: string;
  description: string;
  stock: number;
  sku: string;
  images: string[];
  sizes: string[];
  tags: string[];
  featured: boolean;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
}

export type OrderStatus =
  | 'incoming'
  | 'accepted'
  | 'declined'
  | 'cancellation_requested'
  | 'cancelled'
  | 'shipped'
  | 'delivered';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  negotiationId?: string;
  originalPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  declineReason?: string;
  cancellationReason?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  handledBy?: OwnerId | null;
  handledByName?: string;
}

export type RequestStatus = 'new' | 'in_review' | 'quoted' | 'fulfilled' | 'declined';

export interface CustomerRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestType: 'bespoke_design' | 'bulk_order' | 'vip_styling' | 'collaboration';
  subject: string;
  message: string;
  budget?: string;
  status: RequestStatus;
  responseNotes?: string;
  handledBy?: OwnerId | null;
  handledByName?: string;
  createdAt: string;
}

export type NegotiationStatus = 'pending' | 'countered' | 'accepted' | 'declined';

export interface NegotiationMessage {
  id: string;
  sender: 'customer' | 'owner';
  senderName: string;
  text: string;
  offerPrice?: number;
  timestamp: string;
}

export interface Negotiation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  initialOffer: number;
  currentOffer: number;
  latestCustomerOffer?: number;
  latestOwnerCounter?: number;
  quantity: number;
  status: NegotiationStatus;
  messages: NegotiationMessage[];
  agreedPrice?: number;
  discountCodeIssued?: string;
  handledBy?: OwnerId | null;
  handledByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalSpent: number;
  ordersCount: number;
  tier: 'VIP' | 'Regular' | 'New';
  lastOrderDate: string;
  createdAt: string;
}

export interface SiteBranding {
  brandName: string;
  tagline: string;
  monogram: string;
  watermarkText: string;
  contactEmail: string;
  instagramHandle: string;
}

export interface SiteTheme {
  preset: 'obsidian' | 'cyber_neon' | 'brutalist_raw' | 'minimal_chalk';
  backgroundStyle: 'solid' | 'mesh' | 'grid' | 'grain';
  accentColor: string;
  cardTone: 'slate' | 'zinc' | 'neutral';
}

export interface FestivalTheme {
  active: boolean;
  type: 'diwali' | 'black_friday' | 'christmas' | 'new_year' | 'halloween' | 'none';
  title: string;
  bannerMessage: string;
  promoCode: string;
  discountBadge: string;
  showFloatingEffects: boolean;
}

export interface SiteSettings {
  branding: SiteBranding;
  theme: SiteTheme;
  festival: FestivalTheme;
}

export interface Discount {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  description: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productTitle: string;
  action: 'restock' | 'sale' | 'adjustment' | 'return';
  delta: number;
  newStock: number;
  reason: string;
  by: string;
  timestamp: string;
}
