import type { Client } from "@/modules/clients/clients.types";
import { backendGet, backendGetOptional } from "@/shared/api/backend";

export async function fetchClients(): Promise<Client[]> {
  return backendGet<Client[]>("/api/v1/clients");
}

export async function fetchClientById(clientId: number): Promise<Client | null> {
  return backendGet<Client | null>(`/api/v1/clients/${clientId}`);
}

export async function fetchCurrentClient(): Promise<Client | null> {
  return backendGetOptional<Client | null>("/api/v1/clients/me");
}
