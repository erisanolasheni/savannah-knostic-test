import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface StoreOption {
  id: string;
  name: string;
}

interface FilterBarProps {
  storeId: string;
  category: string;
  stores: StoreOption[];
  onStoreChange: (storeId: string) => void;
  onCategoryChange: (category: string) => void;
  categoryOptions: string[];
}

const ALL_VALUE = "__all__";

export function FilterBar({
  storeId,
  category,
  stores,
  onStoreChange,
  onCategoryChange,
  categoryOptions,
}: FilterBarProps) {
  const storeValue = storeId || ALL_VALUE;
  const categoryValue = category || ALL_VALUE;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <Select
        value={storeValue}
        onValueChange={(v) => onStoreChange(v === ALL_VALUE ? "" : v)}
      >
        <SelectTrigger className="h-9 w-[200px]" aria-label="Filter by store">
          <SelectValue placeholder="All Stores" />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
      </Select>
      <Select
        value={categoryValue}
        onValueChange={(v) => onCategoryChange(v === ALL_VALUE ? "" : v)}
      >
        <SelectTrigger className="h-9 w-[180px]" aria-label="Filter by category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Categories</SelectItem>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
