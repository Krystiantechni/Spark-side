import { useTranslation } from "react-i18next";
import RevealOnScroll from "../ui/RevealOnScroll";

const STATS = [
  { num: "127", labelKey: "stats.projects" },
  { num: "98%", labelKey: "stats.satisfaction" },
  { num: "2.4s", labelKey: "stats.load_time" },
  { num: "60", labelKey: "stats.fps" },
];

export default function Stats() {
  const { t } = useTranslation();
  return (
    <section className="relative py-24 md:py-32 bg-ink-700">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-y-16 gap-x-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <RevealOnScroll key={s.labelKey} delay={i * 80}>
              <p className="font-display text-6xl md:text-8xl text-gradient-cool leading-[0.9]">
                {s.num}
              </p>
              <p className="mt-4 font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-ink-300">
                {t(s.labelKey)}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
