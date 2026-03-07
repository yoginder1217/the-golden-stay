import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  // CONFIGURATION
  const phoneNumber = "7983914058"; 
  const message = "Hi! I am interested in booking a stay at The Golden Stay.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      // CHANGED: p-4 -> p-3 (Smaller padding)
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center p-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      {/* CHANGED: size 32 -> 24 (Smaller Icon) */}
      <MessageCircle size={24} fill="white" className="text-white" />
      
      {/* CHANGED: text-lg -> text-base and ml-3 -> ml-2 (Smaller text and spacing) */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-base ml-0 group-hover:ml-2">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;