import React, { useState } from 'react';
import {
  SiteSettings,
  OwnerProfile,
  Product,
  Category,
  Order,
  CustomerRequest,
  Negotiation,
  Customer,
  Discount
} from '../../types/store';
import { OwnerSidebar, OwnerSection } from './OwnerSidebar';
import { OwnerHeader } from './OwnerHeader';
import { DashboardOverviewView } from './views/DashboardOverviewView';
import { CustomerRequestsView } from './views/CustomerRequestsView';
import { NegotiationsView } from './views/NegotiationsView';
import { OrdersManagerView } from './views/OrdersManagerView';
import { ProductsManagerView } from './views/ProductsManagerView';
import { CategoriesManagerView } from './views/CategoriesManagerView';
import { CustomerDetailsView } from './views/CustomerDetailsView';
import { ThemeBackgroundView } from './views/ThemeBackgroundView';
import { BrandingView } from './views/BrandingView';
import { FestivalThemesView } from './views/FestivalThemesView';
import { DiscountsView } from './views/DiscountsView';
import { InventoryView } from './views/InventoryView';

interface OwnerLobbyProps {
  currentOwner: OwnerProfile;
  settings: SiteSettings;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customerRequests: CustomerRequest[];
  negotiations: Negotiation[];
  customers: Customer[];
  discounts: Discount[];
  stats: any;
  counts: {
    incomingOrders: number;
    cancellationRequests: number;
    pendingNegotiations: number;
    newRequests: number;
    lowStockProducts: number;
  };
  onSwitchOwner: (targetId: 'vinay' | 'divyansh') => void;
  onBackToStore: () => void;
  onRefreshData: () => void;
}

export const OwnerLobby: React.FC<OwnerLobbyProps> = ({
  currentOwner,
  settings,
  products,
  categories,
  orders,
  customerRequests,
  negotiations,
  customers,
  discounts,
  stats,
  counts,
  onSwitchOwner,
  onBackToStore,
  onRefreshData
}) => {
  const [currentSection, setCurrentSection] = useState<OwnerSection>('dashboard');

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Dashboard Overview';
      case 'customer_requests': return 'Customer Requests';
      case 'negotiations': return 'Negotiate With Customers';
      case 'incoming_orders': return 'Incoming Orders';
      case 'accepted_orders': return 'Accepted Orders';
      case 'declined_orders': return 'Declined Orders';
      case 'cancellation_requests': return 'Order Cancellation Requests';
      case 'products': return 'Products — Add, Edit, Delete';
      case 'categories': return 'Categories Management';
      case 'customer_details': return 'Customer Details';
      case 'theme_background': return 'Website Theme and Background';
      case 'branding': return 'Logo and Branding';
      case 'festivals': return 'Festival Themes';
      case 'discounts': return 'Offers, Coupons, and Discounts';
      case 'inventory': return 'Inventory & Stock Audit';
      default: return 'Command Center';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-white font-sans">
      {/* Sidebar Navigation */}
      <OwnerSidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onBackToStore={onBackToStore}
        counts={counts}
      />

      {/* Main Command Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <OwnerHeader
          currentOwner={currentOwner}
          sectionTitle={getSectionTitle()}
          onSwitchOwner={onSwitchOwner}
          onBackToStore={onBackToStore}
        />

        <main className="flex-1 overflow-y-auto">
          {currentSection === 'dashboard' && (
            <DashboardOverviewView
              stats={stats}
              currentOwner={currentOwner}
              onNavigate={setCurrentSection}
            />
          )}

          {currentSection === 'customer_requests' && (
            <CustomerRequestsView
              requests={customerRequests}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'negotiations' && (
            <NegotiationsView
              negotiations={negotiations}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {(currentSection === 'incoming_orders' ||
            currentSection === 'accepted_orders' ||
            currentSection === 'declined_orders' ||
            currentSection === 'cancellation_requests') && (
            <OrdersManagerView
              orders={orders}
              currentSection={currentSection}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'products' && (
            <ProductsManagerView
              products={products}
              categories={categories}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'categories' && (
            <CategoriesManagerView
              categories={categories}
              products={products}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'customer_details' && (
            <CustomerDetailsView
              customers={customers}
              currentOwner={currentOwner}
            />
          )}

          {currentSection === 'theme_background' && (
            <ThemeBackgroundView
              settings={settings}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'branding' && (
            <BrandingView
              settings={settings}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'festivals' && (
            <FestivalThemesView
              settings={settings}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'discounts' && (
            <DiscountsView
              discounts={discounts}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}

          {currentSection === 'inventory' && (
            <InventoryView
              products={products}
              currentOwner={currentOwner}
              onRefresh={onRefreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
