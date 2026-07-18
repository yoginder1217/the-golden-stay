# The Golden Stay

A full-stack short-stay rental marketplace built with React 19 and Supabase. Guests discover and book premium family properties; property owners track earnings through a dedicated portal; the platform admin manages everything through a feature-rich dashboard — with no traditional backend server required.

**Live:** [the-golden-stay.vercel.app](https://the-golden-stay.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router v7 |
| Styling | Tailwind CSS 4, Framer Motion |
| Icons | Lucide React |
| Database / Auth | Supabase (PostgreSQL + RLS + Auth + Storage + Realtime) |
| Edge Functions | Supabase Edge Functions (Deno / TypeScript) |
| Payments | Razorpay Standard Checkout |
| Maps | React Leaflet |
| PDF | jsPDF + react-to-print |
| SEO | react-helmet-async |
| Deployment | Vercel |

---

## Features

### Guest Experience
- **Property discovery** — filterable listing grid with image lightbox, per-amenity icons, and sticky scroll header
- **Dynamic pricing** — weekend premium, minimum night enforcement, cleaning & service fees
- **Razorpay payment** — integrated checkout with booking confirmation email via Edge Function
- **Promo codes** — percent or flat discounts with expiry and usage limits
- **Loyalty rewards** — earn points on every stay, redeem on checkout
- **Referral system** — unique referral links with tracked credit rewards
- **Guest dashboard** — upcoming & past bookings, PDF download, modify / cancel flows
- **Wishlist** — save and revisit favourite properties
- **Q&A** — ask questions on any property page, answered publicly by admin
- **Push notifications** — web push for booking confirmations and platform announcements
- **Dark mode** — system-aware with manual toggle, persisted to `localStorage`
- **Mobile-first** — sticky booking bar + animated bottom sheet on property pages

### Property Owner Portal
- Overview stats: properties listed, total bookings, net earnings, pending payout
- Earnings breakdown: gross → platform commission → net, with 6-month bar chart
- Per-property revenue analysis
- Full bookings table with guest details and stay dates
- Payout history with payment method, transaction reference, and status

### Admin Dashboard

| Tab | Capability |
|---|---|
| All Bookings | Search / filter by status & property, update booking status, CSV export |
| Properties | Add / edit / delete properties, image upload, block dates, flash deals |
| Property Owners | Add owners with commission %, bank / UPI details, link to site login |
| Payouts | Auto-compute monthly settlements from completed stays, mark as paid |
| Guest History | Booking history grouped by property |
| Q&A | Answer guest questions (unanswered flagged first) |
| Messages | View and reply to contact form submissions |
| Channel Manager | Toggle Airbnb / MakeMyTrip / Goibibo listing links per property |
| Promo Codes | Create and manage discount codes |
| Site Content | Edit all page copy live without redeploying |

### Multi-Owner Marketplace
- Per-owner commission rate (default 10% platform / 90% owner)
- Monthly settlement cycle — only completed stays are eligible
- Admin creates payout records; owners track them in a read-only portal
- Mark-as-paid flow with payment method (UPI / bank transfer / cash) and transaction reference

---

## Key Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — hero, featured properties, testimonials, FAQ |
| `/properties` | Public | All properties with search & filter |
| `/property/:id` | Public | Property detail, gallery, booking widget |
| `/checkout` | Public | Guest details + Razorpay payment |
| `/booking-success` | Public | Confirmation screen |
| `/login` · `/signup` | Public | Authentication |
| `/dashboard` | Logged in | Guest bookings & history |
| `/wishlist` | Logged in | Saved properties |
| `/profile` | Logged in | Edit profile & change password |
| `/rewards` | Logged in | Loyalty points & referral links |
| `/owner-portal` | Property owner | Earnings, bookings & payout history |
| `/owner` | Admin only | Full platform management dashboard |

---

## Brand

| Token | Value |
|---|---|
| Primary (Golden) | `#D4AF37` |
| Dark accent | `#AA8C2C` |
| Charcoal | `#1A1A1A` |
| Display typeface | Playfair Display |
| Body typeface | Lato / system-ui |

---

> For local setup, database provisioning, Edge Function deployment, and environment variables, see [SETUP.md](SETUP.md).

---

## License

Private project. All rights reserved © The Golden Stay.
