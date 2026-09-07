import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MenuSection } from './components/MenuSection';
import { CartDrawer } from './components/CartDrawer';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { GroupOrderModal } from './components/GroupOrderModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DroolCatchGame } from './components/DroolCatchGame';
import { LoyaltyModal } from './components/LoyaltyModal';
import { KitchenAdminModal } from './components/KitchenAdminModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal } from './components/AuthModal';
import { 
  Flame, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Heart, 
  Award, 
  Users, 
  Phone,
  Sparkles
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    selectedLocation, 
    userRole, 
    isPaymentModalOpen, 
    setIsPaymentModalOpen,
    orders,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-stone-900 selection:bg-rose-600 selection:text-white relative overflow-x-clip">
      
      {/* Background Tempting Warm Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-gradient-to-br from-amber-200/35 via-rose-200/25 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-gradient-to-bl from-orange-200/30 via-amber-100/30 to-transparent blur-[150px] rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-[650px] h-[350px] bg-rose-200/20 blur-[160px] rounded-full" />
      </div>

      {/* Global Header */}
      <Header
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenAdminAuthModal={() => setIsAdminModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Floating Active Order Tracker Pill (if not on orders tab) */}
      {activeOrder && currentTab !== 'orders' && (
        <aside aria-label="Active order notification" className="sticky top-24 z-30 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full pointer-events-none mt-2">
          <div className="bg-gradient-to-r from-stone-900 via-[#1e1319] to-stone-900 text-white rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-rose-950/20 border border-rose-500/40 flex items-center justify-between gap-3 pointer-events-auto transition-all transform hover:scale-[1.01] backdrop-blur-md">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div className="truncate">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> Hot Feast #{activeOrder.orderNumber} Sizzling en route!
                </span>
                <span className="text-[11px] text-amber-300 hidden sm:inline ml-2">
                  ETA ~{activeOrder.rider?.etaMinutes || 6}m to {activeOrder.location.name}
                </span>
              </div>
            </div>

            <button
              id="view-active-delivery-btn"
              onClick={() => setCurrentTab('orders')}
              className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md transition-all shrink-0"
            >
              Track Live
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 xl:pb-8 w-full relative z-10">
        {currentTab === 'menu' && <MenuSection />}
        {currentTab === 'subscriptions' && <SubscriptionModal />}
        {currentTab === 'group' && <GroupOrderModal />}
        {currentTab === 'game' && <DroolCatchGame />}
        {currentTab === 'loyalty' && <LoyaltyModal />}
        {currentTab === 'orders' && <OrderTrackerModal />}
      </main>

      {/* Footer - Rich Warm Gourmet Truffle Charcoal */}
      <footer className="bg-[#1A1416] text-stone-300 border-t border-rose-950/20 mt-20 pt-14 pb-24 xl:pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/50">
                  <Flame className="w-5 h-5 fill-amber-200 text-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-2xl text-white tracking-tight">drool</span>
                  <span className="font-display font-black text-lg text-rose-500 italic">&</span>
                  <span className="font-display font-black text-2xl text-amber-400 tracking-tight">burp</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                The neighborhood cravery for societies and PGs. High-sizzle woks, slow-melt butter curries, and seductive street-craft delivered fresh to your gate.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" /> FSSAI Certified Cloud Kitchen #112243340001
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs">
              <strong className="text-white font-bold block uppercase tracking-wider text-[11px]">Explore D&B</strong>
              <ul className="space-y-2 text-stone-400">
                <li><button onClick={() => setCurrentTab('menu')} className="hover:text-amber-400 transition-colors">🔥 Sizzling Kitchen Menu</button></li>
                <li><button onClick={() => setCurrentTab('subscriptions')} className="hover:text-amber-400 transition-colors">🍱 Homestyle Tiffin Plans</button></li>
                <li><button onClick={() => setCurrentTab('group')} className="hover:text-amber-400 transition-colors">👥 PG & Society Group Feast</button></li>
                <li><button onClick={() => setCurrentTab('game')} className="hover:text-amber-400 transition-colors">🎮 Play Mini-Game (Win Up to 35% Off)</button></li>
                <li><button onClick={() => setCurrentTab('loyalty')} className="hover:text-amber-400 transition-colors">👑 Burp Coins Loyalty</button></li>
              </ul>
            </div>

            {/* Delivery Neighborhoods */}
            <div className="space-y-2 text-xs">
              <strong className="text-white font-bold block uppercase tracking-wider text-[11px]">Neighborhood Zones</strong>
              <p className="text-stone-400 text-xs leading-relaxed">
                Dispatching thermal-sealed hot boxes to Sunrise Luxury PG, Green Glen Residency, Zolo Amber, Silver Oak Palms, and Stanza Living.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-bold underline text-xs"
                >
                  Change Society / PG Location
                </button>
              </div>
            </div>

            {/* Kitchen & Hygiene Standards */}
            <div className="space-y-2 text-xs">
              <strong className="text-white font-bold block uppercase tracking-wider text-[11px]">Kitchen Craft</strong>
              <ul className="space-y-2 text-stone-400 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Eco-friendly insulated thermal packaging
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pure Desi Ghee & Fresh Handpicked Spices
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tamper-evident sanitized seal tags
                </li>
              </ul>
              
              <div className="pt-2">
                <button
                  id="footer-kitchen-portal-btn"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-stone-400 hover:text-white text-xs flex items-center gap-1.5 border border-rose-950/60 rounded-xl px-3 py-1.5 bg-[#140c10] hover:bg-[#20121a] transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span>Kitchen Staff Dispatch Portal</span>
                </button>
              </div>
            </div>

          </div>

          <div className="border-t border-rose-950/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>© 2026 Drool & Burp Cloud Kitchens Pvt. Ltd. All rights reserved.</p>
            <p className="flex items-center gap-1 text-stone-400">
              Cooked with love for hungry neighborhood PGs & Societies
            </p>
          </div>

        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <KitchenAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
