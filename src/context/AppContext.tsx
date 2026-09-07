import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MenuItem, 
  CartItem, 
  Order, 
  OrderStatus, 
  NeighborhoodLocation, 
  GroupOrderSession, 
  MealSubscription, 
  LoyaltyReward, 
  InAppNotification, 
  UserRole,
  AppUser
} from '../types';
import { 
  NEIGHBORHOOD_LOCATIONS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_SUBSCRIPTIONS, 
  LOYALTY_REWARDS,
  GAME_DISCOUNT_TIERS 
} from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  FirebaseUser
} from '../firebase';

interface AppContextType {
  // Navigation & Role
  currentTab: 'menu' | 'subscriptions' | 'group' | 'game' | 'loyalty' | 'orders';
  setCurrentTab: (tab: 'menu' | 'subscriptions' | 'group' | 'game' | 'loyalty' | 'orders') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAdminAuthenticated: boolean;
  verifyAdminPasskey: (passkey: string) => boolean;
  logoutAdmin: () => void;

  // Real-Time Authentication & Cloud Profile
  currentUser: AppUser | null;
  firebaseAuthUser: FirebaseUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone: string, address?: Partial<AppUser>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserProfileData: (data: Partial<AppUser>) => Promise<void>;
  isFirebaseConnected: boolean;

  // Location & Resident Details
  selectedLocation: NeighborhoodLocation;
  setSelectedLocation: (loc: NeighborhoodLocation) => void;
  addressDetails: {
    unitOrRoom: string;
    towerOrBlock: string;
    specialInstructions: string;
  };
  setAddressDetails: React.Dispatch<React.SetStateAction<{
    unitOrRoom: string;
    towerOrBlock: string;
    specialInstructions: string;
  }>>;
  residentProfile: {
    name: string;
    phone: string;
    email: string;
  };
  setResidentProfile: React.Dispatch<React.SetStateAction<{
    name: string;
    phone: string;
    email: string;
  }>>;

  // Hyperlocal Suggestions & Scaling Metrics
  activeSocietyResidentCount: number;
  popularDishesInCurrentSociety: MenuItem[];

  // Menu items & Kitchen stock
  menuItems: MenuItem[];
  toggleItemStock: (itemId: string) => Promise<void>;

