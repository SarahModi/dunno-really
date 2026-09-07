import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  X, 
  Check, 
  Bike, 
  Sparkles, 
  ChefHat, 
  Calendar, 
  CheckCheck,
  ShieldCheck
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationsAsRead, 
    pushPermissionStatus, 
    requestPushPermission,
    setCurrentTab,
    setActiveTrackingOrderId
  } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (orderId?: string) => {
    if (orderId) {
      setActiveTrackingOrderId(orderId);
      setCurrentTab('orders');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          id="notification-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-base text-stone-900">Push & Order Alerts</h2>
                <p className="text-xs text-stone-500">Live neighborhood delivery updates</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={markNotificationsAsRead}
                className="text-xs text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline text-[11px] font-bold">Mark Read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* Push Permission Toggle Banner */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="font-display font-black text-xs text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    Web Push Notification Alerts
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                    Get pinged the instant your food sizzles in the wok or when your rider reaches your society gate!
                  </p>
                </div>
              </div>

              {pushPermissionStatus === 'granted' ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-black bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Push Alerts Active & Enabled</span>
                </div>
              ) : (
                <button
                  id="enable-web-push-btn"
                  onClick={requestPushPermission}
                  className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black py-2 rounded-xl shadow-xs transition-colors"
                >
                  Enable Instant Push Alerts
                </button>
              )}
            </div>

            {/* Notifications Feed */}
            <div className="space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.orderId)}
                    className={`p-3.5 rounded-2xl border transition-all text-left ${
                      notif.read
                        ? 'bg-white border-stone-100 text-stone-700'
                        : 'bg-amber-50/60 border-amber-200 text-stone-900 shadow-xs'
                    } ${notif.orderId ? 'cursor-pointer hover:border-rose-300' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {notif.type === 'order' && <Bike className="w-4 h-4 text-rose-600 shrink-0" />}
                        {notif.type === 'discount' && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                        {notif.type === 'kitchen' && <ChefHat className="w-4 h-4 text-red-600 shrink-0" />}
                        {notif.type === 'subscription' && <Calendar className="w-4 h-4 text-blue-600 shrink-0" />}
                        <span className="font-bold text-xs text-stone-900">{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{notif.timestamp}</span>
                    </div>

                    <p className="text-xs text-stone-500 mt-1 leading-relaxed pl-6">
                      {notif.message}
                    </p>

                    {notif.orderId && (
                      <div className="pl-6 pt-1 text-[10px] font-bold text-rose-600 hover:underline">
                        Tap to view live order tracking →
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-100 bg-stone-50 text-center text-[11px] text-stone-500 font-medium">
            Drool & Burp (D&B) Kitchen Telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
