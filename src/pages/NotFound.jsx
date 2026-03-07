import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-charcoal mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-6">Sorry, we couldn't find the page you're looking for.</p>
      <Link to="/" className="bg-golden text-white px-6 py-2 rounded-full font-bold">Go Home</Link>
    </div>
  );
};

export default NotFound;