"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Card, Eyebrow } from "@/components/ui/Card";
import { playGrimoireChime } from "@/lib/sound/grimoire-chime";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { hint: string; coverTitle: string; ariaOpen: string }> = {
  fr: { hint: "Touchez pour ouvrir", coverTitle: "Grimoire", ariaOpen: "Ouvrir le grimoire" },
  en: { hint: "Tap to open", coverTitle: "Grimoire", ariaOpen: "Open the grimoire" },
};

const SPARK_COUNT = 12;
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (Math.PI * 2 * i) / SPARK_COUNT + (i % 2 ? 0.2 : -0.15);
  const dist = 46 + ((i * 7) % 30);
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    delay: 0.5 + (i % 5) * 0.08,
  };
});

/**
 * Couverture de grimoire qui s'ouvre en 3D (fermoir doré, halo de lumière,
 * gerbe d'étincelles, carillon synthétisé) : le moment "magique" d'un seul
 * coup, joué une seule fois par lecture (voir GrimoireOpeningReveal, qui
 * mémorise le passage et bascule ensuite vers le grimoire habituel à
 * onglets). Ne contient aucun contenu de chapitre : le texte réel, de
 * longueur variable, vit uniquement dans GrimoireReveal, jamais dans une
 * "page" à hauteur fixe qui le tronquerait.
 */
export function GrimoireBookIntro({
  title,
  subtitle,
  locale = "fr",
  onOpened,
}: {
  title: string;
  subtitle: string;
  locale?: Locale;
  onOpened: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const t = TEXT[locale];

  function open() {
    if (opening) return;
    setOpening(true);
    playGrimoireChime();

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onOpened();
    };
    const cover = coverRef.current;
    if (cover) {
      cover.addEventListener("transitionend", finish, { once: true });
    }
    // Repli si l'événement de transition ne se déclenche pas (mouvement réduit, etc.).
    window.setTimeout(finish, 1150);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  }

  return (
    <Card className="overflow-hidden p-6">
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-1 text-xs text-muted/70">{subtitle}</p>

      <div className="mt-8 flex flex-col items-center py-6">
        <div className="grimoire-book-wrap relative" style={{ width: 200, height: 264 }}>
          <div
            className={`grimoire-ambient-glow pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full ${opening ? "is-open" : ""}`}
            style={{ background: "radial-gradient(circle, #f2b79955 0%, #e8935f22 45%, transparent 72%)" }}
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-4 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-full blur-md"
            style={{ background: "radial-gradient(ellipse at center, #000000aa 0%, transparent 72%)" }}
            aria-hidden="true"
          />

          <div
            ref={coverRef}
            role="button"
            tabIndex={0}
            aria-label={t.ariaOpen}
            onClick={open}
            onKeyDown={handleKeyDown}
            className={`grimoire-book-cover relative h-full w-full cursor-pointer rounded-r-lg rounded-l-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-strong focus-visible:outline-offset-4 ${opening ? "is-open" : ""}`}
          >
            <div
              className="grimoire-book-face absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-r-lg rounded-l-md"
              style={{
                background:
                  "radial-gradient(140% 100% at 15% 0%, #532634 0%, transparent 55%), linear-gradient(155deg, #532634 0%, #3a1a20 45%, #1c0c11 100%)",
                boxShadow: "0 20px 55px -14px #00000095, inset 0 0 0 1px #00000060",
              }}
            >
              <div className="pointer-events-none absolute inset-[10px] rounded-[5px] border border-gold/30" aria-hidden="true" />
              <svg viewBox="0 0 48 48" fill="none" className="h-11 w-11 text-gold-strong drop-shadow-[0_0_10px_#e8935f55]" aria-hidden="true">
                <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.1" />
                <path d="M24 2v44M2 24h44M8 8l32 32M40 8 8 40" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                <circle cx="24" cy="24" r="3.4" fill="currentColor" />
              </svg>
              <p className="font-display text-lg uppercase tracking-[0.22em] text-gold-strong">{t.coverTitle}</p>
              <div
                className={`grimoire-clasp absolute right-[-6px] top-1/2 h-11 w-4 -translate-y-1/2 rounded-[3px] ${opening ? "opacity-0 transition-opacity duration-200" : ""}`}
                style={{ background: "linear-gradient(180deg, #f2b799, #e8935f)", boxShadow: "0 0 0 1px #00000050" }}
                aria-hidden="true"
              >
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c0c11]" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className={`absolute left-1/2 top-[38%] h-[5px] w-[5px] rounded-full bg-gold-strong text-gold-strong ${
                  opening ? "grimoire-spark" : "opacity-0"
                }`}
                style={
                  {
                    "--dx": `${s.dx}px`,
                    "--dy": `${s.dy}px`,
                    "--sd": `${s.delay}s`,
                    boxShadow: "0 0 6px 1px currentColor",
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">{t.hint}</p>
      </div>
    </Card>
  );
}
