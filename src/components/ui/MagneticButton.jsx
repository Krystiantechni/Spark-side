import PropTypes from "prop-types";
import { useMagneticCursor } from "../../hooks/useMagneticCursor";

// Przycisk z efektem magnetycznym (przyciąga się do kursora gdy ten w pobliżu).
export default function MagneticButton({ children, className = "", onClick, variant = "primary" }) {
  const ref = useMagneticCursor({ strength: 0.4, radius: 140 });

  const styles = {
    primary:
      "bg-gradient-to-r from-accent-300 to-magenta-400 text-ink-700 hover:shadow-neon-accent",
    ghost:
      "border border-ink-400 bg-ink-700/40 text-ink-50 backdrop-blur-sm hover:border-accent-300 hover:text-accent-300",
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={[
        "group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300",
        styles[variant],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

MagneticButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "ghost"]),
};
