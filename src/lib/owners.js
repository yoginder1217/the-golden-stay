import { supabase } from './supabase';

export const getOwners = async () => {
  const { data, error } = await supabase
    .from('property_owners')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
};

export const getMyOwnerProfile = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('property_owners')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
};

export const saveOwner = async (owner) => {
  const { id, created_at, ...rest } = owner;
  if (id) {
    const { data, error } = await supabase
      .from('property_owners').update(rest).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('property_owners').insert([rest]).select().single();
  if (error) throw error;
  return data;
};

export const deleteOwner = async (id) => {
  const { error } = await supabase.from('property_owners').delete().eq('id', id);
  if (error) throw error;
};

export const getOwnerProperties = async (ownerId) => {
  const { data, error } = await supabase
    .from('properties').select('*').eq('owner_id', ownerId).order('title');
  if (error) throw error;
  return data ?? [];
};

export const getOwnerBookings = async (propertyIds) => {
  if (!propertyIds?.length) return [];
  const { data, error } = await supabase
    .from('bookings').select('*')
    .in('property_id', propertyIds)
    .order('checkin_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getOwnerMonthlyEarnings = (bookings, commissionPercent = 10) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const mb = bookings.filter(b => {
      if (!b.checkout_date || b.status !== 'completed') return false;
      const cd = new Date(b.checkout_date);
      return cd.getFullYear() === year && cd.getMonth() + 1 === month;
    });
    const gross = mb.reduce((s, b) => s + (b.total || 0), 0);
    const commission = Math.round(gross * commissionPercent / 100);
    months.push({ label, gross, commission, net: gross - commission, count: mb.length });
  }
  return months;
};

export const getPayouts = async (ownerId = null) => {
  let q = supabase
    .from('payouts')
    .select('*, property_owners(name, email)')
    .order('created_at', { ascending: false });
  if (ownerId) q = q.eq('owner_id', ownerId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

export const savePayout = async (payout) => {
  // eslint-disable-next-line no-unused-vars
  const { id, created_at, property_owners: _rel, ...rest } = payout;
  if (id) {
    const { data, error } = await supabase
      .from('payouts').update(rest).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('payouts').insert([rest]).select().single();
  if (error) throw error;
  return data;
};

export const markPayoutPaid = async (id, { payment_method, transaction_ref, notes }) => {
  const { data, error } = await supabase
    .from('payouts')
    .update({ status: 'paid', payment_method, transaction_ref, notes, paid_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data;
};
