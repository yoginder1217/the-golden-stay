import { supabase } from './supabase';

export const getPropertyReviews = async (propertyId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getAllReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getUserReview = async (userId, propertyId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const submitReview = async (review) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();
  if (error) throw error;

  // Recompute avg rating on the property
  const { data: all } = await supabase
    .from('reviews')
    .select('rating')
    .eq('property_id', review.property_id);
  if (all?.length) {
    const avg = Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10;
    await supabase.from('properties').update({ rating: avg, review_count: all.length }).eq('id', review.property_id);
  }

  // Mark any matching bookings as reviewed so the dashboard prompt disappears
  await supabase
    .from('bookings')
    .update({ reviewed: true })
    .eq('user_id', review.user_id)
    .eq('property_id', review.property_id)
    .neq('status', 'cancelled');

  return data;
};

export const deleteReview = async (id) => {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
};
