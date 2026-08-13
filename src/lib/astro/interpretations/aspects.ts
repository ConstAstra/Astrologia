import type { AspectKey } from "../types";

export interface AspectMeta {
  name: string;
  symbol: string;
  tone: "harmonieux" | "tendu" | "neutre";
  /** Genre grammatical du nom (pour "un/une" devant, ex. "un carré", "une opposition"). */
  genderFr: "m" | "f";
  /** Verbe/connecteur au pluriel, utilisé dans la phrase à deux sujets (ex. "X et Y {connector} Z") — voir describeAspect dans compose.ts. */
  connector: string;
  /** Même verbe conjugué au singulier, pour la phrase à sujet unique d'un transit (ex. "X en transit {transitConnector} votre Y natal") — voir describeTransitAspect. */
  transitConnector: string;
  description: string;
}

export const ASPECT_META: Record<AspectKey, AspectMeta> = {
  conjunction: {
    name: "Conjonction",
    symbol: "☌",
    tone: "neutre",
    genderFr: "f",
    connector: "se mêlent étroitement à",
    transitConnector: "se superpose à",
    description:
      "Les deux énergies fusionnent en un seul point : elles agissent ensemble, pour le meilleur et pour le pire, sans grande capacité à se distinguer l'une de l'autre.",
  },
  opposition: {
    name: "Opposition",
    symbol: "☍",
    tone: "tendu",
    genderFr: "f",
    connector: "se tendent face à",
    transitConnector: "se tend face à",
    description:
      "Les deux énergies se font face et se tirent chacune vers un pôle opposé : tension féconde si elle est consciente et équilibrée, tiraillement si elle reste subie.",
  },
  square: {
    name: "Carré",
    symbol: "□",
    tone: "tendu",
    genderFr: "m",
    connector: "se frottent à",
    transitConnector: "vient frotter contre",
    description:
      "Un frottement dynamique, souvent vécu comme un obstacle intérieur ou une friction — l'aspect le plus formateur du zodiaque quand il est travaillé plutôt qu'évité.",
  },
  trine: {
    name: "Trigone",
    symbol: "△",
    tone: "harmonieux",
    genderFr: "m",
    connector: "circulent aisément avec",
    transitConnector: "circule aisément avec",
    description:
      "Une circulation fluide et naturelle entre les deux énergies : un talent presque acquis d'avance, avec le risque, si l'on n'y prend pas garde, de ne jamais chercher à le développer davantage.",
  },
  sextile: {
    name: "Sextile",
    symbol: "⚹",
    tone: "harmonieux",
    genderFr: "m",
    connector: "s'accordent avec",
    transitConnector: "s'accorde avec",
    description:
      "Une opportunité de collaboration entre les deux énergies, qui demande un minimum d'initiative pour se concrétiser pleinement — moins automatique que le trigone, mais tout aussi porteur.",
  },
  quincunx: {
    name: "Quinconce",
    symbol: "⚻",
    tone: "tendu",
    genderFr: "m",
    connector: "peinent à s'ajuster à",
    transitConnector: "peine à s'ajuster à",
    description:
      "Deux logiques qui n'ont a priori rien en commun et doivent trouver un ajustement permanent, souvent au prix de petits sacrifices ou d'adaptations répétées.",
  },
  "semi-sextile": {
    name: "Semi-sextile",
    symbol: "⚺",
    tone: "neutre",
    genderFr: "m",
    connector: "frôlent",
    transitConnector: "frôle",
    description:
      "Un contact discret, de voisinage, qui relie deux domaines de vie sans grande friction ni grande fluidité — une nuance plus qu'un thème majeur.",
  },
  "semi-square": {
    name: "Semi-carré",
    symbol: "∠",
    tone: "tendu",
    genderFr: "m",
    connector: "irritent légèrement",
    transitConnector: "irrite légèrement",
    description:
      "Une friction mineure mais réelle, comme un petit caillou dans la chaussure : rarement bloquante seule, mais à noter si elle recoupe d'autres tensions du thème.",
  },
  sesquiquadrate: {
    name: "Sesqui-carré",
    symbol: "⚼",
    tone: "tendu",
    genderFr: "m",
    connector: "créent une friction sourde avec",
    transitConnector: "crée une friction sourde avec",
    description:
      "Une tension de fond, moins évidente qu'un carré mais persistante, qui demande souvent plusieurs tentatives avant de trouver un ajustement satisfaisant.",
  },
};
