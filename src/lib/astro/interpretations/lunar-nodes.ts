import type { ZodiacSign } from "../types";

/**
 * Lecture de l'axe des Nœuds lunaires comme "mission de vie" : le Nœud Nord
 * indique une direction d'évolution à apprivoiser (souvent inconfortable au
 * début, car peu familière) ; le Nœud Sud (toujours au signe et à la maison
 * opposés) indique un terrain acquis, des talents innés sur lesquels on
 * s'appuie trop facilement — à utiliser comme un point d'appui, pas comme
 * une zone de confort où se réfugier indéfiniment.
 */

export const NORTH_NODE_SIGN_MISSION: Record<ZodiacSign, string> = {
  belier: "Apprendre à décider seul·e, à agir sans attendre l'aval des autres, à assumer son propre élan même au prix de quelques erreurs. La mission : oser l'initiative.",
  taureau: "Apprendre à se poser, à faire confiance au temps long et à la valeur de ce qui est stable plutôt que de tout remettre en jeu. La mission : construire sur des bases concrètes et durables.",
  gemeaux: "Apprendre à rester curieux·se sans avoir toutes les réponses, à échanger simplement plutôt qu'à théoriser seul·e. La mission : s'ouvrir à l'échange léger et à l'apprentissage continu.",
  cancer: "Apprendre à accueillir sa vulnérabilité, à prendre soin de soi et des siens sans culpabiliser. La mission : légitimer son besoin de sécurité affective.",
  lion: "Apprendre à s'exposer, à créer et à être vu·e sans attendre la permission de briller. La mission : assumer une expression de soi plus personnelle et généreuse.",
  vierge: "Apprendre à structurer, à faire un pas après l'autre avec méthode plutôt que de viser la vue d'ensemble parfaite. La mission : mettre de l'ordre utile dans le concret.",
  balance: "Apprendre à composer avec l'autre, à négocier et à accepter que la vérité se construise à deux. La mission : cultiver des relations équilibrées, pas des combats solitaires.",
  scorpion: "Apprendre à lâcher le contrôle, à aller au fond des choses et à faire confiance à la transformation plutôt qu'à la légèreté de surface. La mission : oser l'intensité et la vérité.",
  sagittaire: "Apprendre à croire en quelque chose de plus grand, à prendre du recul et à explorer sans avoir besoin de tout maîtriser dans le détail. La mission : élargir sa vision du monde.",
  capricorne: "Apprendre à s'engager dans la durée, à assumer des responsabilités et une discipline personnelle. La mission : construire une autorité légitime sur soi-même.",
  verseau: "Apprendre à penser au-delà du cercle proche, à s'inscrire dans un projet collectif ou une cause plus large que ses intérêts personnels. La mission : oser la différence utile au groupe.",
  poissons: "Apprendre à lâcher le contrôle rationnel, à faire confiance à l'intuition et à l'empathie plutôt qu'à la seule logique. La mission : accepter de ne pas tout maîtriser.",
};

export const SOUTH_NODE_SIGN_COMFORT: Record<ZodiacSign, string> = {
  belier: "Un terrain acquis : l'indépendance et l'action impulsive viennent facilement — à ne pas transformer en fuite permanente en avant.",
  taureau: "Un terrain acquis : la recherche de confort et de stabilité vient facilement — à ne pas transformer en immobilisme par peur du changement.",
  gemeaux: "Un terrain acquis : jongler avec les idées et les contacts vient facilement — à ne pas transformer en dispersion pour éviter l'engagement.",
  cancer: "Un terrain acquis : le repli protecteur sur la sphère familière vient facilement — à ne pas transformer en refuge permanent qui isole.",
  lion: "Un terrain acquis : l'affirmation personnelle vient facilement — à ne pas transformer en besoin permanent d'être au centre de tout.",
  vierge: "Un terrain acquis : l'analyse critique et le perfectionnisme viennent facilement — à ne pas transformer en paralysie par souci du détail.",
  balance: "Un terrain acquis : plaire et maintenir l'harmonie viennent facilement — à ne pas transformer en évitement systématique du conflit nécessaire.",
  scorpion: "Un terrain acquis : le contrôle et l'intensité relationnelle viennent facilement — à ne pas transformer en méfiance permanente.",
  sagittaire: "Un terrain acquis : la fuite vers l'ailleurs et les grandes idées vient facilement — à ne pas transformer en évitement du concret.",
  capricorne: "Un terrain acquis : le sérieux et le contrôle viennent facilement — à ne pas transformer en rigidité qui empêche de lâcher prise.",
  verseau: "Un terrain acquis : la prise de distance et l'indépendance d'esprit viennent facilement — à ne pas transformer en détachement émotionnel permanent.",
  poissons: "Un terrain acquis : l'évasion et l'empathie fusionnelle viennent facilement — à ne pas transformer en fuite hors du réel.",
};

