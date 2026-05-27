import { describe, expect, it } from "vitest";
import {
  findMenuCategoryBySlug,
  getMenuCategoryHref,
} from "@/modules/catalog/components/public-menu-category-utils";

describe("public menu category urls", () => {
  it("matches categories with hyphenated names", () => {
    const href = getMenuCategoryHref("Суши-доги");
    const slug = href.split("/").at(-1);

    expect(slug).toBeDefined();
    expect(findMenuCategoryBySlug(slug ?? "")?.value).toBe("Суши-доги");
  });
});
