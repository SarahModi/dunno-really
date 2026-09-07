import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Users, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    selectedLocation,
    groupSession,
    setIsPaymentModalOpen,
    claimedGameVouchers
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const optsPrice = (item.selectedOptions || []).reduce((s, o) => s + o.price, 0);
    return sum + (item.item.price + optsPrice) * item.quantity;
  }, 0);

  let discount = 0;
  if (appliedCoupon?.discountPercent) {
    discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
  } else if (appliedCoupon?.fixedDiscount) {
    discount = Math.min(subtotal, appliedCoupon.fixedDiscount);
  }

  const isFreeDelivery = subtotal >= selectedLocation.freeDeliveryThreshold || !!groupSession;
  const deliveryFee = isFreeDelivery ? 0 : 25;
  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee + taxes);

  const amountNeededForFreeDelivery = Math.max(0, selectedLocation.freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / selectedLocation.freeDeliveryThreshold) * 100));

  const handleApplyCoupon = (codeToApply?: string) => {
    const target = codeToApply || couponInput;
    if (!target.trim()) return;
    const res = applyCouponCode(target);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleProceedToPayment = () => {
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div 
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-[#FFFDF9] shadow-2xl flex flex-col justify-between border-l border-amber-200 text-stone-900"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-amber-200 flex items-center justify-between bg-white sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-base text-stone-900 flex items-center gap-2">
                  <span>Drool & Burp Tray</span>
                  {groupSession && (
                    <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" /> Group
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {cart.length} delicacies • Sizzling to {selectedLocation.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Clear Tray"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-rose-600 border border-amber-200 mx-auto flex items-center justify-center shadow-inner">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display font-black text-stone-900 text-base">Your Feast Tray is Empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Satisfy your hunger with slow-cooked butter curries, royal biryanis, and crisp tandoori wraps.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/25"
                >
                  Explore Sizzling Menu
                </button>
              </div>
            ) : (
              <>
                {/* Batch free delivery progress banner */}
                <div className="p-3 bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200/90 rounded-2xl space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {isFreeDelivery ? '🎉 Free Neighborhood Delivery Unlocked!' : `Add ₹${amountNeededForFreeDelivery} for Free Batch Delivery`}
                    </span>
                    <span className="font-black text-rose-600 text-[11px]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 divide-y divide-amber-100">
                  {cart.map((cartItem) => {
                    const optsTotal = (cartItem.selectedOptions || []).reduce((s, o) => s + o.price, 0);
                    const itemUnitPrice = cartItem.item.price + optsTotal;

                    return (
                      <div key={cartItem.cartItemId} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          {cartItem.addedByMemberName && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              <Users className="w-2.5 h-2.5" /> For: {cartItem.addedByMemberName}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-stone-900 font-display">
                              {cartItem.item.name}
                            </span>
                          </div>

                          {cartItem.selectedOptions && cartItem.selectedOptions.length > 0 && (
                            <div className="text-[11px] text-stone-500">
                              Add-ons: {cartItem.selectedOptions.map(o => `${o.name} (+₹${o.price})`).join(', ')}
                            </div>
                          )}

                          {cartItem.notes && (
                            <div className="text-[11px] text-rose-700 italic font-medium">
                              Note: {cartItem.notes}
                            </div>
                          )}

                          <div className="text-xs font-black text-rose-600 pt-0.5">
                            ₹{itemUnitPrice * cartItem.quantity}
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center bg-white border border-stone-200 rounded-xl shrink-0 shadow-xs">
                          <button
                            onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                            className="p-1.5 hover:bg-stone-100 text-stone-700 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black px-2 min-w-[20px] text-center text-stone-900">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                            className="p-1.5 hover:bg-stone-100 text-stone-700 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Section */}
                <div className="border-t border-amber-100 pt-4 space-y-2.5">
                  <label className="block text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-600" />
                    Promo or Game Voucher
                  </label>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-black text-emerald-800 tracking-wide">{appliedCoupon.code}</span>
                          <span className="text-emerald-700 ml-1.5 font-medium">
                            ({appliedCoupon.discountPercent ? `${appliedCoupon.discountPercent}% OFF` : `₹${appliedCoupon.fixedDiscount} OFF`})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-stone-500 hover:text-rose-600 p-1 font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="cart-coupon-input"
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. DROOL15, BURP25"
                        className="w-full text-xs uppercase px-3 py-2 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono shadow-xs"
                      />
                      <button
                        id="apply-coupon-btn"
                        onClick={() => handleApplyCoupon()}
                        className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shrink-0 shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p className={`text-[11px] ${couponMessage.isError ? 'text-rose-600 font-bold' : 'text-emerald-700 font-medium'}`}>
                      {couponMessage.text}
                    </p>
                  )}

                  {/* Quick-tap unlocked voucher chips */}
                  {claimedGameVouchers.length > 0 && !appliedCoupon && (
                    <div className="pt-1">
                      <div className="text-[10px] text-stone-500 font-medium mb-1">Unlocked Game Coupons:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {claimedGameVouchers.map((v) => (
                          <button
                            key={v}
                            onClick={() => handleApplyCoupon(v)}
                            className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-rose-700 border border-amber-300 transition-colors"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-amber-100 pt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600 font-medium">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-black">
                      <span>Coupon Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600 font-medium">
                    <span className="flex items-center gap-1">
                      Neighborhood Batch Delivery
                      {isFreeDelivery && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.2 rounded">
                          Free
                        </span>
                      )}
                    </span>
                    <span>{isFreeDelivery ? '₹0' : `₹${deliveryFee}`}</span>
                  </div>

                  <div className="flex justify-between text-stone-600 font-medium">
                    <span>GST (5% Cloud Kitchen Tax)</span>
                    <span>₹{taxes}</span>
                  </div>

                  <div className="border-t border-amber-200 pt-2 flex justify-between text-sm font-black text-stone-950">
                    <span>To Pay</span>
                    <span className="font-display text-lg text-rose-600">₹{grandTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-amber-200 bg-white space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit Encrypted Neighborhood Checkout
                </span>
                <span>Dispatching in ~{selectedLocation.estimatedDeliveryMin}m</span>
              </div>

              <button
                id="proceed-to-payment-btn"
                onClick={handleProceedToPayment}
                className="w-full flex items-center justify-between bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all transform active:scale-98 border border-rose-400/20"
              >
                <div className="flex items-center gap-2">
                  <span>Pay & Sizzle Feast</span>
                  <span className="bg-black/20 px-2 py-0.5 rounded text-xs font-mono font-black text-white">
                    ₹{grandTotal}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
