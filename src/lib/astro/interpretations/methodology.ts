export interface MethodologySection {
  title: string;
  body: string[];
}

export const METHODOLOGY: MethodologySection[] = [
  {
    title: "Le zodiaque utilisé : tropical, géocentrique",
    body: [
      "Astrologia utilise le zodiaque tropical (occidental), calé sur les saisons : 0° Bélier correspond toujours à l'équinoxe de printemps, quelle que soit la position réelle des constellations dans le ciel. C'est le système utilisé par l'immense majorité de l'astrologie occidentale (par opposition au zodiaque sidéral utilisé en astrologie védique/indienne).",
      "Les positions sont géocentriques : calculées depuis le centre de la Terre, comme le veut la tradition astrologique, et non depuis la surface (topocentrique) — la différence est de toute façon négligeable pour tout ce qui n'est pas la Lune.",
      "Les longitudes sont apparentes (elles tiennent compte du temps de parcours de la lumière et de l'aberration), conformément à la pratique standard des logiciels d'éphémérides sérieux.",
    ],
  },
  {
    title: "Le moteur d'éphémérides",
    body: [
      "Les positions planétaires sont calculées avec Astronomy Engine, une bibliothèque open source fondée sur les modèles VSOP87/ELP2000 pour les positions du Soleil, de la Lune et des planètes — une précision de l'ordre de la seconde d'arc sur la période historique couverte par l'application, largement suffisante pour un usage astrologique.",
      "Le Nœud Nord utilisé est le Nœud moyen (formule de Meeus), qui lisse les oscillations à court terme du Nœud vrai — c'est la convention la plus répandue en astrologie occidentale.",
      "Chiron et les autres centaures/astéroïdes ne sont pas encore proposés : ils demandent des éphémérides spécifiques que nous validerons avant de les ajouter plutôt que de les approximer.",
    ],
  },
  {
    title: "Maisons astrologiques : quel système, et pourquoi",
    body: [
      "Quatre systèmes de maisons sont proposés : signes entiers (le plus ancien, chaque maison = un signe complet), maisons égales (12 secteurs de 30° à partir de l'Ascendant), Porphyre (division de chaque quadrant en trois parts égales en degrés) et Placidus (le plus utilisé en Europe francophone, qui divise le temps — et non l'espace — que met chaque degré de l'écliptique à se lever).",
      "Placidus est calculé par résolution itérative des arcs semi-diurnes, comme le veut sa définition originale. Ce système devient mathématiquement indéfini très près des cercles polaires (au-delà d'environ 66° de latitude à certaines dates) : dans ce cas précis, l'application bascule automatiquement sur les signes entiers et vous en informe, plutôt que d'afficher un résultat faux.",
      "Aucun système de maisons ne fait consensus absolu parmi les astrologues : nous affichons toujours clairement lequel est utilisé, pour que vous puissiez comparer si vous le souhaitez.",
    ],
  },
  {
    title: "Interprétation du degré exact",
    body: [
      "Au-delà du signe, chaque point est lu à son degré précis via trois repères classiques, tous calculés (jamais recopiés d'un texte tiers) : le décan, la phase dans le signe, et les degrés particuliers.",
      "Le décan divise chaque signe de 30° en trois tranches de 10°, chacune sous l'influence d'une planète selon l'ordre chaldéen (Mars, Soleil, Vénus, Mercure, Lune, Saturne, Jupiter), qui se répète en boucle sur les 36 décans du zodiaque — c'est le système de décans le plus répandu en astrologie occidentale, distinct des \"symboles sabians\" (que nous ne proposons pas, faute de pouvoir garantir la fidélité d'un texte source centenaire).",
      "La phase précoce (0-9°), médiane (10-19°) ou tardive (20-29°) nuance l'intensité et la maturité avec lesquelles le signe s'exprime.",
      "Le 29e degré de chaque signe (\"degré anarétique\") est traditionnellement lu comme un point de tension avant le changement de signe. Les degrés dits \"critiques\" (0°/13°/26° pour les signes cardinaux, 8°/21° pour les fixes, 4°/17° pour les mutables) sont un repère traditionnel supplémentaire, à prendre comme une nuance et non comme une preuve.",
    ],
  },
  {
    title: "Aspects et orbes",
    body: [
      "Les aspects majeurs (conjonction, opposition, carré, trigone, sextile) sont calculés avec des orbes de 5 à 8° selon l'aspect ; les aspects mineurs (quinconce, semi-sextile, semi-carré, sesqui-carré) avec des orbes plus serrés de 2 à 3°, conformément aux usages courants en astrologie occidentale moderne.",
      "Un aspect est dit \"applicatif\" quand l'écart à l'exactitude diminue avec le temps (les deux astres se rapprochent de l'aspect parfait), et \"séparatif\" dans le cas contraire — une nuance classique, indiquée quand elle est calculable.",
    ],
  },
  {
    title: "Synastrie",
    body: [
      "La synastrie superpose deux thèmes natals et calcule les aspects entre les planètes de l'un et celles de l'autre, ainsi que la maison du thème de la première personne dans laquelle tombent les planètes de la seconde (et réciproquement) — la technique dite du \"transparent\" ou de la superposition des maisons.",
      "Ce n'est ni un score ni un verdict : une synastrie riche en aspects tendus n'est pas \"mauvaise\" en soi, elle indique des frictions à travailler consciemment ; une synastrie très harmonieuse peut aussi manquer de tension motrice. La lecture reste une aide à la compréhension, pas un oracle.",
    ],
  },
  {
    title: "Thème composite",
    body: [
      "Le thème composite est calculé par la méthode des points médians (popularisée par Robert Hand) : chaque planète du composite est le point médian circulaire (par le plus court arc) des positions des deux personnes ; l'Ascendant et le Milieu du Ciel composites sont eux-mêmes les points médians des deux Ascendants et Milieux du Ciel.",
      "Comme ce thème ne correspond à aucun lieu géographique réel, les maisons intermédiaires sont réparties en maisons égales à partir de l'Ascendant composite — la convention la plus répandue pour ce type de thème, en l'absence de latitude réelle sur laquelle appliquer Placidus.",
      "Il existe une autre approche, le \"thème relationnel\" de Davison, qui recalcule un vrai thème pour l'instant et le lieu moyens du couple : elle n'est pas encore proposée, mais figure sur notre feuille de route.",
    ],
  },
  {
    title: "Cartographie astrologique (astrocartographie)",
    body: [
      "Chaque planète est projetée sur une carte du monde sous forme de quatre lignes : Milieu du Ciel (MC) et Fond du Ciel (IC), qui sont des méridiens (droites verticales), et Ascendant (AC)/Descendant (DC), qui sont des courbes — car l'endroit où une planète se lève ou se couche à l'horizon dépend de la latitude, contrairement à la culmination.",
      "Le principe : au moment de votre naissance, chaque planète occupait une ascension droite et une déclinaison précises dans le ciel. La carte montre, pour chaque point du globe, où cette planète se serait exactement trouvée à l'un des quatre angles (Ascendant, Milieu du Ciel, Descendant, Fond du Ciel) — pas où vous devriez vivre, mais quelles énergies planétaires sont \"activées\" à cet endroit.",
      "Certaines lignes n'apparaissent pas à toutes les latitudes : quand une planète ne se lève ni ne se couche jamais à une latitude donnée (elle y est circumpolaire), sa ligne d'Ascendant ou de Descendant n'y est simplement pas définie.",
      "Ce que la cartographie ne fait pas : elle ne prédit pas d'événements, ne remplace pas un déménagement réfléchi, et doit se lire en complément du thème natal — pas isolément.",
    ],
  },
  {
    title: "Limites assumées",
    body: [
      "L'astrologie n'est pas une science au sens où l'entend la méthode scientifique moderne (absence de mécanisme causal identifié, de reproductibilité contrôlée) ; nous la proposons comme un outil de réflexion, d'introspection et de langage symbolique, hérité d'une tradition d'observation de plusieurs millénaires — pas comme une prédiction certaine.",
      "L'heure de naissance exacte change radicalement l'Ascendant, le Milieu du Ciel et les maisons. Une erreur de quelques minutes peut suffire à changer de signe ascendant en fin ou début de degré : indiquez l'heure la plus précise possible (état civil, carnet de santé), et à défaut utilisez le mode \"heure inconnue\", qui désactive honnêtement les angles et les maisons plutôt que d'inventer une précision qui n'existe pas.",
    ],
  },
];
