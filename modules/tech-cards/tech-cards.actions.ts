"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { ValidationError } from "@/shared/errors/app-error";
import { addTechCard } from "@/modules/tech-cards/tech-cards.service";
import { parseTechCardInput } from "@/modules/tech-cards/tech-cards.validation";

export type TechCardFormState = {
  errorMessage: string | null;
  values: {
    name: string;
    outputQuantity: string;
    outputUnit: string;
    ingredientProductId: string;
    ingredientQuantity: string;
    description: string;
  };
};

function getTechCardFormValues(formData: FormData) {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    outputQuantity: read("outputQuantity"),
    outputUnit: read("outputUnit"),
    ingredientProductId: read("ingredientProductId"),
    ingredientQuantity: read("ingredientQuantity"),
    description: read("description"),
  };
}

export async function addTechCardAction(
  _previousState: TechCardFormState,
  formData: FormData,
): Promise<TechCardFormState> {
  await requirePermission("manage_inventory");

  try {
    const input = parseTechCardInput(formData);
    await addTechCard(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        values: getTechCardFormValues(formData),
      };
    }

    throw error;
  }

  redirect("/dashboard/inventory?tab=recipes");
}
