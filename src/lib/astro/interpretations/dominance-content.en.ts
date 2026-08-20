// Keys stay the internal French tokens ("Feu", "Terre"...) used throughout
// the astro engine's dominance computation — only the text is translated.
export const ELEMENT_DOMINANCE_TEXT_EN: Record<string, string> = {
  Feu: "Fire dominant: an energy that runs on action and immediate enthusiasm, to the point of launching into things before fully thinking them through. The downside shows up when a project calls for patience rather than fire: the momentum drops as fast as it rose, or turns into impulsive moves regretted later.",
  Terre: "Earth dominant: a need for the concrete, for stability, for results you can actually touch or measure. Pushed too far, that need turns into rigidity: sticking to a method or a situation long after it's stopped serving, simply because change feels frightening.",
  Air: "Air dominant: attention drawn to ideas, words and connecting people, with a real knack for moving between topics and people. The weak spot shows when an idea stays just that, an idea: emotional or concrete grounding gets avoided, as if talking about something were the same as having lived it.",
  Eau: "Water dominant: an emotional, intuitive sensitivity that picks up on what's happening with others before it's even said. The risk is getting overwhelmed by what's felt, or struggling to say no out of fear of hurting someone.",
};

export const MODALITY_DOMINANCE_TEXT_EN: Record<string, string> = {
  Cardinal: "Cardinal dominant: an energy that loves starting, launching, initiating, with a real talent for kicking things off. The downside shows in how many projects end up open at once: starting is easy, finishing is harder.",
  Fixe: "Fixed dominant: an energy that holds steady over time, loyal to its choices once they're made. Pushed too far, that persistence becomes resistance to change, even once the situation itself has moved on and holding firm no longer serves anything.",
  Mutable: "Mutable dominant: an energy that adjusts easily to context, to people, to whatever comes up. The tradeoff is a kind of scatter: without a clear throughline, flexibility can slide into having no direction at all, drifting with the current instead of choosing it.",
};
