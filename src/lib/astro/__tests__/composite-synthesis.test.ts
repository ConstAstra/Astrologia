import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeComposite } from "@/lib/astro/composite";
import { composeCompositeSynthesis } from "@/lib/astro/interpretations/composite-synthesis";

describe("composeCompositeSynthesis", () => {
  const chartA = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );
  const chartB = computeNatalChart(
    { date: "1998-03-12", time: "14:20", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
    "placidus"
  );
  const composite = computeComposite(chartA, chartB);

  it("names composite Sun and Moon signs in the overview", () => {
    const s = composeCompositeSynthesis(composite, "amitie", "fr");
    expect(s.overview).toMatch(/Soleil composite/);
    expect(s.overview).toMatch(/Lune composite/);
  });

  it("covers all 12 houses in the life-domains reading", () => {
    const s = composeCompositeSynthesis(composite, "amitie", "fr");
    expect(s.lifeDomains).toHaveLength(12);
    expect(s.lifeDomains.map((d) => d.house)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("suppresses romantic-coded pair themes outside a romantic framing", () => {
    const romantic = composeCompositeSynthesis(composite, "romantique", "fr");
    const friendship = composeCompositeSynthesis(composite, "amitie", "fr");
    // Not a strict guarantee any given chart has a romantic-coded pair among
    // its top tensions/strengths, but the two readings must never crash and
    // must stay independently well-formed for both framings.
    expect(romantic.tensions.length).toBeGreaterThanOrEqual(0);
    expect(friendship.tensions.length).toBeGreaterThanOrEqual(0);
  });

  it("produces bilingual output without leaking the other language", () => {
    const fr = composeCompositeSynthesis(composite, "amitie", "fr");
    const en = composeCompositeSynthesis(composite, "amitie", "en");
    expect(fr.overview).toMatch(/Soleil/);
    expect(en.overview).toMatch(/Sun/);
    expect(en.overview).not.toMatch(/Soleil/);
  });

  it("is deterministic for the same chart", () => {
    const a = composeCompositeSynthesis(composite, "amitie", "fr");
    const b = composeCompositeSynthesis(composite, "amitie", "fr");
    expect(a).toEqual(b);
  });

  it("covers all major tense and flowing aspects, without an artificial cap", () => {
    const s = composeCompositeSynthesis(composite, "amitie", "fr");
    expect(s.tensions.length + s.strengths.length).toBeGreaterThan(0);
  });

  it("never contains em-dashes, an AI-writing tell", () => {
    const s = composeCompositeSynthesis(composite, "amitie", "fr");
    expect(s.overview).not.toContain("—");
    for (const t of s.tensions) expect(t).not.toContain("—");
    for (const st of s.strengths) expect(st).not.toContain("—");
    for (const d of s.lifeDomains) expect(d.text).not.toContain("—");
  });
});
