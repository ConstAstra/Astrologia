import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-border-soft bg-surface backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-strong/90">{children}</p>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "sage" | "terracotta" }) {
  const toneClasses = {
    neutral: "border-border-soft text-muted",
    gold: "border-gold/40 text-gold-strong bg-gold/10",
    sage: "border-sage/40 text-sage bg-sage/10",
    terracotta: "border-terracotta/40 text-terracotta bg-terracotta/10",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}
