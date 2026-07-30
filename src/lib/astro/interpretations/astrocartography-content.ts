import { PLANET_KEYS } from "../types";
import type { PlanetKey } from "../types";

/** Planètes utilisées pour tracer les lignes d'astrocartographie. */
export const ANGULAR_PLANET_KEYS: PlanetKey[] = [...PLANET_KEYS];

export type LineTypeKey = "MC" | "IC" | "AC" | "DC";

export const LINE_TYPE_META: Record<LineTypeKey, { name: string; explanation: string }> = {
  MC: {
    name: "Ligne de Milieu du Ciel (MC)",
    explanation:
      "Là où la planète culminait exactement au Milieu du Ciel à l'instant de la naissance : elle colore la vie publique, la vocation, l'image sociale de qui s'y installe.",
  },
  IC: {
    name: "Ligne de Fond du Ciel (IC)",
    explanation:
      "Là où la planète se trouvait exactement au Fond du Ciel : elle influence la vie intérieure, le foyer, les racines et l'intimité de qui s'y installe.",
  },
  AC: {
    name: "Ligne d'Ascendant (AC)",
    explanation:
      "Là où la planète se levait exactement à l'horizon Est : elle teinte fortement la personnalité affichée et le vécu quotidien de qui s'y installe.",
  },
  DC: {
    name: "Ligne de Descendant (DC)",
    explanation:
      "Là où la planète se couchait exactement à l'horizon Ouest : elle influence les rencontres et les relations à deux de qui s'y installe.",
  },
};

