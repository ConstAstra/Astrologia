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
    "L'équilibre entre l'affirmation de soi et la capacité à aimer, à apprécier la beauté et à se sentir digne d'être désiré·e. Cet axe se joue particulièrement dans l'estime de soi amoureuse : peut-on s'affirmer pleinement tout en restant aimable, ou l'un des deux pôles prend-il toujours le pas sur l'autre ?",
  "mars-sun":
    "Le dialogue entre la volonté consciente et la capacité à agir, à s'affirmer, à défendre ses désirs concrètement. Quand cet axe fonctionne bien, vouloir et agir vont de pair ; sinon, l'identité sait ce qu'elle veut sans jamais réussir à le traduire en action, ou inversement agit sans savoir vraiment pourquoi.",
  "jupiter-sun":
    "La tension féconde entre l'identité et la capacité à croire en soi, à voir grand, à saisir les opportunités qui se présentent. C'est l'axe de la confiance fondamentale : jusqu'où l'estime de soi permet-elle de prendre des risques et de s'autoriser à espérer davantage que ce qu'on connaît déjà ?",
  "saturn-sun":
    "L'articulation entre l'élan d'exister et le sens des limites, de la responsabilité et de l'autorité — la sienne, et celle qu'on a reçue en héritage. Cet axe détermine souvent le rythme auquel la confiance en soi se construit : lentement et solidement, ou dans une tension permanente entre le désir d'être et la peur de ne pas être à la hauteur.",
  "asc-sun":
    "Ce qui se joue entre qui l'on est profondément (Soleil) et l'image que l'on projette spontanément (Ascendant). Plus l'écart entre les deux est grand, plus il peut y avoir un sentiment de décalage entre ce qu'on ressent être et la façon dont les autres nous perçoivent au premier abord.",
  "mc-sun":
    "Le lien entre l'identité profonde et la vocation, la direction publique que prend une vie. Cet axe indique si le chemin professionnel ou social choisi sert réellement à exprimer qui l'on est, ou s'il reste un rôle joué sans lien profond avec l'identité.",
  "mercury-moon":
    "Le rapport entre l'émotion et la pensée : à quel point le ressenti influence — ou non — la façon de raisonner et de s'exprimer. Cet axe détermine si l'on parle depuis ce qu'on ressent ou si l'on maintient une distance entre les deux, au risque soit de la confusion émotionnelle, soit d'une froideur qui coupe du vécu intérieur.",
  "moon-venus":
    "L'équilibre entre le besoin de sécurité affective et la capacité à aimer et à apprécier — un axe souvent lisible dans la façon d'être en couple. Il révèle si l'attachement se construit sur un vrai désir de l'autre ou surtout sur un besoin de combler un manque de sécurité intérieure.",
  "mars-moon":
    "Le dialogue entre la sensibilité et l'instinct d'action : comment les émotions se traduisent, ou non, en réaction immédiate. Cet axe indique si l'on agit directement sous le coup de l'émotion ou si un temps de latence, voire un blocage, s'installe entre ce qui est ressenti et ce qui est fait.",
  "jupiter-moon":
    "La tension féconde entre le besoin de sécurité et la confiance en la vie — souvent associé à l'optimisme affectif ou à une générosité émotionnelle spontanée. Cet axe conditionne la capacité à se sentir en sécurité sans que tout soit contrôlé ou garanti à l'avance.",
  "moon-saturn":
    "L'articulation entre le besoin affectif et la peur, le contrôle ou la retenue émotionnelle — un axe fréquemment lié à l'éducation reçue. Il détermine souvent si l'on a appris, enfant, que les besoins affectifs étaient légitimes ou s'il fallait plutôt les maîtriser pour ne pas déranger.",
  "asc-moon":
    "Ce qui se joue entre le monde intérieur et la façon de se présenter spontanément aux autres. Cet axe indique si ce qu'on montre au premier abord reflète fidèlement ce qu'on ressent, ou si une distance protectrice s'installe entre les deux.",
  "mercury-venus":
    "Le lien entre la pensée et le goût, entre le raisonnement et le sens esthétique ou relationnel. Comme pour Mercure-Soleil, ces deux planètes restent toujours proches dans le ciel : la manière de parler d'amour, de beauté ou de plaisir est donc rarement séparable de la façon générale de penser et de communiquer.",
  "mars-mercury":
    "Le rapport entre la pensée et l'action : vivacité d'esprit, débit de parole, façon d'argumenter ou de trancher rapidement. Cet axe détermine si la réflexion précède l'action ou si, au contraire, on agit d'abord et on comprend après — les deux logiques ayant chacune leurs forces et leurs angles morts.",
  "jupiter-mercury":
    "L'équilibre entre le détail et la vue d'ensemble, entre l'esprit analytique et la pensée large — savoir approfondir sans perdre le fil global, ou l'inverse. Cet axe révèle si l'on privilégie naturellement la précision au risque de perdre en perspective, ou l'inverse.",
  "mercury-saturn":
    "Le dialogue entre la pensée et la structure : rigueur intellectuelle, sens critique aiguisé, parfois anxiété mentale ou lenteur réfléchie. Cet axe indique si la rigueur nourrit la clarté de pensée ou si elle se transforme en doute permanent qui empêche de conclure.",
  "mars-venus":
    "L'axe classique du désir et de l'attraction : comment on séduit et comment on est séduit·e, comment le plaisir et l'action s'articulent l'un à l'autre. Il révèle si le désir s'exprime directement et sans détour, ou s'il se heurte à une tension entre ce qu'on veut prendre et ce qu'on veut plaire.",
  "jupiter-venus":
    "La tension féconde entre le plaisir et l'abondance : générosité affective, goût du confort, tendance à l'excès agréable. Cet axe conditionne la capacité à profiter pleinement sans culpabilité, avec le risque, si mal intégré, de confondre plaisir et fuite dans le confort.",
  "saturn-venus":
    "L'articulation entre le désir d'aimer et la peur de ne pas être aimé·e — souvent lié à un attachement sérieux, parfois inhibé au départ mais fiable dans la durée. Cet axe indique si l'amour se construit avec prudence par crainte du rejet, ou si la prudence, une fois dépassée, devient une vraie force de constance.",
  "jupiter-mars":
    "Ce qui se joue entre l'action et l'ambition : énergie entreprenante, confiance dans l'action, parfois excès d'assurance ou précipitation. Cet axe révèle si l'enthousiasme se traduit en résultats concrets ou s'il reste au stade de l'élan jamais vraiment abouti.",
  "mars-saturn":
    "Le lien entre l'élan d'action et la limite : source de frustration si mal intégré, source de discipline et d'endurance si bien vécu. Cet axe détermine si le frein ressenti pousse à mieux canaliser son énergie ou s'il finit par l'étouffer complètement.",
  "jupiter-saturn":
    "Le grand rapport entre expansion et structure : oser grandir tout en acceptant des limites réalistes. Leur cycle rythme les décennies (dimension générationnelle), mais la maison où il se joue reste, elle, personnelle — c'est là que se lit concrètement l'équilibre propre à chacun entre ambition et réalisme.",

  // Paires impliquant Uranus, Neptune ou Pluton — les "planètes générationnelles".
  // Leur lenteur les rend rares en thème natal individuel (souvent un simple
  // aspect large, voire une conjonction de génération), mais elles reviennent
  // sans cesse en TRANSIT sur les points personnels : sans thème de fond ici,
  // la lecture d'un transit de Neptune, Uranus ou Pluton restait un texte
  // d'aspect générique, coupé de ce que la planète en question représente
  // vraiment (rupture, dissolution, transformation).
  "jupiter-neptune":
    "La rencontre entre l'expansion et l'idéal : générosité, foi en la vie, inspiration presque mystique — un vrai carburant pour croire en quelque chose de plus grand que soi. Cet axe indique si cette confiance nourrit des projets concrets ou si elle se dilue en promesses jamais tenues, en optimisme qui évite soigneusement le principe de réalité.",
  "jupiter-pluto":
    "Le rapport entre l'ambition et la puissance de transformation : une soif de grandir qui ne se contente pas de peu, capable de tout reconstruire pour aller plus loin. Cet axe révèle si cette intensité sert une vraie évolution ou si elle vire à l'excès, au besoin de tout contrôler pour se sentir en sécurité dans l'expansion.",
  "jupiter-uranus":
    "Le lien entre l'expansion et la rupture : opportunités soudaines, coups de chance, besoin de changer de cap sans prévenir pour continuer à grandir. Cet axe montre si cette liberté nourrit une vraie évolution ou si elle se limite à une agitation permanente qui empêche de construire quoi que ce soit dans la durée.",
  "mars-neptune":
    "Le dialogue entre l'action et l'inspiration : une énergie qui peut se mettre au service d'une cause, d'un art ou d'un idéal, avec le risque de se disperser dans le flou ou de manquer de direction concrète. Cet axe indique si l'élan trouve un terrain d'expression réel ou s'il s'épuise dans l'hésitation et l'attente d'un signe.",
  "mars-pluto":
    "L'un des axes les plus intenses du thème : la volonté d'agir rencontre la force de transformation, avec une capacité de détermination rarement égalée. Cet axe indique si cette puissance se canalise en une action juste et assumée, ou si elle se retourne en colère refoulée, en rapport de force permanent avec soi-même ou les autres.",
  "mars-uranus":
    "Le rapport entre l'action et l'imprévu : des réactions rapides, parfois explosives, une allergie à tout ce qui contraint ou ralentit. Cet axe montre si cette énergie sert une vraie indépendance d'action ou si elle se traduit surtout par de l'impulsivité difficile à canaliser sur la durée.",
  "mercury-neptune":
    "Le lien entre la pensée et l'imaginaire : intuition fine, sensibilité artistique, capacité à percevoir ce qui échappe à la logique pure. Cet axe indique si cette porosité nourrit une vraie créativité ou si elle brouille la pensée au point de rendre difficile la prise de décisions claires et le tri entre le réel et l'imaginé.",
  "mercury-pluto":
    "Le rapport entre la pensée et la profondeur : un esprit qui ne se satisfait jamais des explications superficielles, capable de creuser un sujet jusqu'à l'obsession. Cet axe montre si cette intensité mentale nourrit une vraie perspicacité ou si elle vire à la rumination, à une méfiance qui voit des sous-entendus partout.",
  "mercury-uranus":
    "Le lien entre la pensée et l'éclair de génie : des idées qui surgissent sans prévenir, une façon de penser à contre-courant. Cet axe indique si cette originalité s'exprime de façon utile et communicable, ou si elle reste une agitation mentale, des sautes de sujet qui perdent l'interlocuteur en chemin.",
  "moon-neptune":
    "L'un des axes les plus poreux du thème : une sensibilité qui capte tout, parfois avant même de comprendre d'où ça vient, avec une empathie qui confond facilement ses émotions et celles des autres. Cet axe montre si cette porosité nourrit une vraie intuition affective ou si elle expose à l'épuisement émotionnel, faute de limites claires.",
  "moon-pluto":
    "Le rapport entre le besoin affectif et l'intensité : des émotions qui ne se vivent jamais à moitié, des attachements profonds, parfois teintés de possessivité ou de méfiance. Cet axe indique si cette intensité nourrit des liens vrais et transformateurs, ou si elle enferme dans un besoin de tout contrôler pour se sentir en sécurité.",
  "moon-uranus":
    "Le lien entre le besoin de sécurité et le besoin d'indépendance : une sensibilité qui a besoin d'air, qui s'accommode mal des routines affectives trop prévisibles. Cet axe montre si cette liberté se vit sereinement ou si elle installe une instabilité émotionnelle, un pied toujours dehors même dans les liens qui comptent.",
  "neptune-saturn":
    "La tension entre le réel et l'idéal : structure et rigueur d'un côté, doute et besoin de sens de l'autre. Cet axe indique si cette tension pousse à bâtir quelque chose de solide au service d'un idéal, ou si elle installe un découragement chronique, l'impression que rien de concret ne sera jamais à la hauteur du rêve.",
  "neptune-sun":
    "Le rapport entre l'identité et l'inspiration : une part de soi attirée par ce qui dépasse l'ego, par la fusion avec quelque chose de plus grand — un idéal, une cause, une pratique spirituelle ou artistique. Cet axe montre si cette aspiration nourrit une identité élargie et généreuse, ou si elle dilue le sens de qui l'on est jusqu'à la confusion.",
  "neptune-venus":
    "L'un des axes les plus idéalistes du thème en matière d'attirance : un amour qui cherche la fusion, le romantisme, parfois jusqu'à l'illusion sur l'autre. Cet axe indique si cette part rêveuse nourrit une vraie capacité à aimer sans calcul, ou si elle expose à voir chez l'autre ce qu'on a envie d'y voir plutôt que ce qui s'y trouve vraiment.",
  "pluto-saturn":
    "Le lien entre la structure et la transformation profonde : une capacité à tenir bon dans l'épreuve, à reconstruire méthodiquement ce qui a été détruit. Cet axe montre si cette endurance sert une vraie régénération, ou si elle se fige en rigidité, en refus de lâcher des structures devenues obsolètes par peur du vide.",
  "pluto-sun":
    "L'un des axes les plus intenses du thème : l'identité consciente rencontre des forces profondes de transformation, de pouvoir, parfois de survie. Cet axe indique si cette puissance sert une vraie régénération de qui l'on est, ou si elle se retourne en besoin de contrôle, en rapport de force avec soi-même ou avec les figures d'autorité.",
  "pluto-venus":
    "Un axe d'attirance intense : des liens qui ne se vivent jamais dans la demi-mesure, une capacité de fascination et d'engagement profond. Cet axe montre si cette intensité nourrit des relations qui transforment vraiment, ou si elle glisse vers la possessivité, la jalousie, le besoin de fusionner totalement avec l'autre pour se sentir en sécurité.",
  "saturn-uranus":
    "La tension classique entre la structure et la rupture : le besoin de solidité et de continuité se heurte au besoin de liberté et de changement. Cet axe indique si cette friction pousse à innover sans tout casser, à faire évoluer une structure de l'intérieur, ou si elle installe un conflit permanent entre rester et partir.",
  "sun-uranus":
    "Le rapport entre l'identité et le besoin de singularité : une part de soi qui refuse de se fondre dans le moule, qui a besoin d'être reconnue pour ce qui la distingue des autres. Cet axe montre si cette différence s'assume sereinement, ou si elle se traduit par une rébellion permanente, un besoin de rupture qui empêche de s'enraciner où que ce soit.",
  "uranus-venus":
    "Un axe d'attirance pour l'inattendu : un magnétisme qui se déclenche souvent hors des cases habituelles, un besoin de liberté qui n'aime pas les liens trop prévisibles. Cet axe indique si cette indépendance nourrit des relations vivantes et non conventionnelles, ou si elle empêche de s'engager vraiment, par peur de perdre sa liberté.",
  "asc-neptune":
    "Ce qui se joue entre l'image spontanée et le flou : une présence qui semble insaisissable, parfois magnétique, parfois difficile à cerner pour les autres — comme si on projetait un peu ce qu'on veut y voir. Cet axe indique si ce mystère attire et inspire, ou s'il installe un malentendu récurrent sur qui l'on est vraiment au premier abord.",
  "asc-pluto":
    "Ce qui se joue entre l'image spontanée et l'intensité : une présence qui marque, parfois perçue comme magnétique, parfois comme intimidante sans le vouloir. Cet axe montre si ce magnétisme naturel ouvre les échanges, ou s'il installe une distance, les autres hésitant à s'approcher d'une présence qu'ils sentent puissante mais difficile à lire.",
  "asc-uranus":
    "Ce qui se joue entre l'image spontanée et l'imprévisible : une façon d'apparaître qui surprend, qui ne colle jamais tout à fait aux attentes. Cet axe indique si cette singularité se vit comme une force d'originalité assumée, ou si elle installe un sentiment permanent de décalage avec les autres, dès le premier regard.",
  "mc-neptune":
    "Le lien entre la vocation et l'inspiration : un chemin professionnel ou social qui a besoin de sens, d'art, ou d'une dimension qui dépasse le simple gain matériel. Cet axe montre si cette aspiration trouve une direction concrète, ou si elle se traduit par une difficulté chronique à choisir une voie, faute de repères assez nets.",
  "mc-pluto":
    "Le lien entre la vocation et le pouvoir : un chemin professionnel marqué par des bouleversements profonds, parfois des reconstructions complètes de carrière. Cet axe indique si cette intensité sert une vraie transformation vers plus d'authenticité, ou si elle se traduit par des rapports de pouvoir compliqués avec la hiérarchie ou l'autorité.",
  "mc-uranus":
    "Le lien entre la vocation et l'innovation : un chemin professionnel qui a besoin de liberté, d'originalité, qui s'accommode mal des cadres trop rigides. Cet axe montre si cette indépendance nourrit une trajectoire vraiment singulière, ou si elle se traduit par des ruptures de carrière répétées, faute de trouver une structure assez souple pour s'y poser.",
  "neptune-uranus":
    "Un axe rare à l'échelle individuelle tant leur cycle est lent : la rencontre entre la rupture et la dissolution des repères, souvent plus lisible comme toile de fond d'une génération entière que comme signature vraiment personnelle. Dans le thème, c'est surtout la maison qu'il occupe qui indique où cette tension collective entre changement et remise en question se joue concrètement dans une vie.",
  "neptune-pluto":
    "L'axe le plus lent du thème, à l'échelle de plusieurs générations : la rencontre entre la dissolution des repères et la transformation profonde des structures collectives. Rarement une signature individuelle, il se lit surtout à travers la maison qu'il occupe, là où une génération entière est amenée à réinventer ce en quoi elle croit.",
  "pluto-uranus":
    "Un axe générationnel marquant, souvent associé à des périodes de bouleversement radical et de remise en cause profonde des structures établies. Dans un thème individuel, c'est la maison qu'il occupe qui donne la clé : c'est là que cette tension collective entre rupture et transformation prend une couleur personnelle.",
};

// Thèmes de fond formulés en langage de couple (désir, séduction,
// attachement amoureux) — à ne jamais afficher tels quels pour une
// synastrie ou un composite cadré famille/amitié/professionnel : le texte
// générique reste pertinent en lecture natale (auto-description) ou en
// cadrage romantique uniquement.
const ROMANTIC_CODED_PAIRS = new Set([
  "mars-venus",
  "sun-venus",
  "moon-venus",
  "saturn-venus",
  "mercury-venus",
  "neptune-venus",
  "pluto-venus",
  "uranus-venus",
]);

function pairKey(a: PointKey, b: PointKey): string {
  return [a, b].sort().join("-");
}

export function getPairTheme(a: PointKey, b: PointKey): string | undefined {
  return PAIR_THEMES[pairKey(a, b)];
}

export function isRomanticCodedPair(a: PointKey, b: PointKey): boolean {
  return ROMANTIC_CODED_PAIRS.has(pairKey(a, b));
}
