"use client";

import { useEffect, useState } from "react";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import type { ZodiacSign } from "@/lib/astro/types";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIMATION_DURATION_MS = 1400;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function tierColor(pct: number): string {
  if (pct >= 75) return "var(--gold-strong)";
  if (pct >= 50) return "var(--sage)";
  return "var(--terracotta)";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Compteur animé de compatibilité (%) avec les deux avatars pixel qui
 * glissent l'un vers l'autre à l'arrivée, un anneau qui se remplit en
 * rythme avec le chiffre, et un pulse lumineux une fois l'animation
 * terminée. Respecte prefers-reduced-motion (affiche directement le
 * résultat final, sans transition).
 */
export function CompatibilityMeter({
  percentage,
  seedA,
  seedB,
  sunA,
  sunB,
  label,
}: {
  percentage: number;
  seedA: string;
  seedB: string;
  sunA?: ZodiacSign;
  sunB?: ZodiacSign;
  label?: string;
}) {
  const reduced = prefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? percentage : 0);
  const [mounted, setMounted] = useState(reduced);
  const [settled, setSettled] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    let start: number | null = null;
    let raf: number;

    function tick(now: number) {
      if (start === null) {
        start = now;
        setMounted(true);
      }
      const t = Math.min(1, (now - start) / ANIMATION_DURATION_MS);
      setDisplay(Math.round(easeOutCubic(t) * percentage));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setSettled(true);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage]);

  const color = tierColor(percentage);
  const offset = CIRCUMFERENCE - (display / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-3">
      {label && <p className="text-xs uppercase tracking-wide text-muted">{label}</p>}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <div
          className={`transition-all duration-700 ease-out ${mounted ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
        >
          <PixelAvatar seed={seedA} sunSign={sunA} size={64} />
        </div>

        <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border-soft)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: reduced ? undefined : "stroke-dashoffset 80ms linear, stroke 500ms ease" }}
            />
          </svg>
          <span className="font-display text-3xl" style={{ color }}>
            {display}%
          </span>
          {settled && !reduced && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 24px 2px ${color}55`, animation: "compat-pulse 1.8s ease-out 1" }}
            />
          )}
        </div>

        <div
          className={`transition-all duration-700 ease-out ${mounted ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"}`}
        >
          <PixelAvatar seed={seedB} sunSign={sunB} size={64} />
        </div>
      </div>
    </div>
  );
}
