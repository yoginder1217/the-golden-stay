import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Sharma Family",
    text: "The 3BHK was perfect for our family reunion. The kitchen was fully stocked!",
    location: "Stayed in Noida"
  },
  {
    id: 2,
    name: "Rahul & Friends",
    text: "Better than a hotel. We had our own living room to chill in.",
    location: "Stayed in Gurgaon"
  },
  {
    id: 3,
    name: "Priya Singh",
    text: "Safe, clean, and the host was very helpful with local tips.",
    location: "Stayed in Delhi"
  }
];

const Testimonials = () => {
  return (
    <div className="bg-golden/10 py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-charcoal mb-12">What Families Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex justify-center text-golden mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-gray-600 italic mb-6">"{review.text}"</p>
              <h4 className="font-bold text-charcoal">{review.name}</h4>
              <span className="text-sm text-gray-500">{review.location}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;