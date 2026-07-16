import { supabase } from './supabase';

export const subscribeNewsletter = async (email, name = '') => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email, name }]);
  if (error) {
    if (error.code === '23505') throw new Error('already_subscribed');
    throw error;
  }
};
