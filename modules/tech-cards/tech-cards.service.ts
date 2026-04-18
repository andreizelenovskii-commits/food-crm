import {
  createTechCard,
  getTechCardOptions,
  getTechCardProductOptions,
  getTechCards,
} from "@/modules/tech-cards/tech-cards.repository";
import type { TechCardInput } from "@/modules/tech-cards/tech-cards.validation";

export async function fetchTechCards() {
  return getTechCards();
}

export async function fetchTechCardProductOptions() {
  return getTechCardProductOptions();
}

export async function fetchTechCardOptions() {
  return getTechCardOptions();
}

export async function addTechCard(input: TechCardInput) {
  return createTechCard(input);
}
