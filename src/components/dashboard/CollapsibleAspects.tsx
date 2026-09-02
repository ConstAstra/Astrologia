"use client";

import { useState, type ReactNode } from "react";

/**
 * Liste d'aspects majeurs toujours visibles, aspects mineurs repliés
 * derrière un bouton : un thème complet peut avoir 15-20 aspects, tous
 * rendus avec la même formule de phrase — les afficher tous d'un bloc noie
 * les plus structurants (les majeurs) dans la masse plutôt que de les mettre
 * en avant. Les nœuds React (déjà mis en forme côté serveur, avec labels
 * traduits) sont passés en props plutôt qu'une fonction de rendu, qui ne
 * peut pas franchir la frontière serveur/client.
 */
export function CollapsibleAspects({
  major,
  minor,
  minorCount,
  showMoreLabel,
  showLessLabel,
}: {
  major: ReactNode;
  minor: ReactNode;
  minorCount: number;
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (minorCount === 0) {
    return <div className="space-y-3">{major}</div>;
  }

  return (
    <div className="space-y-3">
      {major}
      {expanded && minor}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full rounded-xl border border-dashed border-border-soft px-4 py-3 text-center text-xs text-muted transition-colors hover:border-gold/40 hover:text-gold-strong"
      >
        {expanded ? showLessLabel : showMoreLabel}
      </button>
    </div>
  );
}
