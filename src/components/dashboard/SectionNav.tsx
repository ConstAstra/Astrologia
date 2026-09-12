"use client";

import { useEffect, useState } from "react";

export interface SectionNavItem {
  id: string;
  label: string;
}

/**
 * Petite nav de section flottante, sous l'en-tête sticky du dashboard, pour
 * les pages longues (thème natal, synastrie, composite, révolution solaire) :
 * sans elle, la seule façon de se repérer est de dérouler des milliers de
 * pixels de cartes qui se ressemblent toutes. La section active est déduite
 * du scroll (IntersectionObserver) plutôt que d'un état choisi par un clic,
 * pour rester juste même si l'utilisateur arrive par une ancre ou la molette.
 */
export function SectionNav({ sections }: { sections: SectionNavItem[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const [topOffset, setTopOffset] = useState(64);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    function measure() {
      if (header) setTopOffset(header.getBoundingClientRect().height);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const elements = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: `-${Math.round(topOffset) + 16}px 0px -65% 0px`, threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join(","), topOffset]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Sections de la page"
      className="sticky z-30 mb-6 overflow-x-auto rounded-full border border-border-soft bg-background/90 px-2 py-2 backdrop-blur-md"
      style={{ top: topOffset }}
    >
      <div className="flex gap-1.5 sm:justify-center">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
              active === s.id ? "bg-gold/15 text-gold-strong" : "text-muted hover:bg-gold/5 hover:text-foreground"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
