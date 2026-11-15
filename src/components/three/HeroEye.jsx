import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * HeroEye – the interactive 3D hero element.
 *
 * A glowing eye flanked by "<" and ">" angle brackets (the Nextsyght logo, in 3D).
 *  - The iris/pupil follow the mouse (or a finger on touch screens).
 *  - When the pointer is idle the eye wanders on its own.
 *  - It turns, drifts upward and shrinks away as you scroll past the hero.
 *  - It blinks every few seconds.
 *
 * Positioning is computed from the viewport so it sits on the right on wide
 * screens and above the headline on phones.
 */

const COLORS = { cyan: '#22d3ee', blue: '#2f6bff', violet: '#8b5cf6' };

// ---- Iris shader: radial cyan -> blue -> violet gradient with slow shimmering rays ----
const irisVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const irisFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    // On a sphere cap, uv.y runs 1 (centre) -> 0 (rim) and uv.x runs around the circle.
    float r = 1.0 - vUv.y;
    float a = vUv.x * 6.2831853;

    vec3 cyan   = vec3(0.133, 0.827, 0.933);
    vec3 blue   = vec3(0.184, 0.420, 1.000);
    vec3 violet = vec3(0.545, 0.361, 0.965);

    vec3 col = mix(cyan, blue, smoothstep(0.15, 0.55, r));
    col = mix(col, violet, smoothstep(0.50, 0.95, r));

    float rays = 0.5 + 0.5 * sin(a * 18.0 + uTime * 0.9 + r * 8.0);
    col += rays * 0.22 * (1.0 - r);

    float ring = smoothstep(0.78, 0.90, r) * (1.0 - smoothstep(0.90, 1.0, r));
    col += ring * 0.35;

    float alpha = 1.0 - smoothstep(0.94, 1.0, r);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Soft radial glow texture drawn on a canvas (cheap fake "bloom" behind the eye). */
function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(47,107,255,0.55)');
  g.addColorStop(0.35, 'rgba(139,92,246,0.25)');
  g.addColorStop(0.7, 'rgba(34,211,238,0.07)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** One chevron bracket ("<"). Pass `flip` to mirror it into ">". */
function Bracket({ apexX, flip = false, color }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.3,
        metalness: 0.2,
      }),
    [color]
  );

  const theta = 0.85; // arm angle from horizontal (radians)
  const len = 1.1; // arm length
  const radius = 0.085;
  const half = len / 2;

  return (
    <group position={[apexX, 0, 0]} scale={[flip ? -1 : 1, 1, 1]}>
      {/* upper arm */}
      <mesh
        position={[half * Math.cos(theta), half * Math.sin(theta), 0]}
        rotation={[0, 0, theta - Math.PI / 2]}
        material={material}
      >
        <capsuleGeometry args={[radius, len - radius * 2, 8, 16]} />
      </mesh>
      {/* lower arm */}
      <mesh
        position={[half * Math.cos(theta), -half * Math.sin(theta), 0]}
        rotation={[0, 0, -theta - Math.PI / 2]}
        material={material}
      >
        <capsuleGeometry args={[radius, len - radius * 2, 8, 16]} />
      </mesh>
    </group>
  );
}

