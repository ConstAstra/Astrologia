import type { PlanetKey, ZodiacSign } from "../types";

// Maîtrise moderne : les signes gouvernés historiquement par une seule
// planète "classique" avant la découverte des planètes lentes gardent leur
// règle traditionnelle (Bélier-Mars, Taureau-Vénus...) ; Scorpion, Verseau et
// Poissons suivent la règle moderne la plus répandue (Pluton, Uranus,
// Neptune) plutôt que leurs maîtres classiques (Mars, Saturne, Jupiter),
// cohérent avec le reste de l'app qui traite déjà ces trois planètes comme
// des acteurs à part entière du thème.
export const SIGN_RULER: Record<ZodiacSign, PlanetKey> = {
  belier: "mars",
  taureau: "venus",
  gemeaux: "mercury",
  cancer: "moon",
  lion: "sun",
  vierge: "mercury",
  balance: "venus",
  scorpion: "pluto",
  sagittaire: "jupiter",
  capricorne: "saturn",
  verseau: "uranus",
  poissons: "neptune",
};

export function ascendantRulerOf(ascendantSign: ZodiacSign): PlanetKey {
  return SIGN_RULER[ascendantSign];
}
