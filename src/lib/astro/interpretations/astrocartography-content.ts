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
    MC: "Ici, c'est le type d'endroit où une opportunité de mettre en avant ce que vous faites de mieux se présente plus facilement qu'ailleurs — une proposition de poste à responsabilité, une exposition médiatique, un projet où l'on vous demande de porter la vision. Le revers : la pression du regard extérieur y est aussi plus forte, et le besoin de briller peut virer à l'épuisement si la reconnaissance tarde à venir.",
    IC: "Dans les faits, on s'y installe souvent avec l'intention d'y fonder ou d'y ancrer un foyer durable, et il n'est pas rare d'y devenir la figure centrale ou le pilier de sa famille ou de son cercle proche. L'envers du décor : la maison peut devenir un théâtre où l'on cherche à régner plutôt qu'à simplement se reposer, avec un risque de conflits d'autorité domestique.",
    AC: "Sur le terrain, on y gagne en visibilité dès le premier contact : on est plus souvent remarqué, sollicité, mis en avant dans un groupe, presque sans le chercher. Le prix à payer : l'ego se retrouve plus exposé qu'ailleurs, et les échecs ou critiques y sont vécus de façon plus personnelle.",
    DC: "Ce qui se joue souvent : les rencontres marquantes qui s'y produisent impliquent des personnalités affirmées, parfois des figures d'autorité ou des partenaires eux-mêmes très visibles — mariages, associations professionnelles de premier plan. À surveiller : la relation peut basculer en compétition de visibilité si les deux egos cherchent à briller en même temps.",
  },
  moon: {
    MC: "Typiquement, il n'est pas rare d'y bâtir une carrière ou une réputation autour du soin, de l'accueil, du public ou d'une activité domestique rendue visible — mais la popularité y est aussi changeante que la Lune elle-même, sujette à des hauts et des bas. La face moins confortable : la vie professionnelle s'y teinte d'une vulnérabilité émotionnelle inhabituelle, où l'humeur peut affecter la réputation.",
    IC: "La réalité au quotidien : c'est souvent le lieu où l'on ressent le plus vite un sentiment de \"chez-soi\", où fonder une famille ou recréer un cocon protecteur semble aller de soi. Le point de vigilance : la sensibilité y est à fleur de peau, et les tensions familiales, même mineures, s'y ressentent de façon amplifiée.",
    AC: "Ici, on y devient plus perméable à l'ambiance du lieu : l'humeur suit le climat social et émotionnel environnant, parfois au jour le jour. Le revers : le besoin de sécurité affective peut devenir envahissant, rendant l'indépendance plus difficile à tenir qu'ailleurs.",
    DC: "Le scénario le plus courant : les rencontres y prennent souvent une tonalité de famille recomposée ou de lien fusionnel rapide — on y attire des partenaires qui veulent prendre soin ou être pris en charge. L'envers du décor : la dépendance affective mutuelle peut s'installer plus vite qu'elle ne se questionne.",
  },
  mercury: {
    MC: "En pratique, cette ligne favorise les métiers d'écriture, de négociation, d'enseignement ou de commerce : les opportunités d'être lu, entendu ou consulté pour son avis s'y multiplient. Le prix à payer : le rythme mental élevé peut rendre difficile de se poser vraiment, et la carrière reste sujette aux changements de cap fréquents.",
    IC: "Ce qui a tendance à se passer : le foyer y devient un lieu d'échanges permanents — discussions, appels, projets menés depuis chez soi — propice au travail intellectuel à domicile. À surveiller : le mental peut envahir l'espace censé être un refuge, rendant le repos réellement silencieux plus rare.",
    AC: "Ici, on y parle plus vite, on y apprend plus vite, on y remarque les opportunités de dernière minute — un bon terrain pour étudier, négocier ou voyager léger. La face moins confortable : la dispersion mentale peut prendre le pas sur la présence, et la parole devancer la réflexion.",
    DC: "Dans les faits, on y multiplie les rencontres stimulantes intellectuellement — collègues, réseaux, connaissances qui deviennent vite des interlocuteurs réguliers. Le point de vigilance : la quantité des échanges peut se faire au détriment de la profondeur d'un lien vraiment intime.",
  },
  venus: {
    MC: "Sur le terrain, les opportunités professionnelles y sont teintées d'esthétique, de charme ou de diplomatie : mode, art, relations publiques, médiation — l'image publique y gagne en grâce presque sans effort. Le revers : la réussite peut y dépendre davantage de plaire que de la compétence réellement démontrée.",
    IC: "Ce qui se joue souvent : on y crée facilement un foyer beau, harmonieux, où il fait bon recevoir — souvent l'un des meilleurs endroits pour une vie de famille apaisée et esthétiquement soignée. L'envers du décor : le confort recherché peut glisser vers l'évitement des conflits nécessaires.",
    AC: "Typiquement, on y est perçu comme plus charmant, plus détendu, plus à l'aise socialement dès le premier regard — souvent citée comme la meilleure ligne pour se sentir bien dans sa peau au quotidien. Le prix à payer : la facilité relationnelle peut masquer un manque d'affirmation quand un vrai désaccord se présente.",
    DC: "La réalité au quotidien : c'est une ligne classique pour vivre une rencontre amoureuse marquante ou nouer un partenariat particulièrement harmonieux — les liens qui s'y forment ont souvent un goût d'évidence. À surveiller : l'envie de plaire à tout prix peut retarder le moment de dire une vérité inconfortable au partenaire.",
  },
  mars: {
    MC: "Typiquement, cette ligne pousse vers des carrières qui demandent du cran — entrepreneuriat, compétition, secteurs physiquement exigeants — avec des opportunités qui récompensent l'audace. La face moins confortable : les frictions avec la hiérarchie ou les collègues y sont plus fréquentes, et l'impatience peut coûter cher professionnellement.",
    IC: "Le scénario le plus courant : on y entreprend des travaux, des déménagements ou des projets domestiques qui demandent de l'énergie physique — le foyer devient un chantier plus qu'un cocon. Le point de vigilance : les tensions familiales y montent plus vite en intensité, avec un risque réel de disputes domestiques.",
    AC: "En pratique, on y gagne en énergie physique et en réactivité — un bon terrain pour se lancer, faire du sport, agir sans attendre. Le revers : l'impulsivité et l'irritabilité y sont également amplifiées, au détriment de la patience et de la diplomatie.",
    DC: "Ce qui a tendance à se passer : les rencontres y sont chargées d'une attirance immédiate et intense, parfois électrique — un vrai terrain de passion. L'envers du décor : les partenariats qui s'y nouent sont sujets à la rivalité ou au conflit ouvert, surtout si les deux parties veulent avoir le dernier mot.",
  },
  jupiter: {
    MC: "Ici, cette ligne est considérée comme l'une des plus \"chanceuses\" en astrocartographie : les opportunités professionnelles y arrivent avec une facilité inhabituelle, souvent via un mentor ou un réseau qui s'ouvre spontanément. Le prix à payer : la confiance excessive peut mener à sous-estimer les détails ou à trop promettre.",
    IC: "Dans les faits, le foyer y prend souvent de l'ampleur — agrandissement de la famille, maison plus grande, sentiment d'abondance domestique. À surveiller : la générosité facile peut déraper en dépenses excessives ou en confort qui devient complaisance.",
    AC: "Sur le terrain, on y respire un optimisme contagieux dès l'arrivée, avec un sentiment réel d'ouverture des portes — l'une des lignes les plus recherchées en astrocartographie. La face moins confortable : l'excès de confiance peut mener à prendre des risques mal calculés, porté par un optimisme qui ne voit pas les détails.",
    DC: "Ce qui se joue souvent : les rencontres qui s'y font ont un effet d'entraînement positif — des partenaires qui ouvrent des portes, encouragent, poussent à voir plus grand. Le point de vigilance : l'enthousiasme du début peut masquer un manque de discernement sur qui mérite vraiment cette confiance.",
  },
  saturn: {
    MC: "Typiquement, la reconnaissance professionnelle s'y construit lentement, souvent après plusieurs années d'efforts soutenus et de responsabilités prises au sérieux — mais elle y est aussi plus durable qu'ailleurs une fois acquise. Le revers : le poids ressenti peut être lourd avant que les résultats ne soient visibles, avec un risque de découragement en cours de route.",
    IC: "La réalité au quotidien : la relation au foyer et à la famille y demande un investissement sérieux, parfois un devoir à assumer — s'occuper d'un parent âgé, porter une responsabilité familiale de longue date. L'envers du décor : la légèreté et le jeu domestique peuvent manquer, remplacés par un sentiment de charge permanente.",
    AC: "Ici, on y est perçu d'emblée comme plus sérieux, plus réservé, presque plus âgé que son âge réel — une identité qui inspire confiance mais met du temps à se révéler chaleureuse. Le prix à payer : cette ligne a la réputation d'être difficile à vivre au quotidien, avec une sensation persistante de contrainte.",
    DC: "Le scénario le plus courant : les relations qui s'y nouent sont sérieuses, potentiellement très engageantes, mais rarement rapides à démarrer — souvent des partenariats qui se construisent avec le temps plutôt que par coup de foudre. À surveiller : un sentiment de solitude ou de retard dans les rencontres peut s'installer avant que la relation solide n'arrive.",
  },
  uranus: {
    MC: "En pratique, la trajectoire professionnelle y prend des virages qu'on n'avait pas anticipés — reconversion soudaine, opportunité inattendue, rupture avec un parcours classique. La face moins confortable : l'instabilité professionnelle peut devenir chronique si le besoin de liberté empêche tout engagement à long terme.",
    IC: "Ce qui a tendance à se passer : la vie de famille y est sujette à des changements soudains — déménagements imprévus, ruptures ou réconciliations rapides, un besoin d'indépendance inhabituel vis-à-vis du foyer d'origine. Le point de vigilance : la stabilité domestique peut sembler impossible à maintenir sur la durée.",
    AC: "Ici, on y vit des événements marquants et imprévus presque en continu — rencontres surprises, décisions prises sur un coup de tête qui changent une trajectoire. Le revers : cette imprévisibilité stimulante peut aussi épuiser si l'on cherche un minimum de routine pour se poser.",
    DC: "Dans les faits, les rencontres y sont soudaines, électriques, parfois de très courte durée — coups de foudre, relations peu conventionnelles, ruptures aussi rapides que les débuts. L'envers du décor : la difficulté à s'engager dans la durée peut laisser un sentiment d'instabilité relationnelle chronique.",
  },
  neptune: {
    MC: "Sur le terrain, la carrière peut s'orienter vers l'art, le soin, le spirituel ou l'imaginaire, avec une réputation professionnelle qui reste souvent difficile à cerner clairement de l'extérieur. Le prix à payer : les malentendus professionnels, les promesses non tenues (les siennes ou celles des autres) et le flou contractuel y sont plus fréquents qu'ailleurs.",
    IC: "Ce qui se joue souvent : le foyer y prend une tonalité de rêverie ou d'idéal — un lieu propice à la vie spirituelle, à la création, à la retraite intérieure. À surveiller : les bases matérielles concrètes (finances, entretien, décisions pratiques) y sont plus difficiles à stabiliser.",
    AC: "Typiquement, on y développe une identité plus poreuse, plus intuitive, avec un charme discret qui attire sans qu'on sache toujours pourquoi. La face moins confortable : la perte de repères y est réelle, tout comme le risque de s'illusionner sur l'environnement ou les personnes qu'on y rencontre.",
    DC: "La réalité au quotidien : les rencontres qui s'y font portent souvent une forte alchimie, presque magique, comme si le lien avait été écrit d'avance. Le point de vigilance : cette même alchimie peut relever de l'idéalisation pure plutôt que d'une vraie connaissance de l'autre — magique si le regard reste lucide, trompeur sinon.",
  },
  pluto: {
    MC: "Typiquement, la carrière s'y construit après une lutte réelle — un secteur difficile à percer, une hiérarchie à affronter — mais la réussite obtenue y est rarement superficielle une fois acquise. Le revers : les enjeux de pouvoir professionnel (rivalités, luttes d'influence) y sont plus intenses qu'ailleurs.",
    IC: "Le scénario le plus courant : le rapport aux racines familiales y devient un vrai terrain de transformation — secrets qui remontent, dynamiques familiales à renégocier en profondeur. L'envers du décor : ce processus peut être orageux avant d'être libérateur, avec des périodes de crise réelle au sein du foyer.",
    AC: "En pratique, on y dégage une présence magnétique et intense, difficile à ignorer, qui pousse les autres à réagir fortement (attirance ou méfiance). Le prix à payer : l'existence y est marquée par des transformations profondes et répétées — rarement une ligne de tout repos, plus un lieu de mue qu'un lieu de confort.",
    DC: "Ce qui a tendance à se passer : les relations qui s'y nouent atteignent une intensité rare, potentiellement transformatrice pour les deux personnes impliquées. À surveiller : cette intensité s'accompagne souvent de rapports de force, de jalousie ou de possessivité qu'il faut consciemment désamorcer.",
  },
  northNode: {
    MC: "Ici, c'est un endroit propice pour s'orienter vers une vocation encore inconnue ou inexplorée, en phase avec une direction de croissance qui demande de sortir de ce qui est déjà maîtrisé. La face moins confortable : le sentiment d'incertitude professionnelle peut être fort au début, avant que la nouvelle direction ne se stabilise.",
    IC: "Dans les faits, ce lieu invite à revisiter le rapport aux racines et à la famille sous un angle neuf — parfois en s'en éloignant physiquement pour mieux le comprendre. Le point de vigilance : le confort familier du passé peut y manquer cruellement au début.",
    AC: "Sur le terrain, ce contexte pousse à sortir de sa zone de confort et à incarner une version de soi plus proche de ce vers quoi on évolue — une identité à essayer plutôt qu'à simplement habiter. Le revers : l'inconfort de ne pas encore se reconnaître pleinement dans cette version de soi peut être réel, surtout au début.",
    DC: "Ce qui se joue souvent : les rencontres qui s'y font semblent \"faites pour faire grandir\" — des partenaires qui poussent hors de la zone de confort relationnelle habituelle. L'envers du décor : ces liens peuvent être exigeants précisément parce qu'ils ne suivent pas le schéma relationnel familier et rassurant.",
  },
};
