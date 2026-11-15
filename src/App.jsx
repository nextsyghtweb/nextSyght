import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// The admin panel is only downloaded when someone visits /admin,
// so it adds nothing to the public site's load time.
const Admin = lazy(() => import('./pages/Admin'));

/**
 * Routes
 *   /       the public website
 *   /admin  the password-protected admin panel (not linked anywhere on the site)
 */
export default function App() {
  return (
    <ContentProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="grid min-h-screen place-items-center text-white/60">Loading…</div>}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ContentProvider>
  );
}
