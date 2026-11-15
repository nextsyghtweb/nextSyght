import { lazy, Suspense, useState } from 'react';
import { detectCapability } from '../lib/device';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Projects from '../components/Projects';
import Process from '../components/Process';
import WhyUs from '../components/WhyUs';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import FallbackBackdrop from '../components/FallbackBackdrop';
import SceneBoundary from '../components/SceneBoundary';

// The Three.js scene is a separate, lazy-loaded chunk: it is only downloaded
// on devices that pass the capability check below.
const BackgroundScene = lazy(() => import('../components/three/BackgroundScene'));

/**
 * Home – the public one-page website.
 *
 * 3D vs fallback:
 *   - capability check runs once (WebGL, reduced motion, weak device, Data Saver)
 *   - if it fails, or the scene later runs too slowly / crashes, `use3D` flips
 *     to false and the lightweight CSS/SVG fallback takes over.
 */
export default function Home() {
  const [capability] = useState(detectCapability);
  const [use3D, setUse3D] = useState(capability.canRun3D);
  const fallback = () => setUse3D(false);

  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-navy-950">
      {/* Static page glow, always present (cheap) */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(60rem 40rem at 85% 0%, rgba(214,194,161,0.14), transparent 60%), radial-gradient(50rem 36rem at 0% 100%, rgba(245,237,224,0.1), transparent 60%)',
        }}
      />

      {use3D ? (
        <SceneBoundary onError={fallback}>
          <Suspense fallback={null}>
            <BackgroundScene isMobile={capability.isMobile} onFallback={fallback} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <FallbackBackdrop />
      )}

      <Navbar />
      <main className="relative z-10">
        <Hero fallback={!use3D} />
        <Services />
        <Projects />
        <Process />
        <WhyUs />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
