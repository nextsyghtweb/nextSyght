import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import HeroEye from './HeroEye';
import Particles from './Particles';
import FloatingShapes from './FloatingShapes';
import FpsGuard from './FpsGuard';

/**
 * BackgroundScene – ONE fixed, full-screen WebGL canvas behind the whole page.
 *
 * Using a single canvas (instead of one per section) keeps things fast:
 * it holds the hero eye, the particle field and the floating shapes.
 *
 * It tracks the mouse and scroll position with plain window listeners and
 * shares them with the 3D objects through refs (no React re-renders per frame).
 * The canvas has pointer-events: none, so it never blocks clicks on the page.
 *
 * This file is lazy-loaded (see pages/Home.jsx), so the Three.js bundle is only
 * downloaded when the device is able to run it.
 */
export default function BackgroundScene({ isMobile, onFallback }) {
  // Normalised pointer position (-1..1) and the time it last moved
  const pointer = useRef({ x: 0, y: 0, last: 0 });
  // Scroll distance in pixels, and in "screens" (progress = 1 means one screen scrolled)
  const scroll = useRef({ y: 0, progress: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.last = performance.now();
    };
    const onScroll = () => {
      scroll.current.y = window.scrollY;
      scroll.current.progress = window.scrollY / window.innerHeight;
    };

    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 60 }}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // transparent: the navy page background shows through
          // If the browser kills the WebGL context (low memory, GPU reset), use the fallback.
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onFallback();
          });
        }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[-4, 3, 5]} intensity={60} color="#22d3ee" />
        <pointLight position={[4, -2, 5]} intensity={60} color="#8b5cf6" />

        <Particles count={isMobile ? 220 : 650} scroll={scroll} />
        <FloatingShapes count={isMobile ? 5 : 9} pointer={pointer} scroll={scroll} />
        <HeroEye pointer={pointer} scroll={scroll} isMobile={isMobile} />

        <FpsGuard onSlow={onFallback} />
      </Canvas>
    </div>
  );
}
