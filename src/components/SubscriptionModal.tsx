import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealSubscription } from '../types';
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Sparkles, 
  Plus, 
  Utensils, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export const SubscriptionModal: React.FC = () => {
  const { 
    subscriptions, 
    addSubscription, 
    toggleSubscriptionPause, 
    toggleSubscriptionDatePause, 
    selectedLocation,
    residentProfile,
    addressDetails
  } = useApp();

  const [selectedPlanType, setSelectedPlanType] = useState<'lunch_dinner' | 'dinner_only' | 'weekend_feast'>('lunch_dinner');
  const [dietaryPref, setDietaryPref] = useState<'veg' | 'non-veg' | 'mix'>('mix');
  const [showNewSubForm, setShowNewSubForm] = useState(false);

  // Generate the next 7 days for the interactive pause/skip calendar
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    return { dateStr, dayName, dayNumber };
  });

  const availablePlans = [
    {
      type: 'lunch_dinner' as const,
      name: 'PG Daily Lunch + Dinner Pro',
      price: 1199,
      mealsCount: 14,
      desc: '14 hot homestyle meals/week delivered straight to your PG room. Includes 4 ghee phulkas, dal tadka, fresh sabzi, jeera rice, salad & sweet.',
      popular: true,
      slot: 'Lunch: 1:15 PM | Dinner: 8:30 PM',
    },
    {
      type: 'dinner_only' as const,
      name: 'Dinner Only Express Tiffin',
      price: 699,
      mealsCount: 7,
      desc: '7 wholesome evening dinners. Perfect for techies and students returning late from office or campus.',
      popular: false,
      slot: 'Dinner: 8:30 PM - 9:00 PM',
    },
    {
      type: 'weekend_feast' as const,
      name: 'Weekend Feast Pass',
      price: 449,
      mealsCount: 4,
      desc: 'Saturday & Sunday special treat: Royal Dum Biryani, Paneer Tikka Rolls, and Rabri Gulab Jamun.',
      popular: false,
      slot: 'Sat & Sun Lunch: 1:30 PM',
    },
  ];

  const handleCreateSub = (plan: typeof availablePlans[0]) => {
    addSubscription({
      planName: plan.name,
      planType: plan.type,
      dietaryPreference: dietaryPref,
      pricePerWeek: plan.price,
      description: plan.desc,
      deliverySlot: plan.slot,
      location: selectedLocation,
      roomOrFlat: addressDetails.unitOrRoom || 'Room 304',
      recipientName: residentProfile.name,
      recipientPhone: residentProfile.phone,
      pausedDates: [],
      autoRenew: true,
    });
    setShowNewSubForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner - Bright Tempting Rose Amber */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-400/30 relative overflow-hidden seductive-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-white shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-200" />
              <span>Drool & Burp Daily Subscriptions</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white drop-shadow-sm">
              Daily Tiffin & Royal Meal Subscriptions
            </h1>
            <p className="text-xs sm:text-sm text-rose-50 max-w-lg leading-relaxed font-medium">
              Never worry about what to eat in your PG or Society. Savor slow-simmered, tempting meals delivered on autopilot with 1-tap pause & skip flexibility.
            </p>
          </div>

          <button
            id="explore-new-plan-btn"
            onClick={() => setShowNewSubForm(!showNewSubForm)}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl transition-all transform active:scale-95 shrink-0 flex items-center gap-2 border border-white/15"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{showNewSubForm ? 'View Active Subscriptions' : 'Subscribe New Plan'}</span>
          </button>
        </div>
      </div>

      {/* Active Subscriptions Section */}
      {subscriptions.length > 0 && !showNewSubForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-lg text-stone-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-rose-600" />
              Your Active Tiffin Subscriptions
            </h2>
            <span className="text-xs text-stone-500 font-medium">Delivering to {selectedLocation.name}</span>
          </div>

          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const isPaused = sub.status === 'paused';

              return (
                <div 
                  key={sub.id} 
                  id={`sub-card-${sub.id}`}
                  className={`bg-white rounded-3xl p-6 border shadow-[0_4px_24px_-4px_rgba(245,158,11,0.08)] transition-all space-y-5 ${
                    isPaused ? 'border-stone-200 opacity-75' : 'border-amber-200 ring-1 ring-amber-100'
                  }`}
                >
                  {/* Title & Status Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-black text-lg text-stone-900">{sub.planName}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isPaused ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {isPaused ? 'Paused ⏸️' : 'Active & Sizzling 🟢'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Slot: {sub.deliverySlot} • Room: {sub.roomOrFlat}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`toggle-pause-sub-${sub.id}`}
                        onClick={() => toggleSubscriptionPause(sub.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                          isPaused
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                            : 'bg-amber-50 hover:bg-amber-100 text-rose-700 border border-amber-200'
                        }`}
                      >
                        {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                        <span>{isPaused ? 'Resume Plan' : 'Pause Deliveries'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Meals Remaining & Diet Badge */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                      <span className="text-stone-500 text-[11px] font-medium">Meals Remaining</span>
                      <div className="font-black text-base text-rose-600 font-mono">{sub.mealsRemaining} Meals</div>
                    </div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                      <span className="text-stone-500 text-[11px] font-medium">Dietary Choice</span>
                      <div className="font-black text-base text-stone-900 capitalize">{sub.dietaryPreference} Thali</div>
                    </div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                      <span className="text-stone-500 text-[11px] font-medium">Weekly Price</span>
                      <div className="font-black text-base text-rose-600 font-mono">₹{sub.pricePerWeek}/wk</div>
                    </div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                      <span className="text-stone-500 text-[11px] font-medium">Auto Renewal</span>
                      <div className="font-black text-base text-emerald-700">Enabled</div>
                    </div>
                  </div>

                  {/* Interactive Date Skip Calendar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        Upcoming 7 Days (Tap to Skip / Resume Any Day)
                      </label>
                      <span className="text-[11px] text-stone-500">Skipped meals roll over automatically</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {next7Days.map((day) => {
                        const isDayPaused = sub.pausedDates.includes(day.dateStr);

                        return (
                          <button
                            key={day.dateStr}
                            id={`skip-date-${day.dateStr}`}
                            onClick={() => toggleSubscriptionDatePause(sub.id, day.dateStr)}
                            className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 shadow-xs ${
                              isDayPaused
                                ? 'bg-rose-50 border-rose-300 text-rose-700 opacity-90'
                                : 'bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:border-emerald-500'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold text-stone-500">{day.dayName}</span>
                            <span className="text-base font-black font-mono text-stone-900">{day.dayNumber}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              isDayPaused ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                            }`}>
                              {isDayPaused ? 'Skipped' : 'Delivering'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Plans Catalog / New Subscription Form */}
      {(showNewSubForm || subscriptions.length === 0) && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-lg text-stone-900">
              Select Your Preferred Tiffin Package
            </h2>
            <div className="flex items-center gap-1 bg-white border border-stone-200 p-1 rounded-2xl text-xs font-bold shadow-xs">
              <button
                onClick={() => setDietaryPref('veg')}
                className={`px-3 py-1 rounded-xl transition-colors ${dietaryPref === 'veg' ? 'bg-emerald-600 text-white shadow' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Veg
              </button>
              <button
                onClick={() => setDietaryPref('mix')}
                className={`px-3 py-1 rounded-xl transition-colors ${dietaryPref === 'mix' ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Mix
              </button>
              <button
                onClick={() => setDietaryPref('non-veg')}
                className={`px-3 py-1 rounded-xl transition-colors ${dietaryPref === 'non-veg' ? 'bg-red-600 text-white shadow' : 'text-stone-500 hover:text-stone-900'}`}
              >
                Non-Veg
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <div 
                key={plan.type}
                className="bg-white rounded-3xl p-6 border border-amber-200/80 hover:border-rose-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {plan.popular && (
                    <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs inline-block">
                      Most Popular in PGs
                    </span>
                  )}
                  <h3 className="font-display font-black text-lg text-stone-900">{plan.name}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{plan.desc}</p>
                  
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1 text-xs">
                    <div className="text-stone-800 font-bold">Daily Slot: {plan.slot}</div>
                    <div className="text-emerald-700 font-black">{plan.mealsCount} Meals / Week</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black font-display text-rose-600">₹{plan.price}</span>
                    <span className="text-xs text-stone-500 font-medium"> /week</span>
                  </div>

                  <button
                    id={`select-plan-${plan.type}`}
                    onClick={() => handleCreateSub(plan)}
                    className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition-all"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
