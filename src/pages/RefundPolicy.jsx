import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, CreditCard, Mail, AlertTriangle, ArrowRight } from 'lucide-react';

const TIERS = [
  {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    bg: 'bg-green-50 border-green-200',
    title: 'Full Refund',
    condition: 'Cancel 7+ days before check-in',
    refund: '100% of total paid',
    detail: 'Entire booking amount including cleaning fee is refunded to your original payment method.',
  },
  {
    icon: Clock,
    iconColor: 'text-yellow-500',
    bg: 'bg-yellow-50 border-yellow-200',
    title: '50% Refund',
    condition: 'Cancel 3–6 days before check-in',
    refund: '50% of total paid',
    detail: 'Half the booking amount is refunded. Cleaning fee and service fee are non-refundable at this stage.',
  },
  {
    icon: XCircle,
    iconColor: 'text-red-400',
    bg: 'bg-red-50 border-red-200',
    title: 'No Refund',
    condition: 'Cancel within 72 hours of check-in',
    refund: '₹0',
    detail: 'Cancellations made less than 3 days before check-in are non-refundable due to last-minute preparation costs.',
  },
];

const STEPS = [
  { n: '01', title: 'Submit Cancellation', body: 'Go to My Dashboard → find your booking → click Cancel. Confirm the cancellation in the prompt.' },
  { n: '02', title: 'Refund Calculated', body: 'Your refund amount is calculated automatically based on how many days remain until check-in at the time of cancellation.' },
  { n: '03', title: 'Confirmation Email', body: 'You will receive a cancellation confirmation email within minutes with the approved refund amount.' },
  { n: '04', title: 'Refund Credited', body: 'The refund is initiated to your original payment source. Bank processing typically takes 5–7 business days.' },
];

const RefundPolicy = () => (
  <div className="bg-white">
    <Helmet>
      <title>Refund & Cancellation Policy | The Golden Stay</title>
      <meta name="description" content="Learn about The Golden Stay's cancellation and refund policy — full refund 7+ days out, 50% within 3–6 days, no refund within 72 hours." />
    </Helmet>

    {/* Hero */}
    <div className="bg-charcoal text-white py-16 px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-golden text-xs font-bold uppercase tracking-widest mb-3">Transparency first</p>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Refund & Cancellation Policy</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
          We understand plans change. Our policy is designed to be fair to both guests and property owners.
        </p>
        <p className="text-gray-500 text-xs mt-4">Last updated: July 2026</p>
      </motion.div>
    </div>

    <div className="max-w-4xl mx-auto px-4 py-16">

      {/* Cancellation Tiers */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl font-bold text-charcoal font-serif mb-2">Cancellation Tiers</h2>
        <p className="text-gray-500 text-sm mb-8">Refund amount depends on when you cancel relative to your check-in date.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {TIERS.map(({ icon: Icon, iconColor, bg, title, condition, refund, detail }) => (
            <div key={title} className={`border rounded-2xl p-6 ${bg}`}>
              <Icon size={28} className={`${iconColor} mb-3`} />
              <h3 className="font-bold text-charcoal text-base mb-1">{title}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{condition}</p>
              <p className="text-2xl font-bold text-charcoal mb-3">{refund}</p>
              <p className="text-gray-600 text-xs leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Non-refundable note */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-16">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-charcoal mb-1">Non-refundable items</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            The service fee (₹300) is non-refundable in all cases as it covers platform and processing costs.
            The cleaning fee is refunded only on full (7+ day) cancellations.
            Golden Points redeemed during booking are restored to your account upon successful cancellation.
          </p>
        </div>
      </div>

      {/* How to Cancel */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl font-bold text-charcoal font-serif mb-2">How to Cancel</h2>
        <p className="text-gray-500 text-sm mb-8">Cancellations are self-service through your dashboard — no need to contact support.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <span className="text-2xl font-bold text-golden/40 font-serif shrink-0">{n}</span>
              <div>
                <p className="font-bold text-charcoal text-sm mb-1">{title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Refund Methods */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl font-bold text-charcoal font-serif mb-2">Refund Methods</h2>
        <p className="text-gray-500 text-sm mb-6">Refunds are always returned to your original payment source.</p>
        <div className="space-y-4 mb-16">
          {[
            {
              icon: CreditCard,
              title: 'Credit / Debit Card',
              body: 'Refunded to the card used at checkout. Processing time: 5–7 business days depending on your bank.',
            },
            {
              icon: CreditCard,
              title: 'UPI / Net Banking',
              body: 'Refunded to the originating UPI ID or bank account. Processing time: 3–5 business days.',
            },
            {
              icon: CreditCard,
              title: 'Wallets (Paytm, PhonePe, etc.)',
              body: 'Refunded directly to the wallet. Processing time: 1–3 business days.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 border border-gray-100 rounded-2xl p-5 hover:border-golden/30 transition">
              <div className="w-10 h-10 bg-golden/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-golden" />
              </div>
              <div>
                <p className="font-bold text-charcoal text-sm mb-0.5">{title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-3 pl-1">
            Refunds are processed through Razorpay. Once initiated by us, the exact credit date depends on your bank or wallet provider.
          </p>
        </div>
      </motion.div>

      {/* Special Circumstances */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-16">
        <h3 className="font-bold text-charcoal mb-3">Special Circumstances</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> <span>If a property is unavailable due to an issue on our end, you will receive a <strong>full refund</strong> regardless of timing.</span></li>
          <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> <span>Natural disasters or government-declared emergencies may qualify for an exception — contact us within 24 hours.</span></li>
          <li className="flex gap-2"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> <span>Medical emergencies with valid documentation are reviewed on a case-by-case basis.</span></li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="font-bold text-charcoal mb-2">Still have questions?</h3>
        <p className="text-gray-500 text-sm mb-6">Our support team is happy to help with any cancellation or refund query.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-6 py-3 rounded-xl transition"
          >
            <Mail size={16} /> Contact Support
          </Link>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-golden text-gray-600 hover:text-golden font-bold px-6 py-3 rounded-xl transition"
          >
            Browse Properties <ArrowRight size={16} />
          </Link>
        </div>
      </div>

    </div>
  </div>
);

export default RefundPolicy;
