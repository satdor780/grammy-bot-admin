import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shadcn/ui/card"
import { Input } from "../../../shadcn/ui/input"
import { Label } from "../../../shadcn/ui/label"
import { Separator } from "../../../shadcn/ui/separator"
import { Textarea } from "../../../shadcn/ui/textarea"

export const Fields = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product details</CardTitle>
        <CardDescription>
          All fields marked with <span className="text-destructive">*</span> are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
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
          <div className="grid gap-1">
            <div className="text-sm font-medium">Discount pricing</div>
            <div className="text-xs text-muted-foreground">
              Optional bulk pricing: if quantity is more than 10 or more than 50, apply a different
              unit price.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="product-price-gt10">Price when qty &gt; 10</Label>
              <Input
                id="product-price-gt10"
                name="price_gt_10"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                placeholder="e.g. 44.99"
              />
              <p className="text-xs text-muted-foreground">Applied for quantities 11–50.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-price-gt50">Price when qty &gt; 50</Label>
              <Input
                id="product-price-gt50"
                name="price_gt_50"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                placeholder="e.g. 39.99"
              />
              <p className="text-xs text-muted-foreground">Applied for quantities 51+.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}