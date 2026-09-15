import type { ComponentType } from "react";
import { OverlapIcon, MergeIcon } from "@/components/icons/FeatureIcons";
import {
  RetrogradeLoopIcon,
  TwelveHousesIcon,
  HorizonRiseIcon,
  OpenBookIcon,
  AspectAngleIcon,
  SaturnGlyphIcon,
  LunarNodeIcon,
  ScaleIcon,
  UnevenWheelIcon,
  MinorPointsIcon,
} from "@/components/icons/GuideIcons";

// Une icône par concept de guide, indexée par slug (identique fr/en). Les
// slugs qui parlent du même objet partagent volontairement la même icône
// (les deux guides sur les rétrogrades, composite vs Davison qui réutilise
// l'icône "fusion" de la page méthode) plutôt que d'en inventer une par
// article coûte que coûte.
export const GUIDE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "mercure-retrograde": RetrogradeLoopIcon,
  "les-12-maisons": TwelveHousesIcon,
  ascendant: HorizonRiseIcon,
  "lire-son-theme-natal": OpenBookIcon,
  "synastrie-vs-composite": OverlapIcon,
  "lire-un-aspect": AspectAngleIcon,
  "retour-de-saturne": SaturnGlyphIcon,
  "noeuds-lunaires": LunarNodeIcon,
  "retrogrades-au-dela-de-mercure": RetrogradeLoopIcon,
  "astrologie-humaniste-vs-predictive": ScaleIcon,
  "composite-vs-davison": MergeIcon,
  "choisir-systeme-maisons": UnevenWheelIcon,
  "junon-chiron-vertex": MinorPointsIcon,
};
