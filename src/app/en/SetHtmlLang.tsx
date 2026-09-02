"use client";

import { useEffect } from "react";

// Le <html lang="fr"> racine est fixé dans le layout global (partagé avec
// les pages françaises non préfixées) : une vraie section /[lang] séparée
// demanderait de déplacer tout l'arbre existant, hors scope de cette
// première phase de traduction. Correctif léger côté client en attendant.
export function SetHtmlLang() {
  useEffect(() => {
    document.documentElement.lang = "en";
    return () => {
      document.documentElement.lang = "fr";
    };
  }, []);
  return null;
}
