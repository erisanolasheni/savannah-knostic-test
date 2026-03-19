import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export interface StoreFormData {
  name: string;
  location: string;
}

interface StoreFormProps {
  data: StoreFormData;
  onChange: (data: StoreFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function StoreForm({
  data,
  onChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
}: StoreFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
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
        <Label className="text-sm font-medium">Location</Label>
        <Input
          value={data.location}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
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
