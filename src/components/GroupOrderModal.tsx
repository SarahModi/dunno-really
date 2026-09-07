import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_MENU_ITEMS } from '../data/mockData';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  Lock, 
  Sparkles, 
  Building2, 
  DollarSign, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export const GroupOrderModal: React.FC = () => {
  const { 
    groupSession, 
    startGroupOrder, 
    joinGroupOrder, 
    simulateAddGroupMemberItem, 
    leaveGroupOrder, 
    lockGroupOrder,
    cart, 
    selectedLocation, 
    setIsCartOpen,
    residentProfile
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [joinNameInput, setJoinNameInput] = useState('Rahul (Room 302)');

  const copyRoomCode = () => {
    if (groupSession) {
      navigator.clipboard?.writeText(groupSession.roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomInput.trim()) return;
    joinGroupOrder(joinRoomInput, joinNameInput || 'Flatmate');
    setJoinRoomInput('');
  };

  // Calculate bill split per flatmate
  const memberSplits: Record<string, { count: number; total: number; items: string[] }> = {};
  cart.forEach(c => {
    const member = c.addedByMemberName || (groupSession ? residentProfile.name : 'You');
    const optsPrice = (c.selectedOptions || []).reduce((s, o) => s + o.price, 0);
    const itemTotal = (c.item.price + optsPrice) * c.quantity;

    if (!memberSplits[member]) {
      memberSplits[member] = { count: 0, total: 0, items: [] };
    }
    memberSplits[member].count += c.quantity;
    memberSplits[member].total += itemTotal;
    memberSplits[member].items.push(`${c.quantity}x ${c.item.name}`);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner - Bright Tempting Rose Amber */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-400/30 relative overflow-hidden seductive-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-white shadow-xs">
              <Users className="w-3.5 h-3.5 text-amber-200" />
              <span>Drool & Burp Flatmate Group Feast</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white drop-shadow-sm">
              Order Together. Split Bills. Zero Delivery Fee.
            </h1>
            <p className="text-xs sm:text-sm text-rose-50 max-w-lg leading-relaxed font-medium">
              Never have 5 different delivery bikes buzzing your PG or Society gate. Combine your flat's feast into one consolidated, piping hot batch!
            </p>
          </div>

          {!groupSession ? (
            <button
              id="start-group-order-btn"
              onClick={startGroupOrder}
              className="bg-stone-900 hover:bg-stone-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl transition-all transform active:scale-95 shrink-0 flex items-center gap-2 border border-white/15"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Start Flat Group Feast</span>
            </button>
          ) : (
            <div className="bg-white/95 text-stone-900 backdrop-blur-md p-4 rounded-2xl border border-amber-200 text-center shrink-0 shadow-lg">
              <span className="text-[10px] uppercase font-black text-stone-500 tracking-wider">Active Room Code</span>
              <div className="font-mono text-2xl font-black text-rose-600 tracking-wider">
                {groupSession.roomId}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      {!groupSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Join existing room card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.08)] space-y-4 text-stone-900">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 text-white flex items-center justify-center shadow-md">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-stone-900">Join Flatmate's Feast Room</h3>
                <p className="text-xs text-stone-500">Enter code shared on your PG WhatsApp group</p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  Group Room Code *
                </label>
                <input
                  id="input-join-room-code"
                  type="text"
                  value={joinRoomInput}
                  onChange={(e) => setJoinRoomInput(e.target.value)}
                  placeholder="e.g. ROOM-304-SUN"
                  className="w-full text-xs font-mono uppercase px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  Your Name (Shown on food packaging) *
                </label>
                <input
                  id="input-join-member-name"
                  type="text"
                  value={joinNameInput}
                  onChange={(e) => setJoinNameInput(e.target.value)}
                  placeholder="e.g. Rahul (Room 302)"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                />
              </div>

              <button
                id="submit-join-group-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black py-3.5 rounded-xl shadow-md shadow-rose-600/25 transition-all"
              >
                Join Flat Group Feast
              </button>
            </form>
          </div>

          {/* How it works card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.08)] space-y-4 text-stone-700">
            <h3 className="font-display font-black text-base text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              How Group Orders Work
            </h3>

            <div className="space-y-3.5 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-stone-900">Create a Room: </strong>
                  Host creates a room and shares the unique code with flatmates.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-stone-900">Add Cravings Individually: </strong>
                  Everyone adds their own dishes right from their phones.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-stone-900">Clear Split & Single Sizzling Batch: </strong>
                  Host locks and checks out. Everyone sees exactly what they owe, and all food arrives in one warm bag!
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-100 text-[11px] text-stone-600 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free delivery automatically unlocked for all flatmate group batches</span>
            </div>
          </div>

        </div>
      ) : (
        /* Active Group Session View */
        <div className="space-y-6">
          {/* Room Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-stone-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold shadow">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base text-stone-900">
                    Group Room: <span className="font-mono text-rose-600">{groupSession.roomId}</span>
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    groupSession.status === 'locked' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {groupSession.status === 'locked' ? '🔒 Tray Locked' : '🟢 Active & Sizzling'}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Host: {groupSession.hostName} • Delivering to {groupSession.societyName} ({groupSession.roomOrFlat})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="copy-group-code-btn"
                onClick={copyRoomCode}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
              </button>

              {groupSession.status !== 'locked' && (
                <button
                  id="lock-group-tray-btn"
                  onClick={lockGroupOrder}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-black px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/20"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Tray</span>
                </button>
              )}

              <button
                onClick={leaveGroupOrder}
                className="text-stone-500 hover:text-rose-600 text-xs font-bold px-2 py-1"
              >
                Leave
              </button>
            </div>
          </div>

          {/* Flatmates Interactive Simulation Bar */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-stone-900">
            <div className="text-xs text-stone-700">
              <span className="font-black text-rose-600">Test Multi-User Ordering: </span>
              Click this button to simulate your flatmate adding dishes to the shared cart in real-time!
            </div>
            <button
              id="simulate-flatmate-item-btn"
              onClick={() => {
                const sampleDishes = [INITIAL_MENU_ITEMS[1], INITIAL_MENU_ITEMS[2], INITIAL_MENU_ITEMS[5]];
                const randomDish = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
                simulateAddGroupMemberItem('Vikram (Room 301)', randomDish);
              }}
              className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-rose-600/25 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Flatmate Adding Dish</span>
            </button>
          </div>

          {/* Members Bill Split Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bill Split Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-md space-y-4 text-stone-900">
              <h3 className="font-display font-black text-base text-stone-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Automatic Bill Split by Flatmate
              </h3>

              {Object.keys(memberSplits).length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">
                  No items in group tray yet. Pick dishes from the menu to start!
                </p>
              ) : (
                <div className="space-y-3 divide-y divide-amber-100">
                  {Object.entries(memberSplits).map(([member, split]) => (
                    <div key={member} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          {member}
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {split.items.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-rose-600">
                          ₹{split.total}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-medium">
                          {split.count} items
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-amber-100 pt-3 flex items-center justify-between">
                <span className="text-xs text-stone-600 font-medium">Delivery Fee:</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                  ₹0 (Batch Free Delivery)
                </span>
              </div>
            </div>

            {/* Tray Action Card */}
            <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-md flex flex-col justify-between space-y-4 text-stone-900">
              <div className="space-y-3">
                <h3 className="font-display font-black text-base text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-600" />
                  Consolidated Tray Status
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Total items in group tray: <strong className="text-rose-600 font-black">{cart.length} items</strong>.
                  When you check out, the cloud kitchen will pack everything neatly labeled per flatmate!
                </p>
              </div>

              <div className="space-y-2">
                <button
                  id="view-group-tray-btn"
                  onClick={() => setIsCartOpen(true)}
                  className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Review Consolidated Tray & Sizzle Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
