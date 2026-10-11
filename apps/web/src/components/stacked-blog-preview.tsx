"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BlogCard } from "@/components/blog-card";
import type { Blog } from "@/types";

interface StackedBlogPreviewProps {
  blogs: Blog[];
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function StackedBlogPreview({
  blogs,
}: Readonly<StackedBlogPreviewProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);
  // The back cards render flat behind the front card, then tilt out once
  // after first paint — the "about to come out" moment.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    // Two frames so the flat pose is painted before the transition starts.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSettled(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function startAnimation() {
      if (animFrameRef.current !== null) return;

      const tick = () => {
        const diff = targetProgressRef.current - currentProgressRef.current;
        if (Math.abs(diff) > 0.002) {
          currentProgressRef.current += diff * 0.16;
          setProgress(currentProgressRef.current);
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          currentProgressRef.current = targetProgressRef.current;
          setProgress(targetProgressRef.current);
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
    }

    function handleWheel(e: WheelEvent) {
      const isAtTop = window.scrollY <= 2;
      const isFullyRevealed =
        targetProgressRef.current >= 1 && currentProgressRef.current >= 0.98;

      if (isAtTop) {
        if (e.deltaY > 0 && !isFullyRevealed) {
          e.preventDefault();
          const step = Math.min(Math.max(e.deltaY * 0.0018, 0.04), 0.22);
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + step
          );
          startAnimation();
        } else if (e.deltaY < 0 && targetProgressRef.current > 0) {
          e.preventDefault();
          const step = Math.min(
            Math.max(Math.abs(e.deltaY) * 0.0018, 0.04),
            0.22
          );
          targetProgressRef.current = Math.max(
            0,
            targetProgressRef.current - step
          );
          startAnimation();
        }
      }
    }

