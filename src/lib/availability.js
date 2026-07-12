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
