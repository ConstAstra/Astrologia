"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Chaque page (route App Router) est déjà remontée par Next au changement
// d'URL ; on ajoute juste un fondu doux à cette transition existante en
// remontant ce wrapper via key={pathname}, ce qui relance l'animation CSS.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade-in flex min-h-full flex-1 flex-col">
      {children}
    </div>
  );
}
