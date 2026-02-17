/**
 * Landing Page
 * Interactive liquid gradient background with React Three Fiber
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vec3 pos = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    vUv = uv;
  }
`;

// Fragment shader
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform sampler2D uTouchTexture;
  uniform float uGrainIntensity;
  uniform vec3 uDarkNavy;
  uniform float uGradientSize;
  uniform float uColor1Weight;
  uniform float uColor2Weight;

  varying vec2 vUv;

  #define PI 3.14159265359

  float grain(vec2 uv, float time) {
    vec2 grainUv = uv * uResolution * 0.5;
    float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
    return grainValue * 2.0 - 1.0;
  }

  vec3 getGradientColor(vec2 uv, float time) {
    float gradientRadius = uGradientSize;

    vec2 center1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
    vec2 center2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
    vec2 center3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
    vec2 center4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
    vec2 center5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
    vec2 center6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);
    vec2 center7 = vec2(0.5 + sin(time * uSpeed * 0.55) * 0.38, 0.5 + cos(time * uSpeed * 0.48) * 0.42);
    vec2 center8 = vec2(0.5 + cos(time * uSpeed * 0.65) * 0.36, 0.5 + sin(time * uSpeed * 0.52) * 0.44);
    vec2 center9 = vec2(0.5 + sin(time * uSpeed * 0.42) * 0.41, 0.5 + cos(time * uSpeed * 0.58) * 0.39);
    vec2 center10 = vec2(0.5 + cos(time * uSpeed * 0.48) * 0.37, 0.5 + sin(time * uSpeed * 0.62) * 0.43);
    vec2 center11 = vec2(0.5 + sin(time * uSpeed * 0.68) * 0.33, 0.5 + cos(time * uSpeed * 0.44) * 0.46);
    vec2 center12 = vec2(0.5 + cos(time * uSpeed * 0.38) * 0.39, 0.5 + sin(time * uSpeed * 0.56) * 0.41);

    float influence1 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center1));
    float influence2 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center2));
    float influence3 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center3));
    float influence4 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center4));
    float influence5 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center5));
    float influence6 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center6));
    float influence7 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center7));
    float influence8 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center8));
    float influence9 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center9));
    float influence10 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center10));
    float influence11 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center11));
    float influence12 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - center12));

    vec2 rotatedUv1 = uv - 0.5;
    float angle1 = time * uSpeed * 0.15;
    rotatedUv1 = vec2(rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1), rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1));
    rotatedUv1 += 0.5;

    vec2 rotatedUv2 = uv - 0.5;
    float angle2 = -time * uSpeed * 0.12;
    rotatedUv2 = vec2(rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2), rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2));
    rotatedUv2 += 0.5;

    float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, length(rotatedUv1 - 0.5));
    float radialInfluence2 = 1.0 - smoothstep(0.0, 0.8, length(rotatedUv2 - 0.5));

    vec3 color = vec3(0.0);
    color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
    color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
    color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
    color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
    color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
    color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;
    color += uColor1 * influence7 * (0.55 + 0.45 * sin(time * uSpeed * 1.4)) * uColor1Weight;
    color += uColor2 * influence8 * (0.55 + 0.45 * cos(time * uSpeed * 1.5)) * uColor2Weight;
    color += uColor3 * influence9 * (0.55 + 0.45 * sin(time * uSpeed * 1.6)) * uColor1Weight;
    color += uColor4 * influence10 * (0.55 + 0.45 * cos(time * uSpeed * 1.7)) * uColor2Weight;
    color += uColor5 * influence11 * (0.55 + 0.45 * sin(time * uSpeed * 1.8)) * uColor1Weight;
    color += uColor6 * influence12 * (0.55 + 0.45 * cos(time * uSpeed * 1.9)) * uColor2Weight;

    color += mix(uColor1, uColor3, radialInfluence1) * 0.45 * uColor1Weight;
    color += mix(uColor2, uColor4, radialInfluence2) * 0.4 * uColor2Weight;

    color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;

    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 1.35);
    color = pow(color, vec3(0.92));

    float brightness1 = length(color);
    float mixFactor1 = max(brightness1 * 1.2, 0.15);
    color = mix(uDarkNavy, color, mixFactor1);

    float maxBrightness = 1.0;
    float brightness = length(color);
    if (brightness > maxBrightness) {
      color = color * (maxBrightness / brightness);
    }

    return color;
  }

  void main() {
    vec2 uv = vUv;

    vec4 touchTex = texture2D(uTouchTexture, uv);
    float vx = -(touchTex.r * 2.0 - 1.0);
    float vy = -(touchTex.g * 2.0 - 1.0);
    float intensity = touchTex.b;
    uv.x += vx * 0.8 * intensity;
    uv.y += vy * 0.8 * intensity;

    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.04 * intensity;
    float wave = sin(dist * 15.0 - uTime * 2.0) * 0.03 * intensity;
    uv += vec2(ripple + wave);

    vec3 color = getGradientColor(uv, uTime);

    float grainValue = grain(uv, uTime);
    color += grainValue * uGrainIntensity;

    float timeShift = uTime * 0.5;
    color.r += sin(timeShift) * 0.02;
    color.g += cos(timeShift * 1.4) * 0.02;
    color.b += sin(timeShift * 1.2) * 0.02;

    float brightness2 = length(color);
    float mixFactor2 = max(brightness2 * 1.2, 0.15);
    color = mix(uDarkNavy, color, mixFactor2);

    color = clamp(color, vec3(0.0), vec3(1.0));

    float maxBrightness = 1.0;
    float brightness = length(color);
    if (brightness > maxBrightness) {
      color = color * (maxBrightness / brightness);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// TouchTexture class for mouse interaction
class TouchTexture {
  size = 64;
  maxAge = 64;
  radius = 0.25 * 64;
  speed = 1 / 64;
  trail: Array<{ x: number; y: number; age: number; force: number; vx: number; vy: number }> = [];
  last: { x: number; y: number } | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.Texture;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.size, this.size);
    this.texture = new THREE.Texture(this.canvas);
  }

  update() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.size, this.size);

    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];
      const f = point.force * this.speed * (1 - point.age / this.maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;

      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else {
        this.drawPoint(point);
      }
    }
    this.texture.needsUpdate = true;
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0, vx = 0, vy = 0;

    if (this.last) {
      const dx = point.x - this.last.x;
      const dy = point.y - this.last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;
      force = Math.min(dd * 20000, 2.0);
    }

    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  drawPoint(point: { x: number; y: number; age: number; force: number; vx: number; vy: number }) {
    const pos = { x: point.x * this.size, y: (1 - point.y) * this.size };

    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
      intensity = -t * (t - 2);
    }
    intensity *= point.force;

    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = this.size * 5;

    this.ctx.shadowOffsetX = offset;
    this.ctx.shadowOffsetY = offset;
    this.ctx.shadowBlur = this.radius;
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(255,0,0,1)';
    this.ctx.arc(pos.x - offset, pos.y - offset, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

// Gradient plane component
function GradientPlane({ touchTexture }: { touchTexture: TouchTexture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uColor1: { value: new THREE.Vector3(0.945, 0.353, 0.133) },
    uColor2: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
    uColor3: { value: new THREE.Vector3(0.945, 0.353, 0.133) },
    uColor4: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
    uColor5: { value: new THREE.Vector3(0.945, 0.353, 0.133) },
    uColor6: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
    uSpeed: { value: 1.5 },
    uIntensity: { value: 1.8 },
    uTouchTexture: { value: touchTexture.texture },
    uGrainIntensity: { value: 0.08 },
    uDarkNavy: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
    uGradientSize: { value: 0.45 },
    uColor1Weight: { value: 0.5 },
    uColor2Weight: { value: 1.8 },
  }), [touchTexture.texture, size]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value += Math.min(delta, 0.1);
      touchTexture.update();
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

// Scene component with mouse tracking
function Scene({ touchTexture }: { touchTexture: TouchTexture }) {
  const { size } = useThree();

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      touchTexture.addTouch({
        x: e.clientX / size.width,
        y: 1 - e.clientY / size.height,
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchTexture.addTouch({
        x: touch.clientX / size.width,
        y: 1 - touch.clientY / size.height,
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [touchTexture, size]);

  return <GradientPlane touchTexture={touchTexture} />;
}

export function LandingPage() {
  const navigate = useNavigate();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [touchTexture] = useState(() => new TouchTexture());

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ cursor: 'none' }}>
      {/* React Three Fiber Canvas */}
      <Canvas
        className="absolute inset-0 z-0"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1], fov: 45 }}
      >
        <color attach="background" args={['#0a0e27']} />
        <Scene touchTexture={touchTexture} />
      </Canvas>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className="text-white text-center pointer-events-none px-4"
          style={{
            fontFamily: '"Syne", system-ui, sans-serif',
            fontSize: 'clamp(2.5rem, 8vw, 7rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Topsort Integration Demo
        </h1>

        <p
          className="text-white/70 text-center mt-6 max-w-xl px-4"
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 400,
          }}
        >
          A demonstration of Topsort Retail Media API integration
        </p>

        <button
          onClick={() => navigate('/onboarding')}
          className="mt-10 px-8 py-4 pointer-events-auto transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '9999px',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          View Demo
        </button>
      </div>

      {/* Footer */}
      <footer
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        style={{
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        Software Engineer (Integrations)
      </footer>

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 hidden md:block"
        style={{
          width: '40px',
          height: '40px',
          border: '2px solid white',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'transparent',
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
          }}
        />
      </div>
    </div>
  );
}
