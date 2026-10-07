import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, ShieldCheck, CreditCard, Smartphone, Banknote, 
  ArrowRight, ArrowLeft, Home, ShoppingBag, Lock, Eye, EyeOff, Building2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CheckoutPage() {
  const { cart, user, createOrder } = useApp();
  const navigate = useNavigate();

  // Payment Method Selection: 'momo' | 'bank' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('bank');
  
  // Mobile Money details
  const [momoNumber, setMomoNumber] = useState(user?.phone_number || '+268 7612 3456');
  const [momoName, setMomoName] = useState(user?.full_name || 'Subscriber');

  // Bank Card details
  const [bankName, setBankName] = useState('FNB Eswatini');
  const [cardHolder, setCardHolder] = useState(user?.full_name || 'Account Holder');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [showCvv, setShowCvv] = useState(false);

  // Consent & Submission state
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmed Order Result
  const [confirmedOrders, setConfirmedOrders] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 10 : 0;
  const total = subtotal + deliveryFee;

  // EMPTY CART FALLBACK WITH CLEAR NAVIGATION TO PREVENT BLANK SCREEN
  if (cart.length === 0 && !confirmedOrders) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You don't have any produce items in your cart to checkout right now.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Produce</span>
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!consentGiven) return;

    setIsSubmitting(true);

    let paymentLabel = '';
    if (paymentMethod === 'momo') {
      paymentLabel = `MTN Mobile Money (${momoNumber} - ${momoName})`;
    } else if (paymentMethod === 'bank') {
      const masked = cardNumber.replace(/\s+/g, '').slice(-4) || '9010';
      paymentLabel = `${bankName} Card (Ending ****${masked})`;
    } else {
      paymentLabel = 'Cash on Pickup / Delivery';
    }

    setTimeout(() => {
      const created = createOrder(cart, paymentLabel);
      setIsSubmitting(false);
      setConfirmedOrders(created);
    }, 900);
  };

  // ORDER CONFIRMED VIEW WITH DIRECT NAVIGATION BACK TO HOME & ORDERS
  if (confirmedOrders) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 text-brand-forest rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 uppercase tracking-wider border border-emerald-200">
            Payment & Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Your transaction has been processed securely. The producer has been notified to prepare your fresh Eswatini harvest.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3.5 text-left shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Order Receipt Summary</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Paid</span>
          </div>

          <div className="space-y-2">
            {confirmedOrders.map(ord => (
              <div key={ord.id} className="flex justify-between text-xs py-1">
                <div>
                  <span className="font-bold text-slate-800">{ord.product_name}</span> × {ord.quantity} {ord.unit}
                  <div className="text-[11px] text-slate-500">Producer: {ord.farmer_name}</div>
                </div>
                <span className="font-extrabold text-brand-forest">E{ord.total_price}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-semibold text-slate-900">{confirmedOrders[0]?.payment_method || 'Bank Card / MoMo'}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
              <span>Total Paid</span>
              <span className="text-brand-forest">E{total}</span>
            </div>
          </div>
        </div>

        {/* PROMINENT NAVIGATION ACTIONS: RETURN TO HOME, ORDERS, MARKETPLACE */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Screen</span>
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3.5 px-4 rounded-xl bg-brand-forest hover:bg-brand-dark text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Track My Orders</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/marketplace')}
          className="text-xs font-bold text-brand-forest hover:underline block mx-auto pt-1"
        >
          ← Continue Browsing Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24 space-y-6">
      
      {/* HEADER WITH RETURN TO HOME LINK */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-slate-500">Secure Eswatini Mobile Money & Bank Payment Gateway</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      <form onSubmit={handleConfirmOrder} className="space-y-6">
        
        {/* STEP 1: PAYMENT METHOD SELECTOR */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                STEP 1 OF 2
              </span>
              <h2 className="font-extrabold text-slate-900 text-base mt-1">Select Payment Method</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Bank Card / EFT Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === 'bank'
                  ? 'bg-emerald-50/60 border-brand-forest ring-2 ring-brand-forest/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-brand-forest' : 'text-slate-500'}`} />
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Card / EFT
                </span>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">Bank Debit Card</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Visa / Mastercard / Eswatini Banks</p>
              </div>
            </button>

            {/* MTN Mobile Money Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('momo')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === 'momo'
                  ? 'bg-emerald-50/60 border-brand-forest ring-2 ring-brand-forest/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Smartphone className={`w-5 h-5 ${paymentMethod === 'momo' ? 'text-brand-forest' : 'text-amber-600'}`} />
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Mobile Wallet
                </span>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">MTN Mobile Money</div>
                <p className="text-[11px] text-slate-500 mt-0.5">+268 MoMo Mobile Prompt</p>
              </div>
            </button>

            {/* Cash on Delivery Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                paymentMethod === 'cod'
                  ? 'bg-emerald-50/60 border-brand-forest ring-2 ring-brand-forest/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-brand-forest' : 'text-slate-500'}`} />
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  Cash Pickup
                </span>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">Cash on Pickup</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Pay at Manzini Hub / Farm Gate</p>
              </div>
            </button>

          </div>

          {/* DYNAMIC PAYMENT FORM DETAILS */}
          {paymentMethod === 'bank' && (
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Building2 className="w-4 h-4 text-brand-forest" />
                  <span>Enter Bank Card Details</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">256-bit Encrypted SSL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Bank Select */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Selecting Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:border-brand-forest focus:outline-none"
                  >
                    <option value="FNB Eswatini">First National Bank (FNB Eswatini)</option>
                    <option value="Nedbank Eswatini">Nedbank Eswatini</option>
                    <option value="Standard Bank Eswatini">Standard Bank Eswatini</option>
                    <option value="EswatiniBank">Eswatini Development & Savings Bank</option>
                    <option value="First Capital Bank">First Capital Bank Eswatini</option>
                  </select>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. Sibusiso Dlamini"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:border-brand-forest focus:outline-none"
                  />
                </div>

                {/* Card Number */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    16-Digit Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-3 py-2 pl-9 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-brand-forest focus:outline-none"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Expiry MM/YY */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Expiry Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY (e.g. 12/28)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-brand-forest focus:outline-none text-center"
                  />
                </div>

                {/* CVV / CSV Security Code */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider flex items-center justify-between">
                    <span>CVV / CSV Code</span>
                    <span className="text-[10px] text-slate-400 font-normal">3 digits on back</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCvv ? "text" : "password"}
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="3-digit CVV"
                      className="w-full px-3 py-2 pr-9 bg-white border border-slate-300 rounded-xl text-xs font-mono font-extrabold text-slate-900 focus:border-brand-forest focus:outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title="Show/hide CVV"
                    >
                      {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {paymentMethod === 'momo' && (
            <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 border-b border-amber-200 pb-2">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>MTN Mobile Money Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={momoName}
                    onChange={(e) => setMomoName(e.target.value)}
                    placeholder="Full Name on MoMo"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-brand-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    MTN Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="+268 76XX XXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:border-brand-forest focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                A MoMo USSD authorization prompt will be sent to <strong>{momoNumber || '+268'}</strong> to confirm payment of <strong>E{total}</strong>.
              </p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1 animate-fade-in">
              <div className="font-bold text-slate-900">Cash Settlement Terms</div>
              <p>You can pay cash directly to the farmer or delivery agent upon inspecting produce quality at pickup hub.</p>
            </div>
          )}

        </div>

        {/* STEP 2: CONSENT & ORDER CONFIRMATION */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              STEP 2 OF 2
            </span>
            <h2 className="font-extrabold text-slate-900 text-base mt-1">Review & Order Consent</h2>
          </div>

          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex justify-between">
              <span>Produce Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
              <span className="font-bold text-slate-900">E{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Local Delivery & Logistics Fee</span>
              <span className="font-bold text-slate-900">E{deliveryFee}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Amount Payable</span>
              <span className="text-brand-forest">E{total}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-start space-x-3">
            <input
              type="checkbox"
              id="checkoutConsent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-forest focus:ring-brand-forest shrink-0 cursor-pointer"
            />
            <label htmlFor="checkoutConsent" className="text-xs text-emerald-950 leading-snug cursor-pointer font-medium">
              I confirm that I have reviewed my order items, agree to pay <strong>E{total}</strong> via <strong>{paymentMethod.toUpperCase()}</strong>, and accept Farm Connect Eswatini terms.
            </label>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!consentGiven || isSubmitting}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-md ${
                consentGiven && !isSubmitting
                  ? 'bg-brand-forest hover:bg-brand-dark text-white cursor-pointer shadow-emerald-700/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isSubmitting ? 'Processing Payment...' : `Confirm Order (Pay E${total})`}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* SAFETY DIRECT LINK TO HOME SCREEN */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel and Return to Home Screen</span>
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
