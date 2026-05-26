import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";

// Neon light trail — SVG path sterowany scrollem + sparkles dryfujące wzdłuż ścieżki.
// 4 zachodzące na siebie ścieżki z gradient stroke + Gaussian blur glow.
// pathLength animuje "rysowanie" smugi od góry do dołu zgodnie z scrollem.
// 14 sparkles na głównej ścieżce — pulsują niezależnie, ujawniają się gdy scroll przekracza ich pozycję.
// Lekki mouse drift (5%) — bardziej "żywe" niż samo scroll.
export default function LightTrailSVG() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    const handler = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mx.set(nx);
      my.set(ny);
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, [mx, my]);

  // Mouse drift — minimalny (5%)
  const driftX = useTransform(mx, (v) => v * 20);
  const driftY = useTransform(my, (v) => v * 15);

  // Sparkles: liczymy pozycje na podstawie głównej ścieżki przez getPointAtLength.
  const mainPathRef = useRef(null);
  const [sparklePoints, setSparklePoints] = useState([]);
  const SPARKLE_COUNT = 14;

  useEffect(() => {
    const path = mainPathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const pts = [];
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const t = (i + 0.5) / SPARKLE_COUNT;
      const p = path.getPointAtLength(t * total);
      pts.push({ x: p.x, y: p.y, t });
    }
    setSparklePoints(pts);
  }, []);

  const COLORS = ["#00D9FF", "#5BE9FF", "#C6FF00", "#FF3DC8", "#FF0080"];

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[15] mix-blend-screen"
      style={{ x: driftX, y: driftY }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="trail-cyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0" />
            <stop offset="20%" stopColor="#00D9FF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C6FF00" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF0080" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="trail-magenta" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF0080" stopOpacity="0" />
            <stop offset="30%" stopColor="#FF3DC8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="trail-lime" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C6FF00" stopOpacity="0" />
            <stop offset="40%" stopColor="#5BE9FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.6" />
          </linearGradient>
          <filter id="trail-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="trail-glow-strong" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="22" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sparkle-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Główna smuga — cyjan→lime→magenta S-curve. ref dla sparkles. */}
        <motion.path
          ref={mainPathRef}
          d="M -50,-30 C 300,150 600,500 900,400 S 1300,650 1500,930"
          fill="none"
          stroke="url(#trail-cyan)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#trail-glow-strong)"
          style={{ pathLength: progress }}
        />

        {/* Druga smuga — magenta, lekko offset */}
        <motion.path
          d="M -30,30 C 280,80 580,580 920,460 S 1310,720 1500,990"
          fill="none"
          stroke="url(#trail-magenta)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#trail-glow)"
          style={{ pathLength: progress, opacity: 0.7 }}
        />

        {/* Trzecia — lime cienka, jako splot */}
        <motion.path
          d="M 0,-10 C 350,200 650,420 880,350 S 1280,600 1480,900"
          fill="none"
          stroke="url(#trail-lime)"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#trail-glow)"
          style={{ pathLength: progress, opacity: 0.6 }}
        />

        {/* Czwarta — szum cienki dla głębi */}
        <motion.path
          d="M -50,80 C 250,250 700,520 950,500 S 1320,800 1500,1050"
          fill="none"
          stroke="url(#trail-cyan)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#trail-glow)"
          style={{ pathLength: progress, opacity: 0.4 }}
        />

        {/* Sparkles wzdłuż głównej ścieżki — fade-in zgodnie z scrollProgress + autonomiczne pulse */}
        <g>
          {sparklePoints.map((pt, i) => (
            <Sparkle
              key={i}
              point={pt}
              index={i}
              progress={progress}
              color={COLORS[i % COLORS.length]}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}

// Pojedynczy sparkle — opacity zależna od scrollProgress + autonomiczna animacja scale/r dla "twinkle".
function Sparkle({ point, index, progress, color }) {
  // Opacity: pojawia się gdy scroll dochodzi do pozycji sparkle na path, slight fade na ogonie
  const opacity = useTransform(
    progress,
    [Math.max(0, point.t - 0.1), point.t, 1],
    [0, 1, 0.5]
  );

  // Każdy sparkle ma własny pseudo-random cycle (delay i duration)
  const delay = (index * 0.31) % 2;
  const duration = 1.4 + ((index * 0.7) % 1.4);
  const baseR = 2 + (index % 3);

  return (
    <motion.circle
      cx={point.x}
      cy={point.y}
      r={baseR}
      fill={color}
      filter="url(#sparkle-glow)"
      style={{ opacity }}
      animate={{
        scale: [0.6, 1.4, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      // transform-origin musi być w punkcie circle żeby scale skalował poprawnie
      transform={`rotate(0 ${point.x} ${point.y})`}
    />
  );
}
