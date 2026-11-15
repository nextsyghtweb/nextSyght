import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client.
 *
 * Reads the project URL and the public "anon" key from your .env file.
 * The anon key is meant to be public: what visitors can and cannot do is
 * controlled by Row Level Security policies (see supabase/schema.sql).
 *
 * If the variables are missing, `supabase` is null and the site simply runs
 * with the default content from src/data/defaults.js.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendConfigured = Boolean(url && anonKey);

export const supabase = isBackendConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/** Storage bucket (created by supabase/schema.sql) that holds project images. */
export const IMAGE_BUCKET = 'project-images';
