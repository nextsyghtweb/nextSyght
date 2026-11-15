import { useState } from 'react';
import { supabase, IMAGE_BUCKET } from '../../lib/supabase';
import { useContent } from '../../context/ContentContext';
import { PROJECT_CATEGORIES } from '../../config/site';
import { parseTags } from '../../lib/utils';
import Icon from '../../components/Icons';
import { Field, Notice, TextArea, TextInput } from './AdminUI';
import { IconBtn } from './SettingsEditor';

const BLANK = { id: null, title: '', description: '', category: 'websites', tagsText: '', link: '', image_url: '' };
const MAX_IMAGE_MB = 5;

/**
 * ProjectsManager – add, edit, delete and reorder portfolio projects.
 * Images are uploaded to the public Supabase Storage bucket "project-images".
 */
export default function ProjectsManager() {
  const { projects, refresh } = useContent();
  const [form, setForm] = useState(null); // null = list view, object = add/edit form
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  // Sample projects (shown when the database is empty/unreachable) have non-UUID ids and can't be edited.
  const isReal = (p) => !String(p.id).startsWith('sample-');

  const startEdit = (p) =>
    setForm({ ...BLANK, ...p, tagsText: (p.tags || []).join(', ') });

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setNotice({ type: 'error', text: 'Please choose an image file.' });
    if (file.size > MAX_IMAGE_MB * 1024 * 1024)
      return setNotice({ type: 'error', text: `Image is too large. Max ${MAX_IMAGE_MB} MB.` });

    setBusy(true);
    setNotice(null);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { cacheControl: '31536000' });
    if (error) {
      setBusy(false);
      return setNotice({ type: 'error', text: `Upload failed: ${error.message}` });
    }
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setBusy(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);

    const row = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      tags: parseTags(form.tagsText),
      link: form.link.trim(),
      image_url: form.image_url,
    };

    let error;
    if (form.id && isReal(form)) {
      ({ error } = await supabase.from('projects').update(row).eq('id', form.id));
    } else {
      // New projects go to the end of the list
      const nextOrder = projects.reduce((m, p) => Math.max(m, p.sort_order || 0), 0) + 1;
      ({ error } = await supabase.from('projects').insert({ ...row, sort_order: nextOrder }));
    }
    setBusy(false);

    if (error) return setNotice({ type: 'error', text: `Could not save: ${error.message}` });
    await refresh();
    setForm(null);
    setNotice({ type: 'ok', text: 'Project saved. It is now live on your website.' });
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await supabase.from('projects').delete().eq('id', p.id);
    setBusy(false);
    if (error) return setNotice({ type: 'error', text: `Could not delete: ${error.message}` });
    await refresh();
    setNotice({ type: 'ok', text: 'Project deleted.' });
  };

  /** Swap sort_order with the neighbour above/below. */
  const reorder = async (index, dir) => {
    const a = projects[index];
    const b = projects[index + dir];
    if (!a || !b || !isReal(a) || !isReal(b)) return;
    // If both have the same order value, spread them first so the swap is visible
    const aOrder = a.sort_order === b.sort_order ? index + dir + 1 : b.sort_order;
    const bOrder = a.sort_order === b.sort_order ? index + 1 : a.sort_order;
    setBusy(true);
    const results = await Promise.all([
      supabase.from('projects').update({ sort_order: aOrder }).eq('id', a.id),
      supabase.from('projects').update({ sort_order: bOrder }).eq('id', b.id),
    ]);
    setBusy(false);
    const err = results.find((r) => r.error)?.error;
    if (err) return setNotice({ type: 'error', text: err.message });
    refresh();
  };

  // ---------------- Add / edit form ----------------
  if (form) {
    return (
      <form onSubmit={save} className="space-y-5">
        <h2 className="text-xl font-semibold">{form.id ? 'Edit project' : 'Add project'}</h2>

        <TextInput label="Title *" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <TextArea label="Description" rows={4} value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category (used by the filter buttons)">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {PROJECT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <TextInput label="Tags" hint="Separate with commas: React, Tailwind, SEO" value={form.tagsText} onChange={(v) => setForm({ ...form, tagsText: v })} />
        </div>

        <TextInput label="Project link" type="url" placeholder="https://client-website.com" value={form.link} onChange={(v) => setForm({ ...form, link: v })} />

        <Field label="Image" hint={`JPG, PNG or WebP, up to ${MAX_IMAGE_MB} MB. A 16:10 screenshot looks best.`}>
          <div className="flex flex-wrap items-center gap-4">
            {form.image_url && (
              <img src={form.image_url} alt="Selected project preview" className="h-20 w-32 rounded-lg border border-white/10 object-cover" />
            )}
            <label className="btn-ghost cursor-pointer">
              <Icon name="upload" className="h-4 w-4" />
              {form.image_url ? 'Replace image' : 'Upload image'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadImage(e.target.files?.[0])} />
            </label>
          </div>
        </Field>

        <Notice notice={notice} />
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? 'Working…' : 'Save project'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => { setForm(null); setNotice(null); }}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // ---------------- List ----------------
  const showingSamples = projects.length > 0 && projects.every((p) => !isReal(p));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">{projects.length} project{projects.length === 1 ? '' : 's'}</p>
        <button type="button" className="btn-primary" onClick={() => { setNotice(null); setForm({ ...BLANK }); }}>
          <Icon name="plus" className="h-4 w-4" /> Add project
        </button>
      </div>

      {showingSamples && (
        <Notice notice={{ type: 'error', text: 'These are built-in samples, not database rows. Run supabase/schema.sql (see README) to create the tables, then they become editable.' }} />
      )}
      <Notice notice={notice} />

      <ul className="space-y-3">
        {projects.map((p, i) => (
          <li key={p.id} className="card flex flex-wrap items-center gap-4 p-4">
            {p.image_url ? (
              <img src={p.image_url} alt={`${p.title} thumbnail`} className="h-16 w-24 rounded-lg border border-white/10 object-cover" />
            ) : (
              <div className="grid h-16 w-24 place-items-center rounded-lg bg-white/5 text-white/30"><Icon name="app" /></div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.title}</p>
              <p className="truncate text-xs text-white/50">
                {PROJECT_CATEGORIES.find((c) => c.value === p.category)?.label} · {p.tags.join(', ') || 'no tags'}
              </p>
            </div>
            <div className="flex gap-2">
              <IconBtn label="Move up" icon="up" disabled={i === 0 || busy || !isReal(p)} onClick={() => reorder(i, -1)} />
              <IconBtn label="Move down" icon="down" disabled={i === projects.length - 1 || busy || !isReal(p)} onClick={() => reorder(i, 1)} />
              <IconBtn label="Edit" icon="edit" disabled={!isReal(p)} onClick={() => { setNotice(null); startEdit(p); }} />
              <IconBtn label="Delete" icon="trash" danger disabled={!isReal(p) || busy} onClick={() => remove(p)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
