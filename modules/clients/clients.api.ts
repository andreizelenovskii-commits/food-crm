import type { Client } from "@/modules/clients/clients.types";
import { backendGet } from "@/shared/api/backend";

export async function fetchClients(): Promise<Client[]> {
  return backendGet<Client[]>("/api/v1/clients");
}

export async function fetchClientById(clientId: number): Promise<Client | null> {
  return backendGet<Client | null>(`/api/v1/clients/${clientId}`);
}
