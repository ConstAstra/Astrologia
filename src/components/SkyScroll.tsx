"use client";

import { useEffect } from "react";

/**
 * Fait glisser la fenêtre visible du dégradé .sky-scroll (voir globals.css)
 * du haut (soleil) vers le bas (nuit/lune) au fil du scroll de la page :
 * --sky-progress passe de 0% en haut de page à 100% en bas. Pose aussi
 * --star-parallax : le champ d'étoiles (.starfield) dérive un peu plus
 * lentement que le contenu, plafonné pour rester discret même sur une
 * page qui défile beaucoup.
 */
export function SkyScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    function update() {
      raf = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      document.documentElement.style.setProperty("--sky-progress", `${(progress * 100).toFixed(2)}%`);
      const parallax = Math.min(28, window.scrollY * 0.04);
      document.documentElement.style.setProperty("--star-parallax", `${(-parallax).toFixed(1)}px`);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="sky-scroll" aria-hidden="true" />;
}
