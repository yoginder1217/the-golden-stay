import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const BookingSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <CheckCircle size={80} className="text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-charcoal mb-4">Booking Confirmed!</h1>
      <p className="text-xl text-gray-600 mb-8">
        Thank you for choosing The Golden Stay. Your confirmation email is on its way.
      </p>
      <div className="space-x-4">
        <Link to="/" className="text-golden font-bold hover:underline">Return Home</Link>
        <Link to="/dashboard" className="bg-charcoal text-white px-6 py-2 rounded-full font-bold">View My Bookings</Link>
      </div>
    </div>
  );
};

export default BookingSuccess;