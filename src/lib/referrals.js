import { supabase } from './supabase';

const generateCode = (email) =>
  'TGS' + email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) +
  Math.random().toString(36).slice(2, 5).toUpperCase();

export const getOrCreateReferralCode = async (userId, email) => {
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (existing) return existing;

  const code = generateCode(email);
  const { data, error } = await supabase
    .from('referral_codes')
    .insert([{ user_id: userId, code }])
    .select()
    .single();
  if (error) throw error;
  return data;
};
