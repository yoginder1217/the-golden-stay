# Setup Guide

Complete technical reference for provisioning and running The Golden Stay from scratch.

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account (test mode keys are sufficient for development)

---

## Install & Run

```bash
git clone https://github.com/yoginder1217/the-golden-stay.git
cd the-golden-stay
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Environment Variables

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

After running `owners_setup.sql`, replace the two admin RLS policies with your actual admin email (the `ALTER DATABASE` approach is not supported in Supabase's SQL editor):

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

Three Supabase Edge Functions handle server-side work:

| Function | Trigger | Purpose |
|---|---|---|
| `send-booking-email` | Called from Checkout on payment success | Sends booking confirmation email via Resend |
| `notify-booking` | PostgreSQL trigger on bookings INSERT | Creates in-app notification for the guest |
| `send-push` | Called when a push notification is needed | Dispatches Web Push to subscribed devices |

**Secrets** — set these in Supabase Dashboard → Edge Functions → Secrets:

```
RESEND_API_KEY=re_your_resend_api_key
VAPID_PRIVATE_KEY=your_vapid_private_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Deploy** with the Supabase CLI:

```bash
supabase functions deploy send-booking-email
supabase functions deploy notify-booking
supabase functions deploy send-push
```

---

## Deployment (Vercel)

1. Connect the GitHub repository in Vercel
2. Add all `.env` variables under **Vercel → Settings → Environment Variables**
3. Every push to `main` triggers an automatic production build

---

## Onboarding a Property Owner

1. The owner creates a regular account at `/signup`
2. In Supabase Dashboard → **Authentication → Users**, copy their UUID
3. In the Admin Dashboard (`/owner`) → **Property Owners** tab → Add Owner → paste the UUID into the **User ID** field
4. Edit any property → assign it to that owner from the owner dropdown
5. The owner now sees **My Portal** in the navbar after login and can access `/owner-portal`

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
│   │   ├── send-booking-email/
│   │   ├── notify-booking/
│   │   └── send-push/
│   └── *.sql                       # One file per feature / migration
├── index.html                      # Razorpay checkout.js loaded here
├── .env                            # Local env vars — never committed
└── vite.config.js
```
