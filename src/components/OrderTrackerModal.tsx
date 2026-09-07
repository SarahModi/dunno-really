import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Flame, 
  Package, 
  Bike, 
  ShieldCheck, 
  ChevronRight, 
  Copy, 
  Check, 
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const OrderTrackerModal: React.FC = () => {
  const { 
    orders, 
    activeTrackingOrderId, 
    setActiveTrackingOrderId, 
    updateOrderStatus,
    setCurrentTab
  } = useApp();

  const [copiedOtp, setCopiedOtp] = useState(false);
  const [callRiderSimulated, setCallRiderSimulated] = useState(false);

  const activeOrder = orders.find(o => o.id === activeTrackingOrderId) || orders[0];

  // Auto-progress simulation effect for realism if desired
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    // A subtle interval that allows natural step progression
    const timer = setTimeout(() => {
      // Automatic progression can happen, but we also provide an interactive button
    }, 15000);

    return () => clearTimeout(timer);
  }, [activeOrder]);

  if (!activeOrder) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-rose-600 mx-auto flex items-center justify-center shadow-md">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black font-display text-stone-900">No Active Orders Right Now</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Satisfy your cravings from the Drool & Burp kitchen to track your hot delivery here in real-time.
        </p>
        <button
          onClick={() => setCurrentTab('menu')}
          className="text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 px-6 py-3 rounded-xl shadow-md shadow-rose-600/25 transition-all"
        >
          Browse Sizzling Menu
        </button>
      </div>
    );
  }

  const stages: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle2 className="w-4 h-4" />, desc: 'Kitchen accepted ticket' },
    { key: 'kitchen_prep', label: 'Tawa Sizzling', icon: <Flame className="w-4 h-4" />, desc: 'Chef cooking fresh portions' },
    { key: 'packed', label: 'Packed & Insulated', icon: <Package className="w-4 h-4" />, desc: 'Thermal sealing completed' },
    { key: 'out_for_delivery', label: 'Rider on Way', icon: <Bike className="w-4 h-4" />, desc: 'Cruising through neighborhood' },
    { key: 'delivered', label: 'At Society Gate', icon: <ShieldCheck className="w-4 h-4" />, desc: 'Handover with OTP' },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return 0;
      case 'kitchen_prep': return 1;
      case 'packed': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(activeOrder.status);

  const handleNextSimulationStage = () => {
    const nextStates: OrderStatus[] = ['confirmed', 'kitchen_prep', 'packed', 'out_for_delivery', 'delivered'];
    const currentPos = nextStates.indexOf(activeOrder.status);
    if (currentPos < nextStates.length - 1) {
      updateOrderStatus(activeOrder.id, nextStates[currentPos + 1]);
    }
  };

  const copyOtp = () => {
    if (activeOrder.rider?.deliveryOtp) {
      navigator.clipboard?.writeText(activeOrder.rider.deliveryOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  // Map route percentage calculation
  const riderProgressPercent = activeOrder.status === 'delivered' ? 100 : activeOrder.status === 'out_for_delivery' ? 68 : activeOrder.status === 'packed' ? 30 : 15;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner with ETA & Status - Bright Tempting Rose Amber */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-400/30 relative overflow-hidden seductive-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/20 pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-amber-200">
              <span>Order #{activeOrder.orderNumber}</span>
              <span>•</span>
              <span className="text-rose-50">{activeOrder.location.name}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black mt-1 text-white drop-shadow-sm">
              {activeOrder.status === 'delivered' ? 'Food Delivered! Enjoy Your Feast 🍛' : 'Piping Hot Food is En Route'}
            </h1>
          </div>

          <div className="bg-white/95 text-stone-900 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/40 text-center shrink-0 shadow-lg">
            <div className="text-[10px] uppercase font-black tracking-wider text-stone-500">Estimated Arrival</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-600">
              {activeOrder.status === 'delivered' ? 'Delivered' : `~${activeOrder.rider?.etaMinutes || 8} MINS`}
            </div>
          </div>
        </div>

        {/* Horizontal Progress Pipeline */}
        <div className="pt-6 relative z-10">
          <div className="grid grid-cols-5 gap-2 relative">
            {/* Connecting line */}
            <div className="absolute top-4 left-4 right-4 h-1.5 bg-black/20 rounded-full -z-0 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700 shadow-sm" 
                style={{ width: `${(currentIndex / 4) * 100}%` }}
              />
            </div>

            {stages.map((st, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={st.key} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                    isPast || isCurrent
                      ? 'bg-white text-rose-600 font-black shadow-md scale-105'
                      : 'bg-white/25 text-white/70 border border-white/30'
                  } ${isCurrent ? 'ring-4 ring-white/50 animate-pulse' : ''}`}>
                    {st.icon}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-black mt-2 leading-tight ${
                    isCurrent ? 'text-white' : isPast ? 'text-rose-100' : 'text-white/60'
                  }`}>
                    {st.label}
                  </span>
                  <span className="text-[9px] text-rose-100 hidden md:block mt-0.5 max-w-[90px] font-medium">
                    {st.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulation Advance button */}
        {activeOrder.status !== 'delivered' && (
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between relative z-10">
            <span className="text-xs text-rose-50 flex items-center gap-1.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-200" /> Live neighborhood telemetry tracking active
            </span>
            <button
              id="simulate-next-stage-btn"
              onClick={handleNextSimulationStage}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-black px-3.5 py-1.5 rounded-xl shadow transition-colors flex items-center gap-1"
            >
              <span>Fast-Forward Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Map & Delivery Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Animated GPS Map View */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-amber-200/80 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.08)] space-y-4 text-stone-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-rose-600 flex items-center justify-center shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-stone-900">Neighborhood Route Radar</h3>
                <p className="text-xs text-stone-500">Live GPS tracking via Drool & Burp Fleet</p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              GPS Signal Live
            </span>
          </div>

          {/* Graphical Map Canvas Container */}
          <div className="relative h-64 sm:h-72 w-full bg-amber-50/40 rounded-2xl overflow-hidden border border-amber-200/80 flex items-center justify-center p-4">
            {/* Stylised Map Grid Background */}
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Stylised Roads SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path 
                d="M 40 160 Q 140 140, 200 100 T 360 40" 
                fill="none" 
                stroke="#fed7aa" 
                strokeWidth="10" 
                strokeLinecap="round"
              />
              <path 
                d="M 40 160 Q 140 140, 200 100 T 360 40" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="4" 
                strokeDasharray="6,6"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>

            {/* Kitchen Location Pin */}
            <div className="absolute left-6 bottom-6 flex flex-col items-center z-10">
              <div className="bg-gradient-to-br from-rose-600 to-amber-500 text-white p-2.5 rounded-2xl shadow-md border border-rose-300">
                <Flame className="w-4 h-4 fill-amber-200 text-amber-200" />
              </div>
              <span className="text-[10px] font-black text-stone-900 bg-white/95 border border-amber-200 px-2 py-0.5 rounded-md mt-1 whitespace-nowrap shadow-xs">
                D&B Kitchen
              </span>
            </div>

            {/* Destination PG / Society Gate Pin */}
            <div className="absolute right-6 top-6 flex flex-col items-center z-10">
              <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-md border border-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-stone-900 bg-white/95 border border-amber-200 px-2 py-0.5 rounded-md mt-1 whitespace-nowrap max-w-[130px] truncate shadow-xs">
                {activeOrder.location.name}
              </span>
            </div>

            {/* Moving Rider on Route */}
            <div 
              className="absolute z-20 flex flex-col items-center transition-all duration-1000"
              style={{
                left: `${riderProgressPercent}%`,
                top: `${100 - riderProgressPercent * 0.7}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-rose-500/30 rounded-full animate-ping" />
                <div className="relative bg-gradient-to-br from-rose-600 to-amber-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white">
                  <Bike className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-stone-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-stone-700 mt-1 whitespace-nowrap flex items-center gap-1">
                <span>Ashok (~{activeOrder.rider?.etaMinutes || 6}m)</span>
              </div>
            </div>

            {/* Overlay notification pill */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-stone-800 shadow-sm">
              <div className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate text-stone-700 font-medium">Rider passing 4th Cross Ring Road junction</span>
              </div>
              <span className="text-[11px] font-black text-rose-600 shrink-0">Piping Hot 🔥</span>
            </div>
          </div>

          {/* Delivery Address & Gate Note */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1 text-xs">
            <div className="font-black text-stone-900 flex items-center justify-between">
              <span>Drop Location: {activeOrder.location.name}</span>
              <span className="text-rose-600 font-mono font-black">{activeOrder.addressDetails.unitOrRoom}</span>
            </div>
            <p className="text-stone-600 font-medium">{activeOrder.addressDetails.towerOrBlock}</p>
            {activeOrder.addressDetails.specialInstructions && (
              <p className="text-stone-800 font-bold text-[11px] pt-1.5 border-t border-amber-200">
                Gate Instructions: "{activeOrder.addressDetails.specialInstructions}"
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Rider Card & Gate Pass OTP */}
        <div className="space-y-6">
          
          {/* Gate Pass OTP Box - Tempting Rose Amber */}
          <div className="bg-gradient-to-br from-rose-600 to-amber-500 text-white rounded-3xl p-5 shadow-lg border border-rose-400/30 text-center space-y-2">
            <div className="text-[10px] uppercase font-black tracking-wider text-amber-100">
              Society Gate / Security Delivery Pass
            </div>
            <div className="text-3xl font-black font-mono tracking-widest text-white drop-shadow-sm">
              {activeOrder.rider?.deliveryOtp || '4821'}
            </div>
            <p className="text-[11px] text-rose-50 font-medium">
              Share this 4-digit code with the delivery partner or society guard
            </p>
            <button
              onClick={copyOtp}
              className="inline-flex items-center gap-1.5 bg-black/20 hover:bg-black/30 border border-white/20 px-4 py-1.5 rounded-xl text-xs font-black transition-colors"
            >
              {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOtp ? 'Copied Code' : 'Copy OTP'}</span>
            </button>
          </div>

          {/* Rider Profile Card */}
          {activeOrder.rider && (
            <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-md space-y-4 text-stone-900">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
                  Delivery Partner
                </h4>
                <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                  ⭐ {activeOrder.rider.rating}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 text-white font-bold flex items-center justify-center text-base shadow-sm">
                  {activeOrder.rider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-stone-900">{activeOrder.rider.name}</h3>
                  <p className="text-xs text-stone-500 font-mono">{activeOrder.rider.vehicleNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="call-rider-btn"
                  onClick={() => {
                    setCallRiderSimulated(true);
                    setTimeout(() => setCallRiderSimulated(false), 3000);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black border border-rose-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{callRiderSimulated ? 'Connecting...' : 'Call Rider'}</span>
                </button>

                <button
                  id="chat-rider-btn"
                  onClick={() => alert(`Messaging ${activeOrder.rider?.name}: "I am at ${activeOrder.addressDetails.unitOrRoom}"`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-200 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Gate Note</span>
                </button>
              </div>
            </div>
          )}

          {/* Order Summary in Tracker */}
          <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-md space-y-3 text-stone-900">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              Order Items ({activeOrder.items.length})
            </h4>

            <div className="space-y-2 text-xs divide-y divide-amber-100">
              {activeOrder.items.map((item) => (
                <div key={item.cartItemId} className="pt-2 first:pt-0 flex justify-between">
                  <div>
                    <span className="font-black text-stone-900">{item.quantity}x {item.item.name}</span>
                    {item.addedByMemberName && (
                      <span className="block text-[10px] text-rose-600 font-bold">For {item.addedByMemberName}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-stone-600">₹{item.item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-200 pt-3 flex justify-between items-center text-xs font-bold">
              <span className="text-stone-500">Total Paid ({activeOrder.payment.method.toUpperCase()})</span>
              <span className="text-sm font-display font-black text-rose-600">₹{activeOrder.totalAmount}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
