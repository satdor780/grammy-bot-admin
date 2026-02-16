import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Check, X, CalendarIcon } from "lucide-react";
import { useTelegramStore } from "../../../store/telegramStore";
import { getPromoCodes, createPromoCode } from "../../../api";
import { Input } from "@/components/shadcn/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { cn } from "@/lib/utils";
import { init } from "../../../api/init";
import type { PromoCode } from "../../../api/getPromoCodes";
import type { Product } from "../../../types";

interface PromoCodeFormData {
  code: string;
  name: string;
  source: string;
  discountType: "percent" | "fixed";
  discount: string;
  maxUsages: string;
  expiresAt: string; // datetime-local: YYYY-MM-DDTHH:mm
}

const INPUT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const PromoCodes = () => {
  const initData = useTelegramStore((s) => s.initData);
  const queryClient = useQueryClient();

  const { data: promoCodesData, isLoading: promoCodesLoading } = useQuery({
    queryKey: ["promoCodes", initData],
    queryFn: () => getPromoCodes(initData!),
    enabled: !!initData,
  });

  const { data: initDataResponse } = useQuery({
    queryKey: ["init", initData],
    queryFn: () => init(initData!),
    enabled: !!initData,
  });

  const createMutation = useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });

  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    name: "",
    source: "",
    discountType: "percent",
    discount: "",
    maxUsages: "",
    expiresAt: "",
  });

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promoCodes = promoCodesData?.promoCode ?? [];
  const products = initDataResponse?.products ?? ([] as Product[]);

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value as "percent" | "fixed",
  //   }));
  // };

  const addProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) return;
    setSelectedProductIds((prev) => [...prev, productId]);
  };

  const removeProduct = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initData) {
      alert("Требуется авторизация. Откройте приложение из Telegram.");
      return;
    }

    if (!formData.code || !formData.name || !formData.source || !formData.discount.trim()) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const discountNum = parseFloat(formData.discount);
    if (isNaN(discountNum) || discountNum < 0) {
      alert("Значение скидки должно быть положительным числом");
      return;
    }
    if (formData.discountType === "percent" && (discountNum < 0.01 || discountNum > 100)) {
      alert("Процентная скидка должна быть от 0.01 до 100");
      return;
    }

    const maxUsages = formData.maxUsages.trim()
      ? parseInt(formData.maxUsages, 10)
      : undefined;
    if (maxUsages !== undefined && (isNaN(maxUsages) || maxUsages < 1)) {
      alert("Максимальное число использований должно быть >= 1");
      return;
    }

    try {
      await createMutation.mutateAsync({
        initData,
        code: formData.code.trim(),
        name: formData.name.trim(),
        source: formData.source.trim(),
        discount: discountNum,
        discountType: formData.discountType,
        maxUses: maxUsages,
        expiresAt: formData.expiresAt.trim() || undefined,
        appliesToProducts:
          selectedProductIds.length > 0 ? selectedProductIds : undefined,
      });
      setFormData({
        code: "",
        name: "",
        source: "",
        discountType: "percent",
        discount: "",
        maxUsages: "",
        expiresAt: "",
      });
      setSelectedProductIds([]);
      alert("Промокод успешно создан!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось создать промокод";
      alert(msg);
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

  const selectedProducts = products.filter((p) =>
    selectedProductIds.includes(p._id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-[70px] pt-2">
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
                        <span>
                          Тип скидки:{" "}
                          {promo.discountType === "fixed"
                            ? "фиксированная"
                            : "процент"}
                        </span>
                        {formatValidity(promo) && (
                          <span>Срок: {formatValidity(promo)}</span>
                        )}
                      </div>
                      <div className="flex justify-end items-center w-full pt-5">
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

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-6">Добавить новый промокод</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Код промокода
              </label>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="SUMMER2024"
                value={formData.code}
                onChange={handleInputChange}
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Название
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Летняя распродажа"
                value={formData.name}
                onChange={handleInputChange}
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="source"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Источник (канал/ресурс)
              </label>
              <input
                id="source"
                name="source"
                type="text"
                placeholder="@telegram_channel или instagram.com/brand"
                value={formData.source}
                onChange={handleInputChange}
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="expiresAt"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Срок действия (необязательно)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      INPUT_CLASS,
                      "flex items-center gap-2 text-left font-normal",
                      !formData.expiresAt && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
                    {formData.expiresAt
                      ? new Date(formData.expiresAt).toLocaleString("ru-RU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Выберите дату и время"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <Input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expiresAt: e.target.value,
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>


            {/* <div className="space-y-2">
              <label
                htmlFor="discountType"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Тип скидки
              </label>
              <select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleSelectChange}
                className={INPUT_CLASS}
              >
                <option value="percent">Процент (%)</option>
                <option value="fixed">Фиксированная сумма</option>
              </select>
            </div> */}

            <div className="space-y-2">
              <label
                htmlFor="discount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Значение скидки
                {formData.discountType === "percent" ? " (%)" : ""}
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                min="0"
                step={formData.discountType === "percent" ? "0.01" : "0.01"}
                placeholder={
                  formData.discountType === "percent" ? "20" : "10.50"
                }
                value={formData.discount}
                onChange={handleInputChange}
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="maxUsages"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Макс. использований (необязательно)
              </label>
              <input
                id="maxUsages"
                name="maxUsages"
                type="number"
                min="1"
                placeholder="Без ограничений"
                value={formData.maxUsages}
                onChange={handleInputChange}
                className={INPUT_CLASS}
              />
            </div>

            
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">
                Продукты (пусто = для всех)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Загрузка продуктов...
                  </p>
                ) : (
                  products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-2 py-1"
                    >
                      <span className="text-sm truncate flex-1">
                        {product.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => addProduct(product._id)}
                        disabled={selectedProductIds.includes(product._id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        title="Добавить"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Выбранные продукты ({selectedProducts.length})
                </h3>
                <div className="space-y-2 border rounded-md p-2 bg-muted/30">
                  {selectedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-2 py-1"
                    >
                      <span className="text-sm truncate flex-1">
                        {product.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProduct(product._id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="Удалить"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Создание…" : "Создать промокод"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
