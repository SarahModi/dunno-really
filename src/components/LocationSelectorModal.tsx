import React from 'react';
import { useApp } from '../context/AppContext';
import { NEIGHBORHOOD_LOCATIONS } from '../data/mockData';
import { MapPin, X, Building2, Home, CheckCircle2, Clock, Users, ShieldAlert } from 'lucide-react';
import { NeighborhoodLocation } from '../types';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedLocation, 
    setSelectedLocation, 
    addressDetails, 
    setAddressDetails,
    residentProfile,
    setResidentProfile,
    addInAppNotification
  } = useApp();

  if (!isOpen) return null;

  const handleSelectLocation = (loc: NeighborhoodLocation) => {
    setSelectedLocation(loc);
    addInAppNotification('Delivery Address Updated', `Now delivering to ${loc.name}`, 'order');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="location-selector-modal"
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 font-display">Select Your PG or Society</h2>
              <p className="text-xs text-stone-500">Drool & Burp delivers exclusively within our 2.5km neighborhood cluster</p>
            </div>
          </div>
          <button 
            id="close-location-modal-btn"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          
          {/* Batch delivery notice */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Users className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700">
              <span className="font-black text-rose-700">Neighborhood Batch Deliveries: </span>
              Orders heading to the same PG or Society building are grouped into high-speed delivery batches. This ensures piping hot food and waived delivery charges!
            </div>
          </div>

          {/* Locations list */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2.5">
              Available Neighborhood Hubs ({NEIGHBORHOOD_LOCATIONS.length})
            </label>
            <div className="space-y-2.5">
              {NEIGHBORHOOD_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    id={`location-card-${loc.id}`}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 shadow-sm ring-1 ring-rose-400'
                        : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        loc.type === 'PG' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {loc.type === 'PG' ? <Building2 className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-stone-900">{loc.name}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {loc.type}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600">{loc.area} • {loc.distanceKm} km away</p>
                        <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                          {loc.popularWith}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs font-black text-stone-800">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>~{loc.estimatedDeliveryMin}m</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {loc.activeOrdersCount} active orders
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-rose-600 text-xs font-black mt-1">
                          <CheckCircle2 className="w-4 h-4" /> Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit / Room details form */}
          <div className="border-t border-amber-100 pt-4 space-y-3">
            <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider">
              Exact Delivery Spot Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Room / Flat / Unit Number *
                </label>
                <input
                  id="input-unit-room"
                  type="text"
                  value={addressDetails.unitOrRoom}
                  onChange={(e) => setAddressDetails(prev => ({ ...prev, unitOrRoom: e.target.value }))}
                  placeholder="e.g. Room 304 / Flat 402"
                  className="w-full text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Tower / Block / Floor
                </label>
                <input
                  id="input-tower-block"
                  type="text"
                  value={addressDetails.towerOrBlock}
                  onChange={(e) => setAddressDetails(prev => ({ ...prev, towerOrBlock: e.target.value }))}
                  placeholder="e.g. 3rd Floor, Block B"
                  className="w-full text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Resident Name & Phone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="input-resident-name"
                  type="text"
                  value={residentProfile.name}
                  onChange={(e) => setResidentProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
                <input
                  id="input-resident-phone"
                  type="tel"
                  value={residentProfile.phone}
                  onChange={(e) => setResidentProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 Phone"
                  className="w-full text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Gate Pass / Rider Instructions
              </label>
              <input
                id="input-special-instructions"
                type="text"
                value={addressDetails.specialInstructions}
                onChange={(e) => setAddressDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="e.g. Leave with security guard if phone not reachable, or ring bell."
                className="w-full text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-100 bg-amber-50/40 flex items-center justify-between rounded-b-2xl">
          <div className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Delivery restricted to verified gates</span>
          </div>
          <button
            id="confirm-location-save-btn"
            onClick={onClose}
            className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            Confirm & Save Address
          </button>
        </div>

      </div>
    </div>
  );
};
