import { supabase } from './supabase';

export const saveBooking = async (booking) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getUserBookings = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
};
