"use client";

import { useState, type ReactNode } from "react";

/**
 * Replie par défaut les paragraphes d'interprétation (signe, maison, degré)
 * d'une carte de la section Positions, sur le même principe que
 * CollapsibleAspects : avec ~13 points affichés d'un coup, tout déplié en
 * permanence noyait le Big 3 (Soleil/Lune/Ascendant, ouverts par défaut via
 * `defaultExpanded`) dans une masse de texte identique pour chaque point.
 */
export function CollapsiblePlanetDetails({
  children,
  expandLabel,
  collapseLabel,
  defaultExpanded = false,
}: {
  children: ReactNode;
  expandLabel: string;
  collapseLabel: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      {expanded && children}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-2 w-full rounded-lg border border-dashed border-border-soft px-3 py-1.5 text-center text-xs text-muted transition-colors hover:border-gold/40 hover:text-gold-strong"
      >
        {expanded ? collapseLabel : expandLabel}
      </button>
    </div>
  );
}
