import { create } from "zustand";

export type DiscountRuleForm = {
  id: string;
  minQuantity: number;
  discount: number;
};

export type CreateProductPayload = {
  name: string;
  price: number;
  slug: string;
  shortDescription: string;
  description: string;
  tags: string[];
  discounts: { minQuantity: number; discount: number }[];
};

type CreateProductState = {
  name: string;
  price: string;
  slug: string;
  shortDescription: string;
  description: string;
  tags: string[];
  discountRules: DiscountRuleForm[];
  submitAttempted: boolean;
};

const initialState: CreateProductState = {
  name: "",
  price: "",
  slug: "",
  shortDescription: "",
  description: "",
  tags: [],
  discountRules: [],
  submitAttempted: false,
};

type CreateProductActions = {
  setField: <K extends keyof CreateProductState>(
    field: K,
    value: CreateProductState[K],
  ) => void;
  setDiscountRules: (rules: DiscountRuleForm[]) => void;
  addDiscountRule: () => void;
  updateDiscountRule: (
    id: string,
    updates: Partial<Pick<DiscountRuleForm, "minQuantity" | "discount">>,
  ) => void;
  removeDiscountRule: (id: string) => void;
  reset: () => void;
  setSubmitAttempted: (value: boolean) => void;
  getSubmitPayload: () => CreateProductPayload;
  areRequiredFieldsFilled: () => boolean;
};

export const useCreateProductStore = create<
  CreateProductState & CreateProductActions
>((set, get) => ({
  ...initialState,

  setField: (field, value) => set({ [field]: value }),

  setDiscountRules: (rules) => set({ discountRules: rules }),

  addDiscountRule: () =>
    set((state) => {
      if (state.discountRules.length >= 5) return state;
      return {
        discountRules: [
          ...state.discountRules,
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            minQuantity: 0,
            discount: 0,
          },
        ],
      };
    }),

  updateDiscountRule: (id, updates) =>
    set((state) => ({
      discountRules: state.discountRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    })),

  removeDiscountRule: (id) =>
    set((state) => ({
      discountRules: state.discountRules.filter((r) => r.id !== id),
    })),

  reset: () => set(initialState),

  setSubmitAttempted: (value) => set({ submitAttempted: value }),

  getSubmitPayload: (): CreateProductPayload => {
    const state = get();
    return {
      name: state.name.trim(),
      price: Number(state.price) || 0,
      slug: state.slug.trim(),
      shortDescription: state.shortDescription.trim(),
      description: state.description.trim(),
      tags: state.tags.filter((t) => t.trim() !== ""),
      discounts: state.discountRules,
    };
  },

  areRequiredFieldsFilled: (): boolean => {
    const state = get();
    const has = (s: string) => s.trim() !== "";
    const validNumber = (s: string) =>
      s.trim() !== "" && !Number.isNaN(Number(s)) && Number(s) >= 0;
    return (
      has(state.name) &&
      has(state.slug) &&
      has(state.shortDescription) &&
      has(state.description) &&
      validNumber(state.price)
    );
  },
}));
