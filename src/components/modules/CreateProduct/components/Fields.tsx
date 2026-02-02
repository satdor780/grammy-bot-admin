import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shadcn/ui/card"
import { Button } from "../../../shadcn/ui/button"
import { Input } from "../../../shadcn/ui/input"
import { Label } from "../../../shadcn/ui/label"
import { Separator } from "../../../shadcn/ui/separator"
import { Textarea } from "../../../shadcn/ui/textarea"

type DiscountRule = {
  id: string
  fromQuantity: string
  discount: string
}

export const Fields = () => {
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])

  const canAddMoreDiscountRules = discountRules.length < 5
  const discountRulesLegend = useMemo(() => {
    return discountRules.length === 0 ? "No discounts added yet." : `${discountRules.length}/5 discounts`
  }, [discountRules.length])

  return (
    <Card className="py-6">
      
      <CardHeader className="px-4">
        <CardTitle>Product details</CardTitle>
        <CardDescription>
          All fields marked with <span className="text-destructive">*</span> are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 px-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="product-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              name="name"
              placeholder="e.g. Premium Hoodie"
              autoComplete="off"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-price">
              Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-price"
              name="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="e.g. 49.99"
              required
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="product-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="product-description"
              name="description"
              placeholder="Write a short description of the product..."
              rows={5}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-available">
              Available (quantity) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-available"
              name="available"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              placeholder="e.g. 100"
              required
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <div className="flex flex-col items-start justify-between gap-4">
            <div className="grid gap-1">
              <div className="text-sm font-medium">Discounts</div>
              <div className="text-xs text-muted-foreground">
                Add up to 5 discount rules: set the starting quantity and the discount amount.
              </div>
            </div>

            <div className="flex items-center gap-3 w-full justify-between">
              <div className="text-xs text-muted-foreground">{discountRulesLegend}</div>
              <Button
                type="button"
                variant="outline"
                disabled={!canAddMoreDiscountRules}
                onClick={() => {
                  if (!canAddMoreDiscountRules) return
                  setDiscountRules((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                      fromQuantity: "",
                      discount: "",
                    },
                  ])
                }}
              >
                Add discount
              </Button>
            </div>
          </div>

          {discountRules.length > 0 && (
            <div className="grid gap-3">
              {discountRules.map((rule, index) => {
                const fromId = `discount-from-${rule.id}`
                const discountId = `discount-value-${rule.id}`

                return (
                  <div
                    key={rule.id}
                    className="grid gap-3 rounded-lg border border-border bg-card/50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor={fromId}>Starting quantity</Label>
                      <Input
                        id={fromId}
                        name={`discounts[${index}][fromQuantity]`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step="1"
                        placeholder="e.g. 10"
                        value={rule.fromQuantity}
                        onChange={(e) => {
                          const next = e.target.value
                          setDiscountRules((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, fromQuantity: next } : r))
                          )
                        }}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={discountId}>Discount</Label>
                      <Input
                        id={discountId}
                        name={`discounts[${index}][discount]`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        placeholder="e.g. 5"
                        value={rule.discount}
                        onChange={(e) => {
                          const next = e.target.value
                          setDiscountRules((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, discount: next } : r))
                          )
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the discount value (for example, percent or amount) according to your backend rules.
                      </p>
                    </div>

                    <div className="flex md:justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setDiscountRules((prev) => prev.filter((r) => r.id !== rule.id))
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}