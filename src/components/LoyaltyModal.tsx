import React from 'react';
import { useApp } from '../context/AppContext';
import { LOYALTY_REWARDS } from '../data/mockData';
import { 
  Award, 
  Sparkles, 
  Gift, 
  Check, 
  Crown, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';
import { LoyaltyReward } from '../types';

export const LoyaltyModal: React.FC = () => {
  const { loyaltyPoints, redeemLoyaltyReward, setIsCartOpen } = useApp();

  // Tier calculation
  const getTierInfo = (points: number) => {
    if (points >= 500) {
      return {
        name: 'Feast Master',
        nextTier: 'Max Tier Reached!',
        nextThreshold: 500,
        progress: 100,
        color: 'from-amber-500 to-yellow-600',
        badge: '👑 Feast Master',
      };
    }
    if (points >= 150) {
      return {
        name: 'Foodie',
        nextTier: 'Feast Master (500 pts)',
        nextThreshold: 500,
        progress: Math.round(((points - 150) / 350) * 100),
        color: 'from-orange-500 to-red-600',
        badge: '🎖️ Foodie',
      };
    }
    return {
      name: 'Snacker',
      nextTier: 'Foodie (150 pts)',
      nextThreshold: 150,
      progress: Math.round((points / 150) * 100),
      color: 'from-stone-700 to-stone-900',
      badge: '🍪 Snacker',
    };
  };

  const tier = getTierInfo(loyaltyPoints);

  const handleRedeem = (reward: LoyaltyReward) => {
    const ok = redeemLoyaltyReward(reward);
    if (ok) {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner - Bright Tempting Rose Amber */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-400/30 relative overflow-hidden seductive-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-white shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>Drool & Burp VIP Bites Club</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white drop-shadow-sm">
              Your Bites Balance: <span className="text-amber-200 font-mono">{loyaltyPoints}</span> Points
            </h1>
            <p className="text-xs sm:text-sm text-rose-50 max-w-lg leading-relaxed font-medium">
              Earn 10 Drool Bites on every ₹100 spent in the neighborhood. Redeem points for decadent desserts, chef specials, and instant billing discounts.
            </p>
          </div>

          <div className="bg-white/95 text-stone-900 backdrop-blur-md p-5 rounded-2xl border border-white/40 text-center shrink-0 w-full sm:w-auto shadow-lg">
            <span className="text-[10px] uppercase font-black tracking-wider text-stone-500">Current Status</span>
            <div className="text-2xl font-black text-rose-600 font-display mt-0.5">{tier.badge}</div>
            <div className="text-[11px] text-stone-500 mt-1 font-semibold">
              Next: {tier.nextTier}
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/20 space-y-2 relative z-10">
          <div className="flex justify-between text-xs text-rose-50 font-bold">
            <span>Tier Progress ({tier.name})</span>
            <span className="font-mono font-black text-amber-200">{tier.progress}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 shadow-sm" 
              style={{ width: `${tier.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-lg text-stone-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-600" />
            Redeemable Rewards Catalog
          </h2>
          <span className="text-xs text-stone-500 font-medium">Instant application at checkout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LOYALTY_REWARDS.map((reward) => {
            const canAfford = loyaltyPoints >= reward.pointsCost;

            return (
              <div 
                key={reward.id}
                id={`reward-card-${reward.id}`}
                className="bg-white rounded-3xl p-6 border border-amber-200/80 hover:border-rose-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 text-stone-900"
              >
                <div className="space-y-3">
                  <div className="text-3xl">{reward.icon}</div>
                  <h3 className="font-display font-black text-base text-stone-900">{reward.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{reward.description}</p>
                  
                  <div className="text-[11px] font-mono font-bold text-stone-500">
                    Min order: ₹{reward.minOrderValue}
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-rose-600 font-display">{reward.pointsCost}</span>
                    <span className="text-xs text-stone-500 font-medium">Bites</span>
                  </div>

                  <button
                    id={`redeem-btn-${reward.id}`}
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-600/20'
                        : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {canAfford ? 'Redeem & Use' : `Need ${reward.pointsCost - loyaltyPoints} more`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perks Breakdown */}
      <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-800">
        <div className="space-y-1">
          <strong className="text-rose-700 block font-black text-sm">🍪 Snacker (0-150 Pts)</strong>
          <p className="text-stone-600 leading-relaxed font-medium">Decadent treat on your birthday and standard 10% points earning on every craving order.</p>
        </div>
        <div className="space-y-1">
          <strong className="text-rose-700 block font-black text-sm">🎖️ Foodie (150-500 Pts)</strong>
          <p className="text-stone-600 leading-relaxed font-medium">Priority kitchen ticket queue, complimentary secret spice dips, and ₹75 vouchers.</p>
        </div>
        <div className="space-y-1">
          <strong className="text-rose-700 block font-black text-sm">👑 Feast Master (500+ Pts)</strong>
          <p className="text-stone-600 leading-relaxed font-medium">Zero delivery fee on all solo orders, dedicated chef special tastings, and 25% group feast discounts.</p>
        </div>
      </div>

    </div>
  );
};
