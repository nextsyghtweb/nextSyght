import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { getSupabaseServerClient } from '../supabaseClient.js';

const router = express.Router();

// POST /api/admin/verify — the admin page calls this once on login.
// If adminAuth lets the request through, the token is correct.
router.post('/verify', adminAuth, (req, res) => {
  res.json({ ok: true });
});

// GET /api/admin/stats — small dashboard summary
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { count: projectCount, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);

    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);
    const { count: enquiryCount } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true });
    const { data: reviewRows } = await supabase
      .from('reviews')
      .select('rating')
      .eq('approved', true);
    const ratings = reviewRows || [];
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((sum, row) => sum + row.rating, 0) / ratings.length) * 10) / 10
      : null;

    res.json({
      projectCount: projectCount || 0,
      reviewCount: reviewCount || 0,
      pendingCount: pendingCount || 0,
      enquiryCount: enquiryCount || 0,
      avgRating
    });
  } catch (statsError) {
    res.status(500).json({ error: statsError.message });
  }
});

export default router;
