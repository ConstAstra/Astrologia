import Link from "next/link";
import { RELATIONSHIP_META, RELATIONSHIP_TYPES } from "@/lib/astro/interpretations/relationship";
import type { RelationshipType } from "@/lib/astro/interpretations/relationship";

export function RelationshipTabs({
  active,
  basePath,
  a,
  b,
}: {
  active: RelationshipType;
  basePath: string;
  a: string;
  b: string;
}) {
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
          {RELATIONSHIP_META[type].label}
        </Link>
      ))}
    </div>
  );
}
