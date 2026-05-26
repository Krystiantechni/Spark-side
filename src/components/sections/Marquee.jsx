// Marquee z brand tagami — niekończący się przewijający tekst.
const TAGS = ["FRAMER MOTION", "THREE.JS", "GSAP", "LENIS", "TAILWIND", "REACT 19", "VITE", "MAGIC UI"];

export default function Marquee() {
  return (
    <section
      aria-hidden="true"
      className="relative border-y border-ink-500/50 bg-ink-600/40 py-10 overflow-hidden"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {[...TAGS, ...TAGS, ...TAGS, ...TAGS].map((tag, i) => (
          <span
            key={i}
            className="mx-12 inline-flex items-center gap-12 font-display text-4xl md:text-6xl text-ink-300 hover:text-accent-300 transition-colors"
          >
            {tag}
            <span className="h-2 w-2 rounded-full bg-magenta-400" />
          </span>
        ))}
      </div>
    </section>
  );
}
