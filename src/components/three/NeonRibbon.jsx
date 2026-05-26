import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader: subtelne wave + noise z-displacement, daje 3D flow feel.
const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDisplace;

  // klasyczny 2D noise (Stefan Gustavson, krótka wersja)
  vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec2 mod289(vec2 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,0.366025403784439,
                       -0.577350269189626,0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // wave horyzontalna + noise = flow
    float wave = sin(pos.x * 1.4 + uTime * 0.7) * 0.18;
    float n = snoise(vec2(pos.x * 0.6 + uTime * 0.25, pos.y * 1.2 + uTime * 0.18));
    pos.z += wave + n * 0.35;

    // dodatkowy ripple Y, mniejszy
    pos.y += sin(pos.x * 0.8 + uTime * 0.5) * 0.08;

    vDisplace = n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader: NUM_STRANDS dyskretnych równoległych włókien.
// Każde włókno ma własny kolor (z 5 uniformów), grubość, fazę fali, prędkość.
// Daje wygląd "fluid neon strands" zamiast amorficznej kałuży noise.
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse; // -1..1 znormalizowane, x: lewo/prawo, y: dół/góra (CSS-y odwrócony)
  uniform float uHold; // 0..1 — click & hold strength multiplier
  uniform vec3 uColor1; // cyjan
  uniform vec3 uColor2; // lime / spring green
  uniform vec3 uColor3; // magenta
  uniform vec3 uColor4; // pink
  uniform vec3 uColor5; // fiolet
  varying vec2 vUv;
  varying float vDisplace;

  // hash 1D -> 0..1, pseudo-random per strand index
  float hash(float n) { return fract(sin(n * 43758.5453123) * 12345.678); }

  // zwraca kolor dla danego indeksu włókna (cyklicznie po palecie)
  vec3 strandColor(int idx) {
    int m = idx - (idx / 5) * 5; // mod 5 bez % (WebGL1 friendly)
    if (m == 0) return uColor1;
    if (m == 1) return uColor2;
    if (m == 2) return uColor3;
    if (m == 3) return uColor4;
    return uColor5;
  }

  void main() {
    vec2 uv = vUv;
    vec3 col = vec3(0.0);

    const int NUM_STRANDS = 13;
    float invN = 1.0 / float(NUM_STRANDS);

    // === mouse driver ===
    // Tylko LOKALNE łamanie — wstęga się gnie tam gdzie jest kursor, reszta zostaje w spokoju.
    // Hold zwiększa siłę i zasięg.
    float holdBoost = 1.0 + uHold * 2.2;

    // Mapa kursora w UV space (0..1)
    vec2 mouseUv = uMouse * 0.5 + 0.5;

    // wektor od piksela do kursora — lokalna pertubacja "magnesu"
    vec2 toMouse = mouseUv - uv;
    float distToMouse = length(toMouse);
    // wąski promień łamania — żeby NIE zaginało wstęgi całej, tylko obszar wokół kursora.
    float magnetRadius = mix(0.18, 0.32, uHold);
    float mouseInfluence = smoothstep(magnetRadius, 0.0, distToMouse);
    // wyostrzenie wpływu — peak blisko centrum, szybko spada
    mouseInfluence = pow(mouseInfluence, 1.4);

    // lokalny "pull" — silne wyrwanie włókien w stronę kursora, ale TYLKO w mouse zone.
    // Większy współczynnik bo nie ma już globalnego shiftu — to musi "wybić" miejscowo.
    vec2 magnetPull = toMouse * mouseInfluence * (0.55 + uHold * 0.7);

    for (int i = 0; i < NUM_STRANDS; i++) {
      float fi = float(i);

      // pseudo-random properties per strand
      float r1 = hash(fi * 1.37);
      float r2 = hash(fi * 7.91 + 3.0);
      float r3 = hash(fi * 0.43 + 11.0);

      // base Y bez globalnego shiftu — tylko lokalny pull przy kursorze
      float baseY = (fi + 0.5) * invN + (r1 - 0.5) * invN * 0.6 + magnetPull.y;

      // wave motion — faza dotknięta tylko lokalnym pullem X (włókna "łamią się" w bok przy kursorze)
      float waveFreq = 2.5 + r2 * 4.5;
      float waveAmp = (0.022 + r1 * 0.045) * (1.0 + mouseInfluence * 1.4 * holdBoost);
      float waveSpeed = 0.18 + r3 * 0.35;
      float wavePhase = fi * 0.91 + uTime * waveSpeed + magnetPull.x * 22.0;
      float y = baseY + sin(uv.x * waveFreq + wavePhase) * waveAmp
                      + sin(uv.x * waveFreq * 1.7 + wavePhase * 0.6) * waveAmp * 0.4;

      // CIENKIE linie — jak SVG stroke-width 1-3 (a nie szerokie smugi)
      float thickness = 0.0008 + r2 * 0.0022;

      // distance od piksela do centrum włókna
      float d = abs(uv.y - y);

      // === ostry rdzeń + mały halo (jak SVG path z gaussian blur filter) ===
      // CORE — pixel-thin sharp line
      float core = smoothstep(thickness, thickness * 0.2, d);
      // HALO — subtle glow ~6× thickness, niska intensywność
      float halo = smoothstep(thickness * 6.0, thickness, d);
      float intensity = core * 2.2 + halo * 0.25;

      // jasność moduluje wzdłuż X — ale subtelnie (floor 0.85, range 0.15)
      // żeby linie były jednolicie wyraźne, nie pulsowały
      float brightWave = 0.85
        + sin(uv.x * (3.0 + r1 * 3.0) + uTime * (0.4 + r3 * 0.3) + fi * 0.7) * 0.15;

      // strandStrength — wszystkie linie pełne (floor 1.0)
      // + boost przy kursorze
      float strandStrength = (1.0 + r2 * 0.3)
        * (1.0 + mouseInfluence * (0.6 + uHold * 1.2));

      vec3 sc = strandColor(i);

      col += sc * intensity * brightWave * strandStrength;
    }

    // delikatne wzmocnienie środka w pionie (depth/glow w centrum)
    float vertCenter = 1.0 - abs(uv.y - 0.5) * 2.0;
    col *= 0.85 + pow(vertCenter, 1.4) * 0.5;

    // scroll modulates intensity — wstęga subtelnie "oddycha" przy scrollu
    col *= 1.0 + uScroll * 0.25;

    // alpha fade na krawędziach góra/dół — wstęga rozpływa się w czerni
    float distFromCenter = abs(uv.y - 0.5) * 2.0;
    float edgeY = 1.0 - smoothstep(0.55, 1.0, distFromCenter);
    edgeY = pow(edgeY, 1.4);

    // fade na bokach X
    float edgeX = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);

    float alpha = edgeY * edgeX;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

function Ribbon({ scrollRef, mouseRef, holdRef }) {
  const matRef = useRef();
  // smooth-lerp current mouse (żeby ruch nitek za kursorem był płynny, nie skokowy)
  const smoothMouse = useRef({ x: 0, y: 0 });
  const smoothHold = useRef(0);

  // uniforms — useMemo żeby nie tworzyć ich co render
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHold: { value: 0 },
      uColor1: { value: new THREE.Color("#00D9FF") }, // cyjan
      uColor2: { value: new THREE.Color("#C6FF00") }, // lime
      uColor3: { value: new THREE.Color("#FF0080") }, // magenta
      uColor4: { value: new THREE.Color("#FF3DC8") }, // pink
      uColor5: { value: new THREE.Color("#9933FF") }, // fiolet
    }),
    [],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (scrollRef?.current !== undefined) {
      matRef.current.uniforms.uScroll.value = scrollRef.current;
    }
    if (mouseRef?.current) {
      // lerp 0.08 — płynny follow z ~125ms damping
      smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * 0.08;
      smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * 0.08;
      matRef.current.uniforms.uMouse.value.set(
        smoothMouse.current.x,
        smoothMouse.current.y,
      );
    }
    if (holdRef?.current !== undefined) {
      // wolniejszy lerp przy hold → płynny ramp-up/down
      const target = holdRef.current ? 1 : 0;
      smoothHold.current += (target - smoothHold.current) * 0.12;
      matRef.current.uniforms.uHold.value = smoothHold.current;
    }
  });

  return (
    <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[16, 3, 100, 40]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function NeonRibbon() {
  // scroll progress (window.scrollY znormalizowany) trzymany w ref,
  // żeby nie powodować re-renderów Canvas.
  const scrollRef = useRef(0);
  // mouse w przedziale -1..1 (x: lewo/prawo, y: dół/góra — odwrócone z CSS).
  const mouseRef = useRef({ x: 0, y: 0 });
  // click & hold: 1 gdy LMB wciśnięty (zwiększa siłę magnesu)
  const holdRef = useRef(0);

  // Respect prefers-reduced-motion + skip rendering na bardzo małych ekranach (mobile <640)
  // gdzie shader jest najcięższy a efekt mniej widoczny.
  const [shouldRender, setShouldRender] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tooSmall = window.innerWidth < 640;
    setShouldRender(!reduced && !tooSmall);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, window.innerHeight);
      scrollRef.current = Math.min(1, window.scrollY / max);
    };
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onDown = (e) => {
      // tylko lewy przycisk (button 0)
      if (e.button === 0) holdRef.current = 1;
    };
    const onUp = (e) => {
      if (e.button === 0) holdRef.current = 0;
    };
    const onLeave = () => {
      // release przy wyjściu z okna — żeby się nie "zaciął" w hold
      holdRef.current = 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onLeave);
    window.addEventListener("blur", onLeave);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    shouldRender ? (
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 1.5]}
        className="!absolute inset-0"
        gl={{ antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" }}
      >
        <Ribbon scrollRef={scrollRef} mouseRef={mouseRef} holdRef={holdRef} />
      </Canvas>
    ) : null
  );
}
