"use client";

export type ProductFormValues = {
  name: string;
  category: string;
  unit: string;
  stockQuantity: string;
  price: string;
  description: string;
};

export type ProductFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  values: ProductFormValues;
};

export type InventoryAuditFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  checkedCount: number;
  updatedCount: number;
  differenceCount: number;
};

export type InventorySessionCreateFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  createdSessionId: number | null;
};

export type InventorySessionProgressFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

export type WriteoffActCreateFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  createdActId: number | null;
};

export type WriteoffActProgressFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};
