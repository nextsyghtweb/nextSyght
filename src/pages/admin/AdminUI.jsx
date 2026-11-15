/** Small shared form pieces for the admin panel. */

export function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-white/45">{hint}</p>}
    </div>
  );
}

export function TextInput({ label, hint, value, onChange, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props} />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 3 }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className="input resize-y" rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

/** Green/red message bar. `notice` = { type: 'ok' | 'error', text } */
export function Notice({ notice }) {
  if (!notice) return null;
  const ok = notice.type === 'ok';
  return (
    <p
      role={ok ? 'status' : 'alert'}
      className={`rounded-xl border px-4 py-3 text-sm ${
        ok ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'
      }`}
    >
      {notice.text}
    </p>
  );
}
