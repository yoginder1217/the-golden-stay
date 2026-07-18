# The Golden Stay

A full-stack short-stay rental marketplace built with React 19 and Supabase. Guests discover and book premium family properties; property owners track earnings through a dedicated portal; the platform admin manages everything through a feature-rich dashboard — with no traditional backend server required.

**Live:** [Deployed on Vercel](https://the-golden-stay.vercel.app)

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
- **Razorpay booking** — integrated payment with booking confirmation email sent via Edge Function
- **Promo codes** — percent or flat discounts with expiry and usage limits
- **Loyalty rewards** — earn points on every stay, redeem on checkout
- **Referral system** — unique referral links with tracked credit rewards
- **Guest dashboard** — upcoming & past bookings, PDF download, modify / cancel flows
- **Wishlist** — save and revisit favourite properties
- **Q&A** — ask questions on any property page, answered publicly by admin
- **Push notifications** — web push for booking confirmations and platform announcements
- **Dark mode** — system-aware with manual toggle, persisted to `localStorage`
- **Mobile-first** — sticky mobile booking bar + animated bottom sheet on property pages

### Property Owner Portal (`/owner-portal`)
- Overview stats: properties listed, total bookings, net earnings, pending payout
- Earnings breakdown: gross revenue → platform commission → net (with 6-month bar chart)
- Per-property revenue analysis
- Full bookings table with guest details and stay dates
- Payout history — payment method, transaction reference, status

### Admin Dashboard (`/owner`)

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
- Admin creates payout records; owners see them in their read-only portal
- Mark-as-paid flow captures payment method (UPI / bank transfer / cash) and transaction reference

---

## Project Structure

```
the-golden-stay/
├── public/                         # Static assets (logo, favicon, OG image)
├── src/
│   ├── components/                 # Navbar, Footer, PropertyCard, WishlistButton, …
│   ├── context/                    # AuthProvider, SiteContentContext
│   ├── lib/                        # Supabase data layer
│   │   ├── supabase.js
│   │   ├── properties.js
│   │   ├── bookings.js
│   │   ├── adminBookings.js
│   │   ├── owners.js               # Multi-owner marketplace & payout functions
│   │   ├── availability.js         # Blocked dates
│   │   ├── pricing.js              # Dynamic pricing logic
│   │   ├── promoCodes.js
│   │   ├── notifications.js
│   │   ├── referrals.js
│   │   ├── siteContent.js
│   │   └── …
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Properties.jsx
│   │   ├── PropertyDetails.jsx     # Lightbox, sticky header, mobile booking bar
│   │   ├── Checkout.jsx            # Razorpay integration
│   │   ├── BookingSuccess.jsx
│   │   ├── Dashboard.jsx           # Guest bookings
│   │   ├── OwnerDashboard.jsx      # Admin-only platform management
│   │   ├── OwnerPortal.jsx         # Property owner read-only view
│   │   ├── Wishlist.jsx
│   │   ├── Profile.jsx
│   │   ├── Rewards.jsx
│   │   └── …
│   └── App.jsx
├── supabase/
│   ├── functions/
│   │   ├── send-booking-email/     # Confirmation email via Resend
│   │   ├── notify-booking/         # In-app notification trigger
│   │   └── send-push/              # Web Push dispatch
│   ├── properties_setup.sql
│   ├── bookings_rls_setup.sql
│   ├── owners_setup.sql            # property_owners & payouts tables
│   ├── promo_codes_setup.sql
│   ├── notifications_setup.sql
│   ├── blocked_dates_setup.sql
│   ├── flash_deals_setup.sql
│   ├── property_qa_setup.sql
│   ├── site_content_setup.sql
│   ├── storage_setup.sql
│   ├── push_subscriptions_setup.sql
│   └── …
├── index.html                      # Razorpay checkout.js loaded here
├── .env                            # Local environment variables — never committed
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account (test mode keys are sufficient for development)

### Install

```bash
git clone https://github.com/yoginder1217/the-golden-stay.git
cd the-golden-stay
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_ADMIN_EMAIL=your-admin@email.com
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

> The Supabase URL, anon key, and Razorpay Key ID are safe to expose in the frontend.
> Keep the Razorpay Key Secret and Supabase Service Role Key server-side only — never commit them.

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Database Setup

Run each SQL file in the **Supabase SQL Editor** in this order:

```
supabase/properties_setup.sql
supabase/bookings_rls_setup.sql
supabase/notifications_setup.sql
supabase/blocked_dates_setup.sql
supabase/flash_deals_setup.sql
supabase/promo_codes_setup.sql
supabase/property_qa_setup.sql
supabase/contact_messages_setup.sql
supabase/newsletter_referral_setup.sql
supabase/site_content_setup.sql
supabase/storage_setup.sql
supabase/push_subscriptions_setup.sql
supabase/add_weekend_premium.sql
supabase/add_property_images.sql
supabase/add_review_count.sql
supabase/owners_setup.sql
```

After running `owners_setup.sql`, update the two admin RLS policies with your actual admin email:

```sql
DROP POLICY IF EXISTS "Admin full access property_owners" ON property_owners;
DROP POLICY IF EXISTS "Admin full access payouts" ON payouts;

CREATE POLICY "Admin full access property_owners" ON property_owners
  FOR ALL USING ((auth.jwt() ->> 'email') = 'your-admin@email.com');

CREATE POLICY "Admin full access payouts" ON payouts
  FOR ALL USING ((auth.jwt() ->> 'email') = 'your-admin@email.com');
```

---

## Edge Functions

| Function | Trigger | Purpose |
|---|---|---|
| `send-booking-email` | Called from Checkout on payment success | Sends booking confirmation email via Resend |
| `notify-booking` | PostgreSQL trigger on bookings INSERT | Creates in-app notification for the guest |
| `send-push` | Called when a push notification is needed | Dispatches Web Push to subscribed devices |

**Secrets required** (set in Supabase Dashboard → Edge Functions → Secrets):

```
RESEND_API_KEY=re_your_resend_api_key
VAPID_PRIVATE_KEY=your_vapid_private_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Deploy with the Supabase CLI:

```bash
supabase functions deploy send-booking-email
supabase functions deploy notify-booking
supabase functions deploy send-push
```

---

## Deployment

Deploys automatically to Vercel from the `main` branch.

1. Connect the GitHub repository in Vercel
2. Add all `.env` variables under **Vercel → Settings → Environment Variables**
3. Every push to `main` triggers a production build

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

## Onboarding a Property Owner

1. The owner creates a regular account at `/signup`
2. In Supabase Dashboard → **Authentication → Users**, copy their UUID
3. In the Admin Dashboard → **Property Owners** tab → Add Owner → paste the UUID into the **User ID** field
4. Edit any property → assign it to that owner from the dropdown
5. The owner now sees **My Portal** in the navbar after login

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

## License

Private project. All rights reserved © The Golden Stay.
