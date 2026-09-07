import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  ChefHat, 
  Package, 
  Bike, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Clock, 
  Users, 
  Building2, 
  TrendingUp, 
  Check, 
  Key,
  Layers
} from 'lucide-react';

interface KitchenAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KitchenAdminModal: React.FC<KitchenAdminModalProps> = ({ isOpen, onClose }) => {
  const { 
    userRole, 
    isAdminAuthenticated, 
    verifyAdminPasskey, 
    logoutAdmin,
    orders, 
    updateOrderStatus, 
    menuItems, 
    toggleItemStock,
    subscriptions
  } = useApp();

  const [passkeyInput, setPasskeyInput] = useState('droolchef');
  const [authError, setAuthError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'kot' | 'batches' | 'inventory' | 'subscriptions'>('kot');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = verifyAdminPasskey(passkeyInput);
    if (ok) {
      setAuthError('');
    } else {
      setAuthError('Invalid Master Passkey. Use "droolchef" or "1234" for kitchen access.');
    }
  };

  // Group active orders by society/PG for batch dispatching
  const societyBatches: Record<string, typeof orders> = {};
  orders.forEach(ord => {
    if (ord.status !== 'delivered' && ord.status !== 'cancelled') {
      const socName = ord.location.name;
      if (!societyBatches[socName]) societyBatches[socName] = [];
      societyBatches[socName].push(ord);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="kitchen-admin-portal-modal"
        className="bg-white text-stone-900 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/25 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg text-stone-900">Drool & Burp Kitchen Command</h2>
                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded-full">
                  Privileged Staff Role
                </span>
              </div>
              <p className="text-xs text-stone-500">Kitchen Display System (KDS) & Neighborhood Fleet Dispatcher</p>
            </div>
          </div>

          <button
            id="close-admin-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not authenticated view: Role Isolation Gate */}
        {!isAdminAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black text-xl text-stone-900">Staff Authentication Required</h3>
              <p className="text-xs text-stone-500">
                To isolate sensitive customer data and prevent unauthorized kitchen state modification, enter the kitchen passkey.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <input
                  id="admin-passkey-input"
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter Kitchen Passkey (droolchef)"
                  className="w-full text-center tracking-widest text-sm py-2.5 px-4 bg-amber-50/40 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 font-mono"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-600 font-bold">{authError}</p>
              )}

              <button
                id="submit-admin-auth-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black py-3 rounded-xl shadow-md shadow-rose-600/25 transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Verify Master Passkey & Enter</span>
              </button>
            </form>

            <div className="pt-2 text-[11px] text-stone-500">
              Default demo staff key: <code className="text-rose-600 font-mono font-bold">droolchef</code> or <code className="text-rose-600 font-mono font-bold">1234</code>
            </div>
          </div>
        ) : (
          /* Authenticated Staff View */
          <div className="p-5 space-y-6">
            
            {/* Top Stats & Tabs Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <button
                  id="admin-tab-kot"
                  onClick={() => setActiveAdminTab('kot')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activeAdminTab === 'kot' ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs' : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Live KOT Tickets ({orders.length})</span>
                </button>

                <button
                  id="admin-tab-batches"
                  onClick={() => setActiveAdminTab('batches')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activeAdminTab === 'batches' ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs' : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Society Batches ({Object.keys(societyBatches).length})</span>
                </button>

                <button
                  id="admin-tab-inventory"
                  onClick={() => setActiveAdminTab('inventory')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activeAdminTab === 'inventory' ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs' : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Inventory / 86 Stock</span>
                </button>

                <button
                  id="admin-tab-subscriptions"
                  onClick={() => setActiveAdminTab('subscriptions')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activeAdminTab === 'subscriptions' ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs' : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Tiffin Subscriptions ({subscriptions.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={logoutAdmin}
                  className="text-xs text-stone-500 hover:text-rose-600 font-bold px-2 py-1 transition-colors"
                >
                  Lock Portal
                </button>
              </div>
            </div>

            {/* Sub-view: Live KOT Orders Pipeline */}
            {activeAdminTab === 'kot' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Advance ticket status in real-time to trigger client push notifications</span>
                  <span className="font-bold text-rose-600">{orders.filter(o => o.status !== 'delivered').length} pending dispatch</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      id={`admin-order-card-${ord.id}`}
                      className="bg-amber-50/30 border border-stone-200 rounded-2xl p-4 space-y-3.5 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-rose-700 text-sm">#{ord.orderNumber}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {ord.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5 font-medium">
                              {ord.location.name} • <strong className="text-stone-900">{ord.addressDetails.unitOrRoom}</strong>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-stone-900">₹{ord.totalAmount}</span>
                            <span className="block text-[10px] text-stone-400 uppercase">{ord.payment.method}</span>
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="py-2 space-y-1.5 text-xs text-stone-700">
                          {ord.items.map((item) => (
                            <div key={item.cartItemId} className="flex justify-between font-medium">
                              <span>
                                <strong className="text-rose-600 font-bold">{item.quantity}x</strong> {item.item.name}
                                {item.addedByMemberName && (
                                  <span className="text-[10px] text-rose-600 ml-1">({item.addedByMemberName})</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Special cooking notes if present */}
                        {ord.addressDetails.specialInstructions && (
                          <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200 font-medium">
                            Instruction: "{ord.addressDetails.specialInstructions}"
                          </div>
                        )}
                      </div>

                      {/* State transition controls */}
                      <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'kitchen_prep')}
                          disabled={ord.status !== 'confirmed'}
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                            ord.status === 'kitchen_prep' 
                              ? 'bg-amber-500 text-white shadow-xs' 
                              : 'bg-white border border-stone-200 hover:bg-amber-50 text-stone-700 disabled:opacity-30'
                          }`}
                        >
                          <ChefHat className="w-3 h-3" /> Start Cooking
                        </button>

                        <button
                          onClick={() => updateOrderStatus(ord.id, 'packed')}
                          disabled={['packed', 'out_for_delivery', 'delivered'].includes(ord.status)}
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                            ord.status === 'packed' 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-white border border-stone-200 hover:bg-rose-50 text-stone-700 disabled:opacity-30'
                          }`}
                        >
                          <Package className="w-3 h-3" /> Mark Packed
                        </button>

                        <button
                          onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                          disabled={['out_for_delivery', 'delivered'].includes(ord.status)}
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                            ord.status === 'out_for_delivery' 
                              ? 'bg-amber-500 text-stone-900 font-black shadow-xs' 
                              : 'bg-white border border-stone-200 hover:bg-amber-50 text-stone-700 disabled:opacity-30'
                          }`}
                        >
                          <Bike className="w-3 h-3" /> Hand to Rider
                        </button>

                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          disabled={ord.status === 'delivered'}
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                            ord.status === 'delivered' 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-white border border-stone-200 hover:bg-emerald-50 text-stone-700 disabled:opacity-30'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Society Batches */}
            {activeAdminTab === 'batches' && (
              <div className="space-y-4">
                <div className="text-xs text-stone-500 font-medium">
                  Consolidated neighborhood batches to optimize fleet dispatch to single gated communities:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(societyBatches).map(([socName, batchOrders]) => (
                    <div key={socName} className="bg-amber-50/30 border border-stone-200 rounded-2xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-stone-900 text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-500" />
                          {socName}
                        </h4>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                          {batchOrders.length} pooled orders
                        </span>
                      </div>

                      <div className="space-y-2 text-xs divide-y divide-stone-200/60">
                        {batchOrders.map((bo) => (
                          <div key={bo.id} className="pt-2 first:pt-0 flex justify-between text-stone-700 font-medium">
                            <span>#{bo.orderNumber} ({bo.addressDetails.unitOrRoom})</span>
                            <span className="text-rose-600 font-mono font-bold">₹{bo.totalAmount}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          batchOrders.forEach(bo => updateOrderStatus(bo.id, 'out_for_delivery'));
                        }}
                        className="w-full mt-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/25"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Dispatch Entire Batch with Fleet Rider</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Inventory 86 */}
            {activeAdminTab === 'inventory' && (
              <div className="space-y-4">
                <div className="text-xs text-stone-500 font-medium">
                  Toggle kitchen dish availability in real-time (86'd items instantly show as "Sold Out" for residents):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {menuItems.map((dish) => (
                    <div 
                      key={dish.id} 
                      className="bg-amber-50/30 border border-stone-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-stone-900 truncate">{dish.name}</div>
                        <div className="text-[10px] text-stone-500 font-medium">₹{dish.price} • {dish.category}</div>
                      </div>

                      <button
                        onClick={() => toggleItemStock(dish.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                          dish.inStock 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {dish.inStock ? 'In Stock' : '86 / Out'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Tiffin Subscriptions Queue */}
            {activeAdminTab === 'subscriptions' && (
              <div className="space-y-4">
                <div className="text-xs text-stone-500 font-medium">
                  Daily recurring tiffin orders for local PG residents:
                </div>

                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-amber-50/30 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-900 font-black">{sub.recipientName}</strong>
                          <span className="text-stone-500">({sub.roomOrFlat})</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-stone-500 mt-0.5 font-medium">{sub.planName} • {sub.deliverySlot}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-rose-600 font-black">{sub.mealsRemaining} meals remaining</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
