import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Particles – a field of softly glowing dots in the background.
 *
 * All motion happens on the GPU (in the vertex shader), so even a few hundred
 * points cost almost nothing. Particles drift gently, and move at slightly
 * different speeds as you scroll, which creates a parallax feel. They wrap
 * around vertically so the field never runs out.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uExtent;
  attribute float aRand;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // "position" is stored as -1..1; scale it to the current viewport.
    vec3 p = position * uExtent;
    p.z -= 3.0;

    float range = uExtent.y * 2.0;
    p.y = mod(p.y + uScroll * (0.3 + aRand * 0.7) + sin(uTime * 0.3 + aRand * 20.0) * 0.15 + range * 0.5, range) - range * 0.5;
    p.x += sin(uTime * 0.2 + aRand * 30.0) * 0.2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.5 + aRand) / max(-mv.z, 0.1);

    vColor = aColor;
    vAlpha = 0.35 + aRand * 0.5;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const PALETTE = ['#D6C2A1', '#F5EDE0', '#ffffff'].map((c) => new THREE.Color(c));

export default function Particles({ count, scroll }) {
  const { viewport } = useThree();
  const material = useRef();

  const { positions, randoms, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * 2 - 1;
      positions[i * 3 + 1] = Math.random() * 2 - 1;
      positions[i * 3 + 2] = Math.random() * 2 - 1;
      randoms[i] = Math.random();
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, randoms, colors };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 24 },
      uPixelRatio: { value: 1 },
      uExtent: { value: new THREE.Vector3(10, 10, 5) },
    }),
    []
  );

  useFrame((state) => {
    const u = material.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uScroll.value = scroll.current.progress * viewport.height * 0.35;
    u.uExtent.value.set(viewport.width * 1.1, viewport.height * 1.6, 5);
    u.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRand" count={count} array={randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
