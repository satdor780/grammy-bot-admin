import { useState } from "react";
import { Copy, Plus, Check } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  name: string;
  source: string;
  discount: number;
  usageCount: number;
}

interface PromoCodeFormData {
  code: string;
  name: string;
  source: string;
  discount: string;
}

export const PromoCodes = () => {
  const [promoCodes] = useState<PromoCode[]>([
    {
      id: "1",
      code: "SUMMER2024",
      name: "Летняя распродажа",
      source: "@telegram_channel",
      discount: 20,
      usageCount: 156,
    },
    {
      id: "2",
      code: "WELCOME10",
      name: "Приветственная скидка",
      source: "instagram.com/brand",
      discount: 10,
      usageCount: 89,
    },
  ]);

  // Состояние для формы
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    name: "",
    source: "",
    discount: "",
  });

  // Состояние для копирования
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Обработчик копирования кода
  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (
      !formData.code ||
      !formData.name ||
      !formData.source ||
      !formData.discount
    ) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const discountNum = parseFloat(formData.discount);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      alert("Скидка должна быть числом от 0 до 100");
      return;
    }

    try {
      // Здесь будет запрос на сервер
      const response = await fetch("/api/promo-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          source: formData.source,
          discount: discountNum,
        }),
      });

      if (response.ok) {
        // Очистка формы после успешного создания
        setFormData({
          code: "",
          name: "",
          source: "",
          discount: "",
        });
        alert("Промокод успешно создан!");
        // Здесь можно обновить список промокодов
      } else {
        throw new Error("Ошибка при создании промокода");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось создать промокод");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-[70px] pt-2">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Активные промокоды</h2>
        <div className="grid gap-3">
          {promoCodes.map((promo) => (
            <div
              key={promo.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{promo.name}</h3>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      -{promo.discount}%
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="truncate">Источник: {promo.source}</span>
                    <span>Использований: <b className="text-white">{promo.usageCount}</b></span>
                  </div>
                  <div className="flex justify-end items-center w-full pt-5">
                    <button
                      onClick={() => handleCopy(promo.code, promo.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors font-mono text-sm font-medium"
                    >
                      {promo.code}
                      {copiedId === promo.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="discount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-1 block"
              >
                Скидка (%)
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="20"
                value={formData.discount}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Создать промокод
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
