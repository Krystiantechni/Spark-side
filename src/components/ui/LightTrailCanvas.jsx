import { useEffect, useRef } from "react";

// Neon particle trail — canvas 2D.
// Head smugi przesuwa się w dół zgodnie ze scrollProgress (0→1).
// Co frame emituje nowe particles wzdłuż ścieżki Bézier, każdy z własnym life/velocity.
// Trzy kolory (cyjan / lime / magenta) z fade-out + glow przez globalCompositeOperation 'lighter'.
// Mouse drift wpływa subtelnie na pozycję emittera (~8%).
export default function LightTrailCanvas() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    scrollProgress: 0,
    targetProgress: 0,
    mouse: { x: 0, y: 0, tx: 0, ty: 0 },
    dpr: 1,
    raf: 0,
    reduced: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const s = stateRef.current;

    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * s.dpr;
      canvas.height = h * s.dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      s.targetProgress = total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMove = (e) => {
      s.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      s.mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    // Krzywa Béziera (cubic) — przelot smugi przez viewport. Punkty kontrolne w 0-1.
    const bezier = (t, p0, p1, p2, p3) => {
      const u = 1 - t;
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    };

    const COLORS = [
      { r: 0, g: 217, b: 255 },     // cyan
      { r: 198, g: 255, b: 0 },     // lime
      { r: 255, g: 61, b: 200 },    // magenta
    ];

    const emit = (hx, hy, count) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 1.4;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        s.particles.push({
          x: hx + (Math.random() - 0.5) * 12,
          y: hy + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed * 0.4,
          vy: Math.sin(angle) * speed * 0.4 + 0.3,
          life: 1,
          decay: 0.006 + Math.random() * 0.012,
          size: 1.5 + Math.random() * 3,
          color,
        });
      }
    };

    let frame = 0;
    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Lerp wartości
      s.scrollProgress += (s.targetProgress - s.scrollProgress) * 0.08;
      s.mouse.x += (s.mouse.tx - s.mouse.x) * 0.06;
      s.mouse.y += (s.mouse.ty - s.mouse.y) * 0.06;

      // Head smugi — przelot przez viewport po krzywej Béziera.
      // scrollProgress 0→1 = head idzie od top-left do bottom-right z S-curve
      const t = s.scrollProgress;
      const hx = bezier(t, 0.1, 0.85, 0.15, 0.9) * w + s.mouse.x * w * 0.08;
      const hy = bezier(t, 0.0, 0.35, 0.65, 1.0) * h + s.mouse.y * h * 0.05;

      // Emit nowe particles (mniej gdy reduced motion)
      if (!s.reduced) emit(hx, hy, 4);
      else emit(hx, hy, 1);

      // Trail fade — narysuj półprzezroczysty czarny prostokąt na całą canvas
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5, 5, 7, 0.12)";
      ctx.fillRect(0, 0, w, h);

      // Particles z 'lighter' blendingiem dla glow
      ctx.globalCompositeOperation = "lighter";
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= p.decay;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        const alpha = p.life;
        const r = p.size * (1 + (1 - p.life) * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.9})`);
        grad.addColorStop(0.4, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head — jasny core
      ctx.globalCompositeOperation = "lighter";
      const headGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, 40);
      headGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      headGrad.addColorStop(0.2, "rgba(91, 233, 255, 0.7)");
      headGrad.addColorStop(0.6, "rgba(0, 217, 255, 0.3)");
      headGrad.addColorStop(1, "rgba(0, 217, 255, 0)");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(hx, hy, 40, 0, Math.PI * 2);
      ctx.fill();

      frame++;
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(s.raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[15] mix-blend-screen"
    />
  );
}
