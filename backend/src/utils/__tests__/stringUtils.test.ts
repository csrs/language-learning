import { describe, it, expect } from "vitest";
import { normalizeVerbsToInfinitive } from "../stringUtils.ts";

describe("normalizeTargetLanguageVerbs", () => {
  it("prepends 'to ' if not present", () => {
    expect(normalizeVerbsToInfinitive("to run, walk")).toEqual(
      "to run, to walk",
    );
  });
});
