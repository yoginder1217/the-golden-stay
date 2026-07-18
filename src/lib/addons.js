import { supabase } from './supabase';

export const getActiveAddons = async () => {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
};

export const getAllAddons = async () => {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
};

export const saveAddon = async (addon) => {
  const { id, ...fields } = addon;
  const { data, error } = id
    ? await supabase.from('addons').update(fields).eq('id', id).select().single()
    : await supabase.from('addons').insert([fields]).select().single();
  if (error) throw error;
  return data;
};

export const deleteAddon = async (id) => {
  const { error } = await supabase.from('addons').delete().eq('id', id);
  if (error) throw error;
};

export const toggleAddonActive = async (id, isActive) => {
  const { error } = await supabase.from('addons').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
};