export default function HeroEye({ pointer, scroll, isMobile }) {
  const { viewport } = useThree();

  const root = useRef();
  const ball = useRef();
  const look = useRef();
  const ringA = useRef();
  const ringB = useRef();
  const brackets = useRef();
  const glow = useRef();
  const smooth = useRef({ x: 0, y: 0 });

  const segments = isMobile ? 32 : 64;

  // Iris and pupil are caps cut from a sphere, so they hug the curve of the eyeball.
  const irisGeometry = useMemo(() => {
    const g = new THREE.SphereGeometry(1.012, segments, 16, 0, Math.PI * 2, 0, 0.62);
    g.rotateX(Math.PI / 2); // point the cap toward +Z (towards the camera)
    return g;
  }, [segments]);

  const pupilGeometry = useMemo(() => {
    const g = new THREE.SphereGeometry(1.026, segments, 12, 0, Math.PI * 2, 0, 0.22);
    g.rotateX(Math.PI / 2);
    return g;
  }, [segments]);

  const irisMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: irisVertex,
        fragmentShader: irisFragment,
        transparent: true,
        toneMapped: false,
      }),
    []
  );

  const glowTexture = useMemo(() => makeGlowTexture(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = pointer.current;

    // Where is the eye looking? Follow the pointer, or wander when it has been idle.
    const idle = performance.now() - p.last > 2500;
    const targetX = idle ? Math.sin(t * 0.55) * 0.65 : p.x;
    const targetY = idle ? Math.cos(t * 0.4) * 0.35 : p.y;
    const s = smooth.current;
    s.x = THREE.MathUtils.damp(s.x, targetX, 4, delta);
    s.y = THREE.MathUtils.damp(s.y, targetY, 4, delta);

    // Layout: right-hand side on wide screens, above the text on phones.
    const W = viewport.width;
    const H = viewport.height;
    const wide = W / H > 1.15;
    const baseScale = wide
      ? Math.min(0.95, (0.42 * W) / 6.2, (0.6 * H) / 3.4)
      : Math.min(0.9, (0.9 * W) / 6.2);
    const anchorX = wide ? W * 0.21 : 0;
    const anchorY = wide ? 0 : H * 0.19;

    // Scroll reaction: drift up with the page, spin a little, shrink away.
    const prog = scroll.current.progress;
    const fade = THREE.MathUtils.clamp(1 - (prog - 0.35) / 0.45, 0, 1);
    const group = root.current;
    group.visible = fade > 0.01;
    if (!group.visible) return; // fully scrolled away: skip all work

    group.position.set(anchorX, anchorY + prog * H + Math.sin(t * 1.1) * 0.08, 0);
    group.scale.setScalar(baseScale * (0.25 + 0.75 * fade));
    group.rotation.y = s.x * 0.4 + prog * 1.4;
    group.rotation.x = -s.y * 0.22;

    // Iris + pupil glide over the eyeball toward the pointer.
    look.current.rotation.y = s.x * 0.5;
    look.current.rotation.x = -s.y * 0.4;

    // Blink every 5.5 seconds.
    const bt = t % 5.5;
    const blink = bt > 5.3 ? Math.sin(((bt - 5.3) / 0.2) * Math.PI) : 0;
    ball.current.scale.y = 1 - blink * 0.92;

    // Ambient motion.
    ringA.current.rotation.z = t * 0.35;
    ringB.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.5) * 0.15;
    ringB.current.rotation.y = t * 0.25;
    brackets.current.position.y = Math.sin(t * 1.3) * 0.06;
    irisMaterial.uniforms.uTime.value = t;
    glow.current.material.opacity = 0.5 + Math.sin(t * 1.6) * 0.08;
  });

  return (
    <group ref={root}>
      {/* soft glow behind everything */}
      <mesh ref={glow} position={[0, 0, -1.2]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* eyeball */}
      <group ref={ball}>
        <mesh>
          <sphereGeometry args={[1, segments, segments]} />
          <meshStandardMaterial
            color="#0a1236"
            roughness={0.25}
            metalness={0.7}
            emissive="#10206b"
            emissiveIntensity={0.55}
          />
        </mesh>
        {/* wireframe shell for a techy look */}
        <mesh>
          <icosahedronGeometry args={[1.035, 2]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.16} />
        </mesh>

        {/* iris, pupil and highlight: these follow the pointer */}
        <group ref={look}>
          <mesh geometry={irisGeometry} material={irisMaterial} />
          <mesh geometry={pupilGeometry}>
            <meshBasicMaterial color="#02030a" />
          </mesh>
          <mesh position={[0.17, 0.21, 1.0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* orbit rings */}
      <group ref={ringA}>
        <mesh>
          <torusGeometry args={[1.6, 0.014, 8, 128]} />
          <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
        </mesh>
        <mesh position={[1.6, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <group ref={ringB} rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.85, 0.01, 8, 128]} />
          <meshBasicMaterial color={COLORS.violet} toneMapped={false} />
        </mesh>
      </group>

      {/* < and > brackets */}
      <group ref={brackets}>
        <Bracket apexX={-2.8} color={COLORS.cyan} />
        <Bracket apexX={2.8} flip color={COLORS.violet} />
      </group>
    </group>
  );
}
