import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const STEPS = ['Cart', 'Address', 'Order Summary', 'Payment'];

const CheckoutPage = () => {
  const { cartItems, cartTotal, cartDiscount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=summary, 3=payment
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.user_metadata?.full_name || '',
    phone: '',
    pincode: '',
    house: '',
    area: '',
    city: '',
    state: '',
    type: 'Home',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const deliveryCharges = cartTotal > 499 ? 0 : 40;
  const finalTotal = cartTotal + deliveryCharges;

  const handleAddressChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    const { name, phone, pincode, house, area, city, state } = address;
    if (!name || !phone || !pincode || !house || !area || !city || !state) {
      toast.error('Please fill all address fields');
      return false;
    }
    if (phone.length < 10) { toast.error('Enter valid phone number'); return false; }
    if (pincode.length !== 6) { toast.error('Enter valid 6-digit pincode'); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!user) { navigate('/auth'); return; }
    setPlacing(true);
    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.price,
        name: item.products?.name,
        image: item.products?.image_url,
      }));

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: orderItems,
          total: finalTotal,
          discount: cartDiscount,
          delivery_charges: deliveryCharges,
          address: address,
          payment_method: paymentMethod,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) throw error;

      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  return (
    <div className="checkout-page">
      {/* Progress Bar */}
      <div className="checkout-progress">
        {STEPS.map((s, i) => (
          <div key={s} className={`progress-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <div className="progress-circle">{i < step ? '✓' : i + 1}</div>
            <span>{s}</span>
            {i < STEPS.length - 1 && <div className="progress-line" />}
          </div>
        ))}
      </div>

      <div className="checkout-container">
        {/* Left: Steps */}
        <div className="checkout-left">

          {/* STEP 1: Address */}
          <div className={`checkout-section ${step !== 1 ? 'collapsed' : ''}`}>
            <div className="section-title-bar">
              <span className="step-num">1</span>
              <h3>DELIVERY ADDRESS</h3>
              {step > 1 && (
                <button className="change-btn" onClick={() => setStep(1)}>Change</button>
              )}
            </div>

            {step === 1 && (
              <div className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name *"
                      value={address.name}
                      onChange={handleAddressChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number *"
                      value={address.phone}
                      onChange={e => setAddress(a => ({ ...a, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                      className="form-input"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode *"
                      value={address.pincode}
                      onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                      className="form-input"
                      maxLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="city"
                      placeholder="City/District/Town *"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <input
                    type="text"
                    name="house"
                    placeholder="Flat, House no., Building, Company, Apartment *"
                    value={address.house}
                    onChange={handleAddressChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <input
                    type="text"
                    name="area"
                    placeholder="Area, Street, Sector, Village *"
                    value={address.area}
                    onChange={handleAddressChange}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <select
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      className="form-input"
                    >
                      <option value="">State *</option>
                      {['Andhra Pradesh','Assam','Bihar','Chandigarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Nagaland','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="address-type-row">
                      <span className="type-label">Address Type:</span>
                      {['Home', 'Work'].map(t => (
                        <label key={t} className="type-option">
                          <input
                            type="radio"
                            name="type"
                            value={t}
                            checked={address.type === t}
                            onChange={handleAddressChange}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  className="continue-btn"
                  onClick={() => { if (validateAddress()) setStep(2); }}
                >
                  SAVE AND DELIVER HERE
                </button>
              </div>
            )}

            {step > 1 && (
              <div className="address-summary">
                <strong>{address.name}</strong> · {address.phone}<br />
                {address.house}, {address.area}, {address.city} - {address.pincode}, {address.state}
                <span className="address-type-badge">{address.type}</span>
              </div>
            )}
          </div>

          {/* STEP 2: Order Summary */}
          <div className={`checkout-section ${step < 2 ? 'locked' : step !== 2 ? 'collapsed' : ''}`}>
            <div className="section-title-bar">
              <span className="step-num">2</span>
              <h3>ORDER SUMMARY</h3>
              {step > 2 && <button className="change-btn" onClick={() => setStep(2)}>Change</button>}
            </div>

            {step === 2 && (
              <div className="order-summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.products?.image_url} alt={item.products?.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.products?.name}</div>
                      <div className="summary-item-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="summary-item-price">₹{(item.products?.price * item.quantity)?.toLocaleString()}</div>
                  </div>
                ))}
                <button className="continue-btn" onClick={() => setStep(3)}>
                  CONTINUE TO PAYMENT
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: Payment */}
          <div className={`checkout-section ${step < 3 ? 'locked' : ''}`}>
            <div className="section-title-bar">
              <span className="step-num">3</span>
              <h3>PAYMENT OPTIONS</h3>
            </div>

            {step === 3 && (
              <div className="payment-section">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  { value: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', icon: '📱' },
                  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
                  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
                ].map(opt => (
                  <label key={opt.value} className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </label>
                ))}

                <div className="payment-total">
                  <span>Amount Payable:</span>
                  <strong>₹{finalTotal.toLocaleString()}</strong>
                </div>

                <button
                  className="place-order-final-btn"
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? 'Placing Order...' : `CONFIRM ORDER · ₹${finalTotal.toLocaleString()}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Price Breakdown */}
        <div className="checkout-right">
          <div className="checkout-price-card">
            <div className="price-card-header">PRICE DETAILS</div>
            <div className="price-row">
              <span>Price ({cartItems.length} items)</span>
              <span>₹{(cartTotal + cartDiscount).toLocaleString()}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="price-row discount">
                <span>Discount</span>
                <span>− ₹{cartDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="price-row">
              <span>Delivery Charges</span>
              <span className={deliveryCharges === 0 ? 'free-text' : ''}>
                {deliveryCharges === 0 ? 'Free' : `₹${deliveryCharges}`}
              </span>
            </div>
            <div className="price-divider" />
            <div className="price-row total">
              <span>Total Amount</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="price-savings">
                You will save ₹{cartDiscount.toLocaleString()} on this order
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
