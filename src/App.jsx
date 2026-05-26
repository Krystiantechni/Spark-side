import { lazy, Suspense } from "react";
import { useLenisScroll } from "./hooks/useLenisScroll";
import { useCursor } from "./hooks/useCursor";
import { useTranslation } from "react-i18next";
import ScrollProgressBar from "./components/ui/ScrollProgressBar";
import LanguageSwitcher from "./components/ui/LanguageSwitcher";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import Stats from "./components/sections/Stats";
import Marquee from "./components/sections/Marquee";
import CTA from "./components/sections/CTA";

const LightTrailSVG = lazy(() => import("./components/ui/LightTrailSVG"));
const LightTrailCanvas = lazy(() => import("./components/ui/LightTrailCanvas"));

// Trail variant: ?trail=svg|canvas|off — default svg.
function getTrailVariant() {
  if (typeof window === "undefined") return "svg";
  const p = new URLSearchParams(window.location.search).get("trail");
  if (p === "canvas" || p === "off" || p === "svg") return p;
  return "svg";
}

export default function App() {
  useLenisScroll();
  useCursor();
  const { t } = useTranslation();
  const trail = getTrailVariant();

  return (
    <div className="min-h-screen bg-ink-700 text-ink-50">
      <ScrollProgressBar />

      {/* Header z language switcher — fixed */}
      <header className="fixed right-6 top-6 z-50">
        <LanguageSwitcher />
      </header>

      {/* Cursor spotlight overlay — globalny, idzie za myszką */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 cursor-spotlight"
      />

      {/* Neon light trail — ?trail=svg lub ?trail=canvas */}
      <Suspense fallback={null}>
        {trail === "svg" && <LightTrailSVG />}
        {trail === "canvas" && <LightTrailCanvas />}
      </Suspense>

      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Features />
        <Stats />
        <CTA />
      </main>

      <footer className="relative z-10 border-t border-ink-500/40 bg-ink-700 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink-300">
            {t("footer.tagline", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
