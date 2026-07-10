# The Golden Stay

> **Premium short-stay homestay platform for families — evolving into a full-stack SaaS for property owners and franchise partners.**

---

## What Is This?

The Golden Stay is a hospitality brand offering curated 2BHK and 3BHK family suites in Noida, Indirapuram, and Greater Noida. This repository is the public-facing web platform that handles property discovery, direct bookings, franchise inquiries, and (in progress) a complete revenue management dashboard for property owners.

The end goal is a **two-sided SaaS marketplace**:
- **Guests** discover, compare, and book premium stays.
- **Property Owners / Franchise Partners** list their properties, track bookings, manage pricing, and get real-time revenue analytics — all from a single dashboard.

---

## Current State (Phase 1 — Frontend MVP)

The frontend shell is live and deployed on Vercel. Core pages and UI components are built; backend wiring is still in progress.

### What Works
- Property listings with filtering (2BHK / 3BHK / Villa)
- Property detail pages with multi-platform booking links (Airbnb, MakeMyTrip, Goibibo)
- Direct booking flow (UI only — Checkout → Booking Success)
- Contact form (EmailJS integration — needs credentials)
- Auth context (simulated — no real backend yet)
- Franchise CTA and FAQ sections
- Fully responsive design (mobile-first)
- Framer Motion animations throughout
- SEO meta tags via React Helmet Async
- WhatsApp floating CTA

### What Is Placeholder / Broken
- Hero search bar does not filter properties
- Checkout is disconnected from the selected property (always shows hardcoded data)
- Auth stores a hardcoded user name — no real login/signup
- EmailJS credentials are placeholder values
- "View Photos", "Filters", and "Map View" buttons are dead UI
- No form validation on Checkout or Contact
- No payment gateway integration

---

## Roadmap to Full-Stack SaaS

### Phase 2 — Working Booking Flow
- [ ] Connect hero search to the Properties page with query params
- [ ] Pass selected property + dates + guests through the booking flow
- [ ] Validate and submit real checkout form data
- [ ] Integrate Razorpay / Stripe for payments
- [ ] Send booking confirmation emails (EmailJS or Resend)
- [ ] Booking confirmation page with real reservation details

### Phase 3 — Real Authentication
- [ ] Replace simulated auth with Supabase Auth (email/password + Google OAuth)
- [ ] Persist session across page refreshes
- [ ] Role-based access: Guest / Property Owner / Admin
- [ ] Protected routes for Dashboard and Owner Panel
- [ ] Password reset and email verification flows

### Phase 4 — Database & Backend
- [ ] Supabase PostgreSQL schema: users, properties, bookings, reviews
- [ ] Real property CRUD — owners can add/edit/remove listings
- [ ] Availability calendar — blocked dates, check-in/out constraints
- [ ] Dynamic pricing engine — weekday vs. weekend vs. seasonal rates
- [ ] Booking status lifecycle: Pending → Confirmed → Checked In → Completed

### Phase 5 — Owner / Franchise SaaS Dashboard
- [ ] Revenue analytics: monthly earnings, occupancy rate, average nightly rate
- [ ] Booking management table with status filters
- [ ] Calendar view of upcoming reservations
- [ ] Guest messaging system (in-app + WhatsApp notification)
- [ ] Performance benchmarks vs. comparable properties
- [ ] Payout tracking and invoice generation

### Phase 6 — Guest Experience
- [ ] Guest profile with booking history
- [ ] Review and rating system (post-checkout)
- [ ] Wishlist / saved properties
- [ ] Loyalty points or repeat-guest discounts
- [ ] Real-time availability widget (no double-bookings)

### Phase 7 — Growth & Marketplace
- [ ] Multi-city expansion (property data is not hardcoded)
- [ ] Property owner self-onboarding flow
- [ ] Franchise application and approval workflow
- [ ] Channel manager integration (sync availability with Airbnb / MakeMyTrip APIs)
- [ ] Admin panel: approve listings, manage disputes, view platform-wide analytics
- [ ] Blog / SEO content pages for organic traffic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Icons | Lucide React |
| SEO | React Helmet Async |
| Auth (planned) | Supabase Auth |
| Database (planned) | Supabase PostgreSQL |
| Payments (planned) | Razorpay |
| Email (planned) | EmailJS / Resend |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── components/       # Reusable UI: Navbar, Footer, PropertyCard, FAQ, etc.
├── context/          # Auth context (AuthProvider + AuthContextUtils)
├── data/             # Static property data (will move to DB in Phase 4)
├── pages/            # Route-level components: Home, Properties, Checkout, etc.
├── App.jsx           # Route definitions and layout wrapper
└── main.jsx          # React DOM entry point
```

---

## Local Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the root (never commit it):

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

---

## Brand

- **Primary:** Golden `#D4AF37`
- **Dark accent:** `#AA8C2C`
- **Background dark:** Charcoal `#1A1A1A`
- **Typefaces:** Playfair Display (headings) · Lato (body)
