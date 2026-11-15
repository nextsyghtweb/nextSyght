import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isBackendConfigured } from '../lib/supabase';
import { DEFAULT_SETTINGS, DEFAULT_PROJECTS } from '../data/defaults';

/**
 * ContentContext
 *
 * Loads the editable site content (settings + projects) from Supabase and
 * shares it with every component. Until the data arrives – or if the backend
 * is not configured – the defaults from src/data/defaults.js are used.
 */

const ContentContext = createContext(null);

/** Merge saved settings over the defaults so missing fields never break the UI. */
export function mergeSettings(saved) {
  const s = saved || {};
  return {
    contact: { ...DEFAULT_SETTINGS.contact, ...(s.contact || {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(s.social || {}) },
    hero: { ...DEFAULT_SETTINGS.hero, ...(s.hero || {}) },
    services: Array.isArray(s.services) ? s.services : DEFAULT_SETTINGS.services,
    testimonials: Array.isArray(s.testimonials) ? s.testimonials : DEFAULT_SETTINGS.testimonials,
  };
}

function normalizeProject(p) {
  return {
    id: p.id,
    title: p.title || '',
    description: p.description || '',
    category: p.category || 'websites',
    tags: Array.isArray(p.tags) ? p.tags : [],
    link: p.link || '',
    image_url: p.image_url || '',
    sort_order: Number.isFinite(p.sort_order) ? p.sort_order : 0,
  };
}

export function ContentProvider({ children }) {
  const [settings, setSettings] = useState(() => mergeSettings(null));
  // With a backend we start empty (and show skeletons); without one we show the samples.
  const [projects, setProjects] = useState(isBackendConfigured ? [] : DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(isBackendConfigured);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    try {
      const [settingsRes, projectsRes] = await Promise.all([
        supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
        supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
      ]);
      if (settingsRes.error) throw settingsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setSettings(mergeSettings(settingsRes.data?.data));
      setProjects((projectsRes.data || []).map(normalizeProject));
      setError(null);
    } catch (err) {
      // If the database isn't reachable or the schema hasn't been run yet,
      // fall back to the sample content so the public site never looks broken.
      console.error('[Nextsyght] Could not load content from Supabase:', err);
      setError(err.message || 'Failed to load content');
      setProjects(DEFAULT_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ settings, projects, loading, error, refresh: load, configured: isBackendConfigured }),
    [settings, projects, loading, error, load]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx;
}
