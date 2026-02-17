import { PromoCodesCreate, PromoCodesList } from "./components";

export const PromoCodes = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-[70px] pt-2">
      <PromoCodesList />
      <PromoCodesCreate />
    </div>
  );
};
