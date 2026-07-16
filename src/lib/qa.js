import { supabase } from './supabase';

export const getPropertyQA = async (propertyId) => {
  const { data, error } = await supabase
    .from('property_qa')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const askQuestion = async ({ property_id, user_id, asker_name, question }) => {
  const { data, error } = await supabase
    .from('property_qa')
    .insert([{ property_id, user_id, asker_name, question }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const answerQuestion = async (id, answer) => {
  const { data, error } = await supabase
    .from('property_qa')
    .update({ answer, answered_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllQA = async () => {
  const { data, error } = await supabase
    .from('property_qa')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};
