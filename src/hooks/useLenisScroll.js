import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Smooth-scroll global (Lenis). Dodaj raz na poziomie App.
// duration: czas tłumienia, easing: krzywa easing.
export function useLenisScroll({ duration = 1.2, easing } = {}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration,
      easing: easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      smoothWheel: true,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [duration, easing]);
}

export default useLenisScroll;
