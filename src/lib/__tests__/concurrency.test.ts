import { describe, it, expect } from "vitest";
import { processWithConcurrency } from "../concurrency";

describe("processWithConcurrency", () => {
  it("processes every item exactly once", async () => {
    const seen: number[] = [];
    await processWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => {
      seen.push(n);
    });
    expect(seen.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it("never runs more than `limit` items concurrently", async () => {
    let active = 0;
    let maxActive = 0;
    const items = Array.from({ length: 20 }, (_, i) => i);
    await processWithConcurrency(items, 3, async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
    });
    expect(maxActive).toBeLessThanOrEqual(3);
  });

  it("keeps processing remaining items even if one throws (matches cron routes' own per-item try/catch)", async () => {
    const seen: number[] = [];
    await processWithConcurrency([1, 2, 3], 2, async (n) => {
      try {
        if (n === 2) throw new Error("boom");
        seen.push(n);
      } catch {
        // The cron routes catch inside fn themselves; processWithConcurrency
        // does not swallow errors on their behalf.
      }
    });
    expect(seen.sort((a, b) => a - b)).toEqual([1, 3]);
  });

  it("handles an empty list without error", async () => {
    await expect(processWithConcurrency([], 5, async () => {})).resolves.toBeUndefined();
  });

  it("handles a limit larger than the item count", async () => {
    const seen: number[] = [];
    await processWithConcurrency([1, 2], 10, async (n) => {
      seen.push(n);
    });
    expect(seen.sort((a, b) => a - b)).toEqual([1, 2]);
  });
});
