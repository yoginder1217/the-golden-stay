import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-700">
      <h1 className="text-4xl font-bold text-charcoal mb-8 font-serif">Terms & Conditions</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-golden-dark">1. Booking & Cancellation</h2>
          <p>By booking a stay with The Golden Stay, you agree to the following:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Check-in time is 2:00 PM and Check-out is 11:00 AM.</li>
            <li>Cancellations made 48 hours prior to check-in are eligible for a full refund.</li>
            <li>Government ID is mandatory for all adult guests upon arrival.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-golden-dark">2. House Rules</h2>
          <p>We maintain a family-friendly environment. Loud parties, illegal activities, and unregistered guests are strictly prohibited and may result in immediate eviction without refund.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-golden-dark">3. Liability</h2>
          <p>The Golden Stay is not responsible for the loss of personal belongings or valuables left in the apartment.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;