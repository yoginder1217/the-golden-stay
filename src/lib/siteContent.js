import { supabase } from './supabase';

export const CONTENT_DEFAULTS = {
  // Hero (Home page)
  'hero.badge':    'Welcome to The Golden Stay',
  'hero.title':    'Experience Royalty\nLike Never Before',
  'hero.subtitle': 'Premium 2BHK & 3BHK sanctuaries designed for families who demand excellence.',

  // Services — 3 feature cards on Home
  'services.1.title': 'Secure Sanctuaries',
  'services.1.desc':  '24/7 Gated security and premium neighborhoods ensure your family sleeps with total peace of mind.',
  'services.2.title': "Chef's Kitchen",
  'services.2.desc':  "Why eat out? Our fully equipped modular kitchens let you cook your family's favorite healthy meals.",
  'services.3.title': 'Hyper-Connected',
  'services.3.desc':  'Blazing fast 5G WiFi and Smart TVs in every room. Work, play, and stream without buffering.',

  // FAQ (Home page)
  'faq.items': JSON.stringify([
    { q: 'Is the kitchen fully equipped?', a: 'Yes! All our 2BHK and 3BHK units come with a stove, gas, utensils, and a refrigerator.' },
    { q: 'Are unmarried couples allowed?', a: 'We welcome families and couples. Please provide valid ID proofs for all adults during check-in.' },
    { q: 'Is there parking available?', a: 'Yes, all our properties have dedicated parking spots for guests.' },
  ]),

  // About page
  'about.hero.title':    'Redefining Family Travel',
  'about.hero.subtitle': "The Golden Stay isn't just a hotel chain. It is a philosophy that family vacations should feel like home, but look like royalty.",
  'about.story.eyebrow': 'Our Origin',
  'about.story.title':   'A Gap in Hospitality',
  'about.story.p1':      'Founded in 2024, The Golden Stay emerged from a simple frustration: hotels are too cramped for families, and typical homestays lack luxury.',
  'about.story.p2':      'We bridge this gap. We acquire premium properties, furnish them with royal aesthetics, and manage them with hotel-grade discipline. Whether you are here for a wedding, a medical visit, or a getaway, we provide the space you need with the service you deserve.',
  'about.award.text':    '"Best Family Stay 2025"',
  'about.award.source':  'Hospitality India Awards',
  'about.stats': JSON.stringify([
    { label: 'Happy Families',     value: '500+' },
    { label: 'Luxury Apartments',  value: '50+'  },
    { label: 'Cities Covered',     value: '5'    },
    { label: 'Star Rating',        value: '4.9'  },
  ]),
  'about.values': JSON.stringify([
    { title: 'Uncompromised Safety', desc: 'Every property is vetted for neighborhood safety, surveillance, and 24/7 support access.' },
    { title: 'Family Centric',       desc: 'No more splitting into separate rooms. Large living areas designed for togetherness.' },
    { title: 'Warm Hospitality',     desc: 'From welcome drinks to personalized travel guides, we treat you like family, not just a booking ID.' },
  ]),

  // Contact info (shared across Contact page + Footer)
  'contact.phone':          '+91 79839 14058',
  'contact.email':          'concierge@goldenstay.com',
  'contact.address':        'Khair, Aligarh, UP',
  'contact.hours':          'Mon-Sun 9am to 8pm',
  'contact.hero.title':     "Let's Plan Your\nRoyal Stay.",
  'contact.hero.subtitle':  'Have questions about booking a 3BHK for your next family trip? Reach out to our concierge team directly.',

  // Footer
  'footer.tagline': 'Premium serviced apartments and family stays. Experience the comfort of home with the luxury of a hotel.',
  'footer.email':   'info@goldenstay.com',
  'footer.address': 'Khair, Aligarh, Uttar Pradesh',
  'footer.copyright': '© 2026 The Golden Stay. All rights reserved.',
};

// Fetch all content rows as { key: value } map
export const fetchSiteContent = async () => {
  const { data, error } = await supabase.from('site_content').select('key, value');
  if (error) throw error;
  const map = {};
  (data || []).forEach(row => { map[row.key] = row.value; });
  return map;
};

// Upsert a single key/value
export const saveSiteContent = async (key, value, section = 'general', label = '') => {
  const { error } = await supabase.from('site_content').upsert(
    { key, value, section, label, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) throw error;
};

// Upsert multiple rows at once
export const saveSiteContentBatch = async (entries) => {
  const rows = entries.map(({ key, value, section, label }) => ({
    key, value, section: section || 'general', label: label || '', updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
};
