import type { PlanetKey } from "../types";

// English counterpart to transit-manifestations-composite.ts — see that
// file for the rationale.
export const TRANSIT_MANIFESTATIONS_COMPOSITE_EN: Record<PlanetKey, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  sun: {
    harmonieux: "a moment where the relationship itself gets noticed in a good way by the people around it — what you embody together is in the spotlight.",
    tendu:
      "a need for recognition of what the relationship stands for running into an outside obstacle — a third party or situation encroaching on the space you occupy together.",
    neutre: "a slight bump in visibility for the relationship, nothing at stake in particular today.",
  },
  moon: {
    harmonieux: "a moment where the bond feels especially secure, a good time to close ranks in a small circle.",
    tendu: "a raw collective sensitivity, a sharper reaction than usual from the relationship to some outside surprise.",
    neutre: "a subtle shift in the bond's emotional weather, nothing to worry about.",
  },
  mercury: {
    harmonieux: "a shared conversation or decision that unlocks something for the relationship, a clarity arriving at just the right time.",
    tendu: "a misunderstanding touching the relationship as a whole, a shared decision worth phrasing with more distance before announcing it outward.",
    neutre: "a bit more back-and-forth in exchanges touching the relationship, with no real consequence.",
  },
  venus: {
    harmonieux: "a pleasant moment for the relationship — an invitation, outside recognition, an unexpected bit of income that benefits the bond.",
    tendu: "tension around money or the relationship's image, worth defusing rather than letting fester.",
    neutre: "a slightly stronger pull toward shared comfort or pleasure for the relationship, with no urgency to it.",
  },
  mars: {
    harmonieux: "a real boost for the relationship, a chance to move a shared project forward efficiently.",
    tendu: "irritability touching the bond's mood, a real risk of friction if it isn't channeled.",
    neutre: "a burst of energy for the relationship, without necessarily a specific project to put it toward.",
  },
  jupiter: {
    harmonieux: "a concrete opportunity showing up for the relationship: an offer, good news, a door opening more easily than expected.",
    tendu: "a temptation to think bigger than what the relationship can actually sustain, a risk of excessive promises.",
    neutre: "a bit more optimism around the relationship, with no specific event attached to it.",
  },
  saturn: {
    harmonieux: "a concrete payoff for effort the relationship has sustained over time: earned recognition, a structure that finally holds.",
    tendu: "a constraint or responsibility weighing more heavily on the relationship than usual, a test of its solidity.",
    neutre: "a more subdued moment for the relationship, better suited to serious topics than to surprises.",
  },
  uranus: {
    harmonieux: "a fairly welcome surprise for the relationship: a change of plan that, in the end, works out for it.",
    tendu: "a surprise that shakes up the bond's balance, to absorb without being prepared for it.",
    neutre: "a small surprise with no real consequence in the relationship's routine.",
  },
  neptune: {
    harmonieux: "an accurate intuition about what the relationship is going through, a moment of shared inspiration.",
    tendu: "confusion worth watching for around the relationship — something to clarify rather than leave vague.",
    neutre: "a light collective daydream, a pull toward withdrawal that doesn't call for any particular action from the relationship.",
  },
  pluto: {
    harmonieux: "a realization that's good for the relationship, regaining power over a dynamic that's weighed on it for a while.",
    tendu: "an intensity hard to ignore for the relationship: a power or control issue resurfacing, worth not letting escalate.",
    neutre: "a more intense undertone in the background of the relationship, without a specific event triggering it today.",
  },
  northNode: {
    harmonieux: "a chance for the relationship to move toward what helps it grow, even if it's outside its habits.",
    tendu: "a choice that pushes the relationship out of its comfort zone, with the temptation to retreat to a more familiar way of functioning.",
    neutre: "a faint sense that the relationship is in the right place at the right time, with nothing specific happening.",
  },
};
