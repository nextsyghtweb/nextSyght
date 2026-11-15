import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../context/ContentContext';
import { SERVICE_ICON_KEYS } from '../../config/site';
import Icon from '../../components/Icons';
import { Notice, TextArea, TextInput, Field } from './AdminUI';

/** Move an item up (-1) or down (+1) in an array, returning a new array. */
function move(list, index, dir) {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/**
 * SettingsEditor – edits everything stored in the single `site_settings` row:
 * contact details, social links, hero text, services and testimonials.
 * Press "Save changes" and the data is written to Supabase, so it shows for every visitor.
 */
export default function SettingsEditor({ section }) {
  const { settings, refresh } = useContent();
  const [draft, setDraft] = useState(() => structuredClone(settings));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const update = (group, key, value) => setDraft((d) => ({ ...d, [group]: { ...d[group], [key]: value } }));
  const setList = (group, list) => setDraft((d) => ({ ...d, [group]: list }));
  const editItem = (group, i, key, value) =>
    setList(group, draft[group].map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));

  const save = async () => {
    setSaving(true);
    setNotice(null);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, data: draft, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      setNotice({ type: 'error', text: `Could not save: ${error.message}. (Is this the admin email set in schema.sql?)` });
    } else {
      setNotice({ type: 'ok', text: 'Saved! The live website now shows your changes.' });
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      {section === 'contact' && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Phone number" value={draft.contact.phone} onChange={(v) => update('contact', 'phone', v)} placeholder="+91 98765 43210" />
            <TextInput
              label="Second phone number (optional)"
              hint="Leave empty to hide it"
              value={draft.contact.phone2}
              onChange={(v) => update('contact', 'phone2', v)}
              placeholder="+91 98765 43210"
            />
            <TextInput
              label="WhatsApp number"
              hint="Country code + number, digits only. Example: 919876543210"
              value={draft.contact.whatsapp}
              onChange={(v) => update('contact', 'whatsapp', v)}
            />
            <TextInput
              label="Second WhatsApp number (optional)"
              hint="Digits only with country code. Leave empty to hide it"
              value={draft.contact.whatsapp2}
              onChange={(v) => update('contact', 'whatsapp2', v)}
            />
            <TextInput label="Email" type="email" value={draft.contact.email} onChange={(v) => update('contact', 'email', v)} />
            <TextInput label="Address" value={draft.contact.address} onChange={(v) => update('contact', 'address', v)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Instagram link" value={draft.social.instagram} onChange={(v) => update('social', 'instagram', v)} placeholder="https://instagram.com/yourname" />
            <TextInput label="LinkedIn link" value={draft.social.linkedin} onChange={(v) => update('social', 'linkedin', v)} placeholder="https://linkedin.com/in/yourname" />
          </div>
        </>
      )}

      {section === 'hero' && (
        <div className="grid gap-5">
          <TextInput label="Small label above headline" value={draft.hero.eyebrow} onChange={(v) => update('hero', 'eyebrow', v)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Headline" value={draft.hero.headline} onChange={(v) => update('hero', 'headline', v)} />
            <TextInput label="Headline (gradient part)" value={draft.hero.headlineAccent} onChange={(v) => update('hero', 'headlineAccent', v)} />
          </div>
          <TextArea label="Subtext" rows={4} value={draft.hero.subtext} onChange={(v) => update('hero', 'subtext', v)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Primary button text" value={draft.hero.ctaPrimary} onChange={(v) => update('hero', 'ctaPrimary', v)} />
            <TextInput label="Secondary button text" value={draft.hero.ctaSecondary} onChange={(v) => update('hero', 'ctaSecondary', v)} />
          </div>
        </div>
      )}

      {section === 'services' && (
        <ListEditor
          items={draft.services}
          addLabel="Add service"
          onAdd={() => setList('services', [...draft.services, { icon: 'globe', title: 'New service', description: '' }])}
          onMove={(i, d) => setList('services', move(draft.services, i, d))}
          onDelete={(i) => setList('services', draft.services.filter((_, idx) => idx !== i))}
          renderItem={(s, i) => (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field label="Icon">
                  <select className="input" value={s.icon} onChange={(e) => editItem('services', i, 'icon', e.target.value)}>
                    {SERVICE_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </Field>
                <TextInput label="Title" value={s.title} onChange={(v) => editItem('services', i, 'title', v)} />
              </div>
              <TextArea label="Description" value={s.description} onChange={(v) => editItem('services', i, 'description', v)} />
            </div>
          )}
        />
      )}

      {section === 'testimonials' && (
        <ListEditor
          items={draft.testimonials}
          addLabel="Add testimonial"
          onAdd={() => setList('testimonials', [...draft.testimonials, { name: 'Client Name', role: 'Company, Role', quote: '', rating: 5 }])}
          onMove={(i, d) => setList('testimonials', move(draft.testimonials, i, d))}
          onDelete={(i) => setList('testimonials', draft.testimonials.filter((_, idx) => idx !== i))}
          renderItem={(t, i) => (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <TextInput label="Name" value={t.name} onChange={(v) => editItem('testimonials', i, 'name', v)} />
                <TextInput label="Role / company" value={t.role} onChange={(v) => editItem('testimonials', i, 'role', v)} />
                <Field label="Stars">
                  <select className="input" value={t.rating ?? 5} onChange={(e) => editItem('testimonials', i, 'rating', Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
              </div>
              <TextArea label="Quote" rows={3} value={t.quote} onChange={(v) => editItem('testimonials', i, 'quote', v)} />
            </div>
          )}
        />
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-navy-900/95 p-4 backdrop-blur">
        <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <div className="min-w-0 flex-1"><Notice notice={notice} /></div>
      </div>
    </div>
  );
}

/** Generic editable list with add / move / delete controls. */
function ListEditor({ items, renderItem, onAdd, onMove, onDelete, addLabel }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">#{i + 1}</span>
            <div className="flex gap-2">
              <IconBtn label="Move up" icon="up" onClick={() => onMove(i, -1)} disabled={i === 0} />
              <IconBtn label="Move down" icon="down" onClick={() => onMove(i, 1)} disabled={i === items.length - 1} />
              <IconBtn
                label="Delete"
                icon="trash"
                danger
                onClick={() => window.confirm('Delete this item?') && onDelete(i)}
              />
            </div>
          </div>
          {renderItem(item, i)}
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-white/50">Nothing here yet.</p>}
      <button type="button" onClick={onAdd} className="btn-ghost">
        <Icon name="plus" className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

export function IconBtn({ label, icon, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 transition disabled:opacity-30 ${
        danger ? 'hover:border-red-400/60 hover:text-red-300' : 'hover:border-brand-cyan/60 hover:text-brand-cyan'
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}
