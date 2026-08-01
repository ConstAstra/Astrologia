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
    "L'axe le plus structurant du thème : l'accord — ou le tiraillement — entre ce que vous cherchez consciemment à devenir (Soleil) et ce dont vous avez besoin pour vous sentir en sécurité (Lune). Quand les deux exigences s'accordent, l'identité et le besoin affectif avancent dans le même sens ; quand elles divergent, une partie de vous poursuit un but que l'autre partie sabote sans le vouloir, jusqu'à ce que les deux soient consciemment réconciliées.",
  "mercury-sun":
    "Le rapport entre l'identité profonde et la manière de penser et de s'exprimer. Mercure n'étant jamais très loin du Soleil dans le ciel, cet aspect est presque toujours une conjonction plus ou moins large : la façon de parler et de raisonner devient alors un prolongement direct de qui l'on est, rarement un outil neutre et détaché de l'ego.",
  "sun-venus":
    "Le rapport entre l'affirmation de soi et la capacité à aimer, à apprécier la beauté et à se sentir digne d'être désiré·e. Cet axe se joue particulièrement dans l'estime de soi amoureuse : peut-on s'affirmer pleinement tout en restant aimable, ou l'un des deux pôles prend-il toujours le pas sur l'autre ?",
  "mars-sun":
    "Le rapport entre la volonté consciente et la capacité à agir, à s'affirmer, à défendre ses désirs concrètement. Quand cet axe fonctionne bien, vouloir et agir vont de pair ; sinon, l'identité sait ce qu'elle veut sans jamais réussir à le traduire en action, ou inversement agit sans savoir vraiment pourquoi.",
  "jupiter-sun":
    "Le rapport entre l'identité et la capacité à croire en soi, à voir grand, à saisir les opportunités qui se présentent. C'est l'axe de la confiance fondamentale : jusqu'où l'estime de soi permet-elle de prendre des risques et de s'autoriser à espérer davantage que ce qu'on connaît déjà ?",
  "saturn-sun":
    "Le rapport entre l'élan d'exister et le sens des limites, de la responsabilité et de l'autorité — la sienne, et celle qu'on a reçue en héritage. Cet axe détermine souvent le rythme auquel la confiance en soi se construit : lentement et solidement, ou dans une tension permanente entre le désir d'être et la peur de ne pas être à la hauteur.",
  "asc-sun":
    "Le rapport entre qui l'on est profondément (Soleil) et l'image que l'on projette spontanément (Ascendant). Plus l'écart entre les deux est grand, plus il peut y avoir un sentiment de décalage entre ce qu'on ressent être et la façon dont les autres nous perçoivent au premier abord.",
  "mc-sun":
    "Le rapport entre l'identité profonde et la vocation, la direction publique que prend une vie. Cet axe indique si le chemin professionnel ou social choisi sert réellement à exprimer qui l'on est, ou s'il reste un rôle joué sans lien profond avec l'identité.",
  "mercury-moon":
    "Le rapport entre l'émotion et la pensée : à quel point le ressenti influence — ou non — la façon de raisonner et de s'exprimer. Cet axe détermine si l'on parle depuis ce qu'on ressent ou si l'on maintient une distance entre les deux, au risque soit de la confusion émotionnelle, soit d'une froideur qui coupe du vécu intérieur.",
  "moon-venus":
    "Le rapport entre le besoin de sécurité affective et la capacité à aimer et à apprécier — un axe souvent lisible dans la façon d'être en couple. Il révèle si l'attachement se construit sur un vrai désir de l'autre ou surtout sur un besoin de combler un manque de sécurité intérieure.",
  "mars-moon":
    "Le rapport entre la sensibilité et l'instinct d'action : comment les émotions se traduisent, ou non, en réaction immédiate. Cet axe indique si l'on agit directement sous le coup de l'émotion ou si un temps de latence, voire un blocage, s'installe entre ce qui est ressenti et ce qui est fait.",
  "jupiter-moon":
    "Le rapport entre le besoin de sécurité et la confiance en la vie — souvent associé à l'optimisme affectif ou à une générosité émotionnelle spontanée. Cet axe conditionne la capacité à se sentir en sécurité sans que tout soit contrôlé ou garanti à l'avance.",
  "moon-saturn":
    "Le rapport entre le besoin affectif et la peur, le contrôle ou la retenue émotionnelle — un axe fréquemment lié à l'éducation reçue. Il détermine souvent si l'on a appris, enfant, que les besoins affectifs étaient légitimes ou s'il fallait plutôt les maîtriser pour ne pas déranger.",
  "asc-moon":
    "Le rapport entre le monde intérieur et la façon de se présenter spontanément aux autres. Cet axe indique si ce qu'on montre au premier abord reflète fidèlement ce qu'on ressent, ou si une distance protectrice s'installe entre les deux.",
  "mercury-venus":
    "Le rapport entre la pensée et le goût, entre le raisonnement et le sens esthétique ou relationnel. Comme pour Mercure-Soleil, ces deux planètes restent toujours proches dans le ciel : la manière de parler d'amour, de beauté ou de plaisir est donc rarement séparable de la façon générale de penser et de communiquer.",
  "mars-mercury":
    "Le rapport entre la pensée et l'action : vivacité d'esprit, débit de parole, façon d'argumenter ou de trancher rapidement. Cet axe détermine si la réflexion précède l'action ou si, au contraire, on agit d'abord et on comprend après — les deux logiques ayant chacune leurs forces et leurs angles morts.",
  "jupiter-mercury":
    "Le rapport entre le détail et la vue d'ensemble, entre l'esprit analytique et la pensée large — savoir approfondir sans perdre le fil global, ou l'inverse. Cet axe révèle si l'on privilégie naturellement la précision au risque de perdre en perspective, ou l'inverse.",
  "mercury-saturn":
    "Le rapport entre la pensée et la structure : rigueur intellectuelle, sens critique aiguisé, parfois anxiété mentale ou lenteur réfléchie. Cet axe indique si la rigueur nourrit la clarté de pensée ou si elle se transforme en doute permanent qui empêche de conclure.",
  "mars-venus":
    "L'axe classique du désir et de l'attraction : comment on séduit et comment on est séduit·e, comment le plaisir et l'action s'articulent l'un à l'autre. Il révèle si le désir s'exprime directement et sans détour, ou s'il se heurte à une tension entre ce qu'on veut prendre et ce qu'on veut plaire.",
  "jupiter-venus":
    "Le rapport entre le plaisir et l'abondance : générosité affective, goût du confort, tendance à l'excès agréable. Cet axe conditionne la capacité à profiter pleinement sans culpabilité, avec le risque, si mal intégré, de confondre plaisir et fuite dans le confort.",
  "saturn-venus":
    "Le rapport entre le désir d'aimer et la peur de ne pas être aimé·e — souvent lié à un attachement sérieux, parfois inhibé au départ mais fiable dans la durée. Cet axe indique si l'amour se construit avec prudence par crainte du rejet, ou si la prudence, une fois dépassée, devient une vraie force de constance.",
  "jupiter-mars":
    "Le rapport entre l'action et l'ambition : énergie entreprenante, confiance dans l'action, parfois excès d'assurance ou précipitation. Cet axe révèle si l'enthousiasme se traduit en résultats concrets ou s'il reste au stade de l'élan jamais vraiment abouti.",
  "mars-saturn":
    "Le rapport entre l'élan d'action et la limite : source de frustration si mal intégré, source de discipline et d'endurance si bien vécu. Cet axe détermine si le frein ressenti pousse à mieux canaliser son énergie ou s'il finit par l'étouffer complètement.",
  "jupiter-saturn":
    "Le grand rapport entre expansion et structure : oser grandir tout en acceptant des limites réalistes. Leur cycle rythme les décennies (dimension générationnelle), mais la maison où il se joue reste, elle, personnelle — c'est là que se lit concrètement l'équilibre propre à chacun entre ambition et réalisme.",
};

// Thèmes de fond formulés en langage de couple (désir, séduction,
// attachement amoureux) — à ne jamais afficher tels quels pour une
// synastrie ou un composite cadré famille/amitié/professionnel : le texte
// générique reste pertinent en lecture natale (auto-description) ou en
// cadrage romantique uniquement.
const ROMANTIC_CODED_PAIRS = new Set(["mars-venus", "sun-venus", "moon-venus", "saturn-venus", "mercury-venus"]);

function pairKey(a: PointKey, b: PointKey): string {
  return [a, b].sort().join("-");
}

export function getPairTheme(a: PointKey, b: PointKey): string | undefined {
  return PAIR_THEMES[pairKey(a, b)];
}

export function isRomanticCodedPair(a: PointKey, b: PointKey): boolean {
  return ROMANTIC_CODED_PAIRS.has(pairKey(a, b));
}
