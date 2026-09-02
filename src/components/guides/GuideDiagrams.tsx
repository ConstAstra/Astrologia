import type { ComponentType } from "react";

// Diagrammes réservés aux guides où un dessin vaut mieux qu'un paragraphe,
// même logique que MethodDiagrams pour la page /méthode : un schéma par
// concept réellement visuel, pas un par article.
type DiagramProps = { className?: string };

function AscendantHorizonDiagram({ className = "" }: DiagramProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg viewBox="0 0 220 120" className="h-28 w-full max-w-[220px]">
        <line x1="10" y1="80" x2="210" y2="80" stroke="currentColor" strokeWidth="1.5" className="text-border-soft" />
        <path d="M70 80a40 40 0 0 1 80 0" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-strong" />
        <circle cx="110" cy="80" r="3" fill="currentColor" className="text-gold-strong" />
        <line x1="110" y1="80" x2="110" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" className="text-violet" opacity="0.8" />
        <path d="M104 22 110 14 116 22" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-violet" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="max-w-xs text-center text-[11px] leading-snug text-muted">
        L&apos;Ascendant est le point de l&apos;écliptique qui touche l&apos;horizon Est au moment exact de la naissance, il tourne avec la rotation de la Terre.
      </p>
    </div>
  );
}

function AscendantHorizonDiagramEn({ className = "" }: DiagramProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg viewBox="0 0 220 120" className="h-28 w-full max-w-[220px]">
        <line x1="10" y1="80" x2="210" y2="80" stroke="currentColor" strokeWidth="1.5" className="text-border-soft" />
        <path d="M70 80a40 40 0 0 1 80 0" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-strong" />
        <circle cx="110" cy="80" r="3" fill="currentColor" className="text-gold-strong" />
        <line x1="110" y1="80" x2="110" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" className="text-violet" opacity="0.8" />
        <path d="M104 22 110 14 116 22" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-violet" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="max-w-xs text-center text-[11px] leading-snug text-muted">
        The Ascendant is the point of the ecliptic touching the eastern horizon at the exact moment of birth, it turns with the Earth&apos;s rotation.
      </p>
    </div>
  );
}

export const GUIDE_DIAGRAMS: Record<string, ComponentType<{ className?: string }>> = {
  ascendant: AscendantHorizonDiagram,
};

export const GUIDE_DIAGRAMS_EN: Record<string, ComponentType<{ className?: string }>> = {
  ascendant: AscendantHorizonDiagramEn,
};
