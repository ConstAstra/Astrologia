import type { ZodiacSign } from "../types";

export interface SignMeta {
  name: string;
  symbol: string;
  element: "Feu" | "Terre" | "Air" | "Eau";
  modality: "Cardinal" | "Fixe" | "Mutable";
  ruler: string;
  dates: string;
  keyword: string;
  paragraph: string;
}

export const SIGN_META: Record<ZodiacSign, SignMeta> = {
  belier: {
    name: "Bélier",
    symbol: "♈",
    element: "Feu",
    modality: "Cardinal",
    ruler: "Mars",
    dates: "21 mars – 19 avril",
    keyword: "l'impulsion et le commencement",
    paragraph:
      "Premier signe du zodiaque, le Bélier incarne l'élan initial : spontanéité, franchise, besoin d'agir sans trop attendre. Énergie directe, parfois impatiente, tournée vers la conquête.",
  },
  taureau: {
    name: "Taureau",
    symbol: "♉",
    element: "Terre",
    modality: "Fixe",
    ruler: "Vénus",
    dates: "20 avril – 20 mai",
    keyword: "la stabilité et le plaisir sensoriel",
    paragraph:
      "Le Taureau cherche la sécurité matérielle et sensorielle : goût du confort, patience, attachement à ce qui dure. Une énergie posée, fidèle, parfois réfractaire au changement.",
  },
  gemeaux: {
    name: "Gémeaux",
    symbol: "♊",
    element: "Air",
    modality: "Mutable",
    ruler: "Mercure",
    dates: "21 mai – 20 juin",
    keyword: "la curiosité et la communication",
    paragraph:
      "Les Gémeaux vivent dans l'échange d'idées : curiosité, agilité mentale, goût du contact et de la diversité. Une énergie mobile, parfois dispersée, qui a besoin de variété.",
  },
  cancer: {
    name: "Cancer",
    symbol: "♋",
    element: "Eau",
    modality: "Cardinal",
    ruler: "Lune",
    dates: "21 juin – 22 juillet",
    keyword: "la protection et la mémoire affective",
    paragraph:
      "Le Cancer navigue à l'instinct et à l'émotion : besoin de sécurité affective, mémoire vive, attachement au foyer et à la famille. Une carapace protège une grande sensibilité.",
  },
  lion: {
    name: "Lion",
    symbol: "♌",
    element: "Feu",
    modality: "Fixe",
    ruler: "Soleil",
    dates: "23 juillet – 22 août",
    keyword: "l'affirmation et le rayonnement",
    paragraph:
      "Le Lion veut exister pleinement et être reconnu : générosité, sens du spectacle, besoin de briller et de créer. Une énergie chaleureuse, parfois orgueilleuse, centrée sur l'expression de soi.",
  },
  vierge: {
    name: "Vierge",
    symbol: "♍",
    element: "Terre",
    modality: "Mutable",
    ruler: "Mercure",
    dates: "23 août – 22 septembre",
    keyword: "l'analyse et le perfectionnement",
    paragraph:
      "La Vierge cherche à comprendre pour améliorer : sens du détail, rigueur, souci de rendre service et de bien faire. Une énergie méthodique, parfois trop exigeante envers elle-même.",
  },
  balance: {
    name: "Balance",
    symbol: "♎",
    element: "Air",
    modality: "Cardinal",
    ruler: "Vénus",
    dates: "23 septembre – 22 octobre",
    keyword: "l'équilibre et la relation",
    paragraph:
      "La Balance cherche l'harmonie et la justesse dans la relation à l'autre : diplomatie, sens esthétique, besoin de partenariat. Une énergie qui pèse le pour et le contre, parfois indécise.",
  },
  scorpion: {
    name: "Scorpion",
    symbol: "♏",
    element: "Eau",
    modality: "Fixe",
    ruler: "Pluton (traditionnellement Mars)",
    dates: "23 octobre – 21 novembre",
    keyword: "l'intensité et la transformation",
    paragraph:
      "Le Scorpion va au fond des choses : intensité émotionnelle, magnétisme, goût du secret et de la transformation. Une énergie profonde, parfois méfiante, qui ne fait rien à moitié.",
  },
  sagittaire: {
    name: "Sagittaire",
    symbol: "♐",
    element: "Feu",
    modality: "Mutable",
    ruler: "Jupiter",
    dates: "22 novembre – 21 décembre",
    keyword: "l'expansion et la quête de sens",
    paragraph:
      "Le Sagittaire vise loin : optimisme, goût du voyage et des grandes idées, besoin de liberté de mouvement et de pensée. Une énergie enthousiaste, parfois maladroite par excès de franchise.",
  },
  capricorne: {
    name: "Capricorne",
    symbol: "♑",
    element: "Terre",
    modality: "Cardinal",
    ruler: "Saturne",
    dates: "22 décembre – 19 janvier",
    keyword: "l'ambition et la structure",
    paragraph:
      "Le Capricorne construit sur le long terme : sens du devoir, ambition patiente, rapport sérieux au temps et à la réussite. Une énergie disciplinée, parfois austère, qui gagne en assurance avec l'âge.",
  },
  verseau: {
    name: "Verseau",
    symbol: "♒",
    element: "Air",
    modality: "Fixe",
    ruler: "Uranus (traditionnellement Saturne)",
    dates: "20 janvier – 18 février",
    keyword: "l'indépendance et l'esprit collectif",
    paragraph:
      "Le Verseau pense le futur et le collectif : indépendance d'esprit, originalité, engagement pour des causes plus larges que soi. Une énergie détachée, parfois distante, éprise de liberté.",
  },
  poissons: {
    name: "Poissons",
    symbol: "♓",
    element: "Eau",
    modality: "Mutable",
    ruler: "Neptune (traditionnellement Jupiter)",
    dates: "19 février – 20 mars",
    keyword: "l'intuition et la fusion",
    paragraph:
      "Dernier signe du zodiaque, les Poissons dissolvent les frontières : empathie, imagination, sensibilité artistique ou spirituelle. Une énergie fluide, parfois fuyante, en quête d'un ailleurs.",
  },
};
