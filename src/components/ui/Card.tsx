import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  interactive = false,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; interactive?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-border-soft bg-surface shadow-[inset_0_1px_0_0_#ffffff14,0_12px_32px_-20px_#00000080] backdrop-blur-sm ${interactive ? "tile-interactive cursor-pointer" : ""} ${className}`}
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

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "sage" | "terracotta" | "pop" }) {
  const toneClasses = {
    neutral: "border-border-soft text-muted",
    gold: "border-gold/40 text-gold-strong bg-gold/10",
    sage: "border-sage/40 text-sage bg-sage/10",
    terracotta: "border-terracotta/40 text-terracotta bg-terracotta/10",
    pop: "border-pop/50 text-pop-strong bg-pop/15",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}
