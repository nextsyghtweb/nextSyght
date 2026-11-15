import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * FpsGuard – safety net for slow devices.
 *
 * Measures the frame rate during the first couple of seconds. If the average
 * is below ~24 FPS it calls `onSlow`, and the page swaps the 3D scene for the
 * lightweight CSS fallback. It then stops measuring (zero ongoing cost).
 */
export default function FpsGuard({ onSlow }) {
  const stats = useRef({ frames: 0, time: 0, done: false });

  useFrame((_, delta) => {
    const s = stats.current;
    if (s.done) return;
    if (delta > 0.25) return; // ignore spikes caused by switching browser tabs

    s.frames += 1;
    if (s.frames <= 30) return; // warm-up: shaders compiling, textures uploading

    s.time += delta;
    if (s.frames >= 180) {
      s.done = true;
      const fps = (s.frames - 30) / s.time;
      if (fps < 24) onSlow();
    }
  });

  return null;
}
