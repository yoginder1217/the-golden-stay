import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      navigate('/booking-success');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-charcoal mb-8">Confirm Your Trip</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: User Details */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Details</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" />
            <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" />
            <input type="tel" placeholder="Phone Number" className="w-full p-3 border rounded-lg" />
            
            <h2 className="text-xl font-bold mt-8 mb-4">Payment Method</h2>
            <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer border-golden">
              <span className="font-bold">Credit/Debit Card</span>
              <div className="w-4 h-4 bg-golden rounded-full"></div>
            </div>
            <div className="p-4 border rounded-lg bg-white flex items-center justify-between cursor-pointer mt-2">
              <span className="font-bold">UPI / GPay</span>
              <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
          <h3 className="text-xl font-bold mb-4">Golden Heights 3BHK</h3>
          <p className="text-gray-500 mb-6">Sector 62, Noida</p>
          
          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span>₹4,500 x 2 nights</span>
              <span>₹9,000</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning Fee</span>
              <span>₹500</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>₹300</span>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-xl mt-4 mb-6">
            <span>Total</span>
            <span>₹9,800</span>
          </div>

          <button 
            onClick={handlePayment}
            className="w-full bg-golden hover:bg-golden-dark text-white font-bold py-3 rounded-lg transition"
          >
            Pay & Reserve
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;