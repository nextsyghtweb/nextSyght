import { createClient } from '@supabase/supabase-js';

function getAllowedEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function adminAuth(req, res, next) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase server configuration is missing' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing Supabase access token' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired Supabase session' });
    }

    const email = (data.user.email || '').toLowerCase();
    const allowedEmails = getAllowedEmails();
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({ error: 'This account is not an allowed admin' });
    }

    req.adminUser = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Could not verify Supabase session' });
  }
}
