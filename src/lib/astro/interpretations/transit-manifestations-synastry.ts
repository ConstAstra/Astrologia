import type { PlanetKey } from "../types";

/**
 * Variante relationnelle de transit-manifestations.ts, pour un aspect de
 * synastrie réactivé aujourd'hui par un transit (describeActivatedSynastryAspect).
 * Le texte "personnel" ("votre présence", "chez vous") ne peut pas être
 * réutilisé tel quel ici : ce qui se joue n'est pas ce qui arrive à UNE
 * personne, mais ce qui se joue DANS LA DYNAMIQUE entre les deux personnes
 * précises concernées par cet aspect — d'où un jeu de textes à part, écrit
 * systématiquement en "l'un/l'autre" plutôt qu'en "vous" singulier.
 */
export const TRANSIT_MANIFESTATIONS_SYNASTRY: Record<PlanetKey, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  sun: {
    harmonieux:
      "un moment où l'un de vous deux se sent vu et valorisé par l'autre — une reconnaissance mutuelle qui n'a pas besoin d'être forcée pour sonner sincère.",
    tendu:
      "un besoin de reconnaissance qui se heurte à l'ego de l'autre — une situation où l'un prend toute la place, laissant l'autre lutter pour être vu à son tour.",
    neutre: "un léger jeu de visibilité entre vous deux, sans enjeu réel — l'un des deux occupe un peu plus l'espace aujourd'hui.",
  },
  moon: {
    harmonieux: "un moment de proximité affective spontanée, où l'un comprend ce dont l'autre a besoin sans qu'il faille l'expliquer.",
    tendu: "une sensibilité exacerbée chez l'un des deux, qui peut se sentir incompris·e ou pas assez rassuré·e par l'autre aujourd'hui.",
    neutre: "une variation d'humeur qui touche votre dynamique sans gravité particulière — un besoin de proximité un peu plus marqué chez l'un de vous.",
  },
  mercury: {
    harmonieux:
      "une conversation entre vous deux qui débloque quelque chose — un vrai moment d'écoute où l'un comprend enfin ce que l'autre essayait de dire.",
    tendu:
      "un malentendu à surveiller dans vos échanges — l'un dit une chose, l'autre en comprend une autre, avec un vrai risque de crispation si ça n'est pas clarifié.",
    neutre: "un peu plus d'échanges que d'habitude entre vous deux, sans grand enjeu.",
  },
  venus: {
    harmonieux: "un moment agréable entre vous deux — un geste tendre, un compliment sincère, une envie partagée de passer du temps ensemble.",
    tendu: "une tension autour de l'argent ou de l'affection entre vous deux, à désamorcer plutôt qu'à laisser couver.",
    neutre: "une envie de douceur ou de plaisir partagé un peu plus marquée aujourd'hui, sans urgence particulière.",
  },
  mars: {
    harmonieux:
      "un vrai coup de boost pour avancer ensemble sur quelque chose de concret — une énergie commune qui se traduit en action plutôt qu'en mots.",
    tendu: "une irritabilité qui circule entre vous deux, avec un vrai risque de friction si l'un des deux réagit à chaud plutôt qu'après réflexion.",
    neutre: "un regain d'énergie dans votre dynamique, sans qu'il y ait forcément de projet précis pour l'accueillir.",
  },
  jupiter: {
    harmonieux: "une opportunité qui profite à vous deux — un projet commun qui avance, une bonne nouvelle à partager.",
    tendu: "une tentation de voir trop grand ensemble, avec le risque de vous promettre plus, à deux, que ce que vous pourrez vraiment tenir.",
    neutre: "un optimisme partagé un peu plus marqué que d'habitude, sans événement précis à la clé.",
  },
  saturn: {
    harmonieux:
      "un résultat concret pour un engagement tenu dans la durée entre vous deux — une preuve que le lien tient, même sans grand éclat.",
    tendu: "une contrainte ou une responsabilité qui pèse sur votre lien aujourd'hui, un test de patience mutuelle.",
    neutre: "un moment plus posé dans votre dynamique, propice aux discussions sérieuses plutôt qu'aux imprévus.",
  },
  uranus: {
    harmonieux: "un imprévu plutôt bienvenu dans votre dynamique — un changement de plan qui, finalement, vous arrange tous les deux.",
    tendu: "un imprévu qui bouscule votre équilibre habituel, à encaisser sans qu'aucun des deux n'y soit vraiment préparé.",
    neutre: "une petite surprise dans votre routine à deux, sans grande conséquence.",
  },
  neptune: {
    harmonieux: "une intuition juste sur l'autre, un moment de connexion qui dépasse les mots.",
    tendu: "une confusion à surveiller entre vous deux — un non-dit ou une attente informulée qui mérite d'être clarifiée plutôt qu'ignorée.",
    neutre: "une légère distance rêveuse aujourd'hui, sans que ça appelle une vraie discussion.",
  },
  pluto: {
    harmonieux: "une prise de conscience qui fait du bien à votre lien, un enjeu resté tu qui trouve enfin sa place dans l'échange.",
    tendu: "une intensité difficile à ignorer entre vous deux — un enjeu de pouvoir ou de contrôle qui refait surface, à ne pas laisser dégénérer.",
    neutre: "un climat plus intense en arrière-plan de votre relation, sans qu'un événement précis ne le déclenche aujourd'hui.",
  },
  northNode: {
    harmonieux: "une occasion, à deux, d'avancer vers quelque chose qui vous fait grandir, même si ça sort de vos habitudes.",
    tendu: "un choix qui vous pousse hors de votre zone de confort relationnelle habituelle, avec la tentation de revenir vers ce qui est plus familier.",
    neutre: "un léger sentiment d'être, à deux, au bon endroit au bon moment, sans qu'il se passe quelque chose de précis.",
  },
};
