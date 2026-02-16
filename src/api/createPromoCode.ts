import { api } from "./axios";
import type { PromoCode } from "./getPromoCodes";

export interface CreatePromoCodeRequest {
  initData: string;
  code: string;
  name: string;
  source: string;
  discount: number;
  discountType: "percent" | "fixed";
  maxUses?: number;
  appliesToProducts?: string[];
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
