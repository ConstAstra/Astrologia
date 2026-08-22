import type { PointKey } from "../types";

export const RELATIONSHIP_TYPES = ["romantique", "amitie", "famille", "collegue"] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_META: Record<
  RelationshipType,
  { label: string; synastryFraming: string; compositeFraming: string }
> = {
  romantique: {
    label: "Couple / romantique",
    synastryFraming:
      "Pour un couple, regardez en priorité les aspects impliquant Vénus, Mars, la Lune et le Soleil : ils parlent d'attirance, de désir, de sécurité affective et de reconnaissance mutuelle. Les aspects tendus ne condamnent rien, ils indiquent des frictions à négocier consciemment plutôt qu'à subir.",
    compositeFraming:
      "Le composite d'un couple se lit comme le portrait de la relation elle-même : son Soleil dit ce que le couple cherche à incarner ensemble, sa Lune ce dont il a besoin pour se sentir en sécurité, son Ascendant l'image que le couple donne à voir de l'extérieur.",
  },
  amitie: {
    label: "Amitié",
    synastryFraming:
      "Pour une amitié, portez attention aux aspects entre Mercure, Jupiter, le Soleil et Uranus : ils parlent de complicité intellectuelle, d'enthousiasme partagé et de respect de la liberté de chacun. Les aspects Vénus/Mars restent lisibles mais comptent souvent moins que dans un cadre romantique.",
    compositeFraming:
      "Le composite d'une amitié éclaire la nature du lien lui-même : ce qui vous réunit spontanément (souvent visible via Mercure et Jupiter) et ce qui pourrait, si négligé, créer de la distance.",
  },
  famille: {
    label: "Famille",
    synastryFraming:
      "Pour un lien familial, les aspects impliquant la Lune, Saturne et le Soleil sont particulièrement parlants : ils renseignent sur l'attachement, le sens du devoir et la manière dont chacun reconnaît (ou peine à reconnaître) la place de l'autre.",
    compositeFraming:
      "Le composite d'un lien familial dit quelque chose de l'histoire commune et de ce qui s'y transmet, moins un choix qu'un donné avec lequel composer.",
  },
  collegue: {
    label: "Professionnel",
    synastryFraming:
      "Pour une relation professionnelle, concentrez-vous sur Mercure, Saturne, Mars et Jupiter : communication, fiabilité, gestion des désaccords et opportunités mutuelles. Les aspects Vénus/Lune restent secondaires dans ce cadre.",
    compositeFraming:
      "Le composite d'une collaboration professionnelle éclaire la dynamique de travail commune : son Milieu du Ciel en dit long sur ce que le duo peut accomplir publiquement, sa maison X sur la nature du projet partagé.",
  },
};

