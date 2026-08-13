import type { PlanetKey } from "../types";

/**
 * Ce que la planète en transit "provoque" concrètement aujourd'hui, selon
 * la tonalité de l'aspect qu'elle forme (voir `tone` dans aspects.ts).
 * Complète describeTransitAspect : l'aspect dit COMMENT ça se joue, le
 * thème de fond (pair-themes.ts) dit DE QUOI ça parle dans le thème natal,
 * et ce module dit ce que ça a des chances de déclencher dans la journée —
 * la question concrète "et donc, ça donne quoi aujourd'hui ?" que ni
 * l'aspect ni le thème de fond, pris seuls, ne répondent vraiment.
 */
export const TRANSIT_MANIFESTATIONS: Record<PlanetKey, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  sun: {
    harmonieux:
      "un moment où votre présence passe bien, où l'on vous remarque pour de bonnes raisons — une occasion de vous affirmer sans avoir à forcer.",
    tendu:
      "un besoin d'être vu qui se heurte à un obstacle concret : quelqu'un qui prend toute la place, une situation où il est difficile de briller comme vous le voudriez.",
    neutre: "un léger surcroît de visibilité, sans enjeu particulier — une journée où votre présence se remarque un peu plus que d'habitude.",
  },
  moon: {
    harmonieux: "une humeur plus légère, un moment propice pour se sentir bien chez soi ou en petit comité.",
    tendu: "une sensibilité à fleur de peau, une réaction émotionnelle un peu plus vive que d'habitude face à un imprévu du quotidien.",
    neutre: "une variation d'humeur discrète, sans qu'il y ait de quoi s'inquiéter.",
  },
  mercury: {
    harmonieux: "une conversation qui débloque quelque chose, une idée qui arrive au bon moment, un message important à envoyer ou recevoir.",
    tendu: "un malentendu à surveiller dans un échange, une décision à formuler avec plus de recul que d'habitude avant de la communiquer.",
    neutre: "un peu plus d'agitation mentale que d'habitude, sans conséquence particulière.",
  },
  venus: {
    harmonieux: "un moment agréable en amour, en amitié ou côté finances — une invitation, un compliment, une rentrée d'argent inattendue.",
    tendu: "une tension autour de l'argent ou d'une relation, à désamorcer plutôt qu'à laisser s'envenimer.",
    neutre: "une envie de plaisir ou de confort un peu plus marquée que d'habitude, sans urgence particulière.",
  },
  mars: {
    harmonieux: "un vrai coup de boost pour avancer sur un projet, une occasion d'agir avec efficacité.",
    tendu: "une irritabilité à surveiller, un risque réel de conflit si vous réagissez à chaud plutôt qu'après réflexion.",
    neutre: "un regain d'énergie, sans qu'il y ait forcément un projet précis pour l'accueillir.",
  },
  jupiter: {
    harmonieux: "une opportunité concrète qui se présente : une proposition, une bonne nouvelle, une porte qui s'ouvre plus facilement que prévu.",
    tendu: "une tentation de voir trop grand, un risque de promettre plus que ce que vous pourrez tenir.",
    neutre: "un optimisme un peu plus marqué que d'habitude, sans événement précis à la clé.",
  },
  saturn: {
    harmonieux: "un résultat concret pour un effort tenu dans la durée : une reconnaissance méritée, une structure qui tient enfin.",
    tendu: "une contrainte ou une responsabilité qui pèse plus lourd que d'habitude, un test de patience.",
    neutre: "un moment plus posé, presque terne, propice aux tâches sérieuses plutôt qu'aux imprévus.",
  },
  uranus: {
    harmonieux: "un imprévu plutôt bienvenu : une idée soudaine, un changement de plan qui arrange finalement les choses.",
    tendu: "un imprévu qui dérange, un changement de dernière minute à encaisser sans y être préparé·e.",
    neutre: "une petite surprise sans grande conséquence, un accroc de routine vite oublié.",
  },
  neptune: {
    harmonieux: "une intuition juste, un moment d'inspiration ou de connexion émotionnelle plus fine que d'habitude.",
    tendu: "une confusion à surveiller : une information à vérifier avant d'y croire, un flou qui mérite d'être clarifié plutôt qu'ignoré.",
    neutre: "une légère rêverie, un besoin de retrait qui n'appelle pas d'action particulière.",
  },
  pluto: {
    harmonieux: "une prise de conscience qui fait du bien, un pouvoir retrouvé sur une situation qui pesait depuis longtemps.",
    tendu: "une intensité difficile à ignorer : un enjeu de pouvoir ou de contrôle qui refait surface, à ne pas laisser dégénérer.",
    neutre: "un climat plus intense en arrière-plan, sans qu'un événement précis ne le déclenche aujourd'hui.",
  },
  northNode: {
    harmonieux: "une occasion d'avancer dans une direction qui vous fait grandir, même si elle sort un peu de vos habitudes.",
    tendu: "un choix qui vous tire hors de votre zone de confort, avec la tentation de retourner vers ce qui est familier plutôt que d'avancer.",
    neutre: "un léger sentiment d'être au bon endroit au bon moment, sans qu'il se passe quelque chose de précis.",
  },
};
