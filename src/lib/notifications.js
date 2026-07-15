import { supabase } from './supabase';

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
};

export const markAllRead = async (userId) => {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
};

export const markRead = async (id) => {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
};

export const createNotification = async ({ user_id, title, body, url = '/', type = 'info' }) => {
  const { error } = await supabase
    .from('notifications')
    .insert([{ user_id, title, body, url, type }]);
  if (error) throw error;
};
