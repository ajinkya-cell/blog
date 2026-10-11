"use client";

import { cn } from "@workspace/tailwind-config/utils";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

// A scroll container whose native scrollbar is replaced by a ruler of ticks:
// a highlight glides along the ruler with the scroll position, and the ruler
// can be clicked or dragged to scrub. Ported from the page-level
// RulerScrollbar, without framer-motion, and bound to this container's own
// scroll instead of the window's.

/** Soft follow: the highlight glides after the scroll instead of snapping. */
const FOLLOW = { stiffness: 90, damping: 22, mass: 0.6 };
/** Hit area padding, so the thin ticks are easy to grab. */
const PAD_Y = 8;
/** Width of the highlight around the current position, as a fraction. */
const SPREAD = 0.08;
/** Extra width a tick gains at the current position (0.35 = +35%). */
const EXPAND = 0.35;
/** Resting tick opacity; the current position goes to 1. */
const MUTED_OPACITY = 0.18;

/** Ruler rhythm: a long tick every 10, a medium one every 5. */
function tickLength(index: number): number {
  if (index % 10 === 0) {
    return 12;
  }
  if (index % 5 === 0) {
    return 9;
  }
  return 6;
}

// One tick per ~8px of height keeps the rhythm even at any panel size.
function tickCount(height: number): number {
  return Math.min(56, Math.max(12, Math.round(height / 8)));
}

export function RulerScrollArea({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [ticks, setTicks] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  // Measure: show the ruler only when the list actually scrolls.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      return;
    }
    const measure = () => {
      setOverflowing(scroller.scrollHeight - scroller.clientHeight > 1);
      setTicks(tickCount(scroller.clientHeight - PAD_Y * 2));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    if (scroller.firstElementChild) {
      observer.observe(scroller.firstElementChild);
    }
    measure();
    return () => observer.disconnect();
  }, []);

  // Follow: a spring chases the scroll position and paints the ticks
  // directly, so scrolling never re-renders React.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!(scroller && overflowing && ticks > 0)) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const target = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      return max > 0 ? scroller.scrollTop / max : 0;
    };

    const paint = (progress: number) => {
      tickRefs.current.forEach((tick, index) => {
        if (!tick) {
          return;
        }
        const position = ticks > 1 ? index / (ticks - 1) : 0;
        // Bell curve: 1 at the current position, fading a few ticks out.
        const influence = Math.exp(-(((progress - position) / SPREAD) ** 2));
        tick.style.transform = `scaleX(${1 + EXPAND * influence})`;
        tick.style.opacity = `${MUTED_OPACITY + (1 - MUTED_OPACITY) * influence}`;
      });
    };

    let value = target();
    let velocity = 0;
    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000 || 1 / 60);
      last = now;
      const goal = target();
      const force =
        -FOLLOW.stiffness * (value - goal) - FOLLOW.damping * velocity;
      velocity += (force / FOLLOW.mass) * dt;
      value += velocity * dt;
      paint(value);
      if (Math.abs(goal - value) < 0.0001 && Math.abs(velocity) < 0.0001) {
        value = goal;
        paint(value);
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(step);
    };

    const onScroll = () => {
      if (reduceMotion) {
        value = target();
        paint(value);
        return;
      }
      if (frame === 0) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    };

    paint(value);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [overflowing, ticks]);

  function scrubTo(clientY: number) {
    const ruler = rulerRef.current;
    const scroller = scrollRef.current;
    if (!(ruler && scroller)) {
      return;
    }
    const rect = ruler.getBoundingClientRect();
    const usable = rect.height - PAD_Y * 2;
    const p = Math.min(1, Math.max(0, (clientY - rect.top - PAD_Y) / usable));
    scroller.scrollTop = p * (scroller.scrollHeight - scroller.clientHeight);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubTo(event.clientY);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      scrubTo(event.clientY);
    }
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          overflowing && "pr-6",
          className
        )}
        ref={scrollRef}
      >
        {children}
      </div>

      {overflowing ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-1 flex cursor-grab touch-none select-none flex-col items-end justify-between pl-2 opacity-85 transition-opacity duration-300 hover:opacity-100 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          ref={rulerRef}
          style={{ paddingTop: PAD_Y, paddingBottom: PAD_Y }}
        >
          {Array.from({ length: ticks }, (_, index) => (
            <span
              className="block h-[1.5px] shrink-0 origin-right rounded-full bg-foreground"
              key={index}
              ref={(node) => {
                tickRefs.current[index] = node;
              }}
              style={{ width: tickLength(index), opacity: MUTED_OPACITY }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
