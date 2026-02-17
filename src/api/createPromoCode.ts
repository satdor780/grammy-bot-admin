import { api } from "./axios";
import type { PromoCode } from "./getPromoCodes";

export interface CreatePromoCodeProductPayload {
  id: string;
  name: string;
  slug: string;
}

export interface CreatePromoCodeRequest {
  initData: string;
  code: string;
  name: string;
  source: string;
  discount: number;
  discountType: "percent" | "fixed";
  maxUses?: number;
  expiresAt?: string; // ISO date string (datetime-local format: YYYY-MM-DDTHH:mm)
  appliesToProducts?: CreatePromoCodeProductPayload[];
}

export interface CreatePromoCodeResponse {
  success: boolean;
  promoCode: undefined | PromoCode;
}

export async function createPromoCode(
  payload: CreatePromoCodeRequest,
): Promise<CreatePromoCodeResponse> {
  const { data } = await api.post<CreatePromoCodeResponse>(
    "/api/promocode",
    payload,
  );
  return data;
}
