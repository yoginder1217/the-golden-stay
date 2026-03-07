export const properties = [
  {
    id: 1,
    title: "Golden Heights 3BHK Family Suite",
    location: "Sector 62, Noida",
    type: "3BHK",
    price: 4500,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    amenities: ["WiFi", "Kitchen", "AC", "Parking", "TV"],
    description: "Experience luxury in this fully furnished 3BHK family suite. Perfect for long stays and large groups.",
    // NEW: External Booking Links
    links: {
      airbnb: "https://www.airbnb.com",
      mmt: "https://www.makemytrip.com",
      goibibo: "https://www.goibibo.com",
      direct: "/checkout" // Option to book directly with you (saves commission)
    }
  },
  {
    id: 2,
    title: "Cozy 2BHK Homestay",
    location: "Indirapuram, Ghaziabad",
    type: "2BHK",
    price: 2800,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    amenities: ["WiFi", "AC", "Geyser", "Power Backup"],
    description: "A compact and cozy 2BHK homestay situated right next to the metro. Ideal for small families.",
    links: {
      airbnb: "https://www.airbnb.com",
      mmt: "https://www.makemytrip.com"
    }
  },
  {
    id: 3,
    title: "Royal Golden Villa",
    location: "Greater Noida",
    type: "Villa",
    price: 8500,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
    amenities: ["Pool", "Garden", "Full Kitchen", "Caretaker"],
    description: "A premium standalone villa for those who want privacy and luxury. Features a private garden.",
    links: {
      airbnb: "https://www.airbnb.com",
      direct: "/checkout"
    }
  }
];