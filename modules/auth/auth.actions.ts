"use server";

import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/modules/auth/auth.session";
import { authenticateUser } from "@/modules/auth/auth.service";
import { parseLoginInput } from "@/modules/auth/auth.validation";

export async function loginAction(formData: FormData) {
  const input = parseLoginInput(formData);
  const user = await authenticateUser(input);

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
