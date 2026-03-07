import React from 'react';
import { useAuth } from "../context/AuthContextUtils";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Hello, {user?.name || "Guest"}</h1>
      <p className="text-gray-500 mb-8">Here are your upcoming and past trips.</p>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 font-bold">Upcoming Trips</div>
        <div className="p-8 text-center text-gray-500">
          <p>You have no upcoming trips booked.</p>
          <button className="mt-4 text-golden font-bold hover:underline">Browse Properties</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;