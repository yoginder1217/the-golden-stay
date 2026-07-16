import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchSiteContent, CONTENT_DEFAULTS } from '../lib/siteContent';

const SiteContentContext = createContext(null);

export const SiteContentProvider = ({ children }) => {
  const [contentMap, setContentMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchSiteContent();
      setContentMap(data);
    } catch {
      // Supabase unavailable — fall through to defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // c('key') returns live value or hardcoded default
  const c = useCallback((key) => {
    return contentMap[key] !== undefined ? contentMap[key] : (CONTENT_DEFAULTS[key] ?? '');
  }, [contentMap]);

  // cJSON('key') parses JSON value, returns array/object or default
  const cJSON = useCallback((key) => {
    try {
      const raw = contentMap[key] !== undefined ? contentMap[key] : CONTENT_DEFAULTS[key];
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [contentMap]);

  // Update a single key in local state (called after admin saves)
  const setContent = useCallback((key, value) => {
    setContentMap(prev => ({ ...prev, [key]: value }));
  }, []);

  const reload = load;

  return (
    <SiteContentContext.Provider value={{ c, cJSON, setContent, reload, loaded, contentMap }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
};
