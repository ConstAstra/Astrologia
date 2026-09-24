import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { narrateDeepSynthesis, narrateLifeMissionSynthesis } from "@/lib/ai/deep-synthesis";
import type { ChartFacts } from "@/lib/astro/interpretations/chart-facts";
import type { LunarNodeFacts } from "@/lib/astro/interpretations/lunar-node-facts";

const MINIMAL_FACTS: ChartFacts = {
  planets: [
    {
      key: "sun",
      name: "Soleil",
      sign: "vierge",
      signName: "Vierge",
      degree: "1°52'",
      house: 3,
      retrograde: false,
      dignities: [],
      dignityLabel: null,
    },
  ],
  ascendant: { sign: "Cancer", degree: "1°54'" },
  midheaven: { sign: "Poissons", degree: "3°45'", house: 10 },
  hasReliableHouses: true,
  aspects: [],
  patterns: [],
  dominantElements: ["Terre"],
  dominantModalities: ["Mutable"],
  ascendantRulerName: "Lune",
  ascendantRulerPlacement: { sign: "Scorpion", house: 6 },
};

const ORIGINAL_ENV = process.env.ANTHROPIC_API_KEY;

describe("narrateDeepSynthesis", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_ENV === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = ORIGINAL_ENV;
  });

  it("returns null without hitting the network when ANTHROPIC_API_KEY is unset", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.stubGlobal("fetch", vi.fn());
    const result = await narrateDeepSynthesis(MINIMAL_FACTS, { themeLabel: "thème natal" }, "fr");
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("parses a well-formed structured-output response", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const body = {
      general: "texte général",
      love: "texte amour",
      money: "texte argent",
      career: "texte carrière",
      spiritual: "texte spirituel",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(body) }] }),
      }))
    );
    const result = await narrateDeepSynthesis(MINIMAL_FACTS, { themeLabel: "thème natal" }, "fr");
    expect(result).toEqual(body);
  });

  it("returns null when the HTTP call fails", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    const result = await narrateDeepSynthesis(MINIMAL_FACTS, { themeLabel: "thème natal" }, "fr");
    expect(result).toBeNull();
  });

  it("returns null when the network call throws", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );
    const result = await narrateDeepSynthesis(MINIMAL_FACTS, { themeLabel: "thème natal" }, "fr");
    expect(result).toBeNull();
  });

  it("returns null when the turn didn't end normally (e.g. truncated)", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ stop_reason: "max_tokens", content: [{ type: "text", text: "{}" }] }),
      }))
    );
    const result = await narrateDeepSynthesis(MINIMAL_FACTS, { themeLabel: "thème natal" }, "fr");
    expect(result).toBeNull();
  });

  it("returns null when a chapter is missing from the parsed JSON", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify({ general: "x", love: "y" }) }],
        }),
      }))
    );
    const result = await narrateDeepSynthesis(MINIMAL_FACTS, { themeLabel: "thème natal" }, "fr");
    expect(result).toBeNull();
  });
});

const MINIMAL_NODE_FACTS: LunarNodeFacts = {
  northNode: { signName: "Cancer", degree: "12°30'", house: 4 },
  southNode: { signName: "Capricorne", degree: "12°30'", house: 10 },
  rulerName: "Lune",
  rulerSignName: "Scorpion",
  rulerDegree: "5°10'",
  rulerHouse: 6,
  rulerDignityLabel: null,
  aspects: [],
};

describe("narrateLifeMissionSynthesis", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (ORIGINAL_ENV === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = ORIGINAL_ENV;
  });

  it("returns null without hitting the network when ANTHROPIC_API_KEY is unset", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.stubGlobal("fetch", vi.fn());
    const result = await narrateLifeMissionSynthesis(MINIMAL_NODE_FACTS, "fr");
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("parses a well-formed structured-output response", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const body = { comfort: "texte confort", ruler: "texte maître", synthesis: "texte synthèse" };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(body) }] }),
      }))
    );
    const result = await narrateLifeMissionSynthesis(MINIMAL_NODE_FACTS, "fr");
    expect(result).toEqual(body);
  });

  it("returns null when a field is missing from the parsed JSON", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify({ comfort: "x", ruler: "y" }) }],
        }),
      }))
    );
    const result = await narrateLifeMissionSynthesis(MINIMAL_NODE_FACTS, "fr");
    expect(result).toBeNull();
  });
});
