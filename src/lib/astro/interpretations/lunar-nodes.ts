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
  belier: "Décider seul·e, agir sans attendre l'aval des autres, assumer son propre élan même au prix de quelques erreurs : voilà l'apprentissage central. La mission : oser l'initiative.",
  taureau: "Se poser, faire confiance au temps long, accorder de la valeur à ce qui est stable plutôt que de tout remettre en jeu — c'est le terrain à cultiver. La mission : construire sur des bases concrètes et durables.",
  gemeaux: "Rester curieux·se sans avoir toutes les réponses, échanger simplement plutôt que théoriser seul·e : c'est ce vers quoi tendre. La mission : s'ouvrir à l'échange léger et à l'apprentissage continu.",
  cancer: "Accueillir sa vulnérabilité, prendre soin de soi et des siens sans culpabiliser — voilà ce qui reste à apprivoiser. La mission : légitimer son besoin de sécurité affective.",
  lion: "S'exposer, créer et se laisser voir sans attendre la permission de briller : un apprentissage qui prend du temps. La mission : assumer une expression de soi plus personnelle et généreuse.",
  vierge: "Structurer, avancer pas à pas avec méthode plutôt que viser la vue d'ensemble parfaite — c'est le chemin à tracer. La mission : mettre de l'ordre utile dans le concret.",
  balance: "Composer avec l'autre, négocier, accepter que la vérité se construise à deux : voilà ce qu'il reste à intégrer. La mission : cultiver des relations équilibrées, pas des combats solitaires.",
  scorpion: "Lâcher le contrôle, aller au fond des choses, faire confiance à la transformation plutôt qu'à la légèreté de surface — un apprentissage exigeant. La mission : oser l'intensité et la vérité.",
  sagittaire: "Croire en quelque chose de plus grand, prendre du recul, explorer sans avoir besoin de tout maîtriser dans le détail : c'est ce qui se travaille ici. La mission : élargir sa vision du monde.",
  capricorne: "S'engager dans la durée, assumer des responsabilités et une discipline personnelle — voilà le terrain d'apprentissage. La mission : construire une autorité légitime sur soi-même.",
  verseau: "Penser au-delà du cercle proche, s'inscrire dans un projet collectif ou une cause plus large que ses intérêts personnels : c'est l'axe à développer. La mission : oser la différence utile au groupe.",
  poissons: "Lâcher le contrôle rationnel, faire confiance à l'intuition et à l'empathie plutôt qu'à la seule logique — un apprentissage qui demande du temps. La mission : accepter de ne pas tout maîtriser.",
};

export const SOUTH_NODE_SIGN_COMFORT: Record<ZodiacSign, string> = {
  belier: "L'indépendance et l'action impulsive viennent sans effort — à ne pas transformer en fuite permanente en avant.",
  taureau: "La recherche de confort et de stabilité est un réflexe acquis — à ne pas transformer en immobilisme par peur du changement.",
  gemeaux: "Jongler avec les idées et les contacts ne demande aucun effort particulier — à ne pas transformer en dispersion pour éviter l'engagement.",
  cancer: "Le repli protecteur sur la sphère familière est un terrain connu — à ne pas transformer en refuge permanent qui isole.",
  lion: "L'affirmation personnelle coule de source — à ne pas transformer en besoin permanent d'être au centre de tout.",
  vierge: "L'analyse critique et le perfectionnisme sont des réflexes bien rodés — à ne pas transformer en paralysie par souci du détail.",
  balance: "Plaire et maintenir l'harmonie ne coûte aucun effort — à ne pas transformer en évitement systématique du conflit nécessaire.",
  scorpion: "Le contrôle et l'intensité relationnelle sont un terrain maîtrisé d'avance — à ne pas transformer en méfiance permanente.",
  sagittaire: "La fuite vers l'ailleurs et les grandes idées est une pente naturelle — à ne pas transformer en évitement du concret.",
  capricorne: "Le sérieux et le contrôle sont des acquis d'emblée — à ne pas transformer en rigidité qui empêche de lâcher prise.",
  verseau: "La prise de distance et l'indépendance d'esprit viennent sans effort — à ne pas transformer en détachement émotionnel permanent.",
  poissons: "L'évasion et l'empathie fusionnelle sont un terrain déjà acquis — à ne pas transformer en fuite hors du réel.",
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
  1: "Le repli sur soi et l'auto-suffisance ne demandent aucun effort — à ne pas transformer en isolement relationnel.",
  2: "S'appuyer sur des ressources déjà acquises est un réflexe naturel — à ne pas transformer en dépendance à un confort déjà connu.",
  3: "Rester dans son cercle familier et ses habitudes de pensée ne coûte rien — à ne pas transformer en refus d'élargir sa perspective.",
  4: "Se réfugier dans la famille ou le passé est une pente facile — à ne pas transformer en incapacité à s'exposer au monde extérieur.",
  5: "Chercher la validation par la performance ou le plaisir immédiat vient sans effort — à ne pas transformer en fuite dans le divertissement.",
  6: "Se noyer dans le travail ou le contrôle du quotidien est un terrain connu — à ne pas transformer en oubli de soi.",
  7: "Se fondre dans une relation ou dépendre du regard d'autrui ne demande aucun effort — à ne pas transformer en perte d'identité propre.",
  8: "Le contrôle des ressources ou des émotions d'autrui est un réflexe acquis — à ne pas transformer en besoin permanent de maîtriser l'autre.",
  9: "La fuite dans les grandes idées ou l'ailleurs est une tentation facile — à ne pas transformer en évitement des responsabilités concrètes.",
  10: "Rechercher la reconnaissance sociale coule de source — à ne pas transformer en identité entièrement dépendante du statut.",
  11: "Se fondre dans un groupe ou une cause ne coûte aucun effort — à ne pas transformer en dilution de sa singularité.",
  12: "Le retrait et l'évasion sont un terrain bien connu — à ne pas transformer en fuite permanente hors des responsabilités du quotidien.",
};
