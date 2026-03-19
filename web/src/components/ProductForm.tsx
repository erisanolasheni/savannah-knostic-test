import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  storeId?: string;
}

interface ProductFormProps {
  data: ProductFormData;
  onChange: (data: ProductFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showStoreSelect?: boolean;
  storeOptions?: { id: string; name: string }[];
  /** Categories for the dropdown; when empty, a fallback list is used so the form works before any products exist. */
  categoryOptions?: string[];
}

const PLACEHOLDER_STORE = "__placeholder__";
const PLACEHOLDER_CATEGORY = "__cat__";
const FALLBACK_CATEGORIES = ["Electronics", "Accessories", "Furniture", "Lighting"];

export function ProductForm({
  data,
  onChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  showStoreSelect = false,
  storeOptions = [],
  categoryOptions,
}: ProductFormProps) {
  const categories = (categoryOptions?.length ? categoryOptions : FALLBACK_CATEGORIES).slice().sort();
  const storeValue = data.storeId || PLACEHOLDER_STORE;
  const categoryValue = data.category || PLACEHOLDER_CATEGORY;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {showStoreSelect && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Store</Label>
          <Select
            value={storeValue}
            onValueChange={(v) =>
              onChange({
                ...data,
                storeId: v === PLACEHOLDER_STORE ? undefined : v,
              })
            }
            required
          >
            <SelectTrigger className="h-9" aria-label="Select store">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PLACEHOLDER_STORE} disabled>
                Select store
              </SelectItem>
              {storeOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Name</Label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="h-9 transition-colors focus-visible:ring-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Category</Label>
        <Select
          value={categoryValue}
          onValueChange={(v) =>
            onChange({ ...data, category: v === PLACEHOLDER_CATEGORY ? "" : v })
          }
          required
        >
          <SelectTrigger className="h-9" aria-label="Select category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PLACEHOLDER_CATEGORY} disabled>
              Select category
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Price ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={data.price || ""}
          onChange={(e) =>
            onChange({ ...data, price: parseFloat(e.target.value) || 0 })
          }
          className="h-9 transition-colors focus-visible:ring-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Stock quantity</Label>
        <Input
          type="number"
          min="0"
          value={data.quantity ?? ""}
          onChange={(e) =>
            onChange({
              ...data,
              quantity: parseInt(e.target.value, 10) || 0,
            })
          }
          className="h-9 transition-colors focus-visible:ring-2"
          required
        />
      </div>
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 w-full transition-colors"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
