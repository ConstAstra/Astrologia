export interface HouseMeta {
  number: number;
  name: string;
  keyword: string;
  paragraph: string;
}

export const HOUSE_META: HouseMeta[] = [
  {
    number: 1,
    name: "Maison I : Identité",
    keyword: "le moi, le corps, l'image donnée",
    paragraph:
      "Maison angulaire la plus personnelle : la manière d'aborder le monde, l'apparence, les réflexes spontanés. Une planète ici pèse fortement sur la personnalité affichée. Vivre pleinement cette maison, c'est apprendre que l'image donnée au monde peut évoluer sans trahir qui l'on est en profondeur, la rigidifier revient à se figer dans un premier rôle.",
  },
  {
    number: 2,
    name: "Maison II : Ressources",
    keyword: "l'argent, les valeurs, la sécurité matérielle",
    paragraph:
      "Ce que l'on possède et la manière de le gagner, de le garder ou de le dépenser ; plus largement, l'échelle de valeurs personnelle et le rapport à la sécurité matérielle. Ici, la vraie difficulté est de distinguer la sécurité réelle, construite avec le temps, de la sécurité illusoire qu'on croit atteindre en accumulant sans jamais se sentir vraiment à l'abri.",
  },
  {
    number: 3,
    name: "Maison III : Communication",
    keyword: "la parole, la fratrie, l'entourage proche",
    paragraph:
      "Les apprentissages du quotidien, la communication, les trajets courts, les frères et sœurs, l'environnement immédiat et les échanges intellectuels. Bien vécue, cette maison apprend à écouter autant qu'à parler, le risque, mal vécue, est de rester au niveau de l'échange superficiel sans jamais approfondir une conversation.",
  },
  {
    number: 4,
    name: "Maison IV : Racines",
    keyword: "le foyer, la famille, les fondations",
    paragraph:
      "Maison angulaire des racines : la famille d'origine, le sentiment de \"chez-soi\", l'héritage psychologique transmis. Souvent liée au parent le plus intériorisé. Grandir dans cette maison, c'est apprendre à faire la part entre l'héritage familial reçu et ce qu'on choisit consciemment d'en garder ou d'en transformer pour soi-même.",
  },
  {
    number: 5,
    name: "Maison V : Création",
    keyword: "le plaisir, la créativité, les enfants, l'amour ludique",
    paragraph:
      "L'expression créative et personnelle : romance, plaisir, jeu, prise de risque assumée, enfants, tout ce qui relève de l'affirmation joyeuse de soi. La limite à surveiller ici est de confondre l'expression de soi avec le besoin d'être constamment validé·e, la vraie créativité s'épanouit aussi sans public.",
  },
  {
    number: 6,
    name: "Maison VI : Quotidien",
    keyword: "le travail, la santé, les routines",
    paragraph:
      "L'organisation du quotidien : travail concret, service rendu, santé et habitudes corporelles, sens du détail utile. L'endroit où l'on \"met les mains dans le cambouis\". Le piège de cette maison est de se perdre dans le service rendu aux autres au point de négliger sa propre santé, ce que ça demande, c'est de prendre soin de soi avec la même rigueur que de son travail.",
  },
  {
    number: 7,
    name: "Maison VII : Relations",
    keyword: "le couple, les partenariats, les autres en face",
    paragraph:
      "Maison angulaire de la relation à l'autre en position d'égal : couple, association, mais aussi adversaires déclarés. Souvent ce que l'on recherche (ou fuit) chez un partenaire. Ce qu'on cherche ou fuit chez l'autre y révèle souvent une part de soi non intégrée, il s'agit d'apprendre à reconnaître dans le partenaire un miroir plutôt qu'un simple complément.",
  },
  {
    number: 8,
    name: "Maison VIII : Transformation",
    keyword: "l'intimité, les ressources partagées, les crises",
    paragraph:
      "Ce qui échappe au contrôle direct : sexualité, argent des autres (héritage, crédit, fiscalité), deuil et transformation profonde. Une maison exigeante mais souvent riche en évolution. Ce qui se travaille ici, c'est d'accepter de perdre le contrôle par moments, en confiance, plutôt que de chercher à tout maîtriser dans un domaine qui, par nature, échappe à la volonté.",
  },
  {
    number: 9,
    name: "Maison IX : Horizons",
    keyword: "les études supérieures, le voyage, la philosophie",
    paragraph:
      "L'ouverture sur du plus grand : voyages lointains, études supérieures, croyances, quête de sens et de vérité. L'envie d'élargir sa carte du monde. Le risque ici est de confondre l'accumulation de savoirs ou de voyages avec une vraie transformation intérieure, l'enjeu est de laisser ce qu'on découvre réellement changer sa façon de voir, pas seulement l'élargir en surface.",
  },
  {
    number: 10,
    name: "Maison X : Vocation",
    keyword: "la carrière, la réputation, le statut social",
    paragraph:
      "Maison angulaire la plus \"publique\" : la vocation, la réussite visible, l'autorité, l'image sociale. Ce pour quoi on veut être reconnu dans le monde. Le piège de cette maison est de mesurer sa valeur uniquement à la réussite visible, tout l'apprentissage consiste à séparer l'accomplissement réel de la reconnaissance sociale qui, elle, reste toujours changeante.",
  },
  {
    number: 11,
    name: "Maison XI : Réseau",
    keyword: "les amis, les projets collectifs, les idéaux",
    paragraph:
      "Les cercles d'appartenance choisis : amitiés, groupes, réseaux, projets collectifs et idéaux d'avenir. Une maison tournée vers demain et vers la communauté. Ici, grandir consiste à choisir ses cercles d'appartenance en fonction de ce qu'on est vraiment, plutôt que du besoin de faire partie d'un groupe à tout prix.",
  },
  {
    number: 12,
    name: "Maison XII : Intériorité",
    keyword: "l'inconscient, le retrait, ce qui échappe au contrôle",
    paragraph:
      "La maison la plus insaisissable : vie intérieure, inconscient, épreuves discrètes, spiritualité, besoin de retrait. Ce qui agit \"en coulisses\", parfois à l'insu de soi-même. Cette maison demande d'apprendre à honorer le besoin de retrait sans le vivre comme une fuite, ce qui se travaille dans l'ombre y nourrit souvent, en silence, tout ce qui se voit ailleurs dans le thème.",
  },
];