/** Un court texte par planète × type de ligne — le cœur d'une lecture d'astrocartographie. */
export const ASTROCARTO_TEXT: Record<PlanetKey, Partial<Record<LineTypeKey, string>>> = {
  sun: {
    MC: "Visibilité, reconnaissance, opportunités de rayonner professionnellement — un endroit propice pour se faire un nom, parfois au prix d'une pression accrue sur l'image publique.",
    IC: "Un endroit où l'on se sent chez soi de manière presque solaire : fierté du foyer construit, mais parfois besoin de dominer la sphère familiale.",
    AC: "Vitalité et confiance en soi renforcées, une présence qui s'impose plus naturellement — au risque d'un ego plus exposé qu'ailleurs.",
    DC: "Des rencontres marquantes avec des personnalités affirmées, parfois solaires elles-mêmes ; les partenariats y prennent une importance particulière.",
  },
  moon: {
    MC: "Une vie publique liée au soin, à l'accueil du public ou à une notoriété fluctuante ; le besoin de sécurité affective s'invite jusque dans la vie professionnelle.",
    IC: "Un fort sentiment d'attache au lieu, presque un cocon ; propice à fonder un foyer, mais avec une sensibilité émotionnelle à fleur de peau.",
    AC: "Une réceptivité émotionnelle accrue, un besoin de sécurité plus présent dans le quotidien — l'humeur y devient plus perméable à l'environnement.",
    DC: "Des relations marquées par le besoin de nid et de proximité affective ; les rencontres y ont souvent une tonalité familière, presque familiale.",
  },
  mercury: {
    MC: "Une carrière tournée vers la communication, l'écrit, le commerce ou l'enseignement ; excellent pour négocier, écrire, apprendre en public.",
    IC: "Un foyer animé d'échanges, de discussions, parfois agité par le mental ; propice au travail intellectuel fait depuis chez soi.",
    AC: "Un mental plus vif, un débit de parole plus rapide, une curiosité stimulée par l'environnement — utile pour étudier, négocier, voyager léger.",
    DC: "Des relations riches en échanges intellectuels ; on y rencontre facilement du monde, parfois au détriment de la profondeur du lien.",
  },
  venus: {
    MC: "Une carrière tournée vers l'esthétique, l'art, la mode, la diplomatie ou les relations publiques ; l'image sociale y gagne en charme et en grâce.",
    IC: "Un foyer harmonieux, esthétiquement soigné, propice à la douceur de vivre et à la vie de famille apaisée.",
    AC: "Un charme et une aisance sociale accrus, un rapport plus détendu au plaisir et à l'apparence — souvent citée comme la meilleure ligne pour se sentir bien dans sa peau.",
    DC: "Une ligne classique pour les rencontres amoureuses et les partenariats harmonieux ; propice à nouer des liens affectifs ou professionnels agréables.",
  },
  mars: {
    MC: "Une carrière qui demande énergie, compétitivité ou courage physique ; forte ambition, mais aussi risque de conflits avec la hiérarchie.",
    IC: "Une vie de famille plus tendue, propice aux travaux ou à l'action dans le foyer, avec un risque de frictions domestiques accrues.",
    AC: "Un tempérament plus impulsif et combatif, une énergie physique décuplée — stimulant pour agir, plus délicat pour la patience et la diplomatie.",
    DC: "Des relations passionnées mais potentiellement conflictuelles ; on y attire des partenaires énergiques, parfois sur un mode de rivalité.",
  },
  jupiter: {
    MC: "Souvent considérée comme une ligne de chance professionnelle : opportunités, expansion, reconnaissance plus facile qu'ailleurs.",
    IC: "Un foyer généreux, abondant, propice à l'agrandissement de la famille ou à un sentiment de confort et d'optimisme domestique.",
    AC: "Confiance en soi et optimisme renforcés, sentiment de chance et d'ouverture — l'une des lignes les plus recherchées en astrocartographie.",
    DC: "Des rencontres bénéfiques, des partenariats qui \"font grandir\" ; propice aux associations, mariages ou collaborations fructueuses.",
  },
  saturn: {
    MC: "Une carrière qui demande patience, discipline et efforts soutenus avant la reconnaissance ; les responsabilités professionnelles y pèsent davantage.",
    IC: "Un rapport plus lourd ou plus exigeant au foyer et à la famille — parfois un devoir à assumer, parfois une solidité durement acquise.",
    AC: "Un sentiment de contrainte, de sérieux ou de retenue accru ; ligne réputée difficile à vivre au quotidien, mais souvent structurante sur le long terme.",
    DC: "Des relations sérieuses, potentiellement engageantes mais exigeantes, avec un risque de sentiment de solitude ou de retard dans les rencontres.",
  },
  uranus: {
    MC: "Une carrière marquée par l'imprévu, l'innovation ou la rupture avec les conventions ; parcours professionnel rarement linéaire ici.",
    IC: "Une vie de famille sujette à des changements soudains ou à un besoin d'indépendance inhabituel vis-à-vis du foyer.",
    AC: "Un sentiment de liberté et d'excentricité renforcé, une vie marquée par l'imprévu — stimulant mais déstabilisant si l'on cherche la routine.",
    DC: "Des rencontres soudaines, électriques, parfois de courte durée ; relations peu conventionnelles ou coups de foudre inattendus.",
  },
  neptune: {
    MC: "Une carrière tournée vers l'art, le spirituel, le soin ou l'imaginaire — mais aussi une réputation professionnelle parfois floue ou trompeuse.",
    IC: "Un foyer empreint de rêverie, d'idéalisme ou de flou ; propice à la vie spirituelle, plus délicat pour des bases matérielles claires.",
    AC: "Une identité plus poreuse et intuitive, un charme discret mais aussi un risque de perte de repères ou d'idéalisation de l'environnement.",
    DC: "Des rencontres marquées par une forte alchimie ou une idéalisation du partenaire — magique si le regard reste lucide, trompeur sinon.",
  },
  pluto: {
    MC: "Une carrière marquée par les enjeux de pouvoir, la transformation profonde d'un secteur, ou une réussite obtenue après une lutte intense.",
    IC: "Un rapport intense, parfois orageux, aux racines familiales ; propice à une transformation profonde du rapport au foyer.",
    AC: "Une présence magnétique et intense, une existence marquée par des transformations profondes et répétées — rarement une ligne de tout repos.",
    DC: "Des relations d'une intensité rare, potentiellement transformatrices, mais aussi sujettes aux rapports de force ou à la possessivité.",
  },
  northNode: {
    MC: "Un endroit propice pour s'orienter vers une vocation nouvelle, en phase avec une direction d'évolution personnelle.",
    IC: "Un lieu qui invite à revisiter le rapport aux racines et à la famille dans une optique de croissance personnelle.",
    AC: "Un contexte qui pousse à sortir de sa zone de confort et à incarner une version de soi plus proche de son évolution recherchée.",
    DC: "Des rencontres qui semblent \"faites pour faire grandir\", souvent vécues comme importantes sur le plan de l'évolution personnelle.",
  },
};
