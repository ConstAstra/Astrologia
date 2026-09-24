import type { ZodiacSign } from "@/lib/astro/types";

// Illustration décorative en fine ligne blanche du signe, générée puis
// détourée en PNG transparent (voir public/zodiac/) — posée en fond très
// discret derrière les héros horoscope/compatibilité, jamais devant le
// texte. Le scintillement (.zodiac-glyph-bg) est purement en opacité, donc
// invisible pour le SEO/l'accessibilité (juste une image aria-hidden).
export function ZodiacGlyphBg({ sign, className = "" }: { sign: ZodiacSign; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/zodiac/${sign}.png`}
      alt=""
      aria-hidden="true"
      className={`zodiac-glyph-bg pointer-events-none select-none ${className}`}
    />
  );
}
