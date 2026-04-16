import {
  createClient,
  deleteClient,
  getClientById,
  getAllClients,
  updateClient,
} from "@/modules/clients/clients.repository";
import type { Client } from "@/modules/clients/clients.types";
import type {
  CreateClientInput,
  UpdateClientInput,
} from "@/modules/clients/clients.validation";

export async function fetchClients(): Promise<Client[]> {
  return getAllClients();
}

export async function addClient(input: CreateClientInput): Promise<Client> {
  return createClient(input);
}

export async function fetchClientById(clientId: number): Promise<Client | null> {
  return getClientById(clientId);
}

export async function updateClientService(
  clientId: number,
  input: UpdateClientInput,
): Promise<Client | null> {
  return updateClient(clientId, input);
}

export async function deleteClientService(clientId: number): Promise<boolean> {
  return deleteClient(clientId);
}
