import type { PlanetKey } from "../types";

// English counterpart to transit-manifestations-synastry.ts — see that file
// for the rationale.
export const TRANSIT_MANIFESTATIONS_SYNASTRY_EN: Record<PlanetKey, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  sun: {
    harmonieux:
      "a moment where one of you feels seen and valued by the other — a mutual recognition that doesn't need forcing to feel sincere.",
    tendu:
      "a need for recognition running into the other's ego — a situation where one of you takes up all the space, leaving the other struggling to be seen in turn.",
    neutre: "a light game of visibility between you two, nothing really at stake — one of you takes up a bit more space today.",
  },
  moon: {
    harmonieux: "a moment of spontaneous emotional closeness, where one of you understands what the other needs without having to explain it.",
    tendu: "a rawer sensitivity in one of you, who may feel misunderstood or not reassured enough by the other today.",
    neutre: "a mood swing that touches your dynamic without real weight — a slightly stronger pull toward closeness in one of you.",
  },
  mercury: {
    harmonieux: "a conversation between you two that unlocks something — a real moment of listening where one finally understands what the other was trying to say.",
    tendu: "a misunderstanding worth watching for in your exchanges — one says one thing, the other hears another, with a real risk of tension if it's not cleared up.",
    neutre: "a bit more back-and-forth than usual between you two, nothing major at stake.",
  },
  venus: {
    harmonieux: "a pleasant moment between you two — a tender gesture, a sincere compliment, a shared wish to spend time together.",
    tendu: "tension around money or affection between you two, worth defusing rather than letting simmer.",
    neutre: "a slightly stronger pull toward shared comfort or pleasure today, with no urgency to it.",
  },
  mars: {
    harmonieux: "a real boost to move forward together on something concrete — shared energy that turns into action rather than words.",
    tendu: "irritability circulating between you two, with a real risk of friction if one of you reacts hot rather than after thinking it through.",
    neutre: "a burst of energy in your dynamic, without necessarily a specific project to put it toward.",
  },
  jupiter: {
    harmonieux: "an opportunity that benefits you both — a shared project moving forward, good news to share.",
    tendu: "a temptation to think too big together, with the risk of promising more, as a pair, than you can actually deliver.",
    neutre: "a bit more shared optimism than usual, with no specific event attached to it.",
  },
  saturn: {
    harmonieux: "a concrete payoff for a commitment sustained over time between you two — proof that the bond holds, even without fireworks.",
    tendu: "a constraint or responsibility weighing on your bond today, a test of mutual patience.",
    neutre: "a more subdued moment in your dynamic, better suited to serious discussions than to surprises.",
  },
  uranus: {
    harmonieux: "a fairly welcome surprise in your dynamic — a change of plan that, in the end, works out for both of you.",
    tendu: "a surprise that shakes up your usual balance, to absorb without either of you being quite ready for it.",
    neutre: "a small surprise in your shared routine, with no real consequence.",
  },
  neptune: {
    harmonieux: "an accurate intuition about the other, a moment of connection that goes beyond words.",
    tendu: "confusion worth watching for between you two — something unsaid or an unspoken expectation that deserves clarifying rather than being ignored.",
    neutre: "a light dreamy distance today, nothing that calls for a real conversation.",
  },
  pluto: {
    harmonieux: "a realization that's good for your bond, an issue left unspoken that finally finds its place in the conversation.",
    tendu: "an intensity hard to ignore between you two — a power or control issue resurfacing, worth not letting escalate.",
    neutre: "a more intense undertone in the background of your relationship, without a specific event triggering it today.",
  },
  northNode: {
    harmonieux: "a chance, together, to move toward something that helps you grow, even if it's outside your usual habits.",
    tendu: "a choice that pushes you out of your usual relational comfort zone, with the temptation to retreat to what's more familiar.",
    neutre: "a faint sense of being, together, in the right place at the right time, with nothing specific happening.",
  },
};