    let touchStartY = 0;
    function handleTouchStart(e: TouchEvent) {
      if (e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!e.touches[0]) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      const isAtTop = window.scrollY <= 2;
      const isFullyRevealed =
        targetProgressRef.current >= 1 && currentProgressRef.current >= 0.98;

      if (isAtTop) {
        if (deltaY > 0 && !isFullyRevealed) {
          if (e.cancelable) e.preventDefault();
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + deltaY * 0.0035
          );
          touchStartY = currentY;
          startAnimation();
        } else if (deltaY < 0 && targetProgressRef.current > 0) {
          if (e.cancelable) e.preventDefault();
          targetProgressRef.current = Math.max(
            0,
            targetProgressRef.current + deltaY * 0.0035
          );
          touchStartY = currentY;
          startAnimation();
        }
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      const isAtTop = window.scrollY <= 2;
      const isFullyRevealed =
        targetProgressRef.current >= 1 && currentProgressRef.current >= 0.98;

      if (isAtTop) {
        if (
          ["ArrowDown", "PageDown", " "].includes(e.key) &&
          !isFullyRevealed
        ) {
          e.preventDefault();
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + 0.34
          );
          startAnimation();
        } else if (
          ["ArrowUp", "PageUp"].includes(e.key) &&
          targetProgressRef.current > 0
        ) {
          e.preventDefault();
          targetProgressRef.current = Math.max(
            0,
            targetProgressRef.current - 0.34
          );
          startAnimation();
        }
      }
    }

    function handleScroll() {
      // If user navigated or jumped down the page, keep cards fully unfurled
      if (window.scrollY > 20 && targetProgressRef.current < 1) {
        targetProgressRef.current = 1;
        currentProgressRef.current = 1;
        setProgress(1);
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const blog0 = blogs[0];
  if (!blog0) {
    return null;
  }

  const blog1 = blogs[1] ?? blog0;
  const blog2 = blogs[2] ?? blog0;

  const eased = easeOutCubic(progress);

  // Responsive spread distance
  const isDesktop = windowWidth >= 1140;
  const isTablet = windowWidth >= 768 && windowWidth < 1140;

  // Horizontal spread offset for left and right cards
  const spreadX = isDesktop ? 395 : isTablet ? 320 : 0;
  // Vertical spread offset for mobile
  const spreadY = isDesktop || isTablet ? 0 : 210;
  // Resting pose of the back cards: held like a hand of cards, tilted from
  // their bottom edge so only the top corners fan out past the front card.
  // Every value eases to neutral (0 / 1) as the cards come out.
  const isNarrow = !(isDesktop || isTablet);
  const rest = {
    card1: {
      tilt: isNarrow ? -3 : -4,
      lift: 9,
      scale: 0.97,
      brightness: 0.86,
    },
    card2: {
      tilt: isNarrow ? 3.5 : 5,
      lift: 16,
      scale: 0.94,
      brightness: 0.74,
    },
  };
  // Before the entrance settles the cards sit flat and hidden behind card 0.
  const pose = settled ? 1 : 0;
  // The tilt resolves a little ahead of the slide, so cards land flat.
  const unTilt = easeOutCubic(Math.min(1, progress * 1.25));
  // The slivers are too thin to hover meaningfully, so the back cards only
  // become interactive once they've fanned out.
  const backPointerEvents = eased < 0.5 ? "none" : "auto";
  // The CSS transition only carries the entrance; once scrolling starts the
  // rAF loop drives every frame and a transition would make it lag.
  const entranceTransition = (delay: number) =>
    progress === 0
      ? `transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, filter 700ms ease-out ${delay}ms`
      : "none";

  function backCardStyle(
    card: (typeof rest)["card1"],
    x: number,
    y: number,
    zIndex: number,
    delay: number
  ) {
    const atRest = pose * (1 - eased);
    const tilt = card.tilt * pose * (1 - unTilt);
    const scale = 1 - (1 - card.scale) * atRest;
    const brightness = 1 - (1 - card.brightness) * atRest;
    return {
      transform: `translate3d(${x}px, ${y - card.lift * atRest}px, 0px) rotate(${tilt}deg) scale(${scale})`,
      filter: `brightness(${brightness})`,
      transition: entranceTransition(delay),
      zIndex,
      pointerEvents: backPointerEvents,
    } as const;
  }

  // Card 0 (Center/Front)
  const card0Style = {
    transform: `translate3d(0px, 0px, 0px) scale(1) rotate(0deg)`,
    zIndex: 30,
    opacity: 1,
  };

  // Card 1 (Left Card - comes from behind to the left)
  const card1Style = backCardStyle(
    rest.card1,
    isNarrow ? -eased * 16 : -eased * spreadX,
    eased * spreadY,
    20,
    0
  );

  // Card 2 (Right Card - comes from behind to the right)
  const card2Style = backCardStyle(
    rest.card2,
    isNarrow ? eased * 16 : eased * spreadX,
    eased * (spreadY * 2),
    10,
    120
  );

  return (
    <section
      className="relative flex min-h-[calc(100dvh-5.5rem)] w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-6 sm:pt-8 sm:pb-8"
      ref={containerRef}
    >
      {/* Headline positioned cleanly at the top */}
      <div className="relative z-40 mb-6 sm:mb-8 text-center select-none">
        <h1 className="text-balance font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-foreground">
          <span>I write </span>
          <Link
            className="font-serif italic font-instrument-serif text-foreground transition-colors hover:text-[#7577E6]"
            href="/blog"
          >
            blogs
          </Link>
          <span> too</span>
        </h1>
      </div>

      {/* 3-Card Interactive Stage */}
      <div
        className="relative flex items-center justify-center w-full max-w-6xl transition-all duration-300"
        style={{
          minHeight: isDesktop || isTablet ? "480px" : `${460 + eased * 420}px`,
        }}
      >
        {/* All three cards share this box's top edge, so the back cards'
            peek doesn't depend on how tall each card's content is. */}
        <div className="relative w-[310px] sm:w-[350px] md:w-[370px]">
          {/* Card 1 (Left in final state, stacked behind in start state) */}
          <div
            className="absolute inset-x-0 top-0 origin-bottom will-change-transform motion-reduce:transition-none!"
            style={card1Style}
          >
            <div className="rounded-2xl bg-background shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1">
              <BlogCard blog={blog1} />
            </div>
          </div>

          {/* Card 2 (Right in final state, stacked behind in start state) */}
          <div
            className="absolute inset-x-0 top-0 origin-bottom will-change-transform motion-reduce:transition-none!"
            style={card2Style}
          >
            <div className="rounded-2xl bg-background shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1">
              <BlogCard blog={blog2} />
            </div>
          </div>

          {/* Card 0 (Center - in front at start state) */}
          <div
            className="relative origin-center transition-shadow duration-300 will-change-transform"
            style={card0Style}
          >
            <div className="rounded-2xl bg-background shadow-2xl transition-transform hover:-translate-y-1 ring-1 ring-border/50">
              <BlogCard blog={blog0} />
            </div>
          </div>
        </div>
      </div>

      {/* Explore all link button below cards */}
      <div className="relative z-40 mt-8 sm:mt-10">
        <Link
          className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm transition-all hover:border-[#7577E6]/40 hover:text-foreground hover:shadow-sm"
          href="/blog"
        >
          <span>View all articles</span>
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
