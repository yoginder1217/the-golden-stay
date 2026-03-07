import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const questions = [
  { q: "Is the kitchen fully equipped?", a: "Yes! All our 2BHK and 3BHK units come with a stove, gas, utensils, and a refrigerator." },
  { q: "Are unmarried couples allowed?", a: "We welcome families and couples. Please provide valid ID proofs for all adults during check-in." },
  { q: "Is there parking available?", a: "Yes, all our properties have dedicated parking spots for guests." }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button 
              className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left font-semibold"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {item.q}
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIndex === index && (
              <div className="p-4 bg-gray-50 text-gray-600 border-t">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;