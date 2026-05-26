import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import { ArrowRight } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";
import { useTypewriter } from "../../hooks/useTypewriter";

const NeonRibbon = lazy(() => import("../three/NeonRibbon"));

export default function Hero() {
  const { t } = useTranslation();
  const typewriterStrings = t("hero.typewriter", { returnObjects: true });
  const word = useTypewriter({
    strings: Array.isArray(typewriterStrings) ? typewriterStrings : ["WOW"],
    speed: 90,
    pause: 1400,
  });

  return (
    <section className="relative min-h-screen overflow-hidden bg-ink-700">
      <div className="absolute inset-0 bg-aurora" />
      <div className="absolute inset-0 bg-grid bg-grid-lg opacity-[0.06]" />
      <Suspense fallback={null}>
        <NeonRibbon />
      </Suspense>
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 lg:px-12">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-accent-300"
        >
          {t("hero.eyebrow")}
        </motion.span>

        <motion.h1
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-[clamp(60px,13vw,180px)] leading-[0.88] tracking-tight"
        >
          <span className="block">{t("hero.title_line1")}</span>
          <span className="block min-h-[1em] text-gradient-cool">{word || " "}</span>
          <span className="block ml-[20%] text-ink-200">{t("hero.title_line3")}</span>
        </motion.h1>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 max-w-xl text-lg text-ink-200 lg:text-xl"
        >
          <Trans
            i18nKey="hero.subtitle"
            components={{
              0: <span className="text-accent-300" />,
            }}
          />
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12 flex flex-wrap gap-4"
        >
          <MagneticButton>
            {t("hero.cta_primary")} <ArrowRight size={16} strokeWidth={2.5} />
          </MagneticButton>
          <MagneticButton variant="ghost">{t("hero.cta_secondary")}</MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-12 right-12 hidden flex-col items-end gap-2 lg:flex"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-300">
            {t("hero.scroll_hint")}
          </span>
          <div className="h-12 w-[1px] animate-float bg-gradient-to-b from-accent-300 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
