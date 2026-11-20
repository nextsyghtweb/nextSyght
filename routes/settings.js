import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { getSupabaseServerClient } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('site_settings')
      .select('phone_1, phone_2, whatsapp_number, email, address')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    res.json(data || {
      phone_1: '',
      phone_2: '',
      whatsapp_number: '',
      email: '',
      address: ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', adminAuth, async (req, res) => {
  const fields = ['phone_1', 'phone_2', 'whatsapp_number', 'email', 'address'];
  const update = {};
  for (const field of fields) {
    update[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : '';
  }

  try {
    const { data, error } = await getSupabaseServerClient()
      .from('site_settings')
      .upsert({ id: 1, ...update })
      .select('phone_1, phone_2, whatsapp_number, email, address')
      .single();

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
