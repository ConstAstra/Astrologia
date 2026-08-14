"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { ChartDomains } from "@/lib/astro/interpretations/chart-domains";
import { Card, Eyebrow } from "@/components/ui/Card";

type ChapterKey = keyof ChartDomains;

const CHAPTER_ORDER: ChapterKey[] = ["general", "love", "money", "career", "spiritual"];

const CHAPTER_ICON: Record<ChapterKey, string> = {
  general: "✦",
  love: "♡",
  money: "◆",
  career: "▲",
  spiritual: "✧",
};

const CHAPTER_LABEL: Record<"fr" | "en", Record<ChapterKey, string>> = {
  fr: {
    general: "Vue d'ensemble",
    love: "Amour",
    money: "Argent",
    career: "Carrière",
    spiritual: "Spiritualité",
  },
  en: {
    general: "Overview",
    love: "Love",
    money: "Money",
    career: "Career",
    spiritual: "Spiritual",
  },
};

/**
 * La petite "animation grimoire" : une synthèse condensée du thème mise
 * bout à bout en cinq chapitres qu'on feuillette, plutôt qu'un pavé unique.
 * Volontairement sans détail d'aspect (déjà couvert plus bas sur la page) :
 * `aspectsNote` rappelle une seule fois où retrouver ce niveau de détail,
 * pas à chaque chapitre.
 */
export function GrimoireReveal({
  domains,
  title,
  subtitle,
  aspectsNote,
  locale = "fr",
}: {
  domains: ChartDomains;
  title: string;
  subtitle: string;
  aspectsNote: string;
  locale?: "fr" | "en";
}) {
  const [active, setActive] = useState<ChapterKey>("general");
  const labels = CHAPTER_LABEL[locale];

  return (
    <Card className="overflow-hidden p-6">
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-1 text-xs text-muted/70">{subtitle}</p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist">
        {CHAPTER_ORDER.map((key, i) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(key)}
              className={`stagger-item relative flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-gold/60 bg-gold/10 text-gold-strong"
                  : "border-border-soft text-muted hover:text-foreground"
              }`}
              style={{ "--stagger-i": i } as CSSProperties}
            >
              <span className={isActive ? "grimoire-glow" : ""} aria-hidden="true">
                {CHAPTER_ICON[key]}
              </span>
              {labels[key]}
            </button>
          );
        })}
      </div>

      <div key={active} className="grimoire-page-in mt-5 border-t border-border-soft pt-5">
        <p className="text-sm leading-relaxed text-muted sm:text-base">{domains[active]}</p>
      </div>

      <p className="mt-6 border-t border-border-soft pt-4 text-xs italic text-muted/70">{aspectsNote}</p>
    </Card>
  );
}
