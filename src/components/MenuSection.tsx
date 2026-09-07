import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';
import { CustomizationModal } from './CustomizationModal';
import { 
  Search, 
  Flame, 
  Sparkles, 
  Clock, 
  Star, 
  Plus, 
  Minus, 
  Users, 
  Check, 
  SlidersHorizontal,
  ChefHat,
  Zap,
  TrendingUp
} from 'lucide-react';

export const MenuSection: React.FC = () => {
  const { 
    menuItems, 
    cart, 
    addToCart, 
    updateQuantity, 
    selectedLocation, 
    setCurrentTab,
    groupSession,
    activeSocietyResidentCount,
    isFirebaseConnected,
    currentUser
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [spiceFilter, setSpiceFilter] = useState<number | 'all'>('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [recommendationType, setRecommendationType] = useState<'society' | 'quick' | 'chef' | 'comfort'>('society');

  const categories = [
    'All',
    'Cravings',
    'Thalis & Tiffins',
    'Biryani Bowls',
    'Rolls & Wraps',
    'Snacks',
    'Desserts & Drinks',
  ];

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (dietaryFilter === 'veg' && item.dietary !== 'veg') return false;
      if (dietaryFilter === 'non-veg' && item.dietary !== 'non-veg') return false;
      if (spiceFilter !== 'all' && item.spiceLevel !== spiceFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, spiceFilter, searchQuery]);

  // Helper to find quantity in cart
  const getItemCartQuantity = (itemId: string) => {
    return cart
      .filter(c => c.item.id === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  // Smart suggestions categorized for scale
  const recommendedDishes = useMemo(() => {
    return menuItems.filter(item => {
      if (recommendationType === 'society') {
        return item.isPopular || item.rating >= 4.8;
      }
      if (recommendationType === 'quick') {
        return item.preparationTimeMinutes <= 15;
      }
      if (recommendationType === 'chef') {
        return item.isChefSpecial;
      }
      if (recommendationType === 'comfort') {
        return item.category === 'Thalis & Tiffins' || item.category === 'Biryani Bowls';
      }
      return true;
    }).slice(0, 6);
  }, [menuItems, recommendationType]);

  const handleAddItem = (item: MenuItem) => {
    if (item.customizationOptions && item.customizationOptions.length > 0) {
      setCustomizingItem(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      
      {/* Appetite-stimulating Hero Banner - Bright Tempting Sizzling Cravery */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white shadow-xl border border-rose-400/30 seductive-glow">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        
        {/* Seductive Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-5 py-8 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3.5 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-white border border-white/30 shadow-xs">
              <Flame className="w-4 h-4 text-amber-200 fill-amber-200 animate-bounce" />
              <span>D&B • Hyperlocal Gourmet Cravery</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-white drop-shadow-sm">
              Crave till you <span className="underline decoration-amber-300 decoration-wavy decoration-2">drool.</span> Finish with a happy <span className="text-amber-200">burp.</span>
            </h1>

            <p className="text-xs sm:text-sm text-rose-50 font-medium leading-relaxed max-w-lg">
              Hot buttery tandoori naanzas, velvety slow-melt curries, and fragrant dum biryanis dispatched sizzling hot in neighborhood runs directly to <strong className="text-white underline decoration-amber-300 font-black">{selectedLocation.name}</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
              <button
                id="hero-group-order-cta"
                onClick={() => setCurrentTab('group')}
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-black/30 transition-all transform active:scale-95 border border-white/15"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>{groupSession ? 'Open Active Group Tray' : 'Start PG / Society Group Order'}</span>
              </button>

              <button
                id="hero-subscriptions-cta"
                onClick={() => setCurrentTab('subscriptions')}
                className="flex items-center gap-2 bg-white/90 hover:bg-white text-stone-900 border border-white/60 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md"
              >
                <ChefHat className="w-4 h-4 text-rose-600" />
                <span>Explore Homestyle Tiffins</span>
              </button>
            </div>
          </div>

          {/* Quick status banner card - Warm White Porcelain with Amber Accent */}
          <div className="w-full lg:w-auto bg-white/95 text-stone-900 backdrop-blur-md border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-xs max-w-sm shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
              <span className="font-black text-stone-900 flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-rose-600 fill-rose-600" /> Live Kitchen Wok Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px]">
                ● Woks Firing Hot
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-500 font-medium">Next batch hot departure:</span>
                <span className="font-black text-rose-600">{selectedLocation.nextBatchCountdownMin} mins</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-500 font-medium">Active society orders:</span>
                <span className="font-bold text-stone-900">{selectedLocation.activeOrdersCount} flatmates ordering</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-500 font-medium">Free delivery threshold:</span>
                <span className="font-black text-emerald-700">₹{selectedLocation.freeDeliveryThreshold} or Group Tray</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/80 text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl font-bold">
              💡 Tip: Combine trays with roommates to unlock ₹0 delivery and group perks!
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Smart Suggestions Engine - Bright Warm Porcelain Card */}
      <section className="bg-white border border-amber-200/80 rounded-3xl p-4 sm:p-6 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.12)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <h2 className="font-display font-black text-xl text-stone-900 tracking-tight">
                Drool-Worthy Suggestions
              </h2>
              {isFirebaseConnected && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Live Cloud Sync
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Tempting bites handcrafted for craving hours in <strong className="text-stone-900 font-bold">{selectedLocation.name}</strong> ({activeSocietyResidentCount} orders live).
            </p>
          </div>

          {/* Filter Pills for Recommendations */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <button
              id="rec-tab-society"
              onClick={() => setRecommendationType('society')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                recommendationType === 'society'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/25'
                  : 'bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              🔥 Trending in {selectedLocation.type}
            </button>
            <button
              id="rec-tab-quick"
              onClick={() => setRecommendationType('quick')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                recommendationType === 'quick'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/25'
                  : 'bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              ⚡ Under 15m
            </button>
            <button
              id="rec-tab-chef"
              onClick={() => setRecommendationType('chef')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                recommendationType === 'chef'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/25'
                  : 'bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              👨‍🍳 Chef Specials
            </button>
            <button
              id="rec-tab-comfort"
              onClick={() => setRecommendationType('comfort')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                recommendationType === 'comfort'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md shadow-rose-600/25'
                  : 'bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              🍛 Homestyle Meals
            </button>
          </div>
        </div>

        {/* Responsive Horizontal Suggestion Cards Grid / Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {recommendedDishes.map((item) => {
            const qtyInCart = getItemCartQuantity(item.id);
            return (
              <div 
                key={`rec-${item.id}`}
                id={`rec-item-${item.id}`}
                className="bg-[#FFFDF9] rounded-2xl p-2.5 border border-amber-200/70 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative h-24 w-full rounded-xl overflow-hidden mb-2 bg-stone-100">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-xs text-[10px] text-stone-900 px-1.5 py-0.5 rounded-md font-black flex items-center gap-1 shadow-xs">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span>{item.rating}</span>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-stone-900/80 text-[9px] text-amber-300 font-bold px-1.5 py-0.5 rounded">
                    {item.preparationTimeMinutes}m
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-xs text-stone-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-rose-600">₹{item.price}</span>
                    {item.inStock ? (
                      qtyInCart > 0 ? (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white rounded-lg px-1.5 py-0.5 font-bold text-[10px]">
                          <button onClick={() => updateQuantity(cart.find(c => c.item.id === item.id)!.cartItemId, -1)}>
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span>{qtyInCart}</span>
                          <button onClick={() => updateQuantity(cart.find(c => c.item.id === item.id)!.cartItemId, 1)}>
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-amber-50 hover:bg-gradient-to-r hover:from-rose-600 hover:to-amber-500 text-stone-800 hover:text-white border border-amber-300 hover:border-transparent px-2 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] text-stone-400 font-bold">Sold Out</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search & Filter Bar - Bright Tempting Controls */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cravings, biryanis, gravies, rolls, tiffins..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="filter-dietary-all"
              onClick={() => setDietaryFilter('all')}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                dietaryFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              All Diets
            </button>
            <button
              id="filter-dietary-veg"
              onClick={() => setDietaryFilter('veg')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Veg Only</span>
            </button>
            <button
              id="filter-dietary-nonveg"
              onClick={() => setDietaryFilter('non-veg')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-amber-100">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white shadow-md shadow-rose-600/25'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:border-amber-400 hover:text-stone-900 shadow-xs'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Food Items Grid - Seductive Gourmet Presentation */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-black text-stone-900">
              {selectedCategory === 'All' ? 'Hot & Sizzling from Kitchen' : selectedCategory}
            </h2>
            <span className="text-xs bg-rose-100 text-rose-800 border border-rose-200 font-black px-2.5 py-0.5 rounded-full">
              {filteredItems.length} cravings
            </span>
          </div>

          <div className="text-xs text-stone-500 font-medium hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Average prep: ~15 mins
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-200 shadow-xs">
            <ChefHat className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <p className="text-stone-600 font-medium text-sm">No dishes match your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setDietaryFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-rose-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((dish) => {
              const qtyInCart = getItemCartQuantity(dish.id);
              const isVeg = dish.dietary === 'veg';

              return (
                <div
                  key={dish.id}
                  id={`dish-card-${dish.id}`}
                  className="group bg-white rounded-3xl border border-amber-200/70 hover:border-rose-400 overflow-hidden shadow-[0_4px_24px_-4px_rgba(245,158,11,0.08)] hover:shadow-[0_16px_36px_-6px_rgba(225,29,72,0.16)] transition-all flex flex-col justify-between"
                >
                  {/* Image & Badges */}
                  <div>
                    <div className="relative h-48 sm:h-52 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Dietary indicator dot */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow border border-white/40 flex items-center justify-center">
                        <div className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                          isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`} />
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        {dish.isChefSpecial && (
                          <span className="bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md border border-white/20">
                            Chef Seduction
                          </span>
                        )}
                        {dish.isPopular && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                            Bestseller
                          </span>
                        )}
                      </div>

                      {/* Rating & prep time pill */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-stone-900 text-[11px] font-bold">
                        <span className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/60 shadow-xs">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <strong className="font-black">{dish.rating}</strong>
                          <span className="text-stone-500 font-normal">({dish.reviewsCount})</span>
                        </span>

                        <span className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/60 shadow-xs text-stone-800">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span>{dish.preparationTimeMinutes}m prep</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-black text-lg text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                          {dish.name}
                        </h3>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
                        {dish.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1 font-medium">
                        <span className="text-stone-700 font-semibold">{dish.portionSize}</span>
                        {dish.spiceLevel > 0 && (
                          <span className="text-rose-600 flex items-center font-bold">
                            {'🌶️'.repeat(dish.spiceLevel)} {dish.spiceLevel === 3 ? 'Fiery' : dish.spiceLevel === 2 ? 'Medium' : 'Mild'}
                          </span>
                        )}
                        {dish.calories && (
                          <span className="text-stone-400">{dish.calories} kcal</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Controls */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-amber-50 flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-stone-950 font-display">
                        ₹{dish.price}
                      </span>
                      {dish.originalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{dish.originalPrice}
                        </span>
                      )}
                    </div>

                    {!dish.inStock ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        Sold Out
                      </span>
                    ) : qtyInCart > 0 ? (
                      <div className="flex items-center bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-xl shadow-md overflow-hidden border border-rose-400/20">
                        <button
                          id={`dish-minus-${dish.id}`}
                          onClick={() => {
                            const cartItem = cart.find(c => c.item.id === dish.id);
                            if (cartItem) updateQuantity(cartItem.cartItemId, -1);
                          }}
                          className="px-2.5 py-1.5 hover:bg-black/15 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black px-2 min-w-[20px] text-center">
                          {qtyInCart}
                        </span>
                        <button
                          id={`dish-plus-${dish.id}`}
                          onClick={() => handleAddItem(dish)}
                          className="px-2.5 py-1.5 hover:bg-black/15 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`dish-add-${dish.id}`}
                        onClick={() => handleAddItem(dish)}
                        className="flex items-center gap-1 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-rose-600/25 transition-all transform active:scale-95 border border-rose-400/20"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add</span>
                        {dish.customizationOptions && dish.customizationOptions.length > 0 && (
                          <span className="text-[10px] text-amber-200 ml-0.5">+</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Customization modal trigger */}
      <CustomizationModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirm={(options, notes) => {
          if (customizingItem) {
            addToCart(customizingItem, options, notes);
          }
        }}
      />
    </div>
  );
};