const RELATIONSHIP_PLANET_NOTES: Record<RelationshipType, Partial<Record<PointKey, string>>> = {
  romantique: {
    venus:
      "Cet aspect touche directement l'attirance et la tendresse entre vous, un baromètre assez fiable de la facilité (ou non) avec laquelle le désir et l'affection circulent au quotidien.",
    mars:
      "Cet aspect touche le désir et la dynamique physique du couple, harmonieux, il nourrit une complicité charnelle spontanée ; tendu, il peut virer à la rivalité ou à la friction si rien n'est mis en mots.",
    moon:
      "Cet aspect touche la sécurité affective que vous vous inspirez mutuellement, la question de fond étant : est-ce que l'un se sent réellement en sécurité pour se livrer face à l'autre ?",
    sun:
      "Cet aspect touche la reconnaissance de qui vous êtes, chacun·e, aux yeux de l'autre, un couple où cet axe est fluide se sent vu·e, pas juste aimé·e.",
    saturn:
      "Cet aspect touche la solidité du lien dans la durée, moins l'étincelle du début que ce qui permet à un couple de tenir une fois l'enthousiasme initial retombé, souvent ce qui distingue une relation construite pour durer d'un simple emballement.",
    northNode:
      "Cet aspect touche la dimension de destin ressentie dans la rencontre, l'impression que cette relation n'est pas arrivée par hasard, qu'elle pousse chacun·e vers une direction de vie qu'il ou elle n'aurait pas prise seul·e.",
    juno:
      "Cet aspect touche directement la nature de l'engagement entre vous, ce dont chacun·e a besoin pour se sentir vraiment lié·e plutôt que juste attiré·e, un contact marqué ici est souvent lu comme un signe de partenariat durable, au-delà de la simple alchimie du début.",
    vertex:
      "Cet aspect touche la dimension de rencontre marquante, presque écrite d'avance, un contact avec le Vertex de l'autre est souvent noté comme le signe d'un lien qui ne laisse personne indifférent, pour le meilleur comme pour ce qu'il faudra apprendre à traverser ensemble.",
    partMarriage:
      "Cet aspect touche directement la Part du Mariage, le point qui représente l'engagement durable dans sa version la plus littérale, un contact marqué ici est un signe classique de potentiel d'union à long terme entre vous.",
  },
  amitie: {
    mercury:
      "Cet aspect touche la qualité des échanges et la complicité intellectuelle, souvent ce qui distingue une amitié qui dure d'une simple connaissance.",
    jupiter:
      "Cet aspect touche l'enthousiasme partagé et l'envie de grandir ensemble, un vrai moteur d'amitiés qui poussent chacun·e à voir plus grand.",
    uranus:
      "Cet aspect touche le respect de la liberté de chacun·e dans l'amitié, la capacité à se retrouver sans se sentir obligé·e ni étouffé·e par l'autre.",
    sun:
      "Cet aspect touche la reconnaissance mutuelle au sein de l'amitié, se sentir vraiment vu·e par l'autre, pas juste toléré·e ou pratique à avoir sous la main.",
    northNode:
      "Cet aspect touche le sentiment que cette amitié compte plus qu'une rencontre ordinaire, comme si elle arrivait au bon moment pour pousser chacun·e vers une direction qu'il ou elle n'aurait pas prise seul·e.",
  },
  famille: {
    moon:
      "Cet aspect touche l'attachement et les habitudes affectives héritées de la famille, souvent la clé pour comprendre pourquoi certaines réactions semblent disproportionnées vues de l'extérieur.",
    saturn:
      "Cet aspect touche le sens du devoir et les responsabilités partagées, ce qui, dans une famille, ressemble parfois à de l'amour et parfois à une charge, selon la façon dont c'est vécu.",
    sun:
      "Cet aspect touche la reconnaissance de la place de chacun·e dans la famille, un enjeu central quand plusieurs personnalités affirmées partagent le même toit ou la même histoire.",
    northNode:
      "Cet aspect touche la dimension presque écrite d'avance de ce lien familial, le sentiment que cette personne fait partie d'un chemin de vie plus large, pas seulement d'un hasard de naissance.",
  },
  collegue: {
    mercury:
      "Cet aspect touche la communication professionnelle et l'organisation du travail, souvent ce qui fait ou défait une collaboration au quotidien, bien avant les grandes décisions.",
    saturn:
      "Cet aspect touche la fiabilité et le sérieux dans la collaboration, la question de fond étant : peut-on compter l'un sur l'autre quand ça compte vraiment ?",
    mars:
      "Cet aspect touche la façon de gérer les désaccords ou la compétition au travail, un axe à surveiller si les egos professionnels prennent le pas sur l'objectif commun.",
    jupiter:
      "Cet aspect touche les opportunités que cette collaboration peut ouvrir, souvent le signe que travailler ensemble sert les deux carrières, pas seulement le projet en cours.",
    northNode:
      "Cet aspect touche le sentiment que cette collaboration arrive au bon moment, presque comme une opportunité destinée à faire avancer quelque chose d'important pour l'un·e ou l'autre.",
  },
};

export function relationshipAspectNote(
  pointA: PointKey,
  pointB: PointKey,
  type: RelationshipType
): string | null {
  const notes = RELATIONSHIP_PLANET_NOTES[type];
  return notes[pointA] ?? notes[pointB] ?? null;
}

export function isRelationshipType(value: string | undefined): value is RelationshipType {
  return Boolean(value) && (RELATIONSHIP_TYPES as readonly string[]).includes(value as string);
}
