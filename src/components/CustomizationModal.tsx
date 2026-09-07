import React, { useState } from 'react';
import { MenuItem } from '../types';
import { X, Plus, Flame, Check } from 'lucide-react';

interface CustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { id: string; name: string; price: number }[], notes: string) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<{ id: string; name: string; price: number }[]>([]);
  const [cookingNotes, setCookingNotes] = useState('');

  if (!isOpen || !item) return null;

  const toggleOption = (opt: { id: string; name: string; price: number }) => {
    if (selectedOptions.some(o => o.id === opt.id)) {
      setSelectedOptions(prev => prev.filter(o => o.id !== opt.id));
    } else {
      setSelectedOptions(prev => [...prev, opt]);
    }
  };

  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalItemPrice = item.price + optionsTotal;

  const handleAdd = () => {
    onConfirm(selectedOptions, cookingNotes);
    setSelectedOptions([]);
    setCookingNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="customization-modal"
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
      >
        {/* Header with image */}
        <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            id="close-customization-btn"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 inline-block mb-1 shadow">
              Customise Your Craving
            </span>
            <h3 className="font-display font-black text-lg leading-tight">{item.name}</h3>
            <p className="text-xs text-amber-200 font-medium">Base Price: ₹{item.price}</p>
          </div>
        </div>

        {/* Options Content */}
        <div className="p-5 space-y-5">
          {item.customizationOptions && item.customizationOptions.length > 0 && (
            <div>
              <label className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-2">
                Drool-Worthy Kitchen Add-ons
              </label>
              <div className="space-y-2">
                {item.customizationOptions.map((opt) => {
                  const isChecked = selectedOptions.some(o => o.id === opt.id);
                  return (
                    <button
                      key={opt.id}
                      id={`addon-opt-${opt.id}`}
                      onClick={() => toggleOption(opt)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'border-rose-500 bg-rose-50/60 ring-1 ring-rose-500'
                          : 'border-stone-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isChecked ? 'bg-gradient-to-r from-rose-600 to-amber-500 border-transparent text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold text-stone-900">{opt.name}</span>
                      </div>
                      <span className="text-xs font-black text-rose-600">+₹{opt.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking instructions note */}
          <div>
            <label className="block text-xs font-black text-stone-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              Special Chef Instructions (Optional)
            </label>
            <textarea
              id="input-cooking-instructions"
              value={cookingNotes}
              onChange={(e) => setCookingNotes(e.target.value)}
              placeholder="e.g. Extra spicy butter glaze, pickled onions, crispy edges..."
              rows={2}
              className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-100 bg-[#FFFDF9] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 font-medium">Craving Total</div>
            <div className="text-xl font-black text-stone-950 font-display">₹{totalItemPrice}</div>
          </div>
          <button
            id="confirm-customization-add-btn"
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-6 py-3 rounded-xl shadow-lg shadow-rose-600/25 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add to Tray
          </button>
        </div>
      </div>
    </div>
  );
};
