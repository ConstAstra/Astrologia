import type { PlanetKey } from "../types";

/**
 * Variante "relation comme entité" de transit-manifestations.ts, pour un
 * transit sur un point du thème composite (describeCompositeTransitAspect).
 * Ni le texte personnel ("votre présence") ni le texte de synastrie
 * ("l'un de vous deux") ne conviennent ici : le composite ne décrit ni une
 * personne ni une interaction entre deux personnes précises, mais la
 * relation elle-même traitée comme un troisième "personnage" à part
 * entière — d'où un jeu de textes à part, systématiquement au "la
 * relation"/"le lien" plutôt qu'au "vous" ou au "l'un/l'autre".
 */
export const TRANSIT_MANIFESTATIONS_COMPOSITE: Record<PlanetKey, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  sun: {
    harmonieux:
      "un moment où la relation elle-même se fait remarquer positivement dans son entourage, ce que vous incarnez ensemble est mis en lumière.",
    tendu:
      "un besoin de reconnaissance pour ce que représente la relation qui se heurte à un obstacle extérieur, un tiers ou une situation qui empiète sur la place que vous occupez ensemble.",
    neutre: "un léger surcroît de visibilité pour la relation, sans enjeu particulier aujourd'hui.",
  },
  moon: {
    harmonieux: "un moment où le lien se ressent comme particulièrement sécurisant, propice à resserrer les rangs en petit comité.",
    tendu: "une sensibilité collective à fleur de peau, une réaction plus vive que d'habitude de la relation face à un imprévu extérieur.",
    neutre: "une variation discrète dans le climat affectif du lien, sans quoi s'inquiéter.",
  },
  mercury: {
    harmonieux: "un échange ou une décision partagée qui débloque quelque chose pour la relation, une clarté qui arrive au bon moment.",
    tendu:
      "un malentendu qui touche la relation dans son ensemble, une décision commune à formuler avec plus de recul avant de la communiquer à l'extérieur.",
    neutre: "un peu plus d'agitation dans les échanges qui touchent la relation, sans conséquence particulière.",
  },
  venus: {
    harmonieux: "un moment agréable pour la relation, une invitation, une reconnaissance extérieure, une rentrée d'argent qui profite au lien.",
    tendu: "une tension autour de l'argent ou de l'image de la relation, à désamorcer plutôt qu'à laisser s'envenimer.",
    neutre: "une envie de confort ou de plaisir partagé un peu plus marquée pour la relation, sans urgence particulière.",
  },
  mars: {
    harmonieux: "un vrai coup de boost pour la relation, une occasion d'avancer efficacement sur un projet commun.",
    tendu: "une irritabilité qui touche le climat du lien, un risque réel de friction si elle n'est pas canalisée.",
    neutre: "un regain d'énergie pour la relation, sans qu'il y ait forcément de projet précis pour l'accueillir.",
  },
  jupiter: {
    harmonieux: "une opportunité concrète qui se présente pour la relation : une proposition, une bonne nouvelle, une porte qui s'ouvre plus facilement que prévu.",
    tendu: "une tentation de voir trop grand pour ce que la relation peut réellement tenir, un risque de promesses excessives.",
    neutre: "un optimisme un peu plus marqué autour de la relation, sans événement précis à la clé.",
  },
  saturn: {
    harmonieux:
      "un résultat concret pour un effort tenu dans la durée par la relation : une reconnaissance méritée, une structure qui tient enfin.",
    tendu: "une contrainte ou une responsabilité qui pèse plus lourd sur la relation que d'habitude, un test de solidité.",
    neutre: "un moment plus posé pour la relation, propice aux sujets sérieux plutôt qu'aux imprévus.",
  },
  uranus: {
    harmonieux: "un imprévu plutôt bienvenu pour la relation : un changement de plan qui, au final, l'arrange.",
    tendu: "un imprévu qui bouscule l'équilibre du lien, à encaisser sans y être préparé.",
    neutre: "une petite surprise sans grande conséquence dans la routine de la relation.",
  },
  neptune: {
    harmonieux: "une intuition juste sur ce que vit la relation, un moment d'inspiration partagée.",
    tendu: "une confusion à surveiller autour de la relation, une information ou une intention à clarifier plutôt qu'à laisser dans le flou.",
    neutre: "une légère rêverie collective, un besoin de retrait qui n'appelle pas d'action particulière pour la relation.",
  },
  pluto: {
    harmonieux: "une prise de conscience qui fait du bien à la relation, un pouvoir retrouvé sur une dynamique qui pesait depuis longtemps.",
    tendu: "une intensité difficile à ignorer pour la relation : un enjeu de pouvoir ou de contrôle qui refait surface, à ne pas laisser dégénérer.",
    neutre: "un climat plus intense en arrière-plan de la relation, sans qu'un événement précis ne le déclenche aujourd'hui.",
  },
  northNode: {
    harmonieux: "une occasion pour la relation d'avancer vers ce qui la fait grandir, même si ça sort de ses habitudes.",
    tendu: "un choix qui pousse la relation hors de sa zone de confort, avec la tentation de revenir vers un fonctionnement plus familier.",
    neutre: "un léger sentiment que la relation est au bon endroit au bon moment, sans qu'il se passe quelque chose de précis.",
  },
};
