import { createClient } from '@supabase/supabase-js';
import { knowledgeBase } from '../../rag/knowledgeBase.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

function getSupabase(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server configuration is missing');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function adminAuth(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) return { error: json({ error: 'Missing Supabase access token' }, 401) };

  try {
    const supabase = getSupabase(env);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { error: json({ error: 'Invalid or expired Supabase session' }, 401) };
    }

    const allowedEmails = (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const email = (data.user.email || '').toLowerCase();
    if (!allowedEmails.includes(email)) {
      return { error: json({ error: 'This account is not an allowed admin' }, 403) };
    }
    return { supabase };
  } catch (error) {
    return { error: json({ error: error.message }, error.message.includes('configuration') ? 500 : 401) };
  }
}

async function readRequestJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function uploadProjectImage(supabase, file) {
  if (!file || typeof file.arrayBuffer !== 'function') return null;

  const extension = file.name?.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    : '.jpg';
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
    throw new Error('Only JPG, PNG or WEBP images are allowed');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be 5 MB or smaller');
  }

  const objectName = `projects/${Date.now()}-${crypto.randomUUID()}${extension}`;
  const { error } = await supabase.storage
    .from('project-images')
    .upload(objectName, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false
    });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(objectName);
  return { url: data.publicUrl, objectName };
}

async function deleteProjectImage(supabase, imageUrl) {
  if (!imageUrl) return;
  const marker = '/storage/v1/object/public/project-images/';
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;
  const objectName = decodeURIComponent(imageUrl.slice(index + marker.length));
  await supabase.storage.from('project-images').remove([objectName]);
}

