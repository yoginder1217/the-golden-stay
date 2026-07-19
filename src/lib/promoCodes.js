import { supabase } from './supabase';

export const validatePromoCode = async (code, bookingTotal) => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !data) throw new Error('Invalid or expired promo code.');
  if (data.expires_at && new Date(data.expires_at) < new Date())
    throw new Error('This promo code has expired.');
  if (data.uses_left === 0)
    throw new Error('This promo code has been fully redeemed.');
  if (bookingTotal < data.min_booking)
    throw new Error(`Minimum booking of ₹${data.min_booking.toLocaleString('en-IN')} required for this code.`);

  const discount = data.discount_type === 'flat'
    ? Math.min(data.discount_value, bookingTotal)
    : Math.round(bookingTotal * data.discount_value / 100);

  const label = data.discount_type === 'flat'
    ? `₹${data.discount_value} off (${data.code})`
    : `${data.discount_value}% off (${data.code})`;

  return { discount, label, code: data.code, discount_type: data.discount_type, discount_value: data.discount_value };
};
