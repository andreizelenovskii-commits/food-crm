import { describe, expect, it } from "vitest";
import { matchesSmartSearch } from "@/shared/lib/smart-search";

describe("matchesSmartSearch", () => {
  it("ignores separators and spaces", () => {
    expect(matchesSmartSearch("А-ля-Русс", "алярусс")).toBe(true);
  });

  it("matches latin transliteration against russian text", () => {
    expect(matchesSmartSearch("Маргарита", "margarita")).toBe(true);
  });

  it("matches russian transliteration against latin text", () => {
    expect(matchesSmartSearch("FoodLike", "фудлайк")).toBe(true);
  });

  it("matches text typed in the wrong keyboard layout", () => {
    expect(matchesSmartSearch("Маргарита", "vfhufhbnf")).toBe(true);
  });

  it("matches endings and beginnings of words", () => {
    expect(matchesSmartSearch("Пепперони с беконом", "бекон")).toBe(true);
    expect(matchesSmartSearch("Пепперони с беконом", "пепп")).toBe(true);
  });

  it("does not match unrelated items through weak description fragments", () => {
    expect(
      matchesSmartSearch(
        [
          "Аригато",
          "Холодные роллы",
          "Нежный лосось, маринованные морские водоросли и творожный сыр",
        ],
        "асакава",
      ),
    ).toBe(false);
  });
});
