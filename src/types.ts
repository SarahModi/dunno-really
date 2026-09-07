export type DietaryType = 'veg' | 'non-veg' | 'egg' | 'jain';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'Cravings' | 'Thalis & Tiffins' | 'Biryani Bowls' | 'Rolls & Wraps' | 'Snacks' | 'Desserts & Drinks';
  dietary: DietaryType;
  spiceLevel: 0 | 1 | 2 | 3; // 0 none, 1 mild, 2 medium, 3 fiery
  image: string;
  rating: number;
  reviewsCount: number;
  preparationTimeMinutes: number;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  inStock: boolean;
  calories?: number;
  portionSize: string;
  customizationOptions?: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface NeighborhoodLocation {
  id: string;
  name: string;
  type: 'PG' | 'Society' | 'Apartment' | 'Independent';
  area: string;
  distanceKm: number;
  estimatedDeliveryMin: number;
  activeOrdersCount: number;
  nextBatchCountdownMin: number;
  freeDeliveryThreshold: number;
  popularWith: string;
}

export interface CartItem {
  cartItemId: string;
  item: MenuItem;
  quantity: number;
  addedByMemberName?: string; // For group orders
  addedByMemberId?: string;
  selectedOptions?: {
    id: string;
    name: string;
    price: number;
  }[];
  notes?: string;
}

export type OrderStatus = 
  | 'confirmed'
  | 'kitchen_prep'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  location: NeighborhoodLocation;
  addressDetails: {
    unitOrRoom: string;
    towerOrBlock?: string;
    specialInstructions?: string;
  };
  recipient: {
    name: string;
    phone: string;
  };
  payment: {
    method: 'upi' | 'card' | 'cod' | 'wallet';
    transactionId: string;
    paid: boolean;
    cardLast4?: string;
    upiApp?: string;
  };
  rider?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
    currentLocationLat?: number;
    currentLocationLng?: number;
    etaMinutes: number;
    deliveryOtp: string;
  };
  isGroupOrder?: boolean;
  groupOrderRoomId?: string;
  groupMembers?: {
    memberId: string;
    name: string;
    itemCount: number;
    subtotal: number;
  }[];
}

export interface GroupOrderSession {
  roomId: string;
  hostName: string;
  hostPhone: string;
  societyName: string;
  roomOrFlat: string;
  createdAt: string;
  status: 'active' | 'locked' | 'ordered';
  members: {
    id: string;
    name: string;
    isHost: boolean;
    joinedAt: string;
  }[];
  activeCartItems: CartItem[];
}

export interface MealSubscription {
  id: string;
  planName: string;
  planType: 'lunch_dinner' | 'dinner_only' | 'weekend_feast';
  dietaryPreference: 'veg' | 'non-veg' | 'mix';
  pricePerWeek: number;
  description: string;
  status: 'active' | 'paused';
  startDate: string;
  deliverySlot: string; // e.g. "Dinner: 8:15 PM - 8:45 PM"
  location: NeighborhoodLocation;
  roomOrFlat: string;
  recipientName: string;
  recipientPhone: string;
  pausedDates: string[]; // ISO date strings YYYY-MM-DD
  mealsRemaining: number;
  autoRenew: boolean;
}

export interface LoyaltyTier {
  name: 'Snacker' | 'Foodie' | 'Feast Master';
  minPoints: number;
  discountMultiplier: number;
  badgeColor: string;
  perks: string[];
}

export interface LoyaltyReward {
  id: string;
  title: string;
  pointsCost: number;
  couponCode: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue: number;
  description: string;
  icon: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'discount' | 'kitchen' | 'subscription';
  read: boolean;
  orderId?: string;
}

export type UserRole = 'resident' | 'kitchen_admin';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string;
  isAnonymous?: boolean;
  role: 'customer' | 'staff' | 'admin';
  loyaltyPoints: number;
  savedLocationId?: string;
  unitOrRoom?: string;
  towerOrBlock?: string;
  specialInstructions?: string;
  favoriteItemIds?: string[];
  dietaryPreference?: 'all' | 'veg' | 'non-veg';
}
