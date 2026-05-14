import type { Client, PublicClientProfile } from "@/modules/clients/clients.types";
import { backendGet, backendGetOptional } from "@/shared/api/backend";

export async function fetchClients(): Promise<Client[]> {
  return backendGet<Client[]>("/api/v1/clients");
}

export async function fetchClientById(clientId: number): Promise<Client | null> {
  return backendGet<Client | null>(`/api/v1/clients/${clientId}`);
}

export async function fetchCurrentClient(): Promise<PublicClientProfile | null> {
  return backendGetOptional<PublicClientProfile | null>("/api/v1/public-auth/me");
}
