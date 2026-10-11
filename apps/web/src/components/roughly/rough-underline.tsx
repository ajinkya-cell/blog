"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// From Void UI's Roughly (voidui.in/roughly). The "wavy" variant, which needs
// framer-motion, is left out; single and double are unchanged.

export type UnderlineVariant = "single" | "double";

export interface RoughUnderlineProps {
  children: React.ReactNode;
  /** Underline mode: 'single' | 'double' (default: 'single') */
  variant?: UnderlineVariant;
  /** Underline stroke color (default: "#6366F1") */
  color?: string;
  /** Stroke thickness in pixels (default: 2) */
  strokeWidth?: number;
  /** Drawing animation duration in milliseconds (default: 650) */
  animationDuration?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Delay before animation starts in milliseconds (default: 0) */
  animationDelay?: number;
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for the inner text */
  textClassName?: string;
}

export function RoughUnderline({
  children,
  variant = "single",
  color = "#6366F1",
  strokeWidth = 2,
  animationDuration = 650,
  animate: animateProp = true,
  animationDelay = 0,
  className = "",
  textClassName = "",
}: RoughUnderlineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  // Reduced motion: draw the mark already finished.
  const animate = animateProp && !prefersReducedMotion();
  const [inView, setInView] = useState(!animate);

  // Viewport intersection observer to trigger drawing when scrolled into view
  useEffect(() => {
    if (!animate) {
      setInView(true);
      return undefined;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  // rough-notation lifecycle
  useEffect(() => {
    const el = textRef.current;
    if (!el || !inView) return undefined;

    let isMounted = true;

    const createAnnotation = () => {
      if (!isMounted || !textRef.current) return;

      if (annotationRef.current) {
        try {
          annotationRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        annotationRef.current = null;
      }

      const iterations = variant === "single" ? 1 : 2;

      const annotation = annotate(textRef.current, {
        type: "underline",
        color,
        strokeWidth,
        padding: [0, 2, 4, 2],
        animate,
        animationDuration,
        iterations,
        multiline: true,
      });

      annotationRef.current = annotation;

      if (animationDelay > 0) {
        const timer = setTimeout(() => {
          if (isMounted && annotationRef.current) {
            annotation.show();
          }
        }, animationDelay);
        return () => clearTimeout(timer);
      }
      annotation.show();
      return undefined;
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(createAnnotation).catch(createAnnotation);
    } else {
      createAnnotation();
    }

    return () => {
      isMounted = false;
      if (annotationRef.current) {
        try {
          annotationRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        annotationRef.current = null;
      }
    };
  }, [
    inView,
    variant,
    color,
    strokeWidth,
    animationDuration,
    animate,
    animationDelay,
    children,
  ]);

  return (
    <span className={`relative inline ${className}`} ref={containerRef}>
      <span className={`relative z-10 ${textClassName}`} ref={textRef}>
        {children}
      </span>
    </span>
  );
}
