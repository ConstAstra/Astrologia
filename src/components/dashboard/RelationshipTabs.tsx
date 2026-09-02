import Link from "next/link";
import { RELATIONSHIP_META, RELATIONSHIP_TYPES } from "@/lib/astro/interpretations/relationship";
import { RELATIONSHIP_META_EN } from "@/lib/astro/interpretations/relationship.en";
import type { RelationshipType } from "@/lib/astro/interpretations/relationship";

export function RelationshipTabs({
  active,
  basePath,
  a,
  b,
  locale = "fr",
}: {
  active: RelationshipType;
  basePath: string;
  a: string;
  b: string;
  locale?: "fr" | "en";
}) {
  const meta = locale === "en" ? RELATIONSHIP_META_EN : RELATIONSHIP_META;
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {RELATIONSHIP_TYPES.map((type) => (
        <Link
          key={type}
          href={`${basePath}?a=${a}&b=${b}&relation=${type}`}
          className={`rounded-full border px-3 py-1 ${
            active === type
              ? "border-gold/50 bg-gold/10 text-gold-strong"
              : "border-border-soft text-muted hover:text-foreground"
          }`}
        >
          {meta[type].label}
        </Link>
      ))}
    </div>
  );
}