// Quand le maître de l'Ascendant tombe dans une maison, cette maison devient
// le terrain privilégié où se construit l'identité elle-même, pas juste un
// domaine de vie parmi d'autres : cette phrase le rend explicite avant les
// paragraphes signe/maison génériques du maître (voir ascendantRulerParagraph
// dans chart-domains.ts et la carte "Maître de l'Ascendant" du thème natal).
export const ASCENDANT_RULER_HOUSE_LINE: Record<number, string> = {
  1: "Ici, elle se confond presque avec l'image et les réflexes immédiats : vous existez beaucoup par la façon dont vous vous présentez au monde, dès le premier instant.",
  2: "Ici, elle se construit à travers ce que vous possédez et votre rapport à la sécurité matérielle : ce que vous bâtissez concrètement compte particulièrement pour votre sentiment d'exister.",
  3: "Ici, elle se construit à travers la parole, l'apprentissage et les échanges du quotidien : vous existez beaucoup par ce que vous dites, écoutez et apprenez.",
  4: "Ici, elle se construit à travers le foyer et l'héritage familial : votre sentiment d'exister reste étroitement lié à vos racines et à ce qui s'est transmis avant vous.",
  5: "Ici, elle se construit à travers l'expression créative et le plaisir assumé : vous existez pleinement quand vous créez, jouez ou vous affirmez sans retenue.",
  6: "Ici, elle se construit à travers l'utile et le concret : le travail bien fait, la santé et les habitudes du quotidien comptent particulièrement pour votre sentiment d'exister.",
  7: "Ici, elle se construit largement au contact de l'autre : c'est souvent à travers le miroir d'un partenaire ou d'une relation à deux que vous apprenez qui vous êtes vraiment.",
  8: "Ici, elle se construit à travers ce qui échappe au contrôle direct : les crises, l'intimité profonde et les grandes transformations sont souvent ce qui vous révèle à vous-même.",
  9: "Ici, elle se construit à travers la quête de sens et l'envie d'aller voir ailleurs : vous existez pleinement en élargissant votre horizon, par les études, les voyages ou une philosophie de vie qui vous est propre.",
  10: "Ici, elle se construit à travers la réussite visible et la place prise dans le monde : ce pour quoi vous voulez être reconnu·e compte particulièrement pour votre sentiment d'exister.",
  11: "Ici, elle se construit à travers les cercles choisis et les projets collectifs : vous existez beaucoup à travers ce que vous construisez avec un groupe, des ami·e·s ou une cause qui vous dépasse.",
  12: "Ici, elle se construit en grande partie dans l'ombre : la vie intérieure, le retrait et ce qui reste discret ou invisible aux yeux des autres comptent plus que d'habitude pour votre sentiment d'exister.",
};