export const NORTH_NODE_HOUSE_MISSION: Record<number, string> = {
  1: "Affirmer une identité propre, indépendante du regard des autres — apprendre à exister pour soi, pas seulement en réaction à autrui.",
  2: "Construire sa propre sécurité matérielle et son échelle de valeurs — apprendre à ne dépendre de personne pour se sentir légitime.",
  3: "Apprendre à communiquer simplement, à s'ouvrir à son entourage immédiat plutôt qu'à viser trop loin trop vite.",
  4: "Poser des racines, prendre soin de son foyer et de sa vie intérieure — apprendre à se recentrer sur l'intime.",
  5: "Oser la créativité et l'expression personnelle — apprendre à jouer, créer et s'exposer sans attendre un résultat garanti.",
  6: "Trouver du sens dans le quotidien et le service concret — apprendre l'utilité et la discipline sans perfectionnisme excessif.",
  7: "Apprendre à composer avec l'autre dans une relation d'égal à égal — sortir d'un fonctionnement trop solitaire.",
  8: "Apprendre à lâcher le contrôle sur ce qui est partagé (intimité, ressources communes) et à traverser consciemment les transformations.",
  9: "Élargir ses horizons — étudier, voyager, questionner ses croyances plutôt que de s'en tenir à un cadre déjà connu.",
  10: "Assumer une ambition et une visibilité sociale — apprendre à se positionner publiquement plutôt qu'à rester en retrait.",
  11: "S'investir dans des projets collectifs et des amitiés choisies — apprendre à exister au sein d'un groupe, pas seulement en solo.",
  12: "Faire la paix avec sa vie intérieure et son besoin de retrait — apprendre à lâcher prise sur le contrôle permanent du réel.",
};

export const SOUTH_NODE_HOUSE_COMFORT: Record<number, string> = {
  1: "Le repli sur soi et l'auto-suffisance viennent facilement — à ne pas transformer en isolement relationnel.",
  2: "S'appuyer sur des ressources déjà acquises vient facilement — à ne pas transformer en dépendance à un confort déjà connu.",
  3: "Rester dans son cercle familier et ses habitudes de pensée vient facilement — à ne pas transformer en refus d'élargir sa perspective.",
  4: "Se réfugier dans la famille ou le passé vient facilement — à ne pas transformer en incapacité à s'exposer au monde extérieur.",
  5: "Chercher la validation par la performance ou le plaisir immédiat vient facilement — à ne pas transformer en fuite dans le divertissement.",
  6: "Se noyer dans le travail ou le contrôle du quotidien vient facilement — à ne pas transformer en oubli de soi.",
  7: "Se fondre dans une relation ou dépendre du regard d'autrui vient facilement — à ne pas transformer en perte d'identité propre.",
  8: "Le contrôle des ressources ou des émotions d'autrui vient facilement — à ne pas transformer en besoin permanent de maîtriser l'autre.",
  9: "La fuite dans les grandes idées ou l'ailleurs vient facilement — à ne pas transformer en évitement des responsabilités concrètes.",
  10: "Rechercher la reconnaissance sociale vient facilement — à ne pas transformer en identité entièrement dépendante du statut.",
  11: "Se fondre dans un groupe ou une cause vient facilement — à ne pas transformer en dilution de sa singularité.",
  12: "Le retrait et l'évasion viennent facilement — à ne pas transformer en fuite permanente hors des responsabilités du quotidien.",
};
