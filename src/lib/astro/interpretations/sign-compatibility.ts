import { SIGN_META } from "./signs";
import type { ZodiacSign } from "../types";

// Ce que ce signe montre concrètement en cas de désaccord, et ce dont il a
// besoin pour se sentir en confiance : sert à ancrer le champ "challenges"
// de composeSignCompatibility dans les deux signes réellement concernés,
// plutôt que dans une phrase générique valable pour n'importe laquelle des
// 144 paires (seul le score, binaire, variait jusqu'ici).
const SIGN_FRICTION_TRAIT: Record<ZodiacSign, string> = {
  belier: "s'agace vite d'un rythme trop lent et veut qu'on tranche sans attendre",
  taureau: "se braque si on le bouscule et a besoin de temps pour changer d'avis",
  gemeaux: "se lasse d'une conversation qui tourne en rond et a besoin de nouveauté pour garder son attention",
  cancer: "se referme si le ton devient froid et a besoin d'un geste rassurant avant de rouvrir",
  lion: "supporte mal de ne pas être reconnu à sa juste valeur et a besoin qu'on valorise ce qu'il apporte",
  vierge: "pointe les détails qui ne collent pas et a besoin que les choses soient faites proprement",
  balance: "évite le conflit frontal tant qu'elle le peut et a besoin d'un vrai dialogue plutôt que d'un rapport de force",
  scorpion: "se méfie dès qu'il sent une zone d'ombre et a besoin d'une confiance totale pour se livrer",
  sagittaire: "s'étouffe dès qu'on veut cadrer son emploi du temps ou ses idées et a besoin de marge de manœuvre",
  capricorne: "perd patience devant un manque de sérieux et a besoin qu'on tienne ses engagements",
  verseau: "prend ses distances si on veut le faire rentrer dans un moule et a besoin d'espace pour rester lui-même",
  poissons: "se noie dans le doute si l'ambiance devient trop dure et a besoin de douceur pour se sentir en sécurité",
};

export interface SignCompatibility {
  score: number; // 1 à 5, indicatif, pas une prédiction
  elementText: string;
  modalityText: string;
  strengths: string;
  challenges: string;
  advice: string;
}

// Clé triée alphabétiquement (Air < Eau < Feu < Terre) pour couvrir les 10
// relations possibles entre 4 éléments sans dupliquer les entrées dans les
// deux sens.
const ELEMENT_PAIR: Record<string, { text: string; score: number }> = {
  "Feu-Feu": {
    text: "Deux natures de feu : beaucoup d'énergie, d'enthousiasme et d'envie d'action partagée. Le duo avance vite et s'ennuie rarement, le risque est que les deux egos veuillent mener la danse en même temps.",
    score: 4,
  },
  "Terre-Terre": {
    text: "Deux natures de terre : un socle commun de stabilité, de sens pratique et de fiabilité. Le duo se sent en sécurité, le risque est de s'installer dans une routine qui manque d'étincelle.",
    score: 4,
  },
  "Air-Air": {
    text: "Deux natures d'air : une circulation d'idées, une curiosité et un besoin de liberté partagés. Le duo se comprend intellectuellement, le risque est de rester en surface émotionnellement, ou de trop théoriser au lieu d'agir.",
    score: 4,
  },
  "Eau-Eau": {
    text: "Deux natures d'eau : une intuition et une sensibilité mutuelles fortes, souvent une impression de « se comprendre sans mots ». Le risque est de s'enfermer à deux dans l'intensité émotionnelle, sans assez de recul.",
    score: 4,
  },
  "Air-Feu": {
    text: "Le feu et l'air : une des combinaisons les plus naturellement dynamiques du zodiaque, l'air nourrit le feu, qui donne à l'air une direction concrète. Enthousiasme communicatif et complicité spontanée.",
    score: 5,
  },
  "Eau-Terre": {
    text: "L'eau et la terre : une combinaison qui se nourrit mutuellement, la terre donne un cadre stable à l'eau, l'eau apporte de la profondeur affective à la terre. Une harmonie qui s'installe souvent sans forcer.",
    score: 5,
  },
  "Feu-Terre": {
    text: "Le feu et la terre : le feu veut agir vite, la terre veut avancer sûrement, un rythme à négocier plutôt qu'un obstacle. Bien géré, le feu réchauffe la terre et la terre canalise le feu en résultats concrets.",
    score: 3,
  },
  "Air-Eau": {
    text: "L'air et l'eau : l'air pense et prend de la distance, l'eau ressent et s'immerge, deux langages différents qui peuvent se compléter (l'air apporte de la clarté, l'eau de la profondeur) ou se rater si chacun reste dans son mode.",
    score: 3,
  },
  "Eau-Feu": {
    text: "Le feu et l'eau : une combinaison classiquement intense, l'eau peut étouffer le feu, le feu peut faire bouillir l'eau. Beaucoup de passion des deux côtés, mais qui demande un vrai travail conscient pour ne pas s'épuiser mutuellement.",
    score: 2,
  },
  "Air-Terre": {
    text: "La terre et l'air : la terre veut du concret, l'air vit dans les idées, chacun peut trouver l'autre respectivement trop rigide ou trop insaisissable. Le lien se construit surtout en apprenant à traduire son langage dans celui de l'autre.",
    score: 2,
  },
};

