import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { getSupabaseServerClient } from '../supabaseClient.js';

const router = express.Router();
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entries = (attempts.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (entries.length >= LIMIT) {
    attempts.set(ip, entries);
    return true;
  }
  entries.push(now);
  attempts.set(ip, entries);
  return false;
}

router.post('/', async (req, res) => {
  if (req.body.website) {
    return res.status(400).json({ error: 'Submission rejected' });
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many enquiries. Please try again later.' });
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const projectId = typeof req.body.project_id === 'string' ? req.body.project_id.trim() : '';

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^\+?[0-9\s()-]{7,20}$/.test(phone)) return res.status(400).json({ error: 'Please enter a valid phone number.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (message.length < 10) return res.status(400).json({ error: 'Please enter a message of at least 10 characters.' });

  let saved;
  try {
    const supabase = getSupabaseServerClient();
    const payload = {
      name,
      phone,
      email,
      message,
      project_id: projectId || null
    };

    const { data, error } = await supabase
      .from('enquiries')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    saved = data;
  } catch (err) {
    return res.status(500).json({ error: `Could not save enquiry: ${err.message}` });
  }

  const endpoint = process.env.FORMSPREE_ENDPOINT;
  let forwarded = true;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message, project_id: projectId || '' })
      });
      forwarded = response.ok;
    } catch {
      forwarded = false;
    }
  } else {
    forwarded = false;
  }

  res.status(201).json({
    id: saved.id,
    forwarded,
    message: forwarded
      ? 'Thank you! Your enquiry has been sent.'
      : 'Thank you! Your enquiry was saved; email forwarding is not configured.'
  });
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/read', adminAuth, async (req, res) => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('enquiries')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await getSupabaseServerClient()
      .from('enquiries')
      .delete()
      .eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
