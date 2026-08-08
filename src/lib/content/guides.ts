export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  readingMinutes: number;
  publishedAt: string; // ISO "YYYY-MM-DD"
  intro: string;
  sections: GuideSection[];
  relatedHref: string;
  relatedLabel: string;
}

// Contenu éditorial evergreen (pas de génération automatique) : le
// complément "pourquoi" de la page /methode qui explique "comment" on
// calcule. Ton volontairement identique au reste du site — rigoureux,
// honnête sur les limites, sans vocabulaire ésotérique inutile.
export const GUIDES: Guide[] = [
  {
    slug: "mercure-retrograde",
    title: "Mercure rétrograde : ce qu'il se passe vraiment",
    description:
      "Mercure ne recule jamais réellement — on démêle l'illusion optique, ce qu'elle affecte concrètement, et pourquoi la réputation de la rétrogradation dépasse largement ses effets réels.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Trois à quatre fois par an, des messages circulent pour prévenir de sauvegarder ses fichiers et de relire ses e-mails deux fois : Mercure serait rétrograde. C'est le phénomène astrologique le plus connu du grand public, et aussi le plus mal compris. Voici ce qu'il se passe réellement, sans mysticisme et sans le balayer non plus d'un revers de main.",
    sections: [
      {
        heading: "Une illusion d'optique, pas un vrai recul",
        paragraphs: [
          "Mercure ne s'arrête jamais et ne repart jamais en arrière sur son orbite — aucune planète ne le fait. Ce qu'on observe depuis la Terre est un effet de perspective : Mercure orbite plus vite et plus près du Soleil que la Terre, donc à intervalles réguliers, elle la \"double\" sur une trajectoire intérieure. Vu depuis notre point d'observation en mouvement, elle semble ralentir, s'arrêter, puis reculer dans le ciel avant de reprendre sa marche normale — exactement comme une voiture plus rapide qui vous dépasse sur l'autoroute peut sembler reculer par rapport au paysage si vous ne regardez que son mouvement relatif.",
          "C'est un phénomène purement géométrique, entièrement prévisible des siècles à l'avance par le calcul — le moteur de ce site utilise les mêmes éphémérides pour déterminer, pour n'importe quelle date, si Mercure (ou n'importe quelle autre planète) est en mouvement rétrograde apparent.",
        ],
      },
      {
        heading: "Ce que la tradition astrologique en fait",
        paragraphs: [
          "En astrologie, chaque planète est associée à un domaine : Mercure gouverne la communication, les échanges d'information, les trajets courts, la logique, les contrats. La lecture traditionnelle veut qu'une planète rétrograde \"fonctionne à l'envers\" ou ralentit l'expression normale de ce qu'elle représente — d'où l'association avec les malentendus, les retards de courrier, les pépins techniques, les négociations qui capotent.",
          "Cette lecture mérite d'être prise pour ce qu'elle est : une porte d'entrée symbolique commode, pas une loi physique. Le vrai intérêt, si l'on choisit de s'y intéresser, est moins \"tout va mal pendant trois semaines\" que \"c'est une bonne période pour revoir, relire, reformuler plutôt que lancer du neuf\" — les rétrogradations reviennent régulièrement dans l'année, ce qui en fait des pauses naturelles utiles pour ce genre de tâches, indépendamment de toute croyance.",
        ],
      },
      {
        heading: "Ce qui compte vraiment : votre thème natal",
        paragraphs: [
          "Une nuance que la culture populaire oublie presque toujours : si Mercure était déjà rétrograde au moment de votre naissance, ce n'est pas un mauvais présage — c'est simplement un placement natal parmi d'autres, associé (selon la tradition) à une pensée plus introspective, qui mûrit avant de s'exprimer plutôt que de jaillir spontanément. Ni meilleur ni pire qu'un Mercure direct à la naissance : juste un fonctionnement différent.",
          "Ce qui a plus de poids concrètement que la rétrogradation du moment, c'est où se trouve votre Mercure natal (son signe, sa maison, ses aspects) : c'est lui qui décrit durablement votre style de communication, pas le mouvement apparent que traverse la planète cette semaine-ci pour tout le monde en même temps.",
        ],
      },
    ],
    relatedHref: "/methode",
    relatedLabel: "Voir comment le site calcule les positions planétaires →",
  },
  {
    slug: "les-12-maisons",
    title: "Les 12 maisons astrologiques expliquées",
    description:
      "Si les signes disent le comment et les planètes le quoi, les maisons disent le où : les 12 secteurs de vie que traverse le thème natal, expliqués un par un.",
    readingMinutes: 8,
    publishedAt: "2026-08-08",
    intro:
      "Un thème natal superpose trois langages : les planètes (quoi — quelle énergie), les signes (comment — quelle coloration) et les maisons (où — dans quel domaine de vie). Les maisons sont souvent le concept le plus difficile à saisir en débutant, parce qu'elles dépendent de l'heure de naissance exacte — contrairement au signe solaire, elles ne s'improvisent pas. Voici à quoi correspond chacune des douze.",
    sections: [
      {
        heading: "Pourquoi les maisons ont besoin d'une heure de naissance",
        paragraphs: [
          "Les maisons découpent le ciel tel qu'il apparaissait au-dessus du lieu de naissance, à l'instant précis de la naissance — c'est la rotation de la Terre sur elle-même en 24h qui fait défiler les douze maisons, pas le déplacement des planètes (qui prend des mois, voire des années). Une erreur de quelques minutes sur l'heure de naissance peut donc suffire à décaler l'Ascendant (le début de la Maison I) et, par ricochet, la maison de chaque planète — c'est pourquoi ce site affiche toujours honnêtement quand une heure de naissance est inconnue plutôt que d'inventer un système de maisons non fiable.",
          "Il existe aussi plusieurs conventions mathématiques pour découper les maisons (Placidus, maisons égales, signes entiers, Porphyre...) qui donnent des frontières légèrement différentes sans changer les grands principes ci-dessous — voir la page méthode pour le détail de chaque système.",
        ],
      },
      {
        heading: "Les maisons angulaires (I, IV, VII, X) — l'ossature",
        paragraphs: [
          "Ce sont les quatre piliers du thème : Maison I (identité, l'image donnée au monde), Maison IV (racines, foyer, famille d'origine), Maison VII (relations, partenariats, le \"face-à-face\") et Maison X (vocation, statut social, ce qu'on construit publiquement). Une planète tombant dans l'une de ces quatre maisons y gagne traditionnellement du poids et de la visibilité dans la vie de la personne.",
        ],
      },
      {
        heading: "Les maisons succédentes (II, V, VIII, XI) — ce qu'on construit",
        paragraphs: [
          "Maison II (ressources, valeurs, sécurité matérielle), Maison V (créativité, plaisir, amour ludique, enfants), Maison VIII (transformation, ce qu'on partage en profondeur, deuils et renaissances) et Maison XI (réseau, amis, projets collectifs, idéaux). Elles prolongent et stabilisent l'élan donné par la maison angulaire qui les précède.",
        ],
      },
      {
        heading: "Les maisons cadentes (III, VI, IX, XII) — apprentissage et transition",
        paragraphs: [
          "Maison III (communication, entourage proche, apprentissages du quotidien), Maison VI (travail concret, santé, routines), Maison IX (horizons, sens, études supérieures, grands voyages) et Maison XII (intériorité, inconscient, ce qui échappe au contrôle). Ce sont des maisons de transition, souvent associées à un travail intérieur plutôt qu'à une action extérieure immédiate.",
        ],
      },
      {
        heading: "Comment les lire concrètement",
        paragraphs: [
          "En pratique, une planète en maison répond à la question \"dans quel domaine de vie cette énergie planétaire s'exprime-t-elle le plus naturellement ?\". Un Mercure en Maison X, par exemple, tend à mettre la communication (Mercure) au service de la carrière et du statut social (Maison X) — la personne pourrait naturellement écrire, négocier ou enseigner dans un cadre professionnel visible. C'est cette superposition planète + signe + maison, répétée pour chaque point du thème, qui rend chaque thème natal unique plutôt que réductible à un seul signe.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Voir votre thème avec vos vraies maisons, sans compte →",
  },
  {
    slug: "ascendant",
    title: "L'Ascendant : pourquoi il compte autant que le Soleil",
    description:
      "Le signe solaire donne une identité générale. L'Ascendant, lui, décrit comment on aborde le monde au premier contact — et il change toutes les deux heures environ.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "\"Je suis Lion\" ne dit qu'une partie de l'histoire. En astrologie occidentale sérieuse, le Big 3 — Soleil, Lune, Ascendant — forme le socle d'un thème, et l'Ascendant en est souvent la pièce la plus déterminante au quotidien, alors qu'il reste le plus souvent ignoré par l'astrologie de comptoir.",
    sections: [
      {
        heading: "Qu'est-ce que l'Ascendant, concrètement",
        paragraphs: [
          "L'Ascendant est le signe qui se levait à l'horizon Est, précisément au moment et au lieu de la naissance. Contrairement au Soleil (qui reste dans le même signe environ un mois) ou à la Lune (environ deux jours et demi), l'Ascendant change de signe toutes les deux heures en moyenne — deux personnes nées le même jour, à quelques heures d'intervalle, peuvent avoir un Ascendant totalement différent, alors même que leur Soleil et souvent leur Lune restent identiques.",
          "C'est cette sensibilité extrême à l'heure exacte qui explique pourquoi ce site refuse d'inventer un Ascendant quand l'heure de naissance est inconnue : une erreur de trente minutes peut suffire à basculer sur le signe voisin, et donc à fausser complètement la lecture.",
        ],
      },
      {
        heading: "Le masque social, pas un mensonge",
        paragraphs: [
          "L'image classique veut que l'Ascendant soit le \"masque social\" : la manière spontanée d'aborder une situation nouvelle, la première impression qu'on donne, les réflexes qui s'activent avant même la réflexion consciente. Ce n'est pas un masque au sens de façade fausse — c'est plutôt le point d'entrée, le mode par défaut, alors que le Soleil décrit davantage ce vers quoi on tend en profondeur une fois la confiance installée.",
          "Une personne Soleil Poissons avec Ascendant Bélier, par exemple, peut sembler franche et directe au premier abord (Ascendant Bélier), tout en restant intérieurement plus rêveuse et empathique une fois qu'on la connaît mieux (Soleil Poissons). Ce n'est pas une contradiction : c'est la coexistence normale de plusieurs couches dans un même thème.",
        ],
      },
      {
        heading: "L'Ascendant définit aussi la Maison I — et tout le reste",
        paragraphs: [
          "Au-delà du signe lui-même, l'Ascendant marque le début de la Maison I et sert de point de départ à tout le système de maisons entières du thème (voir le guide dédié aux 12 maisons). Changer l'Ascendant, c'est donc potentiellement décaler la maison de chaque planète du thème — une autre raison pour laquelle il pèse autant que le Soleil dans une lecture sérieuse, malgré le peu d'attention qu'il reçoit dans la culture populaire.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Calculer votre Ascendant réel, sans compte →",
  },
  {
    slug: "lire-son-theme-natal",
    title: "Thème natal : par où commencer quand on débute",
    description:
      "Un thème natal complet affiche des dizaines de positions et d'aspects d'un coup. Voici un ordre de lecture raisonnable pour ne pas se noyer dès la première consultation.",
    readingMinutes: 7,
    publishedAt: "2026-08-08",
    intro:
      "La première fois qu'on ouvre son thème natal complet, l'impression est souvent la même : trop d'informations, dans le désordre, sans savoir par où commencer. Ce guide propose un ordre de lecture progressif — pas la seule méthode possible, mais une qui évite de se perdre.",
    sections: [
      {
        heading: "1. Le Big 3 d'abord, rien d'autre",
        paragraphs: [
          "Avant les aspects, avant les maisons secondaires, avant les planètes lentes : commencez par le Soleil, la Lune et l'Ascendant. À eux trois, ils donnent déjà une structure lisible — identité consciente (Soleil), besoin affectif et réflexes intérieurs (Lune), manière d'aborder le monde (Ascendant). C'est suffisant pour une première impression cohérente, sans se noyer dans le reste.",
        ],
      },
      {
        heading: "2. Les planètes personnelles (Mercure, Vénus, Mars)",
        paragraphs: [
          "Une fois le Big 3 posé, élargissez aux trois planètes personnelles restantes : Mercure (comment on pense et communique), Vénus (comment on aime et ce qu'on trouve beau) et Mars (comment on agit et défend ses limites). Elles se déplacent assez vite (quelques semaines à quelques mois par signe) et affinent la personnalité de façon très concrète et quotidienne.",
        ],
      },
      {
        heading: "3. Les maisons : où ça se joue",
        paragraphs: [
          "Avec une heure de naissance fiable, regardez ensuite dans quelles maisons tombent ces six premiers points. C'est l'étape qui transforme \"j'ai telle énergie\" en \"cette énergie s'exprime surtout dans tel domaine de vie concret\" — voir le guide dédié aux 12 maisons pour le détail de chacune.",
        ],
      },
      {
        heading: "4. Les aspects : les dialogues entre les planètes",
        paragraphs: [
          "Les aspects (conjonction, trigone, carré, opposition, sextile...) décrivent comment les planètes du thème interagissent entre elles — une tension, une fluidité, un renforcement. C'est l'étape la plus riche mais aussi la plus dense : mieux vaut la découvrir une fois les bases posées, en commençant par les aspects impliquant le Soleil et la Lune plutôt que par les dizaines d'aspects secondaires d'un coup. Voir le guide dédié pour apprendre à les lire.",
        ],
      },
      {
        heading: "5. Les planètes lentes en dernier",
        paragraphs: [
          "Jupiter et Saturne (quelques années par signe), puis Uranus, Neptune et Pluton (plusieurs années, parfois plus d'une décennie par signe) closent la lecture. Leur position en signe marque surtout une génération entière plutôt qu'un trait strictement personnel — ce qui vous est propre s'y lit avant tout à travers leur maison et leurs aspects, pas leur signe seul.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Voir votre Big 3 en 10 secondes pour démarrer →",
  },
  {
    slug: "synastrie-vs-composite",
    title: "Synastrie ou thème composite : quelle différence ?",
    description:
      "Les deux outils d'astrologie relationnelle les plus utilisés ne répondent pas à la même question. Voici comment les distinguer et savoir lequel consulter en premier.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Quand on s'intéresse à la compatibilité astrologique entre deux personnes, deux méthodes reviennent constamment : la synastrie et le thème composite. Elles sont souvent confondues alors qu'elles répondent à deux questions différentes.",
    sections: [
      {
        heading: "La synastrie : comment nous nous regardons l'un l'autre",
        paragraphs: [
          "La synastrie superpose les deux thèmes natals tels quels et regarde les aspects qui se forment entre les planètes de la personne A et celles de la personne B — la Vénus de l'une en aspect avec le Mars de l'autre, par exemple. C'est un outil qui décrit la dynamique de perception réciproque : comment chacun réagit à l'autre, ce qui attire, ce qui frotte, où se trouvent les points de friction naturels.",
          "C'est généralement le point d'entrée le plus intuitif d'une lecture de couple, d'amitié ou de collaboration, parce qu'elle reste ancrée dans les deux personnalités individuelles, sans en créer une troisième.",
        ],
      },
      {
        heading: "Le thème composite : une troisième entité",
        paragraphs: [
          "Le thème composite, à l'inverse, calcule les points médians entre les positions des deux thèmes natals (méthode des points milieux) pour construire un thème entièrement nouveau — celui \"de la relation\" elle-même, comme si le couple ou l'association était une entité à part entière avec son propre Soleil, sa propre Lune, son propre Ascendant.",
          "C'est un outil plus abstrait mais souvent plus révélateur sur le long terme : il ne dit pas \"comment A perçoit B\", mais \"ce que cette relation devient une fois formée\", indépendamment des deux personnalités d'origine — utile pour comprendre l'identité propre d'un couple installé, d'une association professionnelle ou d'un projet commun.",
        ],
      },
      {
        heading: "Lequel consulter en premier ?",
        paragraphs: [
          "En pratique, la synastrie répond mieux à \"pourquoi est-ce que ça accroche (ou ça frotte) entre nous ?\", tandis que le composite répond mieux à \"qu'est-ce que cette relation est en train de devenir ?\". Les deux se complètent plutôt qu'ils ne se remplacent — une bonne lecture relationnelle sérieuse regarde généralement les deux, jamais un seul en isolation.",
        ],
      },
    ],
    relatedHref: "/methode",
    relatedLabel: "Voir comment le site calcule synastrie et composite →",
  },
  {
    slug: "lire-un-aspect",
    title: "Comment lire un aspect astrologique",
    description:
      "Conjonction, carré, trigone, opposition, sextile : les aspects sont le langage qui relie les planètes entre elles. Voici comment les décoder sans les réduire à \"bon\" ou \"mauvais\".",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Un aspect, c'est l'angle géométrique que forment deux planètes sur le cercle du zodiaque au moment de la naissance. Cet angle détermine si les deux énergies planétaires se renforcent, se tendent ou s'ignorent — c'est le vocabulaire le plus fin d'un thème natal, une fois les bases (signes, maisons) posées.",
    sections: [
      {
        heading: "Les cinq aspects majeurs",
        paragraphs: [
          "La conjonction (0°) fusionne les deux énergies en une seule impulsion, difficile à séparer l'une de l'autre. Le sextile (60°) crée une opportunité de collaboration, qui demande un peu d'initiative pour se concrétiser. Le carré (90°) génère une tension dynamique, souvent vécue comme un frottement ou un obstacle intérieur — l'aspect le plus formateur quand il est travaillé plutôt qu'évité. Le trigone (120°) offre une circulation fluide et naturelle, un talent presque acquis d'avance, avec le risque de ne jamais le développer faute de résistance. L'opposition (180°) place les deux énergies face à face, chacune tirant vers un pôle différent — un équilibre à trouver plutôt qu'un camp à choisir.",
        ],
      },
      {
        heading: "L'orbe : une tolérance, pas une frontière stricte",
        paragraphs: [
          "Un aspect n'a pas besoin d'être exact au degré près pour compter : chaque type d'aspect a une \"orbe\", une marge de tolérance en degrés, généralement plus large pour les aspects majeurs impliquant le Soleil ou la Lune, plus stricte pour les aspects mineurs. Plus l'écart à l'exact est petit, plus l'aspect est considéré comme puissant — c'est pourquoi les lectures de ce site affichent systématiquement cet écart plutôt que de se contenter d'un simple \"oui/non\".",
        ],
      },
      {
        heading: "Ni bon ni mauvais : dynamique et enjeu",
        paragraphs: [
          "La tentation la plus courante est de classer les aspects en \"faciles\" (trigone, sextile) et \"difficiles\" (carré, opposition) — une simplification qui rate l'essentiel. Un trigone trop facile peut rester un talent jamais exploité, faute de friction pour le mobiliser. Un carré, à l'inverse, force souvent une croissance réelle précisément parce qu'il résiste. La vraie question à se poser face à un aspect n'est pas \"est-ce bon ou mauvais\", mais \"quel dialogue ça installe entre ces deux énergies, et qu'est-ce que ce dialogue me demande de faire consciemment ?\"",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Voir les aspects de votre propre thème, sans compte →",
  },
  {
    slug: "retour-de-saturne",
    title: "Le retour de Saturne : pourquoi 29 ans est un cap",
    description:
      "Vers 29 ans, Saturne revient exactement là où il était à votre naissance. Un jalon classique de bilan et de restructuration — ce qu'il signifie réellement, sans catastrophisme.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "\"J'ai eu mon retour de Saturne et tout s'est écroulé\" revient souvent en ligne. La réalité est plus nuancée : un jalon réel, prévisible au calcul, mais pas une fatalité.",
    sections: [
      {
        heading: "Un calcul, pas une légende",
        paragraphs: [
          "Saturne met environ 29 ans à parcourir le zodiaque entier et revenir exactement sur sa position de naissance — un \"retour planétaire\" au sens strict : la planète en transit forme une conjonction quasi exacte avec elle-même au thème natal. Ce site le détecte directement (voir l'horoscope quotidien, qui signale ce type de retour quand il se produit). Contrairement à Jupiter (retour tous les 12 ans, plus léger), le cycle de Saturne coïncide avec des étapes de vie déjà chargées en Occident — fin des études, premiers vrais engagements professionnels ou personnels — ce qui alimente sa réputation.",
        ],
      },
      {
        heading: "Ce que Saturne représente dans le thème",
        paragraphs: [
          "Saturne est la planète de la structure, du temps long, des responsabilités et des limites réalistes — par opposition à l'expansion sans limite de Jupiter. Son retour marque traditionnellement la fin d'une première structure de vie construite plus ou moins sous influence extérieure (attentes familiales, hasard des circonstances) et le début d'une structure choisie plus consciemment.",
          "Ce n'est pas un signal négatif en soi : c'est un moment où ce qui reposait sur des bases fragiles a tendance à se révéler, précisément pour permettre de reconstruire plus solide. Ce qui était déjà bâti sur des fondations sincères traverse généralement cette période sans drame.",
        ],
      },
      {
        heading: "Le deuxième et le troisième retour",
        paragraphs: [
          "Saturne revient une deuxième fois vers 58-59 ans, puis (plus rarement vécu) une troisième fois vers 88 ans — chacun marquant un bilan de structure adapté à l'étape de vie correspondante. Le premier retour reste le plus commenté parce qu'il coïncide avec l'entrée dans l'âge adulte pleinement assumé, mais le mécanisme est identique à chaque fois : un point de passage, pas un couperet.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Voir si votre retour de Saturne approche →",
  },
  {
    slug: "noeuds-lunaires",
    title: "Les nœuds lunaires : nœud nord et nœud sud",
    description:
      "Un axe qui ne représente aucun corps céleste réel, mais une intersection géométrique — et pourtant l'un des repères les plus utilisés pour parler de \"mission de vie\" en astrologie.",
    readingMinutes: 5,
    publishedAt: "2026-08-08",
    intro:
      "Contrairement aux planètes, les nœuds lunaires ne sont pas des objets physiques : ce sont les deux points où l'orbite de la Lune croise le plan de l'orbite terrestre autour du Soleil. Un axe purement géométrique, mais chargé de sens en astrologie.",
    sections: [
      {
        heading: "Un axe, deux points toujours opposés",
        paragraphs: [
          "Le Nœud Nord et le Nœud Sud sont toujours à 180° l'un de l'autre — exactement au signe et à la maison opposés dans le thème. Ils se déplacent lentement et à rebours du sens habituel des planètes (rétrogrades quasi en permanence), parcourant tout le zodiaque en environ 18 ans et demi.",
        ],
      },
      {
        heading: "Nœud Sud : le terrain acquis",
        paragraphs: [
          "Le Nœud Sud décrit un territoire familier, des réflexes qui ne demandent aucun effort — parfois lus comme un bagage déjà là au départ. Le risque n'est pas d'y puiser (c'est une vraie ressource), mais de s'y réfugier indéfiniment par facilité, au point de ne jamais explorer autre chose.",
        ],
      },
      {
        heading: "Nœud Nord : la direction à apprivoiser",
        paragraphs: [
          "Le Nœud Nord, à l'opposé, pointe vers un apprentissage moins naturel, souvent inconfortable au début parce que peu familier — une direction de croissance plutôt qu'un trait déjà acquis. La lecture traditionnelle en parle comme d'une \"mission\" : non pas ce qu'on est déjà, mais ce vers quoi on gagne à tendre consciemment, à son rythme.",
          "Ce site applique cette lecture dans le thème natal complet (voir votre page thème) : le signe du Nœud Nord y est présenté comme une direction, jamais comme une case à cocher — le nœud Sud n'est ni un défaut ni un point faible, juste un point de départ.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Voir l'axe de vos nœuds lunaires, sans compte →",
  },
  {
    slug: "retrogrades-au-dela-de-mercure",
    title: "Rétrogrades : pas que Mercure",
    description:
      "Vénus, Mars, Jupiter, Saturne et les planètes lentes rétrogradent aussi — avec des durées et des enjeux très différents de la rétrogradation de Mercure, la plus médiatisée.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Mercure rétrograde capte toute l'attention (voir le guide dédié), mais ce n'est pas la seule planète concernée. Chaque planète a son propre rythme de rétrogradation apparente, avec une fréquence et une signification différentes.",
    sections: [
      {
        heading: "Même mécanisme, rythmes différents",
        paragraphs: [
          "Le principe reste le même pour toutes les planètes (voir le guide sur Mercure rétrograde pour le détail géométrique) : un effet de perspective depuis la Terre en mouvement, jamais un vrai recul sur l'orbite. Mais la fréquence varie énormément selon la distance de la planète : Mercure rétrograde environ 3 à 4 fois par an sur quelques semaines, Vénus environ tous les 18 mois sur environ 6 semaines, Mars environ tous les 2 ans sur 2 à 3 mois, et les planètes lentes (Jupiter, Saturne, Uranus, Neptune, Pluton) rétrogradent chacune environ une fois par an, sur plusieurs mois d'affilée.",
        ],
      },
      {
        heading: "Vénus rétrograde : relations et valeurs",
        paragraphs: [
          "Vénus gouvernant l'amour, l'esthétique et les valeurs personnelles, sa rétrogradation est traditionnellement associée à un temps de révision plutôt que de lancement dans ce domaine : redéfinir ce qu'on trouve beau, ce qu'on désire vraiment, parfois le retour inattendu d'une personne ou d'un sujet du passé qui demande à être tranché plutôt qu'ignoré.",
        ],
      },
      {
        heading: "Mars rétrograde : l'action ralentie",
        paragraphs: [
          "Mars gouvernant l'action directe et l'affirmation, sa rétrogradation (plus rare, environ tous les deux ans) est associée à une frustration de l'élan : l'énergie a du mal à se déployer normalement vers l'extérieur, ce qui pousse traditionnellement à revoir sa stratégie plutôt qu'à foncer tête baissée.",
        ],
      },
      {
        heading: "Les planètes lentes : une pause plus qu'un événement",
        paragraphs: [
          "Jupiter, Saturne, Uranus, Neptune et Pluton passent une bonne partie de chaque année en rétrogradation (plusieurs mois consécutifs) — au point que ce n'est presque jamais un événement isolé mais un état normal et récurrent du thème du moment. Leur rétrogradation se lit surtout au niveau collectif ou générationnel, rarement comme un signal personnel fort.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Voir votre thème et ses transits, sans compte →",
  },
  {
    slug: "astrologie-humaniste-vs-predictive",
    title: "Astrologie humaniste ou prédictive : deux écoles, pas une vérité unique",
    description:
      "\"L'astrologie dit que...\" cache en réalité des écoles très différentes, parfois en désaccord frontal. Comprendre la distinction évite bien des malentendus.",
    readingMinutes: 5,
    publishedAt: "2026-08-08",
    intro:
      "Deux personnes peuvent consulter un thème natal avec des attentes opposées : l'une cherche à se comprendre, l'autre à savoir ce qui va se passer. Ce ne sont pas deux nuances de la même pratique — ce sont deux écoles distinctes, avec des origines et des méthodes différentes.",
    sections: [
      {
        heading: "L'astrologie prédictive : annoncer des événements",
        paragraphs: [
          "L'approche la plus ancienne, dominante jusqu'au XXe siècle : le thème et ses transits sont lus comme des indicateurs d'événements à venir (mariage, argent, santé...), dans une logique proche de la divination. C'est cette tradition qui alimente l'astrologie de tabloïd (\"cette semaine, gare aux arnaques financières\").",
        ],
      },
      {
        heading: "L'astrologie humaniste : comprendre plutôt que prédire",
        paragraphs: [
          "Popularisée notamment par l'astrologue Dane Rudhyar au XXe siècle, cette école s'inspire de la psychologie (Jung en particulier) et déplace l'objectif : le thème ne prédit rien, il décrit des dynamiques psychologiques, des tensions à intégrer, des potentiels à développer consciemment. Un aspect \"difficile\" n'annonce pas un événement négatif — il pointe un travail intérieur possible.",
          "C'est explicitement la philosophie de ce site (voir la page méthode) : un outil de réflexion et d'introspection, pas une prédiction. Les textes de ce site — sur les planètes, les maisons, les aspects — sont écrits dans cette tradition humaniste, même quand ils s'appuient sur des techniques de calcul héritées de la tradition prédictive (les maisons, les orbes, les transits eux-mêmes sont bien plus anciens que Rudhyar).",
        ],
      },
      {
        heading: "Pourquoi la distinction compte",
        paragraphs: [
          "Beaucoup de scepticisme envers l'astrologie vise en réalité sa branche prédictive (\"comment un alignement planétaire pourrait-il annoncer un événement précis ?\") — une critique légitime que l'école humaniste ne prétend d'ailleurs pas réfuter, puisqu'elle ne fait pas ce genre de promesse. Savoir à quelle école on s'adresse évite de juger l'ensemble de la pratique sur la base d'une seule de ses branches.",
        ],
      },
    ],
    relatedHref: "/methode",
    relatedLabel: "Voir la philosophie de ce site en détail →",
  },
  {
    slug: "composite-vs-davison",
    title: "Thème composite ou thème de Davison : deux façons de calculer \"le thème du couple\"",
    description:
      "Le thème composite (proposé sur ce site) et le thème de Davison répondent à la même intuition — un thème \"de la relation\" — avec deux méthodes de calcul différentes.",
    readingMinutes: 5,
    publishedAt: "2026-08-08",
    intro:
      "Après la synastrie (voir le guide dédié), le thème \"de la relation\" existe sous deux variantes qu'on confond souvent : le composite, calculé par points médians, et le thème de Davison, calculé autrement. Voici la différence.",
    sections: [
      {
        heading: "Le thème composite : une moyenne géométrique",
        paragraphs: [
          "Le composite (voir le guide \"Synastrie ou thème composite\") calcule le point médian entre chaque planète des deux thèmes natals — la moyenne géométrique des positions, sans lien avec un instant ou un lieu réels. C'est une construction mathématique pure, qui n'existe dans aucun lieu ni aucune date du calendrier : ni l'un ni l'autre thème natal, mais un troisième thème abstrait représentant la relation.",
        ],
      },
      {
        heading: "Le thème de Davison : un instant et un lieu moyens réels",
        paragraphs: [
          "Le thème de Davison, du nom de l'astrologue britannique Ronald Davison qui l'a formalisé dans les années 1970, prend une autre voie : il calcule la date et le lieu moyens entre les deux naissances (littéralement le point médian dans le temps et l'espace), puis établit un vrai thème natal pour cet instant et ce lieu précis, comme s'il s'agissait d'une naissance réelle.",
          "La différence n'est pas anodine : le composite n'a pas de maisons \"réelles\" au sens propre (voir la page méthode sur la convention utilisée), alors que le thème de Davison en a, puisqu'il correspond à un vrai lieu géographique et un vrai instant du calendrier — avec de vrais levers et couchers de planètes à cet endroit précis.",
        ],
      },
      {
        heading: "Ce que propose ce site",
        paragraphs: [
          "Ce site calcule aujourd'hui le thème composite (méthode des points médians) mais pas encore le thème de Davison, qui figure sur la feuille de route. Si vous croisez le terme \"Davison\" ailleurs en cherchant de la compatibilité astrologique, vous savez maintenant à quoi il correspond et en quoi il diffère du composite déjà disponible ici.",
        ],
      },
    ],
    relatedHref: "/decouvrir",
    relatedLabel: "Commencer par votre thème, sans compte →",
  },
  {
    slug: "choisir-systeme-maisons",
    title: "Placidus, signes entiers, maisons égales, Porphyre : lequel choisir ?",
    description:
      "Il n'existe pas un seul système de calcul des maisons universellement \"vrai\" — juste des conventions différentes, chacune avec sa logique et ses cas limites.",
    readingMinutes: 6,
    publishedAt: "2026-08-08",
    intro:
      "Changer de système de maisons peut déplacer certaines planètes d'une maison à l'autre sans toucher ni aux signes ni aux aspects. Beaucoup de débutants l'ignorent, alors que ce choix influence directement la lecture des domaines de vie.",
    sections: [
      {
        heading: "Signes entiers : le plus ancien",
        paragraphs: [
          "Le système le plus vieux (utilisé dans l'astrologie hellénistique) : chaque maison correspond exactement à un signe entier, la Maison I commençant au tout début du signe où se trouve l'Ascendant. Simple, robuste, fonctionne à n'importe quelle latitude sans exception — c'est aussi le système utilisé par ce site pour les horoscopes par signe (voir le guide dédié), précisément pour sa simplicité et sa fiabilité universelle.",
        ],
      },
      {
        heading: "Maisons égales : simple et prévisible",
        paragraphs: [
          "Douze secteurs de 30° pile, à partir du degré exact de l'Ascendant (qui n'est pas forcément à 0° d'un signe, contrairement aux signes entiers). Une maison peut donc chevaucher deux signes. Système intermédiaire en complexité, également fiable à toutes les latitudes.",
        ],
      },
      {
        heading: "Porphyre : diviser chaque quadrant en trois",
        paragraphs: [
          "Un système ancien lui aussi (IIIe siècle), qui découpe chaque quadrant (entre deux angles : Ascendant, Fond du Ciel, Descendant, Milieu du Ciel) en trois parts égales en degrés. Un compromis entre la simplicité des maisons égales et la sensibilité géographique de Placidus.",
        ],
      },
      {
        heading: "Placidus : le plus répandu, mais avec une limite",
        paragraphs: [
          "Le système le plus utilisé aujourd'hui en Europe francophone : il ne divise pas l'espace mais le temps que met chaque degré de l'écliptique à se lever au-dessus de l'horizon du lieu de naissance. Cette sensibilité au temps et au lieu le rend mathématiquement indéfini très près des cercles polaires — ce site bascule alors automatiquement sur les signes entiers plutôt que d'afficher un résultat faux (voir la page méthode pour le détail).",
        ],
      },
      {
        heading: "Lequel choisir, en pratique",
        paragraphs: [
          "Il n'y a pas de consensus universel parmi les astrologues eux-mêmes — c'est une vraie question de tradition et de préférence, pas une question à réponse unique. Placidus reste le choix par défaut le plus répandu en astrologie occidentale francophone contemporaine ; les signes entiers séduisent un courant qui revient aux méthodes hellénistiques historiques. Ce site vous laisse choisir librement sur chaque thème plutôt que d'imposer un système comme \"le bon\".",
        ],
      },
    ],
    relatedHref: "/methode",
    relatedLabel: "Voir le détail de chaque système de maisons →",
  },
];
