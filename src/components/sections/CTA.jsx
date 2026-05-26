import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import { ArrowRight, Mail } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";
import RevealOnScroll from "../ui/RevealOnScroll";

export default function CTA() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden py-32 md:py-48 bg-ink-700">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-96 w-96 animate-blob bg-accent-300/20 blur-3xl" />
        <div
          className="absolute right-[15%] bottom-[10%] h-[28rem] w-[28rem] animate-blob bg-magenta-400/20 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute left-[40%] bottom-[40%] h-72 w-72 animate-blob bg-lime-300/15 blur-3xl"
          style={{ animationDelay: "6s" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-12">
        <RevealOnScroll>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-300">
            {t("cta.eyebrow")}
          </span>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <h2 className="mt-6 font-display text-[clamp(50px,10vw,140px)] leading-[0.88] tracking-tight">
            {t("cta.title_line1")}
            <br />
            <span className="text-gradient-cool italic">{t("cta.title_line2")}</span>
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={300}>
          <p className="mx-auto mt-10 max-w-2xl text-lg text-ink-200 lg:text-xl">
            <Trans
              i18nKey="cta.subtitle"
              components={{
                0: <span className="text-accent-300" />,
              }}
            />
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={500}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton>
              {t("cta.cta_primary")} <ArrowRight size={16} strokeWidth={2.5} />
            </MagneticButton>
            <MagneticButton variant="ghost">
              <Mail size={14} strokeWidth={2.4} /> {t("cta.cta_secondary")}
            </MagneticButton>
          </motion.div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
