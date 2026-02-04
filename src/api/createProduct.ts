import { api } from "./axios";

export type ProductType = "mail" | "full" | "custom";

export interface CreateProductRequest {
  initData: string;
  type: ProductType;
  slug?: string;
  title: string;
  image: string;
  shortDescription: string;
  fullDescription?: string;
  basePrice: number;
  currency?: "USDT" | "BTC";
  available: number;
  discounts?: { minQuantity: number; discount: number }[];
  contentTemplate?: string;
  isActive?: boolean;
}

export interface CreateProductResponse {
  success: boolean;
  product: unknown;
}

export async function createProduct(
  payload: CreateProductRequest,
): Promise<CreateProductResponse> {
  const { data } = await api.post<CreateProductResponse>(
    "/api/products",
    payload,
  );
  return data;
}
