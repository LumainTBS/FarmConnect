import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, CreditCard, Smartphone, Banknote, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CheckoutPage() {
  const { cart, user, createOrder } = useApp();
  const navigate = useNavigate();

  // STEP 1: Payment Method Choice (Selected BEFORE consent)
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' | 'bank' | 'cod'
  const [momoNumber, setMomoNumber] = useState(user?.phone_number || '+268 7612 3456');
  
  // STEP 2: Consent Checkbox
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // STEP 3: Order Complete State
  const [confirmedOrders, setConfirmedOrders] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 10 : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0 && !confirmedOrders) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">No items to checkout</h1>
        <Link to="/marketplace" className="text-xs text-brand-forest underline font-bold">Go to Marketplace</Link>
      </div>
    );
  }

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!consentGiven) return;

    setIsSubmitting(true);

    const paymentLabel = paymentMethod === 'momo'
      ? `MTN Mobile Money (${momoNumber})`
      : paymentMethod === 'bank'
      ? 'Eswatini Bank Transfer'
      : 'Cash on Pickup/Delivery';

    setTimeout(() => {
      const created = createOrder(cart, paymentLabel);
      setIsSubmitting(false);
      setConfirmedOrders(created);
    }, 800);
  };

  // STEP 3 VIEW: ORDER CONFIRMATION
  if (confirmedOrders) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-brand-forest rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Thank you for your order!</h1>
          <p className="text-xs text-slate-500">
            Your order has been sent to the farmer(s). You can track order status anytime.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 text-left shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Order Summary</h3>
          {confirmedOrders.map(ord => (
            <div key={ord.id} className="flex justify-between text-xs py-1">
              <div>
                <span className="font-semibold text-slate-800">{ord.product_name}</span> × {ord.quantity} {ord.unit}
                <div className="text-[11px] text-slate-500">{ord.farmer_name}</div>
              </div>
              <span className="font-bold text-brand-forest">E{ord.total_price}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
            <span>Total Paid</span>
            <span className="text-brand-forest">E{total}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 py-3 rounded-xl bg-brand-forest text-white font-bold text-xs hover:bg-brand-dark transition-colors shadow-sm text-center"
          >
            Track My Orders
          </Link>
          <Link
            to="/marketplace"
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
      </div>

      <form onSubmit={handleConfirmOrder} className="space-y-6">
        
        {/* STEP 1: CHOOSE PAYMENT METHOD */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                STEP 1 OF 2
              </span>
              <h2 className="font-bold text-slate-900 text-base mt-1">Choose Payment Method</h2>
            </div>
          </div>

          <div className="space-y-3">
            {/* MTN Mobile Money */}
            <label 
              className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'momo' 
                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="momo"
                checked={paymentMethod === 'momo'}
                onChange={() => setPaymentMethod('momo')}
                className="mt-1 text-brand-forest focus:ring-brand-forest"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>MTN Mobile Money (MoMo)</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">Popular in Eswatini</span>
                </div>
                <p className="text-[11px] text-slate-500">Pay directly using your MTN MoMo wallet prompt.</p>

                {paymentMethod === 'momo' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      MTN MoMo Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="+268 76XX XXXX"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-brand-forest focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </label>

            {/* Eswatini Bank Transfer */}
            <label 
              className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'bank' 
                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={() => setPaymentMethod('bank')}
                className="mt-1 text-brand-forest focus:ring-brand-forest"
              />
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Eswatini Bank Transfer (EFT)</span>
                </div>
                <p className="text-[11px] text-slate-500">FNB Eswatini, Nedbank, Standard Bank, or EswatiniBank.</p>
              </div>
            </label>

            {/* Cash on Pickup / Delivery */}
            <label 
              className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'cod' 
                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 text-brand-forest focus:ring-brand-forest"
              />
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery / Pickup</span>
                </div>
                <p className="text-[11px] text-slate-500">Pay cash upon inspecting produce at pickup hub or delivery.</p>
              </div>
            </label>
          </div>
        </div>

        {/* STEP 2: CONSENT & CONFIRMATION (Comes AFTER payment method selection) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
              STEP 2 OF 2
            </span>
            <h2 className="font-bold text-slate-900 text-base mt-1">Consent & Order Confirmation</h2>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items ({cart.length})</span>
              <span className="font-bold text-slate-900">E{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-900">E{deliveryFee}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-brand-forest">E{total}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="checkoutConsent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-forest focus:ring-brand-forest shrink-0 cursor-pointer"
            />
            <label htmlFor="checkoutConsent" className="text-xs text-emerald-950 leading-snug cursor-pointer">
              I confirm that I have reviewed my order items, agree to pay <strong>E{total}</strong> via <strong>{paymentMethod.toUpperCase()}</strong>, and accept Farm Connect's terms.
            </label>
          </div>

          <button
            type="submit"
            disabled={!consentGiven || isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm ${
              consentGiven && !isSubmitting
                ? 'bg-brand-forest text-white hover:bg-brand-dark cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{isSubmitting ? 'Processing Order...' : `Confirm Order (E${total})`}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
