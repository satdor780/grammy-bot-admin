import { api } from "./axios";

export interface PromoCode {
  _id: string;
  code: string;
  name: string;
  source?: string;
  discount: number;
  discountType?: "percent" | "fixed";
  uses: number;
  maxUses?: number;
  appliesToProducts?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPromoCodesResponse {
  success: boolean;
  promoCode: PromoCode[];
}

export async function getPromoCodes(
  initData: string
): Promise<GetPromoCodesResponse> {
  const { data } = await api.get<GetPromoCodesResponse>("/api/promocode", {
    params: { initData },
  });
  return data;
}
