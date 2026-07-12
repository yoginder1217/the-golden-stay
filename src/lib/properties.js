import { supabase } from './supabase';

export const getProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const getPropertyById = async (id) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createProperty = async (property) => {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProperty = async (id, updates) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProperty = async (id) => {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
};
