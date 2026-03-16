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
  categoryOptions?: string[];
}

const DEFAULT_CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Lighting'];

export function FilterBar({
  storeId,
  category,
  stores,
  onStoreChange,
  onCategoryChange,
  categoryOptions = DEFAULT_CATEGORIES,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <select
        className="border-gray-300 rounded-md shadow-sm p-2 bg-white border text-sm"
        value={storeId}
        onChange={(e) => onStoreChange(e.target.value)}
      >
        <option value="">All Stores</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
      <select
        className="border-gray-300 rounded-md shadow-sm p-2 bg-white border text-sm"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {categoryOptions.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
