// Keys stay the internal French tokens ("Feu", "Terre"...) used throughout
// the astro engine's dominance computation — only the text is translated.
export const ELEMENT_DOMINANCE_TEXT_EN: Record<string, string> = {
  Feu: "Fire dominant: an energy that needs to act, initiate, get enthusiastic. The risk, if unchanneled, is impulsiveness or quickly running out of steam.",
  Terre: "Earth dominant: a need for the concrete, for stability and tangible results. The risk, if too pronounced, is rigidity or difficulty letting go.",
  Air: "Air dominant: an energy oriented toward ideas, exchange and connecting with others. The risk, if too pronounced, is staying in one's head, avoiding emotional or concrete grounding.",
  Eau: "Water dominant: an emotional, intuitive sensitivity in the foreground. The risk, if too pronounced, is being overwhelmed or struggling to set clear boundaries.",
};

export const MODALITY_DOMINANCE_TEXT_EN: Record<string, string> = {
  Cardinal: "Cardinal dominant: an energy that initiates, that loves starting things. The risk is multiplying beginnings without always following through.",
  Fixe: "Fixed dominant: an energy that holds steady over time, persevering and loyal to its choices. The risk is excessive resistance to change.",
  Mutable: "Mutable dominant: an adaptable energy that adjusts easily to context. The risk is a certain scatteredness or a lack of backbone over time.",
};
