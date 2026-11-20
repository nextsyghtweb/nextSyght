import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { getSupabaseServerClient } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('reviews')
      .select('id, name, business, rating, review_text, approved, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const business = typeof req.body.business === 'string' ? req.body.business.trim() : '';
  const reviewText = typeof req.body.review_text === 'string' ? req.body.review_text.trim() : '';
  const rating = Math.min(5, Math.max(1, parseInt(req.body.rating, 10) || 0));

  if (!name || !reviewText || !rating) {
    return res.status(400).json({ error: 'Name, rating and review text are required' });
  }

  try {
    const { data, error } = await getSupabaseServerClient()
      .from('reviews')
      .insert({
        name,
        business,
        rating,
        review_text: reviewText,
        approved: true
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', adminAuth, async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data: review, error: lookupError } = await supabase
      .from('reviews')
      .select('approved')
      .eq('id', req.params.id)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const approved = !review.approved;
    const { data, error } = await supabase
      .from('reviews')
      .update({ approved })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.json({ id: data.id, approved: data.approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await getSupabaseServerClient()
      .from('reviews')
      .delete()
      .eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
