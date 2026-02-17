import { getPromoCodes, type PromoCode, type PromoCodeProductRef } from "@/api/getPromoCodes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { useTelegramStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Package } from "lucide-react";
import { useState } from "react";

export const PromoCodesList = () => {
    const initData = useTelegramStore((s) => s.initData);
//   const queryClient = useQueryClient();

  

  const { data: promoCodesData, isLoading: promoCodesLoading } = useQuery({
    queryKey: ["promoCodes", initData],
    queryFn: () => getPromoCodes(initData!),
    enabled: !!initData,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promoCodes = promoCodesData?.promoCode ?? [];
//   const products = initDataResponse?.products ?? ([] as Product[]);

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  const formatValidity = (promo: PromoCode) => {
    if (!promo.expiresAt) return null;
    const date = new Date(promo.expiresAt);
    return `До ${date.toLocaleString("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    })}`;
  };

  const formatDiscount = (promo: PromoCode) => {
    const type = promo.discountType ?? "percent";
    return type === "percent"
      ? `-${promo.discount}%`
      : `-${promo.discount}`;
  };

  const ProductsList = ({ products }: { products?: PromoCodeProductRef[] }) => {
    if (!products || products.length === 0) {
      return (
        <p className="text-muted-foreground text-sm py-2">
          Applies to all products
        </p>
      );
    }
    return (
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {products.map((p) => (
          <li
            key={p.productId}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <span className="font-medium truncate block">{p.name}</span>
              <span className="text-muted-foreground text-xs">{p.slug}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };
    return (
        <div className="space-y-4">
        <h2 className="text-xl font-semibold">Активные промокоды</h2>
        {promoCodesLoading ? (
          <p className="text-muted-foreground">Загрузка...</p>
        ) : (
          <div className="grid gap-3">
            {promoCodes.length === 0 ? (
              <p className="text-muted-foreground">Нет промокодов</p>
            ) : (
              promoCodes.map((promo) => (
                <div
                  key={promo._id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{promo.name}</h3>
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {formatDiscount(promo)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        {promo.source && (
                          <span className="truncate">
                            Источник: {promo.source}
                          </span>
                        )}
                        <span>
                          Использований:{" "}
                          <b className="text-white">{promo.uses}</b>
                          {promo.maxUses != null && (
                            <> / {promo.maxUses}</>
                          )}
                        </span>
                        {/* <span>
                          Тип скидки:{" "}
                          {promo.discountType === "fixed"
                            ? "фиксированная"
                            : "процент"}
                        </span> */}
                        {formatValidity(promo) && (
                          <span>Срок: {formatValidity(promo)}</span>
                        )}
                      </div>
                      <div className="flex justify-end items-center gap-2 w-full pt-5 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            {promo.appliesToProducts && promo.appliesToProducts.length !== 0 && (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                                    >
                                    <Package className="h-4 w-4" />
                                    Active for
                                </button>
                            )}
                           
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Products</DialogTitle>
                            </DialogHeader>
                            <ProductsList products={promo.appliesToProducts} />
                          </DialogContent>
                        </Dialog>
                        <button
                          type="button"
                          onClick={() => handleCopy(promo.code, promo._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-mono text-sm font-medium"
                        >
                          {promo.code}
                          {copiedId === promo._id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
}