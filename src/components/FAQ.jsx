import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

const FAQ = () => {
  const { cJSON } = useSiteContent();
  const questions = cJSON('faq.items');
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
