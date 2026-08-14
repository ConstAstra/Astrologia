// Keys stay the internal French tokens ("Feu", "Terre"...) used throughout
// the astro engine's dominance computation — only the text is translated.
export const ELEMENT_DOMINANCE_TEXT_EN: Record<string, string> = {
  Feu: "Fire dominant: an energy that needs to act, initiate, get enthusiastic. The risk, if unchanneled, is impulsiveness or quickly running out of steam. The growth edge is learning to carry momentum across an entire project, not just its launch, without dimming what makes it powerful.",
  Terre: "Earth dominant: a need for the concrete, for stability and tangible results. The risk, if too pronounced, is rigidity or difficulty letting go. The growth edge is learning that accepting change doesn't mean losing what's already been built.",
  Air: "Air dominant: an energy oriented toward ideas, exchange and connecting with others. The risk, if too pronounced, is staying in one's head, avoiding emotional or concrete grounding. The growth edge is learning to let an idea settle back into the body and into feeling, not just circulate between minds.",
  Eau: "Water dominant: an emotional, intuitive sensitivity in the foreground. The risk, if too pronounced, is being overwhelmed or struggling to set clear boundaries. The growth edge is learning to set a limit without feeling guilty, without losing the richness of that sensitivity.",
};

export const MODALITY_DOMINANCE_TEXT_EN: Record<string, string> = {
  Cardinal: "Cardinal dominant: an energy that initiates, that loves starting things. The risk is multiplying beginnings without always following through. The growth edge is learning to pick one project and see it through before opening the next.",
  Fixe: "Fixed dominant: an energy that holds steady over time, persevering and loyal to its choices. The risk is excessive resistance to change. The growth edge is learning that adjusting course mid-way isn't giving up, it's its own form of consistency.",
  Mutable: "Mutable dominant: an adaptable energy that adjusts easily to context. The risk is a certain scatteredness or a lack of backbone over time. The growth edge is learning to keep a steady throughline underneath all the adjusting, so flexibility never turns into having no direction at all.",
};
