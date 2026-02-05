import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shadcn/ui/card";
import { Button } from "../../../shadcn/ui/button";
import { Input } from "../../../shadcn/ui/input";
import { Label } from "../../../shadcn/ui/label";
import { Separator } from "../../../shadcn/ui/separator";
import { Textarea } from "../../../shadcn/ui/textarea";
import { TagsInputComponent } from "../../../shared/ui/TagsInputComponent";
import { useCreateProductStore } from "../../../../store";

export const Fields = () => {
  const {
    name,
    price,
    slug,
    shortDescription,
    description,
    tags,
    discountRules,
    submitAttempted,
    setField,
    addDiscountRule,
    updateDiscountRule,
    removeDiscountRule,
  } = useCreateProductStore();

  const canAddMoreDiscountRules = discountRules.length < 5;
  const discountRulesLegend = useMemo(() => {
    return discountRules.length === 0
      ? "No discounts added yet."
      : `${discountRules.length}/5 discounts`;
  }, [discountRules.length]);

  const requiredError = "This field is required.";
  const isEmpty = (v: string) => v.trim() === "";
  const isPriceInvalid = (v: string) =>
    isEmpty(v) || Number.isNaN(Number(v)) || Number(v) < 0;

  const showError = (invalid: boolean) => submitAttempted && invalid;

  return (
    <Card className="py-6">
      <CardHeader className="px-4">
        <CardTitle>Product details</CardTitle>
        <CardDescription>
          All fields marked with <span className="text-destructive">*</span> are
          required.
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
              value={name}
              onChange={(e) => setField("name", e.target.value)}
              required
              aria-invalid={showError(isEmpty(name))}
              aria-describedby={
                showError(isEmpty(name)) ? "product-name-error" : undefined
              }
            />
            {showError(isEmpty(name)) && (
              <p
                id="product-name-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {requiredError}
              </p>
            )}
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
              value={price}
              onChange={(e) => setField("price", e.target.value)}
              required
              aria-invalid={showError(isPriceInvalid(price))}
              aria-describedby={
                showError(isPriceInvalid(price))
                  ? "product-price-error"
                  : undefined
              }
            />
            {showError(isPriceInvalid(price)) && (
              <p
                id="product-price-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {requiredError}
              </p>
            )}
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="product-slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-slug"
              name="slug"
              placeholder="e.g. premium-hoodie"
              autoComplete="off"
              value={slug}
              onChange={(e) => setField("slug", e.target.value)}
              required
              aria-invalid={showError(isEmpty(slug))}
              aria-describedby={
                showError(isEmpty(slug)) ? "product-slug-error" : undefined
              }
            />
            {showError(isEmpty(slug)) && (
              <p
                id="product-slug-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {requiredError}
              </p>
            )}
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="product-short-description">
              Short description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="product-short-description"
              name="shortDescription"
              placeholder="A brief summary for listings and previews..."
              rows={2}
              value={shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              required
              aria-invalid={showError(isEmpty(shortDescription))}
              aria-describedby={
                showError(isEmpty(shortDescription))
                  ? "product-short-description-error"
                  : undefined
              }
            />
            {showError(isEmpty(shortDescription)) && (
              <p
                id="product-short-description-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {requiredError}
              </p>
            )}
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
              value={description}
              onChange={(e) => setField("description", e.target.value)}
              required
              aria-invalid={showError(isEmpty(description))}
              aria-describedby={
                showError(isEmpty(description))
                  ? "product-description-error"
                  : undefined
              }
            />
            {showError(isEmpty(description)) && (
              <p
                id="product-description-error"
                className="text-xs text-destructive"
                role="alert"
              >
                {requiredError}
              </p>
            )}
          </div>

          <div className="grid gap-2 md:col-span-2">
            <TagsInputComponent
              tags={tags}
              setTags={(value) => setField("tags", value)}
              label="Tags (optional)"
              placeholder="Add tag..."
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <div className="flex flex-col items-start justify-between gap-4">
            <div className="grid gap-1">
              <div className="text-sm font-medium">Discounts</div>
              <div className="text-xs text-muted-foreground">
                Add up to 5 discount rules: set the starting quantity and the
                discount amount.
              </div>
            </div>

            <div className="flex items-center gap-3 w-full justify-between">
              <div className="text-xs text-muted-foreground">
                {discountRulesLegend}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!canAddMoreDiscountRules}
                onClick={addDiscountRule}
              >
                Add discount
              </Button>
            </div>
          </div>

          {discountRules.length > 0 && (
            <div className="grid gap-3">
              {discountRules.map((rule, index) => {
                const fromId = `discount-from-${rule.id}`;
                const discountId = `discount-value-${rule.id}`;

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
                        value={rule.minQuantity}
                        onChange={(e) =>
                          updateDiscountRule(rule.id, {
                            minQuantity: Number(e.target.value),
                          })
                        }
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
                        onChange={(e) =>
                          updateDiscountRule(rule.id, {
                            discount: Number(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the discount value (for example, percent or
                        amount) according to your backend rules.
                      </p>
                    </div>

                    <div className="flex md:justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeDiscountRule(rule.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
