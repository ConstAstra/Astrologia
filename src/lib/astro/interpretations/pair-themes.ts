import type { PointKey } from "../types";

/**
 * Thème de fond d'une paire de points, indépendant du type d'aspect exact :
 * l'aspect (conjonction, carré, trigone...) dit COMMENT ça se joue (voir
 * `aspects.ts`), la paire dit DE QUOI ça parle. Combiner les deux évite de
 * republier presque le même texte générique pour chaque aspect d'une même
 * paire, et donne une lecture plus riche qu'un simple "planète A + planète B".
 *
 * Clé : les deux identifiants de points triés alphabétiquement et joints
 * par un tiret — voir `getPairTheme`, qui gère les deux ordres possibles.
 */
const PAIR_THEMES: Partial<Record<string, string>> = {
  "moon-sun":
    "L'axe le plus structurant du thème : l'accord — ou le tiraillement — entre ce que vous cherchez consciemment à devenir (Soleil) et ce dont vous avez besoin pour vous sentir en sécurité (Lune).",
  "mercury-sun":
    "Le rapport entre l'identité profonde et la manière de penser et de s'exprimer. Mercure n'étant jamais très loin du Soleil dans le ciel, cet aspect est presque toujours une conjonction plus ou moins large.",
  "sun-venus":
    "Le rapport entre l'affirmation de soi et la capacité à aimer, à apprécier la beauté et à se sentir digne d'être désiré·e.",
  "mars-sun":
    "Le rapport entre la volonté consciente et la capacité à agir, à s'affirmer, à défendre ses désirs concrètement.",
  "jupiter-sun":
    "Le rapport entre l'identité et la capacité à croire en soi, à voir grand, à saisir les opportunités qui se présentent.",
  "saturn-sun":
    "Le rapport entre l'élan d'exister et le sens des limites, de la responsabilité et de l'autorité — la sienne, et celle qu'on a reçue en héritage.",
  "asc-sun": "Le rapport entre qui l'on est profondément (Soleil) et l'image que l'on projette spontanément (Ascendant).",
  "mc-sun": "Le rapport entre l'identité profonde et la vocation, la direction publique que prend une vie.",
  "mercury-moon":
    "Le rapport entre l'émotion et la pensée : à quel point le ressenti influence — ou non — la façon de raisonner et de s'exprimer.",
  "moon-venus":
    "Le rapport entre le besoin de sécurité affective et la capacité à aimer et à apprécier — un axe souvent lisible dans la façon d'être en couple.",
  "mars-moon":
    "Le rapport entre la sensibilité et l'instinct d'action : comment les émotions se traduisent, ou non, en réaction immédiate.",
  "jupiter-moon":
    "Le rapport entre le besoin de sécurité et la confiance en la vie — souvent associé à l'optimisme affectif ou à une générosité émotionnelle spontanée.",
  "moon-saturn":
    "Le rapport entre le besoin affectif et la peur, le contrôle ou la retenue émotionnelle — un axe fréquemment lié à l'éducation reçue.",
  "asc-moon": "Le rapport entre le monde intérieur et la façon de se présenter spontanément aux autres.",
  "mercury-venus":
    "Le rapport entre la pensée et le goût, entre le raisonnement et le sens esthétique ou relationnel. Comme pour Mercure-Soleil, ces deux planètes restent toujours proches dans le ciel.",
  "mars-mercury":
    "Le rapport entre la pensée et l'action : vivacité d'esprit, débit de parole, façon d'argumenter ou de trancher rapidement.",
  "jupiter-mercury":
    "Le rapport entre le détail et la vue d'ensemble, entre l'esprit analytique et la pensée large — savoir approfondir sans perdre le fil global, ou l'inverse.",
  "mercury-saturn":
    "Le rapport entre la pensée et la structure : rigueur intellectuelle, sens critique aiguisé, parfois anxiété mentale ou lenteur réfléchie.",
  "mars-venus":
    "L'axe classique du désir et de l'attraction : comment on séduit et comment on est séduit·e, comment le plaisir et l'action s'articulent l'un à l'autre.",
  "jupiter-venus":
    "Le rapport entre le plaisir et l'abondance : générosité affective, goût du confort, tendance à l'excès agréable.",
  "saturn-venus":
    "Le rapport entre le désir d'aimer et la peur de ne pas être aimé·e — souvent lié à un attachement sérieux, parfois inhibé au départ mais fiable dans la durée.",
  "jupiter-mars":
    "Le rapport entre l'action et l'ambition : énergie entreprenante, confiance dans l'action, parfois excès d'assurance ou précipitation.",
  "mars-saturn":
    "Le rapport entre l'élan d'action et la limite : source de frustration si mal intégré, source de discipline et d'endurance si bien vécu.",
  "jupiter-saturn":
    "Le grand rapport entre expansion et structure : oser grandir tout en acceptant des limites réalistes. Leur cycle rythme les décennies (dimension générationnelle), mais la maison où il se joue reste, elle, personnelle.",
};

function pairKey(a: PointKey, b: PointKey): string {
  return [a, b].sort().join("-");
}

export function getPairTheme(a: PointKey, b: PointKey): string | undefined {
  return PAIR_THEMES[pairKey(a, b)];
}
