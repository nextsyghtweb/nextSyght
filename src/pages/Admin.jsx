import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isBackendConfigured } from '../lib/supabase';
import { usePageMeta } from '../lib/hooks';
import Logo from '../components/Logo';
import SettingsEditor from './admin/SettingsEditor';
import ProjectsManager from './admin/ProjectsManager';
import { Notice, TextInput } from './admin/AdminUI';

const TABS = [
  { id: 'contact', label: 'Contact & Social' },
  { id: 'hero', label: 'Hero text' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Projects' },
  { id: 'testimonials', label: 'Testimonials' },
];

/**
 * Admin – hidden at /admin (not linked anywhere, and marked noindex).
 *
 * Login uses Supabase Auth (email + password). The real protection is on the
 * server: Row Level Security only lets YOUR admin email change data, so even
 * if someone found this page, they could not save anything.
 */
export default function Admin() {
  usePageMeta('Admin | Nextsyght', true);

  const [session, setSession] = useState(undefined); // undefined = still checking
  const [tab, setTab] = useState('contact');

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isBackendConfigured) return <NotConfigured />;
  if (session === undefined) return <div className="grid min-h-screen place-items-center text-white/60">Loading…</div>;
  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-white/10 bg-navy-900/80">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo href="/" />
            <span className="chip hidden sm:inline-flex">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-white/70 hover:text-white">View site</Link>
            <button type="button" className="btn-ghost !px-4 !py-2" onClick={() => supabase.auth.signOut()}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="container-x py-8">
        <div role="tablist" aria-label="Admin sections" className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'border-transparent bg-brand-gradient text-white shadow-glow'
                  : 'border-white/15 bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          {/* key = tab, so each editor starts fresh from the latest saved data */}
          {tab === 'projects' ? <ProjectsManager /> : <SettingsEditor key={tab} section={tab} />}
        </div>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError({ type: 'error', text: 'Incorrect email or password.' });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 px-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
        <div className="text-center"><Logo href="/" className="justify-center" /></div>
        <h1 className="text-center text-lg font-semibold">Admin login</h1>
        <TextInput label="Email" type="email" required autoComplete="username" value={email} onChange={setEmail} />
        <TextInput label="Password" type="password" required autoComplete="current-password" value={password} onChange={setPassword} />
        <Notice notice={error} />
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 px-5">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold">Backend not connected yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Add <code className="text-brand-cyan">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-brand-cyan">VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file (and to
          Vercel/Netlify), then redeploy. Step-by-step instructions are in the README.
        </p>
        <Link to="/" className="btn-ghost mt-6">Back to site</Link>
      </div>
    </div>
  );
}
