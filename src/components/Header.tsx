import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  ShoppingBag, 
  Bell, 
  Flame, 
  Award, 
  Users, 
  Calendar, 
  Gamepad2, 
  Clock, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  UtensilsCrossed,
  User,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  onOpenLocationModal: () => void;
  onOpenAdminAuthModal: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenLocationModal, 
  onOpenAdminAuthModal, 
  onOpenNotifications 
}) => {
  const { 
    currentTab, 
    setCurrentTab, 
    selectedLocation, 
    cart, 
    setIsCartOpen,
    loyaltyPoints,
    unreadNotificationCount,
    userRole,
    logoutAdmin,
    groupSession,
    orders,
    currentUser,
    setIsAuthModalOpen,
    isFirebaseConnected
  } = useApp();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const optsPrice = (item.selectedOptions || []).reduce((s, o) => s + o.price, 0);
    return sum + (item.item.price + optsPrice) * item.quantity;
  }, 0);

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-[0_4px_25px_-5px_rgba(225,29,72,0.06)] transition-all">
      {/* Top neighborhood alert bar - Seductive Sizzling Flame */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white text-xs py-1.5 px-3 sm:px-4 font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase backdrop-blur-xs">
              🔥 Sizzling Live
            </span>
            <span className="truncate text-white text-xs font-semibold">
              Delivering hot to <span className="underline decoration-amber-200 decoration-2 font-black">{selectedLocation.name}</span> • Batch run in <strong className="font-black bg-black/20 px-1.5 py-0.5 rounded text-amber-200">{selectedLocation.nextBatchCountdownMin}m</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 font-medium">
            <span className="flex items-center gap-1 text-rose-50">
              <Clock className="w-3.5 h-3.5 text-amber-200" /> Hot ETA: ~{selectedLocation.estimatedDeliveryMin}m
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-100 bg-black/15 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" /> PGs & Societies: ₹0 Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <button 
              id="brand-logo-btn"
              onClick={() => setCurrentTab('menu')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none shrink-0"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform border border-amber-300/40 relative">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-200 text-white animate-pulse" />
                <span className="absolute -bottom-1 -right-1 bg-stone-900 text-amber-300 font-black text-[8px] px-1 rounded border border-amber-400/40">
                  D&B
                </span>
              </div>
              <div className="leading-tight">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl tracking-tighter text-stone-900 group-hover:text-rose-600 transition-colors">
                    drool
                  </span>
                  <span className="font-display font-black text-base sm:text-lg text-rose-600 italic">
                    &
                  </span>
                  <span className="font-display font-black text-xl sm:text-2xl tracking-tighter text-amber-600 group-hover:text-amber-500 transition-colors">
                    burp
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-bold tracking-wide truncate hidden sm:block">
                  Seductive Street-Craft & Midnight Woks
                </p>
              </div>
            </button>

            {/* Location Selector Trigger */}
            <button
              id="location-selector-trigger"
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 text-stone-800 text-xs font-medium transition-all text-left shadow-sm hover:border-amber-400"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[170px] truncate">
                <div className="text-[9px] text-rose-700 font-black uppercase tracking-wider flex items-center gap-1">
                  <span>Delivering to</span>
                  <ChevronDown className="w-3 h-3 text-rose-600" />
                </div>
                <div className="truncate font-bold text-stone-900 text-xs">{selectedLocation.name}</div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/70 shadow-inner">
            <button
              id="nav-menu-btn"
              onClick={() => setCurrentTab('menu')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'menu'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>

            <button
              id="nav-group-btn"
              onClick={() => setCurrentTab('group')}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'group'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group Feast</span>
              {groupSession && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              id="nav-subs-btn"
              onClick={() => setCurrentTab('subscriptions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'subscriptions'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tiffin Subs</span>
            </button>

            <button
              id="nav-game-btn"
              onClick={() => setCurrentTab('game')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'game'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Play & Save</span>
            </button>

            <button
              id="nav-loyalty-btn"
              onClick={() => setCurrentTab('loyalty')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'loyalty'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Burp Coins ({loyaltyPoints})</span>
            </button>

            <button
              id="nav-orders-btn"
              onClick={() => setCurrentTab('orders')}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'orders'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tracker</span>
              {activeOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Notifications Button */}
            <button
              id="notifications-toggle-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors focus:outline-none"
              title="Push & In-App Alerts"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white shadow ring-2 ring-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              id="cart-drawer-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-rose-600/25 transition-all transform active:scale-95 border border-rose-400/20"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-stone-900 text-amber-300 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Tray</span>
              {totalCartItems > 0 && (
                <span className="bg-black/25 px-1.5 py-0.5 rounded text-[11px] font-black text-amber-200">
                  ₹{cartSubtotal}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            <button
              id="user-auth-trigger-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-xs transition-all"
              title={currentUser ? "View Cloud Resident Profile & Addresses" : "Sign In / Register"}
            >
              {currentUser && !currentUser.isAnonymous ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[85px] truncate text-stone-800 font-medium">
                    {currentUser.displayName?.split(' ')[0] || 'Resident'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected to Real-Time Cloud" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-rose-600">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline font-bold">Sign In</span>
                </div>
              )}
            </button>

            {/* Role Switcher (Resident vs Kitchen Manager / Admin) */}
            <div className="border-l border-stone-200 pl-2 sm:pl-3">
              {userRole === 'kitchen_admin' ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded-lg text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Chef Desk
                  </span>
                  <button
                    id="exit-admin-role-btn"
                    onClick={logoutAdmin}
                    className="text-[11px] text-stone-500 hover:text-rose-600 underline font-medium"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <button
                  id="admin-auth-trigger-btn"
                  onClick={onOpenAdminAuthModal}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 text-xs font-medium transition-colors"
                  title="Cloud Kitchen Staff & Dispatcher Access"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden lg:inline">Chef Desk</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile secondary tab navigation bar - Shifted to Bottom */}
        <div 
          id="mobile-bottom-nav"
          className="fixed bottom-0 left-0 right-0 z-40 flex xl:hidden items-center justify-around sm:justify-center py-2 px-2 bg-white/95 backdrop-blur-xl border-t border-amber-200/70 shadow-[0_-8px_30px_rgba(225,29,72,0.08)] overflow-x-auto gap-1 text-xs scrollbar-none"
        >
          <button
            id="mobile-nav-menu-btn"
            onClick={() => setCurrentTab('menu')}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              currentTab === 'menu' 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105' 
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <span className="text-sm leading-none">🍛</span>
            <span className="text-[11px] leading-tight">Menu</span>
          </button>

          <button
            id="mobile-nav-group-btn"
            onClick={() => setCurrentTab('group')}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              currentTab === 'group' 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105' 
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <span className="text-sm leading-none">👥</span>
            <span className="text-[11px] leading-tight">Group {groupSession ? '🟢' : ''}</span>
          </button>

          <button
            id="mobile-nav-subs-btn"
            onClick={() => setCurrentTab('subscriptions')}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              currentTab === 'subscriptions' 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105' 
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <span className="text-sm leading-none">🍱</span>
            <span className="text-[11px] leading-tight">Tiffins</span>
          </button>

          <button
            id="mobile-nav-game-btn"
            onClick={() => setCurrentTab('game')}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              currentTab === 'game' 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105' 
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <span className="text-sm leading-none">🎮</span>
            <span className="text-[11px] leading-tight">Play</span>
          </button>

          <button
            id="mobile-nav-loyalty-btn"
            onClick={() => setCurrentTab('loyalty')}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              currentTab === 'loyalty' 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105' 
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <span className="text-sm leading-none">👑</span>
            <span className="text-[11px] leading-tight">Coins</span>
          </button>

          <button
            id="mobile-nav-orders-btn"
            onClick={() => setCurrentTab('orders')}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              currentTab === 'orders' 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 scale-105' 
                : 'bg-stone-100/80 text-stone-600 hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <span className="text-sm leading-none">🛵</span>
            <span className="text-[11px] leading-tight">Tracker {activeOrdersCount > 0 ? `(${activeOrdersCount})` : ''}</span>
          </button>

          <button
            id="mobile-nav-location-btn"
            onClick={onOpenLocationModal}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-2 py-1.5 rounded-xl font-bold text-amber-800 bg-amber-50 border border-amber-200 shrink-0 hover:bg-amber-100"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[11px] leading-tight truncate max-w-[65px]">Society</span>
          </button>

          <button
            id="mobile-auth-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-2 py-1.5 rounded-xl font-bold text-stone-700 bg-stone-100 border border-stone-200 shrink-0 hover:bg-stone-200"
          >
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] leading-tight truncate max-w-[65px]">{currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Profile'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
