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
}

const CATEGORY_OPTIONS = ['Electronics', 'Accessories', 'Furniture', 'Lighting'];

const inputClass = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2';

export function ProductForm({
  data,
  onChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  showStoreSelect = false,
  storeOptions = [],
}: ProductFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {showStoreSelect && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Store</label>
          <select
            className={inputClass}
            value={data.storeId || ''}
            onChange={(e) => onChange({ ...data, storeId: e.target.value })}
            required
          >
            <option value="">Select store</option>
            {storeOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className={inputClass}
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          className={inputClass}
          value={data.category}
          onChange={(e) => onChange({ ...data, category: e.target.value })}
          required
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className={inputClass}
          value={data.price || ''}
          onChange={(e) => onChange({ ...data, price: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
        <input
          type="number"
          min="0"
          className={inputClass}
          value={data.quantity ?? ''}
          onChange={(e) => onChange({ ...data, quantity: parseInt(e.target.value, 10) || 0 })}
          required
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
