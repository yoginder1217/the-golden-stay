import { supabase } from './supabase';

export const saveContactMessage = async ({ name, email, phone, message }) => {
  const { error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, phone, message }]);
  if (error) throw error;
};

export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};