const MODALITY_PAIR: Record<string, { text: string; score: number }> = {
  "Cardinal-Cardinal": {
    text: "Deux signes cardinaux : deux leaders naturels, pleins d'initiative. La dynamique est stimulante tant que chacun a son propre terrain pour mener, le risque est une compétition sur qui décide.",
    score: 3,
  },
  "Fixe-Fixe": {
    text: "Deux signes fixes : une loyauté et une endurance rares une fois l'engagement pris. Le risque est un bras de fer si les deux campent sur leurs positions, aucun des deux n'aime céder en premier.",
    score: 3,
  },
  "Mutable-Mutable": {
    text: "Deux signes mutables : beaucoup de souplesse et d'adaptabilité mutuelle, une vraie facilité à évoluer ensemble. Le risque est qu'aucun des deux ne pose de cap clair, par manque d'ancrage commun.",
    score: 3,
  },
  "Cardinal-Fixe": {
    text: "Un signe cardinal et un signe fixe : le cardinal lance les projets, le fixe les fait tenir dans la durée, un bon complément si le fixe ne vit pas chaque nouvelle initiative comme une remise en cause.",
    score: 4,
  },
  "Cardinal-Mutable": {
    text: "Un signe cardinal et un signe mutable : le cardinal impulse, le mutable s'ajuste et suit avec souplesse, une dynamique qui coule le plus souvent naturellement.",
    score: 4,
  },
  "Fixe-Mutable": {
    text: "Un signe fixe et un signe mutable : le fixe cherche la stabilité, le mutable a besoin de variété, une tension féconde si le fixe accepte un peu de changement et le mutable un peu de constance.",
    score: 3,
  },
};

function pairLookup<T>(map: Record<string, T>, a: string, b: string): T {
  const key = [a, b].sort().join("-");
  return map[key];
}

export function composeSignCompatibility(signA: ZodiacSign, signB: ZodiacSign): SignCompatibility {
  const a = SIGN_META[signA];
  const b = SIGN_META[signB];

  const elementInfo = pairLookup(ELEMENT_PAIR, a.element, b.element);
  const modalityInfo = pairLookup(MODALITY_PAIR, a.modality, b.modality);
  const score = Math.round((elementInfo.score + modalityInfo.score) / 2);

  const strengths = `${a.name} apporte ${a.keyword}, ${b.name} apporte ${b.keyword}, deux forces qui, bien articulées, s'enrichissent plus qu'elles ne se concurrencent.`;
  const challenges =
    score >= 4
      ? `Peu de friction structurelle entre ${a.name} et ${b.name} : l'essentiel se joue ailleurs (Lune, Vénus, Mars, Ascendant de chacun), pas sur ce plan-là. Si friction il y a malgré tout, elle vient plutôt de là : ${a.name} ${SIGN_FRICTION_TRAIT[signA]}, tandis que ${b.name} ${SIGN_FRICTION_TRAIT[signB]}.`
      : `Le point de friction concret entre ${a.name} et ${b.name} : ${a.name} ${SIGN_FRICTION_TRAIT[signA]}, tandis que ${b.name} ${SIGN_FRICTION_TRAIT[signB]}. Rien d'incompatible sur le fond, plutôt un rythme ou un langage différent qui se travaille avec de la conscience et de la communication.`;
  const advice = `Cette lecture ${a.name}-${b.name} reste basée sur les seuls signes solaires : une vraie synastrie (Lune, Vénus, Mars, Ascendant, maisons) donne une image bien plus fine et personnelle du lien entre deux personnes précises.`;

  return {
    score,
    elementText: elementInfo.text,
    modalityText: modalityInfo.text,
    strengths,
    challenges,
    advice,
  };
}
