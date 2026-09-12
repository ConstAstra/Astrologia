import type { PlanetKey } from "../types";

// English counterpart to transit-manifestations.ts — see that file for the
// rationale (answers "so what does this actually cause today?").
export const TRANSIT_MANIFESTATIONS_EN: Record<PlanetKey, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  sun: {
    harmonieux: "a moment where your presence lands well, where you get noticed for the right reasons, a chance to assert yourself without forcing it.",
    tendu: "a need to be seen running into a concrete obstacle: someone taking up all the space, a situation where it's hard to shine the way you'd like.",
    neutre: "a slight bump in visibility, nothing at stake in particular, a day where your presence gets noticed a bit more than usual.",
  },
  moon: {
    harmonieux: "a lighter mood, a good moment to feel at ease at home or with a small circle.",
    tendu: "a rawer sensitivity, an emotional reaction a bit sharper than usual to some everyday surprise.",
    neutre: "a subtle mood swing, nothing to worry about.",
  },
  mercury: {
    harmonieux: "a conversation that unlocks something, an idea that arrives at just the right time, an important message to send or receive.",
    tendu: "a misunderstanding worth watching for in an exchange, a decision worth phrasing with more distance than usual before you say it.",
    neutre: "a bit more mental restlessness than usual, with no real consequence.",
  },
  venus: {
    harmonieux: "a pleasant moment in love, friendship, or money, an invitation, a compliment, an unexpected bit of income.",
    tendu: "tension around money or a relationship, worth defusing rather than letting fester.",
    neutre: "a slightly stronger pull toward pleasure or comfort than usual, with no urgency to it.",
  },
  mars: {
    harmonieux: "a real boost to move a project forward, a chance to act efficiently.",
    tendu: "irritability worth watching, a real risk of conflict if you react hot rather than after thinking it through.",
    neutre: "a burst of energy, without necessarily a specific project to put it toward.",
  },
  jupiter: {
    harmonieux: "a concrete opportunity showing up: an offer, good news, a door opening more easily than expected.",
    tendu: "a temptation to think too big, a risk of promising more than you can actually deliver.",
    neutre: "a bit more optimism than usual, with no specific event attached to it.",
  },
  saturn: {
    harmonieux: "a concrete payoff for effort sustained over time: earned recognition, a structure that finally holds.",
    tendu: "a constraint or responsibility weighing more than usual, a test of patience.",
    neutre: "a more subdued, almost flat moment, better suited to serious tasks than to surprises.",
  },
  uranus: {
    harmonieux: "a fairly welcome surprise: a sudden idea, a change of plan that actually works out for the better.",
    tendu: "an unwelcome surprise, a last-minute change to absorb without being prepared for it.",
    neutre: "a small surprise with no real consequence, a routine hiccup soon forgotten.",
  },
  neptune: {
    harmonieux: "an accurate intuition, a moment of inspiration or emotional connection finer than usual.",
    tendu: "confusion worth watching for: something to double-check before believing it, a fog that deserves clarifying rather than ignoring.",
    neutre: "a light daydream, a pull toward withdrawal that doesn't call for any particular action.",
  },
  pluto: {
    harmonieux: "a realization that feels good, regaining power over a situation that's weighed on you for a while.",
    tendu: "an intensity that's hard to ignore: a power or control issue resurfacing, worth not letting escalate.",
    neutre: "a more intense undertone in the background, without a specific event triggering it today.",
  },
  northNode: {
    harmonieux: "a chance to move in a direction that helps you grow, even if it's a bit outside your habits.",
    tendu: "a choice that pulls you out of your comfort zone, with the temptation to retreat to the familiar instead of moving forward.",
    neutre: "a faint sense of being in the right place at the right time, with nothing specific happening.",
  },
};
