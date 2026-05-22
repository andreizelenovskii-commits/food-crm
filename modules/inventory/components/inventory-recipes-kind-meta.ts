export type RecipeKind = "price" | "ingredient" | "composite";

export function getKindMeta(kind: RecipeKind) {
  if (kind === "ingredient") {
    return {
      eyebrow: "Заготовки",
      icon: "box" as const,
      title: "Технологические карты ингредиентов",
      description: "Заготовки, соусы и полуфабрикаты, которые используются внутри других карт.",
    };
  }

  if (kind === "composite") {
    return {
      eyebrow: "Комбо",
      icon: "book" as const,
      title: "Комбинированные технологические карты",
      description: "Комбо и сеты, собранные из уже готовых технологических карт.",
    };
  }

  return {
    eyebrow: "Прайс",
    icon: "book" as const,
    title: "Прайсовые технологические карты",
    description: "Позиции меню и прайса: пиццы, роллы, блюда, напитки и десерты.",
  };
}
