import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Sparkles, Zap, Layers, Wand2 } from "lucide-react";
import { useTilt3D } from "../../hooks/useTilt3D";
import { useMouseSpotlight } from "../../hooks/useMouseSpotlight";
import RevealOnScroll from "../ui/RevealOnScroll";

const FEATURE_META = [
  { key: "micro_motion", icon: Sparkles, accent: "#00D9FF" },
  { key: "three_d", icon: Layers, accent: "#FF0080" },
  { key: "performance", icon: Zap, accent: "#C6FF00" },
  { key: "typography", icon: Wand2, accent: "#F5C518" },
];

function FeatureCard({ icon: Icon, title, desc, accent }) {
  const tilt = useTilt3D({ max: 6 });
  const spot = useMouseSpotlight();

  return (
    <div ref={tilt} className="transform-gpu">
      <div
        ref={spot}
        style={{
          background: `radial-gradient(500px at var(--mx) var(--my), ${accent}1F, transparent 60%)`,
        }}
        className="glass relative h-full overflow-hidden rounded-3xl p-8 lg:p-10"
      >
        <span
          style={{ color: accent, backgroundColor: `${accent}1A` }}
          className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
        >
          <Icon size={28} strokeWidth={1.6} />
        </span>
        <h3 className="font-display text-2xl md:text-3xl">{title}</h3>
        <p className="mt-3 text-ink-200 leading-relaxed">{desc}</p>
        <div
          aria-hidden
          style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
          className="pointer-events-none absolute left-0 top-0 h-full w-[1px]"
        />
      </div>
    </div>
  );
}

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
};

export default function Features() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 md:py-40 bg-ink-700">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <RevealOnScroll>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-magenta-400">
            {t("features.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-[clamp(40px,7vw,84px)] leading-[1] tracking-tight">
            {t("features.title")} <br />
            <span className="text-gradient-warm">{t("features.title_accent")}</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-ink-200">{t("features.subtitle")}</p>
        </RevealOnScroll>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:gap-8">
          {FEATURE_META.map((f, i) => (
            <RevealOnScroll key={f.key} delay={i * 100}>
              <FeatureCard
                icon={f.icon}
                accent={f.accent}
                title={t(`features.items.${f.key}.title`)}
                desc={t(`features.items.${f.key}.desc`)}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
