import type { AspectKey } from "../types";
import type { AspectMeta } from "./aspects";

export const ASPECT_META_EN: Record<AspectKey, AspectMeta> = {
  conjunction: {
    name: "Conjunction",
    symbol: "☌",
    tone: "neutre",
    connector: "merge closely with",
    description:
      "The two energies fuse into a single point: they act together, for better or worse, with little ability to distinguish one from the other.",
  },
  opposition: {
    name: "Opposition",
    symbol: "☍",
    tone: "tendu",
    connector: "pull against",
    description:
      "The two energies face each other and each pull toward an opposite pole: fruitful tension if approached consciously and balanced, a tug-of-war if left unmanaged.",
  },
  square: {
    name: "Square",
    symbol: "□",
    tone: "tendu",
    connector: "rub against",
    description:
      "A dynamic friction, often experienced as an inner obstacle or clash — the most formative aspect of the zodiac when worked with rather than avoided.",
  },
  trine: {
    name: "Trine",
    symbol: "△",
    tone: "harmonieux",
    connector: "flow easily with",
    description:
      "A smooth, natural flow between the two energies: a talent that's almost a given, with the risk, if one isn't careful, of never bothering to develop it further.",
  },
  sextile: {
    name: "Sextile",
    symbol: "⚹",
    tone: "harmonieux",
    connector: "harmonize with",
    description:
      "An opportunity for collaboration between the two energies, which needs a bit of initiative to fully materialize — less automatic than the trine, but just as promising.",
  },
  quincunx: {
    name: "Quincunx",
    symbol: "⚻",
    tone: "tendu",
    connector: "struggle to adjust to",
    description:
      "Two logics that seemingly have nothing in common and must find a constant adjustment, often at the cost of small sacrifices or repeated adaptations.",
  },
  "semi-sextile": {
    name: "Semi-sextile",
    symbol: "⚺",
    tone: "neutre",
    connector: "brush against",
    description:
      "A discreet, neighborly contact, linking two areas of life without much friction or much flow — more a nuance than a major theme.",
  },
  "semi-square": {
    name: "Semi-square",
    symbol: "∠",
    tone: "tendu",
    connector: "mildly irritate",
    description:
      "A minor but real friction, like a small pebble in the shoe: rarely blocking on its own, but worth noting if it overlaps with other tensions in the chart.",
  },
  sesquiquadrate: {
    name: "Sesquiquadrate",
    symbol: "⚼",
    tone: "tendu",
    connector: "create a low-grade friction with",
    description:
      "An underlying tension, less obvious than a square but persistent, that often takes several attempts before finding a satisfying adjustment.",
  },
};
