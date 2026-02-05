export const PRODUCT_TYPE = {
  MAIL: "mail",
  FULL: "full",
  CUSTOM: "custom",
} as const;

export interface Product {
  _id: string;
  type: string;
  slug: string;
  title: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  basePrice: number;
  currency: string;
  available: number;
  discounts: Discount[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface Discount {
  minQuantity: number;
  discount: number;
}
