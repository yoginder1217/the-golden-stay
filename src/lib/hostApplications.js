/*
  Run this SQL once in your Supabase SQL editor:

  create table host_applications (
    id            serial primary key,
    created_at    timestamptz default now(),
    status        text default 'pending',   -- pending | reviewing | approved | rejected
    full_name     text not null,
    email         text not null,
    phone         text not null,
    property_name text not null,
    property_type text not null,
    city          text not null,
    state         text,
    address       text,
    bedrooms      integer,
    bathrooms     integer,
    max_guests    integer,
    expected_price integer,
    description   text,
    amenities     text[],
    image_url     text,
    notes         text,
    user_id       uuid references auth.users(id)
  );

  -- RLS: allow public insert; reads restricted to the row's owner
  alter table host_applications enable row level security;
  create policy "public_insert" on host_applications for insert with check (true);
  create policy "owner_select"  on host_applications for select using (auth.uid() = user_id);
*/

import { supabase } from './supabase';

export const submitHostApplication = async (payload) => {
  const { data, error } = await supabase
    .from('host_applications')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getHostApplications = async () => {
  const { data, error } = await supabase
    .from('host_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const updateApplicationStatus = async (id, status) => {
  const { error } = await supabase
    .from('host_applications')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};
