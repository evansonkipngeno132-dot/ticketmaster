import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const event = location.state?.event || { title: "General Admission", id: "unknown" };
  const isVip = location.state?.isVip || false;

  const handleNext = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tm_token')}`
          },
          body: JSON.stringify({ eventId: event.id, isVip, paymentDetails: "mock_data" })
        });
        const data = await res.json();
        
        if (data.success) {
          alert(`Order Confirmed! Order ID: ${data.orderId}`);
          navigate('/');
        }
      } catch (err) {
        console.error("Checkout failed", err);
        alert("Checkout failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="checkout-page container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="back-link" onClick={() => navigate(-1)}>
        &larr; Back to Ticket Selection
      </button>

      <div className="checkout-container">
        <div className="checkout-main">
          <h2>Checkout</h2>
          
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Delivery</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Confirm</div>
          </div>

          <form className="checkout-form" onSubmit={handleNext}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="form-section">
                  <h3>Delivery Method</h3>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="delivery" defaultChecked />
                      <span className="radio-text">Mobile Ticket - Free</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="delivery" />
                      <span className="radio-text">Will Call - $5.00</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="form-section">
                  <h3>Payment Information</h3>
                  <div className="input-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" required />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Expiration</label>
                      <input type="text" placeholder="MM/YY" required />
                    </div>
                    <div className="input-group">
                      <label>CVV</label>
                      <input type="text" placeholder="123" required />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="form-section">
                  <h3>Review Order</h3>
                  <p>Please confirm your order details before placing it.</p>
                  <div className="terms">
                    <input type="checkbox" required id="terms" />
                    <label htmlFor="terms">I agree to the Terms of Use.</label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="btn-primary" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : (step === 3 ? 'Place Order' : 'Continue')}
            </button>
          </form>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>{isVip ? 'VIP Package' : 'General Admission'} (x1)</span>
              <span>{isVip ? '$450.00' : '$150.00'}</span>
            </div>
            <div className="summary-item">
              <span>Service Fee</span>
              <span>$45.00</span>
            </div>
            <div className="summary-item">
              <span>Order Processing</span>
              <span>$5.00</span>
            </div>
            <hr />
            <div className="summary-total">
              <span>Total</span>
              <span>{isVip ? '$500.00' : '$200.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