function mapProject(row) {
  return { ...row, image_path: row?.images?.[0] || null };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (path === '/health' && method === 'GET') return json({ status: 'ok' });

  if (path === '/config' && method === 'GET') {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json({ error: 'Supabase public configuration is missing' }, 500);
    }
    return json({
      supabaseUrl: env.SUPABASE_URL,
      supabaseAnonKey: env.SUPABASE_ANON_KEY
    });
  }

  try {
    if (path === '/projects' && method === 'GET') {
      const supabase = getSupabase(env);
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return json((data || []).map(mapProject));
    }

    if (path === '/projects' && method === 'POST') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const form = await request.formData();
      const title = String(form.get('title') || '').trim();
      if (!title) return json({ error: 'Title is required' }, 400);

      const priceValue = String(form.get('price') || '').replace(/,/g, '').trim();
      const price = priceValue === '' ? null : Number(priceValue);
      if (priceValue !== '' && (!Number.isFinite(price) || price < 0)) {
        return json({ error: 'Price must be a valid positive number' }, 400);
      }

      let images = [];
      const file = form.get('image');
      if (file && typeof file.arrayBuffer === 'function') {
        const uploaded = await uploadProjectImage(auth.supabase, file);
        images = [uploaded.url];
      }

      const payload = {
        title,
        description: String(form.get('description') || ''),
        category: String(form.get('category') || ''),
        project_url: String(form.get('project_url') || ''),
        location: String(form.get('location') || ''),
        price,
        status: String(form.get('status') || 'active')
      };

      const { data, error } = await auth.supabase.from('projects').insert({ ...payload, images }).select().single();
      if (error) throw new Error(error.message);
      return json(mapProject(data), 201);
    }

    const projectPutMatch = path.match(/^\/projects\/([^/]+)$/);
    if (projectPutMatch && method === 'PUT') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const form = await request.formData();
      const title = String(form.get('title') || '').trim();
      if (!title) return json({ error: 'Title is required' }, 400);

      const priceValue = String(form.get('price') || '').replace(/,/g, '').trim();
      const price = priceValue === '' ? null : Number(priceValue);
      if (priceValue !== '' && (!Number.isFinite(price) || price < 0)) {
        return json({ error: 'Price must be a valid positive number' }, 400);
      }

      const { data: existing, error: existingError } = await auth.supabase
        .from('projects')
        .select('*')
        .eq('id', projectPutMatch[1])
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);
      if (!existing) return json({ error: 'Project not found' }, 404);

      let images = existing.images || [];
      const oldImage = existing.images?.[0] || null;
      const file = form.get('image');
      if (file && typeof file.arrayBuffer === 'function') {
        const uploaded = await uploadProjectImage(auth.supabase, file);
        images = [uploaded.url];
      }

      const payload = {
        title,
        description: String(form.get('description') || ''),
        category: String(form.get('category') || ''),
        project_url: String(form.get('project_url') || ''),
        location: String(form.get('location') || ''),
        price,
        status: String(form.get('status') || 'active'),
        images
      };
      const { data, error } = await auth.supabase
        .from('projects')
        .update(payload)
        .eq('id', projectPutMatch[1])
        .select()
        .single();
      if (error) throw new Error(error.message);
      if (file && typeof file.arrayBuffer === 'function') await deleteProjectImage(auth.supabase, oldImage);
      return json(mapProject(data));
    }

    const projectMatch = path.match(/^\/projects\/([^/]+)$/);
    if (projectMatch && method === 'DELETE') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { data: project, error: lookupError } = await auth.supabase.from('projects').select('*').eq('id', projectMatch[1]).maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (!project) return json({ error: 'Project not found' }, 404);
      const { error } = await auth.supabase.from('projects').delete().eq('id', projectMatch[1]);
      if (error) throw new Error(error.message);
      await deleteProjectImage(auth.supabase, project.images?.[0]);
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (path === '/settings' && method === 'GET') {
      const supabase = getSupabase(env);
      const { data, error } = await supabase.from('site_settings').select('phone_1, phone_2, whatsapp_number, email, address').eq('id', 1).maybeSingle();
      if (error) throw new Error(error.message);
      return json(data || { phone_1: '', phone_2: '', whatsapp_number: '', email: '', address: '' });
    }
    if (path === '/settings' && method === 'PUT') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const body = await readRequestJson(request);
      const fields = ['phone_1', 'phone_2', 'whatsapp_number', 'email', 'address'];
      const update = { id: 1 };
      for (const field of fields) update[field] = typeof body[field] === 'string' ? body[field].trim() : '';
      const { data, error } = await auth.supabase.from('site_settings').upsert(update).select('phone_1, phone_2, whatsapp_number, email, address').single();
      if (error) throw new Error(error.message);
      return json(data);
    }

    if (path === '/reviews' && method === 'GET') {
      const supabase = getSupabase(env);
      const { data, error } = await supabase.from('reviews').select('id, name, business, rating, review_text, approved, created_at').eq('approved', true).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return json(data || []);
    }
    if (path === '/reviews/all' && method === 'GET') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { data, error } = await auth.supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return json(data || []);
    }
    if (path === '/reviews' && method === 'POST') {
      const body = await readRequestJson(request);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const business = typeof body.business === 'string' ? body.business.trim() : '';
      const reviewText = typeof body.review_text === 'string' ? body.review_text.trim() : '';
      const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 0));
      if (!name || !reviewText || !rating) return json({ error: 'Name, rating and review text are required' }, 400);
      const supabase = getSupabase(env);
      const { data, error } = await supabase.from('reviews').insert({ name, business, rating, review_text: reviewText, approved: true }).select().single();
      if (error) throw new Error(error.message);
      return json({ id: data.id }, 201);
    }
    const reviewMatch = path.match(/^\/reviews\/([^/]+)$/);
    if (reviewMatch && method === 'DELETE') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { error } = await auth.supabase.from('reviews').delete().eq('id', reviewMatch[1]);
      if (error) throw new Error(error.message);
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    const approveMatch = path.match(/^\/reviews\/([^/]+)\/approve$/);
    if (approveMatch && method === 'PATCH') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { data: review, error: lookupError } = await auth.supabase.from('reviews').select('approved').eq('id', approveMatch[1]).maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (!review) return json({ error: 'Review not found' }, 404);
      const approved = !review.approved;
      const { data, error } = await auth.supabase.from('reviews').update({ approved }).eq('id', approveMatch[1]).select().single();
      if (error) throw new Error(error.message);
      return json({ id: data.id, approved: data.approved });
    }

    if (path === '/enquiries' && method === 'POST') {
      const body = await readRequestJson(request);
      if (body.website) return json({ error: 'Submission rejected' }, 400);
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const projectId = typeof body.project_id === 'string' ? body.project_id.trim() : '';
      if (name.length < 2) return json({ error: 'Please enter your name.' }, 400);
      if (!/^\+?[0-9\s()-]{7,20}$/.test(phone)) return json({ error: 'Please enter a valid phone number.' }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
      if (message.length < 10) return json({ error: 'Please enter a message of at least 10 characters.' }, 400);

      const supabase = getSupabase(env);
      const { data: saved, error } = await supabase.from('enquiries').insert({ name, phone, email, message, project_id: projectId || null }).select().single();
      if (error) throw new Error(`Could not save enquiry: ${error.message}`);

      let forwarded = false;
      if (env.FORMSPREE_ENDPOINT) {
        try {
          const response = await fetch(env.FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, message, project_id: projectId || '' })
          });
          forwarded = response.ok;
        } catch {}
      }
      return json({
        id: saved.id,
        forwarded,
        message: forwarded
          ? 'Thank you! Your enquiry has been sent.'
          : 'Thank you! Your enquiry was saved; email forwarding is not configured.'
      }, 201);
    }
    if (path === '/enquiries' && method === 'GET') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { data, error } = await auth.supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return json(data || []);
    }
    const enquiryReadMatch = path.match(/^\/enquiries\/([^/]+)\/read$/);
    if (enquiryReadMatch && method === 'PATCH') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { data, error } = await auth.supabase.from('enquiries').update({ is_read: true }).eq('id', enquiryReadMatch[1]).select().single();
      if (error) throw new Error(error.message);
      return json(data);
    }
    const enquiryMatch = path.match(/^\/enquiries\/([^/]+)$/);
    if (enquiryMatch && method === 'DELETE') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const { error } = await auth.supabase.from('enquiries').delete().eq('id', enquiryMatch[1]);
      if (error) throw new Error(error.message);
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (path === '/admin/verify' && method === 'POST') {
      const auth = await adminAuth(request, env);
      return auth.error || json({ ok: true });
    }
    if (path === '/admin/stats' && method === 'GET') {
      const auth = await adminAuth(request, env);
      if (auth.error) return auth.error;
      const supabase = auth.supabase;
      const [{ count: projectCount }, { count: reviewCount }, { count: pendingCount }, { count: enquiryCount }, { data: reviewRows }] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('rating').eq('approved', true)
      ]);
      const ratings = reviewRows || [];
      const avgRating = ratings.length
        ? Math.round((ratings.reduce((sum, row) => sum + row.rating, 0) / ratings.length) * 10) / 10
        : null;
      return json({
        projectCount: projectCount || 0,
        reviewCount: reviewCount || 0,
        pendingCount: pendingCount || 0,
        enquiryCount: enquiryCount || 0,
        avgRating
      });
    }

    if (path === '/chat' && method === 'POST') {
      const body = await readRequestJson(request);
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!message) return json({ error: 'Message is required' }, 400);

      const query = message.toLowerCase();
      const matches = knowledgeBase
        .map((item) => {
          const words = query.split(/\W+/).filter((word) => word.length > 2);
          const score = words.reduce((sum, word) => sum + (item.text.toLowerCase().includes(word) ? 1 : 0), 0);
          return { ...item, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      const context = matches.map((item) => item.text).join('\n');

      if (env.AI) {
        try {
          const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              { role: 'system', content: 'Answer only from the provided context. Be concise and factual. If unsure, say to contact NextSyght directly.' },
              { role: 'user', content: `Context:\n${context}\n\nQuestion:\n${message}` }
            ]
          });
          const reply = typeof result.response === 'string'
            ? result.response.trim()
            : 'I could not generate a response.';
          return json({ reply, sources: matches.map((item) => item.id) });
        } catch (error) {
          return json({ error: `Chat engine unavailable: ${error.message}` }, 503);
        }
      }

      const reply = matches[0]?.score
        ? matches.slice(0, 2).map((item) => item.text).join(' ')
        : 'I am not sure from the available information. Please contact NextSyght directly for help.';
      return json({ reply, sources: matches.filter((item) => item.score).map((item) => item.id) });
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[pages-api]', error);
    return json({ error: error.message || 'Request failed' }, 500);
  }
}
