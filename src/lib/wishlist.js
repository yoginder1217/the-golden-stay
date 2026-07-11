import { supabase } from './supabase';

export const getUserWishlist = async (userId) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const addToWishlist = async (userId, property) => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert([{
      user_id: userId,
      property_id: property.id,
      property_title: property.title,
      property_location: property.location,
      property_image: property.image,
      property_price: property.price,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeFromWishlist = async (userId, propertyId) => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);
  if (error) throw error;
};

export const checkIsWishlisted = async (userId, propertyId) => {
  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();
  return !!data;
};
