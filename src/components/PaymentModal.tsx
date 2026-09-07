import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Wallet, 
  Banknote, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    appliedCoupon, 
    selectedLocation, 
    placeOrder, 
    setCurrentTab, 
    setActiveTrackingOrderId,
    groupSession
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | 'cod'>('upi');
  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('gpay');
  const [upiIdInput, setUpiIdInput] = useState('');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('4532 8921 4410 7729');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('841');
  const [cardHolder, setCardHolder] = useState('Sarah Modi');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('4829');

  if (!isOpen) return null;

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

  const isFreeDelivery = subtotal >= selectedLocation.freeDeliveryThreshold || !!groupSession;
  const deliveryFee = isFreeDelivery ? 0 : 25;
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee + taxes);

  const handlePay = () => {
    if (paymentMethod === 'card') {
      // Simulate 3D-Secure OTP verification flow
      setShowOtpScreen(true);
      return;
    }

    executePayment();
  };

  const executePayment = () => {
    setIsProcessing(true);
    setProcessingStage('Connecting to secure payment gateway...');

    setTimeout(() => {
      setProcessingStage('Authenticating with NPCI / Banking Gateway...');
    }, 800);

    setTimeout(() => {
      setProcessingStage('Tokenizing transaction & verifying receipt...');
    }, 1600);

    setTimeout(() => {
      let extra: Record<string, string> = {};
      if (paymentMethod === 'card') {
        extra.cardLast4 = cardNumber.slice(-4);
      } else if (paymentMethod === 'upi') {
        extra.upiApp = upiOption === 'qr' ? 'Dynamic Bharat QR' : upiOption === 'gpay' ? 'Google Pay' : upiOption === 'phonepe' ? 'PhonePe' : 'Paytm UPI';
      }

      const order = placeOrder(paymentMethod, extra);
      setIsProcessing(false);
      setShowOtpScreen(false);
      onClose();
      setCurrentTab('orders');
      setActiveTrackingOrderId(order.id);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="secure-payment-modal"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-200 text-stone-900"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-base text-stone-900">Drool & Burp Secure Gateway</h2>
                <span className="text-[10px] bg-emerald-100 border border-emerald-300 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                  PCI-DSS Level 1
                </span>
              </div>
              <p className="text-xs text-stone-500">256-Bit SSL Bank Encrypted Checkout</p>
            </div>
          </div>

          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing View Overlay */}
        {isProcessing ? (
          <div className="p-10 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 text-rose-600 animate-spin" />
              <ShieldCheck className="w-8 h-8 text-amber-500 absolute inset-0 m-auto" />
            </div>
            <h3 className="font-display font-black text-lg text-stone-900">Securing Your Feast</h3>
            <p className="text-xs text-rose-600 font-bold max-w-xs mx-auto animate-pulse">
              {processingStage}
            </p>
            <div className="text-[11px] text-stone-500">
              Please do not press back or refresh the page.
            </div>
          </div>
        ) : showOtpScreen ? (
          /* 3D Secure OTP Modal step */
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700 font-medium">
                <span className="font-black text-rose-700">Verified by Visa / Mastercard ID Check: </span>
                Enter the simulated one-time password sent to registered mobile for authorization.
              </div>
            </div>

            <div className="space-y-3 py-2">
              <label className="block text-xs font-black text-stone-700 uppercase tracking-wider text-center">
                Enter 4-Digit Bank OTP
              </label>
              <div className="flex justify-center gap-2">
                <input
                  id="input-card-otp"
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="text-center font-mono text-2xl tracking-widest w-40 py-2.5 bg-amber-50/50 border-2 border-rose-500 text-stone-900 font-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="text-center text-[11px] text-stone-500">
                Auto-filled for testing: <strong className="font-mono font-black text-rose-600">4829</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowOtpScreen(false)}
                className="w-1/2 py-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Back
              </button>
              <button
                id="submit-card-otp-btn"
                onClick={executePayment}
                className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-xs font-black text-white shadow-md shadow-rose-600/25"
              >
                Verify & Authorise ₹{grandTotal}
              </button>
            </div>
          </div>
        ) : (
          /* Payment methods selection */
          <div className="p-5 space-y-5">
            {/* Amount card - Bright Rose Amber */}
            <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-100 font-medium">Total Payable Amount</span>
                <div className="text-3xl font-black font-display text-white">₹{grandTotal}</div>
              </div>
              <div className="text-right text-[11px] text-rose-100 font-medium space-y-0.5">
                <div>Items: ₹{subtotal}</div>
                {discount > 0 && <div className="text-emerald-200 font-bold">Discount: -₹{discount}</div>}
                <div>Delivery: {isFreeDelivery ? '₹0 (Batch)' : `₹${deliveryFee}`}</div>
              </div>
            </div>

            {/* Methods Selection Tabs */}
            <div>
              <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2.5">
                Choose Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  id="pay-tab-upi"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'upi'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-black ring-2 ring-rose-400/30 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-amber-50/50 text-stone-600'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-rose-600" />
                  <span className="text-xs">Instant UPI</span>
                </button>

                <button
                  id="pay-tab-card"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-black ring-2 ring-rose-400/30 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-amber-50/50 text-stone-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  <span className="text-xs">Debit / Card</span>
                </button>

                <button
                  id="pay-tab-wallet"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'wallet'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-black ring-2 ring-rose-400/30 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-amber-50/50 text-stone-600'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-rose-600" />
                  <span className="text-xs">FastPay Wallet</span>
                </button>

                <button
                  id="pay-tab-cod"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'cod'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-black ring-2 ring-rose-400/30 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-amber-50/50 text-stone-600'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-rose-600" />
                  <span className="text-xs">Pay on Delivery</span>
                </button>
              </div>
            </div>

            {/* Sub-form based on selected method */}
            {paymentMethod === 'upi' && (
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                <div className="text-xs font-black text-stone-800">Select Preferred UPI App:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUpiOption('gpay')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      upiOption === 'gpay' ? 'bg-white border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-300' : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>🔵 Google Pay</span>
                  </button>
                  <button
                    onClick={() => setUpiOption('phonepe')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      upiOption === 'phonepe' ? 'bg-white border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-300' : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>🟣 PhonePe</span>
                  </button>
                  <button
                    onClick={() => setUpiOption('paytm')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      upiOption === 'paytm' ? 'bg-white border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-300' : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <span>🔷 Paytm UPI</span>
                  </button>
                  <button
                    onClick={() => setUpiOption('qr')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      upiOption === 'qr' ? 'bg-white border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-300' : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-rose-600" />
                    <span>Dynamic QR Code</span>
                  </button>
                </div>

                {upiOption === 'qr' ? (
                  <div className="p-4 bg-white rounded-2xl border border-amber-200 text-center space-y-2">
                    <div className="w-32 h-32 mx-auto bg-stone-900 border-2 border-dashed border-rose-400 rounded-xl flex items-center justify-center p-2 shadow-xs">
                      {/* Stylised QR representation */}
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-stone-950 rounded">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-xs ${
                              (i % 2 === 0 && i % 3 === 0) || i < 7 || i > 28 ? 'bg-amber-400' : 'bg-rose-600'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">Scan using any UPI app to pay ₹{grandTotal}</p>
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Or enter custom UPI VPA ID (e.g. name@okaxis)
                    </label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. resident@okhdfcbank"
                      className="w-full text-xs px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 8921 4410 7729"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">CVV / Security Code</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Full Name"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-700 font-bold">Drool FastPay Balance:</span>
                  <span className="font-black text-rose-600 text-base">₹500.00</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Instant 1-tap checkout. Sufficient funds available for this feast.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                <div className="text-xs font-black text-rose-700">Pay at PG / Society Gate:</div>
                <p className="text-[11px] text-stone-600">
                  You can pay cash or scan the delivery partner’s QR code upon arrival at your gate or door. Keep exact change ready if possible.
                </p>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero cancellation fee if cancelled within 60 seconds</span>
            </div>

            {/* Pay CTA */}
            <button
              id="confirm-pay-btn"
              onClick={handlePay}
              className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-rose-600/25 transition-all transform active:scale-98"
            >
              Confirm & Pay ₹{grandTotal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
