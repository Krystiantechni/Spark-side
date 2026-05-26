import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Check, X } from "lucide-react";
import { LOCALES, getLocale } from "../../i18n/locales";

// Dropdown wyboru języka — 40 języków pogrupowanych po regionie + search.
// Pokazuje native name + flag, persistuje wybór w localStorage (via i18n).
export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const current = getLocale(i18n.language);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? LOCALES.filter(
          (l) =>
            l.native.toLowerCase().includes(q) ||
            l.english.toLowerCase().includes(q) ||
            l.code.includes(q),
        )
      : LOCALES;
    const groups = {};
    for (const l of filtered) {
      if (!groups[l.region]) groups[l.region] = [];
      groups[l.region].push(l);
    }
    return groups;
  }, [query]);

  const change = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ outline: "none" }}
        className="inline-flex items-center gap-2 rounded-full border border-ink-400/50 bg-ink-700/60 px-4 py-2 text-sm font-semibold text-ink-50 backdrop-blur-sm transition-colors hover:border-accent-300 hover:text-accent-300 focus:outline-none"
        aria-label={t("language_switcher.label", "Choose language")}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.native}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-400/40 bg-ink-700/95 shadow-2xl backdrop-blur-xl">
          {/* Search */}
          <div className="relative border-b border-ink-500/40 p-3">
            <Search
              size={14}
              strokeWidth={2}
              className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("language_switcher.search_placeholder", "Search language…")}
              style={{ outline: "none" }}
              className="w-full rounded-xl bg-ink-600/60 py-2 pl-9 pr-9 text-sm text-ink-50 placeholder:text-ink-300 focus:outline-none focus:ring-1 focus:ring-accent-300"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-50"
                aria-label={t("language_switcher.clear_search", "Clear search")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lista pogrupowana — data-lenis-prevent żeby smooth-scroll nie hijackował kółka */}
          <div className="max-h-80 overflow-y-auto" data-lenis-prevent>
            {Object.entries(grouped).map(([region, items]) => (
              <div key={region} className="border-b border-ink-500/20 last:border-b-0">
                <p className="sticky top-0 z-10 bg-ink-700/95 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-300 backdrop-blur-sm">
                  {region}
                </p>
                {items.map((l) => {
                  const isCurrent = l.code === i18n.language;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => change(l.code)}
                      style={{ outline: "none" }}
                      className={[
                        "flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors focus:outline-none",
                        isCurrent
                          ? "bg-accent-300/10 text-accent-300"
                          : "text-ink-50 hover:bg-ink-500/30",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base leading-none">{l.flag}</span>
                        <span className="font-medium">{l.native}</span>
                        <span className="text-xs text-ink-300">{l.english}</span>
                      </span>
                      {isCurrent && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-300">
                {t("language_switcher.no_match", "No language matches.")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

LanguageSwitcher.propTypes = {
  className: PropTypes.string,
};
