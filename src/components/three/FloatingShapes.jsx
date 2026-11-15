import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FloatingShapes – translucent geometric shapes drifting in the background.
 *
 * Each shape has its own depth, speed and colour. They bob and rotate, react
 * slightly to the mouse (parallax) and move at different speeds while you
 * scroll. When a shape leaves the top of the screen it re-enters at the bottom.
 */

const SHAPE_TYPES = ['ico', 'octa', 'torus', 'box', 'tetra'];
const COLORS = ['#D6C2A1', '#F5EDE0'];

/** Deterministic pseudo-random numbers so the layout is the same on every load. */
function makeConfigs(count) {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, (_, i) => ({
    type: SHAPE_TYPES[i % SHAPE_TYPES.length],
    nx: rnd() * 2 - 1, // horizontal position, -1..1
    by: rnd() * 2 - 1, // starting height, -1..1
    z: -1 - rnd() * 5, // depth
    size: 0.28 + rnd() * 0.4,
    speed: 0.15 + rnd() * 0.35,
    depth: 0.15 + rnd() * 0.35, // how strongly it reacts to scroll / mouse
    color: COLORS[i % COLORS.length],
    wire: i % 2 === 0,
    phase: rnd() * 10,
  }));
}

function ShapeGeometry({ type }) {
  switch (type) {
    case 'ico':
      return <icosahedronGeometry args={[1, 0]} />;
    case 'octa':
      return <octahedronGeometry args={[1, 0]} />;
    case 'torus':
      return <torusGeometry args={[0.8, 0.28, 12, 32]} />;
    case 'box':
      return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    default:
      return <tetrahedronGeometry args={[1.1, 0]} />;
  }
}

export default function FloatingShapes({ count, pointer, scroll }) {
  const { viewport } = useThree();
  const configs = useMemo(() => makeConfigs(count), [count]);
  const refs = useRef([]);
  const parallax = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const W = viewport.width;
    const H = viewport.height;
    const prog = scroll.current.progress;

    // Smoothed mouse position for parallax
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, pointer.current.x, 3, delta);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, pointer.current.y, 3, delta);

    configs.forEach((c, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;

      const perspective = 1 + -c.z / 8; // deeper shapes cover a larger area
      const range = H * perspective * 1.4;
      const rawY = c.by * range * 0.5 + prog * H * c.depth + Math.sin(t * c.speed + c.phase) * 0.25;
      const y = ((((rawY + range / 2) % range) + range) % range) - range / 2; // wrap into [-range/2, range/2]

      mesh.position.set(
        c.nx * W * 0.5 * perspective * 0.95 +
          Math.cos(t * c.speed * 0.8 + c.phase) * 0.2 +
          parallax.current.x * c.depth * 0.8,
        y + parallax.current.y * c.depth * 0.5,
        c.z
      );
      mesh.rotation.x = t * c.speed * 0.8 + c.phase;
      mesh.rotation.y = t * c.speed;
      mesh.scale.setScalar(c.size);
    });
  });

  return (
    <group>
      {configs.map((c, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <ShapeGeometry type={c.type} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={0.6}
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0.5}
            wireframe={c.wire}
          />
        </mesh>
      ))}
    </group>
  );
}
