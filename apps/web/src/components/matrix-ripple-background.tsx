"use client";

import { useEffect, useRef } from "react";

// Matrix character set: Half-width Katakana, digits, math/code symbols, and Latin uppercase
const MATRIX_CHARS =
  "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789+-*/=<>!?#$%&@~^ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  maxRadius: number;
  speed: number; // px per second
  waveWidth: number; // px width of the ripple wave crest
  duration: number; // ms until wave fully dissipates
}

interface Cell {
  char: string;
  baseOpacity: number;
  ambientCooldown: number;
}

export function MatrixRippleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Grid configuration
    const colSpacing = 20;
    const rowSpacing = 22;
    let cols = 0;
    let rows = 0;
    let grid: Cell[][] = [];

    const ripples: Ripple[] = [];

    function getRandomChar(): string {
      return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? "0";
    }

    function initGrid() {
      cols = Math.ceil(width / colSpacing) + 1;
      rows = Math.ceil(height / rowSpacing) + 1;
      grid = [];

      for (let r = 0; r < rows; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < cols; c++) {
          row.push({
            char: getRandomChar(),
            baseOpacity: 0.035 + Math.random() * 0.03, // Delicate 3.5% - 6.5% resting opacity
            ambientCooldown: Math.floor(Math.random() * 300),
          });
        }
        grid.push(row);
      }
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx?.scale(dpr, dpr);
      initGrid();
    }

    resize();
    window.addEventListener("resize", resize);

    // Global click listener to initiate ripple anywhere on the screen
    function handleClick(e: MouseEvent | TouchEvent) {
      const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const clientY = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

      ripples.push({
        x: clientX,
        y: clientY,
        startTime: performance.now(),
        maxRadius: Math.hypot(width, height) * 0.95,
        speed: 720,
        waveWidth: 130,
        duration: 2200,
      });
    }

    window.addEventListener("pointerdown", handleClick, { passive: true });

    // Animation render loop
    let lastTime = performance.now();

    function render(now: number) {
      if (!ctx) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Check current color mode
      const isDark = document.documentElement.classList.contains("dark");

      // Filter active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        if (!ripple) continue;
        const age = now - ripple.startTime;
        if (age > ripple.duration) {
          ripples.splice(i, 1);
        }
      }

      ctx.font = '12px "Geist Mono", "JetBrains Mono", Menlo, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const hasActiveRipples = ripples.length > 0;

      // Render cells
      for (let r = 0; r < rows; r++) {
        const cellY = r * rowSpacing;
        const row = grid[r];
        if (!row) continue;

        for (let c = 0; c < cols; c++) {
          const cell = row[c];
          if (!cell) continue;

          const cellX = c * colSpacing;

          // Ambient subtle character mutation
          cell.ambientCooldown--;
          if (cell.ambientCooldown <= 0) {
            cell.char = getRandomChar();
            cell.ambientCooldown = 200 + Math.floor(Math.random() * 400);
          }

          // Calculate ripple influence
          let waveIntensity = 0;

          if (hasActiveRipples) {
            for (let i = 0; i < ripples.length; i++) {
              const ripple = ripples[i];
              if (!ripple) continue;

              const elapsed = (now - ripple.startTime) / 1000;
              const currentRadius = elapsed * ripple.speed;
              const dist = Math.hypot(cellX - ripple.x, cellY - ripple.y);

              const distDiff = Math.abs(dist - currentRadius);
              if (distDiff < ripple.waveWidth) {
                // Gaussian wave crest profile
                const sigma = ripple.waveWidth * 0.38;
                const gaussian = Math.exp(
                  -(distDiff * distDiff) / (2 * sigma * sigma)
                );
                // Decay as ripple moves outward and ages
                const distanceDecay = Math.max(
                  0,
                  1 - currentRadius / ripple.maxRadius
                );
                const timeDecay = Math.max(
                  0,
                  1 - (now - ripple.startTime) / ripple.duration
                );

                const currentWaveIntensity =
                  gaussian * distanceDecay * timeDecay;

                if (currentWaveIntensity > waveIntensity) {
                  waveIntensity = currentWaveIntensity;
                }
              }
            }
          }

          // If hit by ripple, scramble character rapidly
          let displayChar = cell.char;
          if (waveIntensity > 0.12 && Math.random() < 0.45) {
            displayChar = getRandomChar();
            cell.char = displayChar;
          }

          // Final opacity and color blending
          const totalOpacity = Math.min(
            0.92,
            cell.baseOpacity + waveIntensity * 0.8
          );

          if (waveIntensity > 0.05) {
            // Ripple wave crest color (#7577E6 violet-indigo glow)
            if (isDark) {
              // Radiant blurple glow in dark mode
              ctx.fillStyle = `rgba(117, 119, 230, ${totalOpacity})`;
            } else {
              // Deep crisp blurple in light mode
              ctx.fillStyle = `rgba(99, 102, 220, ${totalOpacity})`;
            }
          } else {
            // Resting state: ultra-subtle ambient ink
            if (isDark) {
              ctx.fillStyle = `rgba(200, 205, 255, ${cell.baseOpacity})`;
            } else {
              ctx.fillStyle = `rgba(15, 23, 42, ${cell.baseOpacity})`;
            }
          }

          ctx.fillText(displayChar, cellX, cellY);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-100 transition-opacity duration-700"
      ref={canvasRef}
    />
  );
}