  // Cart Management
  cart: CartItem[];
  addToCart: (item: MenuItem, options?: { id: string; name: string; price: number }[], notes?: string, memberName?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Discounts & Promo codes
  appliedCoupon: { code: string; discountPercent?: number; fixedDiscount?: number } | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Group Order Session
  groupSession: GroupOrderSession | null;
  startGroupOrder: () => Promise<void>;
  joinGroupOrder: (roomId: string, memberName: string) => Promise<boolean>;
  simulateAddGroupMemberItem: (memberName: string, item: MenuItem) => void;
  leaveGroupOrder: () => void;
  lockGroupOrder: () => Promise<void>;

  // Orders & Live Tracking
  orders: Order[];
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (orderId: string | null) => void;
  placeOrder: (paymentMethod: 'upi' | 'card' | 'cod' | 'wallet', extraDetails?: Record<string, string>) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;

  // Subscriptions
  subscriptions: MealSubscription[];
  addSubscription: (sub: Omit<MealSubscription, 'id' | 'startDate' | 'status' | 'mealsRemaining'>) => Promise<void>;
  toggleSubscriptionPause: (subId: string) => void;
  toggleSubscriptionDatePause: (subId: string, dateStr: string) => void;

  // Loyalty Program
  loyaltyPoints: number;
  redeemLoyaltyReward: (reward: LoyaltyReward) => boolean;

  // Notifications
  notifications: InAppNotification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  pushPermissionStatus: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<void>;
  addInAppNotification: (title: string, message: string, type: 'order' | 'discount' | 'kitchen' | 'subscription', orderId?: string) => void;

  // Mini Game
  gameHighScore: number;
  updateGameScore: (score: number) => void;
  claimedGameVouchers: string[];

  // Checkout modal
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current active view
  const [currentTab, setCurrentTab] = useState<'menu' | 'subscriptions' | 'group' | 'game' | 'loyalty' | 'orders'>('menu');
  const [userRole, setUserRole] = useState<UserRole>('resident');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('drool_admin_auth') === 'true';
  });

  // Firebase Auth & Cloud User State
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Location & Resident
  const [selectedLocation, setSelectedLocation] = useState<NeighborhoodLocation>(() => {
    const saved = localStorage.getItem('drool_location');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return NEIGHBORHOOD_LOCATIONS[0];
  });

  const [addressDetails, setAddressDetails] = useState({
    unitOrRoom: 'Room 304',
    towerOrBlock: 'Floor 3, B-Wing',
    specialInstructions: 'Leave with guard if in meeting. Ring bell twice.',
  });

  const [residentProfile, setResidentProfile] = useState({
    name: 'Sarah Modi',
    phone: '+91 98765 43210',
    email: 'sarahmodi0104@gmail.com',
  });

  // Menu items & stock state (synced with Firestore)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('drool_menu_items');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_MENU_ITEMS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('drool_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; fixedDiscount?: number } | null>(null);

  // Group orders
  const [groupSession, setGroupSession] = useState<GroupOrderSession | null>(() => {
    const saved = localStorage.getItem('drool_group_session');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return null;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('drool_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'ord-101',
        orderNumber: 'DRL-8942',
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
        items: [
          {
            cartItemId: 'c-demo-1',
            item: INITIAL_MENU_ITEMS[0],
            quantity: 1,
            selectedOptions: [INITIAL_MENU_ITEMS[0].customizationOptions![0]],
          },
          {
            cartItemId: 'c-demo-2',
            item: INITIAL_MENU_ITEMS[8],
            quantity: 1,
          }
        ],
        subtotal: 398,
        discountAmount: 40,
        deliveryFee: 0,
        taxAmount: 18,
        totalAmount: 376,
        status: 'out_for_delivery',
        timeline: [
          { status: 'confirmed', label: 'Order Confirmed', description: 'Kitchen ticket accepted', timestamp: '12m ago', completed: true },
          { status: 'kitchen_prep', label: 'Tawa Sizzling', description: 'Chef preparing fresh portions', timestamp: '9m ago', completed: true },
          { status: 'packed', label: 'Sealed & Insulated', description: 'Thermal bag packed with cutlery', timestamp: '5m ago', completed: true },
          { status: 'out_for_delivery', label: 'Rider on the Way', description: 'Assigned to Ramesh Patel (Ather EV)', timestamp: 'Just now', completed: true },
          { status: 'delivered', label: 'At Society Gate', description: 'Delivery handover with gate OTP', timestamp: 'Expected in 4 mins', completed: false },
        ],
        location: NEIGHBORHOOD_LOCATIONS[0],
        addressDetails: {
          unitOrRoom: 'Room 304',
          towerOrBlock: 'Floor 3, B-Wing',
          specialInstructions: 'Ring bell twice',
        },
        recipient: {
          name: 'Sarah Modi',
          phone: '+91 98765 43210',
        },
        payment: {
          method: 'upi',
          transactionId: 'UPI-984210491',
          paid: true,
          upiApp: 'Google Pay',
        },
        rider: {
          name: 'Ramesh Patel',
          phone: '+91 98450 12890',
          vehicleNumber: 'KA-03-HL-9102 (Electric Ather)',
          rating: 4.95,
          currentLocationLat: 12.9234,
          currentLocationLng: 77.6842,
          etaMinutes: 6,
          deliveryOtp: '4821',
        },
      }
    ];
  });

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>('ord-101');

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<MealSubscription[]>(() => {
    const saved = localStorage.getItem('drool_subscriptions');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  // Loyalty & Rewards
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => {
    const saved = localStorage.getItem('drool_loyalty_points');
    return saved ? parseInt(saved, 10) : 340;
  });

  // Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-1',
      title: 'Rider on the Way! 🛵',
      message: 'Ramesh Patel has picked up your order #DRL-8942 and is 6 mins away.',
      timestamp: '2 mins ago',
      type: 'order',
      read: false,
      orderId: 'ord-101',
    },
    {
      id: 'notif-2',
      title: 'Free Delivery Batch Active 🔥',
      message: '6 orders are currently pooling for Sunrise PG! ₹0 delivery fee unlocked.',
      timestamp: '15 mins ago',
      type: 'kitchen',
      read: true,
    }
  ]);

  // Push Permission
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  // Mini-Game
  const [gameHighScore, setGameHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('drool_game_highscore');
    return saved ? parseInt(saved, 10) : 120;
  });
  const [claimedGameVouchers, setClaimedGameVouchers] = useState<string[]>(() => {
    const saved = localStorage.getItem('drool_game_vouchers');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return ['DROOL15'];
  });

  // Checkout modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // -------------------------------------------------------------
  // FIREBASE INITIALIZATION & REAL-TIME LISTENERS
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Listen for Auth State Changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseAuthUser(user);
      if (user) {
        setIsFirebaseConnected(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as AppUser;
            setCurrentUser(data);
            if (data.displayName) {
              setResidentProfile(prev => ({
                ...prev,
                name: data.displayName || prev.name,
                email: data.email || prev.email,
                phone: data.phone || prev.phone
              }));
            }
            if (data.unitOrRoom) {
              setAddressDetails(prev => ({
                ...prev,
                unitOrRoom: data.unitOrRoom || prev.unitOrRoom,
                towerOrBlock: data.towerOrBlock || prev.towerOrBlock,
                specialInstructions: data.specialInstructions || prev.specialInstructions
              }));
            }
            if (data.loyaltyPoints !== undefined) {
              setLoyaltyPoints(data.loyaltyPoints);
            }
          } else {
            // Initialize new user profile in Firestore
            const initialUserData: AppUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Drool Resident',
              phone: user.phoneNumber || '+91 98765 43210',
              role: 'customer',
              loyaltyPoints: 100, // welcome bonus points
              savedLocationId: selectedLocation.id,
              unitOrRoom: addressDetails.unitOrRoom,
              towerOrBlock: addressDetails.towerOrBlock,
              specialInstructions: addressDetails.specialInstructions,
              dietaryPreference: 'all',
              favoriteItemIds: ['d-1', 'd-3']
            };
            await setDoc(userDocRef, initialUserData);
            setCurrentUser(initialUserData);
            setLoyaltyPoints(100);
          }
        } catch (err) {
          console.warn('Could not sync user profile from Firestore:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    // 2. Real-Time Menu Items Listener + Seeding
    const menuColRef = collection(db, 'menu_items');
    const unsubscribeMenu = onSnapshot(menuColRef, async (snapshot) => {
      setIsFirebaseConnected(true);
      if (snapshot.empty) {
        // Seed initial menu items to Cloud Firestore
        try {
          for (const item of INITIAL_MENU_ITEMS) {
            await setDoc(doc(db, 'menu_items', item.id), item);
          }
        } catch (e) {
          console.warn('Seeding initial menu to Firestore encountered an issue:', e);
        }
      } else {
        const liveItems: MenuItem[] = [];
        snapshot.forEach((docSnap) => {
          liveItems.push(docSnap.data() as MenuItem);
        });
        if (liveItems.length > 0) {
          setMenuItems(liveItems);
          localStorage.setItem('drool_menu_items', JSON.stringify(liveItems));
        }
      }
    }, (error) => {
      console.warn('Firestore menu listener notice:', error.message);
    });

    // 3. Real-Time Orders Listener
    const ordersColRef = collection(db, 'orders');
    const unsubscribeOrders = onSnapshot(ordersColRef, (snapshot) => {
      if (!snapshot.empty) {
        const liveOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          liveOrders.push(docSnap.data() as Order);
        });
        // Sort most recent first
        liveOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(liveOrders);
        localStorage.setItem('drool_orders', JSON.stringify(liveOrders));
      }
    }, (error) => {
      console.warn('Firestore orders listener notice:', error.message);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, []);

  // Listen to active group order room when groupSession exists
  useEffect(() => {
    if (!groupSession?.roomId) return;
    const roomDocRef = doc(db, 'group_sessions', groupSession.roomId);
    const unsubscribeRoom = onSnapshot(roomDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as GroupOrderSession;
        setGroupSession(data);
      }
    }, (err) => {
      console.warn('Group session listener notice:', err);
    });

    return () => unsubscribeRoom();
  }, [groupSession?.roomId]);

  // Sync state to local storage as fallback
  useEffect(() => {
    localStorage.setItem('drool_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('drool_location', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem('drool_loyalty_points', loyaltyPoints.toString());
  }, [loyaltyPoints]);

  useEffect(() => {
    localStorage.setItem('drool_game_highscore', gameHighScore.toString());
  }, [gameHighScore]);

  useEffect(() => {
    localStorage.setItem('drool_game_vouchers', JSON.stringify(claimedGameVouchers));
  }, [claimedGameVouchers]);

  // Push notification permission check
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermissionStatus(Notification.permission);
    } else {
      setPushPermissionStatus('unsupported');
    }
  }, []);

  // Hyperlocal signals: Popular dishes in current society & Active batch count
  const activeSocietyResidentCount = selectedLocation.activeOrdersCount + (orders.filter(o => o.location.id === selectedLocation.id && o.status !== 'delivered').length);
  const popularDishesInCurrentSociety = menuItems.filter(item => item.isPopular || item.isChefSpecial).slice(0, 4);

  // -------------------------------------------------------------
  // AUTH METHODS
  // -------------------------------------------------------------
  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    addInAppNotification('Signed In Successfully', `Welcome back, ${cred.user.email}!`, 'order');
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    phone: string, 
    address?: Partial<AppUser>
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    
    const newUser: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name,
      phone: phone,
      role: 'customer',
      loyaltyPoints: 150, // Welcome signup bonus
      savedLocationId: selectedLocation.id,
      unitOrRoom: address?.unitOrRoom || addressDetails.unitOrRoom,
      towerOrBlock: address?.towerOrBlock || addressDetails.towerOrBlock,
      specialInstructions: address?.specialInstructions || addressDetails.specialInstructions,
      dietaryPreference: 'all',
      favoriteItemIds: []
    };

    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    setCurrentUser(newUser);
    setLoyaltyPoints(150);
    setResidentProfile(prev => ({ ...prev, name, phone, email }));
    addInAppNotification('Account Created 🎉', `Welcome to Drool, ${name}! +150 Drool Bites added to your wallet.`, 'discount');
  };

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    
    // Check if doc exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      const newUser: AppUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Drool Resident',
        phone: user.phoneNumber || '+91 98765 43210',
        role: 'customer',
        loyaltyPoints: 150,
        savedLocationId: selectedLocation.id,
        unitOrRoom: addressDetails.unitOrRoom,
        towerOrBlock: addressDetails.towerOrBlock,
        specialInstructions: addressDetails.specialInstructions,
        dietaryPreference: 'all',
        favoriteItemIds: []
      };
      await setDoc(userDocRef, newUser);
      setCurrentUser(newUser);
      setLoyaltyPoints(150);
    }
    addInAppNotification('Signed in with Google', `Welcome, ${user.displayName || user.email}!`, 'order');
  };

  const signInAsGuest = async () => {
    const cred = await signInAnonymously(auth);
    const guestUser: AppUser = {
      uid: cred.user.uid,
      email: 'guest@droolkitchens.com',
      displayName: 'Guest Resident',
      phone: '+91 98765 43210',
      isAnonymous: true,
      role: 'customer',
      loyaltyPoints: 50,
      savedLocationId: selectedLocation.id,
      unitOrRoom: addressDetails.unitOrRoom,
      towerOrBlock: addressDetails.towerOrBlock,
      specialInstructions: addressDetails.specialInstructions,
      dietaryPreference: 'all',
      favoriteItemIds: []
    };
    setCurrentUser(guestUser);
  };

  const logoutUser = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setFirebaseAuthUser(null);
    addInAppNotification('Signed Out', 'You have signed out of your Drool account.', 'order');
  };

  const updateUserProfileData = async (data: Partial<AppUser>) => {
    if (!currentUser && !firebaseAuthUser) return;
    const uid = currentUser?.uid || firebaseAuthUser?.uid;
    if (!uid) return;

    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  const addInAppNotification = (
    title: string, 
    message: string, 
    type: 'order' | 'discount' | 'kitchen' | 'subscription', 
    orderId?: string
  ) => {
    const newNotif: InAppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      orderId,
    };
    setNotifications(prev => [newNotif, ...prev]);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        // silent catch
      }
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setPushPermissionStatus(perm);
      if (perm === 'granted') {
        addInAppNotification('Push Alerts Enabled! 🔔', 'You will now receive live updates as your food is prepared and dispatched.', 'kitchen');
      }
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------
  // CART MANAGEMENT
  // -------------------------------------------------------------
  const addToCart = (
    item: MenuItem, 
    options?: { id: string; name: string; price: number }[], 
    notes?: string, 
    memberName?: string
  ) => {
    const cartItemId = `${item.id}-${(options || []).map(o => o.id).sort().join('_')}-${memberName || 'self'}`;
    
    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          item,
          quantity: 1,
          selectedOptions: options,
          notes,
          addedByMemberName: memberName || (groupSession ? residentProfile.name : undefined),
        }
      ];
    });

    addInAppNotification('Added to Tray 🥘', `${item.name} is in your kitchen tray.`, 'order');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // -------------------------------------------------------------
  // COUPONS
  // -------------------------------------------------------------
  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'DROOL15') {
      setAppliedCoupon({ code: clean, discountPercent: 15 });
      return { success: true, message: '15% Off unlocked from Drool Catch!' };
    }
    if (clean === 'CHEF25') {
      setAppliedCoupon({ code: clean, discountPercent: 25 });
      return { success: true, message: 'Chef Special 25% Off unlocked!' };
    }
    if (clean === 'FEAST35') {
      setAppliedCoupon({ code: clean, discountPercent: 35 });
      return { success: true, message: 'Mega Feast 35% Off unlocked!' };
    }
    if (clean === 'PG50') {
      setAppliedCoupon({ code: clean, fixedDiscount: 50 });
      return { success: true, message: 'Flat ₹50 PG Welcome discount applied!' };
    }
    if (clean === 'FREEDEL') {
      setAppliedCoupon({ code: clean, fixedDiscount: 25 });
      return { success: true, message: 'Free delivery applied!' };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // -------------------------------------------------------------
  // GROUP ORDERS (SYNCED TO FIRESTORE)
  // -------------------------------------------------------------
  const startGroupOrder = async () => {
    const roomId = 'ROOM-' + Math.floor(100 + Math.random() * 900) + '-' + selectedLocation.name.slice(0, 3).toUpperCase();
    const newSession: GroupOrderSession = {
      roomId,
      hostName: residentProfile.name,
      hostPhone: residentProfile.phone,
      societyName: selectedLocation.name,
      roomOrFlat: addressDetails.unitOrRoom,
      createdAt: new Date().toISOString(),
      status: 'active',
      members: [
        { id: 'mem-1', name: residentProfile.name, isHost: true, joinedAt: 'Just now' }
      ],
      activeCartItems: [],
    };
    
    setGroupSession(newSession);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'group_sessions', roomId), newSession);
    } catch (e) {
      console.warn('Could not save group session to Firestore:', e);
    }

    addInAppNotification('Group Order Created! 👥', `Room code: ${roomId}. Flatmates can join and add food together.`, 'order');
  };

  const joinGroupOrder = async (roomId: string, memberName: string): Promise<boolean> => {
    if (!roomId) return false;
    const cleanRoom = roomId.trim().toUpperCase();

    try {
      const roomDocRef = doc(db, 'group_sessions', cleanRoom);
      const roomSnap = await getDoc(roomDocRef);

      if (roomSnap.exists()) {
        const liveSession = roomSnap.data() as GroupOrderSession;
        const newMember = {
          id: 'mem-' + Date.now(),
          name: memberName,
          isHost: false,
          joinedAt: 'Just now',
        };
        const updatedMembers = [...liveSession.members, newMember];
        await updateDoc(roomDocRef, { members: updatedMembers });
        setGroupSession({ ...liveSession, members: updatedMembers });
        addInAppNotification('Joined Group Room', `Connected to Room ${cleanRoom} with ${liveSession.hostName}.`, 'order');
        return true;
      }
    } catch (e) {
      console.warn('Firestore room check fallback:', e);
    }

    // Fallback simulation if offline
    const newSession: GroupOrderSession = {
      roomId: cleanRoom,
      hostName: 'Rahul Sharma (Flatmate)',
      hostPhone: '+91 98765 11223',
      societyName: selectedLocation.name,
      roomOrFlat: 'Flat 302',
      createdAt: new Date().toISOString(),
      status: 'active',
      members: [
        { id: 'mem-host', name: 'Rahul Sharma (Host)', isHost: true, joinedAt: '5 mins ago' },
        { id: 'mem-2', name: memberName, isHost: false, joinedAt: 'Just now' },
      ],
      activeCartItems: [
        {
          cartItemId: 'item-grp-1',
          item: INITIAL_MENU_ITEMS[4],
          quantity: 1,
          addedByMemberName: 'Rahul Sharma (Host)',
        }
      ],
    };
    setGroupSession(newSession);
    setCart(prev => [...prev, newSession.activeCartItems[0]]);
    addInAppNotification('Joined Group Order', `Connected to Room ${cleanRoom} with Rahul Sharma.`, 'order');
    return true;
  };

  const simulateAddGroupMemberItem = (memberName: string, item: MenuItem) => {
    addToCart(item, undefined, undefined, memberName);
    addInAppNotification('Flatmate Added an Item', `${memberName} added ${item.name} to the group tray.`, 'order');
  };

  const leaveGroupOrder = () => {
    setGroupSession(null);
    setCart(prev => prev.filter(c => !c.addedByMemberName || c.addedByMemberName === residentProfile.name));
  };

  const lockGroupOrder = async () => {
    if (!groupSession) return;
    setGroupSession(prev => prev ? { ...prev, status: 'locked' } : null);
    try {
      await updateDoc(doc(db, 'group_sessions', groupSession.roomId), { status: 'locked' });
    } catch (e) {
      // silent catch
    }
    addInAppNotification('Group Tray Locked', 'Host has locked the cart for final checkout.', 'order');
  };

  // -------------------------------------------------------------
  // ORDERS (SYNCED TO FIRESTORE)
  // -------------------------------------------------------------
  const placeOrder = async (
    paymentMethod: 'upi' | 'card' | 'cod' | 'wallet', 
    extraDetails?: Record<string, string>
  ): Promise<Order> => {
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

    const deliveryFee = subtotal >= selectedLocation.freeDeliveryThreshold ? 0 : 25;
    const taxAmount = Math.round(subtotal * 0.05);
    const totalAmount = Math.max(0, subtotal - discount + deliveryFee + taxAmount);

    const orderNum = 'DRL-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ord-' + Date.now();

    let groupMembersBreakdown: { memberId: string; name: string; itemCount: number; subtotal: number }[] | undefined = undefined;
    if (groupSession) {
      const memberMap: Record<string, { count: number; cost: number }> = {};
      cart.forEach(c => {
        const mem = c.addedByMemberName || residentProfile.name;
        const opts = (c.selectedOptions || []).reduce((s, o) => s + o.price, 0);
        const itemTot = (c.item.price + opts) * c.quantity;
        if (!memberMap[mem]) memberMap[mem] = { count: 0, cost: 0 };
        memberMap[mem].count += c.quantity;
        memberMap[mem].cost += itemTot;
      });
      groupMembersBreakdown = Object.keys(memberMap).map((m, i) => ({
        memberId: 'gm-' + i,
        name: m,
        itemCount: memberMap[m].count,
        subtotal: memberMap[m].cost,
      }));
    }

    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discountAmount: discount,
      deliveryFee,
      taxAmount,
      totalAmount,
      status: 'confirmed',
      timeline: [
        { status: 'confirmed', label: 'Order Confirmed', description: 'Kitchen ticket accepted', timestamp: 'Just now', completed: true },
        { status: 'kitchen_prep', label: 'Tawa Sizzling', description: 'Chef preparing fresh portions', timestamp: 'Expected in 4 mins', completed: false },
        { status: 'packed', label: 'Sealed & Insulated', description: 'Packed in eco-thermal containers', timestamp: 'Expected in 10 mins', completed: false },
        { status: 'out_for_delivery', label: 'Rider on the Way', description: 'Assigned to neighborhood fleet rider', timestamp: 'Expected in 15 mins', completed: false },
        { status: 'delivered', label: 'At Society Gate', description: 'Delivery handover with gate OTP', timestamp: `ETA ~${selectedLocation.estimatedDeliveryMin} mins`, completed: false },
      ],
      location: selectedLocation,
      addressDetails: {
        unitOrRoom: addressDetails.unitOrRoom,
        towerOrBlock: addressDetails.towerOrBlock,
        specialInstructions: addressDetails.specialInstructions,
      },
      recipient: {
        name: currentUser?.displayName || residentProfile.name,
        phone: currentUser?.phone || residentProfile.phone,
      },
      payment: {
        method: paymentMethod,
        transactionId: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        paid: paymentMethod !== 'cod',
        cardLast4: extraDetails?.cardLast4,
        upiApp: extraDetails?.upiApp || 'UPI FastPay',
      },
      rider: {
        name: 'Ramesh Patel',
        phone: '+91 98450 12890',
        vehicleNumber: 'KA-03-HL-9102 (Electric Ather)',
        rating: 4.95,
        etaMinutes: selectedLocation.estimatedDeliveryMin,
        deliveryOtp,
      },
      isGroupOrder: !!groupSession,
      groupOrderRoomId: groupSession?.roomId,
      groupMembers: groupMembersBreakdown,
    };

    // Save to Firestore Real-Time collection
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.warn('Could not write order to Firestore directly, updating local state:', err);
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingOrderId(orderId);

    // Award loyalty points & update cloud user
    const earnedPoints = Math.floor(totalAmount / 10);
    const updatedPoints = loyaltyPoints + earnedPoints;
    setLoyaltyPoints(updatedPoints);

    if (currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          loyaltyPoints: updatedPoints
        });
      } catch (e) {
        // silent
      }
    }

    addInAppNotification(
      'Order Placed Successfully! 🍳',
      `Your Drool order #${orderNum} has been received by the kitchen. Earned +${earnedPoints} Drool Bites!`,
      'order',
      orderId
    );

    clearCart();
    if (groupSession) {
      setGroupSession(null);
    }
    setIsPaymentModalOpen(false);

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const statusLabels: Record<OrderStatus, string> = {
      confirmed: 'Order Confirmed',
      kitchen_prep: 'Chef Started Cooking 🔥',
      packed: 'Sealed in Thermal Bag 📦',
      out_for_delivery: 'Rider Out for Delivery 🛵',
      delivered: 'Delivered at Gate / Doorstep 🥳',
      cancelled: 'Order Cancelled',
    };

    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const updatedTimeline = ord.timeline.map(t => {
        if (t.status === newStatus) {
          return { ...t, completed: true, timestamp: 'Just now' };
        }
        if (
          (newStatus === 'kitchen_prep' && t.status === 'confirmed') ||
          (newStatus === 'packed' && ['confirmed', 'kitchen_prep'].includes(t.status)) ||
          (newStatus === 'out_for_delivery' && ['confirmed', 'kitchen_prep', 'packed'].includes(t.status)) ||
          (newStatus === 'delivered')
        ) {
          return { ...t, completed: true };
        }
        return t;
      });

      const updatedOrder = {
        ...ord,
        status: newStatus,
        timeline: updatedTimeline,
        rider: ord.rider ? {
          ...ord.rider,
          etaMinutes: newStatus === 'delivered' ? 0 : newStatus === 'out_for_delivery' ? Math.max(3, ord.rider.etaMinutes - 8) : ord.rider.etaMinutes,
        } : undefined,
      };

      // Sync to Firestore
      updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      }).catch(e => console.warn('Could not update order status in Firestore:', e));

      return updatedOrder;
    }));

    addInAppNotification(
      `Order Update: ${statusLabels[newStatus]}`,
      `Order #${orderId.slice(-4)} status is now ${statusLabels[newStatus]}`,
      'order',
      orderId
    );
  };

  // -------------------------------------------------------------
  // SUBSCRIPTIONS
  // -------------------------------------------------------------
  const addSubscription = async (subData: Omit<MealSubscription, 'id' | 'startDate' | 'status' | 'mealsRemaining'>) => {
    const subId = 'sub-' + Date.now();
    const newSub: MealSubscription = {
      ...subData,
      id: subId,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      mealsRemaining: 14,
    };

    try {
      await setDoc(doc(db, 'subscriptions', subId), newSub);
    } catch (e) {
      console.warn('Could not save subscription to Firestore:', e);
    }

    setSubscriptions(prev => [newSub, ...prev]);
    addInAppNotification('Tiffin Subscription Activated!', `Your ${newSub.planName} is active for ${newSub.location.name}.`, 'subscription');
  };

  const toggleSubscriptionPause = (subId: string) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        const nextStatus = s.status === 'active' ? 'paused' : 'active';
        addInAppNotification(
          `Subscription ${nextStatus === 'paused' ? 'Paused ⏸️' : 'Resumed ▶️'}`,
          `Your meal deliveries have been ${nextStatus}. You won't be charged for skipped days.`,
          'subscription'
        );
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const toggleSubscriptionDatePause = (subId: string, dateStr: string) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        const exists = s.pausedDates.includes(dateStr);
        const updatedDates = exists 
          ? s.pausedDates.filter(d => d !== dateStr) 
          : [...s.pausedDates, dateStr];
        return { ...s, pausedDates: updatedDates };
      }
      return s;
    }));
  };

  // -------------------------------------------------------------
  // LOYALTY REWARDS
  // -------------------------------------------------------------
  const redeemLoyaltyReward = (reward: LoyaltyReward): boolean => {
    if (loyaltyPoints < reward.pointsCost) {
      return false;
    }
    const newPts = loyaltyPoints - reward.pointsCost;
    setLoyaltyPoints(newPts);
    applyCouponCode(reward.couponCode);

    if (currentUser?.uid) {
      updateDoc(doc(db, 'users', currentUser.uid), { loyaltyPoints: newPts }).catch(() => {});
    }

    addInAppNotification(
      'Reward Unlocked! 🎁',
      `Redeemed ${reward.pointsCost} Drool Bites for "${reward.title}". Coupon ${reward.couponCode} applied!`,
      'discount'
    );
    return true;
  };

  // -------------------------------------------------------------
  // MINI-GAME
  // -------------------------------------------------------------
  const updateGameScore = (score: number) => {
    if (score > gameHighScore) {
      setGameHighScore(score);
    }
    GAME_DISCOUNT_TIERS.forEach(tier => {
      if (score >= tier.minScore && !claimedGameVouchers.includes(tier.code)) {
        setClaimedGameVouchers(prev => [...prev, tier.code]);
        addInAppNotification(
          '🎮 New Game Discount Won!',
          `You scored ${score} pts! Unlocked coupon code: ${tier.code} (${tier.label})!`,
          'discount'
        );
      }
    });
  };

  // -------------------------------------------------------------
  // STAFF / KITCHEN ADMIN AUTH
  // -------------------------------------------------------------
  const verifyAdminPasskey = (passkey: string): boolean => {
    if (passkey.trim().toLowerCase() === 'droolchef' || passkey.trim() === '1234') {
      setIsAdminAuthenticated(true);
      setUserRole('kitchen_admin');
      localStorage.setItem('drool_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setUserRole('resident');
    localStorage.removeItem('drool_admin_auth');
  };

  const toggleItemStock = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    const newStock = item ? !item.inStock : false;

    // Optimistic local state update
    setMenuItems(prev => prev.map(it => {
      if (it.id === itemId) {
        return { ...it, inStock: newStock };
      }
      return it;
    }));

    // Real-Time broadcast via Firestore
    try {
      await updateDoc(doc(db, 'menu_items', itemId), { inStock: newStock });
    } catch (e) {
      console.warn('Could not update menu item stock in Firestore:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        userRole,
        setUserRole,
        isAdminAuthenticated,
        verifyAdminPasskey,
        logoutAdmin,
        currentUser,
        firebaseAuthUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        logoutUser,
        updateUserProfileData,
        isFirebaseConnected,
        selectedLocation,
        setSelectedLocation,
        addressDetails,
        setAddressDetails,
        residentProfile,
        setResidentProfile,
        activeSocietyResidentCount,
        popularDishesInCurrentSociety,
        menuItems,
        toggleItemStock,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        groupSession,
        startGroupOrder,
        joinGroupOrder,
        simulateAddGroupMemberItem,
        leaveGroupOrder,
        lockGroupOrder,
        orders,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        placeOrder,
        updateOrderStatus,
        subscriptions,
        addSubscription,
        toggleSubscriptionPause,
        toggleSubscriptionDatePause,
        loyaltyPoints,
        redeemLoyaltyReward,
        notifications,
        unreadNotificationCount,
        markNotificationsAsRead,
        pushPermissionStatus,
        requestPushPermission,
        addInAppNotification,
        gameHighScore,
        updateGameScore,
        claimedGameVouchers,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
