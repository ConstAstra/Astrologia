"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Card";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Badge "série de jours consécutifs" dans la nav dashboard — passe au ton
 * pop (réservé aux moments de récompense, voir globals.css) à partir d'une
 * semaine, et pulse une fois à l'arrivée sur un palier (3, 7, 14, 30...
 * jours, voir MILESTONES dans src/lib/streak.ts).
 */
export function StreakBadge({
  streak,
  isNewMilestone,
  label,
}: {
  streak: number;
  isNewMilestone: boolean;
  label: string;
}) {
  const [pulse, setPulse] = useState(() => isNewMilestone && !prefersReducedMotion());

  useEffect(() => {
    if (!pulse) return;
    const timeout = setTimeout(() => setPulse(false), 1400);
    return () => clearTimeout(timeout);
  }, [pulse]);

  if (streak < 1) return null;

  return (
    <span className="relative inline-flex">
      <Badge tone={streak >= 7 ? "pop" : "gold"}>
        <span className="inline-flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c1 3-2 4.5-2 7.5a2 2 0 0 0 4 0c1.5 1.5 2 3.5 2 5a6 6 0 1 1-12 0c0-4 3-6 3.5-9C7.8 7 9 6.5 9 4.5 9 3.5 10 2.5 12 2Z" />
          </svg>
          {streak} {label}
        </span>
      </Badge>
      {pulse && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 20px 4px var(--pop-strong)", animation: "compat-pulse 1.4s ease-out 1" }}
        />
      )}
    </span>
  );
}
