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
      "Pour un couple, regardez en priorité les aspects impliquant Vénus, Mars, la Lune et le Soleil : ils parlent d'attirance, de désir, de sécurité affective et de reconnaissance mutuelle. Les aspects tendus ne condamnent rien — ils indiquent des frictions à négocier consciemment plutôt qu'à subir.",
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
      "Le composite d'un lien familial dit quelque chose de l'histoire commune et de ce qui s'y transmet — moins un choix qu'un donné avec lequel composer.",
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
    venus: "Cet aspect touche directement l'attirance et la tendresse entre vous.",
    mars: "Cet aspect touche le désir et la dynamique physique du couple.",
    moon: "Cet aspect touche la sécurité affective que vous vous inspirez mutuellement.",
    sun: "Cet aspect touche la reconnaissance de qui vous êtes, chacun·e, aux yeux de l'autre.",
  },
  amitie: {
    mercury: "Cet aspect touche la qualité des échanges et la complicité intellectuelle.",
    jupiter: "Cet aspect touche l'enthousiasme partagé et l'envie de grandir ensemble.",
    uranus: "Cet aspect touche le respect de la liberté de chacun·e dans l'amitié.",
    sun: "Cet aspect touche la reconnaissance mutuelle au sein de l'amitié.",
  },
  famille: {
    moon: "Cet aspect touche l'attachement et les habitudes affectives héritées de la famille.",
    saturn: "Cet aspect touche le sens du devoir et les responsabilités partagées.",
    sun: "Cet aspect touche la reconnaissance de la place de chacun·e dans la famille.",
  },
  collegue: {
    mercury: "Cet aspect touche la communication professionnelle et l'organisation du travail.",
    saturn: "Cet aspect touche la fiabilité et le sérieux dans la collaboration.",
    mars: "Cet aspect touche la façon de gérer les désaccords ou la compétition au travail.",
    jupiter: "Cet aspect touche les opportunités que cette collaboration peut ouvrir.",
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
