export type CatalogItem = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  priceCents: number;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  technologicalCardId: number;
  technologicalCardName: string;
};
