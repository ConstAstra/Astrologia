import type { PointKey } from "../types";

// Genre grammatical français de chaque point — sert à accorder les articles
// (le/la/l') et les adjectifs dans les phrases générées par compose.ts.
// Sans objet en anglais (pas de genre grammatical).
export const PLANET_GENDER_FR: Record<PointKey, "m" | "f"> = {
  sun: "m",
  moon: "f",
  mercury: "m",
  venus: "f",
  mars: "m",
  jupiter: "m",
  saturn: "m",
  uranus: "m",
  neptune: "m",
  pluto: "m",
  northNode: "m",
  asc: "m",
  mc: "m",
  desc: "m",
  ic: "m",
  fortune: "f", // la Part de Fortune
};

export interface PlanetMeta {
  name: string;
  symbol: string;
  keyword: string; // thème court, utilisé dans les phrases d'aspect générées
  essence: string; // paragraphe de fond, affiché en tête de section
  keySpeed: string; // vitesse de déplacement, pour expliquer le "poids" du point
}

export const PLANET_META: Record<PointKey, PlanetMeta> = {
  sun: {
    name: "Soleil",
    symbol: "☉",
    keyword: "l'identité, la vitalité et la volonté d'exister",
    essence:
      "Le Soleil représente le cœur de la personnalité : ce que l'on cherche à devenir, la lumière que l'on projette, la vitalité fondamentale. Son signe décrit une coloration générale du caractère, mais ce n'est qu'une pièce du puzzle parmi les dizaines de positions du thème.",
    keySpeed: "environ 1°/jour",
  },
  moon: {
    name: "Lune",
    symbol: "☽",
    keyword: "les émotions, les besoins affectifs et les réflexes de sécurité",
    essence:
      "La Lune décrit le monde intérieur : la sensibilité, la mémoire, ce qui rassure ou inquiète, la manière de réagir à chaud. C'est souvent le point le plus révélateur pour comprendre le fonctionnement affectif profond d'une personne, parfois plus que le Soleil.",
    keySpeed: "environ 13°/jour, le point le plus rapide du thème",
  },
  mercury: {
    name: "Mercure",
    symbol: "☿",
    keyword: "la pensée, la communication et la manière d'apprendre",
    essence:
      "Mercure gouverne le mental : comment on raisonne, on parle, on négocie, on absorbe l'information. Toujours proche du Soleil dans le ciel, il en nuance souvent l'expression.",
    keySpeed: "variable, jusqu'à rétrograde plusieurs fois par an",
  },
  venus: {
    name: "Vénus",
    symbol: "♀",
    keyword: "l'affectivité, le désir, les valeurs et le rapport à la beauté",
    essence:
      "Vénus décrit ce qui attire, ce que l'on trouve désirable ou harmonieux, la façon d'aimer et d'être aimé, le rapport à l'argent et au plaisir esthétique.",
    keySpeed: "environ 1,2°/jour",
  },
  mars: {
    name: "Mars",
    symbol: "♂",
    keyword: "l'action, le désir, l'affirmation et la combativité",
    essence:
      "Mars est le moteur de l'action : la manière de foncer, de défendre son territoire, de désirer, de se mettre en colère. Il indique où et comment l'énergie s'engage dans le concret.",
    keySpeed: "environ 0,5°/jour, rétrograde tous les ~2 ans",
  },
  jupiter: {
    name: "Jupiter",
    symbol: "♃",
    keyword: "l'expansion, la confiance, le sens donné à l'existence",
    essence:
      "Jupiter indique où l'on cherche à grandir, à croire, à prendre de l'ampleur, la philosophie de vie, la chance perçue, le rapport aux études supérieures et aux horizons lointains.",
    keySpeed: "environ 12 ans pour faire le tour du zodiaque",
  },
  saturn: {
    name: "Saturne",
    symbol: "♄",
    keyword: "la structure, la responsabilité, la discipline et la peur",
    essence:
      "Saturne montre où l'on rencontre des limites, des exigences, un besoin de construire dans la durée, souvent vécu d'abord comme une contrainte, puis comme une force une fois l'apprentissage intégré.",
    keySpeed: "environ 29 ans pour faire le tour du zodiaque",
  },
  uranus: {
    name: "Uranus",
    symbol: "♅",
    keyword: "la rupture, l'indépendance, l'inattendu et l'innovation",
    essence:
      "Uranus, planète lente et générationnelle, indique où l'on a besoin de liberté et où surviennent les ruptures, les prises de conscience soudaines, l'envie de sortir du cadre.",
    keySpeed: "environ 84 ans pour faire le tour du zodiaque",
  },
  neptune: {
    name: "Neptune",
    symbol: "♆",
    keyword: "l'imaginaire, l'idéal, la fusion et le flou",
    essence:
      "Neptune, également générationnelle, dissout les frontières : intuition, spiritualité, art, mais aussi illusion et fuite. Sa maison natale est souvent plus parlante que son signe.",
    keySpeed: "environ 165 ans pour faire le tour du zodiaque",
  },
  pluto: {
    name: "Pluton",
    symbol: "♇",
    keyword: "la transformation, le pouvoir et les zones enfouies",
    essence:
      "Pluton, générationnel lui aussi, pointe les processus de transformation profonde, ce qui doit mourir pour renaître, les rapports de pouvoir et les zones taboues ou enfouies.",
    keySpeed: "de 10 à 30 ans par signe selon l'époque (orbite elliptique)",
  },
  northNode: {
    name: "Nœud Nord (moyen)",
    symbol: "☊",
    keyword: "l'axe d'évolution et d'apprentissage de l'existence",
    essence:
      "Le Nœud Nord ne représente pas un corps physique mais un point géométrique : l'intersection de l'orbite lunaire et de l'écliptique. Il indique une direction de croissance à apprivoiser, tandis que le Nœud Sud (à 180°) montre un terrain déjà acquis, une zone de confort à ne pas surinvestir.",
    keySpeed: "recule lentement, un tour complet en ~18,6 ans",
  },
  asc: {
    name: "Ascendant",
    symbol: "AS",
    keyword: "le masque social, l'allure, la première impression donnée",
    essence:
      "L'Ascendant est le signe qui se levait à l'horizon Est au moment de la naissance. Il colore l'apparence, les réflexes immédiats, la manière d'aborder le monde, souvent perçu par les autres avant même le Soleil.",
    keySpeed: "très rapide : change de signe environ toutes les 2h",
  },
  mc: {
    name: "Milieu du Ciel",
    symbol: "MC",
    keyword: "la vocation, l'image sociale et la réussite visible",
    essence:
      "Le Milieu du Ciel marque le sommet du thème : l'image que l'on projette dans la société, la direction professionnelle, ce pour quoi on veut être reconnu.",
    keySpeed: "très rapide, comme l'Ascendant",
  },
  desc: {
    name: "Descendant",
    symbol: "DS",
    keyword: "la relation à l'autre et ce que l'on recherche en couple",
    essence:
      "Opposé à l'Ascendant, le Descendant décrit ce que l'on projette sur les autres et recherche dans la relation à deux, souvent ce qui nous complète ou nous attire chez un partenaire.",
    keySpeed: "très rapide, opposé exact de l'Ascendant",
  },
  ic: {
    name: "Fond du Ciel",
    symbol: "FC",
    keyword: "les racines, la famille et l'intimité",
    essence:
      "Opposé au Milieu du Ciel, le Fond du Ciel évoque les racines familiales, le foyer, l'intimité et ce qui se transmet silencieusement d'une génération à l'autre.",
    keySpeed: "très rapide, opposé exact du Milieu du Ciel",
  },
  fortune: {
    name: "Part de Fortune",
    symbol: "⊕",
    keyword: "l'harmonie entre corps, âme et circonstances",
    essence:
      "Point arabe traditionnel combinant Ascendant, Soleil et Lune, la Part de Fortune indique une zone où les choses ont tendance à \"couler de source\", un terrain de bien-être et de facilité relative.",
    keySpeed: "dépend des positions du Soleil et de la Lune",
  },
};
