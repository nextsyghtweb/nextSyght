import express from 'express';
import multer from 'multer';
import path from 'path';
import { adminAuth } from '../middleware/adminAuth.js';
import { getSupabaseServerClient } from '../supabaseClient.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG or WEBP images are allowed'));
    }
    cb(null, true);
  }
});

function mapProject(row) {
  return {
    ...row,
    image_path: row.images?.[0] || null
  };
}

function getClient() {
  return getSupabaseServerClient();
}

async function uploadProjectImage(file) {
  const supabase = getClient();
  const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
  const objectName = `projects/${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

  const { error } = await supabase.storage
    .from('project-images')
    .upload(objectName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(objectName);

  return { url: data.publicUrl, objectName };
}

async function deleteProjectImage(imageUrl) {
  if (!imageUrl) return;
  const marker = '/storage/v1/object/public/project-images/';
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const objectName = decodeURIComponent(imageUrl.slice(index + marker.length));
  const { error } = await getClient().storage
    .from('project-images')
    .remove([objectName]);
  if (error) throw new Error(error.message);
}

// GET /api/projects — public, used by the site to render the portfolio grid
router.get('/', (req, res) => {
  try {
    getClient()
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json((data || []).map(mapProject));
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  } catch (configError) {
    res.status(500).json({ error: configError.message });
  }
});

// POST /api/projects — protected by Supabase Auth and the admin email allowlist
router.post('/', adminAuth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { title, description, category, project_url, location, status } = req.body;
    const priceValue = String(req.body.price || '').replace(/,/g, '').trim();
    const price = priceValue === '' ? null : Number(priceValue);
    if (priceValue !== '' && (!Number.isFinite(price) || price < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      let images = [];
      if (req.file) images = [(await uploadProjectImage(req.file)).url];

      const { data, error } = await getClient()
        .from('projects')
        .insert({
          title: title.trim(),
          description: description || '',
          category: category || '',
          project_url: project_url || '',
          location: location || '',
          price,
          status: status || 'active',
          images
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      res.status(201).json(mapProject(data));
    } catch (saveError) {
      res.status(500).json({ error: saveError.message });
    }
  });
});

// PUT /api/projects/:id — protected, edit text fields and optionally replace the image
router.put('/:id', adminAuth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { title, description, category, project_url, location, status } = req.body;
    const priceValue = String(req.body.price || '').replace(/,/g, '').trim();
    const price = priceValue === '' ? null : Number(priceValue);
    if (priceValue !== '' && (!Number.isFinite(price) || price < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      const supabase = getClient();
      const { data: existing, error: existingError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

      if (existingError) throw new Error(existingError.message);
      if (!existing) return res.status(404).json({ error: 'Project not found' });

      let images = existing.images || [];
      const oldImage = existing.images?.[0] || null;
      if (req.file) {
        const uploaded = await uploadProjectImage(req.file);
        images = [uploaded.url];
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          title: title.trim(),
          description: description || '',
          category: category || '',
          project_url: project_url || '',
          location: location || '',
          price,
          status: status || 'active',
          images
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (req.file) await deleteProjectImage(oldImage);
      res.json(mapProject(data));
    } catch (saveError) {
      res.status(500).json({ error: saveError.message });
    }
  });
});

// DELETE /api/projects/:id — protected
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: project, error: existingError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
    if (error) throw new Error(error.message);

    await deleteProjectImage(project.images?.[0]);
    res.status(204).end();
  } catch (deleteError) {
    res.status(500).json({ error: deleteError.message });
  }
});

export default router;
