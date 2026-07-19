import { supabase } from './supabase';

export const getPropertyAvailability = async (propertyId) => {
  const { data, error } = await supabase
    .from('property_availability')
    .select('checkin_date, checkout_date')
    .eq('property_id', propertyId);
  if (error) throw error;
  return data ?? [];
};

export const hasDateConflict = (bookedRanges, newCheckin, newCheckout) => {
  const newStart = new Date(newCheckin);
  const newEnd = new Date(newCheckout);
  return bookedRanges.some(({ checkin_date, checkout_date }) => {
    const bookedStart = new Date(checkin_date);
    const bookedEnd = new Date(checkout_date);
    return newStart < bookedEnd && newEnd > bookedStart;
  });
};

// Blocked dates — owner-controlled
export const getBlockedDates = async (propertyId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('property_id', propertyId)
    .gte('end_date', today)
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const addBlockedDate = async (propertyId, startDate, endDate, reason = '') => {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({ property_id: propertyId, start_date: startDate, end_date: endDate, reason })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeBlockedDate = async (id) => {
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
  if (error) throw error;
};

export const hasBlockedConflict = (blockedRanges, newCheckin, newCheckout) => {
  const newStart = new Date(newCheckin);
  const newEnd = new Date(newCheckout);
  return blockedRanges.some(({ start_date, end_date }) => {
    return newStart < new Date(end_date) && newEnd > new Date(start_date);
  });
};

// Returns a Set of property IDs that are unavailable for the given date range
export const getUnavailablePropertyIds = async (checkin, checkout) => {
  const [{ data: booked, error: e1 }, { data: blocked, error: e2 }] = await Promise.all([
    supabase
      .from('property_availability')
      .select('property_id')
      .lt('checkin_date', checkout)
      .gt('checkout_date', checkin),
    supabase
      .from('blocked_dates')
      .select('property_id')
      .lt('start_date', checkout)
      .gt('end_date', checkin),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return new Set([
    ...(booked || []).map(b => b.property_id),
    ...(blocked || []).map(b => b.property_id),
  ]);
};
