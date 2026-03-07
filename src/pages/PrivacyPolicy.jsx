import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-700">
      <h1 className="text-4xl font-bold text-charcoal mb-8 font-serif">Privacy Policy</h1>
      <p className="mb-4">Last updated: February 2026</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-2 text-golden-dark">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Name, email address, and phone number.</li>
            <li>Payment information (processed securely by our third-party partners).</li>
            <li>Government ID (for verification purposes as required by local laws).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-golden-dark">2. How We Use Your Information</h2>
          <p>We use your data to facilitate bookings, communicate with you regarding your stay, and improve our services. We do not sell your personal data to advertisers.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2 text-golden-dark">3. Security</h2>
          <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;