export interface AppRoute {
  name: string;
  path: string;
}

export const APP_ROUTES: AppRoute[] = [
  { name: "Create Product", path: "/create-product" },
  { name: "Promo codes", path: "/promo-codes" },
] as const;
