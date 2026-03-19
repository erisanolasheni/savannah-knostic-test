import { Input } from "./ui/input";
import { FormItem, FormLabel, FormControl } from "./ui/form";
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
      className="space-y-6"
    >
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            required
          />
        </FormControl>
      </FormItem>
      <FormItem>
        <FormLabel>Location</FormLabel>
        <FormControl>
          <Input
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            required
          />
        </FormControl>
      </FormItem>
      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
