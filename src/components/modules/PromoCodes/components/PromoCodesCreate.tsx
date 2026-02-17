import { createPromoCode, init } from "@/api";
import { Button } from "@/components/shadcn/ui/button";
import { Calendar } from "@/components/shadcn/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { cn } from "@/lib";
import { useTelegramStore } from "@/store";
import type { Product } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useState } from "react";



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

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const PromoCodesCreate = () => {
    const initData = useTelegramStore((s) => s.initData);
  const queryClient = useQueryClient();

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

  const products = initDataResponse?.products ?? ([] as Product[]);

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
      const appliesToProducts =
        selectedProductIds.length > 0
          ? selectedProductIds
              .map((id) => products.find((p) => p._id === id))
              .filter((p): p is Product => Boolean(p))
              .map((p) => ({
                id: p._id,
                name: p.title,
                slug: p.slug,
              }))
          : undefined;

      await createMutation.mutateAsync({
        initData,
        code: formData.code.trim(),
        name: formData.name.trim(),
        source: formData.source.trim(),
        discount: discountNum,
        discountType: formData.discountType,
        maxUses: maxUsages,
        expiresAt: formData.expiresAt.trim() || undefined,
        appliesToProducts,
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



  const selectedProducts = products.filter((p) =>
    selectedProductIds.includes(p._id)
  );
    return (
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
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiresAt && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    {formData.expiresAt
                      ? new Date(formData.expiresAt).toLocaleString("ru-RU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.expiresAt
                        ? new Date(formData.expiresAt)
                        : undefined
                    }
                    // Разрешаем выбирать только прошедшие или сегодняшнюю дату
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const d = new Date(date);
                      d.setHours(0, 0, 0, 0);
                      return d > today;
                    }}
                    onSelect={(date) => {
                      setFormData((prev) => {
                        if (!date) {
                          return { ...prev, expiresAt: "" };
                        }

                        // При выборе даты устанавливаем время по умолчанию на конец дня (23:59)
                        const withTime = new Date(date);
                        withTime.setHours(23, 59, 0, 0);

                        return {
                          ...prev,
                          expiresAt: formatDateTimeLocal(withTime),
                        };
                      });
                    }}
                    initialFocus
                  />
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
    )
}