"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// A wave twice the circle's width (200 SVG units) in 50-unit periods, closed
// down past the circle's bottom so the water body is solid under the crest.
// The drift keyframe shifts it by 100, a whole number of periods, so the
// loop is seamless.
const WAVE_PERIOD = 50;

function wavePath(amplitude: number) {
  const half = WAVE_PERIOD / 2;
  let d = `M0 0 Q${half / 2} ${-amplitude * 2} ${half} 0`;
  for (let x = WAVE_PERIOD; x <= 200; x += half) {
    d += ` T${x} 0`;
  }
  return `${d} V140 H0 Z`;
}

const BACK_WAVE = wavePath(4.5);
const FRONT_WAVE = wavePath(3.5);

// At 0 the crests sit just above the bottom, so the circle reads as a vessel
// holding a little water; at 1 the troughs clear the top and it's covered.
function waterOffset(level: number) {
  return 96 - level * 108;
}

const FULL_AT = 0.995;

export function ScrollWater() {
  const waterRef = useRef<SVGGElement | null>(null);
  const readRef = useRef<HTMLSpanElement | null>(null);
  const [scrollable, setScrollable] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      const level = total > 0 ? Math.min(1, Math.max(0, scrollTop / total)) : 0;

      // Written straight to the DOM: no React render per scroll frame.
      if (waterRef.current) {
        waterRef.current.style.transform = `translateY(${waterOffset(level)}px)`;
      }
      if (readRef.current) {
        readRef.current.textContent = `${Math.round(level * 100)}% read`;
      }
      setScrollable(total > 4);
      setFull(level >= FULL_AT);
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    // Images and late content change the page height without a scroll.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
  }

  return (
    <button
      aria-label="Back to top"
      className={`site-chassis fixed bottom-4 left-4 z-40 size-10 cursor-pointer overflow-hidden rounded-full text-foreground ring-1 ring-foreground/10 transition-[opacity,transform] duration-300 ease-out hover:scale-105 motion-reduce:transition-none sm:bottom-6 sm:left-6 sm:size-11 ${
        scrollable ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={scrollToTop}
      tabIndex={scrollable ? 0 : -1}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <g
          className="transition-transform duration-200 ease-out motion-reduce:transition-none"
          ref={waterRef}
          style={{ transform: `translateY(${waterOffset(0)}px)` }}
        >
          <g className="animate-[scroll-water-drift_7s_linear_infinite] motion-reduce:animate-none">
            <path d={BACK_WAVE} fill="currentColor" opacity={0.3} />
          </g>
          <g className="animate-[scroll-water-drift_4.5s_linear_infinite_reverse] motion-reduce:animate-none">
            <path
              d={FRONT_WAVE}
              fill="currentColor"
              opacity={0.85}
              transform="translate(0 3)"
            />
          </g>
        </g>
      </svg>

      <ArrowUp
        aria-hidden="true"
        className={`absolute inset-0 m-auto size-4 text-background transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:size-[18px] ${
          full
            ? "translate-y-0 opacity-100 delay-150 duration-[350ms]"
            : "translate-y-1.5 opacity-0 duration-200"
        }`}
        strokeWidth={2.25}
      />

      <span className="sr-only" ref={readRef}>
        0% read
      </span>
    </button>
  );
}
